"use client";

import { forwardRef } from "react";

// Rein präsentationale Vektor-Bausteine, die den Ball durch die ganze Startseite
// tragen (A10 "ein Motiv trägt alle Szenen", Konzept
// docs/SPIELFELD-STRECKE-2026-08-12.md). Keine eigene Logik, keine eigenen
// Listener – Position und Deckkraft setzt ausschließlich der jeweilige
// rAF-Controller (HeroScrollStage.js für den Fall, FeatureProgressRail.js für
// den Ritt auf der Fortschritts-Leiste) über die weitergereichte ref.
//
// Zwei Auftritte, ein Motiv: BallSprite (Hero, gerenderte Bildsequenz – der
// fruehere Vektor-BallGlyph ist am 15.08.2026 entfallen, weil ihn nach dem
// Umbau nichts mehr importierte) und RailBallGlyph (Fortschritts-Leiste,
// FLACH: kein Verlauf, kein Schatten, nur brand-500 – neue Elemente der
// Spielfeld-Strecke folgen der Vorgabe "keine Verläufe, keine Schatten, kein
// Glow"). HoopEmblem ist das gemeinsame Ziel: früher am Hero-CTA, jetzt am Ende
// der Fortschritts-Leiste (Begründung + Freigabe: SPIELFELD-STRECKE Abschnitt 3,
// Patricks Freigabe "Ball-Landung darf entfallen" vom 12.08.2026).

// ── Hero-Ball als gerenderte Bildsequenz (15.08.2026, Auftrag Patrick) ─────
//
// Ersetzt `BallGlyph` im Hero. Der Vektor-Ball dreht sich per CSS `rotate()`,
// also in der FLÄCHE – wie ein Rad. Bei 28px fällt das nicht auf, in Hero-Größe
// sofort: Die Nähte laufen im Kreis, statt über die Kugel zu wandern.
//
// Diese Sequenz ist echte 3D-Geometrie (Erzeuger: scripts/generate-ball-
// rotation.mjs). 32 Bilder einer vollen Umdrehung um eine geneigte Achse,
// nebeneinander in einem Streifen.
//
// Warum Hintergrundbild und nicht <img>: Die Bildwahl geschieht allein über
// `background-position-x` in Prozent. Dadurch ist sie von der Anzeigegröße
// UNABHÄNGIG – derselbe Streifen trägt 110px mobil und 200px am Desktop, ohne
// eine einzige Umrechnung im Controller.
//
// ⚠️ DER HERO LÄDT DAMIT ERSTMALS WIEDER BILDDATEN (104 KB AVIF / 160 KB WebP).
// Das war beim Redesign am 12.08.2026 bewusst abgeschafft worden – damals ging
// es um ein 1000x652-Foto, das formatfüllend hochskaliert unter einem
// 65%-Overlay verschwand, also viel Gewicht für fast keine Wirkung. Hier ist
// das Verhältnis umgekehrt: Das Motiv IST die Bewegung, es trägt die ganze
// Seite, und es gibt keinen Vektorweg zu echter Kugelrotation. Wer die Zahl
// drücken muss: `--frames 24` kostet rund ein Viertel und ist bei zügigem
// Scrollen kaum unterscheidbar (gemessen 24/32/48 am 15.08.2026).
// ⚠️ Die beiden Bildquellen stehen in `app/globals.css` unter
// `.hero-ball-sprite`, NICHT hier: Ein Rückfall von AVIF auf WebP braucht
// ZWEI `background-image`-Deklarationen hintereinander (Browser ohne
// `image-set` behalten die erste). Ein React-Style-Objekt kann denselben
// Schlüssel nicht zweimal tragen – im Inline-Style gäbe es also entweder
// keinen Rückfall oder kein AVIF.
export const BALL_SPRITE_FRAMES = 32;

// ⚠️ `className` wird ZUSAMMENGEFÜGT, nicht durchgereicht. Die erste Fassung
// hatte `{...props}` hinter `className` stehen – damit überschrieb jede
// aufrufende Stelle die eigene Klasse der Komponente, `hero-ball-sprite` fiel
// weg und mit ihr das Bild. Der Ball war unsichtbar, ohne dass irgendwo ein
// Fehler auftrat: ein 176px großes, leeres div.
// Die GRÖSSE kommt bewusst nur aus `className` (Tailwind, brechpunktfähig) –
// eine zusätzliche Prop wäre eine zweite Quelle für dieselbe Zahl, und der
// Controller misst ohnehin am Element.
// ⚠️ `style` wird ebenfalls zusammengefügt, und `backgroundSize` steht HINTER
// dem Spread (Befund Kai K3, zweite Runde). Vorher war nur `className`
// geschützt – `style` blieb voll überschreibbar, und ausgerechnet darin steckt
// `backgroundSize`, also genau die Kopplung an `BALL_SPRITE_FRAMES`, die der
// Test schützen soll. Ein Aufrufer mit eigener `style`-Prop hätte den Ball
// still zerlegt, und der Test hätte es nicht gemerkt: Er prüft die Definition,
// nie die Aufrufstellen.
export const BallSprite = forwardRef(function BallSprite(
  { className = "", style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`hero-ball-sprite pointer-events-none absolute left-0 top-0 opacity-0 will-change-transform ${className}`}
      // ⚠️ KEIN `drop-shadow` (Entscheidung Vivien, 15.08.2026). Ein GEWORFENER
      // Schatten behauptet eine Lichtquelle und eine Fläche hinter dem Ball –
      // beides gibt es hier nicht, der Ball steht vor einer leeren Navy-Fläche.
      // Er machte aus dem Körper einen Aufkleber über der Seite. Die Tiefe kommt
      // jetzt aus dem Anschnitt am Bühnenrand: physikalisch und kostenlos.
      // Die Verläufe IM Ball (Körperverlauf, Kantenabdunklung, Bouncelight)
      // bleiben – sie sind Modellierung, keine Dekoration, und genau das ist die
      // Grenze, die `docs/VISUELLE-RICHTUNG` zieht: keine Verläufe auf FLÄCHEN
      // DER OBERFLÄCHE (Panels, Tasten, Gründe), sehr wohl auf einem
      // dargestellten Gegenstand.
      style={{
        backgroundRepeat: "no-repeat",
        ...style,
        backgroundSize: `${BALL_SPRITE_FRAMES * 100}% 100%`,
      }}
      {...props}
    />
  );
});

// Korb-Emblem – Ring + Netz, bewusst klein (wie ein Abzeichen). Bis 12.08.2026
// an der Hero-CTA, jetzt das Reiseziel am Ende der Fortschritts-Leiste
// (FeatureProgressRail.js). `ringRef` ist optional und zeigt zusätzlich auf den
// Ring allein – dorthin setzt die Ankunfts-Animation kurz den Signalton
// `signal-ok`, ohne die Netz-Linien mitzufärben.
// ⚠️ Dieselbe Absicherung wie bei den beiden Bällen (Befund Kai K3).
// Hier war das Muster nicht nur latent, sondern AKTIV: Beide Aufrufstellen
// übergeben `className` UND `style={{}}` – das leere Objekt ersetzte
// `transformOrigin: "10px 3px"` ersatzlos. Folgenlos nur deshalb, weil derzeit
// nichts das Emblem dreht. Genau der Zustand, in dem der Drehpunkt des
// Streckenballs zwei Tage lang lag, bevor er beim ersten `rotate()` auffiel.
export const HoopEmblem = forwardRef(function HoopEmblem(
  { ringRef, className = "", style, ...props },
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
      // die Ballreise endete an nichts, und der Farbblitz `rail-goal-flash-ring`
      // lag im selben unsichtbaren SVG.
      // Sichtbarkeit gehört hier dem Wrapper, nicht dem Glyph.
      className={`pointer-events-none will-change-transform ${className}`}
      style={{ ...style, transformOrigin: "10px 3px" }}
      {...props}
    >
      <ellipse
        ref={ringRef}
        cx="10"
        cy="3"
        rx="8.5"
        ry="2.4"
        stroke="#F68C3E"
        strokeWidth="1.6"
      />
      <g
        stroke="#F5F7FA"
        strokeOpacity=".55"
        strokeWidth="0.9"
        strokeLinecap="round"
      >
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
