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
    // Pro Spieler UND Team (= Team zum Zeitpunkt des Spiels) summieren.
    {
      $group: {
        _id: { player: "$playerStats.player", team: "$playerStats.team" },
        games: { $sum: 1 },
        points: { $sum: { $ifNull: ["$playerStats.points", 0] } },
        assists: { $sum: { $ifNull: ["$playerStats.assists", 0] } },
        rebounds: { $sum: { $ifNull: ["$playerStats.rebounds", 0] } },
      },
    },
    // Nach Punkten sortieren, damit $first unten das punktreichste Team trifft.
    { $sort: { points: -1 } },
    // Pro Spieler gesamt aufsummieren; Label-Team = wo die meisten Punkte erzielt wurden.
    {
      $group: {
        _id: "$_id.player",
        games: { $sum: "$games" },
        points: { $sum: "$points" },
        assists: { $sum: "$assists" },
        rebounds: { $sum: "$rebounds" },
        primaryTeam: { $first: "$_id.team" },
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
    // Team, für das die Punkte erzielt wurden (nicht das aktuelle Team).
    {
      $lookup: {
        from: "teams",
        localField: "primaryTeam",
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
        isDemo: { $ifNull: ["$player.isDemo", false] },
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
