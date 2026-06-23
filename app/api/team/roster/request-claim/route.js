import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/request-claim – eingeloggter Spieler beansprucht einen Slot.
// Setzt den Slot auf "pending" und vermerkt den Spieler (claimedBy).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  const claimToken = body.claimToken;
  if (!claimToken) {
    return fail("Ungültiger Einladungslink", 400);
  }

  await connectDB();
  const team = await Team.findOne({ "rosterSlots.claimToken": claimToken });
  if (!team) {
    return fail("Dieser Einladungslink ist ungültig oder abgelaufen", 404);
  }

  const slot = team.rosterSlots.find((s) => s.claimToken === claimToken);
  if (!slot) {
    return fail("Slot nicht gefunden", 404);
  }
  if (slot.status !== "empty") {
    return fail("Dieser Platz wurde bereits beansprucht", 409);
  }

  // Slot beanspruchen
  slot.status = "pending";
  slot.claimedBy = player._id;
  await team.save();

  // Team-Admin benachrichtigen (falls spielergeführtes Team)
  if (team.adminPlayerId) {
    await Player.findByIdAndUpdate(team.adminPlayerId, {
      $push: {
        notifications: {
          type: "join_request",
          fromPlayerId: player._id,
          teamId: team._id,
          teamName: team.teamName,
          teamSlug: team.slug,
          message: `${player.firstName} ${player.lastName} möchte einen Kaderplatz beanspruchen.`,
          read: false,
          createdAt: new Date(),
        },
      },
    });
  }

  return ok({ message: "Anspruch gesendet – warte auf Bestätigung durch das Team." });
}

export const POST = withErrorHandling(handler);
