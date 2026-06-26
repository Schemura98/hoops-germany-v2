import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/player/dismiss-onboarding – Onboarding-Checklist dauerhaft ausblenden (Spieler-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const decoded = verifyToken(token);
  const id = decoded?.id || decoded?.playerId;
  if (!id) {
    return fail("Nicht authentifiziert", 401);
  }

  await connectDB();
  const player = await Player.findByIdAndUpdate(
    id,
    { $set: { onboardingDismissed: true } },
    { new: true }
  ).select("onboardingDismissed");

  if (!player) {
    return fail("Spieler nicht gefunden", 404);
  }

  return ok({ onboardingDismissed: player.onboardingDismissed });
}

export const POST = withErrorHandling(handler);
