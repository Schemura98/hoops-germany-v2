import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

const VALID = ["verfuegbar", "nicht_verfuegbar"];

// POST /api/player/update-transfer – Transfer-Status & -Infos setzen (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  if (!VALID.includes(body.transferStatus)) {
    return fail("Ungültiger Transfer-Status", 400);
  }

  const updates = { transferStatus: body.transferStatus };
  if (body.preferredLeague !== undefined) {
    updates.preferredLeague = String(body.preferredLeague).trim();
  }
  if (body.transferNote !== undefined) {
    updates.transferNote = String(body.transferNote).trim();
  }

  await connectDB();
  const player = await Player.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select("transferStatus preferredLeague transferNote");

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  return ok({
    transferStatus: player.transferStatus,
    preferredLeague: player.preferredLeague,
    transferNote: player.transferNote,
  });
}

export const POST = withErrorHandling(handler);
