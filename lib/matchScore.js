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
