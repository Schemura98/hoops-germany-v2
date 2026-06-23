import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import League from "@/models/League";
import { getTeamFromToken } from "@/lib/serverAuth";
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

  await connectDB();
  const league = await League.create({
    name,
    season: body.season?.trim() || "",
    teams: [team._id],
    matches: [],
    active: true,
  });

  return ok({ league: { _id: league._id, name: league.name, season: league.season } }, 201);
}

export const GET = withErrorHandling(list);
export const POST = withErrorHandling(create);
