import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import Team from "@/models/Team";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/getmyinfo – eigenes Profil anhand des Tokens laden.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  if (!token) {
    return fail("Nicht authentifiziert", 401);
  }

  const player = await getPlayerFromToken(token);
  if (!player) {
    return fail("Sitzung ungültig oder abgelaufen", 401);
  }

  // Rückwärtskompatibel: teamId bleibt unverändert (ObjectId), zusätzlich
  // ein populiertes `team`-Objekt (für Navbar "Mein Team" o.ä.).
  const out = player.toObject();
  if (player.teamId) {
    out.team = await Team.findById(player.teamId).select("teamName slug logo");
  }
  out.followersCount = out.followers?.length || 0;
  out.followingCount = out.following?.length || 0;

  return ok({ player: out });
}

export const POST = withErrorHandling(handler);
