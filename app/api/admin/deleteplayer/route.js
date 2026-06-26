import { getTokenFromRequest } from "@/lib/auth";
import { getAdminFromToken } from "@/lib/serverAuth";
import { deletePlayerCascade } from "@/lib/deletePlayer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deleteplayer – Spieler löschen (Admin). Nutzt denselben Cascade
// wie die Selbstlöschung (räumt Referenzen auf, behandelt Gründer-Fall).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.playerId) return fail("Spieler-ID fehlt", 400);

  const result = await deletePlayerCascade(body.playerId);
  if (!result.ok) {
    return fail(result.message, result.code === "FOUNDER_BLOCK" ? 409 : 404);
  }

  return ok({ message: "Spieler gelöscht" });
}

export const POST = withErrorHandling(handler);
