import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Post from "@/models/Post";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deleteplayer – Spieler löschen (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.playerId) return fail("Spieler-ID fehlt", 400);

  await connectDB();
  const player = await Player.findByIdAndDelete(body.playerId);
  if (!player) return fail("Spieler nicht gefunden", 404);

  // Beiträge des Spielers mit entfernen
  await Post.deleteMany({ player: body.playerId });

  return ok({ message: "Spieler gelöscht" });
}

export const POST = withErrorHandling(handler);
