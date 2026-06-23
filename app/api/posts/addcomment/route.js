import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getPlayerFromToken } from "@/lib/serverAuth";
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

  post.comments.push({ player: player._id, text, createdAt: new Date() });
  await post.save();

  const c = post.comments[post.comments.length - 1];
  return ok({
    comment: {
      _id: c._id,
      text: c.text,
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
