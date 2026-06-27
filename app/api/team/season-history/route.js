import { connectDB } from "@/lib/db";
import TeamSeason from "@/models/TeamSeason";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/season-history – eingefrorene Saison-Historie eines Teams. Öffentlich.
// Body: { teamId }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  if (!body.teamId) return fail("teamId fehlt", 400);

  await connectDB();
  const rows = await TeamSeason.find({ teamId: body.teamId })
    .populate("leagueId", "name season level")
    .sort({ season: -1 })
    .lean();

  const history = rows.map((r) => ({
    _id: String(r._id),
    season: r.season || r.leagueId?.season || "",
    leagueName: r.leagueId?.name || "",
    leagueId: r.leagueId?._id ? String(r.leagueId._id) : null,
    placement: r.placement ?? null,
    games: r.games || 0,
    wins: r.wins || 0,
    losses: r.losses || 0,
    pointsFor: r.pointsFor || 0,
    pointsAgainst: r.pointsAgainst || 0,
    diff: r.diff || 0,
    champion: !!r.champion,
    status: r.status || "aktiv",
    finalized: !!r.finalized,
  }));

  return ok({ history });
}

export const POST = withErrorHandling(handler);
