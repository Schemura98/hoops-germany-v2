import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/mark-admin-tour-seen – Team-Admin-Tour als gesehen markieren
// (Spieler-Auth). Gleiches Muster wie mark-welcome-seen: Fehler beim Speichern
// verschluckt der Aufrufer – die Tour käme schlimmstenfalls noch einmal, das
// ist der billigere Fehler (Konzept Abschnitt 3).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  await connectDB();
  await Player.findByIdAndUpdate(id, { $set: { adminTourSeen: true } });

  return ok({ adminTourSeen: true });
}

export const POST = withErrorHandling(handler);
