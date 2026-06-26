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
// werden vorerst nicht abgebildet (Entscheidung 26.06.2026).
export const LEAGUE_AGE_GROUPS = ["Senioren", "U18", "U16"];

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
