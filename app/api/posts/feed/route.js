import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { ok, withErrorHandling } from "@/lib/apiResponse";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// POST /api/posts/feed – neueste Beiträge (öffentlicher Community-Feed), paginiert.
// Body: { before?: ISO-Datum, limit?: number }. `before` lädt ältere Beiträge.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Number(body.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  const query = {};
  if (body.before) {
    const d = new Date(body.before);
    if (!Number.isNaN(d.getTime())) query.createdAt = { $lt: d };
  }

  await connectDB();
  // limit + 1 laden, um hasMore zu bestimmen.
  const fetched = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate("player", "firstName lastName slug profileImage")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage");

  const hasMore = fetched.length > limit;
  const posts = hasMore ? fetched.slice(0, limit) : fetched;

  return ok({ posts, hasMore });
}

export const POST = withErrorHandling(handler);
