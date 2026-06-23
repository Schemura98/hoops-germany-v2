import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/likecomment – Like auf einem Kommentar oder einer Antwort togglen.
// Body: { token, postId, commentId, replyId? }
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

  const comment = post.comments.id(body.commentId);
  if (!comment) {
    return fail("Kommentar nicht gefunden", 404);
  }

  // Ziel ist entweder der Kommentar selbst oder eine seiner Antworten.
  const target = body.replyId ? comment.replies.id(body.replyId) : comment;
  if (!target) {
    return fail("Antwort nicht gefunden", 404);
  }

  const pid = String(player._id);
  const idx = target.likes.findIndex((l) => String(l) === pid);
  let liked;
  if (idx >= 0) {
    target.likes.splice(idx, 1);
    liked = false;
  } else {
    target.likes.push(player._id);
    liked = true;
  }
  await post.save();

  return ok({ liked, likeCount: target.likes.length });
}

export const POST = withErrorHandling(handler);
