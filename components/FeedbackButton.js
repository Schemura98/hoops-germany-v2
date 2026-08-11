"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiChatCircleDotsBold } from "react-icons/pi";

// Schwebender Feedback-Button (Testphase) – auf allen Seiten sichtbar,
// ausgenommen die Feedback-Seite selbst und der interne Admin-Bereich.
// Blendet sich beim Runterscrollen aus, damit er keinen Content verdeckt,
// und erscheint beim Hochscrollen (oder oben auf der Seite) wieder.
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

  if (!pathname || pathname.startsWith("/feedback") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href="/feedback"
      aria-label="Feedback geben"
      title="Feedback geben"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`fixed right-4 sm:right-5 z-40 inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-400 text-paper-50 shadow-brand-500/30 p-3.5 sm:px-4 sm:py-3 text-sm font-semibold transition-all duration-300 ${
        hidden ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      }`}
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <PiChatCircleDotsBold className="text-base" />
      <span className="hidden sm:inline">Feedback</span>
    </Link>
  );
}
