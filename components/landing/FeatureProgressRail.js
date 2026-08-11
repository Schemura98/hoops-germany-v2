"use client";

import { useEffect, useRef } from "react";

// Fortschritts-Anzeige der Feature-Strecke (Konzept
// docs/LANDING-KONZEPT-2026-08-11.md, Abschnitt 7 / Stufe 2).
//
// Zweck: Aus sechs Einzel-Momenten eine spürbare Strecke machen – ohne Pinning
// und ohne eine einzige Sekunde zusätzliche Scrollzeit. Am Desktop ein
// schmaler Streifen am rechten Rand mit sechs Punkten, mobil ein dünner Balken
// unter der Navbar mit Kurz-Beschriftung ("2 / 6 · Kader füllt sich").
//
// Technik wie in HeroScrollStage.js: EIN Scroll-Listener für die ganze Sektion
// (nicht pro Karte), ein rAF-Tick, direkte Style-Mutation ohne Re-Render. Der
// Beschriftungstext wird nur bei Wechsel des Abschnitts geschrieben.
//
// Die Komponente sucht sich ihre Sektion selbst (closest("section")), damit die
// aufrufende Seite eine Server-Komponente bleiben kann.
const NAVBAR_HEIGHT = 64;

export default function FeatureProgressRail({ labels = [] }) {
  const wrapRef = useRef(null);
  const barRef = useRef(null);
  const labelRef = useRef(null);
  const dotsRef = useRef([]);
  const activeRef = useRef(-1);
  const tickingRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    if (!section || labels.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Bei reduzierter Bewegung füllt sich der Balken nicht scroll-synchron mit –
    // er würde sonst dauerhaft auf 0 % stehenbleiben und wie ein Fehler wirken.
    // Stattdessen wird er zur neutralen Linie; Beschriftung und Punkte tragen
    // die Orientierung, das sind einzelne Zustandswechsel, keine Bewegung.
    if (reduced && barRef.current) {
      barRef.current.style.transform = "scaleX(1)";
      barRef.current.style.backgroundColor = "#e5e7eb";
    }

    const apply = () => {
      tickingRef.current = false;
      const rect = section.getBoundingClientRect();
      if (rect.height <= 0) return;

      // 0 = Sektion beginnt gerade unter der Navbar, 1 = ihr Ende ist erreicht.
      const t = Math.min(1, Math.max(0, (NAVBAR_HEIGHT - rect.top) / rect.height));

      if (!reduced && barRef.current) barRef.current.style.transform = `scaleX(${t.toFixed(3)})`;

      const index = Math.min(labels.length - 1, Math.floor(t * labels.length));
      if (index === activeRef.current) return;
      activeRef.current = index;

      if (labelRef.current) {
        labelRef.current.textContent = `${index + 1} / ${labels.length} · ${labels[index]}`;
      }
      dotsRef.current.forEach((dot, i) => {
        if (!dot) return;
        dot.style.backgroundColor = i <= index ? "#f97316" : "#e5e7eb";
        dot.style.transform = i === index ? "scale(1.5)" : "scale(1)";
      });
    };

    let raf = 0;
    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [labels]);

  return (
    // display:contents - der Wrapper darf keine eigene Box bilden: Sonst ist er
    // genauso hoch wie der Balken (das Desktop-Element daneben ist absolut
    // positioniert), und ein sticky-Kind hat in einem Containing Block ohne
    // Spielraum keine Strecke zum Kleben (Befund Tobias, 12.08.2026).
    <div ref={wrapRef} aria-hidden="true" style={{ display: "contents" }}>
      {/* Mobil/Tablet: dünner Balken unter der Navbar + Kurz-Beschriftung */}
      <div className="sticky top-16 z-20 -mx-4 mb-10 bg-gray-50/90 px-4 pb-2 pt-2 backdrop-blur-sm xl:hidden">
        <p
          ref={labelRef}
          className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500"
        >
          {`1 / ${labels.length} · ${labels[0] || ""}`}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            ref={barRef}
            className="h-full w-full origin-left rounded-full bg-brand-500"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      {/* Desktop: Punkte-Streifen am rechten Rand, außerhalb des Inhalts */}
      <div className="pointer-events-none absolute inset-y-0 right-6 hidden xl:block">
        <div className="sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-3">
          {labels.map((label, i) => (
            <span
              key={label}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              title={label}
              className="h-2 w-2 rounded-full bg-gray-200 transition-transform duration-300 motion-reduce:transition-none"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
