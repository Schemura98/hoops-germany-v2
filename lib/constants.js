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

// Rückwärtskompatibilität: alte Kürzel → ausgeschrieben (für Anzeige von Altdaten).
export const POSITION_LABELS = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

// Anzeige-Label einer Position/Rolle: mappt alte Kürzel, lässt alles andere durch.
export function positionLabel(value) {
  return POSITION_LABELS[value] || value || "";
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

// Altersklassen (Senioren + Jugend). Bewusst nur bis U16: Jüngere Klassen (U14/U12/U10)
// werden vorerst nicht abgebildet (Entscheidung 26.06.2026). VERBINDLICHE Produktregel –
// auch serverseitig in den Admin-Liga-APIs erzwungen (createleague/updateleague).
export const LEAGUE_AGE_GROUPS = ["Senioren", "U18", "U16"];

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
