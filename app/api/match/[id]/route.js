import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
// Referenzierte Modelle importieren, damit populate sie registriert findet
// (sonst MissingSchemaError, wenn keine andere Route sie vorher geladen hat).
import "@/models/Team";
import "@/models/League";
import "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// GET /api/match/[id] – Spiel-Detail inkl. Teams, Liga und Spieler-Stats.
async function handler(req, ctx) {
  const id = ctx?.params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return fail("Ungültige Spiel-ID", 400);
  }

  await connectDB();
  const match = await Match.findById(id)
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .populate("leagueId", "name season")
    .populate("mvp", "firstName lastName slug")
    .populate("playerStats.player", "firstName lastName slug");

  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  // Das nächste Spiel einer der beiden Mannschaften. Nach einem Ergebnis ist
  // „und wann wieder?" die zweite Frage – bisher endete die Seite hier.
  const beteiligte = [match.teamA?._id, match.teamB?._id].filter(Boolean);
  let nextMatch = null;
  if (beteiligte.length > 0) {
    nextMatch = await Match.findOne({
      _id: { $ne: match._id },
      status: "scheduled",
      date: { $gte: new Date() },
      $or: [{ teamA: { $in: beteiligte } }, { teamB: { $in: beteiligte } }],
    })
      .select("teamA teamB date location leagueId")
      .populate("teamA", "teamName slug logo")
      .populate("teamB", "teamName slug logo")
      .sort({ date: 1 })
      .lean();
  }

  return ok({ match, nextMatch });
}

export const GET = withErrorHandling(handler);
