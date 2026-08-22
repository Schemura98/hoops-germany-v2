// Messjob: Wiederkehr-Quote (WQ) — die Go/No-Go-Zahl der Testphase.
//
// Bindende Spezifikation: docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md (Ronja).
// Rechenkern (rein, ohne DB): lib/wiederkehrRate.mjs — dort stehen auch die
// Fundstellen-Kommentare je Regel. Wächter: tests/e2e/wiederkehr-rate.spec.mjs.
//
// Aufruf (Ampel-Lauf, §1.4):        node scripts/wiederkehr-rate.mjs --stichtag 2026-12-14
// Aufruf (Zwischenstand, §1.4 (2)): node scripts/wiederkehr-rate.mjs --stichtag 2026-11-30
//   Der Zwischenstand trägt PER DEFINITION keine Ampel und keine Empfehlung —
//   er dient der Job-Erprobung; die Ampel existiert nur am 14.12.
//
// ⚠️ DIESER JOB IST AUSSCHLIESSLICH LESEND. Er enthält keine einzige Schreib-
// operation (kein insert/update/delete, kein Model-Save) — nur find/aggregate.
// Ziel-DB kommt aus MONGODB_URI in .env; für den Dezember-Lauf gegen hoops_prod
// wird die URI beim Aufruf gesetzt, nichts im Code umgestellt.
//
// Test-Flags (NUR für die Wächter, im Echtbetrieb weglassen):
//   --praefix wqtest_   liest wqtest_players/wqtest_analyticsevents/... statt der
//                       echten Sammlungen (synthetische Kohorten in Wegwerf-Collections)
//   --jetzt <ISO>       simulierte Uhr; der Report kennzeichnet das unübersehbar.
//                       Alle Ehrlichkeitsschranken rechnen mit der simulierten Uhr
//                       weiter — das Flag umgeht keine Schranke, es verschiebt die Uhr.
//   --json              hängt einen maschinenlesbaren JSON-Block an (für die Wächter)
//
// Exit-Codes: 0 = Bericht erzeugt · 1 = Ehrlichkeitsschranke/Fehler (KEIN Messwert).

import { readFileSync } from "fs";
import mongoose from "mongoose";
import { NUR_ECHT, NUR_ECHTE_TEAMS } from "../lib/echteZahlen.mjs";
import { SPIELWOCHEN_NIERS_2026 } from "../lib/spielwochenNiers2026.mjs";
import {
  rechneWiederkehr,
  berlinMitternachtUtc,
  AMPEL_STICHTAG,
  ZWISCHENSTAND_STICHTAG,
  P2_START_ISO,
  MIN_N,
} from "../lib/wiederkehrRate.mjs";

function leseEnv(key) {
  try {
    const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
    }
  } catch {
    /* .env nicht lesbar → unten sauberer Abbruch */
  }
  return "";
}

function leseArg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
}

const stichtagIso = leseArg("stichtag") || AMPEL_STICHTAG;
const praefix = leseArg("praefix") || "";
const jetztArg = leseArg("jetzt");
const mitJson = process.argv.includes("--json");

if (!/^\d{4}-\d{2}-\d{2}$/.test(stichtagIso)) {
  console.error(`ABBRUCH: --stichtag muss YYYY-MM-DD sein, bekommen: ${stichtagIso}`);
  process.exit(1);
}
let jetztMs = Date.now();
if (jetztArg) {
  jetztMs = Date.parse(jetztArg);
  if (Number.isNaN(jetztMs)) {
    console.error(`ABBRUCH: --jetzt ist kein lesbarer Zeitpunkt: ${jetztArg}`);
    process.exit(1);
  }
}

const uri = process.env.MONGODB_URI || leseEnv("MONGODB_URI");
if (!uri) {
  console.error("ABBRUCH: MONGODB_URI fehlt (weder Umgebungsvariable noch .env).");
  process.exit(1);
}

const dbNameAusUri = (() => {
  try {
    const pfad = new URL(uri).pathname.replace(/^\//, "");
    return pfad.split("?")[0] || "(Default-DB der URI)";
  } catch {
    return "(nicht aus URI lesbar)";
  }
})();

let exitCode = 0;
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const coll = (name) => db.collection(praefix + name);

  const stichtagMs = berlinMitternachtUtc(stichtagIso).getTime();
  const p2StartMs = berlinMitternachtUtc(P2_START_ISO).getTime();

  // 1) Kohorte: NUR_ECHT importiert, nicht kopiert (§2.2 Punkt 1).
  const spieler = await coll("players")
    .find(
      { ...NUR_ECHT, createdAt: { $lte: new Date(stichtagMs) } },
      { projection: { createdAt: 1, isTeamAdmin: 1, teamAdminOf: 1, teamId: 1, signupSource: 1 } }
    )
    .toArray();

  // Ereignisse erst laden, wenn der Rechenkern überhaupt eine Chance hat —
  // die Schranken (Kalender, Messstrecke, leere Kohorte) prüft er selbst.
  const kohortenIds = spieler.map((s) => s._id);

  // 2) Ereignisse der Kohorte im Fenster (§2.2 Punkt 2: Join gegen gefilterte Kontenliste;
  //    own_stats_notified schließt der Rechenkern aus und dokumentiert warum).
  const events = kohortenIds.length
    ? await coll("analyticsevents")
        .find(
          {
            playerId: { $in: kohortenIds },
            createdAt: { $gte: new Date(p2StartMs), $lt: new Date(stichtagMs) },
          },
          { projection: { playerId: 1, eventType: 1, path: 1, createdAt: 1 } }
        )
        .toArray()
    : [];

  // 3) Spiele + echte Teams für M2/M3.
  const echteTeams = await coll("teams").find(NUR_ECHTE_TEAMS, { projection: { _id: 1 } }).toArray();
  const echteTeamIds = new Set(echteTeams.map((t) => String(t._id)));
  const matches = await coll("matches")
    .find(
      { date: { $gte: new Date(p2StartMs), $lt: new Date(stichtagMs) } },
      { projection: { date: 1, status: 1, resultStatus: 1, teamA: 1, teamB: 1, "teamAResult.submittedAt": 1, "teamBResult.submittedAt": 1 } }
    )
    .toArray();

  // 4) M5-Kette (own_stats_notified/_opened) — separat, weil notified aus der
  //    Aktivitätszählung ausgeschlossen ist, für die Kette aber gebraucht wird.
  const statsKette = kohortenIds.length
    ? await coll("analyticsevents")
        .find(
          {
            playerId: { $in: kohortenIds },
            eventType: { $in: ["own_stats_notified", "own_stats_opened"] },
            createdAt: { $gte: new Date(p2StartMs), $lt: new Date(stichtagMs) },
          },
          { projection: { playerId: 1, eventType: 1, createdAt: 1 } }
        )
        .toArray()
    : [];

  // 5) Anonym-Umfeld: Sitzungen ohne playerId im Fenster (nur Kontext, §1.2).
  const anonymAgg = await coll("analyticsevents")
    .aggregate([
      {
        $match: {
          $or: [{ playerId: null }, { playerId: { $exists: false } }],
          sessionId: { $type: "string" },
          createdAt: { $gte: new Date(p2StartMs), $lt: new Date(stichtagMs) },
        },
      },
      { $group: { _id: "$sessionId" } },
      { $count: "n" },
    ])
    .toArray();
  const anonymSitzungen = anonymAgg[0]?.n || 0;

  const ergebnis = rechneWiederkehr({
    spieler,
    events,
    matches,
    echteTeamIds,
    statsKette,
    anonymSitzungen,
    kalender: SPIELWOCHEN_NIERS_2026,
    stichtagIso,
    jetztMs,
  });

  // ------------------------------- Bericht -------------------------------
  const z = [];
  z.push("=====================================================================");
  z.push("WIEDERKEHR-QUOTE (WQ) — Messlauf nach docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md");
  z.push("=====================================================================");
  z.push(`Datenbank: ${dbNameAusUri}${praefix ? `  ⚠️ TEST-PRÄFIX "${praefix}" — synthetische Sammlungen, KEIN Echtlauf` : ""}`);
  z.push(`Stichtag: ${stichtagIso} (Daten bis Vortag 24:00 Europe/Berlin)`);
  if (jetztArg) z.push(`⚠️ SIMULIERTE UHR: --jetzt ${jetztArg} — kein Echtlauf-Zeitstempel`);
  if (stichtagIso === ZWISCHENSTAND_STICHTAG) {
    z.push("ZWISCHENSTAND (§1.4): trägt PER DEFINITION keine Ampel und keine Empfehlung.");
  }
  if (ergebnis.vorlaeufig) {
    z.push("⚠️ VORLÄUFIG: Der Stichtag liegt in der Zukunft — der Datenstand ist unvollständig, eine Ampel wird unterdrückt.");
  }
  z.push(`Wertungs-Spielwochen (${ergebnis.wertungswochen.length}): ${ergebnis.wertungswochen.join(", ")}`);
  z.push("");
  z.push("--- DIE ENTSCHEIDUNGSZAHL ---");
  const { x, y, prozent, ampel } = ergebnis.wq;
  if (prozent === null) {
    z.push(`WQ: ${x} von ${y} gewerteten Spielern kamen in ≥2 Spielwochen wieder.`);
    z.push(`KEINE Prozentzahl, KEINE Ampel: n = ${y} liegt unter der Mindestgröße ${MIN_N} (§4).`);
    z.push("Die Entscheidung tragen dann die vier qualitativen Signale aus §4 (Kader-Beweis,");
    z.push("Benachrichtigungs-Kette, dokumentierte Rückmeldungen, Admin-Freiwilligkeit).");
  } else {
    z.push(`WQ: ${x} von ${y} gewerteten Spielern (${prozent} %) kamen in ≥2 Spielwochen wieder.`);
    if (ampel) {
      z.push(`AMPEL: ${ampel}  (Grün ≥ 40 % · Gelb 20–39 % · Rot < 20 %; Setzungen, §3.1/§3.2)`);
    } else {
      z.push("Keine Ampel: Sie existiert nur am Stichtag 14.12.2026 mit vollständigem Datenstand (§1.4).");
    }
  }
  z.push("");
  z.push("--- VORBEDINGUNGS-AMPEL (M3, §3.4) — prüft die LESBARKEIT der WQ ---");
  const m3 = ergebnis.m3;
  if (m3.vorbedingung === "NICHT_MESSBAR") {
    z.push("Erfassungstreue nicht messbar: noch keine stattgefundenen Spiele echter Teams im Fenster.");
  } else {
    z.push(`Erfassungstreue: ${m3.binnen7Tagen} von ${m3.stattgefunden} Spielen echter Teams binnen 7 Tagen eingereicht (${m3.prozent} %).`);
    if (m3.ohneZeitpunkt > 0) {
      z.push(`  Dazu ${m3.ohneZeitpunkt} Spiel(e) mit Ergebnis, aber ohne Einreichzeitpunkt — zählen NICHT als "binnen 7 Tagen" (konservativ).`);
    }
    if (m3.vorbedingung === "GERISSEN") {
      z.push("⚠️ VORBEDINGUNG GERISSEN (< 50 %): Ein rotes oder gelbes WQ-Ergebnis ist NICHT als");
      z.push("Spieler-Desinteresse interpretierbar — es gab womöglich nichts zu sehen. Die");
      z.push("Ursachenkette beginnt beim Erfassungsweg der Admins (§3.4), nicht bei den Spielern.");
    } else {
      z.push("Vorbedingung erfüllt (≥ 50 %): die WQ ist als Spieler-Signal lesbar.");
    }
  }
  z.push("");
  z.push("--- BEGLEITWERTE (§1.5/§3.3) — sie ERKLÄREN die WQ, sie überstimmen sie NICHT ---");
  z.push(`M2 Spieltags-Folgequote: ${ergebnis.m2.binnen72hAktiv} von ${ergebnis.m2.mitTermin} gewerteten Spielern mit eigenem Spieltermin binnen 72 h aktiv.`);
  z.push(`M5 Benachrichtigungs-Kette: ${ergebnis.m5.binnen72hGeoeffnet} von ${ergebnis.m5.versendet} own_stats-Benachrichtigungen binnen 72 h geöffnet.`);
  z.push(`Kern-Aufrufe (H2-Diagnose): ${ergebnis.kernAufruf.mitKernAufruf} von ${ergebnis.kernAufruf.aktiveWochenPaare} aktiven Spielwochen enthielten einen Kern-Pfad-Aufruf.`);
  for (const p of ergebnis.kernAufruf.fuehrendePfade) z.push(`  Kern-Pfad ${p.pfad}: ${p.anzahl} Aufrufe`);
  z.push(`Bestand (vor 14.09.): ${ergebnis.bestand.wiedergekommen} von ${ergebnis.bestand.gewertet} wiedergekommen · Kampagne: ${ergebnis.kampagne.wiedergekommen} von ${ergebnis.kampagne.gewertet}.`);
  for (const q of ergebnis.jeQuelle) z.push(`  Kanal ${q.quelle}: ${q.wiedergekommen} von ${q.gewertet} (Anekdote, keine Quote — §5.2)`);
  z.push(`Zu jung für Wertung (Registrierung nach dem letzten wertbaren Sonntag): ${ergebnis.zuJung.length} Konto/Konten` +
    (ergebnis.zuJung.length ? ` — Rohaktivität: ${ergebnis.zuJung.map((k) => `${k.aktiveWochen} Wo.`).join(", ")}` : ""));
  z.push(`Admin-Gruppe (informativ, zählt NICHT in die WQ — Pflicht, kein Produktzug): ${ergebnis.adminGruppe.anzahl} Konten, davon ${ergebnis.adminGruppe.davonAktivIn2Wochen} in ≥2 Spielwochen aktiv.`);
  z.push(`Anonymes Umfeld: ${ergebnis.anonymSitzungen} Sitzungen ohne Konto im Fenster (nur Kontext, §1.2).`);
  if (ergebnis.kaderBeweis.length) {
    const top = ergebnis.kaderBeweis[0];
    z.push(`Kader-Beweis (§4 Signal 1): stärkstes Team hat ${top.wiedergekommen} wiedergekommene Nicht-Admin-Spieler` +
      (top.wiedergekommen >= 5 ? " — Schwelle ≥5 ERREICHT." : " (Schwelle: ≥5)."));
  }
  if (ergebnis.m4.length) {
    z.push("M4 Kohortenkurve (nur Anhang, Kleinst-Kohorten — §1.5):");
    for (const k of ergebnis.m4) {
      z.push(`  Reg-Woche ${k.regWoche} (n=${k.n}): ` + k.folgeWochen.map((f) => `SW${f.nr} ${f.aktiv}/${k.n}`).join(" · "));
    }
  }
  z.push("");
  z.push("Hinweise: Kohorte NUR_ECHT-gefiltert (lib/echteZahlen.mjs, importiert). Grenzen der");
  z.push("Aussagekraft: §5 der Definition (warm geworbene Kohorte, Seite mit Beispieldaten,");
  z.push("ausgeloggte Nutzung unsichtbar — die Zahl untertreibt eher, als dass sie übertreibt).");

  console.log(z.join("\n"));
  if (mitJson) {
    const { konten, ...ohneRohdaten } = ergebnis;
    console.log("\n===JSON===");
    console.log(JSON.stringify(ohneRohdaten));
  }
} catch (err) {
  console.error(err.message || String(err));
  exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
process.exit(exitCode);
