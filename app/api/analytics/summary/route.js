import { getTokenFromRequest } from "@/lib/auth";
import { getAdminFromToken } from "@/lib/serverAuth";
import { computeAnalyticsSummary } from "@/lib/analyticsSummary";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/summary – Auswertung für das Admin-Dashboard (intern + Sponsor).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const admin = await getAdminFromToken(getTokenFromRequest(req, body.token));
  if (!admin) return fail("Nicht authentifiziert", 401);

  const summary = await computeAnalyticsSummary(body.period);
  return ok({ summary });
}

export const POST = withErrorHandling(handler);
