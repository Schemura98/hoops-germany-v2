import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import League from "@/models/League";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-league – Liga des Teams setzen/wechseln/entfernen (Dual-Auth).
// Pflegt League.teams auf beiden Seiten (alte Liga $pull, neue Liga $addToSet).
// Nützlich u. a. nach dem Season-Rollover (Teams ordnen sich der neuen Saison zu).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();

  // Zielliga bestimmen ("" / null = Liga entfernen).
  let newId = null;
  if (body.leagueId) {
    if (!mongoose.isValidObjectId(body.leagueId)) {
      return fail("Ungültige Liga-ID", 400);
    }
    const league = await League.findById(body.leagueId).select("_id");
    if (!league) return fail("Liga nicht gefunden", 404);
    newId = league._id;
  }

  const current = await Team.findById(team._id).select("leagueId");
  const oldId = current?.leagueId || null;

  if (String(oldId || "") === String(newId || "")) {
    return ok({ leagueId: newId ? String(newId) : "", unchanged: true });
  }

  await Team.findByIdAndUpdate(team._id, { $set: { leagueId: newId } });

  if (oldId) {
    await League.findByIdAndUpdate(oldId, { $pull: { teams: team._id } });
  }
  if (newId) {
    await League.findByIdAndUpdate(newId, { $addToSet: { teams: team._id } });
  }

  return ok({ leagueId: newId ? String(newId) : "" });
}

export const POST = withErrorHandling(handler);
