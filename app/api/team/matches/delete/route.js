import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/matches/delete – geplantes Spiel entfernen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const matchId = body.matchId;
  if (!matchId) {
    return fail("Spiel-ID fehlt", 400);
  }

  await connectDB();
  const match = await Match.findById(matchId);
  if (!match) {
    return fail("Spiel nicht gefunden", 404);
  }

  const involved =
    String(match.teamA) === String(team._id) ||
    String(match.teamB) === String(team._id);
  if (!involved) {
    return fail("Keine Berechtigung für dieses Spiel", 403);
  }
  if (match.status !== "scheduled") {
    return fail("Nur geplante Spiele können entfernt werden", 400);
  }

  await match.deleteOne();
  return ok({ message: "Spiel entfernt" });
}

export const POST = withErrorHandling(handler);
