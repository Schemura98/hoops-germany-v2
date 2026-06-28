import crypto from "crypto";
import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { getTeamForCapability, TEAM_PUBLIC_FIELDS } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/add-slot – neuen Kader-Slot anlegen (Dual-Auth).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamForCapability(token, "kader");
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const name = body.name?.trim();
  if (!name) {
    return fail("Bitte einen Namen für den Slot angeben", 400);
  }

  const slot = {
    name,
    position: body.position?.trim() || "",
    number: body.number?.toString().trim() || "",
    status: "empty",
    // Jeder Slot bekommt direkt einen Claim-Token für den Einladungslink.
    claimToken: crypto.randomBytes(16).toString("hex"),
  };

  await connectDB();
  const updated = await Team.findByIdAndUpdate(
    team._id,
    { $push: { rosterSlots: slot } },
    { new: true, runValidators: true }
  ).select(TEAM_PUBLIC_FIELDS);

  return ok({ team: updated });
}

export const POST = withErrorHandling(handler);
