import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import Player from "@/models/Player";
import "@/models/Team";
import "@/models/League";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/next-match – die nächste angesetzte Partie des Vereins,
// dem dieser Spieler aktuell angehört.
//
// Warum eigener Endpunkt und nicht ein Feld an `fetchsingleplayerinfo`:
// Das Profil lädt Karriere-Zahlen und Stationen ohnehin schon parallel nach
// (siehe PlayerProfileView) – ein dritter Aufruf reiht sich dort ein, ohne die
// Erstanzeige des Profils zu verzögern. Ausserdem ist die Antwort bewusst klein
// und öffentlich: Spielansetzungen stehen so oder so auf /spiele.
//
// Absichtlich NICHT geliefert: irgendeine Aussage darüber, ob dieser Spieler
// auflaufen wird. Angesetzt ist die Partie des Vereins – mehr weiss die
// Datenbank nicht, und mehr darf die Oberfläche nicht behaupten.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const playerId = body.playerId;
  if (!playerId || !mongoose.isValidObjectId(playerId)) {
    return fail("Ungültige Spieler-ID", 400);
  }

  await connectDB();

  const player = await Player.findById(playerId).select("teamId").lean();
  const teamId = player?.teamId ? String(player.teamId) : null;
  // Vereinslos: kein nächstes Spiel. Kein Fehler – ein normaler Zustand.
  if (!teamId) return ok({ nextMatch: null, teamId: null });

  const nextMatch = await Match.findOne({
    status: "scheduled",
    date: { $gte: new Date() },
    $or: [{ teamA: teamId }, { teamB: teamId }],
  })
    .select("teamA teamB date location leagueId stage playoffRound")
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .populate("leagueId", "name season")
    .sort({ date: 1 })
    .lean();

  return ok({ nextMatch: nextMatch || null, teamId });
}

export const POST = withErrorHandling(handler);
