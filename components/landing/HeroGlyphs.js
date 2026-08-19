"use client";

import { forwardRef } from "react";

// Rein präsentationale Vektor-Bausteine, die den Ball durch die ganze Startseite
// tragen (A10 "ein Motiv trägt alle Szenen", Konzept
// docs/SPIELFELD-STRECKE-2026-08-12.md). Keine eigene Logik, keine eigenen
// Listener – Position und Deckkraft setzt ausschließlich der jeweilige
// rAF-Controller (HeroScrollStage.js für den Fall, FeatureProgressRail.js für
// den Ritt auf der Fortschritts-Leiste) über die weitergereichte ref.
//
// Seit dem 19.08.2026 bedient diese Datei nur noch die Fortschritts-Leiste:
// RailBallGlyph (FLACH – kein Verlauf, kein Schatten, nur brand-500) und
// HoopEmblem als stehende Endmarke am Ende der Leiste. Der Hero hat mit
// `HeroDunk.js` seine eigene, reine Linien-Sprache bekommen.
// ⚠️ Der Streckenball BLEIBT bewusst: Er ist der rote Faden durch die Seite,
// und er ist bereits flach gezeichnet – also schon in der richtigen Sprache.

// ⚠️ `BallSprite` UND `BALL_SPRITE_FRAMES` SIND AM 19.08.2026 ENTFALLEN.
// Der Hero-Ball war eine gerenderte 32-Bild-Rotationssequenz (104 KB AVIF /
// 160 KB WebP, `public/images/ball-basketball-32x200.*`, erzeugt von
// `scripts/generate-ball-rotation.mjs`). Alles drei ist gelöscht; der Hero
// zeichnet jetzt einen Dunk als Linien (`HeroDunk.js`) und lädt wieder null
// Bytes Bilddaten.
//
// ⚠️ WAS DABEI VERLOREN GEHT, UND ICH SAGE ES KLAR: Die Bildsequenz war gutes
// Handwerk. Echte Kugelrotation – Nähte, die über eine Kugel wandern statt sich
// in der Fläche zu drehen – ist mit Vektoren nicht erreichbar, und das war der
// ganze Grund, warum sie gebaut wurde. Der Verlust ist real.
// Sie gehört trotzdem nicht in das neue Bild: Ein fotografisch modellierter
// Körper in einer Strichzeichnung ist ein Genrebruch, und Genrebrüche sind
// genau das, was Seiten billig aussehen lässt.
// Wer sie zurückholen will, findet sie im Verlauf – zusammen mit dem Apparat,
// den sie gebraucht hat (Roadmap 20 bis 20h, acht Punkte, jeder mindestens
// eine Gate-Runde).

// Korb-Emblem – Ring + Netz, bewusst klein (wie ein Abzeichen). Bis 12.08.2026
// an der Hero-CTA, jetzt das Reiseziel am Ende der Fortschritts-Leiste
// (FeatureProgressRail.js), seit dem 19.08.2026 als STEHENDE Endmarke.
// ⚠️ Die Prop `ringRef` ist am 19.08.2026 entfallen. Sie zeigte auf den Ring
// allein, damit die Ankunfts-Animation dort den Farbblitz setzen konnte, ohne
// die Netz-Linien mitzufärben. Die Ankunft als Ereignis ist an den Hero
// gewandert; niemand liest die Prop mehr.
// ⚠️ Dieselbe Absicherung wie bei den beiden Bällen (Befund Kai K3).
// Hier war das Muster nicht nur latent, sondern AKTIV: Beide Aufrufstellen
// übergeben `className` UND `style={{}}` – das leere Objekt ersetzte
// `transformOrigin: "10px 3px"` ersatzlos. Folgenlos nur deshalb, weil derzeit
// nichts das Emblem dreht. Genau der Zustand, in dem der Drehpunkt des
// Streckenballs zwei Tage lang lag, bevor er beim ersten `rotate()` auffiel.
export const HoopEmblem = forwardRef(function HoopEmblem(
  { teil = "voll", className = "", style, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      // ⚠️ KEIN `opacity-0` MEHR (Befund Tobias B1, vierte Runde) – und das ist
      // eine Regression, die mein eigener K3-Fix erzeugt hat:
      // Solange `className` die Aufrufer-Klasse ERSETZTE, fiel das `opacity-0`
      // hier weg und das Emblem war sichtbar. Seit `cd51c92` wird
      // ZUSAMMENGEFÜGT – also blieb es stehen. Die Deckkraft steuert aber der
      // umschließende `span`, an dem die Ref hängt: Wrapper 1 × SVG 0 = 0.
      // Ergebnis: Das Korb-Emblem wurde auf KEINEM Viewport mehr gezeichnet,
      // die Ballreise endete an nichts.
      // Sichtbarkeit gehört hier dem Wrapper, nicht dem Glyph.
      className={`pointer-events-none will-change-transform ${className}`}
      style={{ ...style, transformOrigin: "10px 3px" }}
      {...props}
    >
      {/* ══ DER BALL LANDET IM NETZ, NICHT AUF DEM EMBLEM ══════════════════
          Entscheidung Vivien (16.08.2026) auf Tobias\' Befund. Der 20px-Ball
          wurde mittig auf ein 20x14-Emblem gesetzt: gleiche Breite, 6px mehr
          Höhe – er deckte es VOLLSTÄNDIG, Ring inklusive.
          Viviens Wort dafür: „Das ist keine Aussage, es ist ein Verschwinden."
          Ein Ball im Netz liegt UNTER dem Ring und VOR dem Netz – man sieht den
          Ring vor ihm. Ein Kreis, der ein Icon exakt überdeckt, liest sich als
          Punkt, der auf einem Icon geparkt hat. Und dieses Emblem ist das ZIEL
          der seitenlangen Reise: Löscht die Ankunft das Ziel aus, hat die Reise
          kein sichtbares Ende.
          Deshalb ist das Emblem in zwei Ebenen zerlegt. Der Aufrufer zeichnet
          `netz` hinter den Ball und `ring` davor; `voll` bleibt für jede Stelle,
          an der kein Ball ankommt. */}
      {teil !== "netz" && (
        <ellipse
          cx="10"
          cy="3"
          rx="8.5"
          ry="2.4"
          stroke="#F68C3E"
          strokeWidth="1.6"
        />
      )}
      {teil === "ring" ? null : (
        <g
          stroke="#F5F7FA"
          strokeOpacity=".55"
          strokeWidth="0.9"
          strokeLinecap="round"
        >
          <path d="M2.2 3.6Q3.4 9 6.6 12.4M17.8 3.6Q16.6 9 13.4 12.4M10 5.4V12.8" />
          <path d="M4 6.6Q10 8.9 16 6.6M5.8 9.8Q10 11.6 14.2 9.8" />
        </g>
      )}
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
// braucht anderes Material, nicht mehr Pixel.
export const RAIL_BALL_PX = 20;
export const RAIL_BALL_R = RAIL_BALL_PX / 2;

// Rollwinkel in Grad für eine zurückgelegte Strecke: Ein Ball, der ohne zu
// rutschen rollt, dreht sich um Strecke/Radius (Bogenmaß). Genau deshalb wirkt
// es physikalisch – die Drehung ist nicht frei gewählt, sie folgt dem Weg.
export const rollwinkel = (streckePx) =>
  (streckePx / RAIL_BALL_R) * (180 / Math.PI);

// ⚠️ DER DREHPUNKT IST NICHT ÜBERSCHREIBBAR (Befund Kai B1, 15.08.2026).
// Vorher stand `{...props}` HINTER `style`. Die Desktop-Aufrufstelle übergab
// `transformOrigin: "7px 7px"` – einen Wert aus der Zeit, als der Glyph 14px
// groß war – und ersetzte damit das ganze Style-Objekt. Solange gar nicht
// rotiert wurde, war das folgenlos; mit der neuen Rollbewegung eierte der Ball
// um einen Punkt 3px neben seiner Mitte: Taumelkreis 8,49px, also 42 % des
// Balldurchmessers, über 1,6 Umdrehungen. Mobil war es korrekt, weil dort kein
// `style` übergeben wurde – diese Asymmetrie ist der Grund, warum es
// durchrutschte.
// Jetzt stehen `className` und `style` als eigene Parameter (nicht mehr in
// `props`), werden ZUSAMMENGEFÜGT statt ersetzt, und `transformOrigin` steht
// hinter dem Spread – der Aufrufer kommt an den Drehpunkt nicht mehr heran.
//
// Positionierung gehört bewusst dem Aufrufer: mobil sitzt der Ball auf einem
// waagerechten Balken, am Desktop auf einer senkrechten Leiste. Zwei
// widersprüchliche Klassensätze zusammenzuführen wäre die nächste stille Falle
// gewesen, weil bei Tailwind die CSS-Reihenfolge entscheidet, nicht die
// Reihenfolge im Attribut.
export const RailBallGlyph = forwardRef(function RailBallGlyph(
  { className = "", style, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      width={RAIL_BALL_PX}
      height={RAIL_BALL_PX}
      viewBox="0 0 14 14"
      fill="none"
      className={`pointer-events-none opacity-0 will-change-transform ${className}`}
      style={{ ...style, transformOrigin: `${RAIL_BALL_R}px ${RAIL_BALL_R}px` }}
      {...props}
    >
      <circle cx="7" cy="7" r="6" fill="#F07A27" />
      <g
        stroke="#0B1220"
        strokeOpacity=".35"
        strokeWidth="0.8"
        strokeLinecap="round"
      >
        <path d="M1.3 7h11.4M7 1.3v11.4" />
        <path d="M2.9 2.9c2.2 2.4 2.2 6.4 0 8.8M11.1 2.9c-2.2 2.4-2.2 6.4 0 8.8" />
      </g>
    </svg>
  );
});
