"use client";

import { useEffect, useRef } from "react";

// Die Schiene – Zone 3 des Newsfeeds (15.08.2026).
// Entwurf: `docs/NEWSFEED-DESKTOP-2026-08-15.md` (Vivien), §3.5.
//
// WARUM
// Rechts und links standen fünf Panels, jedes mit `bg-navy-800 rounded-md
// border border-navy-600 p-4` plus Icon und Überschrift. Fünfmal dieselbe
// Geste, keine Hierarchie – das war der Hauptgrund für Patricks Eindruck
// „austauschbar, KI-generiert".
//
// Jetzt EIN Panel mit Registern, getrennt durch Haarlinien. Vivien nennt den
// Nebeneffekt, der mir wichtiger erscheint als der Stil: Eine Schiene mit
// sichtbarer Unterkante ENDET; zwei kurze Karten übereinander HÖREN AUF. Der
// Unterschied ist genau der zwischen „bewusst" und „ausgegangen" – und die
// alten Seitenspalten liefen sichtbar leer aus.
//
// Die Abschnitts-Überschrift ist eine Mono-Eyebrow, kein Icon-Titel. Icons
// waren fünfmal derselbe orange Akzent für fünf gleichrangige Dinge.

const EYEBROW =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400";

export function SchienenAbschnitt({ label, aktion, children }) {
  return (
    <section className="p-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h3 className={EYEBROW}>{label}</h3>
        {aktion}
      </div>
      {children}
    </section>
  );
}

// ⚠️ HAFTEN UND HÖHE GEHÖREN ZUSAMMEN (Befund Patrick, 18.08.2026).
//
// Die Schiene stand als `lg:sticky lg:top-24` in `page.js` – ohne jede
// Höhenbegrenzung. Gemessen ist sie aber **1088 px** hoch, während unter ihrer
// Haftkante nur 624–804 px Platz sind:
//
//   1440x900 → 804 px Platz → 284 px unerreichbar
//   1280x800 → 704 px Platz → 384 px unerreichbar
//   1280x720 → 624 px Platz → 464 px unerreichbar
//   1024x768 → 672 px Platz → 416 px unerreichbar
//
// Ein Element, das oben festklebt und höher als das Fenster ist, kann seinen
// unteren Teil NIE zeigen – Scrollen bewegt es ja gerade nicht mehr. Auf keinem
// Desktop-Bildschirm erreichbar, und auf keinem eine Fehlermeldung.
//
// ⚠️ Welcher Abschnitt genau fehlte, hing an der Fensterhöhe – hier stand
// zuerst „Folgen und das Ende von Tabelle", das war meine Annahme, nicht meine
// Messung (korrigiert nach Gegenmessung durch Tobias, 18.08.2026):
//   1440x900, 1280x800 → „Basketball-News" fehlte, „Folgen" war noch ganz da
//   1280x720, 1024x768 → „Folgen" UND „Basketball-News" fehlten
//   „Tabelle" war auf keiner der vier Größen angeschnitten.
//
// Deshalb ist `haftend` EIN Schalter, der beides setzt. Wer künftig nur
// `sticky` dazuschreibt, ohne die Höhe zu deckeln, baut denselben Fehler neu –
// und er ist von außen unsichtbar, weil nichts kaputtgeht, nur etwas fehlt.
// Bewacht durch `tests/e2e/newsfeed-schiene.spec.mjs`.
//
// ⚠️ KEIN `overscroll-contain` HIER – das war der erste Anlauf und ein
// Rückschritt gegenüber dem Stand davor (Befund Tobias, Gate 18.08.2026).
// Stand der Zeiger über der Schiene, ließ sich die SEITE mit dem Mausrad
// überhaupt nicht mehr scrollen, sobald die Schiene an ihrem Ende war –
// eine tote Fläche von rund einem Drittel der Bildbreite, ohne jede
// Rückmeldung an den Nutzer.
// In allen drei Browsern nachgemessen (je 9 Radstöße, 1440x900):
//
//   Browser   | mit contain   | mit auto (jetzt)
//   Chromium  | tote Fläche   | Seite läuft weiter
//   Firefox   | läuft weiter  | Seite läuft weiter
//   WebKit    | tote Fläche   | Seite läuft weiter
//
// Und der Grund, warum die Zeile ersatzlos entfallen kann: Das Verhalten,
// für das sie eingebaut war – erst die Schiene zu Ende rollen, die Seite
// bleibt stehen – tritt in ALLEN drei Browsern auch mit `auto` ein
// (erster Radstoß: Schiene 0→293…300, Seite unverändert). Die Browser
// „rasten" eine Radbewegung auf dem Element ein, unter dem sie beginnt.
// Die Zeile hatte also keinen Nutzen und einen Preis.
const HAFTEND = [
  "lg:sticky lg:top-24",
  // ⚠️ 6rem = exakt die Haftkante, KEINE Luft mehr nach unten (18.08.2026).
  // Vorher 7rem. Die 16 px Abstand ließen die Schiene sichtbar VOR dem
  // Fensterrand enden – mit Rahmen und gerundeter Ecke, also als geschlossenes
  // Rechteck. Zusammen mit dem Höhendeckel behauptete diese Form „hier ist
  // Schluss", während 44 % des Inhalts dahinter lagen (1280x720 gemessen).
  // Dieselbe Familie wie `docs/MUSTER-ZAHLEN-DIE-LUEGEN`: im Sinne des Codes
  // richtig, im Sinne des Betrachters falsch – nur ist es hier keine Zahl,
  // sondern eine Kante.
  "lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto",
  // Dünne, dunkle Leiste statt der hellen Standardleiste (color-scheme: dark
  // allein reicht hier nicht, weil der Grund navy-800 ist).
  "lg:[scrollbar-width:thin] lg:[scrollbar-color:theme(colors.navy.600)_transparent]",
].join(" ");

export default function Schiene({ children, className = "", haftend = false }) {
  const eigen = useRef(null);

  // ⚠️ DER ANSCHNITT SAGT „HIER GEHT ES WEITER" – und zwar nur dann, wenn es
  // stimmt (Entwurf Vivien, 18.08.2026).
  //
  // Warum kein Verlauf und keine auffälligere Bildlaufleiste:
  // Die Leiste ist nur WÄHREND des Scrollens sichtbar (macOS-Voreinstellung,
  // gemessen: nach 3 s pixelgenau weg), die geschlossene Kante ist IMMER da.
  // Ein Hinweis, der drei Sekunden zeigt, kann keine Aussage widerrufen, die
  // dauerhaft danebensteht. Und ein Verlauf verblasst nur den Inhalt – die
  // Rahmenlinie bliebe als Schlussstrich stehen, der Widerspruch also auch.
  // In der Anzeigetafel-Sprache entsteht Tiefe ohnehin aus Fläche und
  // Haarlinie, nicht aus Effekten; der Anschnitt ist dort bereits etabliert
  // (Hero-Ball, `docs/VISUELLE-RICHTUNG-2026-08-12.md`).
  //
  // ⚠️ BEIDE Richtungen sind wichtig: Passt alles hinein, MUSS der Rahmen
  // zurückkommen – sonst behauptet eine offene Kante ihrerseits etwas Falsches.
  // Messmuster von `components/ui/ScrollTable.js` übernommen.
  useEffect(() => {
    const el = eigen.current;
    if (!el || !haftend) return;
    let raf = 0;
    const pruefen = () => {
      raf = 0;
      // 1 px Toleranz gegen Rundung bei gebrochenen Bildschirmauflösungen.
      const laeuftUeber = el.scrollHeight - el.clientHeight > 1;
      el.classList.toggle("rounded-b-none", laeuftUeber);
      el.classList.toggle("border-b-0", laeuftUeber);
    };
    const anstossen = () => {
      if (!raf) raf = requestAnimationFrame(pruefen);
    };
    pruefen();
    const beobachter =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(anstossen) : null;
    beobachter?.observe(el);
    // Kinder wachsen nach (Widgets laden), das meldet der Beobachter am
    // Element selbst nicht zuverlässig – deshalb zusätzlich jedes Kind.
    for (const kind of el.children) beobachter?.observe(kind);
    window.addEventListener("resize", anstossen);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      beobachter?.disconnect();
      window.removeEventListener("resize", anstossen);
    };
  }, [haftend, children]);

  return (
    <div
      ref={eigen}
      className={`rounded-md border border-navy-600 bg-navy-800 divide-y divide-navy-600 ${
        haftend ? HAFTEND : "overflow-hidden"
      } ${className}`}
    >
      {children}
    </div>
  );
}
