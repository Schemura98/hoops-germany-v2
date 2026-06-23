import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import "@/models/Team";
import "@/models/League";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const round1 = (n) => Math.round(n * 10) / 10;

// POST /api/player/stations – Spielerstationen: Stats gruppiert nach Team + Liga.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();
  const pid = new mongoose.Types.ObjectId(playerId);

  const rows = await Match.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$playerStats" },
    {
      $match: {
        "playerStats.player": pid,
        "playerStats.didNotPlay": { $ne: true },
      },
    },
    {
      $group: {
        _id: { team: "$playerStats.team", league: "$leagueId" },
        games: { $sum: 1 },
        points: { $sum: { $ifNull: ["$playerStats.points", 0] } },
        assists: { $sum: { $ifNull: ["$playerStats.assists", 0] } },
        rebounds: { $sum: { $ifNull: ["$playerStats.rebounds", 0] } },
        lastDate: { $max: "$date" },
      },
    },
    { $lookup: { from: "teams", localField: "_id.team", foreignField: "_id", as: "team" } },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "leagues", localField: "_id.league", foreignField: "_id", as: "league" } },
    { $unwind: { path: "$league", preserveNullAndEmptyArrays: true } },
    { $sort: { lastDate: -1 } },
  ]);

  const stations = rows.map((r) => {
    const g = r.games || 0;
    return {
      teamName: r.team?.teamName || "Unbekanntes Team",
      teamSlug: r.team?.slug || null,
      teamLogo: r.team?.logo || null,
      leagueName: r.league?.name || "Freundschaftsspiele",
      season: r.league?.season || "",
      games: g,
      points: r.points,
      assists: r.assists,
      rebounds: r.rebounds,
      ppg: g ? round1(r.points / g) : 0,
      apg: g ? round1(r.assists / g) : 0,
      rpg: g ? round1(r.rebounds / g) : 0,
    };
  });

  return ok({ stations });
}

export const POST = withErrorHandling(handler);
