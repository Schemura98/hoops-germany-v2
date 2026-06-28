// Zielort einer Benachrichtigung – führt direkt zur passenden Aktion/Ansicht.
// `me` (eingeloggter Player) entscheidet die Rolle (Super-Admin vs. Team-Admin).
export function notificationHref(n, me) {
  // Strittiges Ergebnis: Super-Admin → Auflösung im Admin-Panel;
  // Team-Admin → direkt zur Ergebnis-Korrektur.
  if (n.type === "result_mismatch") {
    return me?.isSuperAdmin ? "/admin/matches" : "/team/admin?tab=ergebnisse";
  }
  // Feed-Interaktionen → direkt zum Beitrag (Permalink).
  if (
    (n.type === "post_like" ||
      n.type === "post_comment" ||
      n.type === "comment_reply" ||
      n.type === "mention") &&
    n.postId
  ) {
    return `/post/${n.postId}`;
  }
  if (n.type === "team_admin_granted" || n.type === "team_approved") return "/team/admin";
  if (n.type === "team_pending") return "/admin/teams";
  if (n.type === "pending_result") return "/team/admin?tab=ergebnisse";
  if (n.type === "match_result" && n.matchId) return `/match/${n.matchId}`;
  if (n.type === "join_request") return "/team/admin?tab=anfragen";
  if (n.type === "member_joined") return "/team/admin?tab=kader";
  // team_invite wird im NotificationBell inline (annehmen/ablehnen) behandelt;
  // als Fallback (andere Oberflächen) zur Vereinsseite.
  if (n.type === "team_invite") return n.teamSlug ? `/team/team-detail/${n.teamSlug}` : null;
  if (n.type === "follow" && n.fromPlayerId) {
    return `/player/view-player/${n.fromPlayerId}`;
  }
  if (n.teamSlug) return `/team/team-detail/${n.teamSlug}`;
  if (n.matchId) return `/match/${n.matchId}`;
  return null;
}
