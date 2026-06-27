import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/match-audit – Änderungsverlauf eines Spiels (Super-Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.matchId) return fail("matchId fehlt", 400);

  await connectDB();
  const audit = await AuditLog.find({ entityId: body.matchId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return ok({ audit });
}

export const POST = withErrorHandling(handler);
