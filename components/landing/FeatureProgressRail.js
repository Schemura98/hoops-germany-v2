"use client";

import { useEffect, useRef } from "react";
import {
  RailBallGlyph,
  HoopEmblem,
  RAIL_BALL_R,
  rollwinkel,
} from "@/components/landing/HeroGlyphs";

// Fortschritts-Anzeige der Feature-Strecke (Konzept
// docs/LANDING-KONZEPT-2026-08-11.md, Abschnitt 7 / Stufe 2).
//
// Zweck: Aus sechs Einzel-Momenten eine spürbare Strecke machen – ohne Pinning
// und ohne eine einzige Sekunde zusätzliche Scrollzeit. Am Desktop ein
// schmaler Streifen am rechten Rand mit sechs Punkten, mobil ein dünner Balken
// unter der Navbar mit Kurz-Beschriftung ("2 / 6 · Kader füllt sich").
//
// Seit A10 (docs/SPIELFELD-STRECKE-2026-08-12.md) trägt diese Leiste zusätzlich
// den Ball, der im Hero zur Ruhe gekommen ist: Er reitet den Fortschritt mit
// (Mobil: Balkenspitze, Desktop: zwischen den Punkten interpoliert) und landet
// einmalig am Ende – ein Korb-Emblem (`HoopEmblem`, bisher an der Hero-CTA)
// wartet dort. "Einmalig" bezieht sich auf die LANDE-ANIMATION samt Farbblitz,
// nicht auf die Position: Beim Zurückscrollen folgt der Ball wieder dem
// Fortschritt. Die erste Fassung fror ihn dauerhaft ein, während Balken und
// Beschriftung weiterliefen – der Balken stand dann bei 32 %, der Ball klebte
// ganz rechts (Befund Tobias, 12.08.2026).
//
// Technik wie in HeroScrollStage.js: EIN Scroll-Listener für die ganze Sektion
// (nicht pro Karte), ein rAF-Tick, direkte Style-Mutation ohne Re-Render. Der
// Beschriftungstext wird nur bei Wechsel des Abschnitts geschrieben.
//
// Die Komponente sucht sich ihre Sektion selbst (closest("section")), damit die
// aufrufende Seite eine Server-Komponente bleiben kann.
const NAVBAR_HEIGHT = 64;

// Die Farbwerte stehen hier als Konstanten, weil sie per style-Property
// gesetzt werden (Tailwind-Klassen kaemen pro Frame nicht in Frage). Sie muessen
// mit brand-500 und navy-600 aus tailwind.config.js uebereinstimmen – beim
// Redesign am 12.08.2026 waren die alten Werte (#f97316/#e5e7eb) die einzige
// Stelle, die das Farbschema nicht mitbekommen hat.
const FARBE_AKTIV = "#F07A27"; // brand-500
const FARBE_RUHE = "#3D5080"; // navy-600

// Fluegel-Szenen (Desktop): Index 1 "Kader fuellt sich" (Mock-Karte steht laut
// Konzept links), Index 4 "Der naechste Zug" (Mock-Karte steht rechts). Der
// Ball weicht dort ein paar Pixel seitlich aus – Abschnitt 1/4 des Konzepts.
const WING_LEFT_INDEX = 1;
const WING_RIGHT_INDEX = 4;
const WING_NUDGE = 9; // px

// Ab diesem Anteil t der GANZEN Sektion macht der Ball den letzten Sprung ins
// Ziel, statt weiter dem Fortschritt zu folgen (Konzept Abschnitt 3: "zeitlich
// exakt wenn Szene 6 in den Fokus rueckt" – das faellt mit dem Ende der
// Sektion zusammen, deutlich nach dem Moment, in dem der letzte Punkt aktiv wird).
const ARRIVE_T = 0.96;

// ── Dribbel-Spur (Punkt 3, 15.08.2026, Auftrag Patrick) ────────────────────
// Der Ball hinterlässt seinen Weg, wie ihn ein Trainer auf die Taktiktafel
// malen würde. Das ist KEINE frei gewählte Deko-Linie:
//
// In der Taktiktafel-Notation hat jede Linienform eine feste Bedeutung –
// durchgezogen = Laufweg, gestrichelt = Pass, **Zickzack = Dribbling**. Unser
// Ball dribbelt die Strecke entlang; eine gerade Linie hieße „der Ball wurde
// getragen", eine gestrichelte „er wurde gepasst". Dieselbe Konvention benutzt
// PlayDiagram.js für Laufweg und Pass.
//
// ⚠️ WAS HIER TATSÄCHLICH GERENDERT WIRD, IST EINE WEICHE WELLE, KEIN ZICKZACK
// (Befund Tobias, 15.08.2026). Grund sind die quadratischen Bézier-Segmente
// unten: Sie erzeugen runde Bögen, keine Ecken. Der Absatz darüber beschrieb
// bis dahin die Notation, nicht die Zeichnung – also genau der Fall aus
// docs/MUSTER-ZAHLEN-DIE-LUEGEN: im Sinne des Codes richtig, im Sinne des
// Lesers falsch.
// Es bleibt vorerst die Welle, weil sie am Produkt geprüft und für gut befunden
// ist. **Ob daraus ein echter Zickzack wird (Q- durch L-Segmente ersetzen, ein
// Zweizeiler), ist eine Gestaltungsentscheidung und gehört Vivien** – die
// Notationsbegründung trägt streng genommen erst dann wieder.
//
// Technik wie dort: `pathLength="1"` normiert die Pfadlänge auf 1, danach
// zeichnet `strokeDashoffset` von 1 auf 0 den Pfad exakt von Anfang bis Ende –
// ohne `getTotalLength()`, also ohne Layout-Zugriff pro Bild.
const SPUR_AMPLITUDE = 4.5; // px seitlicher Ausschlag der Zickzack-Linie
const SPUR_WELLE = 15; // px Länge einer halben Welle

// Baut den Zickzack-Pfad einer Dribbel-Strecke. `mitteBei(fortschritt)` liefert
// die seitliche Mittellinie an dieser Stelle – dadurch trägt die Spur die
// Flügel-Auslenkung des Balls mit und läuft nicht stur geradeaus.
// `senkrecht`: true = Strecke verläuft in y (Desktop-Leiste), false = in x.
function dribbelPfad(von, bis, mitteBei, senkrecht) {
  const laenge = bis - von;
  if (laenge <= 0) return "";
  const schritte = Math.max(2, Math.round(laenge / SPUR_WELLE));
  // ⚠️ Faktor 2 am Steuerpunkt, und der ist nicht willkürlich: Eine quadratische
  // Bézierkurve erreicht ihren Steuerpunkt NICHT – ihr Scheitel liegt auf halbem
  // Weg dorthin. Ohne den Faktor wäre die sichtbare Amplitude nur halb so groß
  // wie `SPUR_AMPLITUDE` behauptet (nachgemessen: 5px statt 9px Bandhöhe).
  // Eine Konstante, die das Doppelte ihres Wertes bedeutet, ist eine Falle für
  // den Nächsten, der sie justiert.
  const punkt = (l, seite) => {
    const f = laenge === 0 ? 0 : l / laenge;
    const mitte = mitteBei(f);
    const quer = mitte + seite * SPUR_AMPLITUDE * 2;
    return senkrecht ? [quer, von + l] : [von + l, quer];
  };
  const [sx, sy] = punkt(0, 0);
  let d = `M${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < schritte; i++) {
    const l0 = (laenge * i) / schritte;
    const l1 = (laenge * (i + 1)) / schritte;
    const [kx, ky] = punkt((l0 + l1) / 2, i % 2 === 0 ? 1 : -1);
    const [ex, ey] = punkt(l1, 0);
    d += ` Q${kx.toFixed(1)} ${ky.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  return d;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function FeatureProgressRail({ labels = [] }) {
  const wrapRef = useRef(null);
  const barRef = useRef(null);
  const trackRef = useRef(null); // mobiler Balken-Container (Breite fuer den Ball)
  const labelRef = useRef(null);
  const dotsRef = useRef([]);
  const railColRef = useRef(null); // Desktop: die Punkte-Spalte selbst (Positionsbezug)
  const ballMobileRef = useRef(null);
  const goalMobileRef = useRef(null);
  const ballDesktopRef = useRef(null);
  const goalDesktopRef = useRef(null);
  const goalRingRef = useRef(null); // nur der Ring des Korb-Emblems (fuer den Farbblitz)
  const spurMobileRef = useRef(null); // Dribbel-Spur, waagerecht
  const spurDesktopRef = useRef(null); // Dribbel-Spur, senkrecht
  const activeRef = useRef(-1);
  const arrivedRef = useRef(false); // einmalige Ankunft – danach eingefroren
  const tickingRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    if (!section || labels.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Bei reduzierter Bewegung füllt sich der Balken nicht scroll-synchron mit –
    // er würde sonst dauerhaft auf 0 % stehenbleiben und wie ein Fehler wirken.
    // Stattdessen wird er zur neutralen Linie; Beschriftung und Punkte tragen
    // die Orientierung, das sind einzelne Zustandswechsel, keine Bewegung.
    if (reduced && barRef.current) {
      barRef.current.style.transform = "scaleX(1)";
      barRef.current.style.backgroundColor = FARBE_RUHE;
    }

    // Setzt Ball + Korb-Emblem endgültig ans Ziel – einmal bei der echten
    // Ankunft (mit kurzer Übergangs-Animation) und einmal sofort bei
    // reduzierter Bewegung (ohne jede Animation, s. Konzept Abschnitt 5: "am
    // Korb angekommen" ist als Ruhezustand genauso lesbar wie bewegt).
    const ballZielSetzen = (animiert) => {
      if (ballMobileRef.current && trackRef.current) {
        const trackW = trackRef.current.getBoundingClientRect().width;
        if (animiert) {
          ballMobileRef.current.style.transition =
            "transform 320ms cubic-bezier(0.34,1.56,0.64,1)";
        }
        // Endstand MIT Drehwinkel: Ohne ihn schnappte der Ball bei der Ankunft
        // auf 0deg zurück – er wäre die ganze Strecke gerollt und am Ziel
        // plötzlich wieder unverdreht.
        ballMobileRef.current.style.transform = `translate3d(${(
          trackW - RAIL_BALL_R
        ).toFixed(1)}px, -50%, 0) rotate(${rollwinkel(trackW).toFixed(1)}deg)`;
        ballMobileRef.current.style.opacity = "1";
      }
      if (goalMobileRef.current) goalMobileRef.current.style.opacity = "1";

      const letzterDot = dotsRef.current[labels.length - 1];
      if (
        ballDesktopRef.current &&
        goalDesktopRef.current &&
        railColRef.current &&
        letzterDot
      ) {
        const colRect = railColRef.current.getBoundingClientRect();
        const zielRect = goalDesktopRef.current.getBoundingClientRect();
        const zielY = zielRect.top + zielRect.height / 2 - colRect.top;
        if (animiert) {
          // "back"-Easing statt linear: der Ball schwingt beim Einsetzen ganz
          // leicht über das Ziel hinaus und pendelt sich ein – ein Aufsetzer,
          // kein Teleport. Dieselbe Kurve wie beim mobilen Ball oben.
          ballDesktopRef.current.style.transition =
            "transform 420ms cubic-bezier(0.34,1.56,0.64,1), opacity 260ms ease-out";
          if (goalRingRef.current)
            goalRingRef.current.classList.add("rail-goal-flash-ring");
        }
        // Auch hier der Drehwinkel des Endstands (s. mobil oben). Bezug ist der
        // erste Punkt, damit er zur laufenden Drehung passt und nicht springt.
        const ersterRectZiel = dotsRef.current[0]?.getBoundingClientRect();
        const ersterYZiel = ersterRectZiel
          ? ersterRectZiel.top + ersterRectZiel.height / 2 - colRect.top
          : 0;
        // Wie im Scroll-Pfad: die Ballmitte sitzt auf zielY (der Mitte des
        // Korb-Emblems), nicht seine Oberkante.
        ballDesktopRef.current.style.transform = `translate3d(-50%, ${(
          zielY - RAIL_BALL_R
        ).toFixed(
          1,
        )}px, 0) rotate(${rollwinkel(zielY - ersterYZiel).toFixed(1)}deg)`;
        ballDesktopRef.current.style.opacity = "1";
        goalDesktopRef.current.style.opacity = "1";
      }
    };

    const apply = () => {
      tickingRef.current = false;
      const rect = section.getBoundingClientRect();
      if (rect.height <= 0) return;

      // 0 = Sektion beginnt gerade unter der Navbar, 1 = ihr Ende ist erreicht.
      const t = clamp01((NAVBAR_HEIGHT - rect.top) / rect.height);

      // ⚠️ DER BALL EXISTIERT ERST, WENN DIE STRECKE BEGONNEN HAT
      // (Befund Tobias B2, 15.08.2026). Vorher stand seine Deckkraft fest auf 1,
      // sobald der Controller lief – unabhängig davon, ob die Sektion überhaupt
      // erreicht war. Gemessen: Am Desktop stand der Streckenball schon bei
      // scrollY 0 im Bild, während der Hero-Ball dort noch auf Deckkraft 0,00
      // stand. An 158 von 226 Messpunkten waren ZWEI Bälle gleichzeitig zu sehen
      // – bei einer Choreografie, deren ganzer Zweck "ein Motiv, eine Reise" ist.
      // Die kurze Einblendung verhindert, dass er stattdessen aufpoppt.
      //
      // ⚠️ IN PIXELN, NICHT IN PROZENT DER SEKTION. Der erste Versuch nahm
      // `t / 0.03` – bei einer über 3000px hohen Sektion sind das über 90px
      // Scrollweg, und genau dort klaffte weiter eine Lücke ohne jeden Ball
      // (gemessen 6–13 Messpunkte je Fenstergröße). Ein Anteil an einer Höhe,
      // die sich mit dem Inhalt ändert, taugt nicht als Zeitmaß für eine
      // Übergabe.
      // Der Vorlauf ist Absicht: Die Einblendung beginnt, BEVOR die Sektion die
      // Navbar erreicht – also während der Hero-Ball noch ausrollt. So entsteht
      // eine echte Überblendung statt eines Staffelstabs, der kurz auf dem Boden
      // liegt.
      // Bezug ist die Oberkante der Sektion im Verhältnis zur Fensterhöhe, denn
      // genau dort übergibt der Hero-Ball: Er rollt aus der Bühne, während diese
      // Kante nach oben wandert. Anteile der FENSTERhöhe (nicht der Sektions-
      // höhe) – die Fensterhöhe ist die Größe, die beide Seiten teilen.
      const sichtHoehe = window.innerHeight || 1;
      const EINBLEND_VON = 0.42; // Sektionskante bei 42 % der Fensterhöhe
      const EINBLEND_BIS = 0.28; // vollständig da bei 28 %
      const einblendung = clamp01(
        (EINBLEND_VON * sichtHoehe - rect.top) /
          ((EINBLEND_VON - EINBLEND_BIS) * sichtHoehe),
      );

      if (!reduced && barRef.current)
        barRef.current.style.transform = `scaleX(${t.toFixed(3)})`;

      const index = Math.min(labels.length - 1, Math.floor(t * labels.length));
      if (index !== activeRef.current) {
        activeRef.current = index;
        if (labelRef.current) {
          labelRef.current.textContent = `${index + 1} / ${labels.length} · ${labels[index]}`;
        }
        dotsRef.current.forEach((dot, i) => {
          if (!dot) return;
          dot.style.backgroundColor = i <= index ? FARBE_AKTIV : FARBE_RUHE;
          dot.style.transform = i === index ? "scale(1.5)" : "scale(1)";
        });
      }

      // --- A10: der Ball reitet mit (docs/SPIELFELD-STRECKE-2026-08-12.md) ---
      // Läuft bewusst NICHT hinter dem obigen "index geändert?"-Guard, weil die
      // Ball-Position stetig ist (jeder Frame zählt), waehrend Label/Punkte nur
      // bei einem Szenenwechsel neu geschrieben werden muessen.
      // Beim Zurueckscrollen folgt der Ball wieder dem Fortschritt. Die erste
      // Fassung fror ihn nach der Ankunft dauerhaft ein ("kein Zurueckspringen")
      // – Balken und Beschriftung liefen aber weiter mit. Ergebnis: Der Balken
      // stand bei 32 %, der Ball klebte ganz rechts. Fuer den Nutzer sieht das
      // aus wie ein Darstellungsfehler, und es beschaedigt genau das Vertrauen
      // in die Anzeige, die es aufbauen soll (Befund Tobias, 12.08.2026).
      // Einmalig bleibt jetzt nur noch, was einmalig sein soll: die
      // Lande-Animation samt Farbblitz.
      if (reduced) return;

      // ⚠️ DIE LANDE-TRANSITION WIRD HIER WIEDER ENTFERNT (Befund Kai B2).
      // `ballZielSetzen` setzt bei der Ankunft eine überschwingende Transition
      // (320/420ms, cubic-bezier mit y=1.56). Sie wurde an KEINER Stelle wieder
      // gelöscht: Ab der ersten Ankunft lief danach jeder Frame durch sie
      // hindurch, und weil jedes neue `transform` die Transition neu startet,
      // kam keine je an – der Ball hing dauerhaft hinter der Scroll-Position.
      //
      // Vor diesem Umbau war das ein Nachlaufen von wenigen Pixeln. Seit im
      // `transform` zusätzlich ein `rotate()` steckt (Desktop 573°, mobil ~1965°
      // über die Strecke), entkoppelt eine überschwingende Kurve die Drehung vom
      // Weg – also genau die Kopplung, um die es bei diesem Umbau geht.
      //
      // Dieselbe Fehlerklasse steht schon im Kommentar oben (Befund Tobias
      // 12.08.2026): Damals war es die eingefrorene Position, jetzt die
      // eingefrorene Übergangsregel.
      if (ballMobileRef.current) ballMobileRef.current.style.transition = "";
      if (ballDesktopRef.current) ballDesktopRef.current.style.transition = "";

      // Mobil: Spitze des sich fuellenden Balkens – dieselbe Zahl t, die auch
      // den Balken fuellt, damit beide immer exakt uebereinstimmen.
      if (trackRef.current && ballMobileRef.current) {
        const trackW = trackRef.current.getBoundingClientRect().width;
        // ⚠️ Der jeweils andere Zweig ist per `xl:hidden` / `hidden xl:block` auf
        // `display:none` – seine Rechtecke sind dann lauter Nullen. Ohne diesen
        // Wächter rechnete und schrieb der Controller pro Bild in einen
        // unsichtbaren Teilbaum (Befund Kai B6). Kein Korrektheitsfehler,
        // aber verschenkte Arbeit auf jedem einzelnen Frame.
        if (trackW > 0) {
          // Der Ball ROLLT die Leiste entlang, er gleitet nicht: Die Drehung
          // folgt der zurückgelegten Strecke (s. `rollwinkel` in HeroGlyphs).
          const strecke = trackW * t;
          ballMobileRef.current.style.transform = `translate3d(${(
            strecke - RAIL_BALL_R
          ).toFixed(
            1,
          )}px, -50%, 0) rotate(${rollwinkel(strecke).toFixed(1)}deg)`;
          ballMobileRef.current.style.opacity = einblendung.toFixed(3);

          // Die Dribbel-Spur liegt auf voller Länge im Pfad und wird über den
          // Strichversatz aufgedeckt – so bleibt sie exakt beim Ball, ohne dass
          // der Pfad pro Bild neu gebaut werden müsste.
          if (spurMobileRef.current) {
            if (
              spurMobileRef.current.dataset.breite !==
              String(Math.round(trackW))
            ) {
              spurMobileRef.current.dataset.breite = String(Math.round(trackW));
              spurMobileRef.current.setAttribute(
                "d",
                dribbelPfad(0, trackW, () => 0, false),
              );
            }
            spurMobileRef.current.style.strokeDashoffset = String(1 - t);
          }
        }
      }

      // Desktop: zwischen erstem und letztem Punkt interpolieren, mit
      // Fluegel-Auslenkung an den zwei Szenen, deren Mock-Karte tatsaechlich
      // seitlich steht (Konzept Abschnitt 1).
      const letzterDot = dotsRef.current[labels.length - 1];
      if (
        railColRef.current &&
        dotsRef.current[0] &&
        letzterDot &&
        ballDesktopRef.current
      ) {
        const colRect = railColRef.current.getBoundingClientRect();
        // ⚠️ Der jeweils andere Zweig ist per `xl:hidden` / `hidden xl:block` auf
        // `display:none` – seine Rechtecke sind dann lauter Nullen. Ohne diesen
        // Wächter rechnete und schrieb der Controller pro Bild in einen
        // unsichtbaren Teilbaum (Befund Kai B6). Kein Korrektheitsfehler,
        // aber verschenkte Arbeit auf jedem einzelnen Frame.
        if (colRect.height > 0) {
          const ersterRect = dotsRef.current[0].getBoundingClientRect();
          const letzterRect = letzterDot.getBoundingClientRect();
          const ersterY = ersterRect.top + ersterRect.height / 2 - colRect.top;
          const letzterY =
            letzterRect.top + letzterRect.height / 2 - colRect.top;
          const continuous = Math.min(labels.length - 1, t * labels.length);
          const frac = labels.length > 1 ? continuous / (labels.length - 1) : 0;
          const y = ersterY + (letzterY - ersterY) * frac;
          const gewicht = (mitte) =>
            Math.max(0, 1 - Math.abs(continuous - mitte));
          const nudgeX =
            -WING_NUDGE * gewicht(WING_LEFT_INDEX) +
            WING_NUDGE * gewicht(WING_RIGHT_INDEX);
          // Wie mobil: die Drehung folgt dem Weg. Gemessen wird ab dem ERSTEN
          // Punkt, nicht ab 0 – sonst startet der Ball bereits verdreht, obwohl
          // er noch keinen Millimeter zurückgelegt hat.
          // ⚠️ `- RAIL_BALL_R` positioniert die BALLMITTE auf y (Befund B3).
          // Vorher stand dort die Oberkante: Der Ball hing damit einen Radius
          // unter dem Punkt, den er gerade passieren sollte, und die Spur – die
          // auf der Punkt-Mittellinie liegt – streifte seine Oberkante, statt aus
          // ihm herauszulaufen. Bei 14px waren das 7px und niemandem aufgefallen;
          // mit 20px und einer sichtbaren Spur ist es offensichtlich. Mobil war es
          // immer richtig (`top-1/2` + `-50%`), also war auch das eine Asymmetrie
          // zwischen den beiden Aufrufstellen.
          ballDesktopRef.current.style.transform = `translate3d(calc(-50% + ${nudgeX.toFixed(
            1,
          )}px), ${(y - RAIL_BALL_R).toFixed(1)}px, 0) rotate(${rollwinkel(
            y - ersterY,
          ).toFixed(1)}deg)`;
          ballDesktopRef.current.style.opacity = einblendung.toFixed(3);

          // Dribbel-Spur: einmal je Layout gebaut, danach nur aufgedeckt. Die
          // Mittellinie trägt dieselbe Flügel-Auslenkung wie der Ball – sonst
          // liefe die Spur schnurgerade, während der Ball seitlich ausschert.
          if (spurDesktopRef.current) {
            const kennung = `${Math.round(ersterY)}-${Math.round(letzterY)}`;
            if (spurDesktopRef.current.dataset.spanne !== kennung) {
              spurDesktopRef.current.dataset.spanne = kennung;
              const mitteBei = (f) => {
                const c = f * (labels.length - 1);
                return (
                  -WING_NUDGE * Math.max(0, 1 - Math.abs(c - WING_LEFT_INDEX)) +
                  WING_NUDGE * Math.max(0, 1 - Math.abs(c - WING_RIGHT_INDEX))
                );
              };
              spurDesktopRef.current.setAttribute(
                "d",
                dribbelPfad(ersterY, letzterY, mitteBei, true),
              );
            }
            spurDesktopRef.current.style.strokeDashoffset = String(1 - frac);
          }

          if (goalDesktopRef.current) {
            // Das Korb-Emblem daemmert schon auf, waehrend sich der Ball dem
            // letzten Punkt naehert – volle Helligkeit erst bei der Ankunft.
            const naeher = clamp01(continuous - (labels.length - 2));
            goalDesktopRef.current.style.opacity = (naeher * 0.5).toFixed(2);
          }
        }
      }

      // Ankunft: kurz vor Sektionsende springt der Ball einmalig ins Ziel und
      // friert danach ein – kein Zurueckspringen, kein zweites Abspielen beim
      // Zurueckscrollen (Konzept Abschnitt 3, "kein Deko-Loop").
      if (t >= ARRIVE_T) {
        // `arrivedRef` steuert nur noch, ob die Lande-Animation schon lief –
        // nicht mehr, ob der Ball dem Fortschritt folgt.
        const erstmalig = !arrivedRef.current;
        arrivedRef.current = true;
        ballZielSetzen(erstmalig);
      }
    };

    let raf = 0;
    const onScrollOrResize = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    // Bei reduzierter Bewegung rechnet `apply` gar nicht erst – der Ball steht
    // fest am Ziel. Aendert sich die Fensterbreite, wandert das Korb-Emblem als
    // normales Flex-Kind mit, der Ball bliebe aber auf seinem alten transform
    // stehen und stuende sichtbar DANEBEN (Befund Kai, 12.08.2026). Deshalb
    // dort neu einrasten. Im bewegten Fall erledigt das `apply` selbst, seit
    // der Ball dem Fortschritt wieder folgt.
    const beiGroessenaenderung = () => {
      if (reduced) ballZielSetzen(false);
      onScrollOrResize();
    };

    apply();
    // Reduzierte Bewegung: der Ball steht von Anfang an regungslos am Ziel –
    // ohne Animation, ohne dass jemals ein Scroll-Frame die A10-Logik oben
    // erreicht (die kehrt ja wegen `reduced` sofort um).
    if (reduced) {
      arrivedRef.current = true;
      ballZielSetzen(false);
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", beiGroessenaenderung);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", beiGroessenaenderung);
    };
  }, [labels]);

  return (
    // display:contents - der Wrapper darf keine eigene Box bilden: Sonst ist er
    // genauso hoch wie der Balken (das Desktop-Element daneben ist absolut
    // positioniert), und ein sticky-Kind hat in einem Containing Block ohne
    // Spielraum keine Strecke zum Kleben (Befund Tobias, 12.08.2026).
    <div ref={wrapRef} aria-hidden="true" style={{ display: "contents" }}>
      {/* Mobil/Tablet: dünner Balken unter der Navbar + Kurz-Beschriftung.
          Der Ball reitet auf der Balkenspitze mit, das Korb-Ziel sitzt
          kompakt neben der Beschriftung (A10) – eine bewusst einfachere
          Geometrie als am Desktop, s. Konzept Abschnitt 4: eine absolute
          Positionierung des Ziels HINTER dem vollen Balken würde entweder
          über den 16px-Seitenrand hinauslaufen oder den Balken schmälern. */}
      <div className="sticky top-16 z-20 -mx-4 mb-10 bg-navy-950/90 px-4 pb-2 pt-2 backdrop-blur-sm xl:hidden">
        <div className="mb-1.5 flex items-center gap-1.5">
          <p
            ref={labelRef}
            className="text-[10px] font-bold uppercase tracking-widest text-mist-400"
          >
            {`1 / ${labels.length} · ${labels[0] || ""}`}
          </p>
          <span
            ref={goalMobileRef}
            className="opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
            title="Ziel: Nachspielzeit"
          >
            {/* Native Groesse des Emblems (20x14) statt Skalierung – keine
                Verzerrung, kein zusaetzlicher Rechenwert. */}
            <HoopEmblem
              className="pointer-events-none block h-3.5 w-5"
              style={{}}
            />
          </span>
        </div>
        <div ref={trackRef} className="relative h-1 w-full">
          <div className="absolute inset-0 overflow-hidden rounded-full bg-navy-700">
            <div
              ref={barRef}
              className="h-full w-full origin-left rounded-full bg-brand-500"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          {/* Dribbel-Spur, waagerecht. `overflow-visible` ist nötig, weil der
              Zickzack über die 4px des Balkens hinausschwingt; der innere
              Versatz legt y=0 auf die Balkenmitte. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 h-8 w-full -translate-y-1/2 overflow-visible"
            fill="none"
          >
            <g transform="translate(0,16)">
              <path
                ref={spurMobileRef}
                data-spur="mobil"
                d=""
                pathLength="1"
                strokeDasharray="1"
                style={{ strokeDashoffset: 1 }}
                stroke={FARBE_AKTIV}
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
          {/* Positionierung liegt seit dem 15.08.2026 beim Aufrufer, s. Kommentar
              an RailBallGlyph. Mobil: auf der Mitte des waagerechten Balkens. */}
          <RailBallGlyph
            ref={ballMobileRef}
            className="absolute left-0 top-1/2"
          />
        </div>
      </div>

      {/* Desktop: Punkte-Streifen am rechten Rand, außerhalb des Inhalts.
          Das Korb-Emblem ist ein normales Flex-Kind direkt nach dem letzten
          Punkt – dadurch braucht seine Position keine eigene Messung, nur der
          Ball (der zwischen den Punkten interpolieren muss) wird per rAF
          positioniert. */}
      <div className="pointer-events-none absolute inset-y-0 right-6 hidden xl:block">
        <div
          ref={railColRef}
          className="sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-3"
        >
          {/* Dribbel-Spur, senkrecht. Breite 40px deckt den größten Ausschlag
              ab (Flügel-Auslenkung 9 + Amplitude 4,5); der innere Versatz legt
              x=0 auf die Spaltenmitte, dieselbe Bezugsachse wie beim Ball.
              Steht als ERSTES Kind, damit die Punkte darüber liegen. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 overflow-visible"
            fill="none"
          >
            <g transform="translate(20,0)">
              <path
                ref={spurDesktopRef}
                data-spur="desktop"
                d=""
                pathLength="1"
                strokeDasharray="1"
                style={{ strokeDashoffset: 1 }}
                stroke={FARBE_AKTIV}
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
          {labels.map((label, i) => (
            <span
              key={label}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              title={label}
              className="h-2 w-2 rounded-full bg-navy-700 transition-transform duration-300 motion-reduce:transition-none"
            />
          ))}
          <span
            ref={goalDesktopRef}
            className="mt-1 h-3.5 w-5 flex-shrink-0 opacity-0"
            title="Ziel: Nachspielzeit"
          >
            <HoopEmblem
              ringRef={goalRingRef}
              className="pointer-events-none block h-full w-full"
              style={{}}
            />
          </span>
          {/* Desktop: senkrechte Leiste. KEIN `style` mehr – der Drehpunkt
              gehört der Komponente (Befund Kai B1). */}
          <RailBallGlyph
            ref={ballDesktopRef}
            className="absolute left-1/2 top-0"
          />
        </div>
      </div>
    </div>
  );
}
