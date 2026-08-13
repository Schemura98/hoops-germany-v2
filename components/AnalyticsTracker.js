"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { SIGNUP_SOURCE_KEY, SIGNUP_SOURCE_RE } from "@/lib/constants";

// Kampagnen-Quelle auf JEDER Route auffangen, nicht nur auf /signup.
//
// Vorher las ausschliesslich app/signup/page.js den `?src=`-Parameter. Jeder
// Link, der woanders landet, verlor die Quelle beim ersten Klick — eine
// geteilte Leistungskarte fuehrt auf ein Profil, ein Flyer-QR koennte auf die
// Startseite zeigen. Die Registrierung kam dann ohne Quelle an und die
// Kampagne sah aus, als haette sie nichts gebracht.
// (Befund: docs/LEISTUNGSKARTE-KONZEPT-2026-08-13.md, Abschnitt Rueckweg.)
//
// `window.location.search` statt `useSearchParams()`: Dieser Baustein haengt
// im Root-Layout. `useSearchParams` verlangt dort eine Suspense-Grenze und
// nimmt sonst der ganzen Anwendung das statische Rendern. Im Effekt gelesen
// ist der Wert genauso aktuell, weil der Effekt an `pathname` haengt.
//
// ERSTER GEWINNT: Ein bereits gepufferter Wert wird nicht ueberschrieben. Wer
// ueber eine Karte kam und danach intern weiterklickt, soll die Karte als
// Quelle behalten. (/signup ueberschreibt bewusst weiterhin — ein Flyer-Link
// direkt auf die Registrierung ist die juengere, gezieltere Angabe.)
function quelleAuffangen() {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(SIGNUP_SOURCE_KEY)) return;
    const src = new URLSearchParams(window.location.search)
      .get("src")
      ?.toLowerCase()
      .trim();
    if (src && SIGNUP_SOURCE_RE.test(src)) {
      window.sessionStorage.setItem(SIGNUP_SOURCE_KEY, src);
    }
  } catch {
    /* sessionStorage kann blockiert sein – dann eben keine Quelle */
  }
}

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

// Erfasst Seitenaufrufe bei jedem Routenwechsel (Admin-Bereich ausgenommen).
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Vor der Bereichsprüfung: Die Quelle soll auch dann erhalten bleiben,
    // wenn der Aufruf selbst nicht gezählt wird.
    quelleAuffangen();

    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/sponsor-report")) return;
    // Player-Token mitsenden (falls eingeloggt) → Server leitet daraus „aktive Nutzer" ab.
    const token =
      (typeof window !== "undefined" &&
        window.localStorage.getItem("playerAuthToken")) ||
      undefined;
    axios
      .post("/api/analytics/track", {
        eventType: "pageview",
        path: pathname,
        sessionId: getSessionId(),
        token,
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
