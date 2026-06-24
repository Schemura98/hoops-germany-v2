// Zielort einer Benachrichtigung – führt direkt zur passenden Aktion/Ansicht.
// `me` (eingeloggter Player) entscheidet die Rolle (Super-Admin vs. Team-Admin).
export function notificationHref(n, me) {
  // Strittiges Ergebnis: Super-Admin → Auflösung im Admin-Panel;
  // Team-Admin → direkt zur Ergebnis-Korrektur.
  if (n.type === "result_mismatch") {
    return me?.isSuperAdmin ? "/admin/matches" : "/team/admin?tab=ergebnisse";
  }
  if (n.type === "pending_result") return "/team/admin?tab=ergebnisse";
  if (n.type === "match_result" && n.matchId) return `/match/${n.matchId}`;
  if (n.type === "join_request") return "/team/admin?tab=anfragen";
  if (n.type === "follow" && n.fromPlayerId) {
    return `/player/view-player/${n.fromPlayerId}`;
  }
  if (n.teamSlug) return `/team/team-detail/${n.teamSlug}`;
  if (n.matchId) return `/match/${n.matchId}`;
  return null;
}
