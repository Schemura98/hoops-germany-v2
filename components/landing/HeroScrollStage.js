"use client";

import { useEffect, useRef, useState } from "react";
import HeroDunk, {
  ABSCHLUSS_MS,
  EBENE,
  RING_HEBUNG,
} from "@/components/landing/HeroDunk";

// ══ HERO-BÜHNE „DER ABSCHLUSS" ══════════════════════════════════════════════
//
// Spezifikation: docs/HERO-DUNK-KONZEPT-2026-08-19.md (Vivien, 19.08.2026).
// Die Zeichnung selbst und ihre Choreografie stehen in HeroDunk.js; hier steht
// nur, WANN etwas passiert.
//
// ⚠️ WAS AM 19.08.2026 ERSATZLOS ENTFALLEN IST — und warum das die eigentliche
// Nachricht dieses Umbaus ist:
// Die Datei hatte rund 1.350 Zeilen. Fast alles davon existierte, weil der alte
// Hero-Ball eine DECKENDE SCHEIBE war, die keinen Buchstaben berühren durfte.
// Entfallen sind deshalb:
//   · `kaestenBauen()` samt TreeWalker, `Range.getClientRects()` und der
//     Unterscheidung „Fläche oder Tinte"
//   · `ballDeckkraftUeberKaesten()`, `TEXT_FADE_MARGIN`, `TEXT_DIM_FLOOR`
//   · die Lückensuche (`belegt`, `tauglich`, `gewaehlt`, `sichtMitte`)
//   · die mobile Verankerung: `[data-hero-eyebrow]`, `konturKanal()`,
//     `MIN_KONTURKANAL`, `MOBIL_D_MIN/MAX`, `MIN_SENKRECHT`, die Auffangregel
//   · der `MutationObserver` auf den Anmelde-Wechsel, `kaestenFinalisieren()`,
//     `stehtStill()`, `AUFGEBEN_MS`, `korrekturLaeuftRef`, `KORREKTUR_MS`
//   · der mobile Einflug samt `einflugAktivRef`, `eingeflogenRef`, `EINFLUG_MS`
//   · die Übergabe an die Fortschritts-Leiste (`HANDOFF_START`, `gibtLeiste`,
//     `auszug`, `abrollweg`)
//   · beide `console.error`-Diagnosen
// Die Roadmap-Punkte 20, 20b, 20c, 20d, 20e, 20f, 20g und 20h drehen sich
// ausnahmslos um Fragen, die eine Linie nicht stellt. Acht Punkte, jeder
// mindestens eine Gate-Runde.
//
// ⚠️ EINE WARNUNG FÜR DEN, DER HIER WIEDER ETWAS ANBAUT: Diese Mechanik ist
// nicht deshalb weg, weil sie schlecht war — sie war für ihren Gegenstand
// richtig. Sie ist weg, weil der Gegenstand weg ist. Wer wieder eine gefüllte,
// deckende Form in diese Bühne setzt, braucht sie wieder, und zwar vollständig.
//
// Bewusste Randbedingungen, unverändert aus dem alten Konzept:
// - KEIN Pinning, KEINE zusätzliche Scrollstrecke. Die Bühnenhöhe bleibt exakt
//   `calc(100vh - 4rem)`. Auf dem Handy soll niemand erst durch einen „Trailer"
//   scrollen, bevor die Schaltfläche erreichbar ist.
// - Nur `stroke-dashoffset`, `stroke-opacity` und `transform`; ein
//   Scroll-Listener, ein rAF-Tick, direkte Stilmutation statt React-Re-Render.
// - `prefers-reduced-motion`: gewähltes Einzelbild (Scheitelpunkt), s. HeroDunk.js.

const NAVBAR_HEIGHT = 64; // h-16 der sticky Navbar
const PROGRESS_SPAN = 0.45; // Anteil der Bühnenhöhe, über den t von 0 auf 1 läuft

// Die Zeichnung ist deutlich früher fertig als die Bühne durchgelaufen ist –
// sonst fände der Abschluss statt, wenn der Hero schon oben aus dem Bild ist.
// ⚠️ NICHT NEU ERFUNDEN: Das ist exakt die alte `BALL_SPAN`, aus demselben
// Grund. Die Ankunft muss stattfinden, solange die Bühne noch im Bild ist.
const DUNK_SPAN = 0.75;

// ⚠️ WIRFT bei invertierten Grenzen, statt still `max` zu liefern (Fehlerklasse
// Kai, CLAUDE.md Roadmap 15 (5): eine Hilfsfunktion soll WERFEN statt still
// etwas Falsches zu liefern). Übernommen aus der alten Fassung, weil die
// Begründung mit dem Ball nicht verschwunden ist.
const clamp = (v, min, max) => {
  if (min > max) {
    throw new RangeError(
      `clamp: untere Grenze ${min} liegt über der oberen ${max} – ` +
        `das Ergebnis wäre stillschweigend falsch statt erkennbar kaputt.`,
    );
  }
  return Math.min(max, Math.max(min, v));
};

// Anteil innerhalb eines Zeitfensters, geklemmt auf [0,1].
const fenster = (x, von, bis) =>
  bis <= von ? (x >= bis ? 1 : 0) : clamp((x - von) / (bis - von), 0, 1);

export default function HeroScrollStage({ className = "", children }) {
  const stageRef = useRef(null);
  // Einmal beim Aufsetzen eingesammelt statt pro Frame abgefragt:
  // `querySelectorAll` in der rAF-Schleife wäre ein Baumzugriff je Bild.
  const pfadeRef = useRef([]);
  const ringeRef = useRef([]);
  const netzeRef = useRef([]);
  const baelleRef = useRef([]);
  const tickingRef = useRef(false);
  // ⚠️ EINMAL AUSGELÖST, BLEIBT ES STEHEN. Wer zurückscrollt, sieht die fertige
  // Zeichnung mit dem Ball im Netz – nicht das Rückwärtsabspielen. Ein Spielzug,
  // der stattgefunden hat, hat stattgefunden. Das erspart uns den unheimlichsten
  // aller Zustände: den rückwärts laufenden Dunk.
  const abgeschlossenRef = useRef(false);

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

    // ⚠️ JEDE PFADLÄNGE EINMAL MESSEN — WARUM DAS SEIN MUSS, STEHT IN
    // HeroDunk.js über `Zeichenpfad`. Kurzfassung: `pathLength="1"` wird
    // zusammen mit `vector-effect: non-scaling-stroke` ignoriert, und die
    // Folge ist eine dauerhafte Punktlinie statt einer unsichtbaren Linie.
    // Ein `getTotalLength()` je Pfad beim Aufsetzen, keines je Bild.
    // ⚠️ Es funktioniert auch an der per `display:none` ausgeblendeten Fassung
    // (nachgemessen im Browser) – `getTotalLength()` ist Geometrie, kein Layout.
    pfadeRef.current = Array.from(
      stage.querySelectorAll("[data-dunk-path]"),
    ).map((el) => {
      const laenge = el.getTotalLength();
      // ⚠️ ZWEI WERTE, UND DIE LÜCKE IST 2 px LÄNGER ALS DER PFAD.
      // Mit einem einzigen Wert (`dasharray: L`) grenzen „gezeichnet" und
      // „nicht gezeichnet" exakt aneinander — und der kleinste Rundungsrest
      // lässt einen Bruchteil des Strichs stehen. Mit `stroke-linecap: round`
      // wird daraus kein unsichtbarer Splitter, sondern ein **voller Punkt** in
      // Strichbreite. Genau das stand im ersten Bild über der Taste, wo der
      // Ball noch gar nicht gezeichnet sein durfte.
      // Die 2 px Spielraum machen die Rechnung gegen Rundungsstaub immun,
      // statt sich auf exakte Gleitkommazahlen zu verlassen.
      el.style.strokeDasharray = `${laenge}px ${laenge + 2}px`;
      return {
        el,
        laenge,
        von: parseFloat(el.dataset.from),
        bis: parseFloat(el.dataset.to),
      };
    });
    ringeRef.current = Array.from(stage.querySelectorAll("[data-dunk-ring]"));
    netzeRef.current = Array.from(
      stage.querySelectorAll("[data-dunk-netz]"),
    ).map((el) => ({ el, origin: parseFloat(el.dataset.origin) }));
    baelleRef.current = Array.from(
      stage.querySelectorAll("[data-dunk-ball]"),
    ).map((el) => ({ el, fall: parseFloat(el.dataset.fall) }));

    // ── Zeichnen: hängt am Scroll, ist vollständig umkehrbar ────────────────
    const zeichnen = (td) => {
      for (const { el, laenge, von, bis } of pfadeRef.current) {
        // ⚠️ NICHT RUNDEN. `toFixed(2)` hat hier 188,522 zu 188,52 gemacht –
        // 0,002 px Strich blieben stehen, und mit runder Strichkappe wurde
        // daraus ein voller Punkt von 3 px über der Taste.
        el.style.strokeDashoffset = `${laenge * (1 - fenster(td, von, bis))}px`;
      }
      const h = fenster(td, RING_HEBUNG[0], RING_HEBUNG[1]);
      const o = EBENE.ringRuhe + (EBENE.abschluss - EBENE.ringRuhe) * h;
      for (const el of ringeRef.current) el.style.strokeOpacity = o.toFixed(3);
    };

    // ── Abschluss: hängt an der Zeit, nicht am Scroll ───────────────────────
    //
    // ⚠️ ER RECHNET IN viewBox-EINHEITEN, NICHT IN BILDSCHIRMPIXELN.
    // Die Fallstrecke steht als `data-fall` an der Ballgruppe und ist eine
    // Eigenschaft der ZEICHNUNG. Damit ist eine Fenstergrößenänderung während
    // des Abschlusses ein Nicht-Ereignis – im Gegensatz zum alten mobilen
    // Einflug, der `zielY` beim Start einfror und deshalb einen nachgeholten
    // Aufruf brauchte (Befund Kai, sechste Runde).
    const abschlussSetzen = (p) => {
      // Fall: beschleunigend (easeInQuad) über die ersten 43 % der Zeit,
      // danach ein kleiner Nachschwinger im Netz.
      for (const { el, fall } of baelleRef.current) {
        let dy;
        if (p <= 0.43) {
          const q = p / 0.43;
          dy = fall * q * q;
        } else {
          const q = (p - 0.43) / 0.57;
          dy = fall + Math.sin(q * Math.PI) * fall * 0.045 * (1 - q);
        }
        el.setAttribute("transform", `translate(0 ${dy.toFixed(2)})`);
      }
      // Netz: beult aus und schnappt zurück, gestaucht um die RINGEBENE.
      // ⚠️ ABWEICHUNG VOM KONZEPT, bewusst: Dort standen drei Phasen mit
      // eigenen Dauern (ausbeulen 140 ms · zurückschnappen 180 ms · nachschwingen
      // 100 ms). Das sind drei Konstanten, die zusammen 420 ms ergeben MÜSSEN
      // und beim nächsten Anfassen auseinanderlaufen. Eine gedämpfte Kurve
      // liefert dieselben drei lesbaren Phasen aus EINER Formel und endet
      // per Konstruktion exakt bei 1 – auch wenn jemand ABSCHLUSS_MS ändert.
      const q = fenster(p, 0.33, 1);
      const s = 1 + 0.16 * Math.sin(q * Math.PI * 1.5) * Math.pow(1 - q, 1.6);
      for (const { el, origin } of netzeRef.current) {
        el.setAttribute(
          "transform",
          `matrix(1,0,0,${s.toFixed(4)},0,${(origin * (1 - s)).toFixed(2)})`,
        );
      }
    };

    let abschlussRaf = 0;
    const abschlussStarten = () => {
      abgeschlossenRef.current = true;
      zeichnen(1); // die Zeichnung steht fertig, bevor der Ball fällt
      for (const el of ringeRef.current) el.classList.add("hero-dunk-blitz");
      const beginn = performance.now();
      const schritt = () => {
        const p = Math.min(1, (performance.now() - beginn) / ABSCHLUSS_MS);
        abschlussSetzen(p);
        if (p < 1) abschlussRaf = requestAnimationFrame(schritt);
        else {
          abschlussRaf = 0;
          for (const el of ringeRef.current)
            el.classList.remove("hero-dunk-blitz");
        }
      };
      abschlussRaf = requestAnimationFrame(schritt);
    };

    let erster = true;
    const apply = () => {
      tickingRef.current = false;
      // ⚠️ EIN Layout-Zugriff je Bild, und zwar dieser. Danach nur noch
      // Stilschreibvorgänge – keine `getClientRects()`, kein `offsetWidth`.
      const rect = stage.getBoundingClientRect();
      if (rect.height <= 0) return;
      // Nach dem Abschluss wird nichts mehr geschrieben: Die Zeichnung ist
      // fertig und bleibt es.
      if (abgeschlossenRef.current) return;

      const t = clamp(
        (NAVBAR_HEIGHT - rect.top) / (rect.height * PROGRESS_SPAN),
        0,
        1,
      );
      const td = clamp(t / DUNK_SPAN, 0, 1);

      if (td >= 1) {
        // Seite lädt bereits gescrollt (Zurück-Navigation, Sprungmarke):
        // Endzustand direkt, ohne Animation. Präzedenz: der alte mobile Einflug
        // stieg mit `if (window.scrollY > 0) return` aus. Eine Bewegung in eine
        // Seite hinein, die der Leser schon verlassen hat, hat keinen Anlass.
        if (erster) {
          erster = false;
          abgeschlossenRef.current = true;
          zeichnen(1);
          abschlussSetzen(1);
          return;
        }
        erster = false;
        abschlussStarten();
        return;
      }
      erster = false;
      zeichnen(td);
    };

    let raf = 0;
    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    // Nach dem Laden von Schrift/Bild einmal nachmessen.
    // ⚠️ Über `onScrollOrResize`, NICHT direkt über `apply` (Befund Kai B7):
    // `apply` setzt `tickingRef` auf false. Feuert `load`, während bereits ein
    // Frame geplant ist, wird die Sperre gelöst, ohne den Frame zu stornieren.
    window.addEventListener("load", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (abschlussRaf) cancelAnimationFrame(abschlussRaf);
      tickingRef.current = false;
      // ⚠️ ZURÜCKSETZEN UND DIE INLINE-STILE ABRÄUMEN. Nach einem
      // `prefers-reduced-motion`-Wechsel baut React den Effekt neu auf und
      // rendert das Standbild – aber React schreibt ATTRIBUTE, und ein
      // Inline-Stil schlägt jedes Attribut. Ohne dieses Abräumen bliebe die
      // halb gezeichnete Fassung stehen, obwohl das Markup das fertige Bild
      // sagt. Dieselbe Klasse wie `eingeflogenRef` in der alten Fassung
      // (Kais Mutation M9), nur eine Ebene tiefer.
      abgeschlossenRef.current = false;
      for (const { el } of pfadeRef.current) {
        el.style.strokeDashoffset = "";
        el.style.strokeDasharray = "";
      }
      for (const el of ringeRef.current) {
        el.style.strokeOpacity = "";
        el.classList.remove("hero-dunk-blitz");
      }
      for (const { el } of netzeRef.current) el.removeAttribute("transform");
      for (const { el } of baelleRef.current) el.removeAttribute("transform");
      window.removeEventListener("load", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [animated]);

  return (
    <div
      ref={stageRef}
      // Marker für die Prüfung (tests/e2e/hero-dunk.spec.mjs). Er ersetzt das
      // frühere Vorgehen, die Bühne über ihre Klassenkette zu suchen – eine
      // Klassenänderung hätte den Test still blind gemacht.
      data-hero-stage
      className={`relative flex items-center justify-center overflow-hidden bg-navy-950 text-paper-50 ${className}`}
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <HeroDunk gezeichnet={!animated} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        {children}
      </div>
    </div>
  );
}
