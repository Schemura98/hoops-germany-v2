import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getTeamFromToken } from "@/lib/serverAuth";
import { recordTransfer } from "@/lib/recordTransfer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/remove-member – Team-Admin entfernt ein Mitglied (Dual-Auth).
// Entfernt nur die Team-Zugehörigkeit (teamId) des Spielers.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const playerId = body.playerId;
  if (!playerId) {
    return fail("Kein Spieler angegeben", 400);
  }

  await connectDB();
  const player = await Player.findById(playerId);
  if (!player || String(player.teamId) !== String(team._id)) {
    return fail("Spieler gehört nicht zu diesem Team", 400);
  }

  // Team-Admin kann sich nicht selbst aus dem eigenen Team entfernen
  if (player.isTeamAdmin && String(player.teamAdminOf) === String(team._id)) {
    return fail("Der Team-Admin kann nicht entfernt werden", 400);
  }

  player.teamId = null;
  await player.save();

  await recordTransfer({
    player: player._id,
    fromTeam: team._id,
    toTeam: null,
    type: "leave",
  });

  return ok({ message: "Spieler aus dem Team entfernt." });
}

export const POST = withErrorHandling(handler);
