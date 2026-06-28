import Player from "@/models/Player";

// Empfänger für Team-Admin-Benachrichtigungen (Beitritte/Anfragen).
// Standard: nur der Haupt-Admin (team.adminPlayerId). Ist team.notifyAllAdmins
// gesetzt, zusätzlich alle Co-Admins (isTeamAdmin + teamAdminOf == team).
// Liefert dedupliziert [{ _id, email, firstName }].
export async function getTeamAdminRecipients(team) {
  if (!team) return [];

  const ids = new Set();
  if (team.adminPlayerId) ids.add(String(team.adminPlayerId));

  if (team.notifyAllAdmins) {
    const coAdmins = await Player.find({
      isTeamAdmin: true,
      teamAdminOf: team._id,
    }).select("_id email firstName");
    const map = new Map(coAdmins.map((p) => [String(p._id), p]));
    // Haupt-Admin nachladen, falls nicht unter den Co-Admins
    for (const id of ids) {
      if (!map.has(id)) {
        const main = await Player.findById(id).select("_id email firstName");
        if (main) map.set(id, main);
      }
    }
    return [...map.values()];
  }

  // Nur Haupt-Admin
  const main = team.adminPlayerId
    ? await Player.findById(team.adminPlayerId).select("_id email firstName")
    : null;
  return main ? [main] : [];
}
