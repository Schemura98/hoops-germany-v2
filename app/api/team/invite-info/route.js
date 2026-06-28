import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/invite-info – öffentliche Team-Info zu einem allgemeinen
// Einladungslink (inviteToken). Für die Beitritts-Landeseite /team/join/[token].
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const inviteToken = body.inviteToken;
  if (!inviteToken) {
    return fail("Kein Einladungslink angegeben", 400);
  }

  await connectDB();
  const team = await Team.findOne({ inviteToken }).select("teamName slug logo region");
  if (!team) {
    return fail("Dieser Einladungslink ist ungültig oder abgelaufen", 404);
  }

  return ok({
    team: {
      teamName: team.teamName,
      slug: team.slug,
      logo: team.logo || null,
      region: team.region || "",
    },
  });
}

export const POST = withErrorHandling(handler);
