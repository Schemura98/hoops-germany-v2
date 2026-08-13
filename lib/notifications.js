// Leerzustand der Glocke – EIN String für beide Glocken (NotificationBell und
// die eigene Umsetzung in der öffentlichen Navbar). Sie standen bis zum
// 14.08.2026 doppelt im Code und waren schon auseinandergelaufen (einmal mit,
// einmal ohne Punkt); als Konstante kann das nicht wieder passieren.
//
// Warum der Satz überhaupt so lautet (Befund Lina, Wortlaut Nele, 14.08.2026):
// „Keine Benachrichtigungen." beantwortet die Frage nicht, mit der man die
// Glocke öffnet. Der Kern der Plattform – belegbare Zahlen – wurde bis dahin
// NIRGENDS vorher angekündigt; die Nachricht „Deine Zahlen … stehen" war die
// erste Erwähnung überhaupt. Der Leerzustand kündigt sie jetzt an, wörtlich mit
// dem Verb der echten Nachricht (`lib/statsNotify.js`), damit man sie
// wiedererkennt.
// ⚠️ Bewusst „eingetragen", NICHT „bestätigt": `notifyOwnStats` versendet auch
// bei einseitiger Meldung, dann mit Vorbehalt im Text. Eine Bestätigung
// anzukündigen, die als „noch vorläufig" ankommt, wäre der nächste Fall für
// docs/MUSTER-ZAHLEN-DIE-LUEGEN.
export const GLOCKE_LEER =
  "Noch nichts. Sobald deine Zahlen aus einem Spiel eingetragen sind, stehen sie hier.";

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
  if (n.type === "league_change_request") return "/admin/league-requests";
  if (n.type === "league_change_approved" || n.type === "league_change_rejected")
    return "/team/admin?tab=einstellungen";
  if (n.type === "pending_result") return "/team/admin?tab=ergebnisse";
  if (n.type === "match_result" && n.matchId) return `/match/${n.matchId}`;
  // Eigene Werte im Box-Score → direkt zum Spiel: dort steht die Statistik-Tabelle
  // und das Abzeichen „Von beiden Teams bestätigt".
  if (n.type === "own_stats" && n.matchId) return `/match/${n.matchId}`;
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
