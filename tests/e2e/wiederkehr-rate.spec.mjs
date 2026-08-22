// Wächter für den Wiederkehr-Quote-Messjob (scripts/wiederkehr-rate.mjs).
//
// Spezifikation: docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md (Ronja, bindend).
// Die erste echte Messung ist im Dezember 2026 — dieser Wächter beweist den Job
// HEUTE mit synthetischen Kohorten und HANDGERECHNETEN Sollwerten (das Muster
// der 12 Randfälle aus dem Analytics-Gate vom 22.08.).
//
// Arbeitsweise: Alle Fixtures liegen in Wegwerf-Sammlungen mit Präfix "wqtest_"
// auf der Dev-DB (`hoopsgermany`). Der Messjob liest sie über sein Test-Flag
// --praefix; die echten Sammlungen (players/analyticsevents/...) werden von
// diesem Wächter WEDER beschrieben noch gelesen. beforeAll und afterAll räumen
// die Präfix-Sammlungen restlos (Drop), damit kein Lauf Spuren hinterlässt.
//
// ⚠️ Zeitstabilität: Jeder Skriptlauf fixiert die Uhr über --jetzt. Ohne das
// würde die Suite ab dem 05.10.2026 (reale Messstrecke beginnt) andere Zweige
// sehen — ein Test, dessen Ergebnis vom Kalendertag des Laufs abhängt, wäre
// genau die Zustandsabhängigkeit, die diese Suite zweimal teuer bezahlt hat.
//
// Handgerechnete Kohorte (Ampellauf, Stichtag 14.12., Uhr 14.12. 09:00):
//   Wertungswochen (7): 28.09 · 05.10 · 02.11 · 09.11 · 23.11 · 30.11 · 07.12
//   gewertet = 20 (S1–S8, S10–S12 + 9 Füller) · wiedergekommen = 6
//   (S1, S6, S7, S8, S11, S12) → WQ 6/20 = 30,0 % → GELB.
//   Jede Personalie steht als Kommentar am Fixture — die Sollwerte unten sind
//   daraus von Hand gerechnet, nicht aus einem Programmlauf abgeschrieben.

import { test, expect } from "@playwright/test";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  berlinMontagIso,
  berlinMitternachtUtc,
  pruefeKalender,
  rechneWiederkehr,
} from "../../lib/wiederkehrRate.mjs";

const execFileP = promisify(execFile);
const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PRAEFIX = "wqtest_";

function leseUri() {
  const txt = readFileSync(path.join(wurzel, ".env"), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith("MONGODB_URI=")) return t.slice("MONGODB_URI=".length).trim();
  }
  throw new Error("MONGODB_URI fehlt in .env — Wächter kann keine Fixtures anlegen.");
}

// Führt den Messjob aus und parst den JSON-Anhang. Wirft NICHT bei Exit ≠ 0 —
// die Abbruch-Fälle sind hier ausdrücklich Sollverhalten.
async function lauf(args) {
  try {
    const { stdout, stderr } = await execFileP(
      "node",
      ["scripts/wiederkehr-rate.mjs", "--praefix", PRAEFIX, ...args],
      { cwd: wurzel, timeout: 60000 }
    );
    const jsonTeil = stdout.split("===JSON===")[1];
    return { code: 0, stdout, stderr, json: jsonTeil ? JSON.parse(jsonTeil) : null };
  } catch (err) {
    return { code: err.code ?? 1, stdout: err.stdout || "", stderr: err.stderr || "", json: null };
  }
}

const oid = () => new mongoose.Types.ObjectId();

test.describe.serial("Wiederkehr-Quote: Messjob gegen synthetische Kohorten", () => {
  /** @type {import("mongoose").Connection} */
  let verbindung;
  const T1 = oid(); // echtes Team
  const T2 = oid(); // echtes Team
  const DT1 = oid(); // Demo-Team
  const ids = {}; // Spielername → ObjectId

  const alleSammlungen = ["players", "analyticsevents", "matches", "teams"].map((n) => PRAEFIX + n);

  async function raeumen() {
    for (const name of alleSammlungen) {
      await verbindung.db.dropCollection(name).catch(() => {});
    }
  }

  test.beforeAll(async () => {
    verbindung = await mongoose.createConnection(leseUri(), { serverSelectionTimeoutMS: 10000 }).asPromise();
    await raeumen();

    const spieler = [];
    const events = [];
    const regKampagne = new Date("2026-09-20T10:00:00Z"); // So 20.09. 12:00 Berlin → Reg-Woche 14.09.
    const person = (name, ueber = {}) => {
      ids[name] = oid();
      spieler.push({ _id: ids[name], createdAt: regKampagne, signupSource: "vereinsmail", ...ueber });
      return ids[name];
    };
    const ev = (name, isoUtc, ueber = {}) => {
      events.push({ playerId: ids[name], eventType: "pageview", path: "/", createdAt: new Date(isoUtc), ...ueber });
    };

    // S1 — Normalfall wiedergekommen: Wochen 28.09. und 02.11. (2 ≥ 2). Team T1 (für M2/Kader-Beweis).
    person("S1", { teamId: T1 });
    ev("S1", "2026-09-29T16:00:00Z", { path: "/ligen/kreis-niers" }); // Di 29.09. 18:00 Berlin, Kern-Pfad
    ev("S1", "2026-11-04T17:00:00Z"); // Mi 04.11. 18:00 Berlin
    // S2 — nur EINE Spielwoche → nicht wiedergekommen (Grenze „mindestens zwei").
    person("S2");
    ev("S2", "2026-09-29T16:00:00Z");
    // S3 — nie aktiv.
    person("S3");
    // S4 — Leerwochen-Test: Aktivität in Ferien-Leerwoche 19.10. zählt NICHT → nur 1 Spielwoche.
    person("S4");
    ev("S4", "2026-09-29T16:00:00Z");
    ev("S4", "2026-10-20T16:00:00Z"); // Di 20.10. — Woche 19.10. ist laut Kalender KEINE Spielwoche
    // S5 — own_stats_notified ist ein Server-Ereignis und zählt NICHT → nur 1 echte Woche.
    person("S5");
    ev("S5", "2026-09-29T16:00:00Z", { eventType: "own_stats_notified" });
    ev("S5", "2026-11-04T12:00:00Z", { eventType: "own_stats_notified" });
    ev("S5", "2026-11-24T17:00:00Z"); // Di 24.11. → Woche 23.11.
    // S6 — ZEITUMSTELLUNGS-Test: 2026-11-01T23:30Z = Mo 02.11. 00:30 Berlin (Winterzeit).
    // Ein UTC-Rechner ordnete das der Leerwoche 26.10. zu → S6 fiele auf 1 Woche.
    person("S6", { teamId: T1 });
    ev("S6", "2026-11-01T23:30:00Z");
    ev("S6", "2026-11-10T17:00:00Z", { path: "/match/spiel-9" }); // Di 10.11. → Woche 09.11., Kern-Pfad
    // S7 — SOMMERZEIT-Kante: 2026-09-27T22:30Z = Mo 28.09. 00:30 Berlin (UTC wäre noch So 27.09.).
    person("S7");
    ev("S7", "2026-09-27T22:30:00Z");
    ev("S7", "2026-12-08T17:00:00Z"); // Di 08.12. → Woche 07.12.
    // S8 — letzter wertbarer Registrierungstag: So 08.11. 21:00 Berlin → Reg-Woche 02.11.,
    // mögliche Wochen = 4 (09.11/23.11/30.11/07.12) → GEWERTET. Quelle flyer für die Kanal-Zeile.
    person("S8", { createdAt: new Date("2026-11-08T20:00:00Z"), signupSource: "flyer" });
    ev("S8", "2026-11-10T17:00:00Z");
    ev("S8", "2026-11-24T17:00:00Z");
    // S9 — einen Tag zu spät: Mo 09.11. → mögliche Wochen = 3 → ZU JUNG (trotz 2 aktiver Wochen).
    person("S9", { createdAt: new Date("2026-11-09T09:00:00Z") });
    ev("S9", "2026-11-24T17:00:00Z");
    ev("S9", "2026-12-01T17:00:00Z");
    // S10 — Registrierungswoche zählt nicht: Reg Mi 30.09. (Woche 28.09.), Aktivität in
    // derselben Woche ist Onboarding → nur die Woche 02.11. bleibt → 1 → nicht wiedergekommen.
    person("S10", { createdAt: new Date("2026-09-30T10:00:00Z") });
    ev("S10", "2026-10-01T16:00:00Z");
    ev("S10", "2026-11-03T17:00:00Z");
    // S11 — Bestandskonto (vor 14.09.): Reg-Woche wird auf 21.09. gesetzt, voll gewertet (§2.3).
    person("S11", { createdAt: new Date("2026-06-01T10:00:00Z"), signupSource: null });
    ev("S11", "2026-09-29T16:00:00Z");
    ev("S11", "2026-10-06T16:00:00Z"); // Di 06.10. → Woche 05.10.
    // S12 — Stichtagsgrenze: So 13.12. 23:59 Berlin zählt (Woche 07.12.), Mo 14.12. 00:00 Berlin
    // exakt und Di 15.12. zählen NICHT (8. Spielwoche = Nachlese, §1.4 Bindung 1).
    person("S12");
    ev("S12", "2026-12-01T17:00:00Z"); // Di 01.12. → Woche 30.11.
    ev("S12", "2026-12-13T22:59:00Z"); // So 13.12. 23:59 Berlin → Woche 07.12.
    ev("S12", "2026-12-13T23:00:00Z"); // Mo 14.12. 00:00 Berlin EXAKT → ausgeschlossen
    ev("S12", "2026-12-15T17:00:00Z"); // Di 15.12. → Woche 14.12. → ausgeschlossen
    // A1 — Team-Admin (isTeamAdmin): zählt NIE in die WQ, egal wie aktiv (3 Spielwochen).
    person("A1", { isTeamAdmin: true, teamAdminOf: T1, teamId: T1 });
    ev("A1", "2026-09-29T16:00:00Z");
    ev("A1", "2026-11-04T17:00:00Z");
    ev("A1", "2026-11-24T17:00:00Z");
    // A2 — CO-Admin: trägt NUR teamAdminOf (set-member-admin/route.js:11), isTeamAdmin fehlt.
    // Der Ausschluss muss über dieses eine Feld greifen (Auftrag/§1.2 Randfall).
    person("A2", { teamAdminOf: T2, teamId: T2 });
    ev("A2", "2026-09-29T16:00:00Z");
    ev("A2", "2026-11-04T17:00:00Z");
    // D1/I1 — Demo- und internes Konto: fliegen am NUR_ECHT-Filter, trotz Aktivität.
    person("D1", { isDemo: true });
    ev("D1", "2026-09-29T16:00:00Z");
    ev("D1", "2026-11-04T17:00:00Z");
    person("I1", { isInternal: true });
    ev("I1", "2026-09-29T16:00:00Z");
    ev("I1", "2026-11-04T17:00:00Z");
    // F1–F9 — Füller ohne Aktivität, damit die Kohorte exakt n = 20 gewertete erreicht.
    for (let i = 1; i <= 9; i++) person(`F${i}`);
    // Ausgeloggtes Ereignis: sessionId ohne playerId — zählt für niemanden, nur Anonym-Umfeld.
    events.push({ sessionId: "anon-sitzung-1", eventType: "pageview", path: "/", createdAt: new Date("2026-09-29T16:00:00Z") });
    // M5-Kette: S1 bekommt eine own_stats-Benachrichtigung und öffnet binnen 72 h.
    ev("S1", "2026-11-04T12:00:00Z", { eventType: "own_stats_notified" });
    ev("S1", "2026-11-04T18:00:00Z", { eventType: "own_stats_opened", path: "/match/spiel-7" });

    await verbindung.db.collection(PRAEFIX + "players").insertMany(spieler);
    await verbindung.db.collection(PRAEFIX + "analyticsevents").insertMany(events);
    await verbindung.db.collection(PRAEFIX + "teams").insertMany([
      { _id: T1, teamName: "WQ Echt A" },
      { _id: T2, teamName: "WQ Echt B" },
      { _id: DT1, teamName: "WQ Demo", isDemo: true },
    ]);
    // M3-Fixtures, handgerechnet: 3 stattgefundene Spiele echter Teams, davon 1 binnen
    // 7 Tagen eingereicht (33,3 % < 50 % → Vorbedingung GERISSEN), 1 ohne Zeitpunkt.
    // Das Demo-Spiel zählt gar nicht.
    await verbindung.db.collection(PRAEFIX + "matches").insertMany([
      { teamA: T1, teamB: T2, date: new Date("2026-10-03T14:00:00Z"), status: "completed", resultStatus: "confirmed", teamAResult: { submittedAt: new Date("2026-10-04T10:00:00Z") } },
      { teamA: T1, teamB: T2, date: new Date("2026-11-08T13:00:00Z"), status: "completed", resultStatus: "confirmed" }, // Ergebnis ohne Einreichzeitpunkt
      { teamA: T1, teamB: T2, date: new Date("2026-11-15T13:00:00Z"), status: "completed", resultStatus: "confirmed", teamAResult: { submittedAt: new Date("2026-11-30T10:00:00Z") } }, // > 7 Tage
      { teamA: DT1, teamB: DT1, date: new Date("2026-10-03T14:00:00Z"), status: "completed", resultStatus: "confirmed", teamAResult: { submittedAt: new Date("2026-10-03T18:00:00Z") } }, // Demo → zählt nicht
    ]);
  });

  test.afterAll(async () => {
    if (!verbindung) return;
    await raeumen();
    // Beleg statt Behauptung: keine wqtest_-Sammlung überlebt diesen Wächter.
    const reste = (await verbindung.db.listCollections().toArray()).map((c) => c.name).filter((n) => n.startsWith(PRAEFIX));
    await verbindung.close();
    if (reste.length) throw new Error(`Aufräumen unvollständig — übrig: ${reste.join(", ")}`);
  });

  // ------------------------------------------------------------------
  // Pure Ebene (ohne Datenbank): Zeitrechnung und Kalender-Schranken.
  // ------------------------------------------------------------------

  test("Zeitrechnung: Berlin-Wochen, nicht UTC — inklusive Zeitumstellung 25.10.", () => {
    // Winterzeit: So 01.11. 23:30 UTC ist bereits Mo 02.11. 00:30 in Berlin.
    expect(berlinMontagIso(new Date("2026-11-01T23:30:00Z"))).toBe("2026-11-02");
    // Sommerzeit: So 27.09. 22:30 UTC ist bereits Mo 28.09. 00:30 in Berlin.
    expect(berlinMontagIso(new Date("2026-09-27T22:30:00Z"))).toBe("2026-09-28");
    // Mitten in der Woche, unstrittig.
    expect(berlinMontagIso(new Date("2026-11-24T17:00:00Z"))).toBe("2026-11-23");
    // Wochengrenzen als UTC-Instanzen: Sommer +2, Winter +1.
    expect(berlinMitternachtUtc("2026-09-14").toISOString()).toBe("2026-09-13T22:00:00.000Z");
    expect(berlinMitternachtUtc("2026-12-14").toISOString()).toBe("2026-12-13T23:00:00.000Z");
  });

  test("Ehrlichkeitsschranke: unplausibler Kalender bricht ab statt zu rechnen", () => {
    expect(() => pruefeKalender([])).toThrow(/Kalender/);
    expect(() => pruefeKalender(null)).toThrow(/Kalender/);
    // 2026-09-29 ist ein Dienstag — ein Kalender mit Nicht-Montagen ist verdreht.
    expect(() => pruefeKalender([{ montag: "2026-09-29", spielwoche: true }])).toThrow(/kein Montag/);
    // Unsortierte Liste = Bearbeitungsfehler, keine Messgrundlage.
    expect(() =>
      pruefeKalender([
        { montag: "2026-10-05", spielwoche: true },
        { montag: "2026-09-28", spielwoche: true },
      ])
    ).toThrow(/aufsteigend/);
    // Kalender ganz ohne Spielwoche: es gäbe keinen Nenner.
    expect(() => pruefeKalender([{ montag: "2026-09-28", spielwoche: false }])).toThrow(/keine einzige Spielwoche/);
  });

  test("Ehrlichkeitsschranke: leere Kohorte wirft, statt 0 % zu melden (pure Ebene)", () => {
    const kalender = [{ montag: "2026-09-28", spielwoche: true }];
    expect(() =>
      rechneWiederkehr({
        spieler: [],
        events: [],
        kalender,
        stichtagIso: "2026-12-14",
        jetztMs: Date.parse("2026-12-14T08:00:00Z"),
      })
    ).toThrow(/Kohorte ist leer/);
  });

  // ------------------------------------------------------------------
  // End-to-End: der echte Messjob gegen die Wegwerf-Sammlungen.
  // ------------------------------------------------------------------

  test("Ampellauf 14.12.: WQ 6 von 20 (30,0 %) → GELB — jede Personalie handgerechnet", async () => {
    const r = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-12-14T09:00:00+01:00", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json).not.toBeNull();

    // Das Wertungsfenster sind exakt die 7 Spielwochen aus §2.4 — die drei
    // Leerwochen und die 8. Spielwoche (14.12., Nachlese) sind NICHT darin.
    expect(r.json.wertungswochen).toEqual([
      "2026-09-28", "2026-10-05", "2026-11-02", "2026-11-09", "2026-11-23", "2026-11-30", "2026-12-07",
    ]);

    // Die Entscheidungszahl: 6 von 20 → 30,0 % → GELB (handgerechnet, s. Kopfkommentar).
    expect(r.json.wq).toEqual({ x: 6, y: 20, prozent: 30, ampel: "GELB" });
    expect(r.stdout).toContain("6 von 20 gewerteten Spielern");
    expect(r.stdout).toContain("AMPEL: GELB");

    // S9 ist das EINE zu junge Konto (Reg 09.11. → nur 3 mögliche Wochen), mit Rohaktivität 2.
    expect(r.json.zuJung).toHaveLength(1);
    expect(r.json.zuJung[0]).toMatchObject({ regWoche: "2026-11-09", moeglicheWochen: 3, aktiveWochen: 2 });

    // Admin-Gruppe: A1 (isTeamAdmin) UND A2 (nur teamAdminOf — Co-Admin) sind draußen.
    expect(r.json.adminGruppe).toEqual({ anzahl: 2, davonAktivIn2Wochen: 2 });

    // Bestand vs. Kampagne: S11 ist das einzige Bestandskonto, und es kam wieder.
    expect(r.json.bestand).toEqual({ gewertet: 1, wiedergekommen: 1 });
    expect(r.json.kampagne).toEqual({ gewertet: 19, wiedergekommen: 5 });

    // Vorbedingungs-Ampel M3: 1 von 3 binnen 7 Tagen (33,3 %) → GERISSEN, Demo-Spiel zählt nicht,
    // das Ergebnis ohne Einreichzeitpunkt wird separat ausgewiesen.
    expect(r.json.m3).toMatchObject({ stattgefunden: 3, binnen7Tagen: 1, ohneZeitpunkt: 1, prozent: 33.3, vorbedingung: "GERISSEN" });
    expect(r.stdout).toContain("VORBEDINGUNG GERISSEN");
    expect(r.stdout).toContain("NICHT als");

    // Begleitwerte, jeweils handgerechnet:
    // M2: S1 und S6 sind gewertete Spieler mit eigenem Spieltermin (T1); nur S6 hat
    // ein Ereignis binnen 72 h nach einem Termin (10.11. nach dem Spiel am 08.11.).
    expect(r.json.m2).toEqual({ mitTermin: 2, binnen72hAktiv: 1 });
    // M5: 3 versendete own_stats-Benachrichtigungen (S1×1 + S5×2), 1 binnen 72 h geöffnet (S1).
    expect(r.json.m5).toEqual({ versendet: 3, binnen72hGeoeffnet: 1 });
    // Kern-Aufrufe: 16 aktive Spielwochen-Paare gewerteter Spieler, 3 mit Kern-Pfad:
    // S1 /ligen/ in Woche 28.09., S1 /match/ in Woche 02.11. (das own_stats_opened —
    // Öffnen IST eine Nutzerhandlung, nur own_stats_notified ist ausgeschlossen),
    // S6 /match/ in Woche 09.11. ⚠️ Meine erste Handrechnung sagte 2 und hatte das
    // opened-Ereignis übersehen — der Sollwert wurde nachgerechnet korrigiert,
    // nicht vom Programmlauf abgeschrieben.
    expect(r.json.kernAufruf.aktiveWochenPaare).toBe(16);
    expect(r.json.kernAufruf.mitKernAufruf).toBe(3);
    // Ausgeloggte Sitzung (sessionId ohne playerId): zählt für keinen Spieler,
    // erscheint nur im Anonym-Umfeld.
    expect(r.json.anonymSitzungen).toBe(1);
    // Kader-Beweis: T1 hat 2 wiedergekommene Nicht-Admins (S1, S6) — unter der 5er-Schwelle.
    expect(r.json.kaderBeweis[0]).toMatchObject({ wiedergekommen: 2 });
    // Beschriftung: Begleitwerte erklären, überstimmen nicht.
    expect(r.stdout).toContain("überstimmen sie NICHT");
  });

  test("Zwischenstand 30.11.: 5 Wertungswochen, KEINE Ampel, S8/S9 zu jung — 3 von 19", async () => {
    const r = await lauf(["--stichtag", "2026-11-30", "--jetzt", "2026-11-30T09:00:00+01:00", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.wertungswochen).toEqual(["2026-09-28", "2026-10-05", "2026-11-02", "2026-11-09", "2026-11-23"]);
    // Handgerechnet: wiedergekommen sind nur S1, S6, S11 (S7s zweite Woche und S12s
    // Wochen liegen NACH dem Zwischenstand); S8 hat jetzt nur 2 mögliche Wochen → zu
    // jung, S9 nur 1 → zu jung. Gewertet: 20 − S8 + … = 19.
    expect(r.json.wq).toEqual({ x: 3, y: 19, prozent: null, ampel: null });
    expect(r.json.zuJung).toHaveLength(2);
    expect(r.stdout).toContain("ZWISCHENSTAND");
    expect(r.stdout).not.toContain("AMPEL:");
    // n = 19 < 20: keine Prozentzahl im Text.
    expect(r.stdout).toContain("KEINE Prozentzahl");
    expect(r.stdout).not.toMatch(/\d+(,|\.)\d+ %\) kamen/);
  });

  test("Mindest-n-Grenze: n = 19 → nur absolute Zahlen, n = 20 → Prozent und Ampel", async () => {
    // Einen Füller entfernen: exakt 19 gewertete.
    await verbindung.db.collection(PRAEFIX + "players").deleteOne({ _id: ids.F9 });
    const r19 = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-12-14T09:00:00+01:00", "--json"]);
    expect(r19.code).toBe(0);
    expect(r19.json.wq).toEqual({ x: 6, y: 19, prozent: null, ampel: null });
    expect(r19.stdout).toContain("6 von 19 gewerteten Spielern");
    expect(r19.stdout).toContain("KEINE Prozentzahl");
    expect(r19.stdout).not.toContain("AMPEL:");
    // Füller zurück: die 20er-Grenze ist wieder erreicht, Ampel kehrt zurück.
    await verbindung.db.collection(PRAEFIX + "players").insertOne({ _id: ids.F9, createdAt: new Date("2026-09-20T10:00:00Z"), signupSource: "vereinsmail" });
    const r20 = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-12-14T09:00:00+01:00", "--json"]);
    expect(r20.json.wq).toEqual({ x: 6, y: 20, prozent: 30, ampel: "GELB" });
  });

  test("Stichtags-Bindung: Ampel existiert NUR am 14.12., auch bei n = 20", async () => {
    // §1.4 Bindung (1): Wer den Datenstand nach Wunschergebnis wählt, wählt das
    // Ergebnis. Ein Lauf mit Stichtag 07.12. und n = 20 bekommt Prozent, aber
    // KEINE Ampel — sonst könnte man den Stichtag verschieben, bis die Farbe passt.
    // Zusätzlicher Füller F10, damit dieser Lauf wirklich n = 20 erreicht (S8 ist
    // bei Stichtag 07.12. zu jung: nur noch 3 mögliche Wochen).
    const f10 = oid();
    await verbindung.db.collection(PRAEFIX + "players").insertOne({ _id: f10, createdAt: new Date("2026-09-20T10:00:00Z"), signupSource: "vereinsmail" });
    const r = await lauf(["--stichtag", "2026-12-07", "--jetzt", "2026-12-14T09:00:00+01:00", "--json"]);
    await verbindung.db.collection(PRAEFIX + "players").deleteOne({ _id: f10 });
    expect(r.code).toBe(0);
    // Handgerechnet: 6 Wertungswochen (bis 30.11.); wiedergekommen nur S1, S6, S11
    // (S7s und S12s zweite Woche liegen erst in der Woche 07.12.) → 3 von 20 = 15 %.
    expect(r.json.wq.x).toBe(3);
    expect(r.json.wq.y).toBe(20);
    expect(r.json.wq.prozent).toBe(15);
    expect(r.json.wq.ampel).toBeNull();
    expect(r.stdout).toContain("existiert nur am Stichtag 14.12.2026");
    expect(r.stdout).not.toContain("AMPEL:");
  });

  test("Ehrlichkeitsschranke: Messstrecke nicht begonnen → Abbruch statt Phantom-Quote", async () => {
    // Uhr auf heute (23.08.2026): Die erste Spielwoche ist nicht abgeschlossen —
    // exakt der Zustand eines versehentlichen Vorab-Laufs gegen die echte DB.
    const r = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-08-23T12:00:00+02:00"]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain("Messstrecke noch nicht begonnen");
    expect(r.stdout).not.toContain("WQ:");
  });

  test("Vorläufiger Lauf (Uhr vor Stichtag): Ampel unterdrückt, deutlich gekennzeichnet", async () => {
    // Uhr 08.12.: Messstrecke läuft, aber der Stichtag 14.12. ist noch nicht erreicht —
    // die letzten Wertungswochen wären datenleer. Quote ja, Ampel nein.
    const r = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-12-08T09:00:00+01:00", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.vorlaeufig).toBe(true);
    expect(r.json.wq.ampel).toBeNull();
    expect(r.stdout).toContain("VORLÄUFIG");
    expect(r.stdout).not.toContain("AMPEL:");
  });

  test("Ehrlichkeitsschranke: leere Kohorte → Abbruch mit Fehlermeldung, kein 0-%-Wert", async () => {
    // Muss der LETZTE Datenbank-Fall sein: er leert die Spieler-Sammlung.
    await verbindung.db.collection(PRAEFIX + "players").deleteMany({});
    const r = await lauf(["--stichtag", "2026-12-14", "--jetzt", "2026-12-14T09:00:00+01:00"]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain("Kohorte ist leer");
    expect(r.stdout).not.toContain("0 %");
    expect(r.stdout).not.toContain("WQ:");
  });
});
