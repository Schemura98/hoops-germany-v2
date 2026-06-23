import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const round1 = (n) => Math.round(n * 10) / 10;

// POST /api/player/careerstats – aggregierte Karriere-Statistik eines Spielers.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();

  const result = await Match.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$playerStats" },
    {
      $match: {
        "playerStats.player": new mongoose.Types.ObjectId(playerId),
        "playerStats.didNotPlay": { $ne: true },
      },
    },
    {
      $group: {
        _id: null,
        games: { $sum: 1 },
        points: { $sum: { $ifNull: ["$playerStats.points", 0] } },
        assists: { $sum: { $ifNull: ["$playerStats.assists", 0] } },
        rebounds: { $sum: { $ifNull: ["$playerStats.rebounds", 0] } },
      },
    },
  ]);

  const agg = result[0] || { games: 0, points: 0, assists: 0, rebounds: 0 };
  const g = agg.games || 0;

  return ok({
    stats: {
      games: g,
      points: agg.points,
      assists: agg.assists,
      rebounds: agg.rebounds,
      ppg: g ? round1(agg.points / g) : 0,
      apg: g ? round1(agg.assists / g) : 0,
      rpg: g ? round1(agg.rebounds / g) : 0,
    },
  });
}

export const POST = withErrorHandling(handler);
