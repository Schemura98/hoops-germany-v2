import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getTeamFromToken } from "@/lib/serverAuth";
import { findDuplicateLeague } from "@/lib/leagues";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// DB-Zugriff erst zur Laufzeit.
export const dynamic = "force-dynamic";

// GET /api/leagues – aktive Ligen auflisten.
async function list() {
  await connectDB();
  const leagues = await League.find({ active: true })
    .select("name season bundesland teams")
    .sort({ createdAt: -1 });

  return ok({
    leagues: leagues.map((l) => ({
      _id: l._id,
      name: l.name,
      season: l.season,
      bundesland: l.bundesland || "",
      teams: (l.teams || []).map((t) => String(t)),
      teamCount: l.teams?.length || 0,
    })),
  });
}

// POST /api/leagues – Liga erstellen (Dual-Auth; erstellendes Team wird Mitglied).
async function create(req) {
  const body = await req.json().catch(() => ({}));
  const token = getTokenFromRequest(req, body.token);

  const team = await getTeamFromToken(token);
  if (!team) {
    return fail("Kein Team-Zugriff für diese Sitzung", 401);
  }

  const name = body.name?.trim();
  if (!name) {
    return fail("Bitte einen Liga-Namen angeben", 400);
  }
  const season = body.season?.trim() || "";

  await connectDB();

  // Dublettenschutz: gleiche Liga (Name + Saison) nicht doppelt anlegen.
  const dup = await findDuplicateLeague(name, season);
  if (dup) {
    return fail(
      "Eine Liga mit diesem Namen und dieser Saison gibt es bereits – bitte wähle sie oben in der Liste aus, statt sie neu anzulegen.",
      409
    );
  }

  const league = await League.create({
    name,
    season,
    bundesland: body.bundesland?.trim() || "",
    teams: [team._id],
    matches: [],
    active: true,
  });

  return ok(
    { league: { _id: league._id, name: league.name, season: league.season } },
    201
  );
}

export const GET = withErrorHandling(list);
export const POST = withErrorHandling(create);
