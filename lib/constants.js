// Zentrale Konstanten der Anwendung

export const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

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

export const TRANSFER_STATUS = {
  AVAILABLE: "verfuegbar",
  UNAVAILABLE: "nicht_verfuegbar",
};

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

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
