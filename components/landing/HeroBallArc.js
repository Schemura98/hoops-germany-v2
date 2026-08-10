"use client";

import { useEffect, useRef, useState } from "react";

// Leichter Scroll-Akzent im Hero: ein Ball zieht beim Runterscrollen einen Bogen
// in den Korb neben dem CTA-Block und fällt am Ende durch das Netz. Reines
// Overlay ÜBER dem bestehenden Hero-Foto (Foto/Dark-Overlay unverändert) –
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
// Mobile-Entscheidung (11.08.2026 geprüft, bewusst beibehalten): Unter xl
// (1280px) reicht die Gutter neben dem max-w-4xl-Content-Block nicht für einen
// unaufdringlichen Bogen. Auf Telefonen läuft der Hero-Text bis an beide Ränder
// und füllt bei kleinen Viewports die volle Höhe – jede Bahn würde entweder
// Headline/Buttons kreuzen oder unter dem Falz enden. Deshalb bleibt der Akzent
// Desktop-only ("ehrlich statt poliert"); die mobile Wirkung soll später aus
// echtem Hallenmaterial kommen, nicht aus einem gedrängten Mini-Bogen.
// prefers-reduced-motion: Komponente rendert dann gar nichts (aktiv per
// matchMedia geprüft, kein CSS-Only-Fallback).
const CONTENT_MAX_WIDTH = 896; // entspricht max-w-4xl des Hero-Content-Blocks
const MIN_GUTTER = 96; // px Seitenraum, unter dem der Akzent gedrängt wirkt
const NAVBAR_HEIGHT = 64; // h-16 der sticky Navbar

const BALL_R = 14; // halbe Breite/Höhe der Ball-SVG (für Zentrierung)
const HOOP_CX = 32; // Ring-Mittelpunkt in der Korb-SVG (x)
const HOOP_CY = 24; // Ring-Mittelpunkt in der Korb-SVG (y)

// Ab hier fällt der Ball durch den Ring (statt am Ringmittelpunkt zu enden).
const THROUGH_START = 0.88;
const THROUGH_DROP = 18; // px, die er dabei zusätzlich nach unten sinkt

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
      const p2x = rect.width - gutter * 0.45; // Zielpunkt = Ring, nahe der CTA-Zeile
      const p2y = rect.height * 0.66;

      const scrolled = Math.max(0, NAVBAR_HEIGHT - rect.top);
      const t = Math.min(1, scrolled / (rect.height * 0.55));
      const mt = 1 - t;

      // Kurzer „Swish": der Ring gibt beim Durchfallen minimal nach.
      const swish =
        t > THROUGH_START ? Math.sin(((t - THROUGH_START) / (1 - THROUGH_START)) * Math.PI) : 0;
      hoop.style.transform = `translate3d(${(p2x - HOOP_CX).toFixed(1)}px, ${(
        p2y - HOOP_CY
      ).toFixed(1)}px, 0) scale(${(1 + swish * 0.05).toFixed(3)})`;
      hoop.style.opacity = String(0.8 + swish * 0.2);

      const x = mt * mt * p0x + 2 * mt * t * p1x + t * t * p2x;
      let y = mt * mt * p0y + 2 * mt * t * p1y + t * t * p2y;

      // Sanftes Ein-/Ausblenden am Bahnanfang und Durchfallen am Ende statt
      // hartem Pop bzw. Stehenbleiben auf dem Ring.
      let opacity = 1;
      if (t < 0.06) {
        opacity = t / 0.06;
      } else if (t > THROUGH_START) {
        const through = (t - THROUGH_START) / (1 - THROUGH_START);
        y += through * THROUGH_DROP;
        opacity = Math.max(0, 1 - through);
      }

      const rotate = t * 320;

      ball.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${(y - BALL_R).toFixed(
        1
      )}px, 0) rotate(${rotate.toFixed(1)}deg)`;
      ball.style.opacity = String(opacity);
    };

    // Geplanten Frame merken, damit er beim Abmelden (z. B. Resize unter den
    // Breakpoint mitten im Scrollen) nicht mehr gegen bereits entfernte Nodes
    // läuft – Deploy-Gate-Befund Kai, 10.08.2026.
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
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
    >
      {/* Korb – Brett, Ring, Netz als Rautenmuster (statischer Endpunkt des Bogens) */}
      <svg
        ref={hoopRef}
        width="64"
        height="46"
        viewBox="0 0 64 46"
        fill="none"
        className="absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ transformOrigin: `${HOOP_CX}px ${HOOP_CY}px` }}
      >
        {/* Brett + Zielfeld */}
        <rect x="17" y="1" width="30" height="20" rx="2" stroke="#fff" strokeOpacity=".28" strokeWidth="1.4" />
        <rect x="26" y="8" width="12" height="10" rx="1" stroke="#fff" strokeOpacity=".28" strokeWidth="1.2" />
        {/* Ring (leicht perspektivisch) + Aufhängung */}
        <path d="M32 21v3" stroke="#fb923c" strokeOpacity=".9" strokeWidth="1.6" />
        <ellipse cx="32" cy="24" rx="13" ry="3.6" stroke="#fb923c" strokeOpacity=".95" strokeWidth="2" />
        {/* Netz: 5 Stränge + 2 Querbögen ergeben das typische Rautenmuster */}
        <g stroke="#fff" strokeOpacity=".42" strokeWidth="1.1" strokeLinecap="round">
          <path d="M19.2 24.8Q21 34 26.4 40.5M45 24.8Q43 34 37.6 40.5M24.6 27.2Q25 34 28.8 41M39.4 27.2Q39 34 35.2 41M32 27.6V41.4" />
          <path d="M21.4 30.4Q32 34.6 42.6 30.4M24.4 35.2Q32 38.6 39.6 35.2M26.8 40.4Q32 42.6 37.2 40.4" />
        </g>
      </svg>

      {/* Ball – Position wird per rAF/Scroll-Fortschritt gesetzt */}
      <svg
        ref={ballRef}
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="absolute left-0 top-0 opacity-0 will-change-transform"
        style={{ transformOrigin: "14px 14px", filter: "drop-shadow(0 2px 5px rgba(0,0,0,.45))" }}
      >
        <defs>
          <radialGradient id="hoopsBall" cx="36%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <circle cx="14" cy="14" r="12" fill="url(#hoopsBall)" />
        {/* Nähte: Längs-/Querlinie plus die beiden geschwungenen Seitennähte */}
        <g stroke="#7c2d12" strokeOpacity=".85" strokeWidth="1.2" strokeLinecap="round" fill="none">
          <path d="M2.2 14h23.6M14 2.2v23.6" />
          <path d="M5.1 5.1c4.3 4.9 4.3 12.9 0 17.8M22.9 5.1c-4.3 4.9-4.3 12.9 0 17.8" />
        </g>
        <circle cx="14" cy="14" r="12" stroke="#7c2d12" strokeOpacity=".45" strokeWidth="1" />
      </svg>
    </div>
  );
}
