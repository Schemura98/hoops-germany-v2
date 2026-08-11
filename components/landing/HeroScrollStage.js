"use client";

import { useEffect, useRef, useState } from "react";
import { BallGlyph, HoopEmblem } from "@/components/landing/HeroGlyphs";
import PlayDiagram from "@/components/landing/PlayDiagram";

// Scroll-gesteuerte Hero-Bühne „Sprungball" – Stufe 1 (mobil zuerst).
// Spezifikation: docs/HERO-KONZEPT-2026-08-11.md (Vivien, v2 vom 11.08.2026).
//
// Erzählung: Während der Hero beim normalen Scrollen vorbeizieht, blendet ein
// Spielfeld-Bogen auf und ein Ball fällt von oben durch die Szene – er landet in
// einem kleinen Korb-Emblem an der oberen Ecke der primären Schaltfläche und
// fällt mit einem kurzen Swish durchs Netz.
//
// Seit dem Redesign (12.08.2026) trägt die Bühne KEIN Foto mehr. Der Grund ist
// nicht Geschmack: Das Motiv war 1000x652px, wurde formatfüllend bis ~5x
// hochskaliert und musste unter einem 65-%-Schwarz-Overlay verschwinden, damit
// die Headline lesbar blieb – ein teures Bild, das am Ende fast nur als graue
// Fläche wirkte. Jetzt steht die Typografie auf der navy-950-Fläche, der Bogen
// darf sichtbar sein statt bei 14 % Deckkraft zu verhungern, und der Hero lädt
// ohne ein einziges Byte Bilddaten.
//
// Bewusste Randbedingungen (alle aus dem Konzept, nicht frei gewählt):
// - KEIN Pinning, KEINE zusätzliche Scrollstrecke: Die Hero-Höhe bleibt exakt
//   calc(100vh - 4rem). Auf dem Handy soll niemand erst durch einen „Trailer"
//   scrollen, bevor die Schaltflächen erreichbar sind.
// - Der Zielpunkt wird zur Laufzeit am Rechteck der primären Schaltfläche
//   gemessen – deshalb stimmt er bei 3 wie bei 5 Schaltflächen und auch nach
//   Textänderungen (z.B. „…in NRW" statt „…in Deutschland").
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

// Der Bogen darf jetzt wirklich gesehen werden: Über dem Foto musste er auf
// 0.14 gedrosselt werden, um im Bildrauschen nicht zu zerfasern. Auf der ruhigen
// Fläche ist er die einzige Zeichnung im Hintergrund und trägt bei 0.55 die
// Tiefe, die vorher das Overlay liefern musste.
// Deckkraft der Taktiktafel als Ganzes. Sie liegt jetzt hinter dem Text (statt
// als schmaler Bogen am unteren Rand), deshalb bewusst niedriger: Sie soll den
// Raum grundieren, nicht mit der Headline um Aufmerksamkeit streiten.
const ARC_MAX = 0.38;

// Die Taktiktafel zeichnet sich über eine eigene, kürzere Strecke als die
// Flächen-Bewegung: Ein Spielzug, der erst fertig ist, wenn der Hero schon halb
// aus dem Bild ist, wird nie zu Ende gesehen.
const PLAY_SPAN = 0.6;

const EMBLEM_FROM = 0.85; // ab hier blendet das Korb-Emblem auf
const SWISH_FROM = 0.9; // ab hier fällt der Ball durchs Netz und blendet aus
const SWISH_DROP = 16; // px, die er dabei zusätzlich sinkt

const BALL_R = 14; // halbe Kantenlänge des Ball-SVG (28px)
const EMBLEM_W = 20;
const EMBLEM_H = 14;

// Weicher Puffer, über den der Ball vor und nach dem Textblock abdunkelt.
const TEXT_FADE_MARGIN = 24;
// Bodenwert statt hartem 0: Bei 0 verschwand der Ball auf 375px praktisch die
// ganze Fallstrecke (Ronjas Messung – der Textblock füllt dort fast alles bis
// zur Schaltfläche). 20% halten die Bewegung durchgehend erkennbar, ohne das
// scharfkantige Aufblitzen zwischen den Buchstaben, das der Grund für die 0 war
// (Entscheid Vivien, docs/LANDING-KONZEPT-2026-08-11.md §17.2).
const TEXT_DIM_FLOOR = 0.2;

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
    const t = (ballCenterY - (textRect.top - TEXT_FADE_MARGIN)) / TEXT_FADE_MARGIN;
    return 1 - t * (1 - TEXT_DIM_FLOOR);
  }
  if (ballCenterY <= textRect.bottom) return TEXT_DIM_FLOOR;
  if (ballCenterY <= textRect.bottom + TEXT_FADE_MARGIN) {
    const t = (ballCenterY - textRect.bottom) / TEXT_FADE_MARGIN;
    return TEXT_DIM_FLOOR + t * (1 - TEXT_DIM_FLOOR);
  }
  return 1;
}

export default function HeroScrollStage({ ctaRef, textRef, className = "", children }) {
  const stageRef = useRef(null);
  const arcRef = useRef(null);
  // Einmal beim Aufsetzen eingesammelt statt pro Frame abgefragt: querySelectorAll
  // in der rAF-Schleife wäre ein Layout-/Baum-Zugriff pro Bild.
  const linienRef = useRef([]);
  const punkteRef = useRef([]);
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

    const svg = arcRef.current;
    linienRef.current = svg
      ? Array.from(svg.querySelectorAll("[data-play-line]")).map((el) => ({
          el,
          von: parseFloat(el.dataset.from),
          bis: parseFloat(el.dataset.to),
        }))
      : [];
    punkteRef.current = svg
      ? Array.from(svg.querySelectorAll("[data-play-dot]")).map((el) => ({
          el,
          ab: parseFloat(el.dataset.at),
        }))
      : [];

    const apply = () => {
      tickingRef.current = false;
      const rect = stage.getBoundingClientRect();
      if (rect.height <= 0) return;

      const t = clamp((NAVBAR_HEIGHT - rect.top) / (rect.height * PROGRESS_SPAN), 0, 1);

      if (arcRef.current) arcRef.current.style.opacity = (t * ARC_MAX).toFixed(3);

      // Spielzug zeichnen: jede Linie hat ihr eigenes Zeitfenster, damit der Zug
      // eine Reihenfolge hat (erst das Feld, dann der Laufweg, dann der Pass)
      // statt gleichzeitig aufzutauchen.
      const tp = clamp(t / PLAY_SPAN, 0, 1);
      for (const { el, von, bis } of linienRef.current) {
        const anteil = clamp((tp - von) / (bis - von), 0, 1);
        el.style.strokeDashoffset = (1 - anteil).toFixed(4);
      }
      for (const { el, ab } of punkteRef.current) {
        el.style.opacity = tp >= ab ? "1" : "0";
      }

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
      className={`relative flex items-center justify-center overflow-hidden bg-navy-950 text-paper-50 ${className}`}
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <PlayDiagram
        ref={arcRef}
        gezeichnet={!animated}
        style={animated ? undefined : { opacity: ARC_MAX }}
      />

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
