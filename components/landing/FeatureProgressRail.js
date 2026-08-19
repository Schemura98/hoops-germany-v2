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
// am Ende – ein Korb-Emblem (`HoopEmblem`) steht dort.
//
// ⚠️ DIE LANDUNG ALS EREIGNIS IST AM 19.08.2026 ENTFALLEN (Auftrag Patrick,
// docs/HERO-DUNK-KONZEPT-2026-08-19.md, Möglichkeit B). Weg sind die
// überschwingende Lande-Kurve und der Farbblitz `rail-goal-flash`; geblieben
// ist die GEOMETRIE – der Ball kommt weiterhin im Netz zur Ruhe, nicht daneben.
// Das Korb-Emblem steht ab dem ersten Bild da, als STEHENDE ENDMARKE, statt
// erst bei der Ankunft aufzudämmern.
// Begründung, und sie ist hart: CLAUDE.md Roadmap 20 (d) hält fest, dass diese
// Pointe auf KEINEM Viewport sichtbar war – Ball und Emblem standen bei der
// Ankunft hinter der stickyen Navbar. Wir hätten also ein Finale geschützt, das
// nach der eigenen Messung des Projekts noch nie jemand gesehen hat. Den
// stärksten Moment dorthin zu legen, wo ihn 100 % der Besucher sehen (der
// Hero), ist keine Geschmacksfrage.
// ⚠️ Was ein Emblem, das immer dasteht, zusätzlich leistet: Die Leiste zeigt
// jetzt nicht nur, wo man IST, sondern auch, wohin sie führt. Ein Ziel, das
// erst erscheint, wenn man es erreicht hat, ist keine Orientierung.
// Historisch: "Einmalig" bezog sich auf die LANDE-ANIMATION samt Farbblitz,
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
// Ziel, statt weiter dem Fortschritt zu folgen.
//
// ⚠️ 0.96 → 0.86 (Entscheidung Vivien, 15.08.2026, Roadmap 20 d). Sie hat das
// Korb-Emblem über `t` verfolgt: Es steht von t≈0,70 bis 0,96 gut sichtbar
// mitten im Bild. 0.96 feuerte am ALLERLETZTEN Punkt dieses Fensters – 15px
// unter der Navbar –, und danach blieben bei 1280 noch ganze **62px
// Scrollweg**, bis alles verschwunden war. Eine 420ms-Landeanimation in einem
// 62px-Fenster sieht bei normalem Wischen niemand. Deshalb war Tobias' Befund
// „die Landung ist auf keinem Viewport sichtbar" richtig, obwohl sie
// rechnerisch im Bild lag.
// Dazu kam ein toter Abschnitt: Der Ball erreicht den letzten Punkt schon bei
// t = 5/6 ≈ 0,833 (`continuous` klemmt dort) und stand dann 314px still.
// 0.86 setzt die Landung direkt dahinter: letzter Punkt erreicht → Landung.
// Das sichtbare Fenster wächst von 62px auf ~250px.
const ARRIVE_T = 0.86;

// ── Laufweg-Spur der Desktop-Leiste ───────────────────────────────────────
// ⚠️ WAR EINE DRIBBEL-SPUR (Zickzack/Welle), IST JETZT EIN LAUFWEG
// (Entscheidung Vivien, 15.08.2026). Die Begründung ist nicht ästhetisch:
// Der Ball auf der Leiste **rollt** – `rollwinkel()` = Weg/Radius, das ist der
// bewusst gebaute Kern dieses Umbaus. Ein rollender Ball dribbelt nicht. Eine
// Zickzack-Linie hätte nach der Taktiktafel-Notation also eine Bewegung
// behauptet, die der Code an derselben Stelle widerlegt – dasselbe Muster wie
// in `docs/MUSTER-ZAHLEN-DIE-LUEGEN`, nur in Grafik statt in Text.
// Durchgezogen = Laufweg ist die Notation, die zum Rollen passt, und sie trägt
// hier echte Information, weil die Fortschritts-Punkte diskret sind: Die Linie
// zeigt, wie weit der Ball zwischen ihnen gekommen ist.
//
// ⚠️ MOBIL GIBT ES SIE NICHT MEHR. Der sich füllende Balken IST die Spur,
// buchstäblich und exakt – eine zweite Linie daneben sagte dasselbe ein
// zweites Mal. `dribbelPfad`, `SPUR_AMPLITUDE` und `SPUR_WELLE` sind damit
// ersatzlos entfallen.
//
// Technik unverändert: `pathLength="1"` normiert die Pfadlänge, danach zeichnet
// `strokeDashoffset` von 1 auf 0 – ohne `getTotalLength()`, also ohne
// Layout-Zugriff pro Bild.

// Gerader Laufweg von `von` nach `bis`, mit der Flügel-Auslenkung des Balls als
// Stützpunkten – sonst liefe die Linie schnurgerade, während der Ball seitlich
// ausschert.
function laufwegPfad(von, bis, mitteBei) {
  const laenge = bis - von;
  if (laenge <= 0) return "";
  const schritte = 12;
  let d = `M${mitteBei(0).toFixed(1)} ${von.toFixed(1)}`;
  for (let i = 1; i <= schritte; i++) {
    const f = i / schritte;
    d += ` L${mitteBei(f).toFixed(1)} ${(von + laenge * f).toFixed(1)}`;
  }
  return d;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ⚠️ EINE Konstante für BEIDE Zweige (Befund Tobias B-b): Sie stand nur im
// Desktop-Zweig, und genau deshalb landete der mobile Ball neben dem Korb.
// Der Ball ruht UNTER dem Ring, bei 15 von 28px Emblemhöhe – auf der Mitte
// läge er über dem Ring und deckte ihn zu (Entscheidung Vivien).
const RUHE_ANTEIL = 15 / 28;

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
  const goalMobileRingRef = useRef(null);
  // ⚠️ `goalRingRef` und `goalMobileFlashRef` sind am 19.08.2026 entfallen. Sie
  // trugen AUSSCHLIESSLICH den Farbblitz. Eine Ref, die niemand mehr liest, ist
  // keine Dokumentation, sondern eine Spur, der der Nächste folgt (Kai K6).
  // Begrenzt die Wiederholung der Emblem-Messung (Befund Kai).
  const zielMessVersucheRef = useRef(0);
  // Einmal-Sperre, wie `streifenGemeldetRef` im Hero (Empfehlung Kai).
  const diagnoseGemeldetRef = useRef(false); // Einmal-Sperre der Rail-Diagnose
  const spurDesktopRef = useRef(null); // Laufweg-Spur der Desktop-Leiste
  const activeRef = useRef(-1);
  // ⚠️ `arrivedRef` ist am 19.08.2026 entfallen. Es steuerte nur noch, ob die
  // Lande-Animation schon gelaufen war. Ohne Lande-Animation ist
  // `ballZielSetzen` idempotent – es gibt kein „erstes Mal" mehr zu merken.
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

    // ⚠️ DIE ENDMARKE STEHT AB DEM ERSTEN BILD. Alle vier Emblem-Hüllen tragen
    // `opacity-0` im Markup – das ist Absicht, damit vor der Hydration nichts
    // an falscher Stelle aufblitzt. Sichtbar gemacht werden sie hier, in EINEM
    // Aufruf für beide Zweige: welcher davon angezeigt wird, entscheidet der
    // Breakpoint, und das weiß diese Stelle nicht. Der unsichtbare stört nicht.
    for (const r of [
      goalMobileRef.current,
      goalMobileRingRef.current,
      goalDesktopRef.current,
    ]) {
      if (r) r.style.opacity = "1";
    }

    // Setzt den Ball an sein Ziel im Netz. Seit dem 19.08.2026 OHNE jede
    // Übergangskurve: Es gibt keine Landung mehr als Ereignis, nur noch einen
    // Ball, der am Ende der Strecke steht.
    const ballZielSetzen = () => {
      if (ballMobileRef.current && trackRef.current) {
        const trackW = trackRef.current.getBoundingClientRect().width;
        // ══ DER MOBILE BALL LANDET IM NETZ, NICHT DANEBEN ═══════════════════
        // Befund Tobias B-b (sechste Runde), von Kai am Code bestätigt und
        // nachgerechnet. `RUHE_ANTEIL` existierte NUR im Desktop-Zweig; der
        // mobile Ball hing unverändert an `top-1/2` des 4px-Balkens.
        // Gemessen auf 375x812: Ballmitte y = 95 statt 76 – **6px UNTERHALB der
        // Emblem-Unterkante** – und x genau auf der rechten Emblemkante, 12,2px
        // darüber hinaus. Die Ebenen-Trennung netz/ring war mobil im Markup
        // vorhanden und lief ins Leere, weil der Ball den Ring nie erreichte.
        // Kai maß den Anteil unabhängig als 34/28 = 1,2143 nach.
        // ⚠️ Damit trug der ganze Umbau aus `4d03ba2` auf dem HAUPTGERÄT nicht.
        const trackRect = trackRef.current.getBoundingClientRect();
        const zielM = goalMobileRef.current?.getBoundingClientRect();
        // ⚠️ DER RÜCKFALL IST EXAKT DER DEFEKT, DEN DIESE STELLE BEHEBT
        // (Befund Kai, siebte Runde). `trackW - RAIL_BALL_R` / `-50%` ist kein
        // neutraler Vorgabewert – es ist B-b, Ball neben statt im Korb.
        // Und anders als bei `clamp` (wirft) oder `offsetWidth` (steigt aus und
        // misst im nächsten Bild neu) gibt es hier KEINEN zweiten Versuch:
        // Bei reduzierter Bewegung läuft `ballZielSetzen` genau EINMAL – ein
        // einziges Bild mit ungemessenem Emblem hieße dort dauerhaft falsche
        // Endlage, schweigend. Gefunden hat diesen Zustand zuletzt ein Mensch
        // im Browser, kein Test; die Erreichbarkeit ist gering, die Fehlerform
        // die teure.
        // Deshalb: erneut versuchen statt still danebenlegen.
        // ⚠️ NUR DORT MELDEN, WO DIESER ZWEIG ÜBERHAUPT GILT (Befund Kai,
        // siebte Runde). Ohne diese Schranke feuerte die Diagnose auf jedem
        // Desktop-Besuch: `goalMobileRef` liegt in `xl:hidden` und hat ab 1280
        // Breite 0 – gemessen **13 Fehler auf 1280, 12 auf 1440, 10 auf 1920**,
        // dazu 30 rAF-Wiederholungen je Aufruf. Die Meldung „Der Ball wird
        // neben dem Korb abgelegt" ist dort schlicht FALSCH; der Desktop-Zweig
        // platziert korrekt (`rail-ankunft` ist ab 1280 grün).
        // ⚠️ Und das ist exakt derselbe Befund wie Kais `console.error`-Punkt
        // aus Runde sechs – eine Diagnose, die dort feuert, wo ihr Zweig nicht
        // benutzt wird – **wiedereingeführt durch die Korrektur eines anderen
        // Befunds**. Vierte Wiederholung dieses Musters in dieser Serie.
        // Praktische Folge, die schwerer wiegt als das Rauschen: Ein echter
        // mobiler Ausfall ginge darin unter.
        // Die Schranke ist die Anzeige selbst, kein Breitenvergleich: Ist die
        // mobile Leiste ausgeblendet, hat ihr Balken Breite 0.
        const mobileLeisteSichtbar = trackRect.width > 0;
        if (mobileLeisteSichtbar && (!zielM || zielM.width === 0)) {
          if (zielMessVersucheRef.current < 30) {
            zielMessVersucheRef.current += 1;
            requestAnimationFrame(() => ballZielSetzen());
            return;
          }
          // ⚠️ EINMAL, WIE DAS GESCHWISTER IM HERO (Empfehlung Kai). Ohne
          // Sperre standen im Defektfall 19 identische Zeilen da – zwei
          // Diagnosen desselben Bauwerks mit zwei Verhalten. Die Anlaufzahl
          // wandert dafür IN die Meldung, damit die Information nicht verloren
          // geht, die vorher in der Wiederholung steckte.
          if (!diagnoseGemeldetRef.current) {
            diagnoseGemeldetRef.current = true;
            console.error(
              `[FeatureProgressRail] Das mobile Korb-Emblem hat nach 30 Bildern ` +
                `keine Größe (${zielMessVersucheRef.current} Anläufe). Der Ball ` +
                `wird neben dem Korb abgelegt statt darin (Befund B-b). Prüfen, ` +
                `ob \`goalMobileRef\` noch am gezeichneten Emblem hängt.`,
            );
          }
        }
        let versatzX = trackW - RAIL_BALL_R;
        let versatzY = "-50%";
        if (zielM && zielM.width > 0) {
          // Dieselbe Rechnung wie am Desktop: Mitte des Balls auf 15 von 28
          // Emblemhöhe, waagerecht auf die Emblem-MITTE statt auf seine Kante.
          versatzX =
            zielM.left + zielM.width / 2 - trackRect.left - RAIL_BALL_R;
          // ⚠️ DEN `top-1/2`-VERSATZ ABZIEHEN (Befund Tobias N1, Gate auf
          // 75f2c3a). Der mobile Ball trägt `top-1/2` auf einem Balken der Höhe
          // 4px – das sind 2px, auf die sich `translate3d` zusätzlich addiert.
          // Diese Rechnung ist absolut und wusste davon nichts: Erwartet
          // Ballmitte y = 76, beobachtet 78 (375×812). Am Desktop tritt es nicht
          // auf, dort gibt es kein `top-1/2`.
          // Visuell unauffällig – der Ball liegt sauber im Netz –, aber es ist
          // genau die Sorte stiller Ungenauigkeit, die beim nächsten Umbau als
          // „war schon immer so" durchgereicht wird.
          versatzY = `${(
            zielM.top +
            zielM.height * RUHE_ANTEIL -
            trackRect.top -
            RAIL_BALL_R -
            trackRect.height / 2
          ).toFixed(1)}px`;
        }
        // Endstand MIT Drehwinkel: Ohne ihn schnappte der Ball bei der Ankunft
        // auf 0deg zurück – er wäre die ganze Strecke gerollt und am Ziel
        // plötzlich wieder unverdreht.
        ballMobileRef.current.style.transform = `translate3d(${versatzX.toFixed(
          1,
        )}px, ${versatzY}, 0) rotate(${rollwinkel(trackW).toFixed(1)}deg)`;
        ballMobileRef.current.style.opacity = "1";
      }
      if (goalMobileRef.current) goalMobileRef.current.style.opacity = "1";
      if (goalMobileRingRef.current)
        goalMobileRingRef.current.style.opacity = "1";

      const letzterDot = dotsRef.current[labels.length - 1];
      if (
        ballDesktopRef.current &&
        goalDesktopRef.current &&
        railColRef.current &&
        letzterDot
      ) {
        const colRect = railColRef.current.getBoundingClientRect();
        const zielRect = goalDesktopRef.current.getBoundingClientRect();
        // ⚠️ NICHT MEHR DIE EMBLEM-MITTE (Entscheidung Vivien): Der Ball ruht
        // UNTER dem Ring, bei 15 von 28px Emblemhöhe (viewBox-y ≈ 7,5). Erst
        // dann kreuzt die vordere Ringkante die Ballkuppe – auf der Mitte lag
        // er über dem Ring und deckte ihn zu.
        const zielY =
          zielRect.top + zielRect.height * RUHE_ANTEIL - colRect.top;
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

      // ⚠️ DER B2-AUFRÄUMBLOCK IST AM 19.08.2026 ENTFALLEN, WEIL SEIN ANLASS
      // ENTFALLEN IST. Er löschte die überschwingende Lande-Transition wieder,
      // die `ballZielSetzen` bei der Ankunft gesetzt hatte. Es wird keine mehr
      // gesetzt – der Block hätte nichts mehr zu löschen.
      // ⚠️ WER HIER JE WIEDER EINE TRANSITION SETZT, BRAUCHT IHN ZURÜCK, und
      // zwar mit der Feinheit aus Runde zwei: nur AUSSERHALB der Ankunftszone
      // löschen, sonst reißt das nächste Scroll-Ereignis die Animation mitten
      // im Flug ab. Der historische Wortlaut steht unten.
      //
      // Historisch (Befund Kai B2).
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
      // ⚠️ NUR AUSSERHALB DER ANKUNFTSZONE (Befund Kai K2, zweite Runde).
      // Die erste Fassung löschte jeden Frame – auch den, in dem
      // `ballZielSetzen` die Lande-Kurve gerade gesetzt hatte. Da die Ankunft
      // DURCH Scrollen ausgelöst wird, folgt innerhalb der 320/420ms praktisch
      // garantiert ein weiteres Scroll-Ereignis: Es riss die Animation mitten
      // im Flug ab, das Element schnappte auf den Zielwert. Der „Aufsetzer,
      // kein Teleport" fand damit faktisch nie statt – mein Fix für B2 hätte
      // die Landung gekostet, die er schützen sollte.
      // Unterhalb von ARRIVE_T gibt es nichts zu animieren; dort MUSS sie weg,
      // sonst läuft wieder jeder Frame durch eine überschwingende Kurve.
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
                laufwegPfad(ersterY, letzterY, mitteBei),
              );
            }
            spurDesktopRef.current.style.strokeDashoffset = String(1 - frac);
          }

          // ⚠️ DAS EMBLEM DÄMMERT NICHT MEHR AUF. Es stand vorher bei
          // `naeher * 0.5` und erreichte volle Helligkeit erst bei der Ankunft.
          // Als stehende Endmarke gehört es ab dem ersten Bild ins Bild – es
          // wird jetzt einmal beim Aufsetzen sichtbar gemacht (s. `endmarke`).
        }
      }

      // Ankunft: kurz vor Sektionsende steht der Ball im Netz. Beim
      // Zurueckscrollen folgt er wieder dem Fortschritt (kein Einfrieren,
      // Befund Tobias 12.08.2026).
      if (t >= ARRIVE_T) ballZielSetzen();
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
      if (reduced) ballZielSetzen();
      onScrollOrResize();
    };

    apply();
    // Reduzierte Bewegung: der Ball steht von Anfang an regungslos am Ziel –
    // ohne Animation, ohne dass jemals ein Scroll-Frame die A10-Logik oben
    // erreicht (die kehrt ja wegen `reduced` sofort um).
    if (reduced) ballZielSetzen();
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
          Der Ball reitet auf der Balkenspitze mit.
          ⚠️ DAS KORB-ZIEL SASS BIS ZUM 15.08.2026 NEBEN DER BESCHRIFTUNG, also
          LINKS – während der Ball am rechten Balkenende ankommt. Gemessen bei
          375: Emblem bei x=150, Ball-Endposition bei x=349. Der Ball bewegte
          sich über die ganze Strecke VOM ZIEL WEG (Entscheidung Vivien).
          Es sitzt jetzt am rechten Ende, unmittelbar über der Balkenspitze.
          Die alte Begründung („würde über den 16px-Seitenrand hinauslaufen
          oder den Balken schmälern") trifft für diese Positionierung nicht zu:
          Das Emblem ist 20x14px, liegt ÜBER dem Balken statt in ihm, und der
          Balken behält seine volle Breite. */}
      <div className="sticky top-16 z-20 -mx-4 mb-10 bg-navy-950/90 px-4 pb-2 pt-2 backdrop-blur-sm xl:hidden">
        <div className="mb-1.5 flex items-center gap-1.5">
          <p
            ref={labelRef}
            className="text-[10px] font-bold uppercase tracking-widest text-mist-400"
          >
            {`1 / ${labels.length} · ${labels[0] || ""}`}
          </p>
        </div>
        <div ref={trackRef} className="relative h-1 w-full">
          {/* Das Ziel sitzt über der Balkenspitze – dort, wo der Fortschritt
              endet und der Ball ankommt.
              ⚠️ 28x20 STATT 40x28 (Befund Tobias B2, 19.08.2026). Über dem
              Balken stehen genau 27 px: Beschriftung (13) + Abstand (6) +
              Innenabstand des Streifens (8). Die alte Marke brauchte 32 –
              sie ragte also aus dem Streifen heraus und schnitt die Trennlinie
              der Navigationsleiste.
              ⚠️ NICHT DEN STREIFEN HÖHER MACHEN, das war die naheliegende
              Abhilfe: Er klebt unter der Navigationsleiste und nimmt jedem
              Inhalt darunter die Höhe weg – auf 360 px ist das die knappste
              Fläche der Seite. Kleiner ist hier billiger als höher.
              Das Seitenverhältnis bleibt exakt 20:14, sonst verzerrt der Korb.
              Die Marke ist mit 28 px immer noch deutlich breiter als der
              20-px-Ball, der in ihr ankommt – sie bleibt also ein Ziel und
              wird nicht zum Punkt. */}
          <span
            ref={goalMobileRef}
            className="absolute bottom-full right-0 mb-1 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
            title="Ziel: Nachspielzeit"
          >
            <HoopEmblem
              teil="netz"
              className="pointer-events-none block h-5 w-7"
            />
          </span>
          <div className="absolute inset-0 overflow-hidden rounded-full bg-navy-700">
            <div
              ref={barRef}
              className="h-full w-full origin-left rounded-full bg-brand-500"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          {/* Positionierung liegt seit dem 15.08.2026 beim Aufrufer, s. Kommentar
              an RailBallGlyph. Mobil: auf der Mitte des waagerechten Balkens. */}
          <RailBallGlyph
            ref={ballMobileRef}
            className="absolute left-0 top-1/2"
          />
          {/* Der Ring NACH dem Ball – gleiche Lage wie das Netz oben, dadurch
              liegt er davor. Erst damit stimmt das Bild „im Netz".
              ⚠️ DIE EBENEN-TRENNUNG netz/ring BLEIBT, obwohl der Farbblitz weg
              ist. Sie ist Geometrie, nicht Choreografie: Ein Ball im Netz liegt
              UNTER dem Ring und VOR dem Netz – man sieht den Ring vor ihm. Wer
              sie mit dem Blitz zusammen entfernt, bekommt wieder einen Kreis,
              der das Emblem vollständig überdeckt (Befund Tobias, 16.08.2026:
              „Das ist keine Aussage, es ist ein Verschwinden."). */}
          <span
            ref={goalMobileRingRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full right-0 mb-1 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
          >
            <HoopEmblem teil="ring" className="block h-5 w-7" />
          </span>
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
            className="mt-1 h-7 w-10 flex-shrink-0 opacity-0"
            title="Ziel: Nachspielzeit"
          >
            <HoopEmblem
              teil="netz"
              className="pointer-events-none block h-full w-full"
            />
          </span>
          {/* Desktop: senkrechte Leiste. KEIN `style` mehr – der Drehpunkt
              gehört der Komponente (Befund Kai B1). */}
          <RailBallGlyph
            ref={ballDesktopRef}
            className="absolute left-1/2 top-0"
          />
          {/* Der Ring liegt VOR dem Ball. Das Netz-Emblem ist das letzte Kind
              IM Fluss, also am Fuß der Spalte – diese Auflage deckt es exakt. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/2 h-7 w-10 -translate-x-1/2"
          >
            <HoopEmblem teil="ring" className="block h-full w-full" />
          </span>
        </div>
      </div>
    </div>
  );
}
