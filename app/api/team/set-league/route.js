import mongoose from "mongoose";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import League from "@/models/League";
import { getTeamForCapability, getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-league – Liga des Teams DIREKT setzen/wechseln/entfernen (Dual-Auth).
// Pflegt League.teams auf beiden Seiten (alte Liga $pull, neue Liga $addToSet).
// ⚠️ Direktänderung ist nur erlaubt beim ENTFERNEN, bei DEMO-/Test-Ligen (official:false)
// oder wenn der Aufrufende zusätzlich Super-Admin ist. Für offizielle Ligen müssen
// Team-Admins stattdessen eine Anfrage stellen (/api/team/request-league-change) –
// die Zuordnung wirkt sich auf Tabelle/Spielplan/Statistiken/Saisonhistorie aus.
// Weiterhin nützlich für Super-Admin-Korrekturen u. a. nach dem Season-Rollover.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "einstellungen");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();

  // Zielliga bestimmen ("" / null = Liga entfernen).
  let newId = null;
  let targetLeague = null;
  if (body.leagueId) {
    if (!mongoose.isValidObjectId(body.leagueId)) {
      return fail("Ungültige Liga-ID", 400);
    }
    targetLeague = await League.findById(body.leagueId).select("_id official");
    if (!targetLeague) return fail("Liga nicht gefunden", 404);
    newId = targetLeague._id;
  }

  if (newId && targetLeague.official) {
    const admin = await getAdminFromToken(token);
    if (!admin) {
      return fail(
        "Offizielle Liga-Zuordnungen können nicht mehr direkt gespeichert werden – bitte über „Ligazuordnung anfragen\" beantragen.",
        403
      );
    }
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
