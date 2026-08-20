"use client";

import { useEffect, useRef } from "react";
import { BallPfade, BALL_PX, BALL_R } from "@/components/landing/DribbelBall";

// ══ DER PASS ════════════════════════════════════════════════════════════════
//
// Auftrag Patrick, 21.08.2026: „dann wird der orangene Ball zur Registrierung
// oder Login gepasst oder bei eingeloggten Usern zum Profil, oder Team etc."
//
// ══ WARUM EIN PASS UND KEIN WURF — und warum das der billigere Schluss ist ══
//
// CLAUDE.md Roadmap 20 (d) hält über die Vorgänger-Choreografie einen Satz
// fest, den man zweimal lesen muss: Die Landung war auf KEINEM Viewport
// sichtbar. Ball und Korb standen bei der Ankunft hinter der haftenden
// Navigationsleiste. Die Pointe einer seitenlangen Reise hat nie jemand
// gesehen.
//
// Der Grund war strukturell, nicht handwerklich: Das Ziel lag an einer festen
// Stelle im DOKUMENT, und ob diese Stelle im BILD ist, entscheidet die
// Fensterhöhe. Dieselbe Achse wie in Roadmap 20b („vier Runden Breiten
// geprüft, der Ausfall hing an der Höhe").
//
// Ein Pass dreht das um. Er ist an das ZIEL gebunden und wird in Anteilen der
// FENSTERHÖHE gefahren:
//     Beginn  – Oberkante des Ziels bei 88 % der Fensterhöhe
//     Ende    – Oberkante des Ziels bei 58 % der Fensterhöhe
// Beide Marken sind per Konstruktion im Bild, auf jedem Fenster. Es gibt
// keinen Fensterschnitt, bei dem der Pass hinter etwas stattfindet, weil die
// Bühne nicht mehr das Dokument ist, sondern das Bild.
// ⚠️ Das ist die Bedingung aus Roadmap 20 (d) — vorher erfüllt, nicht
// hinterher gemessen. Nachgemessen wurde sie trotzdem (s. Bericht).
//
// ══ DER BALL KOMMT AN, ER VERSCHWINDET NICHT ════════════════════════════════
// Er bleibt am Ziel LIEGEN, außerhalb davon. Ein Ball, der in einer Taste
// verschwindet, ist Tobias' Befund von der alten Endmarke im neuen Kostüm:
// „Das ist keine Aussage, es ist ein Verschwinden." Ein Pass endet in den
// Händen eines Mitspielers — der Mitspieler ist hier die Taste, und man sieht
// beide.
//
// ══ DIE RUHELAGE IST EINE LAYOUT-ENTSCHEIDUNG, KEINE SUCHE ═════════════════
// Genau zwei Möglichkeiten, einmal je Fenstergröße entschieden:
//   · Ist links neben der Taste Platz (≥ PLATZ_SEITLICH), liegt der Ball dort.
//   · Sonst liegt er darüber.
// Auf dem Desktop steht die Tastenreihe mittig in einem randlosen Abschnitt —
// da ist Platz. Mobil ist die Taste randfüllend — da ist keiner. Beides fällt
// aus dem Layout, nichts wird gesucht, nichts weicht aus.
//
// ══ ZURÜCKSCROLLEN ═════════════════════════════════════════════════════════
// Der Pass folgt dem Scroll in beide Richtungen. Kein Einfrieren nach der
// ersten Ankunft — das war an der Vorgängerin ein gemeldeter Darstellungs-
// fehler (Balken lief weiter, Ball klebte), und es ist auch inhaltlich falsch:
// Wer zurückscrollt, spult zurück.

const BEGINN = 0.88; // Ziel-Oberkante bei diesem Anteil der Fensterhöhe
const ENDE = 0.58;
const PLATZ_SEITLICH = 3 * BALL_PX; // Ball plus Abstand plus Luft
const ABSTAND = 14; // Ruhelage zur Tastenkante — Kontur zu Kontur

const klemm = (v, a, b) => Math.min(b, Math.max(a, v));
// Ausklingen statt gleichmäßig: Ein Pass wird abgegeben und wird langsamer,
// er beschleunigt nicht auf den Empfänger zu.
const auslauf = (f) => 1 - (1 - f) * (1 - f) * (1 - f);

export default function BallPass() {
  const wrapRef = useRef(null);
  const ballRef = useRef(null);
  const lageRef = useRef(null);
  const tickRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const bezug = wrap?.closest("[data-passfeld]");
    if (!wrap || !bezug) return;
    const ziel = bezug.querySelector("[data-pass-ziel]");
    if (!ziel) return;

    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Lage im Bezugsfeld, transform-frei — dieselbe Kette und derselbe Grund
    // wie im Dribbelweg (Reveal transformiert, `offsetParent` springt).
    const lageIn = (el) => {
      let x = 0;
      let y = 0;
      let k = el;
      while (k && k !== bezug) {
        x += k.offsetLeft;
        y += k.offsetTop;
        k = k.offsetParent;
      }
      return k === bezug ? { x, y } : null;
    };

    const vermessen = () => {
      const z = lageIn(ziel);
      if (!z) {
        lageRef.current = null;
        return;
      }
      const b = ziel.offsetWidth;
      const h = ziel.offsetHeight;
      const seitlich = z.x >= PLATZ_SEITLICH;

      const ruheX = seitlich ? z.x - ABSTAND - BALL_PX : z.x + b / 2 - BALL_R;
      const ruheY = seitlich ? z.y + h / 2 - BALL_R : z.y - ABSTAND - BALL_PX;

      // Der Ball kommt von OBEN und von der Seite, aus der Richtung, in die
      // der Dribbelweg zuletzt zeigte. Er kommt nicht aus dem Nichts neben der
      // Taste — sonst wäre es kein Pass, sondern ein Auftauchen.
      const startX = z.x + b / 2 - BALL_R;
      const startY = ruheY - 190;

      lageRef.current = { startX, startY, ruheX, ruheY, zielOben: z.y };
      wrap.style.visibility = "visible";
    };

    const setzen = () => {
      tickRef.current = false;
      const L = lageRef.current;
      if (!L || !ballRef.current) return;

      const zielSchirm = ziel.getBoundingClientRect().top;
      const H = window.innerHeight || 1;
      const f = ruhig
        ? 1
        : klemm((BEGINN * H - zielSchirm) / ((BEGINN - ENDE) * H), 0, 1);
      const e = auslauf(f);

      const x = L.startX + (L.ruheX - L.startX) * e;
      const y = L.startY + (L.ruheY - L.startY) * e;
      // Der Ball dreht sich im Flug und kommt zur Ruhe — ein abgegebener Ball
      // rotiert, ein liegender nicht. Der Winkel läuft deshalb mit `e` aus,
      // nicht linear mit dem Scroll.
      ballRef.current.setAttribute(
        "transform",
        `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(e * 200).toFixed(1)} ${BALL_R} ${BALL_R})`,
      );
      // Nur die ersten 12 % ausblenden — der Ball soll in Bewegung erscheinen,
      // nicht als Punkt aufpoppen und dann losfliegen.
      ballRef.current.style.opacity = klemm(f / 0.12, 0, 1).toFixed(3);
    };

    const anstossen = () => {
      if (tickRef.current) return;
      tickRef.current = true;
      requestAnimationFrame(setzen);
    };
    const neu = () => {
      vermessen();
      anstossen();
    };

    vermessen();
    setzen();

    if (ruhig) {
      // Ohne Bewegung liegt der Ball an der Taste. Das ist kein Notbehelf:
      // Ein Ball, der an einer Schaltfläche liegt, sagt vollständig, was der
      // Pass sagt — hier ist der Ball, hier übernimmst du. Nur eben als Bild
      // statt als Vorgang.
      window.addEventListener("resize", neu);
      return () => window.removeEventListener("resize", neu);
    }

    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", neu);
    const beobachter = new ResizeObserver(neu);
    beobachter.observe(bezug);
    return () => {
      window.removeEventListener("scroll", anstossen);
      window.removeEventListener("resize", neu);
      beobachter.disconnect();
    };
  }, []);

  return (
    <svg
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      style={{ visibility: "hidden" }}
      fill="none"
    >
      <g
        ref={ballRef}
        data-pass-ball
        style={{ opacity: 0 }}
        className="will-change-transform"
      >
        <BallPfade />
      </g>
    </svg>
  );
}
