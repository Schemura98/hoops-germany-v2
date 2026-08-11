"use client";

import { useCallback, useEffect, useRef } from "react";

// Waagerecht scrollbare Tabelle mit sichtbarem Hinweis, dass es seitlich
// weitergeht (Design-Review 10.08.2026, Welle 3, Befund 9).
//
// Problem vorher: Rangliste, Topscorer und Liga-Tabelle standen in einem
// nackten `overflow-x-auto`. Auf 375px sieht man dadurch entweder den
// Teamnamen ODER die Korbdifferenz – und nichts deutet an, dass man wischen
// kann. Zwei Bausteine lösen das gemeinsam:
//   1. Diese Komponente blendet an der Kante einen dezenten Verlauf ein,
//      solange in diese Richtung noch Inhalt liegt.
//   2. Die aufrufende Tabelle stellt ihre Namensspalte auf `sticky left-0`
//      (mit `bg-inherit`, damit Zebra-/Hover-Hintergrund erhalten bleibt),
//      sodass der Name beim Wischen stehen bleibt.
//
// Nur `opacity` wird animiert, ein rAF-gedrosselter Scroll-Listener, direkte
// Style-Mutation ohne Re-Render – dieselbe Disziplin wie in HeroScrollStage.js.
export default function ScrollTable({ label = "Tabelle", className = "", children }) {
  const scrollRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const tickingRef = useRef(false);

  const update = useCallback(() => {
    tickingRef.current = false;
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // 1px Toleranz: subpixelgenaue Breiten sonst als "noch scrollbar" gewertet.
    if (leftRef.current) leftRef.current.style.opacity = el.scrollLeft > 1 ? "1" : "0";
    if (rightRef.current) rightRef.current.style.opacity = el.scrollLeft < max - 1 ? "1" : "0";
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const onChange = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(update);
    };

    update();
    el.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    // Inhalt kann nach dem ersten Rendern noch wachsen (Bilder, Schriften,
    // nachgeladene Zeilen) – dann muss der Hinweis neu bewertet werden.
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onChange) : null;
    observer?.observe(el);
    if (el.firstElementChild) observer?.observe(el.firstElementChild);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      el.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      observer?.disconnect();
    };
  }, [update]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        // tabIndex + role: Ein scrollbarer Bereich muss auch per Tastatur
        // erreichbar sein, sonst kommen Tastaturnutzer nicht an die rechten
        // Spalten (WCAG 2.1.1).
        tabIndex={0}
        role="group"
        aria-label={label}
        className={`overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 ${className}`}
      >
        {children}
      </div>
      <div
        ref={leftRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-ink-950 to-transparent opacity-0 transition-opacity duration-200 motion-reduce:transition-none"
      />
      <div
        ref={rightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-ink-950 to-transparent opacity-0 transition-opacity duration-200 motion-reduce:transition-none"
      />
    </div>
  );
}
