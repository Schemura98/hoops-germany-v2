"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-gebundene Bildsequenz „Sprungball" – der Mechanismus, an dem die
// Apple-Produktseiten hängen: Nicht ein Video wird abgespielt, sondern zu jeder
// Scrollposition gehört genau ein Einzelbild. Man scrollt die Bewegung, statt
// ihr zuzusehen.
//
// Material: 45 prozedural erzeugte Bilder (scripts/generate-swish-sequence.js,
// von Milo entworfen). Bewusst KEIN KI-Video: Die geprüften Generatoren sind
// auf Fotorealismus trainiert, liefern keinen Alphakanal und sind über
// Einzelbilder hinweg nicht stabil genug – bei einer scroll-gebundenen Sequenz
// sieht man jedes Bild einzeln und kann anhalten, da fällt jede Abweichung auf.
//
// Gewicht: 191 KB für alle 45 Bilder zusammen. Ronjas Grenze sind 200 KB, und
// sie wird nur ausgereizt, weil NICHTS davon beim ersten Seitenaufruf lädt –
// siehe unten.
const ANZAHL = 45;
const PFAD = (i) => `/images/swish/frame-${String(i).padStart(3, "0")}.webp`;

export default function SwishSequence({ className = "" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const bilderRef = useRef([]);
  const letztesRef = useRef(-1);
  const tickingRef = useRef(false);
  const [laden, setLaden] = useState(false);

  // Erst laden, wenn der Abschnitt in die Nähe kommt. Ohne das würden 191 KB
  // beim ersten Aufruf der Startseite mitgeladen, obwohl die Sequenz ganz unten
  // sitzt und viele Besucher sie nie sehen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLaden(true);
      return;
    }
    const beobachter = new IntersectionObserver(
      ([eintrag]) => {
        if (eintrag.isIntersecting) {
          setLaden(true);
          beobachter.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  useEffect(() => {
    if (!laden) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    let abgebrochen = false;

    const zeichne = (index) => {
      const bild = bilderRef.current[index];
      if (!bild || !bild.complete || !bild.naturalWidth) return;
      if (canvas.width !== bild.naturalWidth || canvas.height !== bild.naturalHeight) {
        canvas.width = bild.naturalWidth;
        canvas.height = bild.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bild, 0, 0);
      letztesRef.current = index;
    };

    // Bei reduzierter Bewegung wird nur EIN Bild geladen und gezeigt – der
    // Endstand, Ball im Netz. Kein Grund, jemandem 45 Bilder zu schicken,
    // dessen System ausdrücklich um Ruhe bittet.
    if (ruhig) {
      const einzeln = new Image();
      einzeln.decoding = "async";
      einzeln.onload = () => {
        if (abgebrochen) return;
        bilderRef.current[ANZAHL - 1] = einzeln;
        zeichne(ANZAHL - 1);
      };
      einzeln.src = PFAD(ANZAHL - 1);
      return () => {
        abgebrochen = true;
      };
    }

    for (let i = 0; i < ANZAHL; i++) {
      const bild = new Image();
      bild.decoding = "async";
      bild.src = PFAD(i);
      // Das erste geladene Bild sofort zeigen, damit die Fläche nicht leer
      // bleibt, bis alle da sind.
      bild.onload = () => {
        if (!abgebrochen && letztesRef.current === -1) zeichne(i);
      };
      bilderRef.current[i] = bild;
    }

    const anwenden = () => {
      tickingRef.current = false;
      const r = wrap.getBoundingClientRect();
      const hoehe = window.innerHeight;
      // 0 = Abschnitt betritt das Bild von unten, 1 = er verlässt es oben.
      const t = Math.min(1, Math.max(0, (hoehe - r.top) / (hoehe + r.height)));
      const index = Math.min(ANZAHL - 1, Math.floor(t * ANZAHL));
      if (index !== letztesRef.current) zeichne(index);
    };

    let raf = 0;
    const beiScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(anwenden);
    };

    anwenden();
    window.addEventListener("scroll", beiScroll, { passive: true });
    window.addEventListener("resize", beiScroll);
    return () => {
      abgebrochen = true;
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      window.removeEventListener("scroll", beiScroll);
      window.removeEventListener("resize", beiScroll);
    };
  }, [laden]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full object-contain" />
    </div>
  );
}
