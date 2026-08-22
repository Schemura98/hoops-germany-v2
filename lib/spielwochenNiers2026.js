// Spielwochen-Kalender Kreis Niers, Messfenster 28.09.2026 bis 20.12.2026.
// Quelle und Methodik: docs/SPIELWOCHEN-KREIS-NIERS-2026.md (Abruf aller Quellen: 23.08.2026).
// Datengrundlage: TeamSL-Spielplan KLH Niers 2026/27 (Liga-ID 56045, 72 Spiele = vollständige
// Doppelrunde) + NRW-Herbstferien 17.10.-31.10.2026 (schulministerium.nrw).
//
// "montag" = ISO-Datum des Wochenmontags (Woche Montag-Sonntag, Europe/Berlin, s. Definition
// docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md Abschnitt 2.3/2.4).
// "termine" = Zahl der in dieser Woche angesetzten KLH-Spiele (Stand 23.08.2026).
//
// WICHTIG: Nur Daten, keine Logik - die gehoert in den Messjob. Nach dem 14.09.2026 wird
// diese Liste nur noch bei einer Verbands-Verlegung geaendert, mit Protokollzeile in der
// Definitionsdatei (deren Regel 2.4).

export const SPIELWOCHEN_NIERS_2026 = [
  { montag: "2026-09-28", spielwoche: true,  termine: 4, grund: "Spieltag 1: Sa 03.10. + So 04.10. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-10-05", spielwoche: true,  termine: 4, grund: "Spieltag 2: Fr 09.10. + Sa 10.10. + So 11.10. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-10-12", spielwoche: false, termine: 0, grund: "Kein KLH-Spieltermin laut TeamSL (Abruf 23.08.2026); Wochenende 17./18.10. = Beginn der NRW-Herbstferien" },
  { montag: "2026-10-19", spielwoche: false, termine: 0, grund: "Kein KLH-Spieltermin laut TeamSL (Abruf 23.08.2026); Woche liegt komplett in den NRW-Herbstferien (17.10.-31.10., schulministerium.nrw)" },
  { montag: "2026-10-26", spielwoche: false, termine: 0, grund: "Kein KLH-Spieltermin laut TeamSL (Abruf 23.08.2026); Mo-Sa Herbstferien, So 01.11. Allerheiligen" },
  { montag: "2026-11-02", spielwoche: true,  termine: 4, grund: "Spieltag 3: So 08.11. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-11-09", spielwoche: true,  termine: 4, grund: "Spieltag 4: So 15.11. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-11-16", spielwoche: false, termine: 0, grund: "Kein KLH-Spieltermin laut TeamSL (Abruf 23.08.2026); So 22.11. ist Totensonntag (Interpretation, s. Doku)" },
  { montag: "2026-11-23", spielwoche: true,  termine: 4, grund: "Spieltag 5: So 29.11. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-11-30", spielwoche: true,  termine: 4, grund: "Spieltag 6: So 06.12. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-12-07", spielwoche: true,  termine: 4, grund: "Spieltag 7: So 13.12. (TeamSL, Abruf 23.08.2026)" },
  { montag: "2026-12-14", spielwoche: true,  termine: 4, grund: "Spieltag 8: So 20.12. (TeamSL, Abruf 23.08.2026); letzter Hinrunden-Spieltag vor der Weihnachtspause" },
];
