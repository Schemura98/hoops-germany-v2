"use client";

import { useEffect, useRef } from "react";
import {
  BallPfade,
  BALL_PX,
  BALL_R,
  rollwinkel,
} from "@/components/landing/DribbelBall";

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
//
// ══ ⚠️ „IM BILD" IST NICHT „ERREICHBAR" — der Blocker vom 21.08.2026 ════════
//
// Genau der Satz oben stand hier, und er war die Hälfte einer Wahrheit. Die
// 58-%-Marke ist im Bild — aber ob die Ziel-Oberkante dort je ANKOMMT, hängt
// daran, ob unter ihr noch genug Seite zum Scrollen übrig ist. Am untersten
// Punkt der Seite steht die Ziel-Oberkante bei `Fensterhöhe − Rest`, wobei
// `Rest` alles ist, was unter ihr noch kommt (Rest des Abschlussblocks +
// Fußzeile). Gemessen sind das rund 385 px — eine Zahl, die sich mit der
// Fensterhöhe NICHT ändert.
// Damit ist die Rechnung schlicht: Der Pass wird nur fertig, solange
// 0,42 · Fensterhöhe ≤ Rest gilt, also bis rund 917 px Fensterhöhe. Darüber
// endet die Seite mitten im Flug — auf dem iPad Pro 12,9" (1024×1366) bei 54 %,
// und dort ÜBERLAPPT der Ball die Taste um 16,8 px. Also exakt das Bild, das
// diese Datei zwei Absätze weiter unten ausschließen will (Befund Tobias B1).
//
// ⚠️ Und es ist zum dritten Mal dieselbe Achse: Breiten geprüft, der Ausfall
// hing an der HÖHE (CLAUDE.md Roadmap 20b, 20f).
//
// Behoben, ohne die Bühne wieder ins Dokument zu verlegen: Die Endmarke wird
// gegen das gehalten, was die Seite hergibt. `restUnten` ist einmal je Layout
// gemessen (Dokumenthöhe minus Ziel-Oberkante), daraus folgt pro Bild die
// tiefste erreichbare Bildschirmlage der Ziel-Oberkante — und die Endmarke ist
// die TIEFERE von beiden. Auf jedem Fenster, das schon vorher reichte, ändert
// sich dadurch nichts (die 58 % gewinnen); auf zu hohen Fenstern wird der Pass
// kürzer, aber er wird FERTIG.
// ⚠️ Ein Nebenkriterium, das nicht fehlen darf: `restUnten` ist eine Messung am
// Dokument, und der Ball darf sie nicht selbst verändern — sonst entsteht die
// Rückkopplung aus CLAUDE.md („Eine Messung darf ihre eigene Stellgröße nicht
// verändern"). Er tut es nicht: Die Zeichnung liegt `absolute` in einem
// Abschnitt mit `overflow-hidden` und trägt zur Dokumenthöhe nichts bei.
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
//   · Ist links neben der Taste genug ANLAUF (≥ ANLAUF_MIN), liegt der Ball
//     dort, auf halber Tastenhöhe.
//   · Sonst liegt er über der Taste, im Abstandsband zum Absatz darüber.
// Auf dem Desktop steht die Tastenreihe mittig in einem randlosen Abschnitt —
// da ist Platz. Mobil ist die Taste randfüllend — da ist keiner. Beides fällt
// aus dem Layout, nichts wird gesucht, nichts weicht aus.
//
// ══ ⚠️ EIN FLACHER PASS, KEIN FALL VON OBEN — Befund Kai B1 ════════════════
//
// Bis zum 21.08.2026 startete der Ball 190 px ÜBER der Taste und mittig auf ihr.
// Gemessen flog er damit auf jedem geprüften Fenster durch Überschrift und
// Absatz: 18–23 % des Fluges auf Desktop-Breiten, 43–48 % mobil.
// Damit stand im Kopf von `Dribbelweg.js` eine Regel — „Der Ball läuft WEDER
// VOR NOCH HINTER dem Text" —, die für den Weg an den Funktionen bewacht wird
// und für den Pass nicht galt. Eine Zusicherung, die auf halber Seite aufhört,
// ist keine.
//
// Kai hat die Entscheidung offen gelassen: Ausnahme hinschreiben oder umbauen.
// ENTSCHEIDUNG (Vivien): umbauen. Die Regel ist das Rückgrat dieser Fassung —
// sie ist der Grund, warum der Ausweich-Apparat aus Roadmap 20–20h entfallen
// konnte. Eine Ausnahme ausgerechnet am ZIEL der Reise würde genau die Stelle
// freistellen, an der der Ball am größten und am längsten stehen bleibt.
//
// Und sie ist ohne Apparat zu halten, weil die Ruhelage in BEIDEN Fällen schon
// in einem Band liegt, das das Layout freihält:
//   · seitlich  – links der mittig gesetzten Tastenreihe steht auf ihrer Höhe
//                 nichts; der Abschnitt ist zentriert, der Rest ist Rand.
//   · oben      – zwischen Absatz und Taste liegen 40 px Abstand (`mb-10`).
//                 Der Ball ist 20 px hoch und sitzt mittendrin.
// Der Ball fliegt deshalb WAAGERECHT in genau diesem Band herein, von links
// außerhalb des Bildes bis auf seine Ruhelage. Er verlässt das freie Band nie,
// also kann er auch nichts kreuzen — dieselbe Begründung wie beim Dribbelweg,
// eine Ebene kleiner.
// Nachgemessen über den ganzen Flug, 40 Messpunkte je Fenster, beide
// Anmeldezustände: Textberührung **0 von 40** auf 360×640, 390×844 (ausgeloggt),
// 768×1024, 1024×1366, 1280×800 und 1440×900. Vorher 7–19 von 40.
//
// ⚠️ EINE AUSNAHME, GEMESSEN UND BEWUSST STEHEN GELASSEN: 390×844 angemeldet,
// 2 von 40 Messpunkten. Der Grund ist keine Layout-Kollision — der Absatz
// darüber ist in diesem Moment noch in seiner `Reveal`-Einblendung und steht
// per `transform` 6–18 px TIEFER als sein Layoutkasten, also im Band des Balls.
// Nach ~200 ms sitzt er, und die Berührung ist vorbei. Es trifft nur den Fall
// „Ruhelage über der Taste" (mobil) und nur das eine Fenster, in dem der Block
// so kurz ist, dass die Einblendung beim Passbeginn noch läuft.
// Nicht behoben, und das ist eine Entscheidung: Der Ball dagegen abzusichern
// hieße, ihn an den LAUFZEITZUSTAND einer fremden Animation zu koppeln. Genau
// diese Kopplung ist der Kern des Apparats, den diese Fassung losgeworden ist —
// und dieselbe Datei begründet zwei Absätze weiter unten, warum sie überall
// `offsetTop` statt `getBoundingClientRect()` benutzt: weil Reveals Transform
// eine vorübergehende Verschiebung ist und keine Lage.
//
// ⚠️ Nebenbefund derselben Runde: Hier stand „Der Ball kommt von OBEN und von
// der Seite, aus der Richtung, in die der Dribbelweg zuletzt zeigte." Beide
// Hälften waren falsch. Der Start lag MITTIG auf der Taste, nicht seitlich —
// und zwischen dem letzten Dribbelpunkt und diesem Block liegen zwei ganze
// Abschnitte (Nachrichten, „So funktioniert's"). Eine Richtung kann über zwei
// Abschnitte hinweg nicht fortgesetzt werden; sie wird höchstens behauptet.
//
// ── Warum das ein Pass bleibt und kein Rollen wird ────────────────────────
// Ein flacher, harter Pass am Boden ist eine eigene, gängige Passart, und er
// ist die einzige, die zu diesem Ball passt: Der Ball dreht sich hier nicht um
// einen frei gewählten Winkel, sondern um `rollwinkel()` — Strecke durch
// Radius, dieselbe Rechnung wie auf dem Dribbelweg. Damit spricht die ganze
// Seite EINE Bewegungssprache, statt am Schluss in eine zweite zu wechseln.
//
// ══ ZURÜCKSCROLLEN ═════════════════════════════════════════════════════════
// Der Pass folgt dem Scroll in beide Richtungen. Kein Einfrieren nach der
// ersten Ankunft — das war an der Vorgängerin ein gemeldeter Darstellungs-
// fehler (Balken lief weiter, Ball klebte), und es ist auch inhaltlich falsch:
// Wer zurückscrollt, spult zurück.

const BEGINN = 0.88; // Ziel-Oberkante bei diesem Anteil der Fensterhöhe
const ENDE = 0.58;
const ABSTAND = 14; // Ruhelage zur Tastenkante — Kontur zu Kontur

// ⚠️ Hier stand `PLATZ_SEITLICH = 3 * BALL_PX` (60 px) mit der Begründung
// „Ball plus Abstand plus Luft". Das prüft, ob der Ball hinPASST — die falsche
// Frage, seit der Anflug waagerecht ist. Gemessen bleiben auf 768 px links der
// Tastenreihe 37 px Ruhelage und damit 57 px sichtbarer Anlauf: ein Antippen,
// kein Pass. Geprüft wird deshalb der ANLAUF, nicht der Platz. Reicht er nicht,
// wechselt die Ruhelage über die Taste — dort steht die volle Bildbreite als
// Anlauf zur Verfügung.
// 200 px ist die Untergrenze, ab der der Weg länger ist als zehn Balldurch-
// messer; darunter ist die Bewegung zu kurz, um als Ankunft gelesen zu werden.
const ANLAUF_MIN = 200;

// Scroll-Reserve vor dem Dokumentende. Der Pass soll fertig sein, BEVOR die
// Seite anschlägt — nicht auf dem letzten Pixel. Das letzte Stück Scrollweg
// erreicht nicht jeder (Gummiband-Effekt, Trackpad-Abbremsung, mobile
// Adressleiste, die genau dort ein- und ausfährt).
const RESERVE = 24;
// Anteil der Fensterhöhe, unter dem gar kein Flug mehr stattfindet. Bleibt
// weniger erreichbarer Scrollweg übrig, wird der Ball still an seine Ruhelage
// gesetzt — dasselbe Bild wie bei reduzierter Bewegung, das ist eine gültige,
// vollständige Aussage. Ein Flug über 20 px Scrollweg wäre ein Zucken.
const SPANNE_MIN = 0.06;

const klemm = (v, a, b) => Math.min(b, Math.max(a, v));
// Ausklingen statt gleichmäßig: Ein Pass wird abgegeben und wird langsamer,
// er beschleunigt nicht auf den Empfänger zu.
// ⚠️ QUADRATISCH, NICHT KUBISCH — angesehen, nicht gerechnet. Kubisch
// (`1-(1-f)³`) legt 91 % der Strecke in die erste HÄLFTE des Scrollfensters:
// Auf dem Standbild bei 55 % stand der Ball schon 19 px vor seiner Ruhelage,
// und die restlichen 45 % des Scrollwegs waren ein Kriechen ohne sichtbare
// Bewegung. Damit fällt ausgerechnet die ANKUNFT — der Sinn der ganzen
// Bewegung — in die Phase, in der nichts mehr passiert.
// Quadratisch bremst weiterhin deutlich ab (bei 50 % erst 75 % der Strecke),
// lässt aber das letzte Viertel des Weges auch im letzten Viertel des Scrolls
// stattfinden.
const auslauf = (f) => 1 - (1 - f) * (1 - f);

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
      const seitlich = z.x >= ANLAUF_MIN;

      const ruheX = seitlich ? z.x - ABSTAND - BALL_PX : z.x + b / 2 - BALL_R;
      const ruheY = seitlich ? z.y + h / 2 - BALL_R : z.y - ABSTAND - BALL_PX;

      // Waagerecht in der Bahn der Ruhelage, von links außerhalb des Bildes.
      // ⚠️ `startY === ruheY` ist die ganze Zusicherung: Der Ball verlässt das
      // freie Band nie, also gibt es nichts, dem er ausweichen müsste. Wer hier
      // eine Fallhöhe einbaut, holt Kais Befund B1 zurück — und zwar ohne dass
      // ein Test rot wird, denn ein Ball über Text wirft keinen Fehler.
      const startX = -BALL_PX;
      const startY = ruheY;

      // Wie viel Seite liegt UNTER der Ziel-Oberkante? Daraus folgt, wie hoch
      // die Ziel-Oberkante am untersten Punkt der Seite überhaupt steigen kann.
      // ⚠️ Absichtlich hier und nicht pro Bild: `scrollHeight` erzwingt ein
      // Layout. Einmal je Layoutänderung ist genau richtig — und `restUnten`
      // hängt selbst nicht von der Fensterhöhe ab, überlebt also jede
      // Größenänderung, die nur die Höhe betrifft.
      const zielDokY = bezug.getBoundingClientRect().top + window.scrollY + z.y;
      const restUnten = document.documentElement.scrollHeight - zielDokY;

      lageRef.current = { startX, startY, ruheX, ruheY, zielOben: z.y, restUnten };
      wrap.style.visibility = "visible";
    };

    const setzen = () => {
      tickRef.current = false;
      const L = lageRef.current;
      if (!L || !ballRef.current) return;

      const zielSchirm = ziel.getBoundingClientRect().top;
      const H = window.innerHeight || 1;

      // Die Endmarke: gewünscht 58 % der Fensterhöhe — aber nie tiefer
      // verlangt, als die Ziel-Oberkante am Seitenende überhaupt steigen kann.
      const erreichbar = H - L.restUnten + RESERVE;
      const endePx = Math.max(ENDE * H, erreichbar);
      const spanne = BEGINN * H - endePx;
      const f =
        ruhig || spanne < SPANNE_MIN * H
          ? 1
          : klemm((BEGINN * H - zielSchirm) / spanne, 0, 1);
      const e = auslauf(f);

      const x = L.startX + (L.ruheX - L.startX) * e;
      const y = L.startY + (L.ruheY - L.startY) * e;
      // ⚠️ Die Drehung ist NICHT frei gewählt (hier stand `e * 200`, eine Zahl
      // ohne Herkunft). Ein Ball, der rollt ohne zu rutschen, dreht sich um
      // Strecke/Radius — `rollwinkel()` ist dieselbe Rechnung, die schon der
      // Dribbelweg benutzt. Weil die Strecke mit `e` ausläuft, läuft auch die
      // Drehung aus: Der Ball kommt zur Ruhe, statt am Ziel weiterzuwirbeln.
      ballRef.current.setAttribute(
        "transform",
        `translate(${x.toFixed(1)} ${y.toFixed(1)}) ` +
          `rotate(${rollwinkel(x - L.startX).toFixed(1)} ${BALL_R} ${BALL_R})`,
      );
      // Deckkraft an der BILDKANTE, nicht am Fortschritt: voll deckend, sobald
      // der Ball im Bild ist (x ≥ 0), davor unsichtbar.
      // ⚠️ Vorher wurden „die ersten 12 % des Fluges" ausgeblendet. Seit der
      // Anflug waagerecht von außerhalb kommt, wäre das ein Ball, der 40–50 px
      // WEIT IM BILD noch durchsichtig ist — ein Gespenst statt eines Passes.
      // Zwei Mechanismen sagen jetzt dasselbe: Der Abschnitt hat
      // `overflow-hidden` und schneidet ohnehin ab; diese Zeile hängt nicht
      // davon ab, falls die Klasse dort einmal fällt.
      ballRef.current.style.opacity = klemm((x + BALL_PX) / BALL_PX, 0, 1).toFixed(3);
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
    // ⚠️ Zusätzlich der ganze Seitenkörper. `restUnten` ist eine Aussage über
    // die DOKUMENTHÖHE — die ändert sich auch dann, wenn dieser Abschnitt
    // gleich bleibt und weiter oben etwas nachlädt (der Nachrichten-Block holt
    // seine Meldungen erst nach dem ersten Bild). Ohne diesen zweiten Beobachter
    // rechnet der Pass mit einer Dokumenthöhe, die es nicht mehr gibt.
    beobachter.observe(document.body);
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
