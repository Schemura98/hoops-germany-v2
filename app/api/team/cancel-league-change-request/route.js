import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import LeagueChangeRequest from "@/models/LeagueChangeRequest";
import { getTeamWithRole } from "@/lib/serverAuth";
import { hasTeamPermission } from "@/lib/teamPermissions";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/cancel-league-change-request – eigene OFFENE Anfrage stornieren.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const role = await getTeamWithRole(token);
  if (!role || !hasTeamPermission(role.team, role.playerId, "einstellungen")) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }
  if (!body.requestId) return fail("Anfrage-ID fehlt", 400);

  await connectDB();
  const request = await LeagueChangeRequest.findOne({
    _id: body.requestId,
    team: role.team._id,
  });
  if (!request) return fail("Anfrage nicht gefunden", 404);
  if (request.status !== "ausstehend") {
    return fail("Nur ausstehende Anfragen können storniert werden.", 400);
  }

  request.status = "storniert";
  await request.save();

  return ok({ request });
}

export const POST = withErrorHandling(handler);
