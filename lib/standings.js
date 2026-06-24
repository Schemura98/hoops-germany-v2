import Match from "@/models/Match";
import { teamScores } from "@/lib/matchScore";

// Berechnet die Liga-Tabelle aus abgeschlossenen Spielen.
//   leagueId: ObjectId der Liga
//   teams:    Array von Team-Dokumenten ({_id, teamName, slug, logo}) ODER ObjectIds
// Rückgabe: sortierte Standings (teamId als String), Reihenfolge
//   Siege → Korbdifferenz → erzielte Punkte.
export async function computeStandings(leagueId, teams) {
  const matches = await Match.find({ leagueId, status: "completed" }).select(
    "status teamA teamB winningTeam winningTeamPoints losingTeamPoints"
  );

  const table = new Map();
  for (const t of teams || []) {
    const id = String(t?._id || t);
    table.set(id, {
      teamId: id,
      teamName: t?.teamName,
      slug: t?.slug,
      logo: t?.logo,
      games: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    });
  }

  for (const m of matches) {
    const s = teamScores(m);
    if (!s) continue;
    const a = table.get(String(m.teamA));
    const b = table.get(String(m.teamB));
    if (a) {
      a.games++;
      a.pointsFor += s.a;
      a.pointsAgainst += s.b;
      if (s.a > s.b) a.wins++;
      else if (s.a < s.b) a.losses++;
    }
    if (b) {
      b.games++;
      b.pointsFor += s.b;
      b.pointsAgainst += s.a;
      if (s.b > s.a) b.wins++;
      else if (s.b < s.a) b.losses++;
    }
  }

  return [...table.values()]
    .map((s) => ({ ...s, diff: s.pointsFor - s.pointsAgainst }))
    .sort((x, y) => y.wins - x.wins || y.diff - x.diff || y.pointsFor - x.pointsFor);
}
