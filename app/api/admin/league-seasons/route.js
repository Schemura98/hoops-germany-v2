import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSeason from "@/models/TeamSeason";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/league-seasons – eingefrorene TeamSeason-Einträge einer Liga (Super-Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.leagueId) return fail("leagueId fehlt", 400);

  await connectDB();
  const rows = await TeamSeason.find({ leagueId: body.leagueId })
    .populate("teamId", "teamName slug")
    .sort({ placement: 1 })
    .lean();

  const seasons = rows.map((r) => ({
    _id: String(r._id),
    teamName: r.teamId?.teamName || "—",
    placement: r.placement ?? null,
    wins: r.wins || 0,
    losses: r.losses || 0,
    status: r.status || "aktiv",
    champion: !!r.champion,
  }));

  return ok({ seasons });
}

export const POST = withErrorHandling(handler);
