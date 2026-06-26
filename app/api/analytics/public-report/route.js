import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import ReportShare from "@/models/ReportShare";
import { computeAnalyticsSummary } from "@/lib/analyticsSummary";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/public-report – öffentlicher Sponsor-Report (Token + Passwort).
// Gibt NUR aggregierte Zahlen zurück (keine personenbezogenen Daten).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!token || !password) return fail("Token und Passwort erforderlich", 400);

  await connectDB();
  const share = await ReportShare.findOne({ token, active: true });
  // Immer bcrypt.compare ausführen (auch bei unbekanntem Token) → kein Timing-Hinweis.
  const hash = share?.password || "$2a$10$0000000000000000000000000000000000000000000000000000";
  const valid = await bcrypt.compare(password, hash);
  if (!share || !valid) return fail("Falsches Passwort oder Link ungültig", 401);

  const summary = await computeAnalyticsSummary(body.period);
  return ok({ summary, label: share.label || "" });
}

export const POST = withErrorHandling(handler);
