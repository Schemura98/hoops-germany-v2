import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deletepost – Beitrag löschen (Admin/Moderation).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.postId) return fail("Beitrags-ID fehlt", 400);

  await connectDB();
  const post = await Post.findByIdAndDelete(body.postId);
  if (!post) return fail("Beitrag nicht gefunden", 404);

  return ok({ message: "Beitrag gelöscht" });
}

export const POST = withErrorHandling(handler);
