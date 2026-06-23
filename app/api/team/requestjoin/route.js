import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/requestjoin – Spieler stellt Beitrittsanfrage an ein Team.
// Akzeptiert teamId oder teamSlug.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst als Spieler anmelden", 401);
  }

  await connectDB();
  const team = body.teamId
    ? await Team.findById(body.teamId)
    : body.teamSlug
    ? await Team.findOne({ slug: body.teamSlug })
    : null;

  if (!team) {
    return fail("Team nicht gefunden", 404);
  }

  if (String(player.teamId) === String(team._id)) {
    return fail("Du bist bereits in diesem Team", 400);
  }
  if (String(player.teamJoinRequest) === String(team._id)) {
    return ok({ message: "Anfrage bereits gesendet." });
  }

  player.teamJoinRequest = team._id;
  await player.save();

  // Team-Admin benachrichtigen (spielergeführtes Team)
  if (team.adminPlayerId) {
    await Player.findByIdAndUpdate(team.adminPlayerId, {
      $push: {
        notifications: {
          type: "join_request",
          fromPlayerId: player._id,
          teamId: team._id,
          teamName: team.teamName,
          teamSlug: team.slug,
          message: `${player.firstName} ${player.lastName} möchte deinem Team beitreten.`,
          read: false,
          createdAt: new Date(),
        },
      },
    });
  }

  return ok({ message: "Beitrittsanfrage gesendet." });
}

export const POST = withErrorHandling(handler);
