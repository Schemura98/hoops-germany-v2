// Rechenkern der Wiederkehr-Quote (WQ) — die Go/No-Go-Zahl der Testphase.
//
// Bindende Spezifikation: docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md (Ronja, 23.08.2026).
// Diese Datei ist BEWUSST eine reine Rechenschicht ohne Datenbankzugriff: Der Messjob
// (scripts/wiederkehr-rate.mjs) liest, dieser Kern rechnet. So sind alle Zusicherungen
// mit synthetischen Kohorten prüfbar, BEVOR echte Daten existieren — die erste echte
// Messung ist erst im Dezember 2026, der Job muss heute beweisbar richtig sein.
//
// ⚠️ Zeitrechnung: ALLE Wochengrenzen laufen in Europe/Berlin, nie in UTC (§2.3).
// Die Zeitumstellung am 25.10.2026 verschiebt die UTC-Instanzen der Wochengrenzen um
// eine Stunde — ein UTC-Rechner ordnet z. B. ein Ereignis von Mo 02.11. 00:30 Berlin
// (= So 01.11. 23:30 UTC) der VORWOCHE zu. Der Wächter (tests/e2e/wiederkehr-rate.spec.mjs)
// hat genau diesen Fall mit handgerechnetem Sollwert.
//
// ⚠️ Ein interner Widerspruch der Spezifikation, hier entschieden und gemeldet:
// §2.5 Schritt 0 sagt „die ersten 7 EINTRÄGE aus lib/spielwochenNiers2026.mjs" — die
// ersten 7 Array-Einträge enthalten aber drei Leerwochen und endeten am 23.11.
// Bindend ist §2.4: „Wertungsfenster der Kernmetrik: die ersten 7 SPIELWOCHEN
// (28.09. bis einschließlich Woche 07.12.)". Umgesetzt ist deshalb: Wertungswochen =
// alle Kalenderwochen mit spielwoche:true, deren Montag VOR dem Stichtag liegt —
// beim Ampel-Stichtag 14.12. sind das genau die 7 Spielwochen aus §2.4, beim
// Zwischenstand 30.11. genau die 5 aus §1.4 (2).

const TZ = "Europe/Berlin";

const berlinFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function berlinTeile(ms) {
  const p = Object.fromEntries(berlinFmt.formatToParts(ms).map((t) => [t.type, t.value]));
  return {
    j: +p.year,
    m: +p.month,
    t: +p.day,
    // Manche ICU-Versionen liefern Mitternacht als "24" — normalisieren.
    h: p.hour === "24" ? 0 : +p.hour,
    min: +p.minute,
    s: +p.second,
  };
}

// Minuten, die Berlin zum gegebenen Zeitpunkt vor UTC liegt (Sommer 120, Winter 60).
function berlinOffsetMin(ms) {
  const z = berlinTeile(ms);
  return (Date.UTC(z.j, z.m - 1, z.t, z.h, z.min, z.s) - ms) / 60000;
}

// UTC-Zeitpunkt von 00:00 Berlin des gegebenen ISO-Datums ("YYYY-MM-DD").
// Zwei Korrektur-Durchläufe, weil der Offset an der Zeitumstellung selbst vom
// Ergebnis abhängt — für alle Daten dieses Kalenders konvergiert das exakt.
export function berlinMitternachtUtc(isoDatum) {
  const utcMitternacht = Date.parse(isoDatum + "T00:00:00Z");
  if (Number.isNaN(utcMitternacht)) throw new Error(`Ungültiges Datum: ${isoDatum}`);
  let t = utcMitternacht - berlinOffsetMin(utcMitternacht) * 60000;
  t = utcMitternacht - berlinOffsetMin(t) * 60000;
  return new Date(t);
}

// ISO-Datum des Montags der Berlin-Woche (Mo–So), in der der Zeitpunkt liegt.
export function berlinMontagIso(zeitpunkt) {
  const ms = zeitpunkt instanceof Date ? zeitpunkt.getTime() : zeitpunkt;
  const z = berlinTeile(ms);
  const utcTag = Date.UTC(z.j, z.m - 1, z.t);
  const wochentag = new Date(utcTag).getUTCDay(); // 0 = Sonntag
  const zurueck = (wochentag + 6) % 7;
  return new Date(utcTag - zurueck * 86400000).toISOString().slice(0, 10);
}

function isoPlusTage(iso, tage) {
  return new Date(Date.parse(iso + "T00:00:00Z") + tage * 86400000).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Konstanten aus der Definition — jede mit Fundstelle.
// ---------------------------------------------------------------------------

export const P2_START_ISO = "2026-09-14"; // Beginn Phase 2 (§2.5 Schritt 3)
export const BESTAND_REG_WOCHE = "2026-09-21"; // §2.3: Bestandskonten = Woche vor der 1. Spielwoche
export const AMPEL_STICHTAG = "2026-12-14"; // §1.4 — der EINZIGE Stichtag, an dem eine Ampel existiert
export const ZWISCHENSTAND_STICHTAG = "2026-11-30"; // §1.4 (2) — Zwischenstand OHNE Ampel
export const MIN_N = 20; // §4: darunter keine Prozentzahl
export const MIN_MOEGLICHE_WOCHEN = 4; // §1.4 (c)
export const MIN_AKTIVE_WOCHEN = 2; // §1.4: „in mindestens ZWEI verschiedenen Spielwochen"
export const AUSGESCHLOSSENER_EVENTTYP = "own_stats_notified"; // §1.3: Server-Ereignis, keine Nutzerhandlung
export const KERN_PFADE = ["/match/", "/ligen/", "/topscorer", "/spiele", "/player/newsfeed", "/player/player-detail"]; // §1.3

// §3.1 — gilt NUR bei n ≥ 20 und NUR am Ampel-Stichtag.
export function ampelFuerQuote(prozent) {
  if (prozent >= 40) return "GRUEN";
  if (prozent >= 20) return "GELB";
  return "ROT";
}

// ---------------------------------------------------------------------------
// Ehrlichkeitsschranke 1: Kalender-Plausibilität (§2.5 „Ehrlichkeitsschranken").
// Wirft statt still weiterzurechnen — Abwesenheit von Messgrundlage darf nicht
// wie ein Messwert aussehen.
// ---------------------------------------------------------------------------
export function pruefeKalender(kalender) {
  if (!Array.isArray(kalender) || kalender.length === 0) {
    throw new Error("ABBRUCH: Spielwochen-Kalender fehlt oder ist leer — ohne Kalender gibt es keinen Nenner, keine Quote (Definition §2.4/§2.5).");
  }
  let vorher = null;
  for (const w of kalender) {
    if (!w || typeof w.montag !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(w.montag)) {
      throw new Error(`ABBRUCH: Kalender unplausibel — Eintrag ohne gültiges montag-Datum: ${JSON.stringify(w)}`);
    }
    const d = new Date(w.montag + "T00:00:00Z");
    if (Number.isNaN(d.getTime()) || d.getUTCDay() !== 1) {
      throw new Error(`ABBRUCH: Kalender unplausibel — ${w.montag} ist kein Montag.`);
    }
    if (typeof w.spielwoche !== "boolean") {
      throw new Error(`ABBRUCH: Kalender unplausibel — Eintrag ${w.montag} ohne spielwoche-Kennzeichen.`);
    }
    if (vorher !== null && !(w.montag > vorher)) {
      throw new Error(`ABBRUCH: Kalender unplausibel — Montage nicht streng aufsteigend (${vorher} → ${w.montag}).`);
    }
    vorher = w.montag;
  }
  if (!kalender.some((w) => w.spielwoche)) {
    throw new Error("ABBRUCH: Kalender unplausibel — keine einzige Spielwoche markiert.");
  }
}

// ---------------------------------------------------------------------------
// Der Rechenkern. Erwartet BEREITS echtheitsgefilterte Eingaben (NUR_ECHT liegt
// in der Datenbankabfrage des Messjobs, §2.2) — rechnet aber defensiv:
// Ereignisse ohne playerId und own_stats_notified werden hier NOCHMALS verworfen.
//
// Eingaben:
//   spieler   [{ _id, createdAt, isTeamAdmin, teamAdminOf, teamId, signupSource }]
//   events    [{ playerId, eventType, path, createdAt }]  (nur Kohorten-Events)
//   matches   [{ date, status, teamA, teamB, teamAResult, teamBResult, resultStatus }]
//   echteTeamIds  Set von Team-Id-Strings (NUR_ECHTE_TEAMS)
//   statsKette    [{ playerId, eventType, createdAt }] own_stats_notified/_opened für M5
//   anonymSitzungen  Zahl (distinct sessionIds ohne playerId im Fenster) — nur Kontext
//   stichtagIso   "YYYY-MM-DD" (Montag 00:00 Berlin; Daten bis Vortag 24:00)
//   jetztMs       Uhr des Laufs (für Vorläufigkeits- und Messstrecken-Schranke)
// ---------------------------------------------------------------------------
export function rechneWiederkehr({
  spieler,
  events,
  matches = [],
  echteTeamIds = new Set(),
  statsKette = [],
  anonymSitzungen = 0,
  kalender,
  stichtagIso,
  jetztMs,
}) {
  pruefeKalender(kalender);
  const stichtagMs = berlinMitternachtUtc(stichtagIso).getTime();
  const p2StartMs = berlinMitternachtUtc(P2_START_ISO).getTime();
  const jetzt = typeof jetztMs === "number" ? jetztMs : Date.now();

  // Wertungswochen: Spielwochen, deren Montag VOR dem Stichtag liegt (s. Kopfkommentar).
  const wertungswochen = kalender.filter((w) => w.spielwoche && w.montag < stichtagIso).map((w) => w.montag);
  if (wertungswochen.length === 0) {
    throw new Error(`ABBRUCH: Vor dem Stichtag ${stichtagIso} liegt keine einzige Spielwoche — es gibt nichts zu messen.`);
  }

  // Ehrlichkeitsschranke 2: Messstrecke muss begonnen haben. Die erste Spielwoche
  // muss zum Datenstand (min aus Uhr und Stichtag) abgeschlossen sein — sonst wäre
  // jede Quote eine Phantom-Zahl über einen Zeitraum, der noch gar nicht stattfand.
  const endeErsteWocheMs = berlinMitternachtUtc(isoPlusTage(wertungswochen[0], 7)).getTime();
  const datenstandMs = Math.min(jetzt, stichtagMs);
  if (datenstandMs < endeErsteWocheMs) {
    throw new Error(
      `ABBRUCH: Messstrecke noch nicht begonnen — die erste Spielwoche (Mo ${wertungswochen[0]}) ist zum Datenstand ` +
        `noch nicht abgeschlossen. Es gibt keine Wiederkehr-Quote, auch keine 0 % (Definition §2.5, Ehrlichkeitsschranken).`
    );
  }

  // Ehrlichkeitsschranke 3: leere Kohorte → Abbruch statt „0 %".
  if (!Array.isArray(spieler) || spieler.length === 0) {
    throw new Error("ABBRUCH: Die Echt-Kohorte ist leer (0 Konten nach NUR_ECHT-Filter) — es gibt keine Quote, auch keine 0 % (Definition §2.5).");
  }

  // Ampel existiert nur am definierten Stichtag UND wenn der Datenstand vollständig
  // ist (Uhr ≥ Stichtag). Ein Lauf mit Zukunfts-Stichtag ist vorläufig — er trägt
  // keine Ampel, sonst färbte ein halbleeres Fenster die Entscheidung.
  const istAmpelLauf = stichtagIso === AMPEL_STICHTAG && jetzt >= stichtagMs;
  const vorlaeufig = jetzt < stichtagMs;

  // Defensiv-Filter der Ereignisse (Belege im Wächter):
  //  - ohne playerId (ausgeloggte Sitzung) → zählt für niemanden (§1.2 Anonyme)
  //  - own_stats_notified → Server-Ereignis, keine Handlung (§1.3)
  //  - außerhalb [P2-Start, Stichtag) → außerhalb des Messfensters (§2.5 Schritt 3)
  const nutzbareEvents = (events || []).filter((e) => {
    if (!e || !e.playerId) return false;
    if (e.eventType === AUSGESCHLOSSENER_EVENTTYP) return false;
    const t = e.createdAt instanceof Date ? e.createdAt.getTime() : Date.parse(e.createdAt);
    return t >= p2StartMs && t < stichtagMs;
  });

  // Aktive Berlin-Wochen je Konto (erst roh, Schnitt mit Wertungswochen folgt je Konto).
  const wochenJeKonto = new Map(); // idString -> Set(montagIso)
  const eventsJeKonto = new Map(); // idString -> [{montag, path, createdAtMs}] (für Kern-Aufruf/M2)
  for (const e of nutzbareEvents) {
    const id = String(e.playerId);
    const ms = e.createdAt instanceof Date ? e.createdAt.getTime() : Date.parse(e.createdAt);
    const montag = berlinMontagIso(ms);
    if (!wochenJeKonto.has(id)) wochenJeKonto.set(id, new Set());
    wochenJeKonto.get(id).add(montag);
    if (!eventsJeKonto.has(id)) eventsJeKonto.set(id, []);
    eventsJeKonto.get(id).push({ montag, path: e.path || "", ms });
  }

  const wertungsSet = new Set(wertungswochen);

  const konten = [];
  for (const s of spieler) {
    const createdMs = s.createdAt instanceof Date ? s.createdAt.getTime() : Date.parse(s.createdAt);
    if (!(createdMs <= stichtagMs)) continue; // §2.5 Schritt 1: createdAt ≤ Stichtag
    const istBestand = createdMs < p2StartMs; // §2.3: vor dem 14.09. registriert
    const regWoche = istBestand ? BESTAND_REG_WOCHE : berlinMontagIso(createdMs);
    // §1.2 + Auftrag: JEDER Admin (Haupt wie Co) trägt teamAdminOf; isTeamAdmin
    // zusätzlich laut §2.5 Schritt 2 — ein Feld reicht, beide schaden nicht.
    const istAdmin = Boolean(s.isTeamAdmin) || Boolean(s.teamAdminOf);
    const roheWochen = wochenJeKonto.get(String(s._id)) || new Set();
    // §2.5 Schritt 4: Schnitt mit Spielwochen-Kalender, minus Registrierungswoche.
    const aktiveWochen = [...roheWochen].filter((w) => wertungsSet.has(w) && w > regWoche).sort();
    // §2.5 Schritt 5: mögliche Wochen = Wertungs-Spielwochen NACH der Registrierungswoche.
    const moeglicheWochen = wertungswochen.filter((w) => w > regWoche).length;
    konten.push({
      id: String(s._id),
      teamId: s.teamId ? String(s.teamId) : null,
      signupSource: s.signupSource || null,
      istBestand,
      istAdmin,
      regWoche,
      aktiveWochen,
      moeglicheWochen,
      gewertet: !istAdmin && moeglicheWochen >= MIN_MOEGLICHE_WOCHEN,
      wiedergekommen: aktiveWochen.length >= MIN_AKTIVE_WOCHEN,
    });
  }

  const spielerKonten = konten.filter((k) => !k.istAdmin);
  const adminKonten = konten.filter((k) => k.istAdmin);
  const gewertete = spielerKonten.filter((k) => k.gewertet);
  const zuJung = spielerKonten.filter((k) => !k.gewertet);
  const wiedergekommene = gewertete.filter((k) => k.wiedergekommen);

  const x = wiedergekommene.length;
  const y = gewertete.length;
  // §4: unter 20 gewerteten Spielern KEINE Prozentzahl — nur „X von Y".
  const prozent = y >= MIN_N ? Math.round((x / y) * 1000) / 10 : null;
  const ampel = istAmpelLauf && prozent !== null ? ampelFuerQuote(prozent) : null;

  // --- Begleitwerte (§1.5/§3.3): erklären die WQ, überstimmen sie nicht. ---

  // Kern-Aufruf-Diagnose (§1.3, zweite Stufe): Anteil der aktiven Spielwochen
  // gewerteter Spieler, die mindestens einen Kern-Pfad-Aufruf enthalten.
  let aktiveWochenPaare = 0;
  let kernWochenPaare = 0;
  const kernPfadZaehler = new Map();
  for (const k of gewertete) {
    const evs = eventsJeKonto.get(k.id) || [];
    for (const w of k.aktiveWochen) {
      aktiveWochenPaare += 1;
      const wochenEvents = evs.filter((e) => e.montag === w);
      const kern = wochenEvents.filter((e) => KERN_PFADE.some((p) => e.path.startsWith(p)));
      if (kern.length > 0) kernWochenPaare += 1;
      for (const e of kern) {
        const pfad = KERN_PFADE.find((p) => e.path.startsWith(p));
        kernPfadZaehler.set(pfad, (kernPfadZaehler.get(pfad) || 0) + 1);
      }
    }
  }

  // M2 — Spieltags-Folgequote (§1.5): gewertete Spieler mit eigenem Spieltermin im
  // Fenster; aktiv binnen 72 h nach mindestens einem eigenen Termin.
  const H72 = 72 * 3600000;
  const relevanteMatches = (matches || []).filter((m) => {
    if (!m || !m.date) return false;
    const t = m.date instanceof Date ? m.date.getTime() : Date.parse(m.date);
    return m.status !== "cancelled" && t >= p2StartMs && t < datenstandMs;
  });
  const termineJeTeam = new Map();
  for (const m of relevanteMatches) {
    for (const tid of [m.teamA, m.teamB]) {
      if (!tid) continue;
      const key = String(tid);
      if (!termineJeTeam.has(key)) termineJeTeam.set(key, []);
      termineJeTeam.get(key).push(m.date instanceof Date ? m.date.getTime() : Date.parse(m.date));
    }
  }
  let m2MitTermin = 0;
  let m2Aktiv = 0;
  for (const k of gewertete) {
    const termine = k.teamId ? termineJeTeam.get(k.teamId) || [] : [];
    if (termine.length === 0) continue;
    m2MitTermin += 1;
    const evs = eventsJeKonto.get(k.id) || [];
    const binnen72h = termine.some((t) => evs.some((e) => e.ms >= t && e.ms <= t + H72));
    if (binnen72h) m2Aktiv += 1;
  }

  // M3 — Erfassungstreue der Admins (§1.5/§3.4, VORBEDINGUNGS-Metrik):
  // stattgefundene Spiele echter Teams mit Ergebnis-Einreichung binnen 7 Tagen.
  const T7 = 7 * 86400000;
  let m3Stattgefunden = 0;
  let m3Binnen7Tagen = 0;
  let m3OhneZeitpunkt = 0; // Ergebnis vorhanden, Einreichzeitpunkt unbekannt (zählt NICHT als binnen 7 Tagen — konservativ, aber ausgewiesen)
  for (const m of relevanteMatches) {
    const echt = (m.teamA && echteTeamIds.has(String(m.teamA))) || (m.teamB && echteTeamIds.has(String(m.teamB)));
    if (!echt) continue;
    m3Stattgefunden += 1;
    const t = m.date instanceof Date ? m.date.getTime() : Date.parse(m.date);
    const eingereicht = [m.teamAResult?.submittedAt, m.teamBResult?.submittedAt]
      .filter(Boolean)
      .map((d) => (d instanceof Date ? d.getTime() : Date.parse(d)));
    if (eingereicht.length > 0 && Math.min(...eingereicht) <= t + T7) {
      m3Binnen7Tagen += 1;
    } else if (eingereicht.length === 0 && (m.status === "completed" || m.resultStatus === "confirmed")) {
      m3OhneZeitpunkt += 1;
    }
  }
  const m3Prozent = m3Stattgefunden > 0 ? Math.round((m3Binnen7Tagen / m3Stattgefunden) * 1000) / 10 : null;
  // §3.4: unter 50 % ist eine rote/gelbe WQ nicht als Spieler-Desinteresse lesbar.
  const vorbedingung =
    m3Prozent === null ? "NICHT_MESSBAR" : m3Prozent < 50 ? "GERISSEN" : "ERFUELLT";

  // M4 — Kohortenkurve (§1.5, nur Anhang): je Registrierungswoche der Anteil
  // Aktiver in den Folge-Spielwochen 1–4 (absolute Zahlen, Kleinst-Kohorten).
  const kohorten = new Map();
  for (const k of spielerKonten) {
    if (!kohorten.has(k.regWoche)) kohorten.set(k.regWoche, []);
    kohorten.get(k.regWoche).push(k);
  }
  const m4 = [...kohorten.entries()].sort().map(([regWoche, liste]) => {
    const folgeWochen = wertungswochen.filter((w) => w > regWoche).slice(0, 4);
    return {
      regWoche,
      n: liste.length,
      folgeWochen: folgeWochen.map((w, i) => ({
        spielwoche: w,
        nr: i + 1,
        aktiv: liste.filter((k) => k.aktiveWochen.includes(w)).length,
      })),
    };
  });

  // M5 — Benachrichtigungs-Kette (§1.5): own_stats_notified → own_stats_opened binnen 72 h.
  const notified = [];
  const openedJeSpieler = new Map();
  for (const e of statsKette || []) {
    if (!e || !e.playerId) continue;
    const ms = e.createdAt instanceof Date ? e.createdAt.getTime() : Date.parse(e.createdAt);
    if (!(ms >= p2StartMs && ms < stichtagMs)) continue;
    const id = String(e.playerId);
    if (e.eventType === "own_stats_notified") notified.push({ id, ms });
    if (e.eventType === "own_stats_opened") {
      if (!openedJeSpieler.has(id)) openedJeSpieler.set(id, []);
      openedJeSpieler.get(id).push(ms);
    }
  }
  const m5Versendet = notified.length;
  const m5Geoeffnet = notified.filter(({ id, ms }) =>
    (openedJeSpieler.get(id) || []).some((o) => o >= ms && o <= ms + H72)
  ).length;

  // Aufschlüsselung nach signupSource (§2.5 Schritt 8) — Anekdoten, keine Quoten (§5.2).
  const jeQuelle = new Map();
  for (const k of gewertete) {
    const q = k.istBestand ? "(Bestand vor 14.09.)" : k.signupSource || "(ohne Kanal)";
    if (!jeQuelle.has(q)) jeQuelle.set(q, { gewertet: 0, wiedergekommen: 0 });
    const z = jeQuelle.get(q);
    z.gewertet += 1;
    if (k.wiedergekommen) z.wiedergekommen += 1;
  }

  // Kader-Beweis (§4 Signal 1): gibt es EIN echtes Team mit ≥5 wiedergekommenen
  // Nicht-Admin-Spielern? (Bei n < 20 eines der vier tragenden Signale.)
  const jeTeam = new Map();
  for (const k of gewertete) {
    if (!k.teamId || !k.wiedergekommen) continue;
    jeTeam.set(k.teamId, (jeTeam.get(k.teamId) || 0) + 1);
  }
  const kaderBeweis = [...jeTeam.entries()]
    .map(([teamId, anzahl]) => ({ teamId, wiedergekommen: anzahl }))
    .sort((a, b) => b.wiedergekommen - a.wiedergekommen);

  return {
    stichtag: stichtagIso,
    vorlaeufig,
    istAmpelLauf,
    wertungswochen,
    wq: { x, y, prozent, ampel },
    minN: MIN_N,
    zuJung: zuJung.map((k) => ({ id: k.id, regWoche: k.regWoche, moeglicheWochen: k.moeglicheWochen, aktiveWochen: k.aktiveWochen.length })),
    bestand: {
      gewertet: gewertete.filter((k) => k.istBestand).length,
      wiedergekommen: wiedergekommene.filter((k) => k.istBestand).length,
    },
    kampagne: {
      gewertet: gewertete.filter((k) => !k.istBestand).length,
      wiedergekommen: wiedergekommene.filter((k) => !k.istBestand).length,
    },
    adminGruppe: {
      anzahl: adminKonten.length,
      davonAktivIn2Wochen: adminKonten.filter((k) => k.wiedergekommen).length,
    },
    kernAufruf: {
      aktiveWochenPaare,
      mitKernAufruf: kernWochenPaare,
      fuehrendePfade: [...kernPfadZaehler.entries()].sort((a, b) => b[1] - a[1]).map(([pfad, anzahl]) => ({ pfad, anzahl })),
    },
    m2: { mitTermin: m2MitTermin, binnen72hAktiv: m2Aktiv },
    m3: {
      stattgefunden: m3Stattgefunden,
      binnen7Tagen: m3Binnen7Tagen,
      ohneZeitpunkt: m3OhneZeitpunkt,
      prozent: m3Prozent,
      vorbedingung,
    },
    m4,
    m5: { versendet: m5Versendet, binnen72hGeoeffnet: m5Geoeffnet },
    jeQuelle: [...jeQuelle.entries()].map(([quelle, z]) => ({ quelle, ...z })),
    kaderBeweis,
    anonymSitzungen,
    konten, // Rohdaten je Konto — für Wächter und Diagnose-Anhänge
  };
}
