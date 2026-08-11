"use client";

import { forwardRef } from "react";

// Rein präsentationale Vektor-Bausteine der Hero-Bühne ("Sprungball", Konzept
// docs/HERO-KONZEPT-2026-08-11.md). Keine eigene Logik, keine eigenen Listener –
// Position und Deckkraft setzt ausschließlich der rAF-Controller in
// HeroScrollStage.js über die weitergereichte ref. Ball- und Korb-Motiv sind aus
// dem bisherigen HeroBallArc.js übernommen (gleiche Nähte, gleiches Netz-Raster).

// Drei-Punkte-Linie als Hintergrund-Motiv. Liegt am unteren Rand der Bühne und
// ist bewusst breiter als der Viewport, damit die Bögen an den Seiten auslaufen.
export const CourtArc = forwardRef(function CourtArc(props, ref) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 400 200"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute bottom-0 left-1/2 w-[150%] max-w-none -translate-x-1/2 opacity-0"
      {...props}
    >
      <path
        d="M24 200 L24 132 A176 176 0 0 0 376 132 L376 200"
        stroke="#F07A27"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
});

// Ball – fällt scroll-synchron zur Registrieren-Schaltfläche.
export const BallGlyph = forwardRef(function BallGlyph(props, ref) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
      style={{ transformOrigin: "14px 14px", filter: "drop-shadow(0 2px 5px rgba(0,0,0,.45))" }}
      {...props}
    >
      <defs>
        <radialGradient id="hoopsBall" cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#FFC58C" />
          <stop offset="55%" stopColor="#F07A27" />
          <stop offset="100%" stopColor="#B04D0D" />
        </radialGradient>
      </defs>
      <circle cx="14" cy="14" r="12" fill="url(#hoopsBall)" />
      <g stroke="#4F2107" strokeOpacity=".85" strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M2.2 14h23.6M14 2.2v23.6" />
        <path d="M5.1 5.1c4.3 4.9 4.3 12.9 0 17.8M22.9 5.1c-4.3 4.9-4.3 12.9 0 17.8" />
      </g>
      <circle cx="14" cy="14" r="12" stroke="#4F2107" strokeOpacity=".45" strokeWidth="1" />
    </svg>
  );
});

// Korb-Emblem an der oberen Ecke der Registrieren-Schaltfläche: Ring + Netz,
// bewusst klein (wie ein Abzeichen) und nie über der Beschriftung.
export const HoopEmblem = forwardRef(function HoopEmblem(props, ref) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      className="pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform"
      style={{ transformOrigin: "10px 3px" }}
      {...props}
    >
      <ellipse cx="10" cy="3" rx="8.5" ry="2.4" stroke="#F68C3E" strokeWidth="1.6" />
      <g stroke="#FAF7F2" strokeOpacity=".55" strokeWidth="0.9" strokeLinecap="round">
        <path d="M2.2 3.6Q3.4 9 6.6 12.4M17.8 3.6Q16.6 9 13.4 12.4M10 5.4V12.8" />
        <path d="M4 6.6Q10 8.9 16 6.6M5.8 9.8Q10 11.6 14.2 9.8" />
      </g>
    </svg>
  );
});
