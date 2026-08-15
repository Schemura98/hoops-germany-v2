"use client";

import { forwardRef } from "react";

// Rein präsentationale Vektor-Bausteine, die den Ball durch die ganze Startseite
// tragen (A10 "ein Motiv trägt alle Szenen", Konzept
// docs/SPIELFELD-STRECKE-2026-08-12.md). Keine eigene Logik, keine eigenen
// Listener – Position und Deckkraft setzt ausschließlich der jeweilige
// rAF-Controller (HeroScrollStage.js für den Fall, FeatureProgressRail.js für
// den Ritt auf der Fortschritts-Leiste) über die weitergereichte ref.
//
// Zwei Auftritte, ein Motiv: BallGlyph (Hero, Verlauf+Schatten – bewusst
// unangetastet, s. HeroScrollStage.js) und RailBallGlyph (Fortschritts-Leiste,
// FLACH: kein Verlauf, kein Schatten, nur brand-500 – neue Elemente der
// Spielfeld-Strecke folgen der Vorgabe "keine Verläufe, keine Schatten, kein
// Glow"). HoopEmblem ist das gemeinsame Ziel: früher am Hero-CTA, jetzt am Ende
// der Fortschritts-Leiste (Begründung + Freigabe: SPIELFELD-STRECKE Abschnitt 3,
// Patricks Freigabe "Ball-Landung darf entfallen" vom 12.08.2026).

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

// Korb-Emblem – Ring + Netz, bewusst klein (wie ein Abzeichen). Bis 12.08.2026
// an der Hero-CTA, jetzt das Reiseziel am Ende der Fortschritts-Leiste
// (FeatureProgressRail.js). `ringRef` ist optional und zeigt zusätzlich auf den
// Ring allein – dorthin setzt die Ankunfts-Animation kurz den Signalton
// `signal-ok`, ohne die Netz-Linien mitzufärben.
export const HoopEmblem = forwardRef(function HoopEmblem({ ringRef, ...props }, ref) {
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
      <ellipse ref={ringRef} cx="10" cy="3" rx="8.5" ry="2.4" stroke="#F68C3E" strokeWidth="1.6" />
      <g stroke="#F5F7FA" strokeOpacity=".55" strokeWidth="0.9" strokeLinecap="round">
        <path d="M2.2 3.6Q3.4 9 6.6 12.4M17.8 3.6Q16.6 9 13.4 12.4M10 5.4V12.8" />
        <path d="M4 6.6Q10 8.9 16 6.6M5.8 9.8Q10 11.6 14.2 9.8" />
      </g>
    </svg>
  );
});

// Ball-Marker der Fortschritts-Leiste: derselbe Ball, aber FLACH – reines
// brand-500, ohne den Verlauf/Schatten des Hero-Balls. Die Wiedererkennung
// trägt hier über Farbe/Form/Bewegung, nicht über Bilddetail.
//
// ⚠️ GRÖSSE UND DREHUNG GEHÖREN ZUSAMMEN (15.08.2026, Auftrag Patrick).
// Vorher: 14px, und der Controller setzte AUSSCHLIESSLICH `translate3d` – der
// Ball glitt die Leiste hinunter, ohne sich zu drehen. Gemessen legte er über
// den halben Seitenscroll (~2.500px) rund 100px zurück; als 14px-Punkt auf
// einer Haarlinie war er als Ball praktisch nicht wahrnehmbar.
//
// Jetzt 20px UND scroll-gekoppelte Rollbewegung (`rollwinkel()` unten). Beides
// zusammen, denn einzeln macht keines davon den Unterschied: Ein größerer Ball
// ohne Drehung ist ein größerer Punkt, eine Drehung an einem 14px-Punkt sieht
// niemand.
//
// ⚠️ Die Grenze dieser Lösung, damit sie niemand für mehr hält, als sie ist:
// Das ist eine FLÄCHENDREHUNG. Ein echter Ball rotiert um eine Achse, seine
// Nähte verschwinden hinter der Kugel. Bei 20px trägt die Täuschung, weil das
// Auge die Naht als Speiche liest. **Deutlich größer darf dieser Glyph nicht
// werden** – ab etwa 40px kippt er ins Rad-Artige. Wer mehr Präsenz will,
// braucht anderes Material (gerenderte Bildsequenz), nicht mehr Pixel.
export const RAIL_BALL_PX = 20;
export const RAIL_BALL_R = RAIL_BALL_PX / 2;

// Rollwinkel in Grad für eine zurückgelegte Strecke: Ein Ball, der ohne zu
// rutschen rollt, dreht sich um Strecke/Radius (Bogenmaß). Genau deshalb wirkt
// es physikalisch – die Drehung ist nicht frei gewählt, sie folgt dem Weg.
export const rollwinkel = (streckePx) => (streckePx / RAIL_BALL_R) * (180 / Math.PI);

export const RailBallGlyph = forwardRef(function RailBallGlyph(props, ref) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={RAIL_BALL_PX}
      height={RAIL_BALL_PX}
      viewBox="0 0 14 14"
      fill="none"
      className="pointer-events-none absolute left-0 top-1/2 opacity-0 will-change-transform"
      style={{ transformOrigin: `${RAIL_BALL_R}px ${RAIL_BALL_R}px` }}
      {...props}
    >
      <circle cx="7" cy="7" r="6" fill="#F07A27" />
      <g stroke="#0B1220" strokeOpacity=".35" strokeWidth="0.8" strokeLinecap="round">
        <path d="M1.3 7h11.4M7 1.3v11.4" />
        <path d="M2.9 2.9c2.2 2.4 2.2 6.4 0 8.8M11.1 2.9c-2.2 2.4-2.2 6.4 0 8.8" />
      </g>
    </svg>
  );
});
