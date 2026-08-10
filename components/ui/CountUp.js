"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";

// Zählt eine Zahl von 0 auf `value` hoch, sobald sie in den Viewport scrollt –
// dezente "wird lebendig"-Geste für Statistiken (Karrierewerte, Produkt-
// Miniaturen auf der Landing-Page). Reduzierte Bewegung: Endwert erscheint
// sofort, kein Hochzählen (echte Ziffernänderung zählt hier als Bewegung).
export default function CountUp({ value, decimals = 0, duration = 900, className = "" }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView || started) return;
    setStarted(true);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(target);
      return;
    }
    setDisplay(0);
    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(target * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display.toFixed(decimals)}
    </span>
  );
}
