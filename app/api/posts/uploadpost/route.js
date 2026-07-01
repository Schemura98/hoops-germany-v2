import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { extractHashtags, resolveMentions } from "@/lib/postParse";
import { detectEmbed, enrichEmbed } from "@/lib/linkEmbed";
import { notifyMentions } from "@/lib/notifyEngagement";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/uploadpost – Beitrag erstellen (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const content = body.content?.trim() || "";
  const image = body.image?.trim() || "";
  if (!content && !image) {
    return fail("Der Beitrag darf nicht leer sein", 400);
  }

  await connectDB();
  const hashtags = extractHashtags(content);
  const mentions = await resolveMentions(content);
  const embed = await enrichEmbed(detectEmbed(content));
  const post = await Post.create({
    player: player._id,
    content,
    image,
    hashtags,
    mentions,
    embed,
    likes: [],
    comments: [],
  });
  await post.populate("player", "firstName lastName slug profileImage");

  // Erwähnte Spieler benachrichtigen.
  await notifyMentions({
    recipientIds: mentions.map((m) => m.playerId),
    actorId: player._id,
    authorName: `${player.firstName || ""} ${player.lastName || ""}`.trim(),
    postId: post._id,
  });

  return ok({ post }, 201);
}

export const POST = withErrorHandling(handler);
