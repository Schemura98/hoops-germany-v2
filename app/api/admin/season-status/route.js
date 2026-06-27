import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TeamSeason from "@/models/TeamSeason";
import { getAdminFromToken } from "@/lib/serverAuth";
import { TEAM_SEASON_STATUS } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/season-status – Status einer Team-Saison setzen (Super-Admin).
// Body: { teamSeasonId, status }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);
  if (!body.teamSeasonId) return fail("teamSeasonId fehlt", 400);

  const status = TEAM_SEASON_STATUS.some((s) => s.value === body.status)
    ? body.status
    : "aktiv";

  await connectDB();
  const ts = await TeamSeason.findByIdAndUpdate(
    body.teamSeasonId,
    { $set: { status } },
    { new: true }
  );
  if (!ts) return fail("Eintrag nicht gefunden", 404);

  return ok({ status: ts.status });
}

export const POST = withErrorHandling(handler);
