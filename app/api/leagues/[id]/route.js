import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Match from "@/models/Match";
import { computeStandings } from "@/lib/standings";
import { teamScores } from "@/lib/matchScore";
import { PLAYOFF_ROUNDS } from "@/lib/constants";
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
    "teamName slug logo isDemo"
  );
  if (!league) {
    return fail("Liga nicht gefunden", 404);
  }

  // Standings aus abgeschlossenen Liga-Spielen berechnen
  const standings = await computeStandings(league._id, league.teams);

  // Meister: nur wenn Saison abgeschlossen. Expliziter champion (z. B. Playoff-Sieger)
  // überschreibt den Tabellen-Ersten; sonst Platz 1 der Endtabelle.
  let champion = null;
  if (league.finished) {
    const championId = league.champion
      ? String(league.champion)
      : standings[0]?.teamId
      ? String(standings[0].teamId)
      : null;
    if (championId) {
      const t = league.teams.find((x) => String(x._id) === championId);
      const fromStandings = standings.find((s) => String(s.teamId) === championId);
      if (t || fromStandings) {
        champion = {
          teamId: championId,
          teamName: t?.teamName || fromStandings?.teamName || "",
          slug: t?.slug || fromStandings?.slug || "",
          logo: t?.logo || fromStandings?.logo || "",
        };
      }
    }
  }

  // Playoff-Spiele (separater Abschnitt, nach Runde gruppiert/sortiert)
  const playoffDocs = await Match.find({ leagueId: league._id, stage: "Playoffs" })
    .select("teamA teamB date status playoffRound winningTeam winningTeamPoints losingTeamPoints")
    .populate("teamA", "teamName slug logo")
    .populate("teamB", "teamName slug logo")
    .lean();

  const playoffs = playoffDocs
    .map((m) => {
      const sc = teamScores(m);
      const aId = String(m.teamA?._id || "");
      const winId = String(m.winningTeam || "");
      return {
        _id: String(m._id),
        round: m.playoffRound || "Playoffs",
        date: m.date,
        status: m.status,
        teamA: m.teamA
          ? { teamName: m.teamA.teamName, slug: m.teamA.slug, logo: m.teamA.logo || "" }
          : null,
        teamB: m.teamB
          ? { teamName: m.teamB.teamName, slug: m.teamB.slug, logo: m.teamB.logo || "" }
          : null,
        scoreA: sc ? sc.a : null,
        scoreB: sc ? sc.b : null,
        winnerSide: winId ? (winId === aId ? "A" : "B") : null,
      };
    })
    .sort((x, y) => {
      const ri = PLAYOFF_ROUNDS.indexOf(x.round) - PLAYOFF_ROUNDS.indexOf(y.round);
      if (ri !== 0) return ri;
      return new Date(x.date) - new Date(y.date);
    });

  return ok({
    league: {
      _id: league._id,
      name: league.name,
      season: league.season,
      finished: !!league.finished,
      playoffMode: league.playoffMode || "keine",
      // Wie der Meister (zu) ermitteln ist – nur Anzeige.
      championBasis: league.playoffMode === "best_of_1" ? "playoffs" : "table",
    },
    standings,
    champion,
    playoffs,
  });
}

export const GET = withErrorHandling(handler);
