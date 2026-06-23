import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/followplayer – einem Spieler folgen/entfolgen (Toggle).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const targetId = body.targetId;
  if (!targetId) {
    return fail("Kein Spieler angegeben", 400);
  }
  if (String(targetId) === String(me._id)) {
    return fail("Du kannst dir nicht selbst folgen", 400);
  }

  await connectDB();
  const target = await Player.findById(targetId).select("followers firstName lastName");
  if (!target) {
    return fail("Spieler nicht gefunden", 404);
  }

  const isFollowing = (me.following || []).some((id) => String(id) === String(targetId));

  if (isFollowing) {
    await Player.updateOne({ _id: me._id }, { $pull: { following: targetId } });
    await Player.updateOne({ _id: targetId }, { $pull: { followers: me._id } });
  } else {
    await Player.updateOne({ _id: me._id }, { $addToSet: { following: targetId } });
    await Player.updateOne(
      { _id: targetId },
      {
        $addToSet: { followers: me._id },
        $push: {
          notifications: {
            type: "follow",
            fromPlayerId: me._id,
            message: `${me.firstName} ${me.lastName} folgt dir jetzt.`,
            read: false,
            createdAt: new Date(),
          },
        },
      }
    );
  }

  const updated = await Player.findById(targetId).select("followers");
  return ok({
    following: !isFollowing,
    followersCount: updated.followers.length,
  });
}

export const POST = withErrorHandling(handler);
