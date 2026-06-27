import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/single – einzelnen Beitrag (Permalink) laden. Öffentlich.
// Body: { postId }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const postId = body.postId;
  if (!postId) {
    return fail("postId fehlt", 400);
  }

  await connectDB();
  const post = await Post.findById(postId)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage");

  if (!post) {
    return fail("Beitrag nicht gefunden", 404);
  }

  return ok({ post });
}

export const POST = withErrorHandling(handler);
