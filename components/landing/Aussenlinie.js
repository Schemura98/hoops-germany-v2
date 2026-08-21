"use client";

import { useEffect, useRef } from "react";

// ══ DIE AUSSENLINIE ═════════════════════════════════════════════════════════
//
// Auftrag Patrick, 21.08.2026: „die feinen weißen Außenlinien des Feldes können
// sich ja auch gerne über die ganze Seite ziehen", präzisiert: „Ich rede von
// der Spielfeldaußenlinie. Diese sollte über die ganze Seite gehen" — und zur
// Begegnung mit dem Inhalt: „die Linie sollte an der Stelle des Textes schon
// verblassen oder vor dem Text Enden und unter dem Text dann wieder beginnen",
// entschieden als „ne also … eine Unterbrechung!".
//
// ══ WARUM DIE LINIE NICHT DIE SEITENLINIE DES HERO-FELDES IST ══════════════
//
// Der naheliegende Griff wäre, die Seitenlinien aus `HeroCourt.js` einfach
// weiterlaufen zu lassen — gleicher Maßstab, exakt anschließend. Das geht
// nicht, und der Grund ist Arithmetik, keine Geschmacksfrage.
// Nachgemessen (21.08.2026, `tmp/vivien-kanal/hero-linien.mjs`, Bildschirm-x
// der viewBox-Koordinate ±7,50 m über die CTM des gerenderten SVG):
//
//     360 px  → Seitenlinie bei  −170 px   (ausserhalb des Bildes)
//     430 px  →                  −135 px   (ausserhalb)
//     768 px  →                     4 px
//     900 px  →                    70 px   (mitten in der Textspalte)
//    1440 px  →                   180 px   (36 px INNERHALB des Inhalts)
//    1920 px  →                   240 px   (144 px ausserhalb des Inhalts)
//
// Der Hero zeigt einen NAHEN Ausschnitt des Korbbereichs: mobil rund 7,7 m
// Breite. Ein Feld ist 15 m breit. Auf dem Telefon liegt die Seitenlinie also
// 170 px jenseits des Bildrands — eine massstabsgetreue Fortsetzung zeigt dort
// NICHTS. Und zwischen 900 und 1500 px läge sie mitten im Text.
// ⚠️ Es gibt keinen Massstab, bei dem dieselbe Linie auf dem Telefon sichtbar
// und auf dem Notebook neben dem Text liegt. Das ist dieselbe Zwangslage, die
// `HeroCourt.js` für die Zone schon aufschreibt, eine Ebene höher.
//
// Diese Linie ist deshalb etwas anderes, und das steht hier, damit es niemand
// für eine schlampige Fortsetzung hält: Der Hero ist die NAHAUFNAHME, die
// Seite darunter die TOTALE. Die Seite selbst ist das Feld, ihre Ränder sind
// die Aussenlinie. Ein Schnitt, kein Fehler — und er ist an keiner Stelle
// gleichzeitig mit der Hero-Linie im Bild, weil die dort, wo dieser Schnitt
// stattfindet (unter dem Hero), ohnehin ausserhalb des Bildes liegt.
//
// ══ DIE UNTERBRECHUNG ═══════════════════════════════════════════════════════
// Die Linie endet vor einem Block, der sie kreuzt, und beginnt darunter neu.
// ⚠️ Die y-Grenzen kommen aus dem ELEMENT (`data-feld-durchbruch`), nicht aus
// eingetragenen Zahlen — sonst bräche die Unterbrechung bei jedem
// Zeilenumbruch, und Umbrüche sind auf dieser Seite häufig.
// Von Hand entschieden wird nur, DASS ein Block die Linie kreuzt, und das ist
// bei einem randlosen Block (`w-screen`) eine Eigenschaft der Bauart, nicht des
// Inhalts.
// ⚠️ Ehrlich benannt: Auf dem heutigen Layout kreuzt genau EIN Block die Linie
// (die randlose Kapitelmarke „EINE SAISON, SECHS SPIELZÜGE"). Wer viele
// Unterbrechungen will, muss die Linie nach INNEN holen — dann wird sie mobil
// überwiegend Lücke, weil die Textspalte dort 87 % der Breite belegt. Das ist
// der Handel; die Stellschraube dafür ist `ABSTAND`.

// Abstand zum Fensterrand. Zwei Werte, weil eine Linie, die auf 360 px 28 px
// vom Rand steht, dort ein Drittel des freien Randes frisst — und eine, die
// auf 1920 px 12 px vom Rand steht, an der Fensterkante klebt.
const ABSTAND_SCHMAL = 12;
const ABSTAND_BREIT = 28;
const UMBRUCH = 768;

// Luft vor und nach einer Unterbrechung. EIN Wert für beide Seiten und für
// alle Unterbrechungen — ungleiche Abstände sind das, was eine Absicht wie
// einen Fehler aussehen lässt.
const LUFT = 22;

// ⚠️ DIE GRUNDLINIE IST HELLER ALS DIE SEITENLINIEN, und das ist keine
// Inkonsequenz, sondern dieselbe Tiefenlogik wie im Hero. Dort ist die
// Grundlinie Teil des KORBBEREICHS (voller Strich, `#7E9AD8`), die
// Seitenlinien gehoeren zum FERNEN FELD (duenner, dunkler). Am unteren Ende
// gilt dasselbe: Die Grundlinie ist die naechste Linie des ganzen Feldes, die
// Seitenlinien laufen von ihr weg in die Ferne.
// ⚠️ Angesehen, nicht gerechnet: Mit der Seitenlinien-Farbe (#3A4E82) stiessen
// die vollen Zonenlinien aus `AbschlussFeld.js` auf eine deutlich dunklere
// Linie — das las sich, als sei die Grundlinie ein anderer Gegenstand, auf dem
// die Zone zufaellig steht.
const GRUND_FARBE = "#7E9AD8";

export default function Aussenlinie({ grundlinie = false }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const abschnitt = wrap?.closest("section");
    if (!wrap || !abschnitt) return;

    const zeichnen = () => {
      const abstand =
        window.innerWidth >= UMBRUCH ? ABSTAND_BREIT : ABSTAND_SCHMAL;
      wrap.style.setProperty("--feld-abstand", `${abstand}px`);

      // Unterbrechungen: y-Bänder, in denen ein Block die Linie kreuzt.
      // Bezug ist der Abschnitt; gemessen wird an den Elementen, damit ein
      // Umbruch die Bänder mitverschiebt statt sie falsch zu machen.
      const aRect = abschnitt.getBoundingClientRect();
      const baender = [...abschnitt.querySelectorAll("[data-feld-durchbruch]")]
        .map((el) => {
          const r = el.getBoundingClientRect();
          return [r.top - aRect.top - LUFT, r.bottom - aRect.top + LUFT];
        })
        .filter(([a, b]) => b > 0 && a < aRect.height)
        .sort((a, b) => a[0] - b[0]);

      // Aus den Bändern die STÜCKE bilden, in denen gezeichnet wird.
      const stuecke = [];
      let von = 0;
      for (const [a, b] of baender) {
        if (a > von) stuecke.push([von, Math.min(a, aRect.height)]);
        von = Math.max(von, b);
      }
      if (von < aRect.height) stuecke.push([von, aRect.height]);

      // Ein einziger Farbverlauf als Hintergrund erzeugt alle Stücke — kein
      // Element je Stück, kein Nachhalten beim Umbau. Harte Kanten (zwei
      // Stopps auf demselben Wert), weil entschieden ist: Unterbrechung, kein
      // Verblassen.
      const stopps = [];
      let letzte = 0;
      for (const [a, b] of stuecke) {
        if (a > letzte) stopps.push(`transparent ${letzte}px`, `transparent ${a}px`);
        stopps.push(`var(--feld-farbe) ${a}px`, `var(--feld-farbe) ${b}px`);
        letzte = b;
      }
      if (letzte < aRect.height) {
        stopps.push(`transparent ${letzte}px`, `transparent ${aRect.height}px`);
      }
      const verlauf = `linear-gradient(to bottom, ${stopps.join(", ")})`;
      for (const kind of wrap.querySelectorAll("[data-feld-senkrecht]")) {
        kind.style.backgroundImage = verlauf;
      }
    };

    zeichnen();
    window.addEventListener("resize", zeichnen);
    const beobachter = new ResizeObserver(zeichnen);
    beobachter.observe(abschnitt);
    return () => {
      window.removeEventListener("resize", zeichnen);
      beobachter.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      data-aussenlinie
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ "--feld-abstand": `${ABSTAND_SCHMAL}px`, "--feld-farbe": "#3A4E82" }}
    >
      {/* Beide Seitenlinien. Nur eine wäre kein Feld, sondern ein Rand — die
          Symmetrie ist das, was den Gegenstand erkennbar macht. */}
      <span
        data-feld-senkrecht
        className="absolute inset-y-0 w-px"
        style={{ left: "var(--feld-abstand)" }}
      />
      <span
        data-feld-senkrecht
        className="absolute inset-y-0 w-px"
        style={{ right: "var(--feld-abstand)" }}
      />
      {/* Die Grundlinie schliesst das Feld am Seitenende — dieselbe Kante, mit
          der der Hero es oben eröffnet (`GRUND` in `HeroCourt.js`). Ohne sie
          laufen zwei senkrechte Striche ins Nichts aus, und ein Feld, das
          nicht schliesst, ist ein Rahmen mit Fehler.
          Sie steht bewusst UNTER dem Abschluss-Block: Von oben gesehen hängt
          der Ring über dem Feld, die Grundlinie liegt dahinter. Genau die
          Anordnung des Hero, gespiegelt. */}
      {grundlinie && (
        <span
          data-feld-grundlinie
          className="absolute bottom-0 h-px"
          style={{
            left: "var(--feld-abstand)",
            right: "var(--feld-abstand)",
            backgroundColor: GRUND_FARBE,
          }}
        />
      )}
    </div>
  );
}
