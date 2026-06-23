import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/track – Seitenaufruf erfassen (öffentlich, leichtgewichtig).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const path = body.path?.slice(0, 300);
  if (!path) return fail("Pfad fehlt", 400);

  await connectDB();
  await AnalyticsEvent.create({
    eventType: body.eventType || "pageview",
    path,
    sessionId: body.sessionId || "",
  });

  return ok({});
}

export const POST = withErrorHandling(handler);
