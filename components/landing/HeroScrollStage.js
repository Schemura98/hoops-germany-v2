"use client";

import { useEffect, useRef, useState } from "react";
import { BallSprite, BALL_SPRITE_FRAMES } from "@/components/landing/HeroGlyphs";
import PlayDiagram from "@/components/landing/PlayDiagram";

// Scroll-gesteuerte Hero-Bühne „Sprungball" – Stufe 1 (mobil zuerst).
// Spezifikation: docs/HERO-KONZEPT-2026-08-11.md (Vivien, v2 vom 11.08.2026).
//
// Erzählung: Während der Hero beim normalen Scrollen vorbeizieht, blendet ein
// Spielfeld-Bogen auf und ein Ball fällt von oben durch die Szene.
//
// Seit A10 (docs/SPIELFELD-STRECKE-2026-08-12.md, Patricks Freigabe
// "Ball-Landung darf entfallen" vom 12.08.2026) landet er NICHT mehr hier: Er
// kommt an der oberen Ecke der primären Schaltfläche nur noch zur Ruhe (ein
// weicher Aufsetzer, kein Netz-Swish, kein Ausblenden) und bleibt sichtbar im
// Spiel – die eigentliche Landung mit Korb-Emblem und Swish findet jetzt am
// Ende der Fortschritts-Leiste statt (FeatureProgressRail.js), wenn Szene 6
// "Nachspielzeit" erreicht ist. Ein Motiv, eine Reise durch die ganze Seite,
// eine einzige Landung – statt einer Zwischen-Pointe, die schon im Hero
// vorwegnimmt, was eigentlich das Ziel der ganzen Strecke ist.
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

// Ab hier klingt das Wackeln/die Drehung aus und der Ball setzt sanft auf,
// statt weiter durchzufallen und im Netz zu verschwinden (A10-Anpassung).
const SETTLE_FROM = 0.82;

// Anzeigegröße des Hero-Balls. Seit dem 15.08.2026 (Auftrag Patrick: "groß")
// eine gerenderte Bildsequenz statt des 28px-Vektors – erst in dieser Größe
// ist überhaupt zu sehen, dass die Nähte über eine Kugel wandern.
// Mobil kleiner, weil der Ball sonst mehr als ein Drittel der Breite belegt und
// die Headline erdrückt, die er eigentlich begleiten soll.
// Die Größe steht als Tailwind-Klasse an der Komponente (mobil 104px, ab md
// 176px), NICHT hier – der Controller MISST sie am Element (`offsetWidth`).
// Grund: Der Radius steckt an drei Stellen (Positionierung ab Mittelpunkt,
// Startlage über dem Bildrand, Rollwinkel). Eine zweite Quelle für dieselbe
// Zahl wäre die klassische Stelle, an der später eine von beiden nachgezogen
// wird und die andere nicht.

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
      if (!cta || !ball) return;

      // Radius am Element gemessen, nicht angenommen – s. Kommentar oben.
      const BALL_R = ball.offsetWidth / 2 || 1;

      // Zielpunkt: obere Ecke der primären Schaltfläche, halb über deren Kante –
      // wie ein Abzeichen, nie über der Beschriftung. Hier setzt der Ball jetzt
      // nur noch AUF, statt zu landen (s. Kommentar oben).
      const cta_ = cta.getBoundingClientRect();
      const targetX = cta_.right - rect.left;
      const targetY = cta_.top - rect.top;

      // Ball: reine Fallbewegung mit leichtem Wackeln – läuft mit der
      // Scrollrichtung statt gegen sie und braucht keine seitliche Fläche.
      const tb = clamp(t / BALL_SPAN, 0, 1);
      const y0 = -BALL_R * 2;
      const y1 = targetY - 2;
      let y = y0 + (y1 - y0) * tb;

      // Wackeln/Drehung klingen zum Aufsetzer hin aus, statt bis zum letzten
      // Frame mit voller Amplitude weiterzulaufen – ein Ball, der zur Ruhe
      // kommt, hört vorher auf zu tänzeln.
      let wobbleAmp = 6;
      let angle = tb * 280;
      if (tb > SETTLE_FROM) {
        const settle = (tb - SETTLE_FROM) / (1 - SETTLE_FROM);
        wobbleAmp = 6 * (1 - settle);
        // Ein sanftes Überschwingen kurz vor dem Aufsetzen – ein realer Ball
        // bremst nicht linear ab, er hüpft ein letztes Mal ganz leicht.
        y -= Math.sin(settle * Math.PI) * 4 * (1 - settle);
        // Die Drehung läuft nicht bis zum letzten Frame linear weiter, sondern
        // klingt zum Stillstand hin aus (Rest-Drehung statt abruptem Stopp).
        angle = SETTLE_FROM * 280 + settle * 40;
      }
      let x = targetX + Math.sin(tb * Math.PI * 2.2) * wobbleAmp;

      // ── Übergabe an die Fortschritts-Leiste (15.08.2026, Auftrag Patrick) ──
      // Vorher endete die Reise hier: Der Ball kam am Aufsetzpunkt zur Ruhe und
      // scrollte dann eingefroren aus dem Bild – gemessen stand sein transform
      // ab 10 % Seitenscroll unverändert, während der Streckenball erst rund
      // 245px später einsetzte. Dazwischen trug niemand das Motiv, und aus
      // "einer Reise durch die Seite" wurden zwei Auftritte.
      //
      // Jetzt rollt er weiter, sobald der Hero das Bild verlässt, und blendet
      // dabei aus – die Leiste übernimmt genau dort. Bezug ist die Unterkante
      // des Heros, NICHT `t`: `t` ist nach 45 % der Hero-Höhe fertig, also lange
      // bevor die Bühne wirklich weg ist. Der Ball würde sonst mitten im Bild
      // verschwinden.
      const sichtHoehe = window.innerHeight || 1;
      const tu = clamp(
        (sichtHoehe - rect.bottom) / Math.max(1, sichtHoehe - NAVBAR_HEIGHT),
        0,
        1
      );
      if (tu > 0) {
        // Der Ball rollt in Laufrichtung aus dem Bild – die Drehung folgt dabei
        // der zurückgelegten Strecke (Weg/Radius), wie auf der Leiste auch.
        const abrollweg = tu * (rect.width - targetX + BALL_R * 4);
        x += abrollweg;
        angle += (abrollweg / BALL_R) * (180 / Math.PI);
      }

      // Kein Ausblenden mehr am Ziel: Der Ball bleibt sichtbar am Ruhepunkt
      // stehen (die eigentliche Landung findet jetzt auf der Fortschritts-
      // Leiste statt, s. Kommentar oben) – nur der Einblend- und der
      // Textblock-Fade bleiben.
      let ballOpacity = tb < 0.06 ? tb / 0.06 : 1;

      // Textblock-Ausblendung mit der Bahn-Deckkraft verrechnen (beide Ursachen
      // multiplizieren sich, damit das Einblenden nicht überschrieben wird).
      const textRect = textRef?.current?.getBoundingClientRect();
      ballOpacity *= ballOpacityNearText(rect.top + y, textRect);

      // Ausblenden der Übergabe erst in deren zweiter Hälfte: Wer den Hero zügig
      // durchscrollt, soll das Weiterrollen noch sehen, nicht nur ein
      // Verschwinden. Steht bewusst NACH der Deklaration von `ballOpacity` –
      // die erste Fassung rechnete oben im `tu`-Block damit und wäre in die
      // temporale Totzone gelaufen (ReferenceError bei jedem Frame).
      if (tu > 0) ballOpacity *= 1 - clamp((tu - 0.5) / 0.5, 0, 1);

      // KEIN `rotate()` mehr: Die Drehung steckt in der Bildsequenz. Eine
      // zusätzliche Flächendrehung würde die echte Kugelrotation überlagern
      // und den ganzen Zweck der Sequenz aufheben – der Ball sähe aus, als
      // taumele er.
      ball.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${(y - BALL_R).toFixed(
        1
      )}px, 0)`;
      // Bildwahl aus dem Drehwinkel. Der Streifen deckt EINE volle Umdrehung
      // ab, deshalb modulo 360 – `angle` läuft während der Übergabe auf
      // mehrere tausend Grad hoch.
      const bild =
        ((Math.round((angle / 360) * BALL_SPRITE_FRAMES) % BALL_SPRITE_FRAMES) +
          BALL_SPRITE_FRAMES) %
        BALL_SPRITE_FRAMES;
      // Prozent statt Pixel: dadurch ist die Bildwahl von der Anzeigegröße
      // unabhängig und stimmt mobil wie am Desktop ohne Umrechnung.
      ball.style.backgroundPositionX = `${(bild / (BALL_SPRITE_FRAMES - 1)) * 100}%`;
      ball.style.opacity = clamp(ballOpacity, 0, 1).toFixed(3);
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

      {/* Ball nur bei erlaubter Bewegung – das Korb-Emblem sitzt seit A10 nicht
          mehr hier, sondern am Ende der Fortschritts-Leiste. */}
      {animated && (
        <BallSprite ref={ballRef} className="h-[104px] w-[104px] md:h-[176px] md:w-[176px]" />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">{children}</div>
    </div>
  );
}
