import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const LIMIT = 20;

// POST /api/posts/by-tag – Beiträge mit einem Hashtag (chronologisch, paginiert).
// Body: { tag, before? }. Öffentlich.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const tag = String(body.tag || "")
    .toLowerCase()
    .replace(/^#/, "")
    .trim();
  if (!tag) {
    return fail("Kein Hashtag angegeben", 400);
  }

  await connectDB();
  const query = { hashtags: tag };
  if (body.before) {
    const d = new Date(body.before);
    if (!Number.isNaN(d.getTime())) query.createdAt = { $lt: d };
  }

  const fetched = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(LIMIT + 1)
    .populate("player", "firstName lastName slug profileImage")
    .populate("authorTeam", "teamName slug logo")
    .populate("comments.player", "firstName lastName slug profileImage")
    .populate("comments.replies.player", "firstName lastName slug profileImage");

  const hasMore = fetched.length > LIMIT;
  const posts = hasMore ? fetched.slice(0, LIMIT) : fetched;

  return ok({ posts, hasMore, tag });
}

export const POST = withErrorHandling(handler);
