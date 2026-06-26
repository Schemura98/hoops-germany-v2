import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/mark-welcome-seen – Willkommens-Tour als gesehen markieren (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  await connectDB();
  await Player.findByIdAndUpdate(id, { $set: { welcomeSeen: true } });

  return ok({ welcomeSeen: true });
}

export const POST = withErrorHandling(handler);
