import { connectDB } from "@/lib/db";
import AnalyticsEvent from "@/models/AnalyticsEvent";
import { verifyToken } from "@/lib/auth";
import { parseUserAgent } from "@/lib/userAgent";
import { ok, fail, withErrorHandling } from "@/lib/apiResponse";
import { SIGNUP_SOURCE_RE } from "@/lib/constants";

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

  // ⚠️ Kanal-Landungen streng validieren (22.08.2026): Dieser Endpunkt ist
  // oeffentlich und unauthentifiziert — richtig so, er zaehlt anonyme
  // Besucher. Aber `src_landing` speist den Kampagnen-Trichter im Admin, und
  // dessen Kanalliste ist die VEREINIGUNG aller je gesehenen Werte. Ohne
  // Formatpruefung koennte jeder per curl beliebige "Kanaele" erfinden und
  // die Auswertung fluten. Dieselbe Regel wie beim Registrieren
  // (SIGNUP_SOURCE_RE); was nicht passt, wird verworfen statt gespeichert.
  if (body.eventType === "src_landing") {
    const m = String(body.meta || "").toLowerCase().trim();
    if (!SIGNUP_SOURCE_RE.test(m)) return fail("Ungültige Quelle", 400);
    body.meta = m;
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
