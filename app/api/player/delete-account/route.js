import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { deletePlayerCascade } from "@/lib/deletePlayer";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/delete-account – Spieler löscht sein EIGENES Konto (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);
  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) return fail("Nicht authentifiziert", 401);

  const result = await deletePlayerCascade(id);
  if (!result.ok) {
    // Gründer ohne Co-Admin → 409 mit Hinweis; sonst 404
    return fail(result.message, result.code === "FOUNDER_BLOCK" ? 409 : 404);
  }

  return ok({ message: "Konto gelöscht" });
}

export const POST = withErrorHandling(handler);
