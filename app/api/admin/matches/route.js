import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/matches – alle Spiele (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const matches = await Match.find({})
    .select("teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints resultStatus")
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .sort({ date: -1 });

  return ok({ matches });
}

export const POST = withErrorHandling(handler);
