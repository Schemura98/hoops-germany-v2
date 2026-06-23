import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/submit-match-result – Ergebnis einreichen + Abgleich (Dual-Auth).
// Jedes Team meldet eigene + gegnerische Punkte. Stimmen beide Meldungen überein,
// wird das Spiel bestätigt; sonst Status "mismatch".
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const decoded = verifyToken(token);
  const submitterId = decoded?.id || decoded?.playerId || null;

  const ownPoints = parseInt(body.ownPoints, 10);
  const opponentPoints = parseInt(body.opponentPoints, 10);
  if (!Number.isFinite(ownPoints) || !Number.isFinite(opponentPoints) || ownPoints < 0 || opponentPoints < 0) {
    return fail("Bitte gültige Punktzahlen angeben", 400);
  }

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  const isA = String(match.teamA) === String(team._id);
  const isB = String(match.teamB) === String(team._id);
  if (!isA && !isB) {
    return fail("Keine Berechtigung für dieses Spiel", 403);
  }
  if (match.status === "cancelled") {
    return fail("Dieses Spiel wurde abgesagt", 400);
  }
  if (match.resultStatus === "confirmed") {
    return fail("Das Ergebnis ist bereits bestätigt", 409);
  }

  const submission = {
    ownPoints,
    opponentPoints,
    submittedBy: submitterId,
    submittedAt: new Date(),
  };
  if (isA) match.teamAResult = submission;
  else match.teamBResult = submission;

  // Abgleich, sobald beide Teams gemeldet haben
  const a = match.teamAResult;
  const b = match.teamBResult;
  const bothSubmitted =
    a && b && a.ownPoints != null && b.ownPoints != null;

  if (bothSubmitted) {
    const consistent =
      a.ownPoints === b.opponentPoints && a.opponentPoints === b.ownPoints;

    if (consistent) {
      match.resultStatus = "confirmed";
      match.status = "completed";

      const aPts = a.ownPoints;
      const bPts = a.opponentPoints;
      if (aPts === bPts) {
        match.winningTeam = undefined;
        match.winningTeamPoints = aPts;
        match.losingTeamPoints = bPts;
      } else {
        match.winningTeam = aPts > bPts ? match.teamA : match.teamB;
        match.winningTeamPoints = Math.max(aPts, bPts);
        match.losingTeamPoints = Math.min(aPts, bPts);
      }
    } else {
      match.resultStatus = "mismatch";
    }
  } else {
    match.resultStatus = "pending";
  }

  await match.save();

  return ok({
    resultStatus: match.resultStatus,
    message:
      match.resultStatus === "confirmed"
        ? "Ergebnis bestätigt – beide Angaben stimmen überein."
        : match.resultStatus === "mismatch"
        ? "Die Angaben widersprechen sich. Bitte abstimmen und erneut einreichen."
        : "Ergebnis eingereicht – warte auf die Bestätigung des Gegners.",
  });
}

export const POST = withErrorHandling(handler);
