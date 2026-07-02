import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import LeagueChangeRequest from "@/models/LeagueChangeRequest";
import { getTeamWithRole } from "@/lib/serverAuth";
import { hasTeamPermission } from "@/lib/teamPermissions";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/league-change-requests – eigene Ligazuordnungs-Anfragen des Teams
// (neueste zuerst), damit der Team-Admin eine offene Anfrage sehen/stornieren kann.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const role = await getTeamWithRole(token);
  if (!role || !hasTeamPermission(role.team, role.playerId, "einstellungen")) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();
  const requests = await LeagueChangeRequest.find({ team: role.team._id })
    .populate("currentLeagueId", "name season level ageGroup gender region")
    .populate("requestedLeagueId", "name season level ageGroup gender region")
    .sort({ createdAt: -1 })
    .limit(10);

  return ok({ requests });
}

export const POST = withErrorHandling(handler);
