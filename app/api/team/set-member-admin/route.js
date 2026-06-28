import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getTeamWithRole } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-member-admin – Mitglied zum Co-Admin machen oder degradieren.
// NUR der Haupt-Admin (team.adminPlayerId) darf Admin-Rollen verwalten.
// Body: { token, playerId, makeAdmin: boolean }
// Co-Admin = Player.isTeamAdmin + teamAdminOf == team.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const role = await getTeamWithRole(token);
  if (!role) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }
  if (!role.isMainAdmin) {
    return fail("Nur der Haupt-Admin kann Admin-Rollen verwalten", 403);
  }
  const team = role.team;

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
    return fail("Der Haupt-Admin kann hier nicht geändert werden (nur über das Super-Admin-Panel übertragbar)", 400);
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
    // Teilrechte-Eintrag aufräumen
    await Team.updateOne(
      { _id: team._id },
      { $pull: { adminPermissions: { player: player._id } } }
    );
  }
  await player.save();

  return ok({
    playerId: String(player._id),
    isAdmin: !!makeAdmin,
    message: makeAdmin ? "Spieler ist jetzt Team-Admin." : "Adminrechte entzogen.",
  });
}

export const POST = withErrorHandling(handler);
