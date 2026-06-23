import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/posts/feed – neueste Beiträge (öffentlicher Community-Feed).
async function handler() {
  await connectDB();
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage");

  return ok({ posts });
}

export const POST = withErrorHandling(handler);
