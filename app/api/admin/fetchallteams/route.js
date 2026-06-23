import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/fetchallteams – alle Teams (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const teams = await Team.find({})
    .select("teamName email slug region createdAt")
    .sort({ createdAt: -1 });

  return ok({ teams });
}

export const POST = withErrorHandling(handler);
