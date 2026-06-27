import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { autoPostTransferAvailable } from "@/lib/autoPost";
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
  // Vorherigen Status lesen, um nur beim echten Wechsel einen Auto-Post zu erzeugen.
  const before = await Player.findById(id).select("transferStatus");
  const player = await Player.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  ).select("transferStatus preferredLeague transferNote firstName lastName slug bundesland");

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  // Nur beim Übergang auf „verfügbar" → Auto-Post in den Feed (Tages-Throttle im Helper).
  if (
    player.transferStatus === "verfuegbar" &&
    before?.transferStatus !== "verfuegbar"
  ) {
    await autoPostTransferAvailable({
      subjectPlayer: player._id,
      playerName: `${player.firstName || ""} ${player.lastName || ""}`.trim(),
      playerSlug: player.slug,
      preferredLeague: player.preferredLeague,
      bundesland: player.bundesland,
    });
  }

  return ok({
    transferStatus: player.transferStatus,
    preferredLeague: player.preferredLeague,
    transferNote: player.transferNote,
  });
}

export const POST = withErrorHandling(handler);
