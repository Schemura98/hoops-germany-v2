import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/fetchallplayers – alle Spieler (Admin).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const players = await Player.find({})
    .select(
      "firstName lastName email slug status isTeamAdmin isSuperAdmin teamId teamAdminOf createdAt"
    )
    .populate("teamId", "teamName slug")
    .populate("teamAdminOf", "teamName slug")
    .sort({ createdAt: -1 });

  return ok({ players });
}

export const POST = withErrorHandling(handler);
