import { getTokenFromRequest } from "@/lib/auth";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchinfo – eigenes Team anhand des Tokens laden (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  if (!token) {
    return fail("Nicht authentifiziert", 401);
  }

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  return ok({ team });
}

export const POST = withErrorHandling(handler);
