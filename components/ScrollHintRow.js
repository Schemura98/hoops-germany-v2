"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PiCaretRightBold } from "react-icons/pi";

/**
 * Horizontal scrollbarer Container mit Scroll-Affordance:
 * Rand-Fade + pulsierender Pfeil rechts erscheinen nur, wenn es noch
 * Inhalt zum Wischen gibt (links/rechts je nach Scroll-Position).
 * Hilft Nutzern zu verstehen, dass sich die Kacheln zur Seite bewegen lassen.
 */
export default function ScrollHintRow({ children, className = "", fadeColor = "from-navy-900" }) {
  const ref = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true); // Standard: kein Hinweis, bis Overflow bekannt ist

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scrollable = el.scrollWidth - el.clientWidth > 2;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(!scrollable || el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return (
    <div className={`relative ${className}`}>
      <div ref={ref} className="overflow-x-auto">
        {children}
      </div>

      {!atStart && (
        <div
          className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 rounded-tl-2xl bg-gradient-to-r ${fadeColor} to-transparent`}
        />
      )}
      {!atEnd && (
        <div
          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-10 flex items-center justify-end pr-1.5 rounded-tr-2xl bg-gradient-to-l ${fadeColor} to-transparent`}
        >
          <PiCaretRightBold className="text-paper-50/80 text-sm animate-pulse" />
        </div>
      )}
    </div>
  );
}
