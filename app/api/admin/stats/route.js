import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import Team from "@/models/Team";
import Match from "@/models/Match";
import League from "@/models/League";
import Feedback from "@/models/Feedback";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/stats – Übersichtszahlen für das Dashboard.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();
  const [players, teams, matches, leagues, feedbackNew] = await Promise.all([
    Player.countDocuments(),
    Team.countDocuments(),
    Match.countDocuments(),
    League.countDocuments(),
    Feedback.countDocuments({ status: "new" }),
  ]);

  return ok({ stats: { players, teams, matches, leagues, feedbackNew } });
}

export const POST = withErrorHandling(handler);
