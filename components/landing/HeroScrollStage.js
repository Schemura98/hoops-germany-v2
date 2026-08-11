"use client";

import { useEffect, useRef, useState } from "react";
import { BallGlyph, CourtArc, HoopEmblem } from "@/components/landing/HeroGlyphs";

// Scroll-gesteuerte Hero-Bühne „Sprungball" – Stufe 1 (mobil zuerst).
// Spezifikation: docs/HERO-KONZEPT-2026-08-11.md (Vivien, v2 vom 11.08.2026).
//
// Erzählung: Während der Hero beim normalen Scrollen vorbeizieht, vertieft sich
// die Fläche (Navy-Tint + Overlay), ein Spielfeld-Bogen blendet auf und ein Ball
// fällt von oben durch die Szene – er landet in einem kleinen Korb-Emblem an der
// oberen Ecke der primären Schaltfläche und fällt mit einem kurzen Swish durchs Netz.
//
// Bewusste Randbedingungen (alle aus dem Konzept, nicht frei gewählt):
// - KEIN Pinning, KEINE zusätzliche Scrollstrecke: Die Hero-Höhe bleibt exakt
//   calc(100vh - 4rem). Auf dem Handy soll niemand erst durch einen „Trailer"
//   scrollen, bevor die Schaltflächen erreichbar sind.
// - Der Zielpunkt wird zur Laufzeit am Rechteck der primären Schaltfläche
//   gemessen – deshalb stimmt er bei 3 wie bei 5 Schaltflächen und auch nach
//   Textänderungen (z.B. „…in NRW" statt „…in Deutschland").
// - KEIN Foto-Zoom: Das Hero-Foto ist nur 1000x652px und wird formatfüllend
//   ohnehin bis ~5x hochskaliert (Milos Messung, docs/HERO-ASSETS-2026-08-11.md).
//   Jede zusätzliche Vergrößerung würde die Weichzeichnung sichtbar verstärken.
// - Nur transform/opacity, ein Scroll-Listener, ein rAF-Tick, direkte
//   Style-Mutation statt React-Re-Render pro Frame.
// - prefers-reduced-motion: ruhiger Endzustand, Ball und Emblem entfallen ganz.

const NAVBAR_HEIGHT = 64; // h-16 der sticky Navbar
const PROGRESS_SPAN = 0.45; // Anteil der Hero-Höhe, über den t von 0 auf 1 läuft
// (kurz genug, dass Tint und Bogen ihren Endwert erreichen, SOLANGE der Hero noch
// im Bild ist – bei 0.7 war die Vertiefung erst fertig, als er fast raus war)
// Der Ball ist deutlich früher am Ziel als die Flächen-Bewegung: Sonst käme er
// erst an, wenn die Schaltfläche schon oben aus dem Bild gescrollt ist – die
// Ankunft muss sichtbar stattfinden, nicht hinter der Oberkante.
const BALL_SPAN = 0.75;

const OVERLAY_FROM = 0.65; // heutiger Wert (bg-black/65) – Startpunkt
const OVERLAY_TO = 0.72; // leichte Vertiefung zum Ende
const NAVY_MAX = 0.5; // Marken-Tint, bewusst kein Vollwechsel
const NAVY_STATIC = 0.2; // prefers-reduced-motion
const ARC_MAX = 0.14; // Deckkraft des Spielfeld-Bogens

const EMBLEM_FROM = 0.85; // ab hier blendet das Korb-Emblem auf
const SWISH_FROM = 0.9; // ab hier fällt der Ball durchs Netz und blendet aus
const SWISH_DROP = 16; // px, die er dabei zusätzlich sinkt

const BALL_R = 14; // halbe Kantenlänge des Ball-SVG (28px)
const EMBLEM_W = 20;
const EMBLEM_H = 14;

// Weicher Puffer, über den der Ball vor und nach dem Textblock aus-/einblendet.
const TEXT_FADE_MARGIN = 24;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Deckkraft des Balls in Abhängigkeit vom Textblock: Auf Höhe von Badge/Headline/
// Subline blendet er VOLLSTÄNDIG aus (nicht nur abgesenkt – eine reduzierte
// Deckkraft würde das Flackern hinter den Buchstaben nur abschwächen, nicht lösen).
// Wird zur Laufzeit gemessen und ist damit breitenunabhängig: Zeilenumbrüche lassen
// sich nicht verlässlich vorhersagen, deshalb kein Sonderwert je Breakpoint.
// Entscheid Vivien 11.08.2026 auf Tobias' Befund bei 430px.
function ballOpacityNearText(ballCenterY, textRect) {
  if (!textRect) return 1;
  if (ballCenterY < textRect.top - TEXT_FADE_MARGIN) return 1;
  if (ballCenterY < textRect.top) {
    return 1 - (ballCenterY - (textRect.top - TEXT_FADE_MARGIN)) / TEXT_FADE_MARGIN;
  }
  if (ballCenterY <= textRect.bottom) return 0;
  if (ballCenterY <= textRect.bottom + TEXT_FADE_MARGIN) {
    return (ballCenterY - textRect.bottom) / TEXT_FADE_MARGIN;
  }
  return 1;
}

export default function HeroScrollStage({ ctaRef, textRef, backgroundImage, className = "", children }) {
  const stageRef = useRef(null);
  const navyRef = useRef(null);
  const overlayRef = useRef(null);
  const arcRef = useRef(null);
  const ballRef = useRef(null);
  const emblemRef = useRef(null);
  const tickingRef = useRef(false);

  // null = noch nicht geprüft (erster Render, auch serverseitig): dann wird der
  // ruhige Endzustand gerendert, damit nichts aufblitzt.
  const [animated, setAnimated] = useState(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimated(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!animated) return;
    const stage = stageRef.current;
    if (!stage) return;

    const apply = () => {
      tickingRef.current = false;
      const rect = stage.getBoundingClientRect();
      if (rect.height <= 0) return;

      const t = clamp((NAVBAR_HEIGHT - rect.top) / (rect.height * PROGRESS_SPAN), 0, 1);

      if (navyRef.current) navyRef.current.style.opacity = (t * NAVY_MAX).toFixed(3);
      if (overlayRef.current) {
        overlayRef.current.style.opacity = (OVERLAY_FROM + (OVERLAY_TO - OVERLAY_FROM) * t).toFixed(3);
      }
      if (arcRef.current) arcRef.current.style.opacity = (t * ARC_MAX).toFixed(3);

      const cta = ctaRef?.current;
      const ball = ballRef.current;
      const emblem = emblemRef.current;
      if (!cta || !ball || !emblem) return;

      // Zielpunkt: obere Ecke der primären Schaltfläche, halb über deren Kante –
      // wie ein Abzeichen, nie über der Beschriftung.
      const cta_ = cta.getBoundingClientRect();
      const targetX = cta_.right - rect.left;
      const targetY = cta_.top - rect.top;

      const emblemX = targetX - EMBLEM_W / 2;
      const emblemY = targetY - EMBLEM_H / 2;

      // Ball: reine Fallbewegung mit leichtem Wackeln – läuft mit der
      // Scrollrichtung statt gegen sie und braucht keine seitliche Fläche.
      const tb = clamp(t / BALL_SPAN, 0, 1);
      const y0 = -BALL_R * 2;
      const y1 = targetY - 2;
      let y = y0 + (y1 - y0) * tb;
      const x = targetX + Math.sin(tb * Math.PI * 2.2) * 6;

      let ballOpacity = 1;
      let swish = 0;
      if (tb < 0.06) {
        ballOpacity = tb / 0.06;
      } else if (tb > SWISH_FROM) {
        const through = (tb - SWISH_FROM) / (1 - SWISH_FROM);
        y += through * SWISH_DROP;
        ballOpacity = Math.max(0, 1 - through);
        swish = Math.sin(through * Math.PI);
      }

      // Textblock-Ausblendung mit der Bahn-Deckkraft verrechnen (beide Ursachen
      // multiplizieren sich, damit weder Einblenden noch Swish überschrieben wird).
      const textRect = textRef?.current?.getBoundingClientRect();
      ballOpacity *= ballOpacityNearText(rect.top + y, textRect);

      ball.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${(y - BALL_R).toFixed(
        1
      )}px, 0) rotate(${(tb * 280).toFixed(1)}deg)`;
      ball.style.opacity = clamp(ballOpacity, 0, 1).toFixed(3);

      // Swish als Teil des transform-Strings (nicht als eigene `scale`-Property –
      // die kennt älteres Safari nicht).
      emblem.style.transform = `translate3d(${emblemX.toFixed(1)}px, ${emblemY.toFixed(
        1
      )}px, 0) scale(${(1 + swish * 0.12).toFixed(3)})`;
      emblem.style.opacity =
        tb > EMBLEM_FROM ? clamp((tb - EMBLEM_FROM) / (1 - EMBLEM_FROM), 0, 1).toFixed(3) : "0";
    };

    // Geplanten Frame merken, damit er beim Abmelden nicht mehr gegen bereits
    // entfernte Nodes läuft (Deploy-Gate-Befund Kai, 10.08.2026).
    let raf = 0;
    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    // Nach dem Laden von Bild/Schrift einmal nachmessen – bis dahin können sich
    // die Rechtecke noch verschieben.
    window.addEventListener("load", apply);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      window.removeEventListener("load", apply);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [animated, ctaRef, textRef]);

  return (
    <div
      ref={stageRef}
      className={`relative flex items-center justify-center overflow-hidden text-white ${className}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "calc(100vh - 4rem)",
      }}
    >
      {/* Marken-Navy als Vertiefung über dem Foto (kein Vollwechsel) */}
      <div
        ref={navyRef}
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-slate-950 to-slate-800"
        style={{ opacity: animated ? 0 : NAVY_STATIC }}
      />
      {/* Kontrast-Overlay – trägt die Lesbarkeit der Headline */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 bg-black"
        style={{ opacity: OVERLAY_FROM }}
      />

      <CourtArc ref={arcRef} style={animated ? undefined : { opacity: ARC_MAX }} />

      {/* Ball und Korb-Emblem nur bei erlaubter Bewegung */}
      {animated && (
        <>
          <BallGlyph ref={ballRef} />
          <HoopEmblem ref={emblemRef} />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">{children}</div>
    </div>
  );
}
