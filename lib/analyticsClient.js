import axios from "axios";

// DIE EINE STELLE für das Absenden von Analytics-Ereignissen aus dem Browser
// (Roadmap 39, Auflage Kai aus dem Gate zu Roadmap 26, 22.08.2026).
//
// Vorher gab es ZWEI Sendewege mit kopierter Logik: `components/
// AnalyticsTracker.js` (Seitenaufrufe) und `lib/trackEvent.js` (Tour-,
// Checklist- und sonstige Ereignisse) — beide mit einer eigenen, wortgleichen
// `getSessionId`-Kopie. Der Bot-Riegel aus Roadmap 26 wurde zunächst nur in
// den Tracker gebaut; die Tour-Ereignisse liefen weiter ungefiltert
// (gemessen: +81 Einträge je Suite-Lauf, 7.259 `tour_step` in der Dev-DB).
// Eine Bedingung, die an zwei Stellen gepflegt werden muss, ist an einer
// davon irgendwann nicht gepflegt — deshalb jetzt EINE geteilte Stelle.
//
// ⚠️ GESTEUERTE BROWSER ZÄHLEN NICHT MIT (`navigator.webdriver` — Playwright,
// Selenium, Headless-Bots). Zwei Gründe: Die Testsuite vergiftete ihre eigene
// Datenbank (83.856 Einträge, +15.175 an einem Tag), und ein Bot ist kein
// Besucher — der Sponsor-Report rechnet mit diesen Zahlen. Echte Nutzer
// setzen den Marker nie; wer ihn fälscht, will nicht gezählt werden.

export function getAnalyticsSessionId() {
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

// Fire-and-forget: blockiert die UI nie, Fehler werden verschluckt.
// Gibt zurück, ob überhaupt gesendet wurde (false = Server/Bot) — die
// Aufrufer brauchen das nicht, aber ein Test kann es messen.
export function sendeAnalyticsEreignis(eventType, path, meta) {
  if (typeof window === "undefined") return false;
  if (typeof navigator !== "undefined" && navigator.webdriver) return false;
  const token = window.localStorage.getItem("playerAuthToken") || undefined;
  axios
    .post("/api/analytics/track", {
      eventType,
      path: path || window.location.pathname,
      sessionId: getAnalyticsSessionId(),
      token,
      meta,
    })
    .catch(() => {});
  return true;
}
