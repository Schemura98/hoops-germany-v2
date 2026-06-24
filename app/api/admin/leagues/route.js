import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/leagues – alle Ligen (inkl. inaktiver) für die Verwaltung.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const leagues = await League.find({})
    .select("name season bundesland teams active")
    .sort({ createdAt: -1 });

  return ok({
    leagues: leagues.map((l) => ({
      _id: l._id,
      name: l.name,
      season: l.season,
      bundesland: l.bundesland || "",
      active: l.active,
      teamCount: l.teams?.length || 0,
    })),
  });
}

export const POST = withErrorHandling(handler);
