import { connectDB } from "@/lib/db";
import Match from "@/models/Match";
import League from "@/models/League";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit.
export const dynamic = "force-dynamic";

// GET /api/teams/standings?leagueId=<id> – Team-Rangliste (W/L aus Ergebnissen).
// Ohne leagueId: über alle Ligen. Liefert zusätzlich die Liga-Liste für den Filter.
async function handler(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");
  const season = searchParams.get("season");

  const matchQuery = {
    status: "completed",
    winningTeam: { $ne: null },
    winningTeamPoints: { $ne: null },
  };
  // Liga-Filter ist spezifischer als Saison; sonst Saison über die Ligen der Saison.
  if (leagueId && leagueId !== "all") {
    matchQuery.leagueId = leagueId;
  } else if (season && season !== "all") {
    const ids = (await League.find({ season }).select("_id").lean()).map((l) => l._id);
    matchQuery.leagueId = { $in: ids };
  }

  const [matches, leagues, seasons] = await Promise.all([
    Match.find(matchQuery)
      .select("teamA teamB winningTeam winningTeamPoints losingTeamPoints")
      .populate("teamA", "teamName slug logo bundesland")
      .populate("teamB", "teamName slug logo bundesland")
      .lean(),
    League.find({ active: true }).select("name season").sort({ createdAt: -1 }).lean(),
    League.distinct("season"),
  ]);

  // Pro Team aggregieren.
  const table = new Map();
  const ensure = (team) => {
    const id = String(team._id);
    if (!table.has(id)) {
      table.set(id, {
        teamId: id,
        teamName: team.teamName,
        slug: team.slug,
        logo: team.logo || "",
        bundesland: team.bundesland || "",
        games: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      });
    }
    return table.get(id);
  };

  for (const m of matches) {
    if (!m.teamA?._id || !m.teamB?._id) continue; // gelöschtes Team überspringen
    const winId = String(m.winningTeam);
    const w = m.winningTeamPoints;
    const l = m.losingTeamPoints ?? 0;

    const aIsWinner = String(m.teamA._id) === winId;
    const winner = aIsWinner ? m.teamA : m.teamB;
    const loser = aIsWinner ? m.teamB : m.teamA;

    const ws = ensure(winner);
    ws.games += 1;
    ws.wins += 1;
    ws.pointsFor += w;
    ws.pointsAgainst += l;

    const ls = ensure(loser);
    ls.games += 1;
    ls.losses += 1;
    ls.pointsFor += l;
    ls.pointsAgainst += w;
  }

  const standings = [...table.values()]
    .map((t) => ({ ...t, diff: t.pointsFor - t.pointsAgainst }))
    .sort((a, b) => b.wins - a.wins || b.diff - a.diff || b.pointsFor - a.pointsFor);

  return ok({
    standings,
    leagues,
    seasons: (seasons || []).filter(Boolean).sort().reverse(),
  });
}

export const GET = withErrorHandling(handler);
