import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getTeamWithRole } from "@/lib/serverAuth";
import { TEAM_PERMISSION_KEYS } from "@/lib/teamPermissions";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-member-permissions – Teilrechte eines Co-Admins setzen.
// NUR der Haupt-Admin darf das. Body: { token, playerId, perms: [String] }
// perms wird gegen TEAM_PERMISSION_KEYS validiert; leeres Array = keine Rechte.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const role = await getTeamWithRole(token);
  if (!role) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }
  if (!role.isMainAdmin) {
    return fail("Nur der Haupt-Admin kann Rechte vergeben", 403);
  }
  const team = role.team;

  const { playerId } = body;
  if (!playerId) {
    return fail("Kein Spieler angegeben", 400);
  }
  if (String(team.adminPlayerId || "") === String(playerId)) {
    return fail("Der Haupt-Admin hat immer alle Rechte", 400);
  }

  const perms = Array.isArray(body.perms)
    ? [...new Set(body.perms.filter((p) => TEAM_PERMISSION_KEYS.includes(p)))]
    : [];

  await connectDB();
  const member = await Player.findById(playerId).select("teamAdminOf isTeamAdmin");
  if (!member || !member.isTeamAdmin || String(member.teamAdminOf || "") !== String(team._id)) {
    return fail("Dieser Spieler ist kein Co-Admin dieses Teams", 400);
  }

  // Bestehenden Eintrag ersetzen (pull + push), damit es genau einen pro Spieler gibt.
  await Team.updateOne(
    { _id: team._id },
    { $pull: { adminPermissions: { player: member._id } } }
  );
  await Team.updateOne(
    { _id: team._id },
    { $push: { adminPermissions: { player: member._id, perms } } }
  );

  return ok({ playerId: String(member._id), perms });
}

export const POST = withErrorHandling(handler);
