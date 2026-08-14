// Zentrale Konstanten der Anwendung

// Spielpositionen – ausgeschrieben (Basketball-Standard).
export const POSITIONS = [
  "Point Guard",
  "Shooting Guard",
  "Small Forward",
  "Power Forward",
  "Center",
];

// Funktionen abseits des Feldes (für Scouting/Transfermarkt: Vereine suchen auch
// Trainer & Funktionäre, Personen können sich als Fan eintragen).
export const PLAYER_ROLES = ["Coach", "Manager", "Sportliche Leitung", "Fan"];

// Alle wählbaren Rollen (Position + Funktion) – für Profil-Auswahl/Filter.
export const ALL_ROLES = [...POSITIONS, ...PLAYER_ROLES];

// ---------------------------------------------------------------------------
// Mindestalter-Meldungen – EINE Stelle für eine Regel.
//
// Bis zum 14.08.2026 stand derselbe Satz an SECHS Stellen (`app/signup/page.js`
// viermal, `/team/join/[token]` und `/team/claim/[token]` je einmal) plus
// serverseitig in `playerregister`. Nora hat beim Gegenlesen darauf
// hingewiesen: Ziehen drei davon eine neue Formulierung nach und drei nicht,
// spricht eine einzige Seite die Regel in zwei Tonlagen. Dieselbe Lage gab es
// am selben Tag beim Leerzustand der Glocke und bei den Rechtsverweisen.
//
// Der Wortlaut stammt von Nele und behebt einen Fehler, den niemand gesucht
// hatte: „Bitte bestätige, dass du mindestens 16 Jahre alt bist." ist an
// jemanden gerichtet, der ein Häkchen vergessen hat. Einem 14-Jährigen sagt
// dieser Satz nicht „du darfst hier nicht", sondern „setz das Häkchen" – der
// Weg des geringsten Widerstands ist damit die Falschangabe, und zwar bei
// genau der Person, die die Regel ausschließen soll. Jetzt steht die Regel
// zuerst, die Aufforderung danach und unter Bedingung.
//
// ⚠️ Der Häkchen-TEXT selbst („Ich bin mindestens 16 Jahre alt.") bleibt an
// allen drei Stellen unverändert: Er ist eine Tatsachenangabe und keine
// Willenserklärung – die Regel gehört daneben, nicht hinein (Nora).
// ⚠️ `tests/e2e/auth.spec.mjs` prüft die Server-Antwort auf „16 Jahre". Beide
// Fassungen enthalten das („ab 16 Jahren"), aber beim Ändern gegenlesen.
export const MINDESTALTER_HINWEIS =
  "Hoops Germany ist ab 16 Jahren. Wenn du mindestens 16 bist, setz bitte das Häkchen.";

// Eigene Fassung für den Google-Weg: Dort ist die Folge des fehlenden Häkchens
// nicht offensichtlich (der Knopf sieht bedienbar aus), deshalb steht sie mit
// im Satz.
export const MINDESTALTER_HINWEIS_GOOGLE =
  "Hoops Germany ist ab 16 Jahren. Setz bitte das Häkchen, wenn du mindestens 16 bist – dann klappt auch die Anmeldung mit Google.";

// Rückwärtskompatibilität: alte Kürzel → ausgeschrieben (für Anzeige von Altdaten).
export const POSITION_LABELS = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

// Anzeige-Label einer Position/Rolle: mappt alte Kürzel, lässt alles andere durch.
//
// ⚠️ `hasOwnProperty` statt direktem Zugriff (Befund Kai, 14.08.2026,
// reproduziert): `position` ist ein freier String ohne Allowlist – weder
// `update-profile` noch das Schema begrenzen ihn. Ein Konto mit
// `position: "__proto__"` bekam über den einfachen Zugriff `Object.prototype`
// zurück, also ein Objekt statt eines Strings. Da über 30 Stellen den Rückgabe-
// wert direkt als React-Kind rendern – darunter die öffentlichen Listen
// `/spieler` und `/transfermarkt` –, hätte ein einziges Konto diese Seiten für
// ALLE Besucher zum Absturz gebracht („Objects are not valid as a React
// child"). Mit der Eigen-Prüfung fällt jeder nicht selbst gesetzte Schlüssel
// auf den Rohwert zurück und bleibt ein String.
export function positionLabel(value) {
  if (typeof value !== "string" || value === "") return value || "";
  return Object.prototype.hasOwnProperty.call(POSITION_LABELS, value)
    ? POSITION_LABELS[value]
    : value;
}

// Die 16 deutschen Bundesländer (für Geo-Filter Stufe 1).
export const BUNDESLAENDER = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

// Liga-Stufen (höchste → niedrigste); Reihenfolge dient auch der Sortierung.
export const LEAGUE_LEVELS = [
  "Regionalliga",
  "Oberliga",
  "Landesliga",
  "Bezirksliga",
  "Kreisliga",
  "Sonstige",
];

// Geschlecht/Spielklasse einer Liga.
export const LEAGUE_GENDERS = ["Herren", "Damen", "Mixed"];

// Altersklassen (Senioren + Jugend).
//
// ⚠️ NUR Senioren und U18 (Entscheidung Patrick, 13.08.2026: „Die Website ist
// wirklich erst ab 16 gedacht"). U16 ist bewusst RAUS: Eine U16-Liga ist eine
// Altersklasse UNTER 16 – dort spielen 14- und 15-Jährige. In U18 spielen 16-
// und 17-Jährige, das passt zur Regel.
//
// Vorher standen hier Senioren/U18/U16 (26.06.2026). Der Widerspruch zwischen
// ausgeliefertem Ligakatalog und der Altersregel fiel bei Noras rechtlicher
// Vorprüfung zur Leistungskarte auf; die betroffenen Ligen, Teams und
// Beispielprofile wurden am 13.08.2026 aus hoops_prod entfernt (9 Ligen,
// 4 Demo-Teams, 4 Beispielprofile – kein einziger echter Datensatz betroffen).
//
// VERBINDLICHE Produktregel – auch serverseitig in den Admin-Liga-APIs
// erzwungen (createleague/updateleague).
export const LEAGUE_AGE_GROUPS = ["Senioren", "U18"];

// Basketballkreise in NRW (Unterbau der Bezirksliga; Kreisligen sind kreisbezogen).
// ✅ Offizielle, zentral gepflegte Liste der 22 WBV-Basketballkreise. Quelle: offizielle
// WBV-Seite „Basketballkreise" (basketball.nrw); zuletzt geprüft am 02.07.2026. Nur Kreisnamen +
// Gruppierung nach Regierungsbezirk gelten als verifiziert. KANONISCHE Quelle: diese Konstante
// NICHT über Komponenten duplizieren. Der Regierungsbezirk dient nur der internen Gruppierung,
// kein Nutzer-Hauptfilter.
export const BASKETBALLKREISE_NRW_GRUPPIERT = [
  {
    bezirk: "Regierungsbezirk Köln",
    kreise: ["Kreis Aachen", "Kreis Erft", "Kreis Bonn", "Kreis Köln", "Rheinisch Bergischer Kreis"],
  },
  {
    bezirk: "Regierungsbezirk Düsseldorf",
    kreise: [
      "Kreis Düsseldorf",
      "Kreis Niers",
      "Kreis Niederrhein",
      "Kreis Essen",
      "Kreis Mettmann",
      "Kreis Wuppertal",
    ],
  },
  {
    bezirk: "Regierungsbezirk Arnsberg",
    kreise: [
      "Kreis Bochum",
      "Kreis Dortmund",
      "Kreis Unna/Hamm/Soest",
      "Kreis Ennepe-Ruhr",
      "Kreis Hagen",
      "Märkischer Kreis",
      "Kreis Südwestfalen",
    ],
  },
  {
    bezirk: "Regierungsbezirk Münster",
    kreise: ["Kreis Münster", "Kreis Emscher-Lippe"],
  },
  {
    bezirk: "Regierungsbezirk Detmold",
    kreise: ["Kreis Ostwestfalen", "Kreis Paderborn"],
  },
];
// Flache Liste aller Kreise (für Filter/Validierung).
export const BASKETBALLKREISE_NRW = BASKETBALLKREISE_NRW_GRUPPIERT.flatMap((g) => g.kreise);

// Regierungsbezirk zu einem Kreis nachschlagen.
export function bezirkOfKreis(kreis) {
  return BASKETBALLKREISE_NRW_GRUPPIERT.find((g) => g.kreise.includes(kreis))?.bezirk || "";
}

// Orts-/Stadt-Aliase je Basketballkreis – reine SUCH-Hilfe (Text-Matching), ändert
// NICHT den gespeicherten kanonischen `region`-Wert ("Kreis Niers" bleibt "Kreis Niers").
// Nur Kreis Niers ist aktuell gepflegt; weitere Kreise können bei Bedarf ergänzt werden.
export const KREIS_ORT_ALIASE = {
  "Kreis Niers": [
    "Viersen",
    "Mönchengladbach",
    "Krefeld",
    "Nettetal",
    "Kempen",
    "Willich",
    "Dülken",
    "Rheydt",
    "Fischeln",
    "Lobberich",
  ],
};

// Kreis anhand eines freien Textes (Ortsname oder Kreisname) ermitteln – für Suche
// und für die „Nutzerregion"-Vorauswahl (Heimatort/Region → bevorzugter Kreis).
export function kreisFromText(text) {
  const t = String(text || "").trim().toLowerCase();
  if (!t) return null;
  if (BASKETBALLKREISE_NRW.some((k) => k.toLowerCase() === t)) {
    return BASKETBALLKREISE_NRW.find((k) => k.toLowerCase() === t);
  }
  for (const [kreis, orte] of Object.entries(KREIS_ORT_ALIASE)) {
    if (orte.some((o) => o.toLowerCase() === t || t.includes(o.toLowerCase()))) return kreis;
  }
  return null;
}

export const TRANSFER_STATUS = {
  AVAILABLE: "verfuegbar",
  UNAVAILABLE: "nicht_verfuegbar",
};

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Spielabschnitt: Hauptrunde (zählt für die Tabelle) vs. Playoffs (separater Abschnitt).
export const MATCH_STAGES = ["Hauptrunde", "Playoffs"];

// Playoff-Runden (höchste zuletzt) – Reihenfolge dient auch der Sortierung/Anzeige.
export const PLAYOFF_ROUNDS = [
  "Achtelfinale",
  "Viertelfinale",
  "Halbfinale",
  "Spiel um Platz 3",
  "Finale",
];

// Playoff-Modus je Liga/Saison (optional, da nicht jede Amateurklasse Playoffs hat):
//   "keine"     → Meister über die Abschlusstabelle der Hauptrunde
//   "best_of_1" → Playoffs als Endrunde (ein Spiel je Paarung), Finalsieger = Meister
export const LEAGUE_PLAYOFF_MODES = [
  { value: "keine", label: "Kein Playoff – Meister über Abschlusstabelle" },
  { value: "best_of_1", label: "Playoffs (Best-of-1) – Finalsieger ist Meister" },
];
export function playoffModeLabel(value) {
  return (
    LEAGUE_PLAYOFF_MODES.find((m) => m.value === value)?.label ||
    LEAGUE_PLAYOFF_MODES[0].label
  );
}

// Status einer Team-Saison-Teilnahme.
export const TEAM_SEASON_STATUS = [
  { value: "aktiv", label: "Aktiv" },
  { value: "zurueckgezogen", label: "Zurückgezogen" },
  { value: "ausser_konkurrenz", label: "Außer Konkurrenz" },
  { value: "disqualifiziert", label: "Disqualifiziert" },
];
export function teamSeasonStatusLabel(value) {
  return TEAM_SEASON_STATUS.find((s) => s.value === value)?.label || "Aktiv";
}

export const RESULT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  MISMATCH: "mismatch",
};

export const SLOT_STATUS = {
  EMPTY: "empty",
  PENDING: "pending",
  CONFIRMED: "confirmed",
};

// localStorage-Keys für die Auth-Token-Typen
export const TOKEN_KEYS = {
  PLAYER: "playerAuthToken",
  TEAM: "teamAuthToken",
  ADMIN: "adminAuthToken",
};

// Kampagnen-Quelle (`?src=`) — geteilt zwischen AnalyticsTracker (fängt sie auf
// JEDER Route ab) und /signup (liest sie beim Absenden aus).
//
// Bewusst NICHT hier, sondern eigenständig in
// app/api/player/playerregister/route.js: die serverseitige Prüfung. Der Server
// darf eine Client-Konstante nicht als Zusicherung behandeln — er validiert
// selbst, auch wenn das Muster dasselbe ist.
export const SIGNUP_SOURCE_KEY = "signupSource";
export const SIGNUP_SOURCE_RE = /^[a-z0-9-_]{1,40}$/;
