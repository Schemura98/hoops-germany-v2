import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
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
    .populate("playerStats.player", "firstName lastName slug");

  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  return ok({ match });
}

export const GET = withErrorHandling(handler);
