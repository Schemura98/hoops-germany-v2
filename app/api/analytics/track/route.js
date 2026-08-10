import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { verifyToken } from "@/lib/auth";
import { parseUserAgent } from "@/lib/userAgent";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";

// POST /api/analytics/track – Seitenaufruf erfassen (öffentlich, leichtgewichtig).
async function handler(req) {
  const body = await req.json().catch(() => ({}));
  const path = body.path?.slice(0, 300);
  if (!path) return fail("Pfad fehlt", 400);

  // Gerät/Browser/OS serverseitig aus dem User-Agent (nicht personenbezogen).
  const { device, browser, os } = parseUserAgent(req.headers.get("user-agent") || "");

  // Optional: eingeloggter Nutzer (für „aktive Nutzer") – Token nur lesen, kein DB-Zugriff.
  let playerId;
  if (body.token) {
    const decoded = verifyToken(body.token);
    playerId = decoded?.id || decoded?.playerId || undefined;
  }

  await connectDB();
  await AnalyticsEvent.create({
    eventType: body.eventType || "pageview",
    path,
    sessionId: body.sessionId || "",
    device,
    browser,
    os,
    playerId,
    meta: body.meta ? String(body.meta).slice(0, 100) : undefined,
  });

  return ok({});
}

export const POST = withErrorHandling(handler);
