import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { notifyCommentReply } from "@/lib/notifyEngagement";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/addreply – Antwort auf einen Kommentar hinzufügen (Spieler-Auth).
// Body: { token, postId, commentId, text }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const text = body.text?.trim();
  if (!text) {
    return fail("Die Antwort darf nicht leer sein", 400);
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

  comment.replies.push({ player: player._id, text, likes: [], createdAt: new Date() });
  await post.save();

  // Kommentar-Autor über die Antwort benachrichtigen.
  await notifyCommentReply({ recipientId: comment.player, actor: player, postId: post._id });

  const r = comment.replies[comment.replies.length - 1];
  return ok({
    reply: {
      _id: r._id,
      text: r.text,
      likes: [],
      createdAt: r.createdAt,
      player: {
        _id: player._id,
        firstName: player.firstName,
        lastName: player.lastName,
        slug: player.slug,
        profileImage: player.profileImage,
      },
    },
  });
}

export const POST = withErrorHandling(handler);
