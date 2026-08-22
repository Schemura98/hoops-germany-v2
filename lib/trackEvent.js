import { sendeAnalyticsEreignis } from "@/lib/analyticsClient";

// Fire-and-forget Custom-Event (z.B. Onboarding-Interaktionen) über die
// bestehende Tracking-Infrastruktur (POST /api/analytics/track).
//
// ⚠️ Seit dem 22.08.2026 nur noch eine dünne Hülle um `lib/analyticsClient.js`
// (Roadmap 39): Session-Id-Logik und Bot-Riegel leben DORT, genau einmal.
// Hier stand eine wortgleiche Kopie von `getSessionId` — und der Bot-Riegel
// aus Roadmap 26 fehlte: Tour-Ereignisse aus gesteuerten Browsern gingen
// weiter raus (+81 je Suite-Lauf). Die Signatur bleibt, die acht Aufrufer
// bleiben unangetastet.
export function trackEvent(eventType, path, meta) {
  sendeAnalyticsEreignis(eventType, path, meta);
}
