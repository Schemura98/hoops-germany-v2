"use client";

// ══ DER BALL ════════════════════════════════════════════════════════════════
//
// Auftrag Patrick, 21.08.2026: „der minimalistische Ball" / „der orangene
// Kreis". Ersetzt `RailBallGlyph` aus `HeroGlyphs.js` (Kreis + VIER Nahtlinien
// in zwei Stärken).
//
// ── Warum der Ball GEFÜLLT ist, obwohl das Feld reine Linien sind ──────────
// Das ist die eine Stelle, an der die Zeichnung bewusst zwei Sprachen führt,
// und der Unterschied ist inhaltlich, nicht dekorativ:
//   · Ein Korb ist ein RING — von oben ein Umriss, innen ist Luft.
//   · Ein Ball ist ein KÖRPER — von oben eine Fläche, innen ist Ball.
// Beide als Umriss zu zeichnen hieße, den Unterschied zwischen Ziel und
// Gegenstand einzuebnen; ein leerer Kreis, der auf einen leeren Kreis zuläuft,
// hat keine Ankunft. Der Ball ist damit die EINZIGE gefüllte Fläche der
// Startseite — genau deshalb findet ihn das Auge sofort.
//
// ── Warum nur EINE Naht ───────────────────────────────────────────────────
// Bei 20 px sind vier Nahtlinien kein Detail, sondern Rauschen: Sie sitzen
// 3–4 px auseinander, laufen bei der Rollbewegung ineinander und lassen die
// Fläche flimmern. Eine einzelne Meridian-Naht macht die Drehung ablesbar —
// mehr braucht es dafür nicht, und mehr trägt bei dieser Größe auch nicht.
// ⚠️ Die Grenze aus dem alten `HeroGlyphs.js` gilt unverändert weiter (die
// Datei ist mit diesem Umbau entfallen, sie steht im Verlauf): Das ist eine
// FLÄCHENDREHUNG, keine Kugelrotation. Über etwa 40 px kippt sie ins
// Rad-Artige. Wer mehr Präsenz will, braucht anderes Material, nicht mehr
// Pixel.
export const BALL_PX = 20;
export const BALL_R = BALL_PX / 2;

// Rollwinkel in Grad für eine zurückgelegte Strecke. Ein Ball, der rollt ohne
// zu rutschen, dreht sich um Strecke/Radius (Bogenmaß) — die Drehung ist also
// nicht frei gewählt, sie folgt dem Weg. Deshalb wirkt sie richtig.
export const rollwinkel = (streckePx) => (streckePx / BALL_R) * (180 / Math.PI);

// Reine Geometrie in EINEM Koordinatensystem (viewBox 0..20), damit der Ball
// als `<g>` in eine bestehende Zeichnung gesetzt werden kann, statt als
// eigenes, absolut positioniertes Element daneben zu liegen. Genau diese
// Trennung — Ball hier, Weg dort, beide mit eigener Rechnung — war die Quelle
// der Drehpunkt- und Versatz-Befunde der Vorfassung.
export function BallPfade() {
  return (
    <>
      <circle cx="10" cy="10" r="9" fill="#F07A27" />
      {/* Ein Meridian. `A 5.2 9` ist eine Ellipse mit derselben Höhe wie der
          Ball und knapp halber Breite — die Linie, die eine Kugelnaht bei
          dieser Ansicht hätte. Dunkel statt weiß, weil der Ball auf Navy steht
          und eine helle Naht ihn aufhellt statt ihn zu gliedern. */}
      <path
        d="M10 1 A 5.2 9 0 0 0 10 19"
        fill="none"
        stroke="#0B1220"
        strokeOpacity="0.38"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </>
  );
}
