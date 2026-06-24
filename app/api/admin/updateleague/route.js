import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Match from "@/models/Match";
import { teamScores } from "@/lib/matchScore";
import { getAdminFromToken } from "@/lib/serverAuth";
import { findDuplicateLeague } from "@/lib/leagues";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Tabellen-Ersten einer Liga aus abgeschlossenen Spielen ermitteln (teamId-String).
async function computeChampionId(league) {
  const matches = await Match.find({ leagueId: league._id, status: "completed" }).select(
    "teamA teamB winningTeamPoints losingTeamPoints winningTeam"
  );
  const table = new Map();
  for (const t of league.teams || [])
    table.set(String(t), { teamId: String(t), wins: 0, pf: 0, pa: 0 });
  for (const m of matches) {
    const s = teamScores(m);
    if (!s) continue;
    const a = table.get(String(m.teamA));
    const b = table.get(String(m.teamB));
    if (a) { a.pf += s.a; a.pa += s.b; if (s.a > s.b) a.wins++; }
    if (b) { b.pf += s.b; b.pa += s.a; if (s.b > s.a) b.wins++; }
  }
  const sorted = [...table.values()].sort(
    (x, y) => y.wins - x.wins || (y.pf - y.pa) - (x.pf - x.pa) || y.pf - x.pf
  );
  return sorted[0]?.teamId || null;
}

// POST /api/admin/updateleague – Liga bearbeiten (Name, Saison, aktiv).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  if (!body.leagueId) return fail("Liga-ID fehlt", 400);

  const updates = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return fail("Der Liga-Name darf nicht leer sein", 400);
    updates.name = name;
  }
  if (body.season !== undefined) updates.season = String(body.season).trim();
  if (body.bundesland !== undefined) updates.bundesland = String(body.bundesland).trim();
  if (body.level !== undefined) updates.level = String(body.level).trim();
  if (body.gender !== undefined) updates.gender = String(body.gender).trim();
  if (body.ageGroup !== undefined) updates.ageGroup = String(body.ageGroup).trim();
  if (body.region !== undefined) updates.region = String(body.region).trim();
  if (body.active !== undefined) updates.active = !!body.active;
  if (body.finished !== undefined) updates.finished = !!body.finished;
  if (body.champion !== undefined)
    updates.champion = body.champion ? body.champion : null; // "" / null → Meister löschen

  if (Object.keys(updates).length === 0) {
    return fail("Keine Änderungen übermittelt", 400);
  }

  await connectDB();
  const current = await League.findById(body.leagueId);
  if (!current) return fail("Liga nicht gefunden", 404);

  // Dublettenschutz beim Umbenennen / Saison-Ändern (eigene Liga ausgenommen).
  if (updates.name !== undefined || updates.season !== undefined) {
    const newName = updates.name !== undefined ? updates.name : current.name;
    const newSeason = updates.season !== undefined ? updates.season : current.season || "";
    const dup = await findDuplicateLeague(newName, newSeason, current._id);
    if (dup) {
      return fail("Eine andere Liga mit diesem Namen und dieser Saison existiert bereits.", 409);
    }
  }

  // Beim Abschließen den Meister festschreiben: expliziter champion hat Vorrang,
  // sonst automatisch der Tabellenführer (einmalig eingefroren).
  if (updates.finished === true) {
    const explicit = body.champion ? body.champion : null;
    if (!explicit) {
      updates.champion = await computeChampionId(current);
    }
  }

  const league = await League.findByIdAndUpdate(
    body.leagueId,
    { $set: updates },
    { new: true }
  ).select("name season bundesland active finished champion");

  return ok({ league });
}

export const POST = withErrorHandling(handler);
