import { getTokenFromRequest } from "@/lib/auth";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/me – aktuellen Admin anhand des Tokens laden (Guard).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const admin = await getAdminFromToken(token);
  if (!admin) {
    return fail("Nicht authentifiziert", 401);
  }

  return ok({ admin: { username: admin.username, email: admin.email } });
}

export const POST = withErrorHandling(handler);
