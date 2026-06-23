import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Match from "@/models/Match";
import League from "@/models/League";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/matches/create – Spiel eintragen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const { opponentId, date, location } = body;
  if (!opponentId) {
    return fail("Bitte einen Gegner auswählen", 400);
  }
  if (String(opponentId) === String(team._id)) {
    return fail("Das Team kann nicht gegen sich selbst spielen", 400);
  }
  if (!date) {
    return fail("Bitte ein Datum angeben", 400);
  }
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return fail("Ungültiges Datum", 400);
  }

  await connectDB();

  const opponentExists = await Team.exists({ _id: opponentId });
  if (!opponentExists) {
    return fail("Gegner-Team nicht gefunden", 404);
  }

  // Optionale Liga-Zuordnung
  let leagueId = null;
  if (body.leagueId && mongoose.isValidObjectId(body.leagueId)) {
    const league = await League.findById(body.leagueId);
    if (league) leagueId = league._id;
  }

  const match = await Match.create({
    teamA: team._id,
    teamB: opponentId,
    date: parsedDate,
    location: location?.trim() || "",
    status: "scheduled",
    leagueId,
  });

  // Beide Teams der Liga hinzufügen und Spiel verknüpfen
  if (leagueId) {
    await League.findByIdAndUpdate(leagueId, {
      $addToSet: { teams: { $each: [team._id, opponentId] } },
      $push: { matches: match._id },
    });
  }

  return ok({ match }, 201);
}

export const POST = withErrorHandling(handler);
