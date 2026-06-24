import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { computeStandings } from "@/lib/standings";
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

  return ok({
    league: {
      _id: league._id,
      name: league.name,
      season: league.season,
      finished: !!league.finished,
    },
    standings,
    champion,
  });
}

export const GET = withErrorHandling(handler);
