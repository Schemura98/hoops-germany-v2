"use client";

import { useEffect, useRef, useState } from "react";

// Einfacher IntersectionObserver-Hook fürs Scroll-Reveal (components/ui/Reveal.js,
// components/ui/CountUp.js). `once`: Element bleibt sichtbar, sobald es einmal im
// Viewport war (kein Aus-/Einblinken beim Hoch-/Runterscrollen).
// Reduzierte Bewegung: Inhalt gilt sofort als "sichtbar" (kein Warten auf Scroll),
// die eigentliche Bewegung wird von den aufrufenden Komponenten selbst unterdrückt.
export function useInView({ threshold = 0.2, rootMargin = "0px 0px -80px 0px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
