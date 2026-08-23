import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import "@/models/Team";
import "@/models/League";
import { teamScores } from "@/lib/matchScore";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/last-match – das jüngste abgeschlossene Spiel, in dessen
// Box-Score DIESER Spieler steht, samt seiner eigenen Werte (Ronja M1,
// 23.08.2026: Gegenstück zur Nächstes-Spiel-Karte).
//
// Bewusst über den BOX-SCORE gesucht, nicht über den aktuellen Verein:
// Die eigene Zahl gehört zum Spiel, in dem sie erzielt wurde – nach einem
// Vereinswechsel wäre „letztes Spiel meines heutigen Vereins" ein Spiel, in
// dem dieser Spieler womöglich nie stand. Ohne Box-Score-Eintrag gibt es
// keine Karte (dann trägt die Nächstes-Spiel-Karte allein).
//
// Öffentlich wie next-match: Der Box-Score steht so oder so auf /match/[id].
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();

  const match = await Match.findOne({
    status: "completed",
    playerStats: { $elemMatch: { player: playerId, didNotPlay: { $ne: true } } },
  })
    .select(
      "teamA teamB date location leagueId stage playoffRound status winningTeam winningTeamPoints losingTeamPoints playerStats"
    )
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .populate("leagueId", "name season")
    .sort({ date: -1 })
    .lean();

  if (!match) return ok({ lastMatch: null });

  const eintrag = (match.playerStats || []).find(
    (s) => String(s.player) === String(playerId) && !s.didNotPlay
  );
  const meineTeamId = eintrag ? String(eintrag.team) : null;
  const score = teamScores(match);
  const binA = meineTeamId && String(match.teamA?._id) === meineTeamId;

  // Antwort klein und vorgerechnet halten: eigene Seite zuerst, Gegner dazu –
  // die Oberfläche soll keine Sieger/Verlierer-Arithmetik wiederholen müssen
  // (genau daran ist der Admin-Spielplan bis zum 23.08. gescheitert).
  return ok({
    lastMatch: {
      matchId: String(match._id),
      date: match.date,
      leagueName: match.leagueId?.name || "",
      stage: match.stage || "",
      playoffRound: match.playoffRound || "",
      gegner: binA ? match.teamB : match.teamA,
      eigenePunkte: score ? (binA ? score.a : score.b) : null,
      gegnerPunkte: score ? (binA ? score.b : score.a) : null,
      // Kein Kürzel bei unbekanntem Sieger (Unentschieden-Randfall aus
      // updatematch – dieselbe Schranke wie im Admin-Spielplan).
      gewonnen: match.winningTeam ? String(match.winningTeam) === meineTeamId : null,
      werte: eintrag
        ? {
            points: eintrag.points || 0,
            assists: eintrag.assists || 0,
            rebounds: eintrag.rebounds || 0,
          }
        : null,
    },
  });
}

export const POST = withErrorHandling(handler);
