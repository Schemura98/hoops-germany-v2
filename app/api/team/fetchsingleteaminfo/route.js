import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchsingleteaminfo – öffentliches Team-Profil per Slug.
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const slug = body.slug;
  if (!slug) {
    return fail("Kein Team angegeben", 400);
  }

  await connectDB();
  const team = await Team.findOne({ slug }).select(
    "teamName slug about region logo banner rosterSlots followers adminPlayerId"
  );
  if (!team) {
    return fail("Team nicht gefunden", 404);
  }

  // Spieler mit Account, die dem Team angehören
  const members = await Player.find({ teamId: team._id }).select(
    "firstName lastName position profileImage nationality"
  );

  return ok({
    team: {
      _id: team._id,
      teamName: team.teamName,
      slug: team.slug,
      about: team.about,
      region: team.region,
      logo: team.logo,
      banner: team.banner,
      followersCount: team.followers?.length || 0,
      // Nur belegte Slots öffentlich zeigen
      rosterSlots: (team.rosterSlots || []).filter((s) => s.status !== "empty"),
    },
    members,
  });
}

export const POST = withErrorHandling(handler);
