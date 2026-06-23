import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit (nicht beim Build statisch auswerten).
export const dynamic = "force-dynamic";

// GET /api/matches/public – öffentliche Spielübersicht.
async function handler() {
  await connectDB();
  const matches = await Match.find({ status: { $ne: "cancelled" } })
    .select(
      "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints resultStatus teamAResult teamBResult"
    )
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .sort({ date: -1 });

  return ok({ matches });
}

export const GET = withErrorHandling(handler);
