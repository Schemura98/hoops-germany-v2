"use client";

import { useEffect, useRef } from "react";

// Maßstabssprung auf der Feature-Strecke (Konzept
// docs/WOW-KONZEPT-2026-08-12.md, Stufe A.3).
//
// Der Mechanismus, den Apple durchgängig einsetzt: Es ist immer genau EIN Motiv
// im Fokus, alles andere tritt zurück. Hier heißt das: Die Szene, die gerade
// mittig im Bild steht, ist voll da – ihre Nachbarn sind eine Spur kleiner und
// gedämpft. Man scrollt dadurch nicht an sechs gleichwertigen Blöcken vorbei,
// sondern durch sechs Momente.
//
// Bewusst SCHRUMPFEN statt vergrößern: Ein `scale(1.02)` auf der aktiven Zeile
// würde sie über die Containerbreite hinausschieben. Die Sektion schneidet zwar
// ab (`overflow-x-clip`), aber die Karte liefe sichtbar in die Kante. Der
// relative Sprung ist derselbe, das Risiko nicht.
//
// Ein Listener für die ganze Strecke, rAF-gedrosselt, direkte Style-Mutation
// ohne Re-Render – dieselbe Disziplin wie in HeroScrollStage.js und
// FeatureProgressRail.js.
const RUHE_SCALE = 0.955;
const RUHE_OPACITY = 0.45;
// Abstand vom Bildschirmmittelpunkt (als Anteil der Fensterhöhe), ab dem eine
// Szene vollständig zurückgetreten ist.
const REICHWEITE = 0.55;

export default function FeatureFocus({ className = "", children }) {
  const wrapRef = useRef(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Reduzierte Bewegung: alles bleibt gleichwertig und voll sichtbar. Ein
    // gedämpfter Nachbar wäre hier kein „ruhiger Zustand", sondern ein
    // dauerhaft schlechter lesbarer Text.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const zeilen = Array.from(wrap.children);
    zeilen.forEach((el) => {
      el.style.transition = "transform 320ms cubic-bezier(0.23, 1, 0.32, 1), opacity 320ms ease-out";
      el.style.willChange = "transform, opacity";
    });

    const apply = () => {
      tickingRef.current = false;
      const mitte = window.innerHeight / 2;
      const reichweite = window.innerHeight * REICHWEITE;
      for (const el of zeilen) {
        const r = el.getBoundingClientRect();
        const abstand = Math.abs(r.top + r.height / 2 - mitte);
        // 0 = mittig im Bild, 1 = außerhalb der Reichweite
        const weg = Math.min(1, abstand / reichweite);
        el.style.transform = `scale(${(1 - (1 - RUHE_SCALE) * weg).toFixed(4)})`;
        el.style.opacity = (1 - (1 - RUHE_OPACITY) * weg).toFixed(3);
      }
    };

    let raf = 0;
    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      // Beim Abräumen den Ruhezustand zurückgeben, damit nichts geschrumpft
      // oder halbdurchsichtig stehen bleibt.
      zeilen.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
        el.style.willChange = "";
        el.style.transition = "";
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      {children}
    </div>
  );
}
