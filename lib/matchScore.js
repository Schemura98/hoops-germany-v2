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
