import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import League from "@/models/League";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/topscorer – Topscorer-Tabelle (Aggregation über playerStats).
// Optional body.season → nur Spiele der Ligen dieser Saison. Liefert zusätzlich
// `seasons` (alle vorhandenen Saisons, neueste zuerst) für den Filter.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const season = typeof body.season === "string" ? body.season.trim() : "";

  await connectDB();

  const seasons = (await League.distinct("season")).filter(Boolean).sort().reverse();

  const matchStage = { status: "completed" };
  if (season) {
    const ids = (await League.find({ season }).select("_id").lean()).map((l) => l._id);
    matchStage.leagueId = { $in: ids };
  }

  const scorers = await Match.aggregate([
    { $match: matchStage },
    { $unwind: "$playerStats" },
    {
      $match: {
        "playerStats.player": { $ne: null },
        "playerStats.didNotPlay": { $ne: true },
      },
    },
    {
      $group: {
        _id: "$playerStats.player",
        games: { $sum: 1 },
        points: { $sum: { $ifNull: ["$playerStats.points", 0] } },
        assists: { $sum: { $ifNull: ["$playerStats.assists", 0] } },
        rebounds: { $sum: { $ifNull: ["$playerStats.rebounds", 0] } },
      },
    },
    // Spielerinfos
    {
      $lookup: {
        from: "players",
        localField: "_id",
        foreignField: "_id",
        as: "player",
      },
    },
    { $unwind: "$player" },
    // Team des Spielers
    {
      $lookup: {
        from: "teams",
        localField: "player.teamId",
        foreignField: "_id",
        as: "team",
      },
    },
    { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        playerId: "$_id",
        firstName: "$player.firstName",
        lastName: "$player.lastName",
        slug: "$player.slug",
        position: "$player.position",
        teamName: "$team.teamName",
        teamSlug: "$team.slug",
        games: 1,
        points: 1,
        assists: 1,
        rebounds: 1,
        ppg: {
          $cond: [{ $gt: ["$games", 0] }, { $divide: ["$points", "$games"] }, 0],
        },
      },
    },
    { $sort: { points: -1, ppg: -1 } },
    { $limit: 100 },
  ]);

  return ok({ scorers, seasons });
}

export const POST = withErrorHandling(handler);
