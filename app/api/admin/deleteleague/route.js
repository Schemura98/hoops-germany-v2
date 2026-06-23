import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/deleteleague – Liga löschen und Spiel-Zuordnungen lösen.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.leagueId) return fail("Liga-ID fehlt", 400);

  await connectDB();
  const league = await League.findByIdAndDelete(body.leagueId);
  if (!league) return fail("Liga nicht gefunden", 404);

  // Liga-Zuordnung aus betroffenen Spielen entfernen
  await Match.updateMany({ leagueId: body.leagueId }, { $set: { leagueId: null } });

  return ok({ message: "Liga gelöscht" });
}

export const POST = withErrorHandling(handler);
