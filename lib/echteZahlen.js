// Zentrale Filter für „echte" Beteiligungszahlen.
//
// Auf der Plattform liegen drei Sorten Konten nebeneinander:
//   1. echte, externe Nutzer und Vereine        → zählen
//   2. Demo-/Seed-Daten (`isDemo`)              → zählen NIE (erfundene Fixtures)
//   3. interne Testkonten (`isInternal`)        → zählen NIE (real angelegt,
//      aber von uns selbst: „Test Baskets", Demo-Coach, Entwickler-Profile)
//
// Warum das eine eigene Datei ist: Jede Stelle, die künftig eine
// Beteiligungszahl anzeigt, muss denselben Filter benutzen. Nele hat als
// Voraussetzung für eine öffentliche Zahl ausdrücklich verlangt, dass interne
// Konten nicht mitgezählt werden (docs/LANDING-COPY-2026-08-11.md §7) – sonst
// zählt sich das Projekt selbst und die Zahl ist eine Falschaussage.
//
// `$ne: true` statt `false`, weil Bestandsdatensätze das Feld gar nicht haben.

export const NUR_ECHT = { isDemo: { $ne: true }, isInternal: { $ne: true } };

// Teams zusätzlich: nicht freigegebene Gründungen sind noch keine Vereine.
export const NUR_ECHTE_TEAMS = { ...NUR_ECHT, approved: { $ne: false } };

// Für die Anzeige im Admin-Bereich: Warum wurde ein Eintrag nicht mitgezählt?
export function zaehlgrund(eintrag) {
  if (eintrag?.isDemo) return "Beispieldaten";
  if (eintrag?.isInternal) return "interner Testaccount";
  if (eintrag?.approved === false) return "noch nicht freigegeben";
  return null;
}
