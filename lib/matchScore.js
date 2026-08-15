// Nach wie vielen Stunden ohne Gegen-Eintrag der „nicht bestätigt"-Hinweis erlischt.
export const RESULT_EXPIRY_HOURS = 48;

// Verifikations-Status eines (gespielten) Spiels für die Anzeige.
// Gibt { state, label } oder null (kein Ergebnis):
//   confirmed  – beide Teams stimmen überein (kein Badge nötig)
//   mismatch   – beide Teams, widersprüchlich → "Ergebnis strittig"
//   unverified – einseitig eingetragen, < X h → "Noch nicht vom Gegner bestätigt"
//   final      – einseitig, ≥ X h ohne Gegen-Eintrag → Hinweis erloschen (gilt als Endstand)
export function matchVerification(match) {
  if (match?.status !== "completed") return null;
  if (match.resultStatus === "confirmed") return { state: "confirmed", label: "Bestätigt" };
  if (match.resultStatus === "mismatch") return { state: "mismatch", label: "Ergebnis strittig" };
  // pending = nur ein Team hat eingetragen
  const sub = match.teamAResult?.submittedAt || match.teamBResult?.submittedAt;
  const ageMs = sub ? Date.now() - new Date(sub).getTime() : Infinity;
  if (ageMs >= RESULT_EXPIRY_HOURS * 3600 * 1000) {
    return { state: "final", label: "Endstand" };
  }
  return { state: "unverified", label: "Noch nicht vom Gegner bestätigt" };
}

// ⚠️ DAS PRÄDIKAT FÜR „VON BEIDEN TEAMS BESTÄTIGT" – die einzige zulässige
// Quelle für jede Aussage mit dem Wort „bestätigt".
//
// Hier gehoben am 15.08.2026, nachdem BEIDE Gates unabhängig denselben
// blockierenden Befund meldeten: Die Anzeigetafel und der Ergebnis-Auto-Post
// behaupteten „Von beiden Teams bestätigt" allein auf Basis von
// `resultStatus === "confirmed"`. Das ist in zwei realen Fällen falsch:
//
//   1. `app/api/admin/updatematch` ERFINDET beide Meldungen aus einem einzigen
//      Admin-Formular (`teamAResult` und `teamBResult` werden gesetzt, aber
//      OHNE `submittedBy`) und setzt `resultStatus: "confirmed"`. Tobias hat
//      genau so ein Spiel in den Seed-Daten gefunden – der Newsfeed sagte
//      „beidseitig bestätigt", `/match/[id]` zeigte das Abzeichen nicht.
//   2. `state === "final"` heißt laut Definition oben: EINSEITIG gemeldet,
//      ≥ 48 h ohne Gegen-Eintrag. Das als „beidseitig bestätigt" zu
//      beschriften ist eine glatte Umkehrung – und im Amateursport der
//      Normalfall, nicht die Ausnahme.
//
// ⚠️ `matchVerification` beantwortet diese Frage NICHT und darf dafür nicht
// benutzt werden. Es beschreibt den Anzeige-Zustand (auch „Endstand"), nicht
// die Beweislage. Genau diese Verwechslung war der Fehler.
//
// Die Bedingung stand bereits zweimal wörtlich im Repo (`lib/statsNotify.js`,
// `app/match/[id]/page.js`, beide seit dem 12.08. mit Kommentar von Kai) –
// ich hatte den WORTLAUT übernommen, aber nicht das PRÄDIKAT. Deshalb steht
// sie jetzt an EINER Stelle, und die anderen ziehen daraus.
export function beidseitigBelegt(match) {
  return (
    match?.resultStatus === "confirmed" &&
    !!match?.teamAResult?.submittedBy &&
    !!match?.teamBResult?.submittedBy
  );
}

// Rechnet aus winningTeam + Punkten die Punkte je Seite (teamA/teamB) zurück.
// Gibt { a, b } oder null (noch kein Endstand).
export function teamScores(match) {
  if (match?.status !== "completed" || match.winningTeamPoints == null) {
    return null;
  }
  const aId = String(match.teamA?._id || match.teamA);
  const winId = String(match.winningTeam || "");
  const w = match.winningTeamPoints;
  const l = match.losingTeamPoints;
  // Unentschieden / unbekannter Sieger: beide gleich → Reihenfolge egal
  if (!winId) return { a: w, b: l };
  return winId === aId ? { a: w, b: l } : { a: l, b: w };
}
