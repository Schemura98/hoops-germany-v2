"use client";

import { useEffect, useRef, useState } from "react";

// Leichter Scroll-Akzent im Hero: ein kleiner Ball zieht beim Runterscrollen
// einen Bogen zu einem Korb-Symbol nahe dem CTA-Block. Reines Overlay ÜBER
// dem bestehenden Hero-Foto (das Foto/der Dark-Overlay bleiben unverändert) –
// pointer-events: none, keine zusätzliche Scrollstrecke, kein Pinning.
//
// Bewegungsquelle: die eigene Scrollposition des Hero-Containers relativ zur
// (sticky) Navbar – kein Scroll-Lock, es wird nur der ohnehin vorhandene
// Scrollweg durch den Hero (calc(100vh - 4rem)) ausgelesen.
//
// Nur transform/opacity werden animiert (rAF-gedrosselt, direkte Style-Mutation
// statt React-Re-Render pro Frame). Position wird per Kontrollpunkt-Bogen
// (quadratische Bézierkurve) berechnet und ausschließlich in der rechten
// "Foto-Gutter" neben dem zentrierten Content-Block platziert – so kreuzt der
// Ball nie Headline/Fließtext/Buttons (Lesbarkeit bleibt unberührt).
//
// Mobile-Entscheidung: Unter xl (1280px) reicht die Gutter neben dem
// max-w-4xl-Content-Block nicht für einen unaufdringlichen Bogen – lieber ganz
// weglassen als gedrängt/überlappend wirken ("ehrlich statt poliert").
// prefers-reduced-motion: Komponente rendert dann gar nichts (aktiv per
// matchMedia geprüft, kein CSS-Only-Fallback).
const CONTENT_MAX_WIDTH = 896; // entspricht max-w-4xl des Hero-Content-Blocks
const MIN_GUTTER = 96; // px Seitenraum, unter dem der Akzent gedrängt wirkt
const NAVBAR_HEIGHT = 64; // h-16 der sticky Navbar

const BALL_R = 13; // halbe Breite/Höhe der Ball-SVG (für Zentrierung)
const HOOP_CX = 28; // Rim-Mittelpunkt in der Hoop-SVG (x)
const HOOP_CY = 8; // Rim-Mittelpunkt in der Hoop-SVG (y)

export default function HeroBallArc() {
  const wrapRef = useRef(null);
  const ballRef = useRef(null);
  const hoopRef = useRef(null);
  const tickingRef = useRef(false);
  const [active, setActive] = useState(false);

  // Aktivierung: genug Platz (>= xl) UND keine reduzierte Bewegung gewünscht.
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(min-width: 1280px)");

    const update = () => setActive(widthQuery.matches && !motionQuery.matches);
    update();

    motionQuery.addEventListener("change", update);
    widthQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      widthQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const wrap = wrapRef.current;
    const ball = ballRef.current;
    const hoop = hoopRef.current;
    if (!wrap || !ball || !hoop) return;

    const apply = () => {
      tickingRef.current = false;
      const rect = wrap.getBoundingClientRect();
      const gutter = Math.max(0, (rect.width - CONTENT_MAX_WIDTH) / 2);

      if (gutter < MIN_GUTTER) {
        ball.style.opacity = "0";
        hoop.style.opacity = "0";
        return;
      }

      // Bahnpunkte, verankert in der rechten Gutter (nie über dem Content).
      const p0x = rect.width - gutter * 0.65;
      const p0y = rect.height * 0.16;
      const p1x = rect.width - gutter * 0.15; // Kontrollpunkt: Bogen-Bauch nach außen
      const p1y = rect.height * 0.38;
      const p2x = rect.width - gutter * 0.45; // Zielpunkt = Korb, nahe der CTA-Zeile
      const p2y = rect.height * 0.66;

      hoop.style.transform = `translate3d(${(p2x - HOOP_CX).toFixed(1)}px, ${(p2y - HOOP_CY).toFixed(1)}px, 0)`;
      hoop.style.opacity = "0.8";

      const scrolled = Math.max(0, NAVBAR_HEIGHT - rect.top);
      const t = Math.min(1, scrolled / (rect.height * 0.55));
      const mt = 1 - t;

      const x = mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
      const y = mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;

      // Sanftes Ein-/Ausblenden am Bahnanfang/-ende statt hartem Pop.
      let opacity = 1;
      if (t < 0.06) opacity = t / 0.06;
      else if (t > 0.9) opacity = Math.max(0.35, 1 - ((t - 0.9) / 0.1) * 0.65);

      const rotate = t * 320;

      ball.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${(y - BALL_R).toFixed(1)}px, 0) rotate(${rotate.toFixed(1)}deg)`;
      ball.style.opacity = String(opacity);
    };

    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
    >
      {/* Korb/Netz – statischer Endpunkt des Bogens */}
      <svg
        ref={hoopRef}
        width="56"
        height="34"
        viewBox="0 0 56 34"
        fill="none"
        className="absolute left-0 top-0 opacity-0 will-change-transform"
      >
        <ellipse cx="28" cy="8" rx="22" ry="6" stroke="white" strokeOpacity="0.75" strokeWidth="2" />
        <path
          d="M8,8 L13,29 M48,8 L43,29 M18,8.5 L21,27 M38,8.5 L35,27 M28,9 L28,29"
          stroke="white"
          strokeOpacity="0.4"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>

      {/* Ball – Position wird per rAF/Scroll-Fortschritt gesetzt */}
      <svg
        ref={ballRef}
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        className="absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ transformOrigin: "13px 13px" }}
      >
        <circle cx="13" cy="13" r="11" fill="#f97316" />
        <path
          d="M2,13 H24 M13,2 V24 M4.2,4.2 C9,9 9,17 4.2,21.8 M21.8,4.2 C17,9 17,17 21.8,21.8"
          stroke="#c2410c"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </div>
  );
}
