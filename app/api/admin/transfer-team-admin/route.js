import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/transfer-team-admin – Super-Admin überträgt die Team-Admin-Rolle
// (Gründer) an ein ausgewähltes Mitglied. Der bisherige Admin wird normales Mitglied.
// Body: { token, teamId, playerId }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.teamId || !body.playerId) return fail("Team- und Spieler-ID nötig", 400);

  await connectDB();
  const team = await Team.findById(body.teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  const newAdmin = await Player.findById(body.playerId);
  if (!newAdmin || String(newAdmin.teamId) !== String(team._id)) {
    return fail("Spieler ist kein Mitglied dieses Teams", 400);
  }

  // Bisherigen Admin (Gründer) zu normalem Mitglied zurückstufen
  if (team.adminPlayerId && String(team.adminPlayerId) !== String(newAdmin._id)) {
    await Player.updateOne(
      { _id: team.adminPlayerId },
      { $set: { isTeamAdmin: false }, $unset: { teamAdminOf: "" } }
    );
  }

  // Neuen Admin setzen
  newAdmin.isTeamAdmin = true;
  newAdmin.teamAdminOf = team._id;
  newAdmin.notifications.push({
    type: "team_admin_granted",
    teamId: team._id,
    teamName: team.teamName,
    teamSlug: team.slug,
    message: `Du bist jetzt Team-Admin von ${team.teamName}.`,
  });
  await newAdmin.save();
  await Team.updateOne({ _id: team._id }, { $set: { adminPlayerId: newAdmin._id } });

  return ok({ message: `${newAdmin.firstName} ist jetzt Admin von ${team.teamName}` });
}

export const POST = withErrorHandling(handler);
