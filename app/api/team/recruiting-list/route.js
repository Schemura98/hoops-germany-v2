import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/recruiting-list – öffentliche Liste der Teams, die Verstärkung suchen.
async function handler() {
  await connectDB();
  const teams = await Team.find({ recruiting: true, approved: { $ne: false } })
    .select("teamName slug logo region bundesland recruitingPositions recruitingNote leagueId")
    .populate("leagueId", "name season level")
    .sort({ teamName: 1 });

  return ok({
    teams: teams.map((t) => ({
      _id: t._id,
      teamName: t.teamName,
      slug: t.slug,
      logo: t.logo || "",
      region: t.region || "",
      bundesland: t.bundesland || "",
      positions: t.recruitingPositions || [],
      note: t.recruitingNote || "",
      league: t.leagueId ? { name: t.leagueId.name, level: t.leagueId.level || "" } : null,
    })),
  });
}

export const POST = withErrorHandling(handler);
