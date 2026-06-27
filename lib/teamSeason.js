import TeamSeason from "@/models/TeamSeason";
import { computeStandings } from "@/lib/standings";

// Friert den Endstand einer abgeschlossenen Saison als TeamSeason-Snapshot ein.
// Idempotent (Upsert je Team+Liga+Saison); ein bereits gesetzter Status bleibt
// erhalten ($setOnInsert). Fehlertolerant – darf den Liga-Abschluss nie kippen.
export async function freezeSeason(league, championId) {
  try {
    if (!league?._id) return;
    const standings = await computeStandings(league._id, league.teams);
    let place = 0;
    for (const s of standings) {
      place += 1;
      await TeamSeason.findOneAndUpdate(
        { teamId: s.teamId, leagueId: league._id, season: league.season || "" },
        {
          $set: {
            placement: place,
            games: s.games,
            wins: s.wins,
            losses: s.losses,
            pointsFor: s.pointsFor,
            pointsAgainst: s.pointsAgainst,
            diff: s.diff,
            champion: championId ? String(championId) === String(s.teamId) : false,
            finalized: true,
            finalizedAt: new Date(),
          },
          $setOnInsert: { status: "aktiv" },
        },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error("[freezeSeason]", err);
  }
}
