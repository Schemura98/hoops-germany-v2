import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getfollowingposts – Feed aus Beiträgen gefolgter Spieler (+ eigene).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const ids = [...(me.following || []), me._id];

  await connectDB();
  const posts = await Post.find({ player: { $in: ids } })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage");

  return ok({ posts });
}

export const POST = withErrorHandling(handler);
