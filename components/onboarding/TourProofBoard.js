"use client";

import { useEffect, useState } from "react";
import { PiCheckBold, PiSealCheckBold } from "react-icons/pi";
import CountUp from "@/components/ui/CountUp";

// Die Beweis-Szene der Plattform-Tour: eine echte Anzeigetafel, die vorführt,
// warum die Zahlen auf Hoops belegbar sind – beide Teams melden unabhängig,
// erst dann zählt das Ergebnis (Kernpositionierung, CLAUDE.md Abschnitt 0).
//
// Warum das die erste Tour-Seite ist und nicht die letzte: Der Nutzer soll den
// Grund sehen, bevor er um irgendetwas gebeten wird. Eine Tour, die zuerst
// Profildaten einsammelt und erst danach den Nutzen zeigt, verliert genau die
// Leute, die den Nutzen noch nicht kennen.
//
// ⚠️ Die Zahlen sind erfunden und deshalb sichtbar als BEISPIEL ausgezeichnet.
// Echte Spieldaten hier zu ziehen wäre technisch möglich, aber ein frischer
// Account hat keinen Bezug dazu – und ein fremdes Spiel ohne Kennzeichnung
// würde wie „deine Daten" gelesen.
const HEIM = { name: "Rheinbach Ravens", punkte: 78 };
const GAST = { name: "Köln Comets", punkte: 71 };

// Stufen der Inszenierung. Erst steht der Spielstand da (fertig gezählt),
// dann melden die beiden Teams nacheinander, dann fällt die Bestätigung.
// Bewusst als Zustand und nicht als CSS-Verzögerungskette: So ist bei
// reduzierter Bewegung mit einer einzigen Zeile alles sofort sichtbar,
// statt dass Elemente unsichtbar hängenbleiben.
const TAKTE = [900, 1500, 2150];

export default function TourProofBoard() {
  const [stufe, setStufe] = useState(0);

  useEffect(() => {
    const reduziert =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduziert) {
      setStufe(3);
      return;
    }
    const timer = TAKTE.map((ms, i) => setTimeout(() => setStufe(i + 1), ms));
    return () => timer.forEach(clearTimeout);
  }, []);

  return (
    <div className="rounded-md border border-navy-600 bg-navy-950 overflow-hidden">
      {/* Kopfleiste der Tafel – die Beispiel-Kennzeichnung steht hier und nicht
          im Kleingedruckten, damit niemand die Zahlen für seine eigenen hält. */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-navy-600">
        <span className="font-mono text-[10px] tracking-[0.18em] text-brand-400">
          BEISPIEL
        </span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-mist-400">
          BEZIRKSLIGA · SPIELTAG 12
        </span>
      </div>

      {/* Spielstand */}
      <div className="px-4 py-3 space-y-1.5">
        {[HEIM, GAST].map((t, i) => (
          <div key={t.name} className="flex items-baseline justify-between gap-3">
            <span
              className={`font-display uppercase tracking-tight leading-none text-[17px] truncate ${
                i === 0 ? "text-paper-50" : "text-mist-300"
              }`}
            >
              {t.name}
            </span>
            <span
              className={`font-display leading-none text-[34px] tabular-nums ${
                i === 0 ? "text-brand-500" : "text-paper-50"
              }`}
            >
              <CountUp value={t.punkte} duration={800} />
            </span>
          </div>
        ))}
      </div>

      {/* Die beiden unabhängigen Meldungen. Das ist der eigentliche Inhalt der
          Szene – der Spielstand oben ist nur der Anlass.
          ⚠️ Beide Zeilen zeigen bewusst DIESELBE Zahlenfolge. Ein erster Entwurf
          hatte sie aus Sicht des jeweiligen Teams gedreht (78:71 / 71:78) – das
          ist datenmodell-treu, liest sich am Bildschirm aber wie ein Widerspruch
          und stellt genau die Aussage auf den Kopf, die der Schritt macht. */}
      <div className="border-t border-navy-600 divide-y divide-navy-600">
        {[HEIM, GAST].map((t, i) => (
          <div
            key={t.name}
            className={`flex items-center gap-2.5 px-4 py-2 transition-[opacity,transform] duration-300 ease-out-strong motion-reduce:transition-none motion-reduce:translate-y-0 ${
              stufe > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            <PiCheckBold
              className="text-signal-ok flex-shrink-0 text-sm"
              aria-hidden="true"
            />
            <span className="text-xs text-mist-300 flex-1 min-w-0 truncate">
              {t.name} meldet
            </span>
            <span className="font-mono text-xs tabular-nums text-paper-50">
              {HEIM.punkte}:{GAST.punkte}
            </span>
          </div>
        ))}
      </div>

      {/* Der Schlussstein. signal-ok statt Marken-Orange: Das ist ein Zustand,
          keine Marke – dieselbe Trennung wie überall sonst auf der Plattform. */}
      <div
        className={`flex items-center justify-center gap-2 border-t border-navy-600 bg-navy-900 px-4 py-2.5 transition-opacity duration-300 ease-out-strong ${
          stufe > 2 ? "opacity-100" : "opacity-0"
        }`}
      >
        <PiSealCheckBold className="text-signal-ok" aria-hidden="true" />
        <span className="font-display uppercase tracking-[0.14em] text-sm text-signal-ok">
          Bestätigt
        </span>
      </div>
    </div>
  );
}
