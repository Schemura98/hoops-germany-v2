import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Player from "@/models/Player";
import Match from "@/models/Match";
import Post from "@/models/Post";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchsingleteaminfo – öffentliches Team-Profil per Slug.
// Liefert Team, Kader (Account-Spieler + belegte Slots), Spiele und Team-News
// (Beiträge der Team-Mitglieder).
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
    "firstName lastName slug position profileImage nationality"
  );
  const memberIds = members.map((m) => m._id);

  // Spiele des Teams (neueste zuerst)
  const matches = await Match.find({
    $or: [{ teamA: team._id }, { teamB: team._id }],
    status: { $ne: "cancelled" },
  })
    .select(
      "teamA teamB date location status winningTeam winningTeamPoints losingTeamPoints"
    )
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .sort({ date: -1 })
    .limit(30);

  // Team-News: aktuelle Beiträge der Mitglieder
  const posts = memberIds.length
    ? await Post.find({ player: { $in: memberIds } })
        .populate("player", "firstName lastName slug profileImage")
        .sort({ createdAt: -1 })
        .limit(10)
    : [];

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
    matches,
    posts,
  });
}

export const POST = withErrorHandling(handler);
