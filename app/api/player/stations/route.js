import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Team from "@/models/Team";
import Player from "@/models/Player";
import TransferEvent from "@/models/TransferEvent";
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
      teamId: r._id.team ? String(r._id.team) : null,
      leagueId: r._id.league ? String(r._id.league) : null,
      // Ziel für den Liga-Verweis im Profil. Hier identisch mit `leagueId` –
      // getrennt geführt, weil `leagueId` unten bei reinen Zugehörigkeiten
      // bewusst null bleibt (keine gespielten Liga-Partien), die Liga aber
      // trotzdem angezeigt und damit auch verlinkt werden soll.
      leagueLinkId: r._id.league ? String(r._id.league) : null,
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
      lastDate: r.lastDate || null,
    };
  });

  // Team-Zugehörigkeiten OHNE Spiele ergänzen (Gründung/Beitritt zählt zur
  // Karriere, auch wenn noch kein Spiel gespielt wurde). Quelle: TransferEvents
  // (toTeam) + aktuelles Team. Nur Teams, die nicht schon über Spiele auftauchen.
  const coveredTeamIds = new Set(stations.map((s) => s.teamId).filter(Boolean));

  const [player, events] = await Promise.all([
    Player.findById(pid).select("teamId"),
    TransferEvent.find({ player: pid, toTeam: { $ne: null } })
      .select("toTeam createdAt")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  // teamId → frühestes Zugehörigkeitsdatum
  const affiliation = new Map();
  for (const e of events) {
    const tid = String(e.toTeam);
    if (!affiliation.has(tid)) affiliation.set(tid, e.createdAt || null);
  }
  if (player?.teamId) {
    const tid = String(player.teamId);
    if (!affiliation.has(tid)) affiliation.set(tid, null); // aktuelles Team ohne Event
  }

  const missingIds = [...affiliation.keys()].filter((tid) => !coveredTeamIds.has(tid));
  if (missingIds.length) {
    // Liga des Teams mitladen, damit Saison/Liga auch ohne Spiele angezeigt werden.
    const teams = await Team.find({ _id: { $in: missingIds } })
      .select("teamName slug logo leagueId")
      .populate("leagueId", "name season")
      .lean();
    for (const t of teams) {
      stations.push({
        teamId: String(t._id),
        leagueId: null, // keine gespielten Liga-Partien (nur Zugehörigkeit)
        leagueLinkId: t.leagueId?._id ? String(t.leagueId._id) : null,
        teamName: t.teamName || "Unbekanntes Team",
        teamSlug: t.slug || null,
        teamLogo: t.logo || null,
        leagueName: t.leagueId?.name || "", // aktuelle Liga des Teams (Anzeige)
        season: t.leagueId?.season || "",
        games: 0,
        points: 0,
        assists: 0,
        rebounds: 0,
        ppg: 0,
        apg: 0,
        rpg: 0,
        lastDate: affiliation.get(String(t._id)) || null,
        affiliationOnly: true,
      });
    }
    // Nach Datum neu sortieren (neueste zuerst); Einträge ohne Datum ans Ende.
    stations.sort((a, b) => {
      const da = a.lastDate ? new Date(a.lastDate).getTime() : 0;
      const db = b.lastDate ? new Date(b.lastDate).getTime() : 0;
      return db - da;
    });
  }

  return ok({ stations });
}

export const POST = withErrorHandling(handler);
