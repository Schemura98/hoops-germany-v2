import HeroCourt from "@/components/landing/HeroCourt";

// ══ HERO-BÜHNE ══════════════════════════════════════════════════════════════
//
// Neuansatz vom 20.08.2026. Ersetzt HeroScrollStage.js (330 Zeilen Controller)
// und HeroDunk.js (711 Zeilen Zeichnung) — zusammen 1.041 Zeilen, die eine
// scroll-gesteuerte Choreografie getragen haben.
//
// ⚠️ DIESE DATEI HAT KEIN JavaScript, UND DAS IST DIE ENTSCHEIDUNG, NICHT EINE
// FOLGE DAVON. Der Hero der Startseite ist ab jetzt ein STANDBILD.
// Vier Gründe, in der Reihenfolge ihres Gewichts:
//
// (1) DIE BEWEGUNG FAND STATT, WÄHREND DER LESER GING. Die Bühne ist einen
//     Bildschirm hoch; alles, was an den Scrollfortschritt gekoppelt ist,
//     spielt also genau in dem Moment, in dem der Hero das Bild verlässt.
//     Wer den Hero ANSIEHT, sieht per Konstruktion das erste Bild — und das
//     erste Bild war ein halb leerer Bildschirm mit ein paar Linienenden.
//     Eine Choreografie, deren Publikum bereits weitergescrollt ist, ist
//     kein Wow, sondern Aufwand.
// (2) DAS BEWEGUNGSBUDGET DER SEITE IST UNTEN BESSER ANGELEGT. Direkt unter
//     dem Hero liegen sechs choreografierte Szenen („Eine Saison, sechs
//     Spielzüge"). Zwei bewegte Erzählungen hintereinander konkurrieren; die
//     untere ist die inhaltlich stärkere, weil sie etwas erklärt.
// (3) DER PREIS WAR BELEGT HOCH. CLAUDE.md führt allein für die
//     Ball-/Dunk-Choreografie die Roadmap-Punkte 20 bis 20h — acht Einträge,
//     jeder mindestens eine Gate-Runde, und am Ende zwei Rücknahmen durch
//     Patrick. Das ist kein Argument gegen Bewegung an sich; es ist eines
//     gegen Bewegung AN DIESER STELLE.
// (4) MITTELKLASSE-ANDROID. Null JavaScript, null Scroll-Listener, null rAF
//     auf der Einstiegsfläche. Die Zeichnung ist Markup und kommt mit dem
//     ersten gemalten Bild.
//
// ⚠️ FÜR DEN, DER HIER WIEDER EINE BEWEGUNG ANBAUEN WILL: Es gibt eine, und
// sie steht in app/globals.css (`hero-court-*`) — die Zeichnung zeichnet sich
// EINMAL BEIM LADEN, in rund 900 ms, per reiner CSS-Animation. Der
// Unterschied zum Vorgänger ist nicht „mit/ohne Bewegung", sondern WANN sie
// stattfindet: beim Ankommen statt beim Weggehen. Wer eine scroll-gebundene
// Fassung zurückholt, holt die 1.041 Zeilen Mechanik mit zurück.
//
// ══ DIE HÖHE — hier lag der Fehler, den Patrick gesehen hat ═════════════════
//
// Der Vorgänger stand auf `minHeight: calc(100vh - 4rem)`, mit der Absicht
// „genau ein Bildschirm". Er WAR aber nie ein Bildschirm:
//   · abgezogen wurden 4 rem = 64 px (die Navigationsleiste),
//   · über der Bühne stehen aber Navigationsleiste UND Testphase-Band,
//     zusammen 109 px.
// Die Bühne war also 45 px zu hoch, ragte unten aus dem Bild — und weil ihr
// Inhalt mit `items-center` in DIESER zu hohen Box zentriert wurde, rutschte
// er nach unten. Ergebnis auf 360 px gemessen: rund 215 px leere Fläche
// zwischen Navigationsleiste und Überschrift, während Überschrift und Taste
// ins untere Drittel gedrückt waren.
//
// ⚠️ DIE LEHRE IST NICHT „DIE 4 rem AUF 6,8 rem KORRIGIEREN". Genau das wäre
// die Wartungsfalle: eine Konstante, die stillschweigend voraussetzt, dass
// über der Bühne immer exakt zwei bestimmte Leisten stehen. Verschwindet das
// Testphase-Band nach der Testphase, ist die Zahl wieder falsch — und zwar
// wieder unsichtbar falsch, weil nichts kaputtgeht, es sieht nur schlechter
// aus. (Fremdbeleg für die Fehlerklasse: Smashing Magazine, „Sticky Headers
// And Full-Height Elements", zur Wartbarkeit fixer `calc()`-Höhen.)
//
// DESHALB: Die Bühne ist NICHT MEHR AN DEN BILDSCHIRM GEKOPPELT. Sie ist so
// hoch, wie ihr Inhalt plus ein gesetzter Rhythmus sie macht.
// ⚠️ HIER STAND „Es gibt keine Viewport-Einheit mehr in dieser Datei" — DAS WAR
// SCHON BEIM SCHREIBEN FALSCH, und zwar in meiner eigenen Datei: Der `pt`-Term
// unten enthält ein `vw`, seit es ihn gibt.
// Richtig ist die UNTERSCHEIDUNG, auf die es ankommt: Keine Viewport-Einheit
// steht mehr in einer HÖHE. Die gefährliche Zahl war `calc(100vh − 4rem)`,
// weil das stillschweigend behauptet, über der Bühne stünden für immer genau
// zwei bestimmte Leisten. Das `vw` im Textabstand behauptet nichts über die
// Seite: Es ist die Umrechnung der Korblage in dem Regime, in dem die BREITE
// den Maßstab treibt — dieselbe Größe, nur anders geschrieben.
//
// ⚠️ HIER STAND EINE BEGRÜNDUNG, DIE AUF KEINER TELEFONBREITE ZUTRAF, und sie
// war meine (Befund Tobias, 20.08.2026). Sie lautete, der Hero ende knapp über
// der Falz, „sodass die Kante des nächsten Abschnitts eben noch ins Bild ragt"
// — das ehrlichste „hier geht es weiter"-Signal.
// Nachgemessen und ANGESEHEN auf 360×800: Es gibt dort keine Kante. Der
// folgende Abschnitt trägt denselben Grund (`bg-navy-950`), seine ersten 80 px
// sind Innenabstand, und zwischen der letzten Linie der Zeichnung (y ≈ 620) und
// dem Bildende liegen **185 px, in denen nichts ist** — kein Farbwechsel, kein
// Text, keine Linie. Auf 390×844 dasselbe Bild.
// Das ist Patricks Befund vom 20.08. in der Spiegelung: oben behoben, unten
// unbemerkt geblieben. `hero-standbild.spec.mjs` P1 bewacht ausschließlich die
// OBERE Kante, weil oben beanstandet wurde.
// ⚠️ NICHT HIER BEHOBEN, UND DAS IST EINE ENTSCHEIDUNG: Der leere Streifen
// gehört nicht dem Hero, sondern dem Übergang — er entsteht aus `py-20` am
// folgenden Abschnitt (components/landing/LandingFeatures.js). Ihn im Hero
// wegzunehmen hieße, die Bühne kürzer zu machen als ihre Zeichnung.
// Vorschlag, gemessen, aber bewusst nicht eigenmächtig gebaut: den oberen
// Innenabstand der Feature-Strecke mobil auf ~2,5 rem nehmen. Deren erstes
// Element ist die randfüllende Überschrift „Eine Saison, sechs Spielzüge" —
// die im ersten Bild anzuschneiden ist ein echtes Weiter-Signal, und weil sie
// im Sichtfeld liegt, blendet ihr `Reveal` auch tatsächlich ein.
const STAGE =
  "relative isolate overflow-hidden bg-navy-950 text-paper-50 " +
  // Untergrenze, damit die Bühne auch im eingeloggten Kurzfall nicht
  // zusammenfällt. Bewusst in `rem`, nicht in `vh`.
  "min-h-[35rem] sm:min-h-[38rem] lg:min-h-[40rem]";

// ══ DIE ZEICHNUNG HAT IHRE EIGENE HÖHE — UND DAS IST BLOCKER 2 ══════════════
//
// ⚠️ WAS VORHER FALSCH WAR (Befund Tobias B1, 20.08.2026): Die Zeichnung lag
// als `absolute inset-0 h-full` in der Bühne, war also so hoch wie die Bühne.
// Bei `slice` ist der Maßstab das Maximum aus Breite/1200 und HÖHE/720 — die
// Zeichnung wuchs damit mit dem INHALT. Eingeloggt steht ein Element mehr im
// Hero, die Bühne ist 811,6 statt 560 px hoch, der Maßstab springt von 0,78 auf
// 1,13, und der Ring wandert um 62 px nach unten. Er landete hinter dem orangen
// Willkommens-Schild: gemessener Abstand −41,7 px auf 360–430, −44,8 auf 320,
// auf 9 von 11 Fenstern negativ.
//
// ⚠️ DAS IST DIE FÜNFTE AUFLAGE DERSELBEN FEHLERKLASSE (CLAUDE.md Roadmap 20b:
// „eine Stellschraube und ein Restbetrag als dieselbe Größe behandelt"), und
// diesmal war ICH der Fall: Der `max()`-Term unten deckte beide REGIME des
// Maßstabs ab — schmal/hoch und breit/flach — aber beide nur für den
// ausgeloggten Inhalt. Die dritte Größe, an der der Maßstab hängt, war die
// INHALTSHÖHE, und die kommt in keinem der beiden Terme vor.
//
// ⚠️ DIE ABHILFE IST DESHALB NICHT „DEN TERM UM EINEN FALL ERWEITERN".
// Das wäre die sechste Auflage: Nele hat den Umfang des eingeloggten Heros noch
// offen (acht Dinge, fünf Tasten) — jede Zahl, die auf DIESEN Inhalt geeicht
// ist, wird still falsch, sobald er sich ändert. Stattdessen bekommt die
// Zeichnung eine eigene, vom Inhalt UNABHÄNGIGE Höhe. Damit ist der Restbetrag
// keiner mehr: Die Korblage ist ab jetzt auf jedem Fenster dieselbe, ob
// angemeldet oder nicht, und der `max()`-Term hat wieder genau zwei Fälle.
//
// ⚠️ DIE DREI LEITERN MÜSSEN ZUSAMMENBLEIBEN und stehen deshalb untereinander
// in EINER Datei: Bühnen-Mindesthöhe, Zeichnungshöhe, Textabstand. Wer eine
// anfasst, fasst alle drei an. Bewacht ist das nicht über die Zahlen, sondern
// über die Wirkung (siehe `tests/e2e/hero-standbild.spec.mjs`).
const ZEICHNUNG =
  "pointer-events-none absolute inset-x-0 top-0 " +
  "h-[35rem] sm:h-[38rem] lg:h-[40rem]";

// Der Rhythmus. `pt` ist die einzige Zahl, die die Komposition wirklich
// steuert — sie entscheidet, wo die Überschrift anfängt. Die Überschrift muss
// UNTER dem Korb beginnen: Weißer Text auf dem einen orangen Element ist der
// einzige Kontrastfall, den diese Zeichnung überhaupt noch kennt (#F5F7FA auf
// #F07A27 = 2,60 : 1; die kühlen Linien halten 7,67 : 1 und sind harmlos).
//
// ⚠️ `pt` IST KEINE GEWÄHLTE ZAHL, SONDERN DIE KORBLAGE PLUS LUFT — und seit
// dem 20.08.2026 ist sie in DERSELBEN WÄHRUNG geschrieben wie die Korblage.
// Genau daran ist die Vorfassung gescheitert (Tobias B1, oben): Sie verglich
// eine gesetzte rem-Zahl mit einem Restbetrag aus Fenster- UND Inhaltsmaßen.
//
// ⚠️ DER ANKER IST AM 20.08.2026 EIN ANDERES ELEMENT GEWORDEN — die REGEL ist
// dieselbe geblieben. Vorher hing der Text an der Ring-Unterkante. Seit die
// Zeichnung die Ladezone regelkonform mitzeichnet (Halbkreis r = 1,30 m um die
// Korbmitte, Rule 2.5.7), ist der Ring nicht mehr das UNTERSTE Element des
// Korbbereichs: Der Ladezonen-Bogen reicht 1,075 m tiefer. Am Ring gemessen
// würde die Überschrift in den Bogen hineinlaufen.
// Anker ist deshalb die UNTERKANTE DER LADEZONE — der tiefste Punkt dessen,
// was über dem Text steht. Der Abstand selbst ist unverändert.
//
// Die Rechnung, vollständig, damit sie nachprüfbar ist statt geglaubt:
//   Ladezonen-Unterkante = 44 + (1,575 + 1,30) × 60 = viewBox-y 216,50 von 720.
//   Bei `slice` ist der Maßstab max(Breite/1200, Zeichnungshöhe/720), also:
//     · breit/flach → 216,50/1200          = 18,0417 vw
//     · schmal/hoch → 216,50/720 × Höhe    = 0,300694 × Zeichnungshöhe
//         35 rem → 10,5243 rem · 38 rem → 11,4264 rem · 40 rem → 12,0278 rem
//   Die Zeichnungshöhe ist seit Blocker 2 eine feste Leiter (siehe oben),
//   nicht mehr die Bühnenhöhe. Damit ist der zweite Term wieder eine ZAHL und
//   kein Restbetrag — und beide Terme gelten angemeldet wie abgemeldet.
//   Der `max()` bildet die zwei Regime ab, `+ 1,5 rem` ist die Luft.
//
// Ergebnis, auf zwölf Fenstern von 320 bis 1440 nachgemessen: Die Oberkante
// des Inhaltsblocks liegt ab jetzt IMMER 24,0 px unter der Korbunterkante —
// angemeldet wie abgemeldet, in jedem Regime. Der Abstand ist keine Messgröße
// mehr, sondern gesetzt.
// ⚠️ ZWEI ZAHLEN, NICHT EINE — sonst wäre dieser Satz die nächste Zusage, die
// nur halb gilt: Gemessen wird beim GEZEICHNETEN ersten Element, und das liegt
// nicht auf der Kante des Inhaltsblocks. Ausgeloggt beginnt dort die
// Überschrift → **24,0 px**. Eingeloggt beginnt dort die Eyebrow-Zeile, deren
// Textkasten 3 px innerhalb der Zeilenbox sitzt → **27,0 px**. Beide Werte
// sind auf allen zwölf Fenstern konstant.
// Vorher: 22,9–27,5 px ausgeloggt, **−44,8 bis +18,7 px eingeloggt**.
// ⚠️ Wer eine der drei Leitern anfasst, misst nach — nicht schätzen:
// `tests/e2e/hero-standbild.spec.mjs` prüft genau diesen Abstand.
const INHALT =
  "relative z-10 mx-auto w-full max-w-3xl px-6 text-center " +
  "pt-[calc(max(18.0417vw,10.5243rem)+1.5rem)] pb-14 " +
  "sm:pt-[calc(max(18.0417vw,11.4264rem)+1.5rem)] sm:pb-16 " +
  "lg:pt-[calc(max(18.0417vw,12.0278rem)+1.5rem)] lg:pb-20";

export default function HeroStage({ className = "", children }) {
  return (
    <div
      // Marker für die Prüfung (tests/e2e/hero-standbild.spec.mjs). Übernommen
      // aus der Vorgängerfassung, damit die Tests die Bühne weiterhin an einem
      // Attribut finden und nicht an einer Klassenkette — eine Klassenänderung
      // hätte sie still blind gemacht.
      data-hero-stage
      className={`${STAGE} ${className}`}
    >
      <div className={ZEICHNUNG} aria-hidden="true">
        <HeroCourt />
      </div>
      {/* ⚠️ `data-hero-inhalt` IST NICHT DEKORATION, SONDERN DIE ANTWORT AUF
          EINEN BLINDEN TEST (Befund Kai H2, 20.08.2026).
          `hero-standbild.spec.mjs` P1 maß bis dahin den Abstand zwischen
          Seitengerüst und der obersten „Tinte" — und in dieser Menge steckten
          die FELDLINIEN. Deren Lage ist aber gesetzt (Grundlinie bei
          viewBox-y = 44), sie liegt per Konstruktion immer dicht unter der
          Navigationsleiste. Gemessen: 34–53 px, also 4,0–6,6 % der sichtbaren
          Höhe, gegen eine Schwelle von 12 %.
          Damit war die Prüfung gegen Patricks Befund blind: Eine Überschrift
          260 px tiefer ergab 66 % leere Fläche — und der Test blieb GRÜN, weil
          die Grundlinie unverändert oben lag.
          Der Inhaltsblock braucht deshalb einen eigenen Griff. Bewusst ein
          Attribut und keine Klassenkette, aus demselben Grund wie bei
          `data-hero-stage`: Eine Klassenänderung hätte den Test still blind
          gemacht statt rot. */}
      <div data-hero-inhalt className={INHALT}>
        {children}
      </div>
    </div>
  );
}
