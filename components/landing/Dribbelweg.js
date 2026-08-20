"use client";

import { useEffect, useRef } from "react";
import { BallPfade, BALL_PX, BALL_R, rollwinkel } from "@/components/landing/DribbelBall";

// ══ DER DRIBBELWEG ══════════════════════════════════════════════════════════
//
// Auftrag Patrick, 21.08.2026: „beim runterscrollen … mit dem orangenen Ball
// an den Funktionen vorbeidribbeln", präzisiert im Nachtrag: „zwischen dem
// Text und der Grafik ist doch perfekt platz für einen minimalistischen
// Dribbler". Ersetzt `FeatureProgressRail.js` (Punkte-Leiste am rechten Rand
// + Korb-Endmarke in Schrägansicht).
//
// ══ DIE REGEL, DIE ALLES ANDERE ENTSCHEIDET ═════════════════════════════════
//
// Der Ball läuft WEDER VOR NOCH HINTER dem Text. Er läuft in einer Spur,
// die das Layout selbst frei hält.
//
// Das ist keine Formulierungsfrage, es ist die Trennlinie zwischen dieser
// Fassung und dem Apparat, den die Vorgängerin gekostet hat (CLAUDE.md
// Roadmap 20 bis 20h: Kastenbau, Lückensuche, Verankerung, Konturkanal,
// Abdunkelung — acht Punkte, jeder mindestens eine Gate-Runde). Dort SUCHTE
// der Ball zur Laufzeit eine freie Stelle, und die Suche hing an gemessenen
// Textkästen: an Zeilenumbrüchen, an der Breite eines Etiketts, an der Frage,
// ob jemand angemeldet ist. Jede dieser Größen ändert sich, ohne dass jemand
// den Ball anfasst.
//
// Hier gibt es nichts zu suchen. Die Feature-Zeilen wechseln die Seiten
// (01 Text links / Karte rechts, 02 umgekehrt); dazwischen steht ein Kanal,
// den das Flex-Layout erzeugt und den kein Inhalt betreten kann.
//
// ⚠️ NACHGEMESSEN, NICHT ANGENOMMEN (21.08.2026, `tmp/vivien-kanal/messen.mjs`,
// gezeichnete Flächen statt Kästen, alle sechs Zeilen):
//     768–860 px : 107 px schmalste Stelle
//     900–1024   : 116–153 px
//     1180–2560  : 227–229 px  (ab 1184 friert `max-w-6xl` das Layout ein,
//                               danach ändert sich nur noch die Fenstermitte)
// Der Ball ist 20 px breit. Selbst an der schmalsten gemessenen Stelle bleiben
// ihm 43 px Luft auf JEDER Seite. Der alte Apparat hat um 2,65 px gestritten.
//
// ── Und was passiert, wenn der Kanal doch einmal zu schmal wird? ───────────
// Dann wird der Weg NICHT GEZEICHNET (`KANAL_MIN`). Kein Ausweichen, kein
// Zusammenrücken, keine Verhandlung pro Bild — eine Layout-Frage mit einer
// binären Antwort, einmal je Fenstergröße gestellt. Das ist der eigentliche
// Grund, warum diese Fassung billig bleibt und billig BLEIBT: Der teuerste
// Fall ist „nichts zeichnen", nicht „anders zeichnen".
//
// ══ WARUM `offsetLeft` UND NICHT `getBoundingClientRect()` ═════════════════
// ⚠️ Die beiden Spalten jeder Zeile sind `<Reveal>`-Elemente. Reveal blendet
// mit `translate-x-6` ein — ein laufender Transform. `getBoundingClientRect()`
// liefert die TRANSFORMIERTE Lage: Wer währenddessen misst, bekommt eine um
// bis zu 24 px verschobene Spaltenkante und legt den Kanal daneben.
// `offsetLeft`/`offsetTop` kennen Transforms nicht — sie geben die Lage im
// Layout. Genau die ist gemeint.
// Bezugspunkt ist der `max-w-6xl`-Kasten (er trägt dafür `relative`); die
// Zeilen, die Spalten und diese Zeichnung teilen sich damit EIN
// Koordinatensystem, und es gibt nichts umzurechnen.
//
// ══ WIE DER BALL AN DEN SCROLL GEKOPPELT IST ════════════════════════════════
// Nicht über einen Fortschrittsanteil `t`, sondern über die LESEHÖHE: Der Ball
// steht immer auf der Höhe, auf die der Nutzer gerade schaut (Bildmitte).
// Damit ist „vorbeidribbeln" wörtlich wahr — er ist bei der Funktion, die man
// gerade liest, und nicht bei der, die ein Prozentwert ausrechnet.
// Nebenwirkung, die viel Code spart: Es gibt keine zweite Zeitachse mehr, die
// mit der ersten synchron gehalten werden müsste.

// Bildmitte als Bezug. Die haftende Navigationsleiste ist 64 px hoch; die
// wahrgenommene Mitte des freien Bildes liegt deshalb etwas tiefer als
// `innerHeight / 2`.
const NAVBAR_HOEHE = 64;

// Unter diesem Kanal wird gar nicht gezeichnet. Drei Balldurchmesser — der
// Ball soll in seiner Spur stehen, nicht sie ausfüllen.
const KANAL_MIN = 3 * BALL_PX;

// Vor der ersten und nach der letzten Station läuft der Weg noch ein Stück
// weiter, damit der Ball nicht aus dem Nichts einsetzt und nicht im Nichts
// endet. Halbe Zeilenlücke (`space-y-24` = 96 px).
const VORLAUF = 48;

const klemm = (v, min, max) => Math.min(max, Math.max(min, v));

// Wie weit im Kanal die Station liegt, von der TEXT-Seite aus gemessen.
// 0,5 wäre die Kanalmitte — angesehen war das auf 1440 px ein fast gerader
// Strich mit einer Andeutung von S: Der Kanal ist auf jeder Breite gleich
// breit, seine Mitte wandert also nur um ±32 px. Ein Dribbling ist das nicht.
// 0,35 zieht den Ball an die Seite, auf der gerade der Text steht — also
// dorthin, wo der Leser ohnehin hinsieht — und verdoppelt den Ausschlag auf
// ±61 px, ohne den Sicherheitsabstand anzutasten: Bei 192 px Kanal bleiben
// zwischen Ballrand und Textkante 57 px.
// ⚠️ Der Wert ist ein ANTEIL des Kanals, keine Pixelzahl. Damit schrumpft der
// Ausschlag auf schmalen Fenstern von selbst mit, statt in den Text zu laufen.
const NEIGUNG = 0.35;

// Weiche Überblendung zwischen zwei Stationen. Bewusst kein linearer Zickzack:
// Ein Ball, der die Richtung in einem Punkt bricht, sieht aus, als sei er
// abgeprallt. Ein Dribbling hat runde Richtungswechsel.
const weich = (f) => f * f * (3 - 2 * f);

// Lage eines Elements IM Bezugskasten, transform-frei.
//
// ⚠️ WARUM DAS EINE KETTE SEIN MUSS UND NICHT EIN `offsetLeft` (gebaut,
// angesehen, nachgemessen — der Weg wurde zweimal gar nicht gezeichnet, ohne
// eine einzige Fehlermeldung):
// `offsetLeft` ist relativ zum `offsetParent`, und Chrome nimmt dafür nicht
// nur POSITIONIERTE Vorfahren, sondern auch TRANSFORMIERTE. Auf dieser Strecke
// sind beide Zwischenstufen transformiert:
//   · die Zeile selbst  – `FeatureFocus` skaliert die nicht fokussierte Szene
//   · jede Spalte       – `<Reveal>` blendet mit `translate-x` ein
// Gemessen ergab das für die Grafik der ersten Zeile `offsetLeft = 128`,
// während sie im Inhaltskasten bei 640 steht. Ein Kanal aus solchen Zahlen ist
// nicht „etwas daneben", er ist bedeutungslos.
// Die Kette bleibt trotzdem der richtige Weg: Sie ist gegen Transforms
// IMMUN — anders als `getBoundingClientRect()`, das mitten in einer laufenden
// Reveal-Einblendung eine um bis zu 24 px verschobene Kante liefert.
function lageIn(el, bezug) {
  let x = 0;
  let y = 0;
  let k = el;
  while (k && k !== bezug) {
    x += k.offsetLeft;
    y += k.offsetTop;
    k = k.offsetParent;
  }
  // Kein gemeinsamer Vorfahr gefunden: lieber gar nichts zeichnen als etwas
  // an einer erfundenen Stelle.
  return k === bezug ? { x, y } : null;
}

export default function Dribbelweg({ labels = [] }) {
  const wrapRef = useRef(null); // Desktop-Zeichnung (absolut im max-w-6xl)
  const spurRef = useRef(null);
  const routeRef = useRef(null); // blasse Vorschau des ganzen Weges
  const ballRef = useRef(null);
  const punkteRef = useRef([]);
  const geoRef = useRef(null);

  // Mobiler Streifen
  const balkenRef = useRef(null);
  const bahnRef = useRef(null);
  const ballMobilRef = useRef(null);
  const beschriftungRef = useRef(null);
  const aktivRef = useRef(-1);

  const tickRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    // ⚠️ NICHT `parentElement`. Der umschließende <div> trägt
    // `display:contents` – er bildet keine Box, ist aber sehr wohl ein
    // DOM-Elternteil. `parentElement` liefert also ihn, nicht die
    // Bezugsfläche, und `vermessen()` fand dort keine Zeilen: Der Weg wurde
    // still gar nicht gezeichnet. Erst gebaut, angesehen, dann gefunden.
    const feld = wrap?.closest("[data-strecke]");
    const sektion = feld?.closest("section");
    if (!feld || !sektion) return;

    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Einmal je Layout: Stationen, Kanal, Weg ────────────────────────────
    const vermessen = () => {
      const zeilen = [...feld.querySelectorAll("[data-feature-zeile]")];
      if (zeilen.length === 0) {
        geoRef.current = null;
        return;
      }

      const stationen = [];
      let engster = Infinity;
      for (const zeile of zeilen) {
        const text = zeile.children[0];
        const bildSpalte = zeile.children[1];
        // Die gezeichnete Grafik, nicht ihre Spalte: Die Spalte ist `flex-1`
        // und deutlich breiter als das, was in ihr steht (`justify-center`).
        // Auf die Spaltenkante zu messen würde dem Ball Platz wegnehmen, den
        // es gibt.
        const bild = bildSpalte?.firstElementChild || bildSpalte;
        if (!text || !bild) continue;

        const tLage = lageIn(text, feld);
        const bLage = lageIn(bild, feld);
        const zLage = lageIn(zeile, feld);
        if (!tLage || !bLage || !zLage) {
          engster = 0;
          break;
        }
        const tVon = tLage.x;
        const tBis = tVon + text.offsetWidth;
        const bVon = bLage.x;
        const bBis = bVon + bild.offsetWidth;

        // ⚠️ Gestapelt (unter `md`) liegen beide Spalten übereinander und
        // ihre x-Bereiche überlappen sich vollständig. Dann gibt es keinen
        // Kanal — nicht „einen schmalen", sondern keinen. Der Vergleich muss
        // deshalb echte Trennung prüfen, nicht nur Reihenfolge.
        const textLinks = tBis <= bVon;
        const textRechts = bBis <= tVon;
        if (!textLinks && !textRechts) {
          engster = 0;
          break;
        }
        const von = textLinks ? tBis : bBis;
        const bis = textLinks ? bVon : tVon;
        engster = Math.min(engster, bis - von);
        const kanal = bis - von;
        stationen.push({
          x: textLinks ? von + kanal * NEIGUNG : bis - kanal * NEIGUNG,
          y: zLage.y + zeile.offsetHeight / 2,
        });
      }

      if (stationen.length < 2 || engster < KANAL_MIN) {
        geoRef.current = null;
        return;
      }

      const yVon = stationen[0].y - VORLAUF;
      const yBis = stationen[stationen.length - 1].y + VORLAUF;

      // x als Funktion von y — der Weg ist in y streng monoton, er schlängelt
      // nur in x. Das erlaubt, den Ball ohne `getPointAtLength` direkt auf
      // seine Lesehöhe zu setzen (und erspart die Umkehrung Länge→Höhe, die
      // nirgends exakt ist).
      const xBei = (y) => {
        if (y <= stationen[0].y) return stationen[0].x;
        const letzte = stationen[stationen.length - 1];
        if (y >= letzte.y) return letzte.x;
        for (let i = 0; i < stationen.length - 1; i += 1) {
          const a = stationen[i];
          const b = stationen[i + 1];
          if (y <= b.y) {
            const f = weich((y - a.y) / (b.y - a.y));
            return a.x + (b.x - a.x) * f;
          }
        }
        return letzte.x;
      };

      // Die Spur als abgetasteter Pfad. 10 px Schrittweite: fein genug, dass
      // die Kurve rund bleibt, grob genug, dass der Pfad nicht zum Roman wird.
      let d = `M ${xBei(yVon).toFixed(1)} ${yVon.toFixed(1)}`;
      for (let y = yVon + 10; y < yBis; y += 10) {
        d += ` L ${xBei(y).toFixed(1)} ${y.toFixed(1)}`;
      }
      d += ` L ${xBei(yBis).toFixed(1)} ${yBis.toFixed(1)}`;

      geoRef.current = { stationen, xBei, yVon, yBis };

      if (spurRef.current) spurRef.current.setAttribute("d", d);
      if (routeRef.current) routeRef.current.setAttribute("d", d);
      punkteRef.current.forEach((p, i) => {
        const s = stationen[i];
        if (!p || !s) return;
        p.setAttribute("cx", s.x.toFixed(1));
        p.setAttribute("cy", s.y.toFixed(1));
      });
      wrap.style.visibility = "visible";
    };

    // ── Jedes Bild: Ball auf die Lesehöhe ──────────────────────────────────
    const setzen = () => {
      tickRef.current = false;

      // (1) Mobiler Streifen — Fortschritt über die Sektion.
      const sRect = sektion.getBoundingClientRect();
      if (sRect.height > 0) {
        const t = klemm((NAVBAR_HOEHE - sRect.top) / sRect.height, 0, 1);
        const index = Math.min(labels.length - 1, Math.floor(t * labels.length));
        if (index !== aktivRef.current) {
          aktivRef.current = index;
          if (beschriftungRef.current) {
            beschriftungRef.current.textContent = `${index + 1} / ${labels.length} · ${labels[index]}`;
          }
        }
        if (!ruhig) {
          if (balkenRef.current) {
            balkenRef.current.style.transform = `scaleX(${t.toFixed(3)})`;
          }
          const bahnB = bahnRef.current?.offsetWidth || 0;
          if (bahnB > 0 && ballMobilRef.current) {
            const strecke = bahnB * t;
            ballMobilRef.current.style.transform =
              `translate3d(${(strecke - BALL_R).toFixed(1)}px, -50%, 0) ` +
              `rotate(${rollwinkel(strecke).toFixed(1)}deg)`;
          }
        }
      }

      // (2) Desktop-Weg
      const geo = geoRef.current;
      if (!geo || !ballRef.current) return;
      const feldOben = feld.getBoundingClientRect().top;
      // Wahrgenommene Bildmitte: der freie Bereich unter der Leiste.
      const lesehoehe = NAVBAR_HOEHE + (window.innerHeight - NAVBAR_HOEHE) / 2;
      const yRoh = lesehoehe - feldOben;
      const y = klemm(yRoh, geo.yVon, geo.yBis);
      const x = geo.xBei(y);

      ballRef.current.setAttribute(
        "transform",
        `translate(${(x - BALL_R).toFixed(1)} ${(y - BALL_R).toFixed(1)}) ` +
          `rotate(${rollwinkel(y - geo.yVon).toFixed(1)} ${BALL_R} ${BALL_R})`,
      );

      // Ein- und Ausblenden am Rand der Strecke. Ohne das setzt der Ball an
      // der Klemmgrenze auf und bleibt dort kleben, während die Seite
      // weiterläuft — genau das Bild („Ball klebt, Anzeige läuft weiter"),
      // das an der Vorgängerin als Darstellungsfehler gemeldet wurde.
      const rand = 90;
      const ein = klemm((yRoh - (geo.yVon - rand)) / rand, 0, 1);
      const aus = klemm((geo.yBis + rand - yRoh) / rand, 0, 1);
      ballRef.current.style.opacity = Math.min(ein, aus).toFixed(3);

      const anteil = (y - geo.yVon) / (geo.yBis - geo.yVon);
      if (spurRef.current) {
        spurRef.current.style.strokeDashoffset = String(1 - anteil);
      }
      punkteRef.current.forEach((p, i) => {
        const s = geo.stationen[i];
        if (!p || !s) return;
        p.style.opacity = y >= s.y ? "1" : "0.35";
      });
    };

    const anstossen = () => {
      if (tickRef.current) return;
      tickRef.current = true;
      requestAnimationFrame(setzen);
    };

    const neuVermessen = () => {
      vermessen();
      anstossen();
    };

    vermessen();
    setzen();

    // ⚠️ Bei reduzierter Bewegung wird NICHT gescrollt-mitgerechnet, aber der
    // Weg wird trotzdem vollständig gezeichnet und der Ball an sein Ende
    // gesetzt: Ein Standbild, das den ganzen Weg zeigt und den Ball dort, wo
    // er ankommt. Ein leerer Weg wäre eine Zeichnung ohne Aussage.
    if (ruhig) {
      const geo = geoRef.current;
      if (geo && ballRef.current) {
        const y = geo.yBis;
        ballRef.current.setAttribute(
          "transform",
          `translate(${(geo.xBei(y) - BALL_R).toFixed(1)} ${(y - BALL_R).toFixed(1)})`,
        );
        ballRef.current.style.opacity = "1";
        if (spurRef.current) spurRef.current.style.strokeDashoffset = "0";
        punkteRef.current.forEach((p) => p && (p.style.opacity = "1"));
      }
      if (balkenRef.current) balkenRef.current.style.transform = "scaleX(1)";
      if (bahnRef.current && ballMobilRef.current) {
        const b = bahnRef.current.offsetWidth || 0;
        ballMobilRef.current.style.transform = `translate3d(${(b - BALL_R).toFixed(1)}px, -50%, 0)`;
      }
      window.addEventListener("resize", neuVermessen);
      return () => window.removeEventListener("resize", neuVermessen);
    }

    window.addEventListener("scroll", anstossen, { passive: true });
    window.addEventListener("resize", neuVermessen);

    // Die Bilder der Feature-Karten und die Schriften können nach dem ersten
    // Messen noch Höhen verändern. `ResizeObserver` fängt das, ohne dass ein
    // Zeitwert geraten werden muss (Fehlerklasse „feste Wartezeit statt auf
    // den Zustand warten", CLAUDE.md).
    const beobachter = new ResizeObserver(neuVermessen);
    beobachter.observe(feld);

    return () => {
      window.removeEventListener("scroll", anstossen);
      window.removeEventListener("resize", neuVermessen);
      beobachter.disconnect();
    };
  }, [labels]);

  return (
    <div aria-hidden="true" style={{ display: "contents" }}>
      {/* ══ MOBIL (< md): der Streifen bleibt ═════════════════════════════
          Ehrlich benannt: Patricks Bild — der Ball dribbelt zwischen Text und
          Grafik hinunter — ist ein DESKTOP-Bild. Unter 768 px stapeln sich
          Text und Karte, die Textspalte nimmt rund 87 % der Breite; es gibt
          dort keinen freien Kanal, und einen zu schaffen hieße, dem
          schmalsten Gerät Textbreite wegzunehmen. Bei 360 px stünden dann
          rund 37 Zeichen in der Zeile — unter jedem vernünftigen Maß.
          Deshalb trägt mobil derselbe Ball dieselbe Strecke, nur waagerecht.
          ⚠️ DIE KORB-ENDMARKE IST HIER ENTFALLEN. Sie war 28x20 px in
          Schrägansicht, während Hero und Abschluss den Korb von oben zeigen —
          zwei Projektionen einer Sache auf einer Seite. Und sie war der
          DRITTE Korb: Die Seite hat jetzt genau zwei, im Hero und im
          Abschluss, als Anfang und Ende. Ein Korb dazwischen macht aus einem
          Motiv einen Tick. */}
      <div
        data-strecke-streifen
        className="sticky top-16 z-20 -mx-4 mb-10 bg-navy-950/90 px-4 pb-2 pt-2 backdrop-blur-sm md:hidden"
      >
        <p
          ref={beschriftungRef}
          className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-mist-400"
        >
          {`1 / ${labels.length} · ${labels[0] || ""}`}
        </p>
        <div ref={bahnRef} className="relative h-px w-full">
          <div className="absolute inset-0 overflow-hidden bg-navy-600">
            <div
              ref={balkenRef}
              className="h-full w-full origin-left bg-brand-500"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <svg
            ref={ballMobilRef}
            data-strecke-ball-mobil
            width={BALL_PX}
            height={BALL_PX}
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-0 top-1/2 will-change-transform"
            style={{ transformOrigin: `${BALL_R}px ${BALL_R}px` }}
          >
            <BallPfade />
          </svg>
        </div>
      </div>

      {/* ══ AB md: der Weg im Mittelkanal ════════════════════════════════
          `visibility: hidden` bis zur ersten Messung — sonst stünde für einen
          Sekundenbruchteil ein Ball bei (0,0), also in der Ecke des
          Inhaltskastens. Kein `opacity`, weil das den Ball auch dann
          einblenden würde, wenn `vermessen()` gar keinen Kanal gefunden hat. */}
      <svg
        ref={wrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible md:block"
        style={{ visibility: "hidden" }}
        fill="none"
      >
        {/* Die Spur. Durchgezogen, nicht gestrichelt: Ein Laufweg ist auf der
            Taktiktafel eine durchgezogene Linie (gestrichelt = Pass, geschlängelt
            = Dribbling mit Ball). Die Schlängelung liefert hier schon die Bahn
            selbst — sie zweimal zu behaupten wäre doppelt gemoppelt.
            `pathLength="1"` normiert die Länge, damit der Aufdeck-Anteil ohne
            Layout-Zugriff pro Bild gesetzt werden kann. */}
        {/* Die Route, bevor der Ball sie gelaufen ist. Sehr leise, aber da.
            ⚠️ Das ist kein Schmuck, sondern die Aufgabe, die vorher die sechs
            Punkte am rechten Rand hatten: zeigen, wohin die Strecke führt.
            Ein Weg, der erst hinter dem Ball entsteht, sagt nur, wo man war.
            Eine Orientierung, die man erst hat, wenn man angekommen ist, ist
            keine. */}
        <path
          ref={routeRef}
          d=""
          stroke="#3D5080"
          strokeOpacity="0.55"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          ref={spurRef}
          data-dribbelweg-spur
          d=""
          pathLength="1"
          strokeDasharray="1"
          style={{ strokeDashoffset: 1 }}
          stroke="#F07A27"
          strokeOpacity="0.38"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Aufsetzpunkte — je Funktion einer. Sie ersetzen die sechs Punkte
            der alten Leiste und leisten dasselbe (wo bin ich, wie viel kommt
            noch), nur am richtigen Ort: auf der Strecke statt daneben. */}
        {labels.map((label, i) => (
          <circle
            key={label}
            ref={(el) => {
              punkteRef.current[i] = el;
            }}
            r="2.5"
            fill="#F07A27"
            style={{ opacity: 0.35, transition: "opacity 240ms ease-out" }}
            className="motion-reduce:transition-none"
          />
        ))}
        <g ref={ballRef} data-dribbelweg-ball style={{ opacity: 0 }} className="will-change-transform">
          <BallPfade />
        </g>
      </svg>
    </div>
  );
}
