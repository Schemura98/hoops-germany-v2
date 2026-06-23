import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/topscorer – Topscorer-Tabelle (Aggregation über alle playerStats).
async function handler() {
  await connectDB();

  const scorers = await Match.aggregate([
    { $match: { status: "completed" } },
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

  return ok({ scorers });
}

export const POST = withErrorHandling(handler);
