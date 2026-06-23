import { getTokenFromRequest } from "@/lib/auth";
import { getPlayerFromToken } from "@/lib/serverAuth";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/checkfollowing – prüft, ob der eingeloggte Spieler
// einem Ziel (playerId ODER teamId) folgt.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const me = await getPlayerFromToken(token);
  if (!me) {
    // Nicht eingeloggt → folgt niemandem
    return ok({ following: false, authenticated: false });
  }

  let following = false;
  if (body.playerId) {
    following = (me.following || []).some(
      (id) => String(id) === String(body.playerId)
    );
  } else if (body.teamId) {
    following = (me.followingTeams || []).some(
      (id) => String(id) === String(body.teamId)
    );
  }

  return ok({ following, authenticated: true });
}

export const POST = withErrorHandling(handler);
