import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit.
export const dynamic = "force-dynamic";

// POST /api/player/my-matches – Spiele des eigenen Teams + gefolgter Teams.
// Liefert alle relevanten Partien (Anstehend + Ergebnisse); die Aufteilung
// und der Bereichs-Filter (Mein Team / Gefolgte) passieren im Widget.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Bitte zuerst anmelden", 401);
  }

  const myTeamId = player.teamId ? String(player.teamId) : null;
  const followedTeamIds = (player.followingTeams || []).map(String);
  const allIds = [...new Set([myTeamId, ...followedTeamIds].filter(Boolean))];

  let matches = [];
  if (allIds.length) {
    await connectDB();
    matches = await Match.find({
      status: { $ne: "cancelled" },
      $or: [{ teamA: { $in: allIds } }, { teamB: { $in: allIds } }],
    })
      .select(
        "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints resultStatus teamAResult teamBResult"
      )
      .populate("teamA", "teamName slug logo")
      .populate("teamB", "teamName slug logo")
      .sort({ date: -1 })
      .lean();
  }

  return ok({ matches, myTeamId, followedTeamIds });
}

export const POST = withErrorHandling(handler);
