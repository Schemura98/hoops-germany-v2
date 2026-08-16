"use client";

import { useEffect, useRef, useState } from "react";
import {
  BallSprite,
  BALL_SPRITE_FRAMES,
} from "@/components/landing/HeroGlyphs";
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

// ══ UNTER `md` IST DER BALL KEIN SCROLL-ELEMENT ═══════════════════════════
// Entscheidung Vivien, 15.08.2026 (fünfte Runde), und sie hat es BEWIESEN,
// nicht behauptet: Unterhalb 768px gibt es keine scroll-getriebene Lösung.
//
// Der Ball erreicht seine Ruhelage nach einem Scrollweg von
//   S_ank = Bühnenhöhe · PROGRESS_SPAN · BALL_SPAN  (= 0,3375 · Höhe)
// Damit er dann noch im Bild ist, muss `targetY >= S_ank + BALL_R + 8` gelten.
// Bei 375 sind das 311. Die EINZIGE Lücke, die einen 104px-Ball fasst, ist der
// Streifen über der Eyebrow (0..137) – sein zulässiger Mittenbereich endet bei
// 77. Die übrigen Lücken sind 64/73/16/16/96px hoch, alle zu klein.
// Es gibt schlicht keinen Wert, der beide Bedingungen erfüllt. Kein Deckel,
// kein Lückenkriterium und keine dritte Bahn ändert das: Der Inhalt füllt die
// Bühne, und die einzige freie Fläche ist der Streifen, der als erstes
// wegscrollt. Gemessen war der Ball dort an 0 von 176 Positionen sichtbar.
//
// Deshalb fällt er mobil beim LADEN in seinen Platz statt beim Scrollen, bleibt
// liegen und scrollt danach mit der Bühne weg wie jedes andere Element. Er ist
// damit im ersten BILDSCHIRM zu sehen, ohne zu scrollen – dort, wo mobil die
// meiste Aufmerksamkeit
// liegt, und ohne dass jemand scrollen muss.
const MD_BREAKPOINT = 768;
const EINFLUG_MS = 520; // Vivien: Vorlauf vor der Headline nicht verspielen

// Anzeigegröße des Hero-Balls. Seit dem 15.08.2026 (Auftrag Patrick: "groß")
// eine gerenderte Bildsequenz statt des 28px-Vektors – erst in dieser Größe
// ist überhaupt zu sehen, dass die Nähte über eine Kugel wandern.
// Mobil kleiner, weil der Ball sonst mehr als ein Drittel der Breite belegt und
// die Headline erdrückt, die er eigentlich begleiten soll.
// Die Größe steht als Tailwind-Klasse an der Komponente (mobil 72px (h-[72px]) — Entscheidung Vivien 16.08.2026, s. u., ab md
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
// ══ WAS DIE ABDUNKELUNG ABSICHERT — UND WAS SIE NICHT IST ═══════════════════
// Regel Vivien (16.08.2026), nachdem Kai gemessen hatte, dass die minimale
// Ball-Deckkraft auf 320–430px über den GESAMTEN Scrollweg 1,00 beträgt:
//
//   Die Abdunkelung sichert die REISE des Balls ab, nicht seine RUHELAGE.
//   Wo der Ball keine scroll-gesteuerte Strecke hat – heute unterhalb 768px –,
//   MUSS die minimale Deckkraft über den gesamten Auftritt 1,00 messen. Ein
//   Wert darunter ist dort kein Effekt, sondern der Nachweis einer fehlerhaften
//   Platzierung.
//
// ⚠️ DIESE MECHANIK IST DESHALB NICHT TOT UND DARF NICHT ENTFERNT WERDEN.
// Ab 768 fällt der Ball scroll-gesteuert durch die ganze Bühne und kreuzt
// Zeilen und Flächen, die keine Platzierungslogik vorher wegräumen kann – dort
// trägt sie. Mobil ist `tb` konstant 1: Der Ball kommt in 520 ms senkrecht in
// eine Lage, welche die Streifenlogik per Konstruktion freihält. Es gibt schlicht
// nichts zu überqueren. Sie ist breitenunabhängig geschrieben und wird in dem
// Moment wieder tragend, in dem mobil je wieder eine Fallstrecke entsteht.
//
// ⚠️ UND DER SATZ, DER DIE VIER RUNDEN DAVOR ZUSAMMENFASST (Vivien):
//   Ein gedimmter Ball ist eine misslungene Platzierung, kein Stilmittel.
// Die gedämpfte Anwesenheit war nie die gewollte Wirkung – sie war der Preis
// dafür, dass der Ball sich ein Rechteck mit Schrift teilen musste (Tobias:
// „Barrierefreiheit gewonnen, Wirkung verloren", mittlere Deckkraft 0,66 → 0,36).
// Lückensuche und Streifenlage existieren nur, um diesen Preis nicht mehr zu
// zahlen. Ihn nach dem Erfolg freiwillig wieder zu zahlen, machte vier Runden
// rückgängig.
const TEXT_DIM_FLOOR = 0.2;

// ⚠️ WIRFT bei invertierten Grenzen, statt still `max` zu liefern (Befund Kai,
// dritte Runde). `Math.min(max, Math.max(min, v))` gibt bei `min > max`
// wortlos `max` zurück – die Fehlerklasse aus CLAUDE.md Roadmap 15 (5):
// „die Hilfsfunktion soll WERFEN statt still etwas Falsches zu liefern".
// ⚠️ Die frühere Begründung („real erreichbar an einem gezogenen Fenster")
// galt der alten äußeren Klammer der Bahnwahl und ist mit der höhenbewussten
// Wahl entfallen – Kai hat alle acht Aufrufstellen durchgerechnet, keine kann
// `min > max` erreichen. Der Wurf bleibt trotzdem: Eine Hilfsfunktion, die
// still etwas Falsches liefert, ist genau die Fehlerklasse aus Roadmap 15 (5),
// und die nächste Aufrufstelle kennt diese Rechnung nicht.
const clamp = (v, min, max) => {
  if (min > max) {
    throw new RangeError(
      `clamp: untere Grenze ${min} liegt über der oberen ${max} – ` +
        `das Ergebnis wäre stillschweigend falsch statt erkennbar kaputt.`,
    );
  }
  return Math.min(max, Math.max(min, v));
};

// Deckkraft des Balls in Abhängigkeit vom Textblock: Auf Höhe von Badge/Headline/
// Subline blendet er VOLLSTÄNDIG aus (nicht nur abgesenkt – eine reduzierte
// Deckkraft würde das Flackern hinter den Buchstaben nur abschwächen, nicht lösen).
// Wird zur Laufzeit gemessen und ist damit breitenunabhängig: Zeilenumbrüche lassen
// sich nicht verlässlich vorhersagen, deshalb kein Sonderwert je Breakpoint.
// Entscheid Vivien 11.08.2026 auf Tobias' Befund bei 430px.
// ⚠️ PRÜFT SEIT DEM 15.08.2026 AUCH X, UND ZEILENGENAU (Vivien, Roadmap 20 a).
// Zwei Korrekturen an derselben Funktion, beide von ihr:
//  1. Sie verglich ausschließlich `ballCenterY` – die waagerechte Lage kam nie
//     vor. Gemessen: Bei 1280/scrollY 585 stand der Ball auf x = 1141, überlappte
//     KEINE Inhaltszeile und war trotzdem auf 0,20 gedimmt.
//  2. Sie prüfte gegen die HÜLLBOX des Inhaltsblocks statt gegen die echten
//     Zeilen. Bei 768 überlappte das Ball-Band die Hüllbox fast die ganze Reise,
//     obwohl an dieser x-Position keine einzige Zeile stand – daher die 28 %
//     heller Messpunkte.
// Jetzt läuft sie über alle Kästen (Textzeilen + ganze Bedienelemente) und nimmt
// das Minimum: Es zählt der ungünstigste Kasten, nicht der erste.
function ballDeckkraftUeberKaesten(
  ballOben,
  ballUnten,
  kaesten,
  ballLinks,
  ballRechts,
) {
  let kleinste = 1;
  for (const k of kaesten) {
    if (ballRechts < k.left || ballLinks > k.right) continue;
    // ⚠️ NUR ECHTE ÜBERLAPPUNG DUNKELT AB (Entscheidung Vivien, fünfte Runde).
    // Vorher rampte die Deckkraft schon im ANFLUG: sobald die Ballkante 24px
    // an einen Kasten heranreichte. Das erzeugte einen Widerspruch zwischen
    // zwei Mechanismen, die beide recht zu haben glaubten – die Lückensuche
    // garantiert per Konstruktion, dass die RUHELAGE keinen Kasten schneidet,
    // und dieselbe Position wurde trotzdem auf 0,40 gedimmt. Gemessen bei
    // 768x1024: Ballkante 6px von der Subline, also mitten im Anflugfenster.
    // Viviens Satz dazu: Jede Abdunkelung in der Ruhelage ist definitionsgemäß
    // falsch – sie kann nur aus einer Näherung stammen, nicht aus Überlappung.
    // Die Weichzeichnung bleibt, sie sitzt jetzt im KONTAKT statt im Anflug:
    // Rampe über die ersten `TEXT_FADE_MARGIN` Pixel Eindringtiefe.
    const eindringen =
      Math.min(ballUnten, k.bottom) - Math.max(ballOben, k.top);
    if (eindringen <= 0) continue; // keine Überlappung ⇒ kein Grund
    // ⚠️ SCHALTFLÄCHEN DIMMEN SOFORT VOLL, TEXTZEILEN RAMPEN.
    // Beides sind Entscheidungen von Vivien, die einander an dieser Stelle
    // widersprachen: „nur echte Überlappung dunkelt ab" (fünfte Runde) gegen
    // „eine Schaltfläche wird ANGESTEUERT, nicht gelesen — ⚠️ KORREKTUR Kai: NICHT „gefüllte Fläche“. Gemessen ist nur „Als Spieler registrieren“ deckend (rgb(240,122,39)); dahinter ist der Ball ohnehin unsichtbar. „Team gründen“ und „Teams entdecken“ sind rgba(0,0,0,0) — DORT entsteht das Kontrastproblem, und dort ist Tobias’ Befund entstanden. Die Regel wirkt richtig; wer aber aus der alten Begründung heraus den nächsten Kasten einordnet, ordnet ihn falsch ein, der Ball dahinter ist ein
    // Kontrastproblem über die ganze Pille" (zweite Runde). Mit der reinen
    // Eindringtiefen-Rampe stand der Ball bei 1px Überlappung noch auf 0,97 –
    // und genau darüber ist die Kontrastregression entstanden, gegen die diese
    // Funktion gebaut wurde (1,67:1 statt 4,5:1 auf „Teams entdecken").
    // Bei einer Textzeile ist eine streifende Berührung dagegen kein
    // Kontrastproblem; dort trägt die Rampe.
    const f = k.flaeche ? 1 : Math.min(1, eindringen / TEXT_FADE_MARGIN);
    const d = 1 - f * (1 - TEXT_DIM_FLOOR);
    if (d < kleinste) kleinste = d;
  }
  return kleinste;
}

export default function HeroScrollStage({
  inhaltRef,
  className = "",
  children,
}) {
  const stageRef = useRef(null);
  const arcRef = useRef(null);
  // Einmal beim Aufsetzen eingesammelt statt pro Frame abgefragt: querySelectorAll
  // in der rAF-Schleife wäre ein Layout-/Baum-Zugriff pro Bild.
  const linienRef = useRef([]);
  const punkteRef = useRef([]);
  const ballRef = useRef(null);
  const eingeflogenRef = useRef(false); // mobiler Ladeauftritt: nur einmal
  // ⚠️ ZWEI SCHREIBER AUF EINEM ELEMENT BRAUCHEN EINEN SCHIEDSRICHTER
  // (Befund Kai, fünfte Runde). `schritt` (Einflug) und `apply` (Scroll)
  // schrieben beide `style.transform`, ohne voneinander zu wissen. Ein Scroll
  // oder Resize während der 520ms ließ `apply` mitten in den Flug schreiben:
  // gemessen zwei verschiedene y-Werte IN EINEM FRAME, unter Dauerscroll ein
  // Vorwärtssprung von 110px auf die Endlage und Rückwärtssprünge bis 19,5px.
  // Die mobile URL-Leiste löst beim Scrollen selbst ein `resize` aus – es
  // braucht dafür keine ungewöhnliche Bedienung.
  // Solange `einflugAktivRef` steht, gehört der Ball dem Einflug allein.
  const einflugAktivRef = useRef(false);
  // ⚠️ UND DER EINFLUG DARF ERST STARTEN, WENN DIE KÄSTEN ENDGÜLTIG SIND.
  // Er friert `zielY` beim Start ein. Startete er während der Reveal-Übergänge,
  // fröre er die um 20px verschobene Lage ein – genau Tobias' B1. Mein erster
  // Fix hat nur nachgemessen und damit aus der stillen Fehlplatzierung einen
  // SICHTBAREN Satz gemacht: Ball landet, steht 300ms, springt 20px (Kai).
  const kaestenFinalRef = useRef(false);
  // Meldet den unmöglichen Streifen EINMAL, nicht in jedem Frame.
  const streifenGemeldetRef = useRef(false);
  const kaestenRef = useRef([]); // Zeilen-/Elementkaesten des Inhalts, s. kaestenBauen
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

    // ══ INHALTSKÄSTEN: ZEILENGENAU, NICHT ALS HÜLLBOX ═══════════════════════
    // Korrektur Vivien vom 15.08.2026, zweite Runde – und ihr eigener Befund:
    // Die erste Fassung rechnete gegen das UMSCHLIESSENDE RECHTECK des
    // Inhaltsblocks und argumentierte, als wäre es die erste Textzeile. Das ist
    // nicht dasselbe. Der Block ist die Hüllbox über mittig gesetzte Zeilen sehr
    // unterschiedlicher Länge – bei 375 reicht er von x 24 bis 351 und von
    // y 96 bis 671, die Tinte darin steht ganz woanders.
    //
    // Die Folge war messbar: Bei 768 überlappte das Ball-Band (x 627–803) die
    // HÜLLBOX auf 627–744 über deren gesamte Höhe. Der Ball galt damit fast die
    // ganze Reise als „über Inhalt" und wurde abgedunkelt – obwohl an seiner
    // x-Position die erste echte Zeile erst bei y 246 beginnt und er bei y 150
    // stehen bleibt. Genau daher kamen die 28 % heller Messpunkte bei 768.
    //
    // ⚠️ ZWEI ARTEN VON KÄSTEN, und der Unterschied ist keine Bequemlichkeit:
    //   • Text → ZEILENkästen (`Range.getClientRects()`). Eine Zeile ist so
    //     breit wie ihre Tinte, nicht wie ihr Container.
    //   • Bedienelemente → GANZE Elementkästen. Eine Schaltfläche ist eine
    //     gefüllte Fläche; der Ball hinter der orangen Pille ist ein
    //     Kontrastproblem über die ganze Fläche, nicht nur über der Schrift.
    //
    // ⚠️ DIESER KOMMENTAR HAT FRÜHER GELOGEN (Befund Kai, dritte Runde).
    // Hier stand „einmal beim Aufsetzen und bei load/resize gebaut". Tatsächlich
    // läuft der Neubau bei JEDEM Scroll-Ereignis – und das ist nicht Verschwendung,
    // sondern TRAGEND: `LandingHero` tauscht den Zweig, sobald die Auth-Prüfung
    // auflöst (drei Schaltflächen in einer Reihe → fünf in zwei Reihen, anderer
    // Headline-Text). Der Effekt läuft dabei nicht neu, weil seine Abhängigkeiten
    // stabil sind. Ohne den Scroll-Neubau beschrieben die Kästen ab da dauerhaft
    // das AUSGELOGGTE Layout – und zwar in genau der Variante, in der Tobias'
    // Kontrastbefund entstand.
    // Wer diesen Aufruf aus `onScrollOrResize` entfernt, bricht die eingeloggte
    // Startseite, und kein Test merkt es (keiner lädt `/` eingeloggt).
    // Kosten gemessen (Kai): 0,024ms je Ereignis, 0,3 % eines Kerns; mit 6facher
    // CPU-Drosselung 1,6 %. Skaliert mit der Inhaltsgröße, nicht mit der
    // Scrollfrequenz.
    const kaestenBauen = () => {
      const inhalt = inhaltRef?.current;
      if (!inhalt) {
        kaestenRef.current = [];
        return;
      }
      // ⚠️ SOFORT BÜHNENRELATIV ABLEGEN (Befund Vivien, dritte Runde).
      // Die erste Fassung legte die rohen Viewport-Rechtecke ab und verrechnete
      // sie in `apply()` gegen ein `rect`, das jeden Frame neu gemessen wird.
      // Die Kästen waren damit auf den Aufsetz-Zeitpunkt EINGEFROREN, während
      // ihr Bezugspunkt mitscrollte – der Versatz war also nicht einmal
      // konstant, er wuchs mit dem Scrollweg.
      // Sichtbar wurde er nur bei 768: Dort hat die `items-center`-Zentrierung
      // 111px Spielraum. Bei 375/390/430 ist der Inhalt so hoch wie die Bühne
      // (575 + 192 = 767), es gibt keinen Spielraum, und bühnenrelativ war
      // zufällig dasselbe wie containerrelativ – deshalb stimmte dort alles.
      // Bei 1024+ deckte der 0.42-Deckel den Fehler zu.
      // Bühnenrelative Kästen sind scroll-invariant: einmal gemessen, immer gültig.
      const sr = stage.getBoundingClientRect();
      const relativ = (r) => ({
        top: r.top - sr.top,
        bottom: r.bottom - sr.top,
        left: r.left - sr.left,
        right: r.right - sr.left,
      });
      // ══ FLÄCHE ODER TINTE — NICHT „BEDIENBAR ODER TEXT" ═══════════════════
      // Entscheidung Vivien (16.08.2026). Die alte Achse hieß `taste` und
      // fragte nach BEDIENBARKEIT. Das war zweimal falsch:
      //   · Kai maß nach, dass von den drei Schaltflächen nur „Als Spieler
      //     registrieren" gefüllt ist (rgb(240,122,39)) – dahinter liegt der
      //     Ball ohnehin unsichtbar. Die beiden anderen sind rgba(0,0,0,0),
      //     und DORT entstand Tobias' Kontrastbefund von 1,67:1.
      //   · Vivien maß nach, dass das orange Eyebrow-Badge – ein `span`, also
      //     nach alter Achse gar kein Kasten – nur über seine TEXTZEILEN
      //     einging. Die sind durch `px-4` beidseitig 16px schmaler als die
      //     gezeichnete Fläche: gemessen 291, gezeichnet 307. Der Kastenbau
      //     untertrieb eine gefüllte Fläche um 32px Breite, und der Hero-Ball
      //     stand dadurch auf 375 nur **2,65px** neben ihr.
      // Die richtige Achse ist deshalb, was Vivien so formuliert hat:
      //
      //   Ein Kasten wird als Ganzes geschützt, wenn seine Grenze eine Fläche
      //   behauptet — eine Taste, ein Badge, ein Panel. Eine Textzeile ist nur
      //   so breit wie ihre Tinte.
      //
      // Mitglieder sind daher `a`/`button` UND jedes Element mit einer nicht
      // durchsichtigen Hintergrundfarbe.
      const kaesten = [];
      const flaechen = new Set(inhalt.querySelectorAll("a, button"));
      for (const el of inhalt.querySelectorAll("*")) {
        if (flaechen.has(el)) continue;
        const bg = getComputedStyle(el).backgroundColor;
        // `transparent` und `rgba(…, 0)` sind beide durchsichtig; alles andere
        // zeichnet eine Fläche, hinter der der Ball nichts beiträgt.
        if (!bg || bg === "transparent") continue;
        // ⚠️ NUR `rgba(…)` MIT VIER TEILEN HAT EIN ALPHA (Befund Kai).
        // Die erste Fassung `/^rgba?\([^)]*?,\s*([\d.]+)\s*\)$/` griff bei
        // `rgb(r,g,b)` den **Blau-Kanal** als Alpha ab: `rgb(0,0,0)` und jedes
        // `rgb(x,y,0)` galt damit als durchsichtig und verlor seinen
        // Flächen-Schutz. Heute latent – kein Landing-Farbwert hat Blau 0 –,
        // aber ein einziges `bg-black` hätte genügt.
        const a =
          /^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/.exec(
            bg,
          ) || /^rgba?\([^/)]*\/\s*([\d.%]+)\s*\)$/.exec(bg); // moderne Schreibweise
        if (a && parseFloat(a[1]) === 0) continue;
        flaechen.add(el);
      }
      for (const el of flaechen) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0)
          kaesten.push({ ...relativ(r), flaeche: true });
      }
      // Textknoten außerhalb der Flächen – deren Ausdehnung ist schon erfasst.
      const knotenLauf = document.createTreeWalker(
        inhalt,
        NodeFilter.SHOW_TEXT,
      );
      for (let k = knotenLauf.nextNode(); k; k = knotenLauf.nextNode()) {
        if (!k.nodeValue || !k.nodeValue.trim()) continue;
        let drin = false;
        for (const el of flaechen) {
          if (el.contains(k)) {
            drin = true;
            break;
          }
        }
        if (drin) continue;
        const bereich = document.createRange();
        bereich.selectNodeContents(k);
        for (const r of bereich.getClientRects()) {
          if (r.width > 0 && r.height > 0)
            kaesten.push({ ...relativ(r), flaeche: false });
        }
      }
      kaestenRef.current = kaesten;
    };
    kaestenBauen();

    // ⚠️ NOCH EINMAL, WENN `Reveal` FERTIG IST (Befund Tobias B1, fünfte Runde).
    // Die Kästen wurden gegen ein Layout gemessen, in dem `Reveal` die Headline
    // noch um 20px nach unten versetzt hatte (`translate-y-5`, am `h1` als
    // `matrix(1,0,0,1,0,20)` messbar). Die mobile Ruhelage saß dadurch 20px zu
    // tief – gemessen ÜBERLAPPTE der Ball die erste Headline-Zeile um 10px –
    // und sprang beim ersten Scrollereignis in einem einzigen Bild nach oben,
    // sobald der Neubau die echten Kästen sah. Reproduziert in 28 von 28
    // Läufen, auch unter 4facher und 6facher CPU-Drosselung.
    // ⚠️ AUF DAS EREIGNIS WARTEN, NICHT AUF EINE ZEITSPANNE: Die Verzögerungen
    // der einzelnen `Reveal`-Elemente sind gestaffelt und ändern sich mit dem
    // Inhalt. Eine Wartezeit wäre genau die Sorte Zahl, die später still nicht
    // mehr passt.
    // ⚠️ WARUM EIN rAF-ABTASTEN UND KEIN `transitionend`: Das Ereignis feuert
    // pro Eigenschaft und pro Element, es feuert GAR NICHT, wenn keine
    // Übergänge laufen (reduzierte Bewegung, Wiederkehr aus dem Cache), und es
    // sagt nichts über die GESCHWISTER. Ein erster Entwurf hörte darauf und
    // brauchte trotzdem einen 1200-ms-Rückfall daneben – zwei Wege für eine
    // Frage. Hier wird stattdessen der Zustand selbst geprüft, den wir meinen:
    // Steht der Inhalt still? Das ist in allen drei Fällen dieselbe Antwort.
    const AUFGEBEN_MS = 1500;
    const beginnWartenRef = { current: performance.now() };
    let warteRaf = 0;
    const stehtStill = () => {
      const h1 = stage.querySelector("h1");
      if (!h1) return true;
      const t = getComputedStyle(h1).transform;
      return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
    };
    // ⚠️ GENAU EIN BEOBACHTER, UND ZWAR NACH DER FINALISIERUNG
    // (Befund Kai, siebte Runde — mein erster Entwurf war dreifach falsch).
    // Er stand INNERHALB des Warte-Zweigs, vor dessen `return`: Er entstand
    // also nur, solange `Reveal` noch lief, und dort **in jedem Bild neu**.
    // Kai hat es gezählt: **48 erzeugt, 48 `observe()`, 0 `disconnect()`** je
    // Ladevorgang — und nach der Finalisierung existierte **gar keiner**, weil
    // der Zweig nie wieder betreten wird. Trennen konnte ihn auch niemand: Die
    // Konstante war für die Aufräumfunktion unerreichbar.
    // Für den Fall, für den ich ihn gebaut habe — den Auth-Tausch —, waren
    // damit BEIDE Ausgänge falsch: 48-fach (Knoten wiederverwendet) oder null
    // (Knoten ersetzt).
    // ⚠️ UND ER BEOBACHTET DIE BÜHNE, NICHT DEN GETAUSCHTEN KNOTEN. Hinge er an
    // `inhaltRef`, wäre dessen eigene Entfernung für ihn unsichtbar — genau der
    // Fall, den er melden soll.
    // Entwarnung aus derselben Messung: `Reveal`-Klassenwechsel und
    // Textänderungen (`CountUp`) lösen ihn NICHT aus, nur `childList`.
    let inhaltBeobachter = null;
    const kaestenFinalisieren = () => {
      if (
        !stehtStill() &&
        performance.now() - beginnWartenRef.current < AUFGEBEN_MS
      ) {
        warteRaf = requestAnimationFrame(kaestenFinalisieren);
        return;
      }
      kaestenBauen();
      kaestenFinalRef.current = true;
      onScrollOrResize(); // startet damit auch den mobilen Einflug
      if (!inhaltBeobachter) {
        inhaltBeobachter = new MutationObserver(() => {
          // NICHT beim Feuern trennen – der Zweig kann mehr als einmal wechseln.
          kaestenFinalRef.current = false;
          beginnWartenRef.current = performance.now();
          cancelAnimationFrame(warteRaf);
          warteRaf = requestAnimationFrame(kaestenFinalisieren);
        });
        inhaltBeobachter.observe(stage, { childList: true, subtree: true });
      }
    };
    warteRaf = requestAnimationFrame(kaestenFinalisieren);

    const apply = () => {
      tickingRef.current = false;
      const rect = stage.getBoundingClientRect();
      if (rect.height <= 0) return;

      const t = clamp(
        (NAVBAR_HEIGHT - rect.top) / (rect.height * PROGRESS_SPAN),
        0,
        1,
      );

      if (arcRef.current)
        arcRef.current.style.opacity = (t * ARC_MAX).toFixed(3);

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

      const ball = ballRef.current;
      // ⚠️ KEIN `ctaRef` mehr (Befund Kai, dritte Runde). Der Ball zielt seit
      // Viviens Bahn-Entscheidung nicht mehr auf die Schaltfläche; die Prop
      // wurde noch durchgereicht und stand in der Abhängigkeitsliste, ohne je
      // gelesen zu werden – sie hielt `LandingHero` im Glauben, sie sei nötig.
      // Vorher stand hier zusätzlich `if (!cta || ...) return;`: Ohne CTA hätte
      // es gar keinen Ball gegeben, was heute eine willkürliche Kopplung wäre.
      if (!ball) return;

      // Radius am Element gemessen, nicht angenommen – s. Kommentar oben.
      // ⚠️ KEIN STILLER ERSATZWERT (Befund Kai): `|| 1` lieferte bei fehlender
      // Größe einen Radius von 1px und rechnete damit die ganze Bahn falsch –
      // dieselbe Klasse, die `clamp` seit Runde drei durch einen Wurf ersetzt.
      // Hier ist Aussetzen richtig statt Werfen: Vor dem ersten Layout hat das
      // Element legitim keine Breite, und der nächste Frame hat sie.
      if (!ball.offsetWidth) return;
      const BALL_R = ball.offsetWidth / 2;

      // ══ DER BALL VERLÄSST DIE TEXTSPALTE ══════════════════════════════════
      // Entscheidung Vivien, 15.08.2026 (Roadmap 20 a/c). Sie hat drei Befunde
      // auf EINE Ursache zurückgeführt: Der Ball zielte auf die primäre
      // Schaltfläche. Für einen 14px-Glyph war das ein Abzeichen mit Witz – bei
      // 104–176px ist es ein Gegenstand auf der wichtigsten Taste der Seite.
      // Gemessen: Bei 375 ruhte der Ball auf y 401–505, die Taste liegt auf
      // 455–515 – die untere Ballhälfte deckte 50 der 60px Tastenhöhe.
      //
      // Und es gibt keinen Deckkraftwert, der das löst: hoch = Kontrast kaputt,
      // niedrig = der texturierte Körper liest sich hinter weißer Display-Type
      // nicht als Ball, sondern als Fleck. Material und Grund sind im selben
      // Rechteck unvereinbar.
      //
      // Deshalb ruht er jetzt im FREIEN FELD, am rechten Bühnenrand, bewusst
      // angeschnitten. Welche Bahn, entscheidet die gemessene Geometrie – kein
      // Breakpoint, sondern der tatsächliche Platz neben dem Inhalt. Der
      // Umschalter fällt dadurch von selbst auf ~1280px, also genau auf `xl`;
      // das ist kein Zufall, sondern der Breakpoint der Fortschritts-Leiste
      // (s. Übergabe weiter unten).
      // ⚠️ 20 % ANSCHNITT SIND ABSICHT, KEIN MANGEL (Vivien, Roadmap 20 c).
      // Ein Kreis, der vollständig im Rahmen liegt, liest sich als Grafik. Ein
      // Kreis, den der Rahmen schneidet, liest sich als Körper, der zufällig
      // gerade da ist – der Rahmen wird zum Fenster. Die 3 % Restsichtbarkeit
      // von vorher waren kein Anschnitt, das war ein Verschwinden.
      const targetX = rect.width - 0.6 * BALL_R;

      // ══ EIN BEGRIFF STATT ZWEI BAHNEN (Vivien, zweite Runde) ═══════════════
      // Die erste Fassung teilte in „seitliche" und „obere Bahn" und entschied
      // über `freiRechts` – einen Breitenvergleich gegen die Hüllbox. Das ist
      // ersetzt: „Schneidet ein Inhaltskasten das Ball-Band in x?" IST der Test
      // auf die seitliche Bahn, und er ist strikt besser, weil er die echten
      // Zeilen kennt statt eines Rechtecks über alle Zeilen.
      // Ohne Kollision fällt `kollisionT` auf Infinity und der 0.42-Deckel
      // greift – daher braucht es keine Fallunterscheidung mehr.
      // ══ LÜCKENSUCHE STATT „ÜBER DEN OBERSTEN KASTEN" ══════════════════════
      // Freigegeben von Vivien (dritte Runde) unter einer Bedingung, die
      // eingehalten ist: erst der Ursprungsfehler, dann die Lückensuche. Ihre
      // Begründung dafür ist der interessanteste Teil – die Lückensuche hätte
      // den Ursprungsfehler ZUGEDECKT: Sie hätte mit den versetzten Kästen eine
      // Lücke gefunden, „frei" gemeldet und den Ball an die falsche Stelle
      // gesetzt. Grün, und trotzdem falsch.
      //
      // Warum sie danach nötig ist: „Der Ball geht über den obersten Kasten"
      // scheitert, sobald über dem obersten Kasten kein Platz ist. Gemessen bei
      // 768: erste Headline-Zeile bei y 140..254 (114px hoher Zeilenkasten,
      // Display-Font mit leading-[0.9]), gebraucht werden `2 * BALL_R + 16` = 192.
      // Vorher fiel dann stillschweigend die untere Klammer ein, der Ball ruhte
      // ÜBERLAPPEND, und die Abdunkelung kaschierte es. Jetzt stellt der Code
      // die Frage „passt er da überhaupt hin?", statt sie zu übergehen.
      //
      // Band und Kästen sind beide bühnenrelativ – kein `rect.left`/`rect.top`
      // in der Rechnung, und damit keine Mischung zweier Bezugssysteme.
      const bandLinks = targetX - BALL_R;
      const bandRechts = targetX + BALL_R;

      // Belegte y-Intervalle im Band, sortiert und verschmolzen.
      const belegt = [];
      // `k` hieß hier dreimal etwas anderes in einer Anweisung (Kasten im
      // filter, Kasten im map, Intervall in der for-Kopfzeile) – dieselbe
      // Klasse wie das doppelte `lauf` aus Runde 3 (Befund Kai K9).
      for (const [oben, unten] of kaestenRef.current
        .filter(
          (kasten) => !(kasten.right < bandLinks || kasten.left > bandRechts),
        )
        .map((kasten) => [kasten.top, kasten.bottom])
        .sort((a, b) => a[0] - b[0])) {
        const letztes = belegt[belegt.length - 1];
        if (letztes && oben <= letztes[1])
          letztes[1] = Math.max(letztes[1], unten);
        else belegt.push([oben, unten]);
      }

      // ⚠️ +8 RESERVIERT DEN ÜBERSCHWINGER (Vivien, fünfte Runde): Der
      // Aufsetzer geht 4px nach unten, und bei 375 hat der Ball zur ersten
      // Zeile nur rund 10px Luft. Ohne die Reserve berührt ausgerechnet der
      // schönste Frame die Headline.
      const noetig = 2 * BALL_R + 16 + 8;

      // ══ DIE RUHELAGE HÄNGT AN DER FENSTERHÖHE, NICHT AN DER BÜHNE ═════════
      // Entscheidung Vivien (fünfte Runde) – und der Befund, der vier Runden
      // gekostet hat: Wir haben nur BREITEN geprüft, der Ausfall hing an der
      // HÖHE. Deshalb konnten zwei Messungen derselben Breite beide stimmen und
      // sich widersprechen (768x812 grün, 768x1024 rot).
      //
      // Der frühere `0.42`-Deckel war ein Anteil der BÜHNENhöhe. Die Bühne ist
      // `calc(100vh - 4rem)`, wächst also mit dem Fenster – und mit ihr der
      // Scrollweg bis zur Ankunft:
      //     S_ank = Bühnenhöhe * PROGRESS_SPAN * BALL_SPAN
      // Bei 768x1024 sind das 324px, der Ball müsste also mindestens auf
      // `S_ank + BALL_R + 8` = 412 ruhen; gebaut war 148. Ergebnis: iPad
      // hochkant zeigte ihn an 0 von 29 Messpunkten. Bei einem kürzeren Fenster
      // derselben Breite war derselbe Code grün.
      //
      // `sichtMitte` ist dagegen von Bauart höhenbewusst: Beide Größen ziehen
      // die Fensterhöhe mit, die Ruhelage wandert automatisch mit.
      const sichtHoeheJetzt = window.innerHeight || 1;
      const sAnk = rect.height * PROGRESS_SPAN * BALL_SPAN;
      const sichtUnten = sAnk + BALL_R + 8;
      const sichtMitte = sAnk + (sichtHoeheJetzt - NAVBAR_HEIGHT) / 2;

      // Alle Lücken im Band – nicht nur die erste. Aus jeder wird der zulässige
      // Bereich für die BALLMITTE; tauglich ist eine Lücke nur, wenn dieser
      // Bereich bis in den bei Ankunft sichtbaren Teil reicht.
      const tauglich = [];
      let unterkante = 0;
      const pruefen = (oben, unten) => {
        if (unten - oben < noetig) return;
        const bis = unten - BALL_R - 8;
        if (bis < sichtUnten) return; // bei Ankunft komplett über dem Bild
        tauglich.push({ von: Math.max(oben + BALL_R + 8, sichtUnten), bis });
      };
      for (const [oben, unten] of belegt) {
        pruefen(unterkante, oben);
        unterkante = Math.max(unterkante, unten);
      }
      pruefen(unterkante, rect.height);

      // Die Lücke, deren zulässiger Bereich `sichtMitte` am nächsten liegt.
      // ⚠️ „nächstgelegene", nicht „oberste" – Absicht: Bei 768 hätte die
      // oberste zwar eine sichtbare Lage ergeben, aber auf gleicher Höhe wie
      // das orange „COMMUNITY". Die Regel löst Tobias' Kompositionspunkt damit
      // mit, statt ihn zu einer Extraregel zu machen.
      let gewaehlt = null;
      for (const l of tauglich) {
        const abstand =
          sichtMitte < l.von
            ? l.von - sichtMitte
            : sichtMitte > l.bis
              ? sichtMitte - l.bis
              : 0;
        if (!gewaehlt || abstand < gewaehlt.abstand)
          gewaehlt = { ...l, abstand };
      }

      // Mobil bleibt es beim Ladeauftritt im obersten Streifen: Dort gibt es
      // keinen Scrollweg bis zur Ankunft, `S_ank` ist gegenstandslos.
      const mobil = window.innerWidth < MD_BREAKPOINT;
      const obersterKasten = belegt.length ? belegt[0][0] : rect.height;
      // ⚠️ DIE KLAMMER DARF DEN UNMÖGLICHEN FALL NICHT GLÄTTEN
      // (Befund Vivien, 16.08.2026 – unabhängig von allem anderen zu tun).
      // `imStreifen` hängt den Ball 8px ÜBER den obersten Kasten. Passt er dort
      // nicht hin, fing die untere Klammer das bisher STILLSCHWEIGEND ab und
      // legte ihn überlappend hin – genau die Fehlerklasse, gegen welche die
      // Lückensuche gebaut wurde, im mobilen Zweig überlebt.
      // Wie knapp das ist – ⚠️ MIT DER RICHTIGEN BREITE (Korrektur Kai,
      // sechste Runde): Die Werte 49/44 stammen von **320×568**, nicht von 375.
      // Bei **375** liegt die Ist-Lage bei 93 und die Reserve bei **49px** –
      // Faktor zehn. Und 320 liegt laut Roadmap 20b (b) ausdrücklich AUSSERHALB
      // des Zielbereichs. Der Kommentar ließ die Lage im unterstützten Bereich
      // zehnmal dringlicher aussehen, als sie ist.
      // Auf 320 sind es also fünf Pixel, und das ist dort kein Sicherheitsabstand,
      // sondern ein Zufall – ein anderer Zeilenumbruch, eine andere Schriftmetrik nach
      // einem Font-Update oder ein zusätzliches Wort im Eyebrow genügen, und
      // der Ball liegt still auf dem Badge, von der Abdunkelung kaschiert.
      // Dasselbe Register wie `clamp`, das seit der dritten Runde wirft statt
      // still `max` zu liefern.
      const noetigOben = 2 * BALL_R + 16;
      const imStreifen = clamp(
        obersterKasten - BALL_R - 8,
        BALL_R + 8,
        Math.max(BALL_R + 8, rect.height - BALL_R - 8),
      );
      // ⚠️ DIE WARNUNG ERST HIER, UND NUR WENN `imStreifen` WIRKLICH GILT
      // (Befund Kai, sechste Runde). Sie stand vorher vor der Zielwahl und
      // feuerte damit auch am Desktop – wo bei vorhandener Lücke `imStreifen`
      // gar nicht benutzt wird. Die Meldung „Der Ball wird überlappend
      // platziert" wäre dort schlicht FALSCH gewesen: eine Diagnose, die einen
      // Fehler behauptet, den es nicht gibt, ist so schädlich wie eine, die
      // schweigt.
      const nutztStreifen = mobil || !gewaehlt;
      if (
        nutztStreifen &&
        obersterKasten < noetigOben &&
        !streifenGemeldetRef.current
      ) {
        streifenGemeldetRef.current = true;
        // Kein Wurf: Das hier läuft im Scroll-Pfad einer Live-Seite, ein
        // Ausnahmefehler nähme dem Leser die Startseite. Aber es schweigt nicht.
        // ⚠️ Die Meldung nennt BEIDE Stellschrauben, nicht nur den Defekt –
        // sonst findet der nächste Leser eine Fehlermeldung ohne Ausweg.
        console.error(
          `[HeroScrollStage] Der obere Streifen fasst den Ball nicht: ` +
            `verfügbar ${Math.round(obersterKasten)}px, nötig ${noetigOben}px ` +
            `(2·R + 16). Der Ball wird überlappend platziert. Entweder der ` +
            `mobile Durchmesser sinkt oder die Badge-Zeile rückt nach unten.`,
        );
      }
      const targetY = mobil
        ? imStreifen
        : gewaehlt
          ? clamp(sichtMitte, gewaehlt.von, gewaehlt.bis)
          : // Keine taugliche Lücke – s. Warnung oben.
            imStreifen;

      // Ball: reine Fallbewegung mit leichtem Wackeln – läuft mit der
      // Scrollrichtung statt gegen sie und braucht keine seitliche Fläche.
      // ⚠️ MOBIL FÄLLT NICHTS SCROLL-GESTEUERT (Vivien, s. Konstantenblock).
      // `tb` bleibt auf 1, der Ball steht ab dem ersten Bild an seinem Platz;
      // den Einflug übernimmt eine CSS-Übergangszeit beim Laden.
      const tb = mobil ? 1 : clamp(t / BALL_SPAN, 0, 1);
      const y0 = -BALL_R * 2;
      const y1 = targetY - 2;
      let y = mobil ? y1 : y0 + (y1 - y0) * tb;

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
      // ⚠️ ZWEI BEDINGUNGEN, NICHT EINE (Befund Tobias A, 15.08.2026).
      // Die erste Fassung hing nur an der Hero-Unterkante – und die bewegt sich
      // ab dem ersten Pixel Scroll. Gemessen setzte das Ausrollen dadurch schon
      // bei scrollY 90 ein, also mitten im Fall: Der Ball driftete nach rechts,
      // WÄHREND er noch fiel, und war am Ruhepunkt fast aus dem Bild.
      // Jetzt muss beides zutreffen: Der Ball ist angekommen (`tb === 1`) UND
      // der Hero ist zu einem guten Teil ausgezogen. Erst dann rollt er weiter.
      // ⚠️ DRITTE BEDINGUNG: ES MUSS EINE LEISTE GEBEN, AN DIE ÜBERGEBEN WIRD
      // (Entscheidung Vivien, Roadmap 20 b). `FeatureProgressRail` schaltet mit
      // `xl:hidden` / `hidden xl:block`, also bei 1280px. OBERHALB ist die
      // Leiste eine senkrechte Spalte am RECHTEN Rand – der Hero-Ball rollt
      // nach rechts raus, die Spalte übernimmt rechts. DARUNTER ist sie ein
      // waagerechter Balken, der LINKS beginnt: Ein Ball, der rechts rausrollt
      // und links wieder auftaucht, ist kein Stabwechsel, sondern zwei
      // Auftritte an entgegengesetzten Ecken.
      //
      // Dazu kam eine Bewegung, die für sich schon falsch war: Bei 375 wanderte
      // der Ball beim Ausrollen von x=349 auf x=583, WÄHREND die Seite nach oben
      // scrollt – weder Schwerkraft noch Pass, sondern seitliches Wegrutschen.
      //
      // Unterhalb von `xl` bleibt er deshalb an seinem Ruhepunkt stehen und
      // scrollt mit der Bühne oben aus dem Bild. Das ist der physikalisch
      // richtige Abgang für ein Objekt in einem scrollenden Rahmen – und der
      // Leisten-Ball erscheint danach als ehrlicher zweiter Auftritt.
      // Bewusst KEIN Spiegeln der Bahn für mobil: Dafür müsste der Ball oben
      // LINKS abgehen, entgegen der Desktop-Richtung und entgegen dem Ruhepunkt
      // aus der Bahn-Entscheidung. Zwei gegenläufige Choreografien für dieselbe
      // Erzählung sind teurer als ein zweiter Auftritt.
      const RAIL_BREAKPOINT = 1280; // = Tailwind `xl`, muss mit FeatureProgressRail übereinstimmen
      const HANDOFF_START = 0.45;
      const sichtHoehe = window.innerHeight || 1;
      const gibtLeiste = window.innerWidth >= RAIL_BREAKPOINT;
      const auszug = clamp(
        (sichtHoehe - rect.bottom) / Math.max(1, sichtHoehe - NAVBAR_HEIGHT),
        0,
        1,
      );
      const tu =
        !gibtLeiste || tb < 1
          ? 0
          : clamp((auszug - HANDOFF_START) / (1 - HANDOFF_START), 0, 1);
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
      // Die Kästen werden im Scroll-Listener vermessen, nicht hier – pro BILD
      // wäre `getClientRects()` ein Layout-Zugriff je Frame. Warum im Listener
      // und nicht nur bei `resize`: s. Kommentar an `kaestenBauen`.
      // Ebenfalls bühnenrelativ: `x`/`y` sind es ohnehin, die Kästen jetzt auch.
      ballOpacity *= ballDeckkraftUeberKaesten(
        y - BALL_R,
        y + BALL_R,
        kaestenRef.current,
        x - BALL_R,
        x + BALL_R,
      );

      // ⚠️ DAS AUSBLENDEN FOLGT DEM ECHTEN AUSTRITT, NICHT EINER KONSTANTEN.
      // Die erste Fassung blendete über `tu` aus – gemessen war der Ball damit
      // bei scrollY 600 längst aus der (overflow-hidden) Bühne gerollt, seine
      // Deckkraft erreichte 0 aber erst bei 850. Zwischen 600 und 800 war
      // schlicht kein Ball da, obwohl rechnerisch noch einer "sichtbar" war.
      // Jetzt ist der Faktor der Anteil des Balls, der noch in der Bühne steht:
      // Er verschwindet exakt, während er hinausrollt – und der Übergabepunkt
      // ist damit eine gemessene Größe statt einer geschätzten.
      // Steht bewusst NACH der Deklaration von `ballOpacity` – die erste Fassung
      // rechnete im `tu`-Block damit und wäre in die temporale Totzone gelaufen.
      if (tu > 0) {
        const linkeKante = x - BALL_R;
        ballOpacity *= clamp((rect.width - linkeKante) / (BALL_R * 2), 0, 1);
      }

      // KEIN `rotate()` mehr: Die Drehung steckt in der Bildsequenz. Eine
      // zusätzliche Flächendrehung würde die echte Kugelrotation überlagern
      // und den ganzen Zweck der Sequenz aufheben – der Ball sähe aus, als
      // taumele er.
      // ⚠️ WÄHREND DES EINFLUGS GEHÖRT DER BALL `schritt`, NICHT `apply`.
      // Ohne diese Sperre schreiben beide in denselben Frame (Befund Kai).
      if (!einflugAktivRef.current) {
        ball.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${(
          y - BALL_R
        ).toFixed(1)}px, 0)`;
        // Bildwahl aus dem Drehwinkel. Der Streifen deckt EINE volle Umdrehung
        // ab, deshalb modulo 360 – `angle` läuft während der Übergabe auf
        // mehrere tausend Grad hoch.
        const bild =
          ((Math.round((angle / 360) * BALL_SPRITE_FRAMES) %
            BALL_SPRITE_FRAMES) +
            BALL_SPRITE_FRAMES) %
          BALL_SPRITE_FRAMES;
        // Prozent statt Pixel: dadurch ist die Bildwahl von der Anzeigegröße
        // unabhängig und stimmt mobil wie am Desktop ohne Umrechnung.
        ball.style.backgroundPositionX = `${(bild / (BALL_SPRITE_FRAMES - 1)) * 100}%`;
        // Mobil bleibt der Ball unsichtbar, BIS der Einflug ihn holt. Sonst
        // stünde er erst an seinem Platz und flöge dann von oben noch einmal
        // dorthin – ein Auftritt für einen Ball, der schon da war.
        // ⚠️ NUR AM SEITENANFANG VERSTECKEN. Der erste Entwurf blendete den
        // Ball aus, bis der Einflug ihn holt – und koppelte damit seine
        // SICHTBARKEIT an ein Ladeereignis. Wer scrollte, bevor die Kästen
        // endgültig waren, sah ihn nie: drei rote Tests, und zwar genau der,
        // der fragt „ist der Ball überhaupt irgendwann zu sehen".
        // Ein Auftritt darf ein Auftritt sein; er darf nichts verstecken.
        ball.style.opacity =
          mobil && !eingeflogenRef.current && window.scrollY <= 0
            ? "0"
            : clamp(ballOpacity, 0, 1).toFixed(3);
      }

      // Mobiler Ladeauftritt: Der Ball steht schon an seinem Platz (s. oben).
      // Er wird EINMAL von oben dorthin geführt, indem der erste Frame ihn
      // oberhalb absetzt und der zweite die Übergangszeit setzt. Danach nie
      // wieder – ein Übergang, der bei jedem Scroll neu startet, käme nie an
      // (dieselbe Falle wie bei der Lande-Animation der Leiste, Befund Kai K2).
      if (mobil && !eingeflogenRef.current && kaestenFinalRef.current) {
        eingeflogenRef.current = true;
        // Wer schon gescrollt hat, hat den Auftritt verpasst – dann führt
        // `apply` direkt weiter, statt den Ball nachträglich hereinfliegen zu
        // lassen. Ein Einflug in eine Seite, die der Leser bereits verlassen
        // hat, wäre eine Bewegung ohne Anlass.
        if (window.scrollY > 0) return;
        einflugAktivRef.current = true;
        ball.style.opacity = clamp(ballOpacity, 0, 1).toFixed(3);
        // ══ DER EINFLUG NIMMT DIE SEQUENZ MIT ═══════════════════════════════
        // Entscheidung Vivien (fünfte Runde). Vorher fiel der Ball mobil als
        // STANDBILD herein: `tb` ist mobil fest 1, der Drehwinkel damit
        // konstant – gemessen 1 von 32 Sprite-Bildern, null Wechsel. Wir haben
        // eine 32-Bild-Rotationssequenz für 104 KB gebaut und auf dem
        // Hauptgerät kein einziges Bild gezeigt.
        //
        // ⚠️ EINE DREHUNG IST HIER NICHT ERFUNDEN, und der Grund ist nicht
        // derselbe wie auf der Leiste: `rollwinkel()` beschreibt ROLLEN auf
        // einer Fläche. Der Einflug ist FLUG – und ein fliegender Ball dreht
        // sich ohnehin, Spin ist beim Basketball die Regel.
        // ⚠️ DIE RATE IST GEWÄHLT, NICHT HERGELEITET: Weg durch Radius, also
        // dasselbe Verhältnis wie überall sonst (bei 375 rund 247°, gut zwei
        // Drittel einer Umdrehung). Der Grund ist EINHEITLICHKEIT, damit ein
        // großer Ball auf kurzem Weg nicht wirbelt – nicht Physik. Ohne diesen
        // Satz steht hier in vier Wochen wieder eine Begründung, welche die
        // Zeichnung nicht trägt.
        //
        // Statt einer CSS-Übergangszeit läuft der Einflug jetzt über rAF: Nur
        // so lassen sich Position, Bildwahl UND der Aufsetzer aus einer Hand
        // steuern. Die Kurve bleibt eine Verzögerung – Vivien hat die
        // naheliegende Beschleunigung ausdrücklich verworfen: Der Ball beginnt
        // seinen Fall AUSSERHALB des Bildes, hat an der Kante also längst
        // Tempo. „Schnell herein, dann abbremsen" ist die richtige Lesart;
        // eine Beschleunigung von der Kante weg sähe aus wie abgeschossen.
        const startY = y0 - BALL_R;
        const zielY = y - BALL_R;
        const weg = zielY - startY;
        // ══ EINE VOLLE UMDREHUNG, VIEWPORT-UNABHÄNGIG ═══════════════════════
        // Entscheidung Vivien (16.08.2026). Vorher `weg / BALL_R`, gemessen
        // rund 223° – also nur ~20 der 32 Bilder, und der Betrag hing an der
        // BALLGRÖSSE: ein größerer Ball drehte sich WENIGER. Das hat so nie
        // jemand gemeint.
        // 360° ist eine abgeschlossene Geste und nutzt die 104 KB, für die wir
        // die Sequenz gebaut haben. Tempo zur Kontrolle: 360° in 520 ms sind
        // 692 °/s – ein echter Freiwurf liegt bei 720–1080 °/s. Es wirbelt
        // also nicht, es ist eher ruhiger als die Wirklichkeit.
        const gesamtWinkel = 360;
        const beginn = performance.now();
        const schritt = () => {
          const el = ballRef.current;
          if (!el) return;
          const t2 = Math.min(1, (performance.now() - beginn) / EINFLUG_MS);
          // easeOutQuint – praktisch deckungsgleich mit der bisherigen
          // cubic-bezier(0.23, 1, 0.32, 1), nur in JS auswertbar.
          const e = 1 - Math.pow(1 - t2, 5);
          // ⚠️ DERSELBE AUFSETZER WIE IM SCROLL-PFAD – UND DIESMAL AUCH IM
          // SELBEN PARAMETERBEREICH (Befund Tobias B2, fünfte Runde).
          // Die erste Fassung legte `Math.sin(settle·π)·4·(1−settle)` über den
          // GANZEN Flug. Der Term ist auf [0,1] nie negativ und wird
          // subtrahiert – der Ball näherte sich dem Ziel also immer von oben
          // und unterschritt es nie. Sein Maximum lag bei 2,32px (nicht 4) und
          // bei e ≈ 0,354, mit easeOutQuint also **44 von 520 ms**: im Anflug,
          // wenn der Ball noch 60 % vom Ziel entfernt ist.
          // Ich hatte die Formel übernommen, aber nicht ihren Bereich: Im
          // Scroll-Pfad läuft sie über `settle`, und das deckt nur die letzten
          // 18 % der Bahn ab (`SETTLE_FROM`). Genau dort gehört sie hin.
          // Ohne diese Korrektur war „die beiden Momente teilen eine
          // Bewegungssignatur" eine Zusage, welche die Zeichnung nicht trug.
          let yJetzt = startY + weg * e;
          if (e > SETTLE_FROM) {
            const settle = (e - SETTLE_FROM) / (1 - SETTLE_FROM);
            yJetzt -= Math.sin(settle * Math.PI) * 4 * (1 - settle);
          }
          el.style.transform = `translate3d(${(x - BALL_R).toFixed(1)}px, ${yJetzt.toFixed(1)}px, 0)`;
          // ⚠️ DIE BILDWAHL FOLGT EINER EIGENEN, FLACHEREN KURVE ALS DIE LAGE
          // (Entscheidung Vivien). Vorher lief sie über `e` (easeOutQuint) –
          // dieselbe stark verzögerte Kurve wie die Position. Folge, von
          // Tobias gemessen: ab t = 283 ms von 520 ms kein Bildwechsel mehr,
          // gezeigt wurden 14 statt 32 Bilder.
          // Das ist schlimmer als „ein Ball, der zur Ruhe kommt": Der sichtbare
          // Nachlauf von easeOutQuint liegt GENAU in diesen Millisekunden – der
          // Ball kriecht also spürbar weiter, während seine Textur eingefroren
          // ist. Genau der Defekt, der auf der Leiste schon behoben wurde.
          // ⚠️ UND NICHT LINEAR: Dann drehte die Textur gleichförmig, während
          // die Lage bremst – der Ball würde rutschen. Die Drehung muss
          // mitbremsen, nur schwächer. easeOutQuad legt den letzten Bildwechsel
          // rund 64 ms vor den Stillstand statt 225 ms.
          const eBild = 1 - Math.pow(1 - t2, 2); // easeOutQuad
          const bildJetzt =
            ((Math.round((gesamtWinkel * eBild * BALL_SPRITE_FRAMES) / 360) %
              BALL_SPRITE_FRAMES) +
              BALL_SPRITE_FRAMES) %
            BALL_SPRITE_FRAMES;
          el.style.backgroundPositionX = `${(bildJetzt / (BALL_SPRITE_FRAMES - 1)) * 100}%`;
          if (t2 < 1) {
            requestAnimationFrame(schritt);
          } else {
            // Ball zurück an `apply` übergeben – ab hier führt wieder der Scroll.
            einflugAktivRef.current = false;
            // ⚠️ UND DAS VERWORFENE EREIGNIS NACHHOLEN (Befund Kai, sechste
            // Runde). Der Schiedsrichter war dicht – `apply` schrieb während
            // des Flugs nachweislich nicht mit –, aber es wurde VERWORFEN statt
            // aufgeschoben, und `schritt` friert `zielY` beim Start ein.
            // Ein Resize im Flugfenster ließ den Ball deshalb auf der alten
            // Lage liegen, bis irgendein Ereignis `apply` auslöste: gemessen
            // 165 statt 371,8 (375→360), 165 statt 333,9 (430→500), 193,6
            // statt 519,3 (600→700).
            // Dieselbe Klasse wie B1 – ich hatte die Hälfte „zwei Schreiber"
            // geschlossen und die Hälfte „verworfenes Ereignis" offen gelassen.
            apply();
          }
        };
        requestAnimationFrame(schritt);
      }
    };

    // Geplanten Frame merken, damit er beim Abmelden nicht mehr gegen bereits
    // entfernte Nodes läuft (Deploy-Gate-Befund Kai, 10.08.2026).
    let raf = 0;
    const onScrollOrResize = () => {
      // Kästen bei Größenänderung neu vermessen – Zeilenumbrüche verschieben
      // sich mit der Breite, und danach stimmt jede Kollisionsprüfung nicht mehr.
      kaestenBauen();
      if (tickingRef.current) return;
      tickingRef.current = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    // Nach dem Laden von Bild/Schrift einmal nachmessen – bis dahin können sich
    // die Rechtecke noch verschieben.
    // ⚠️ Über `onScrollOrResize`, NICHT direkt über `apply` (Befund Kai B7):
    // `apply` setzt `tickingRef` auf false. Feuert `load`, während bereits ein
    // Frame geplant ist, wird die Sperre gelöst, ohne den Frame zu stornieren –
    // ein folgendes Scroll-Event überschreibt dann die gemerkte ID, und genau
    // die wollte das Aufräumen stornieren können.
    window.addEventListener("load", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      tickingRef.current = false;
      cancelAnimationFrame(warteRaf);
      // ⚠️ ZURÜCKSETZEN, SONST ENTFÄLLT DER EINFLUG DAUERHAFT (Befund Kai):
      // Nach einem `prefers-reduced-motion`-Wechsel hin und zurück baut React
      // den Effekt neu auf, `eingeflogenRef` bliebe aber true – der Auftritt
      // fände nie wieder statt. Das ist genau der Zustand, den Kais Mutation
      // M9 simuliert, und M9 war grün.
      eingeflogenRef.current = false;
      einflugAktivRef.current = false;
      kaestenFinalRef.current = false;
      // ⚠️ Auch diese – sie war als EINZIGE der vier nicht dabei (Befund Kai),
      // wodurch die Diagnose nach einem `reduced-motion`-Wechsel dauerhaft
      // geschwiegen hätte.
      streifenGemeldetRef.current = false;
      window.removeEventListener("load", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [animated, inhaltRef]);

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
        <BallSprite
          ref={ballRef}
          className="h-[72px] w-[72px] md:h-[176px] md:w-[176px]"
        />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        {children}
      </div>
    </div>
  );
}
