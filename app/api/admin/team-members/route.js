import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/team-members – Mitglieder eines Teams + aktueller Admin (für die
// Admin-Übertragung im Super-Admin-Panel).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.teamId) return fail("Team-ID fehlt", 400);

  await connectDB();
  const team = await Team.findById(body.teamId).select("teamName adminPlayerId");
  if (!team) return fail("Team nicht gefunden", 404);

  const members = await Player.find({ teamId: team._id }).select("firstName lastName");
  const currentAdminId = team.adminPlayerId ? String(team.adminPlayerId) : null;

  return ok({
    teamName: team.teamName,
    currentAdminId,
    members: members.map((m) => ({
      id: String(m._id),
      name: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
      isAdmin: String(m._id) === currentAdminId,
    })),
  });
}

export const POST = withErrorHandling(handler);
