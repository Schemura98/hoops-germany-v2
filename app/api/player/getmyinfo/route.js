import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getmyinfo – eigenes Profil anhand des Tokens laden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  if (!token) {
    return fail("Nicht authentifiziert", 401);
  }

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Sitzung ungültig oder abgelaufen", 401);
  }

  return ok({ player });
}

export const POST = withErrorHandling(handler);
