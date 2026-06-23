import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/updatematch – Spielstatus/Ergebnis als Admin setzen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) return fail("Spiel nicht gefunden", 404);

  const status = body.status;

  if (status === "cancelled") {
    match.status = "cancelled";
  } else if (status === "scheduled") {
    // Zurücksetzen auf geplant – Ergebnis verwerfen
    match.status = "scheduled";
    match.resultStatus = "pending";
    match.winningTeam = undefined;
    match.winningTeamPoints = undefined;
    match.losingTeamPoints = undefined;
    match.teamAResult = undefined;
    match.teamBResult = undefined;
  } else {
    // Ergebnis setzen (completed)
    const a = parseInt(body.teamAPoints, 10);
    const b = parseInt(body.teamBPoints, 10);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a < 0 || b < 0) {
      return fail("Bitte gültige Punktzahlen angeben", 400);
    }

    const now = new Date();
    match.teamAResult = { ownPoints: a, opponentPoints: b, submittedAt: now };
    match.teamBResult = { ownPoints: b, opponentPoints: a, submittedAt: now };
    match.status = "completed";
    match.resultStatus = "confirmed";

    if (a === b) {
      match.winningTeam = undefined;
      match.winningTeamPoints = a;
      match.losingTeamPoints = b;
    } else {
      match.winningTeam = a > b ? match.teamA : match.teamB;
      match.winningTeamPoints = Math.max(a, b);
      match.losingTeamPoints = Math.min(a, b);
    }
  }

  await match.save();
  return ok({ message: "Spiel aktualisiert" });
}

export const POST = withErrorHandling(handler);
