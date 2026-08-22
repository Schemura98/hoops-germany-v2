"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SIGNUP_SOURCE_KEY, SIGNUP_SOURCE_RE } from "@/lib/constants";
import { sendeAnalyticsEreignis } from "@/lib/analyticsClient";

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
// Rückgabe: die JETZT neu gefangene Quelle, sonst null. Aus der Rückgabe wird
// unten das Landungs-Ereignis — deshalb nur beim ERSTEN Fang der Sitzung, nie
// bei einer schon gepufferten Quelle (sonst zählte jeder Routenwechsel als
// neuer „Scan").
function quelleAuffangen() {
  if (typeof window === "undefined") return null;
  try {
    if (window.sessionStorage.getItem(SIGNUP_SOURCE_KEY)) return null;
    const src = new URLSearchParams(window.location.search)
      .get("src")
      ?.toLowerCase()
      .trim();
    if (src && SIGNUP_SOURCE_RE.test(src)) {
      window.sessionStorage.setItem(SIGNUP_SOURCE_KEY, src);
      return src;
    }
  } catch {
    /* sessionStorage kann blockiert sein – dann eben keine Quelle */
  }
  return null;
}

// Erfasst Seitenaufrufe bei jedem Routenwechsel (Admin-Bereich ausgenommen).
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Vor der Bereichsprüfung: Die Quelle soll auch dann erhalten bleiben,
    // wenn der Aufruf selbst nicht gezählt wird.
    const neueQuelle = quelleAuffangen();

    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/sponsor-report")) return;
    // Der Riegel selbst sitzt seit Roadmap 39 in `lib/analyticsClient.js` —
    // EINE geteilte Stelle für beide Sendewege (Tracker + trackEvent).
    sendeAnalyticsEreignis("pageview", pathname);

    // KANAL-LANDUNG (22.08.2026): Wer mit `?src=` ankommt, wird EINMAL je
    // Sitzung als Landung gezählt — das ist die obere Stufe des
    // Kanal-Trichters im Admin-Analytics (Scans → Registrierungen → Teams).
    // Vorher zählte erst die Registrierung; zwischen „niemand scannt den QR"
    // und „Leute scannen und springen ab" konnte niemand unterscheiden —
    // zwei völlig verschiedene Probleme mit derselben Null.
    if (neueQuelle) {
      sendeAnalyticsEreignis("src_landing", pathname, neueQuelle);
    }
  }, [pathname]);

  return null;
}
