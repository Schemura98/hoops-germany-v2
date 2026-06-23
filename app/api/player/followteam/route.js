import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/followteam – einem Team folgen/entfolgen (Toggle).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const teamId = body.teamId;
  if (!teamId) {
    return fail("Kein Team angegeben", 400);
  }

  await connectDB();
  const team = await Team.findById(teamId).select("followers");
  if (!team) {
    return fail("Team nicht gefunden", 404);
  }

  const isFollowing = (me.followingTeams || []).some(
    (id) => String(id) === String(teamId)
  );

  if (isFollowing) {
    await Player.updateOne({ _id: me._id }, { $pull: { followingTeams: teamId } });
    await Team.updateOne({ _id: teamId }, { $pull: { followers: me._id } });
  } else {
    await Player.updateOne({ _id: me._id }, { $addToSet: { followingTeams: teamId } });
    await Team.updateOne({ _id: teamId }, { $addToSet: { followers: me._id } });
  }

  const updated = await Team.findById(teamId).select("followers");
  return ok({
    following: !isFollowing,
    followersCount: updated.followers.length,
  });
}

export const POST = withErrorHandling(handler);
