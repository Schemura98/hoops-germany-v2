"use client";

import { forwardRef } from "react";

// Taktiktafel der Hero-Bühne: ein Spielzug, der sich beim Scrollen selbst
// zeichnet (Konzept: docs/WOW-KONZEPT-2026-08-12.md, Stufe A.1).
//
// Warum das hier steht und nicht ein Foto oder eine Bildsequenz: Der Mechanismus,
// an dem Apples Wow hängt, ist eine scroll-gebundene Bildsequenz – die braucht
// erstklassiges Bildmaterial. Das basketball-eigene Äquivalent ist die
// Taktiktafel: eine Linie, die entsteht, während man scrollt. Reines SVG, keine
// Bilddaten, keine Bibliothek.
//
// Technik 1 – Zeichnen: Jeder Pfad trägt `pathLength="1"`. Dadurch ist seine
// Länge – egal wie lang er geometrisch wirklich ist – auf 1 normiert, und
// `strokeDashoffset` von 1 nach 0 zeichnet ihn exakt von Anfang bis Ende. Ohne
// das müsste man pro Pfad `getTotalLength()` messen, also pro Bild aufs Layout
// zugreifen – genau das wollen wir nicht.
//
// Technik 2 – Maßstab: Der erste Entwurf skalierte über die Seitenbreite
// (`w-[150%]`); auf 1280px wurde daraus Faktor 4,8 und aus einer Positionsmarke
// ein 33px-Ring quer über den Schaltflächen. Der zweite Versuch (`slice`) füllte
// zwar sauber, beschnitt auf dem Handy aber so stark, dass nur noch der Bereich
// x∈[276,623] sichtbar war – nachgemessen, nicht geschätzt (tmp/play-messen.mjs):
// beide Positionsmarken lagen außerhalb.
//
// Deshalb jetzt `meet`: nichts wird beschnitten, der Spielzug ist auf jeder
// Breite vollständig zu sehen. Der Preis ist, dass die Tafel auf dem Handy zu
// einem kompakten Band am unteren Rand wird statt die ganze Fläche zu füllen –
// das ist die richtige Seite des Tauschs, denn ein halber Spielzug erzählt
// nichts.
//
// Die Zeitfenster stehen als `data-from`/`data-to` am Element, nicht im
// Controller: So kann die Choreografie hier geändert werden, ohne die
// rAF-Schleife in HeroScrollStage.js anzufassen.
//
// `gezeichnet`: ruhiger Endzustand für prefers-reduced-motion. Ohne das stünde
// der Spielzug dort auf strokeDashoffset=1, also unsichtbar – der Hero hätte
// für Nutzer mit reduzierter Bewegung gar keinen Hintergrund mehr.
export const PlayDiagram = forwardRef(function PlayDiagram({ gezeichnet = false, ...props }, ref) {
  const offset = gezeichnet ? 0 : 1;
  const sichtbar = gezeichnet ? 1 : 0;

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="0 0 900 700"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      {...props}
    >
      <defs>
        <marker
          id="hoopsPfeil"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="4.5"
          markerHeight="4.5"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L8 4 L0 8 z" fill="#F07A27" />
        </marker>
      </defs>

      {/* Das ruhende Feld: Mittelkreis, Zone und Drei-Punkte-Linie. Zeichnet
          sich zuerst – der Spielzug braucht erst ein Feld, auf dem er stattfindet. */}
      <g
        stroke="#F07A27"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        <path
          data-play-line
          data-from="0"
          data-to="0.4"
          d="M120 700 L120 470 A330 330 0 0 0 780 470 L780 700"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={offset}
        />
        <path
          data-play-line
          data-from="0.05"
          data-to="0.45"
          d="M370 700 L370 500 L530 500 L530 700"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={offset}
        />
        <path
          data-play-line
          data-from="0.1"
          data-to="0.5"
          d="M450 610 m-70 0 a70 70 0 1 0 140 0 a70 70 0 1 0 -140 0"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={offset}
        />
      </g>

      {/* Laufweg: Der Spieler löst sich vom linken Flügel und schneidet zur Zone.
          In der Taktiktafel-Notation die durchgezogene Linie.
          Geometrie-Korrektur 12.08.: Der erste Entwurf lief vom Flügel WEG vom
          Korb – ein Schnitt, der sich vom Ziel entfernt, ist kein Spielzug.
          Beide Linien laufen jetzt auf die Zone zu (Korb liegt unten mittig)
          und bleiben dabei unterhalb der Headline. */}
      <path
        data-play-line
        data-from="0.3"
        data-to="0.75"
        d="M270 430 C 300 502, 372 560, 428 596"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={offset}
        stroke="#F07A27"
        strokeOpacity="0.9"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Der Pass, der den Zug abschließt – mit Pfeilspitze, weil in der
          Notation die Richtung die halbe Aussage ist. */}
      <path
        data-play-line
        data-from="0.55"
        data-to="1"
        d="M630 415 C 602 490, 532 556, 480 597"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={offset}
        stroke="#F07A27"
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd="url(#hoopsPfeil)"
        vectorEffect="non-scaling-stroke"
      />

      {/* Die beiden Positionen. Sie erscheinen, sobald „ihre" Linie dort startet. */}
      <g stroke="#F07A27" strokeWidth="2" vectorEffect="non-scaling-stroke" fill="#0B1220">
        <circle data-play-dot data-at="0.3" cx="270" cy="430" r="13" opacity={sichtbar} />
        <circle data-play-dot data-at="0.55" cx="630" cy="415" r="13" opacity={sichtbar} />
      </g>
    </svg>
  );
});

export default PlayDiagram;
