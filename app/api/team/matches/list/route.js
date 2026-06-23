import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/matches/list – alle Spiele des Teams (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();
  const matches = await Match.find({
    $or: [{ teamA: team._id }, { teamB: team._id }],
  })
    .select(
      "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints resultStatus teamAResult teamBResult playerStats"
    )
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .sort({ date: 1 });

  return ok({ matches, teamId: team._id });
}

export const POST = withErrorHandling(handler);
