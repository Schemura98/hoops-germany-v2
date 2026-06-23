import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Match from "@/models/Match";
import { teamScores } from "@/lib/matchScore";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// GET /api/leagues/[id] – Liga-Detail inkl. berechneter Tabelle.
async function handler(req, ctx) {
  const id = ctx?.params?.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return fail("Ungültige Liga-ID", 400);
  }

  await connectDB();
  const league = await League.findById(id).populate(
    "teams",
    "teamName slug logo"
  );
  if (!league) {
    return fail("Liga nicht gefunden", 404);
  }

  // Standings aus abgeschlossenen Liga-Spielen berechnen
  const matches = await Match.find({ leagueId: id, status: "completed" }).select(
    "teamA teamB winningTeam winningTeamPoints losingTeamPoints"
  );

  const table = new Map();
  for (const t of league.teams) {
    table.set(String(t._id), {
      teamId: t._id,
      teamName: t.teamName,
      slug: t.slug,
      logo: t.logo,
      games: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    });
  }

  for (const m of matches) {
    const score = teamScores(m);
    if (!score) continue;
    const aId = String(m.teamA);
    const bId = String(m.teamB);
    const a = table.get(aId);
    const b = table.get(bId);
    if (a) {
      a.games++;
      a.pointsFor += score.a;
      a.pointsAgainst += score.b;
      if (score.a > score.b) a.wins++;
      else if (score.a < score.b) a.losses++;
    }
    if (b) {
      b.games++;
      b.pointsFor += score.b;
      b.pointsAgainst += score.a;
      if (score.b > score.a) b.wins++;
      else if (score.b < score.a) b.losses++;
    }
  }

  const standings = [...table.values()]
    .map((s) => ({ ...s, diff: s.pointsFor - s.pointsAgainst }))
    .sort(
      (x, y) =>
        y.wins - x.wins || y.diff - x.diff || y.pointsFor - x.pointsFor
    );

  return ok({
    league: { _id: league._id, name: league.name, season: league.season },
    standings,
  });
}

export const GET = withErrorHandling(handler);
