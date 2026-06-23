import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deleteteam – Team löschen (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.teamId) return fail("Team-ID fehlt", 400);

  await connectDB();
  const team = await Team.findByIdAndDelete(body.teamId);
  if (!team) return fail("Team nicht gefunden", 404);

  return ok({ message: "Team gelöscht" });
}

export const POST = withErrorHandling(handler);
