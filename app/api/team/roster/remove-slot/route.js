import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability, TEAM_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/remove-slot – Kader-Slot entfernen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const slotId = body.slotId;
  if (!slotId) {
    return fail("Slot-ID fehlt", 400);
  }

  await connectDB();
  const updated = await Team.findByIdAndUpdate(
    team._id,
    { $pull: { rosterSlots: { _id: slotId } } },
    { new: true }
  ).select(TEAM_PUBLIC_FIELDS);

  return ok({ team: updated });
}

export const POST = withErrorHandling(handler);
