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
// ══ ⚠️ ES GIBT ZWEI KANÄLE, UND HIER STAND DER FALSCHE (21.08.2026) ════════
//
// Hier stand: „768–860 px: 107 px schmalste Stelle … dem 20-px-Ball bleiben an
// der engsten Stelle 43 px Luft auf JEDER Seite." Beide Gate-Prüfer haben
// nachgemessen und sind auf verschiedene Zahlen gekommen — Kai auf 107, Tobias
// auf 64. Beide hatten recht, weil sie VERSCHIEDENE GRÖSSEN gemessen haben:
//
//   Kanal (gezeichnet) — von der gezeichneten Textkante zur Grafik.
//                        Auf 768–860 px: 107 px. Kai hat das gemessen.
//   Kanal (Layout)     — von der SPALTENKANTE zur Grafik.
//                        Auf 768–860 px: 64 px. Tobias hat das gemessen.
//                        ⚠️ UND NUR DIESE GRÖSSE BENUTZT DER CODE UNTEN.
//
// Die Differenz ist der ausgefranste rechte Rand der Textspalte: Die Zeilen
// enden im Mittel 43 px vor der Spaltenkante. Der Code misst `offsetWidth` der
// Spalte, nicht die Zeilen — bewusst, denn Zeilenlängen ändern sich mit jedem
// Umbruch, und genau daran hing der Apparat aus Roadmap 20–20h.
//
// ⚠️ Der Fehler war nicht die Messung, sondern die ABLEITUNG — und er ist ein
// Musterfall für `docs/MUSTER-ZAHLEN-DIE-LUEGEN`: eine richtig gemessene Zahl,
// aus der eine falsche Folgerung gezogen wird. Zwei Schritte gingen schief:
//   1. Die 107 (gezeichnet) wurde auf eine Geometrie angewandt, die mit 64
//      (Layout) rechnet.
//   2. „43 px auf JEDER Seite" unterstellt einen mittig laufenden Ball. Der
//      Ball läuft aber bei `NEIGUNG` = 0,35 des Kanals, also ABSICHTLICH
//      außermittig, zur Textseite hin.
// Der wahre Wert war 12,85 px — nicht 43.
//
// ⚠️ Was den Fehler unsichtbar gemacht hat, ist ein Zahlenzufall: 107 − 64 = 43
// (der Ausfransungs-Rest) und (107 − 20) / 2 = 43,5 (die falsche Ableitung).
// Zwei verschiedene 43. Wer die Zeile las, fand sie bestätigt.
//
// ── Und Tobias' 9,6 px? Auch richtig, und auch eine andere Größe. ──────────
// Der Ball ist ein gedrehtes `<g>`. `getBoundingClientRect()` liefert davon die
// achsparallele HÜLLBOX des gedrehten Inhalts — gemessen bis 25,45 px breit,
// während der Ball 20 px hat. Wer `bbox.width / 2` als Radius nimmt, misst
// 3,2 px zu wenig Luft: 12,85 − 3,2 = 9,65. Das ist Roadmap 20d (b) im neuen
// Kostüm — Hüllkörper statt Kontur.
//
// ══ DER STAND NACH DER KORREKTUR ═══════════════════════════════════════════
// Der Flex-Abstand ist von `md:gap-16` auf `md:gap-20` gegangen (Entscheidung
// Vivien, 21.08.2026). ⚠️ WICHTIG FÜR JEDEN, DER DAS LAYOUT ANFASST: Solange
// die Grafik ihre Spalte ausfüllt, IST der Kanal genau dieser Abstand — wer
// `md:gap-*` in `LandingFeatures.js` ändert, ändert den Kanal.
// Nachgemessen (`tmp/vivien-nach/kontur-messen.mjs`, Kontur gegen gezeichnete
// Fläche, 81 Scrollpunkte je Breite):
//     768 / 800 / 860 px : Kanal 80  → 18,57 px Luft   (vorher 64 → 12,85)
//     900                : Kanal 85  → 20,26 px
//     1024               : Kanal 120 → 32,28 px
//     1280 / 1440 / 1920 : Kanal 200 → 59,79 px
// Der alte Apparat hat um 2,65 px gestritten.
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


// Vor der ersten und nach der letzten Station läuft der Weg noch ein Stück
// weiter, damit der Ball nicht aus dem Nichts einsetzt und nicht im Nichts
// endet. Halbe Zeilenlücke (`space-y-24` = 96 px).
const VORLAUF = 48;

const klemm = (v, min, max) => Math.min(max, Math.max(min, v));

// Wie weit im Kanal die Station liegt, von der TEXT-Seite aus gemessen.
// 0,35 zieht den Ball an die Seite, auf der gerade der Text steht — also
// dorthin, wo der Leser ohnehin hinsieht.
// ⚠️ Der Wert ist ein ANTEIL des Kanals, keine Pixelzahl. Damit schrumpft der
// Abstand zum Text auf schmalen Fenstern nicht ins Negative, sondern mit.
//
// ⚠️ WAS HIER STAND, WAR EINE ZAHL ZU VIEL UND EINE EINHEIT DANEBEN
// (21.08.2026): „verdoppelt den Ausschlag auf ±61 px". Nachgemessen ist der
// Ausschlag Spitze-zu-Spitze und breitenabhängig, und die 61 war die halbe
// Wahrheit in doppelter Bedeutung — sie meinte den ganzen Ausschlag, nicht die
// Auslenkung nach jeder Seite.
//
// Gemessen (`tmp/vivien-nach/ausschlag.mjs`, Ballmitte über den ganzen Weg):
//     768 px  : 24 px Spitze-zu-Spitze  (±12)
//     900 px  : 20 px                   (±10)
//    1024 px  : 12 px                   (±6)   ← praktisch eine Gerade
//    1440 px  : 116 px                  (±58)
//
// ⚠️ UND DAS IST NICHT MONOTON — das ist der eigentliche Befund. Der Ausschlag
// setzt sich aus ZWEI Beträgen zusammen, die gegeneinander laufen:
//   1. Die Auslenkung IM Kanal: 0,3 · Kanalbreite (Station bei 0,35 bzw. bei
//      0,65, je nachdem, auf welcher Seite der Text steht). Wächst mit der
//      Breite.
//   2. Die Verschiebung DES Kanals: Sobald `max-w-md` der Textspalte greift
//      (ab rund 1000 px), ist die Zeile nicht mehr symmetrisch — die gespiegelte
//      Zeile schiebt den ganzen Kanal zur anderen Seite. Wirkt der ersten
//      entgegen.
// Bei rund 1024 px heben sich beide fast auf. Nur (1) ist eine Stellschraube,
// (2) fällt aus dem Layout an — dieselbe Unterscheidung, an der sich Roadmap
// 20b schon einmal aufgehängt hat („eine Stellschraube und ein Restbetrag als
// dieselbe Größe behandeln"). Wer den Ausschlag bei 1024 vergrößern will, muss
// `NEIGUNG` senken und dafür Luft zum Text bezahlen — bei 0,25 wären es auf
// 768 px genau die 10 px Untergrenze, also kein Spielraum mehr.
// Bewusst so gelassen: Ein gerader Strich auf einer Breite ist eine schwächere
// Aussage, ein Ball an der Textkante wäre ein Defekt.
const NEIGUNG = 0.35;

// ⚠️ Hier stand `KANAL_MIN = 3 * BALL_PX` (60 px) mit der Begründung „der Ball
// soll in seiner Spur stehen, nicht sie ausfüllen". Die Zahl war gegriffen, und
// sie hat gegen die falsche Größe geprüft:
//   · Kai las den Kommentar (107 px Kanal) und schloss, die Regel könne auf
//     KEINER Breite feuern — tote Sicherheit.
//   · Tobias maß den echten Wert (64 px) und sah 4 px Abstand zur Schwelle —
//     eine Regel mit Haarauslöser, die bei jeder Layout-Änderung den GANZEN
//     Weg stumm verschwinden lässt.
// Beide Schlüsse stimmten für die Zahl, die sie vor sich hatten.
//
// Geprüft wird jetzt die Größe, die tatsächlich klemmt: die LUFT zwischen
// Ballkontur und Textkante. Sie ist es, die den Defekt beschreibt, den die
// Regel verhindern soll — „der Ball berührt Text" —, und sie fällt nicht vom
// Himmel, sondern aus der Geometrie:
//     Luft = NEIGUNG · Kanal − Ballradius   ≥   LUFT_MIN
// nach Kanal aufgelöst ergibt sich die Schwelle von selbst. Wer `NEIGUNG`
// ändert, ändert sie mit — es gibt keine zweite Stelle nachzuziehen.
//
// ⚠️ Bindend ist immer die TEXTSEITE, weil `NEIGUNG` < 0,5 den Ball dorthin
// zieht; zur Grafik bleibt bei 0,65 · Kanal ohnehin mehr. Wer `NEIGUNG` über
// 0,5 setzt, dreht das um und muss diese Zeile mitdrehen.
//
// LUFT_MIN = 10 px ist keine neue Zahl, sondern das Prüfmaß, das für den
// Hero-Ball schon gilt (CLAUDE.md Roadmap 20d (b): „kürzester Abstand der
// KONTUREN ≥ 10 px"). Zwei Bälle auf einer Seite, ein Maß.
const LUFT_MIN = 10;
// Ballradius als KONTUR: der gezeichnete Kreis hat r = 9, die Naht trägt an den
// Polen 0,55 halbe Strichbreite auf. `BALL_R` (= 10, die halbe Kastenbreite)
// ist der konservativere Wert und wird deshalb genommen — die Schwelle feuert
// dadurch rund 1,3 px früher als nötig, nie später.
const KANAL_MIN = (LUFT_MIN + BALL_R) / NEIGUNG;

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

    // ⚠️ Bei reduzierter Bewegung wird NICHT gescrollt-mitgerechnet, aber der
    // Weg wird trotzdem vollständig gezeichnet und der Ball an sein Ende
    // gesetzt: Ein Standbild, das den ganzen Weg zeigt und den Ball dort, wo
    // er ankommt. Ein leerer Weg wäre eine Zeichnung ohne Aussage.
    //
    // ⚠️ DASS DAS EINE EIGENE FUNKTION IST, IST DER FIX ZU KAIS BEFUND B6.
    // Vorher stand dieser Block als Einmal-Zweig direkt im Effekt, und
    // `neuVermessen` rief in JEDEM Fall `anstossen()` — also die
    // Scroll-Rechnung. Folge: Bei reduzierter Bewegung sprang der Ball nach
    // einer Fenster-Größenänderung (mobil: nach dem Drehen) auf die Lesehöhe,
    // bekam eine Drehung, und der Weg war nur zum Teil gezeichnet — und blieb
    // so, FÜR IMMER, weil in diesem Modus kein Scroll-Zuhörer läuft.
    // Genau dasselbe Muster war in `BallPass.js` abgesichert (dort fragt die
    // Setz-Funktion `ruhig` selbst ab). Derselbe Autor, dieselbe Datei-Familie,
    // einmal abgesichert und einmal nicht.
    const standbild = () => {
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
      // ⚠️ Und die Beschriftung muss mit. Der Balken steht auf 100 %, der Ball
      // am Ende — daneben „1 / 6 · Aufstellung" zu schreiben, wäre eine Zahl,
      // die lügt (`docs/MUSTER-ZAHLEN-DIE-LUEGEN`): volle Anzeige, erster
      // Schritt. Das Standbild zeigt den GANZEN Weg, also nennt es auch dessen
      // Ende. Beim mitlaufenden Ball macht `setzen()` das schrittweise.
      if (beschriftungRef.current && labels.length > 0) {
        beschriftungRef.current.textContent =
          `${labels.length} / ${labels.length} · ${labels[labels.length - 1]}`;
        aktivRef.current = labels.length - 1;
      }
    };

    const neuVermessen = () => {
      vermessen();
      if (ruhig) standbild();
      else anstossen();
    };

    vermessen();
    if (ruhig) {
      standbild();
      window.addEventListener("resize", neuVermessen);
      return () => window.removeEventListener("resize", neuVermessen);
    }
    setzen();

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
