import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/roster/slot-info – öffentliche Slot-/Team-Infos zu einem Claim-Token.
// Keine Auth nötig (wird auf der Einladungsseite angezeigt).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const claimToken = body.claimToken;
  if (!claimToken) {
    return fail("Ungültiger Einladungslink", 400);
  }

  await connectDB();
  const team = await Team.findOne(
    { "rosterSlots.claimToken": claimToken },
    { teamName: 1, slug: 1, logo: 1, region: 1, "rosterSlots.$": 1 }
  );

  if (!team || !team.rosterSlots?.length) {
    return fail("Dieser Einladungslink ist ungültig oder abgelaufen", 404);
  }

  const slot = team.rosterSlots[0];

  return ok({
    team: {
      teamName: team.teamName,
      slug: team.slug,
      logo: team.logo,
      region: team.region,
    },
    slot: {
      name: slot.name,
      position: slot.position,
      number: slot.number,
      status: slot.status,
    },
    claimable: slot.status === "empty",
  });
}

export const POST = withErrorHandling(handler);
