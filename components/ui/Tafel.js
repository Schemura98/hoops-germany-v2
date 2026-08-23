"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import SegmentZahl from "@/components/ui/SegmentZahl";

// Die Anzeigetafel als Bauteil – das Gehäuse einer echten Hallentafel,
// übersetzt in die Flächenstufen des Systems (Konzept
// docs/ANZEIGETAFEL-KONZEPT-2026-08-23.md, Entscheidung Patrick 23.08.2026).
//
// Anatomie-Zitat, kein Skeuomorphismus: Gehäuse (navy-800 + Haarlinie),
// Kopfleiste (navy-900), eingelassene Ziffernfenster (navy-950 mit innerer
// Glaskante), aufgedruckte Plaketten (Beschriftung IMMER auf der
// Gehäusefläche, nie im Fenster). Kein Glow, kein Schatten, kein Verlauf –
// die FIBA-Ausrüstungsnorm verlangt für echte Tafeln sogar „antiglare".
// Die Wertschrift ist seit dem 23.08. Big Shoulders (Mittelweg, s.
// SegmentZahl.js) – das Retro-Zitat trägt die Anatomie plus der Segment-Geist.
//
// EINSCHALT-MOMENT (Konzept 2.5, Wunsch Patrick): Beim ersten Erscheinen der
// Tafel im Viewport steht das Gehäuse samt Geist sofort – die WERTE blenden
// gestaffelt ein (300 ms Blende, 60 ms Versatz je Fenster in Einbauordnung).
// Ankunft, nie Reise: einmalig (useInView once), nichts hängt am Scroll.
// Reduzierte Bewegung: useInView meldet sofort true → fertige Tafel, kein
// Zustand, in dem etwas unsichtbar bleibt.
//
// GRENZWERTE (Konzept 2.6): genau EINE Tafel je Seite (die Fläche, für die
// man die Seite besucht) · Segment-Geist nur in Fenstern · maximal EINE
// betonte (brand) Zahl je Tafel · leere Fenster zeigen „–" und die Seite
// behält ihre erklärenden Leerzustands-Texte.
//
// akzent: 2px-Brand-Oberkante – nur wenn die Tafel zugleich die EINE
// hervorgehobene Karte der Seite ist (Signaturstelle der Spezifikation).
const TafelKontext = createContext(null);

// Einschalt-Beobachter mit HALTEZEIT – bewusst nicht das geteilte useInView.
// Gemessen (23.08.2026, Profilseite auf 390×844): Während des Ladens gibt es
// einen ~150 ms langen Zwischenzustand, in dem die Tafel 1 px in den
// Beobachter-Rand ragt, bevor der Inhalt darüber sie unter die Falz schiebt.
// Ein once-Observer feuert genau dann – und der Einschalt-Moment findet
// unsichtbar unter der Falz statt. Deshalb schaltet die Tafel erst, wenn sie
// 250 ms UNUNTERBROCHEN im Bild stand: Der Lade-Blitzer fällt raus, die echte
// Ankunft (auch die beim Laden im sichtbaren Bereich) bleibt.
// Reduzierte Bewegung / kein IntersectionObserver: sofort an – es gibt keinen
// Zustand, in dem Werte unsichtbar bleiben.
function useEingeschaltet() {
  const ref = useRef(null);
  const [an, setAn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || an) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setAn(true);
      return;
    }

    let timer = null;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timer === null) {
            timer = setTimeout(() => {
              setAn(true);
              obs.disconnect();
            }, 250);
          }
        } else if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" }
    );
    obs.observe(el);
    return () => {
      if (timer !== null) clearTimeout(timer);
      obs.disconnect();
    };
  }, [an]);

  return [ref, an];
}

export function Tafel({ titel, aktion, akzent = false, fusszeile, className = "", children }) {
  const [ref, an] = useEingeschaltet();
  // Einbau-Zähler für die Staffel: Jedes Fenster holt sich beim ersten Render
  // seinen Platz (useState-Initializer läuft einmal je Mount). Kein Reset
  // nötig – die Reihenfolge muss nur stabil und monoton sein.
  const zaehler = useRef(0);

  return (
    <div
      ref={ref}
      className={`overflow-hidden rounded-md border border-navy-600 ${
        akzent ? "border-t-2 border-t-brand-500 " : ""
      }bg-navy-800 ${className}`}
    >
      <TafelKontext.Provider value={{ an, naechsterPlatz: () => zaehler.current++ }}>
        {(titel || aktion) && (
          <div className="flex items-center justify-between gap-3 bg-navy-900 px-5 py-3">
            {titel && (
              <h2 className="text-sm font-bold uppercase tracking-wide text-paper-50">
                {titel}
              </h2>
            )}
            {aktion}
          </div>
        )}
        <div className="p-5">{children}</div>
        {fusszeile && (
          // Die „Hersteller-Plakette" der Tafel: Auf einer echten Tafel steht
          // hier der Herstellername – bei uns die Herkunft der Zahlen.
          <div className="border-t border-navy-600 px-5 py-2.5 text-xs text-mist-400">
            {fusszeile}
          </div>
        )}
      </TafelKontext.Provider>
    </div>
  );
}

// Ein Register: horizontale Fenstergruppe. Mobil bricht es zweispaltig um.
Tafel.Zeile = function TafelZeile({ spalten = 3, className = "", children }) {
  const grid =
    spalten === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : spalten === 2
      ? "grid-cols-2"
      : "grid-cols-3";
  return <div className={`grid ${grid} gap-3 ${className}`}>{children}</div>;
};

// Ein Ziffernfenster: Plakette (aufs Gehäuse gedruckt) + navy-950-„Glas" mit
// innerer Haarlinie + Wert über Segment-Geist. Das Fenster-Prinzip existierte
// im Code bereits (PPG-Kacheln des Profils) – hier ist es formalisiert.
Tafel.Fenster = function TafelFenster({
  label,
  unterzeile,
  wert = null,
  dezimalen = 0,
  stellen,
  groesse = "haupt",
  betont = false,
  countUp = false,
  className = "",
}) {
  const ctx = useContext(TafelKontext);
  // Platz in der Staffel einmalig beim Mount ziehen (stabil über Re-Renders).
  const [platz] = useState(() => (ctx ? ctx.naechsterPlatz() : 0));
  const an = ctx ? ctx.an : true;

  return (
    <div className={`text-center ${className}`}>
      <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">
        {label}
      </p>
      <div className="rounded-sm bg-navy-950 ring-1 ring-inset ring-navy-600/40 px-2 py-3">
        <SegmentZahl
          wert={wert}
          dezimalen={dezimalen}
          stellen={stellen}
          groesse={groesse}
          betont={betont}
          countUp={countUp}
          an={an}
          verzoegerung={platz * 60}
        />
      </div>
      {unterzeile && <p className="mt-1 text-[11px] text-mist-400">{unterzeile}</p>}
    </div>
  );
};

export default Tafel;
