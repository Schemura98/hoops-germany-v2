"use client";

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

export default function Schiene({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-navy-600 bg-navy-800 divide-y divide-navy-600 ${className}`}
    >
      {children}
    </div>
  );
}
