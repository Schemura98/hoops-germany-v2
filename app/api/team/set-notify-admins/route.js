import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/set-notify-admins – Team-Einstellung: bei Beitritten/Anfragen
// alle Team-Admins benachrichtigen (statt nur den Haupt-Admin). Dual-Auth.
// Body: { token, notifyAllAdmins: boolean }
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  await connectDB();
  const notifyAllAdmins = !!body.notifyAllAdmins;
  await Team.updateOne({ _id: team._id }, { $set: { notifyAllAdmins } });

  return ok({ notifyAllAdmins });
}

export const POST = withErrorHandling(handler);
