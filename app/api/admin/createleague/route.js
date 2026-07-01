import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getAdminFromToken } from "@/lib/serverAuth";
import { findDuplicateLeague, normalizeAgeGroup } from "@/lib/leagues";
import { LEAGUE_AGE_GROUPS } from "@/lib/constants";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/createleague – Liga zentral durch Super-Admin anlegen.
// Startet ohne Teams (Teams treten über das Eintragen von Spielen bei).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  const name = body.name?.trim();
  if (!name) return fail("Bitte einen Liga-Namen angeben", 400);
  const season = String(body.season || "").trim();
  const bundesland = String(body.bundesland || "").trim();

  // Produktregel: nur unterstützte Altersbereiche (Senioren/U18/U16) – zentral validiert
  // (auch serverseitig, nicht nur UI). Fehlender Wert → Default "Senioren" (Pflichtfeldlogik);
  // leerer/ungültiger String → 400. Case/Whitespace werden normalisiert ("u16"/" U16 " → "U16").
  let ageGroup = "Senioren";
  if (body.ageGroup !== undefined && body.ageGroup !== null) {
    ageGroup = normalizeAgeGroup(body.ageGroup);
    if (!ageGroup) {
      return fail(
        `Altersklasse „${String(body.ageGroup)}" wird nicht unterstützt. Erlaubt: ${LEAGUE_AGE_GROUPS.join(", ")}.`,
        400
      );
    }
  }

  await connectDB();

  const dup = await findDuplicateLeague(name, season);
  if (dup) {
    return fail("Eine Liga mit diesem Namen und dieser Saison existiert bereits.", 409);
  }

  const league = await League.create({
    name,
    season,
    bundesland,
    level: String(body.level || "").trim(),
    gender: String(body.gender || "Herren").trim(),
    ageGroup,
    region: String(body.region || "").trim(),
    playoffMode: body.playoffMode === "best_of_1" ? "best_of_1" : "keine",
    official: true,
    teams: [],
    matches: [],
    active: true,
  });

  return ok({ league: { _id: league._id, name: league.name } }, 201);
}

export const POST = withErrorHandling(handler);
