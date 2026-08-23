"use client";

import { useEffect, useState } from "react";
import SplitFlap from "@/components/ui/SplitFlap";

// Ziffernfenster-Wert der Anzeigetafel.
// Konzept: docs/ANZEIGETAFEL-KONZEPT-2026-08-23.md, Abschnitt 2.2;
// Mittelweg-Entscheidung (Patrick-Feedback, 23.08.2026): Der WERT steht in
// Big Shoulders Display (font-display), die 7-Segment-Schrift (DSEG7,
// font-segment) lebt ausschließlich im unbeleuchteten Geist dahinter weiter.
//
// ⚠️ STELLENWEISER GEIST (Korrektur Patrick, 23.08.2026): Die erste Fassung
// legte den Geist als EIGENEN Schriftzug hinter den rechtsbündigen Wert –
// weil die kondensierte Wertschrift schmaler ist als die Segment-Schrift,
// lugte je nach Stellenzahl mal viel, mal gar nichts hervor: „bei jeder
// Kachel anders, anders versetzt". Jetzt bekommt JEDE Stelle ihre eigene
// Zelle: unbeleuchtete Segment-„8" (bzw. „." ) als Zellgrund, die moderne
// Ziffer mittig darauf – wie auf einer echten Tafel jede Stelle ihr eigenes
// Segmentfeld hat. Damit ist der Geist in jedem Fenster identisch: gleichmäßig
// um jede Ziffer, nie ein versetzter Rest daneben.
//
// Der Geist ist reine Textur (aria-hidden, Deckkraft 6 % ≈ 1,25:1, unter der
// 2:1-Zeichnungsgrenze) und trägt NIE Information: Ein leerer Wert zeigt einen
// Gedankenstrich, keine Geist-„0". Während des Hochzählens stehen die noch
// „unbeleuchteten" führenden Stellen als Geist – die Zahl läuft sichtbar in
// ihre Stellen ein; die Zellenzahl ist von Anfang an die des Endwerts, das
// Fenster zittert also nie.
//
// GRENZWERTE (Konzept 2.6): Nur innerhalb von Tafel-Fenstern einsetzen;
// Zustände nie über Ziffernfarbe allein (Farbfehlsicht).
//
// groesse: "spielstand" | "haupt" | "neben" – oder ein roher CSS-Größenwert
//   für die eine Fläche außerhalb der Leiter (Match-Kopf).
// betont: die EINE brand-Zahl der Tafel (max. 1 je Tafel).
// an/verzoegerung: Einschalt-Moment (Konzept 2.5) – Gehäuse und Geist stehen
//   sofort, der Wert blendet ein und zählt hoch, wenn die Tafel „an" geht.
//   Reduzierte Bewegung: keine Blende, kein Zählen, Endwert sofort.
// flap/flapDelay: statt der Blende klappt die GANZE Wertreihe einmal um
//   (SplitFlap – /match/[id], wo der Flap die Ankunft ist). ⚠️ Der frühere
//   „children-Pfad" (fremder Renderer, zweilagig) ist ABGESCHAFFT: Er
//   renderte den Geist als zusammenhängenden Schriftzug hinter dem mittigen
//   Wert – genau das versetzte Bild, dessen Korrektur Patrick beauftragt
//   hatte, stand damit ausgerechnet auf der prominentesten Tafel weiter
//   (Auflage Tobias, 23.08.2026). Jetzt gibt es EINEN Zellen-Pfad; die
//   Wertreihe ist eine eigene Ebene aus gleich breiten Zellen und kann als
//   Ganzes umklappen.
// gedimmt: Verlierer-Helligkeit (mist-400) – Zustand nie über Farbe allein,
//   das S/N-/Helligkeits-System der Aufrufer bleibt zuständig.
const GROESSEN = {
  spielstand: "clamp(2.75rem, 9vw, 4.5rem)",
  haupt: "clamp(2rem, 6vw, 3rem)",
  neben: "clamp(1.5rem, 4.5vw, 2rem)",
};

// Interner Zähler statt <CountUp>: Der Lauf muss am Einschalt-Signal der
// TAFEL hängen (an + verzoegerung), nicht an einem eigenen Beobachter –
// sonst zählt die Zahl schon während der Sichtbarkeits-Haltezeit (Befund
// Vivien) und der Nutzer sieht eine bereits laufende Zahl einblenden.
function useZaehlwert(ziel, laufen, an, verzoegerung) {
  const [wert, setWert] = useState(laufen ? 0 : ziel);
  useEffect(() => {
    if (!laufen) {
      setWert(ziel);
      return;
    }
    if (!an) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setWert(ziel);
      return;
    }
    let raf;
    const dauer = 900;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dauer);
        setWert(ziel * ease(t));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setWert(ziel);
      };
      raf = requestAnimationFrame(tick);
    }, verzoegerung || 0);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [an, ziel, laufen]);
  return wert;
}

export default function SegmentZahl({
  wert = null,
  dezimalen = 0,
  stellen,
  groesse = "haupt",
  betont = false,
  gedimmt = false,
  countUp = false,
  an = true,
  verzoegerung = 0,
  flap = false,
  flapDelay = 0,
  className = "",
}) {
  const leer = wert === null || wert === undefined || Number.isNaN(Number(wert));

  const zielZahl = leer ? 0 : Number(wert);
  const anzeigeZahl = useZaehlwert(zielZahl, countUp && !leer, an, verzoegerung);

  // Benannte Stufe aus der Leiter – oder ein roher CSS-Größenwert.
  const fontSize = GROESSEN[groesse] || groesse || GROESSEN.haupt;

  const wertKlasse = leer
    ? "text-mist-600"
    : betont
    ? "text-brand-500"
    : gedimmt
    ? "text-mist-400"
    : "text-paper-50";
  const blende = flap
    ? ""
    : `transition-opacity duration-300 motion-reduce:transition-none ${
        an ? "opacity-100" : "opacity-0"
      }`;
  const blendeDelay =
    !flap && an && verzoegerung ? { transitionDelay: `${verzoegerung}ms` } : undefined;

  // Zellen: Die Zellenzahl richtet sich nach dem ENDWERT (plus optionaler
  // Mindest-Stellenzahl) – während des Hochzählens füllt die laufende Zahl
  // ihre Stellen von rechts, links stehen unbeleuchtete Geist-Zellen.
  const final = leer ? "-" : zielZahl.toFixed(dezimalen);
  const finalMitStellen =
    !leer && stellen
      ? final.padStart(
          final.length + Math.max(0, stellen - final.split(".")[0].replace("-", "").length),
          " "
        )
      : final;
  const laufend = leer ? "-" : anzeigeZahl.toFixed(dezimalen);
  const pad = finalMitStellen.length - laufend.length;
  const zellen = [...finalMitStellen].map((zeichen, i) => ({
    geist: zeichen === "." ? "." : "8",
    wert: i - pad >= 0 ? laufend[i - pad] : "",
  }));

  // Die Wertreihe ist eine EIGENE Ebene aus Zellen, deren Breite je Zelle vom
  // (unsichtbaren) Segment-Glyph kommt – dadurch liegt sie deckungsgleich über
  // der Geist-Reihe und kann als Ganzes umklappen (flap) oder einblenden.
  const wertReihe = (
    <span className="flex h-full items-stretch">
      {zellen.map((z, i) => (
        <span key={i} className="relative inline-block font-segment font-bold">
          <span aria-hidden="true" className="invisible select-none">
            {z.geist}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display font-extrabold"
          >
            {z.wert}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <span className={`relative inline-block leading-none ${className}`} style={{ fontSize }}>
      {/* Geist-Reihe: unbeleuchtete Segmente, stehen sofort. */}
      <span
        aria-hidden="true"
        className="inline-flex font-segment font-bold text-paper-50/[0.06] select-none"
      >
        {zellen.map((z, i) => (
          <span key={i}>{z.geist}</span>
        ))}
      </span>
      <span className={`absolute inset-0 ${blende} ${wertKlasse}`} style={blendeDelay}>
        {flap ? (
          <SplitFlap delay={flapDelay} className="block h-full w-full">
            {wertReihe}
          </SplitFlap>
        ) : (
          wertReihe
        )}
      </span>
      {/* Der zugängliche Name ist der nackte Wert – die Zellen sind Kulisse. */}
      <span className="sr-only">{leer ? "keine Angabe" : final}</span>
    </span>
  );
}
