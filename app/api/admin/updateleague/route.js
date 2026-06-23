import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/updateleague – Liga bearbeiten (Name, Saison, aktiv).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.leagueId) return fail("Liga-ID fehlt", 400);

  const updates = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return fail("Der Liga-Name darf nicht leer sein", 400);
    updates.name = name;
  }
  if (body.season !== undefined) updates.season = String(body.season).trim();
  if (body.active !== undefined) updates.active = !!body.active;

  if (Object.keys(updates).length === 0) {
    return fail("Keine Änderungen übermittelt", 400);
  }

  await connectDB();
  const league = await League.findByIdAndUpdate(
    body.leagueId,
    { $set: updates },
    { new: true }
  ).select("name season active");
  if (!league) return fail("Liga nicht gefunden", 404);

  return ok({ league });
}

export const POST = withErrorHandling(handler);
