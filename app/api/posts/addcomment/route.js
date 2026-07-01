import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { notifyPostComment, notifyMentions } from "@/lib/notifyEngagement";
import { resolveMentions } from "@/lib/postParse";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/addcomment – Kommentar hinzufügen (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const text = body.text?.trim();
  if (!text) {
    return fail("Der Kommentar darf nicht leer sein", 400);
  }

  await connectDB();
  const post = await Post.findById(body.postId);
  if (!post) {
    return fail("Beitrag nicht gefunden", 404);
  }

  const mentions = await resolveMentions(text);
  post.comments.push({ player: player._id, text, mentions, createdAt: new Date() });
  await post.save();

  // Beitrags-Autor über den neuen Kommentar benachrichtigen.
  await notifyPostComment({ recipientId: post.player, actor: player, postId: post._id });

  // Im Kommentar erwähnte Spieler benachrichtigen.
  await notifyMentions({
    recipientIds: mentions.map((m) => m.playerId),
    actorId: player._id,
    authorName: `${player.firstName || ""} ${player.lastName || ""}`.trim(),
    postId: post._id,
    context: "einem Kommentar",
  });

  const c = post.comments[post.comments.length - 1];
  return ok({
    comment: {
      _id: c._id,
      text: c.text,
      likes: [],
      replies: [],
      mentions: c.mentions,
      createdAt: c.createdAt,
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
