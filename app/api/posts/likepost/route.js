import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { notifyPostLike } from "@/lib/notifyEngagement";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/likepost – Like togglen (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  await connectDB();
  const post = await Post.findById(body.postId);
  if (!post) {
    return fail("Beitrag nicht gefunden", 404);
  }

  const pid = String(player._id);
  const idx = post.likes.findIndex((l) => String(l) === pid);
  let liked;
  if (idx >= 0) {
    post.likes.splice(idx, 1);
    liked = false;
  } else {
    post.likes.push(player._id);
    liked = true;
  }
  await post.save();

  // Beim Liken (nicht beim Entfernen) den Beitrags-Autor benachrichtigen.
  if (liked) {
    await notifyPostLike({ recipientId: post.player, actor: player, postId: post._id });
  }

  return ok({ liked, likeCount: post.likes.length });
}

export const POST = withErrorHandling(handler);
