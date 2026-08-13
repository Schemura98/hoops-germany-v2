import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import Match from "@/models/Match";
import { computeStandings } from "@/lib/standings";
import { freezeSeason } from "@/lib/teamSeason";
import { getAdminFromToken } from "@/lib/serverAuth";
import { findDuplicateLeague, normalizeAgeGroup } from "@/lib/leagues";
import { LEAGUE_AGE_GROUPS } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// Meister beim Abschließen ermitteln: Sieger des (letzten) abgeschlossenen Finales,
// sonst Tabellenführer der Hauptrunde.
async function resolveChampionId(league) {
  const finale = await Match.findOne({
    leagueId: league._id,
    stage: "Playoffs",
    playoffRound: "Finale",
    status: "completed",
    winningTeam: { $ne: null },
  })
    .sort({ date: -1 })
    .select("winningTeam");
  if (finale?.winningTeam) return String(finale.winningTeam);
  const standings = await computeStandings(league._id, league.teams);
  return standings[0]?.teamId || null;
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
  // Die Altersklasse wird erst nach dem Laden der Liga geprüft (siehe unten):
  // Ein Altbestand, dessen Klasse heute nicht mehr erlaubt ist, muss trotzdem
  // in allen ANDEREN Feldern bearbeitbar bleiben.
  const eingereichteAltersklasse =
    body.ageGroup !== undefined ? String(body.ageGroup) : null;
  if (body.region !== undefined) updates.region = String(body.region).trim();
  if (body.playoffMode !== undefined)
    updates.playoffMode = body.playoffMode === "best_of_1" ? "best_of_1" : "keine";
  if (body.active !== undefined) updates.active = !!body.active;
  if (body.finished !== undefined) updates.finished = !!body.finished;
  if (body.champion !== undefined)
    updates.champion = body.champion ? body.champion : null; // "" / null → Meister löschen

  if (Object.keys(updates).length === 0 && eingereichteAltersklasse === null) {
    return fail("Keine Änderungen übermittelt", 400);
  }

  await connectDB();
  const current = await League.findById(body.leagueId);
  if (!current) return fail("Liga nicht gefunden", 404);

  // Altersklasse: Produktregel ist „nur Senioren/U18" (Plattform ab 16 Jahren).
  //
  // ABER: Ein Altbestand darf dadurch nicht unbearbeitbar werden. Das
  // Admin-Formular schickt die aktuelle Altersklasse bei JEDER Speicherung mit
  // (app/admin/leagues/page.js) – eine Liga, die noch „U16" trägt, hätte sich
  // sonst nicht einmal umbenennen oder löschen lassen, weil die Prüfung an
  // einem Feld scheitert, das der Admin gar nicht angefasst hat.
  // Das Seed-Skript lässt solche Ligen bewusst stehen, wenn sie Teams oder
  // Spiele haben – der Zustand ist also vorgesehen, nicht hypothetisch.
  // (Dreimal unabhängig gemeldet in Kais Prüfkette.)
  //
  // Regel: Unveränderte Altklasse wird durchgelassen und NICHT geschrieben.
  // Eine echte Änderung muss weiterhin auf die erlaubte Liste treffen.
  if (eingereichteAltersklasse !== null) {
    const normalisiert = normalizeAgeGroup(eingereichteAltersklasse);
    const unveraendert =
      eingereichteAltersklasse.trim() === String(current.ageGroup || "").trim();
    if (!normalisiert && !unveraendert) {
      return fail(
        `Altersklasse „${eingereichteAltersklasse}" wird nicht unterstützt. Erlaubt: ${LEAGUE_AGE_GROUPS.join(", ")}.`,
        400
      );
    }
    if (normalisiert) updates.ageGroup = normalisiert;
  }

  if (Object.keys(updates).length === 0) {
    return fail("Keine Änderungen übermittelt", 400);
  }

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
      updates.champion = await resolveChampionId(current);
    }
  }

  const league = await League.findByIdAndUpdate(
    body.leagueId,
    { $set: updates },
    { new: true }
  ).select("name season bundesland active finished champion playoffMode");

  // Beim Abschließen den Endstand je Team als TeamSeason-Snapshot einfrieren.
  if (updates.finished === true) {
    await freezeSeason(current, league.champion);
  }

  return ok({ league });
}

export const POST = withErrorHandling(handler);
