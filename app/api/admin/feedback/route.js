import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

async function requireAdmin(req, body) {
  return getAdminFromToken(getTokenFromRequest(req, body.token));
}

// POST /api/admin/feedback – Feedback-Liste (Admin).
async function list(req) {
  const body = await req.json().catch(() => ({}));
  if (!(await requireAdmin(req, body))) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const feedback = await Feedback.find({}).sort({ createdAt: -1 });
  return ok({ feedback });
}

// PATCH /api/admin/feedback – Status setzen (new/read).
async function patch(req) {
  const body = await req.json().catch(() => ({}));
  if (!(await requireAdmin(req, body))) return fail("Nicht authentifiziert", 401);

  if (!["new", "read"].includes(body.status)) {
    return fail("Ungültiger Status", 400);
  }

  await connectDB();
  const fb = await Feedback.findByIdAndUpdate(
    body.feedbackId,
    { $set: { status: body.status } },
    { new: true }
  );
  if (!fb) return fail("Feedback nicht gefunden", 404);

  return ok({ feedback: fb });
}

export const POST = withErrorHandling(list);
export const PATCH = withErrorHandling(patch);
