"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiChatCircleDotsBold } from "react-icons/pi";

// Schwebender Feedback-Button (Testphase) – auf allen Seiten sichtbar,
// ausgenommen die Feedback-Seite selbst, der interne Admin-Bereich und die
// Einstiegs-/Formularstrecke (siehe OHNE_KNOPF).
// Blendet sich beim Runterscrollen aus, damit er keinen Content verdeckt,
// und erscheint beim Hochscrollen (oder oben auf der Seite) wieder.
// Auf diesen Seiten wird der Knopf ausgeblendet.
//
// /feedback und /admin waren immer schon draußen. Neu dazu kommt die
// Einstiegs- und Formularstrecke, und zwar aus einem gemessenen Grund: Auf
// einem 390x640-Bildschirm liegt der Knopf über den letzten 36 Pixeln von
// „Konto erstellen" (tmp/fab-messen.mjs) – ausgerechnet über dem Knopf, auf
// den der Tester-Flyer zeigt.
//
// Zuerst hatte ich versucht, unten Platz zu schaffen. Das machte die Seite nur
// höher, ohne den Knopf zu bewegen – zurückgedreht. Ausblenden ist hier auch
// inhaltlich richtig: Wer sich gerade registriert oder anmeldet, hat noch
// nichts, worüber er Rückmeldung geben könnte, und /kontakt ist selbst ein
// Formular für genau diesen Zweck.
const OHNE_KNOPF = [
  "/feedback",
  "/admin",
  "/signup",
  "/login",
  "/reset-password",
  "/kontakt",
  "/oauth-landing",
  "/team/claim",
  "/team/join",
];

export default function FeedbackButton() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // kleine Toleranz, damit Mikro-Scrolls (z.B. iOS Bounce) nicht flackern
      if (y > lastY.current + 4 && y > 80) {
        setHidden(true);
      } else if (y < lastY.current - 4 || y <= 80) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!pathname || OHNE_KNOPF.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <Link
      href="/feedback"
      aria-label="Feedback geben"
      title="Feedback geben"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      // text-navy-950 statt paper-50: Weiss auf brand-500 sind 2,61:1. Der Knopf
      // war die letzte Stelle mit der alten Altlast - uebersehen, weil seine
      // Klassen in einem Template-Literal stehen und der Durchlauf nur
      // doppelt gequotete Zeichenketten ansah. Schatten raus, wie ueberall.
      className={`fixed right-4 sm:right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-navy-950 p-3.5 sm:px-4 sm:py-3 text-sm font-semibold transition-all duration-300 ${
        hidden ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <PiChatCircleDotsBold className="text-base" />
      <span className="hidden sm:inline">Feedback</span>
    </Link>
  );
}
