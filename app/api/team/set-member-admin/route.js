import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-member-admin – Team-Admin macht ein Mitglied zum Co-Admin
// oder entzieht die Rechte (Dual-Auth; jeder Team-Admin darf das).
// Body: { token, playerId, makeAdmin: boolean }
// Co-Admin = Player.isTeamAdmin + teamAdminOf == team (nutzt die bestehende Dual-Auth).
// Der Gründer (team.adminPlayerId) ist geschützt und kann nicht degradiert werden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const { playerId, makeAdmin } = body;
  if (!playerId) {
    return fail("Kein Spieler angegeben", 400);
  }

  await connectDB();
  const player = await Player.findById(playerId);
  if (!player || String(player.teamId) !== String(team._id)) {
    return fail("Spieler gehört nicht zu diesem Team", 400);
  }

  const isFounder = team.adminPlayerId && String(team.adminPlayerId) === String(player._id);
  if (isFounder) {
    return fail("Der Team-Gründer ist dauerhaft Admin und kann nicht geändert werden", 400);
  }

  if (makeAdmin) {
    player.isTeamAdmin = true;
    player.teamAdminOf = team._id;
    // Benachrichtigung an den neuen Admin
    player.notifications.push({
      type: "team_admin_granted",
      teamId: team._id,
      teamName: team.teamName,
      teamSlug: team.slug,
      message: `Du bist jetzt Team-Admin von ${team.teamName}.`,
    });
  } else {
    player.isTeamAdmin = false;
    player.teamAdminOf = null;
  }
  await player.save();

  return ok({
    playerId: String(player._id),
    isAdmin: !!makeAdmin,
    message: makeAdmin ? "Spieler ist jetzt Team-Admin." : "Adminrechte entzogen.",
  });
}

export const POST = withErrorHandling(handler);
