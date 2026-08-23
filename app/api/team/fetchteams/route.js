import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import League from "@/models/League";
import { ok, withErrorHandling } from "@/lib/apiResponse";

// POST /api/team/fetchteams – alle Teams (für Auswahllisten & öffentliche Übersicht).
async function handler() {
  await connectDB();
  // Nur freigegebene Teams (Bestand ohne Feld = freigegeben; nur explizit false ausblenden).
  const teams = await Team.find({ approved: { $ne: false } })
    .select("teamName slug logo region bundesland isDemo")
    .sort({ teamName: 1 })
    .lean();

  // Liga-Name je Team (Ronja M2, 23.08.2026): Die Teamkarten auf /teams
  // trugen nur Städtenamen – ein Kreis-Niers-Tester konnte „wer aus meiner
  // Liga ist schon hier" auf der Liste nicht beantworten. EINE Abfrage über
  // die aktiven Ligen statt einer je Team; steht ein Team in mehreren aktiven
  // Ligen, gewinnt die zuerst gefundene (Anzeige-Zeile, keine Datenaussage).
  const leagues = await League.find({ active: true })
    .select("name teams")
    .lean();
  const ligaJeTeam = new Map();
  for (const lg of leagues) {
    for (const tid of lg.teams || []) {
      const key = String(tid);
      if (!ligaJeTeam.has(key)) ligaJeTeam.set(key, lg.name);
    }
  }
  for (const t of teams) {
    t.leagueName = ligaJeTeam.get(String(t._id)) || null;
  }

  return ok({ teams });
}

export const POST = withErrorHandling(handler);
