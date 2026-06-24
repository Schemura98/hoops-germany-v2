import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import "@/models/Team";
import { teamScores } from "@/lib/matchScore";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/station-matches – Einzelspiele eines Spielers in einer
// Station (Team + Liga). Liefert je Spiel Gegner, Endstand, eigene Stats, W/L.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const { playerId, teamId, leagueId } = body;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }
  if (!teamId || !mongoose.isValidObjectId(teamId)) {
    return fail("Ungültige Team-ID", 400);
  }

  await connectDB();
  const pid = new mongoose.Types.ObjectId(playerId);
  const tid = new mongoose.Types.ObjectId(teamId);

  const query = {
    status: "completed",
    playerStats: { $elemMatch: { player: pid, team: tid } },
  };
  if (leagueId && mongoose.isValidObjectId(leagueId)) {
    query.leagueId = new mongoose.Types.ObjectId(leagueId);
  } else {
    // Station ohne Liga = Freundschaftsspiele
    query.leagueId = { $in: [null, undefined] };
  }

  const matches = await Match.find(query)
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .sort({ date: -1 })
    .lean();

  const games = matches.map((m) => {
    const stat =
      (m.playerStats || []).find(
        (s) => String(s.player) === String(pid) && String(s.team) === String(tid)
      ) || {};
    const aId = String(m.teamA?._id || m.teamA);
    const isA = aId === String(tid);
    const opponent = isA ? m.teamB : m.teamA;
    const scores = teamScores(m); // { a, b } oder null
    const own = scores ? (isA ? scores.a : scores.b) : null;
    const opp = scores ? (isA ? scores.b : scores.a) : null;
    let result = null;
    if (own != null && opp != null) {
      result = own > opp ? "W" : own < opp ? "L" : "D";
    }
    return {
      matchId: String(m._id),
      date: m.date || null,
      location: m.location || "",
      opponent: opponent
        ? {
            teamName: opponent.teamName || "Unbekannt",
            slug: opponent.slug || null,
            logo: opponent.logo || null,
          }
        : null,
      own,
      opp,
      result,
      points: stat.points || 0,
      assists: stat.assists || 0,
      rebounds: stat.rebounds || 0,
      didNotPlay: !!stat.didNotPlay,
    };
  });

  return ok({ games });
}

export const POST = withErrorHandling(handler);
