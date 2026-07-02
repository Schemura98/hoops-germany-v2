import { getTokenFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import LeagueChangeRequest from "@/models/LeagueChangeRequest";
import Match from "@/models/Match";
import { getAdminFromToken } from "@/lib/serverAuth";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/admin/league-change-requests – alle Ligazuordnungs-Anfragen (Super-Admin).
// Liefert je Anfrage zusätzlich, ob die aktuelle bzw. gewünschte Liga bereits Spiele
// hat (Warnhinweis vor der Freigabe – ändert nichts, nur Information).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  await connectDB();

  const status = body.status; // optional Filter: "ausstehend" etc.
  const query = status ? { status } : {};
  const requests = await LeagueChangeRequest.find(query)
    .populate("team", "teamName slug bundesland region")
    .populate("currentLeagueId", "name season level ageGroup gender region")
    .populate("requestedLeagueId", "name season level ageGroup gender region")
    .populate("requestedBy", "firstName lastName slug")
    .populate("reviewedBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(200);

  // Ausstehende Anfragen zuerst (Statusreihenfolge, nicht alphabetisch).
  const STATUS_ORDER = { ausstehend: 0, genehmigt: 1, abgelehnt: 2, storniert: 3 };
  requests.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const leagueIds = [
    ...new Set(
      requests
        .flatMap((r) => [r.currentLeagueId?._id, r.requestedLeagueId?._id])
        .filter(Boolean)
        .map(String)
    ),
  ];
  const countMap = new Map(
    await Promise.all(
      leagueIds.map(async (id) => [id, await Match.countDocuments({ leagueId: id })])
    )
  );

  const out = requests.map((r) => ({
    _id: r._id,
    team: r.team,
    currentLeagueId: r.currentLeagueId,
    requestedLeagueId: r.requestedLeagueId,
    season: r.season,
    requestedBy: r.requestedBy,
    note: r.note,
    status: r.status,
    reviewedBy: r.reviewedBy,
    reviewNote: r.reviewNote,
    reviewedAt: r.reviewedAt,
    createdAt: r.createdAt,
    currentLeagueMatchCount: r.currentLeagueId ? countMap.get(String(r.currentLeagueId._id)) || 0 : 0,
    requestedLeagueMatchCount: r.requestedLeagueId ? countMap.get(String(r.requestedLeagueId._id)) || 0 : 0,
  }));

  return ok({ requests: out });
}

export const POST = withErrorHandling(handler);
