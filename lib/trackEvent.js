import axios from "axios";

// Gemeinsame Session-Id-Logik (identisch zu components/AnalyticsTracker.js), damit
// Custom-Events derselben Sitzung zugeordnet werden wie die Pageviews.
function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = window.localStorage.getItem("analyticsSessionId");
  if (!sid) {
    sid =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    window.localStorage.setItem("analyticsSessionId", sid);
  }
  return sid;
}

// Fire-and-forget Custom-Event (z.B. Onboarding-Interaktionen) über die bestehende
// Tracking-Infrastruktur (POST /api/analytics/track). Blockiert die UI nie – Fehler
// werden verschluckt, kein try/catch am Aufrufort nötig.
// meta: optionales Zusatzfeld (z.B. Checklist-Schritt-Key).
export function trackEvent(eventType, path, meta) {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem("playerAuthToken") || undefined;
  axios
    .post("/api/analytics/track", {
      eventType,
      path: path || window.location.pathname,
      sessionId: getSessionId(),
      token,
      meta,
    })
    .catch(() => {});
}
