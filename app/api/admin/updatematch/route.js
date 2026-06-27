import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { syncMatchResultPost } from "@/lib/autoPost";
import { recordAudit } from "@/lib/audit";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

function snapshot(m) {
  return {
    status: m.status,
    resultStatus: m.resultStatus,
    winningTeamPoints: m.winningTeamPoints,
    losingTeamPoints: m.losingTeamPoints,
  };
}

// POST /api/admin/updatematch – Spielstatus/Ergebnis als Admin setzen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const match = await Match.findById(body.matchId);
  if (!match) return fail("Spiel nicht gefunden", 404);

  const before = snapshot(match);
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

  // Ergebnis-Auto-Post in den Feed legen/aktualisieren (bzw. bei Reset/Absage entfernen).
  await syncMatchResultPost(match);

  // Audit: Super-Admin-Eingriff mit Vorher/Nachher protokollieren.
  const after = snapshot(match);
  const action =
    status === "cancelled"
      ? "admin_cancelled"
      : status === "scheduled"
      ? "admin_result_reset"
      : "admin_result_set";
  const actorName =
    `${admin.firstName || ""} ${admin.lastName || ""}`.trim() ||
    admin.username ||
    "Super-Admin";
  const summary =
    action === "admin_result_set"
      ? `Super-Admin setzte das Ergebnis auf ${after.winningTeamPoints ?? "?"}:${after.losingTeamPoints ?? "?"} (vorher ${before.winningTeamPoints ?? "–"}:${before.losingTeamPoints ?? "–"}, ${before.resultStatus})`
      : action === "admin_result_reset"
      ? "Super-Admin setzte das Spiel zurück auf geplant (Ergebnis verworfen)"
      : "Super-Admin hat das Spiel abgesagt";
  await recordAudit({
    entityType: "match",
    entityId: match._id,
    action,
    actorPlayerId: admin._id || undefined,
    actorName,
    actorRole: "super_admin",
    summary,
    before,
    after,
  });

  return ok({ message: "Spiel aktualisiert" });
}

export const POST = withErrorHandling(handler);
