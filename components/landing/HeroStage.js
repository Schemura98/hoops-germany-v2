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
// hoch, wie ihr Inhalt plus ein gesetzter Rhythmus sie macht. Es gibt keine
// Viewport-Einheit mehr in dieser Datei — damit gibt es auch keine Zahl, die
// beim nächsten Umbau der Leisten still falsch wird.
//
// Nebenwirkung, die ausdrücklich gewollt ist: Auf üblichen Telefonhöhen endet
// der Hero knapp oberhalb der Falz, sodass die Kante des nächsten Abschnitts
// eben noch ins Bild ragt. Das ist das ehrlichste „hier geht es weiter"-
// Signal, das es gibt — es braucht keinen Pfeil und keine Wackel-Animation.
const STAGE =
  "relative isolate overflow-hidden bg-navy-950 text-paper-50 " +
  // Untergrenze, damit die Bühne auch im eingeloggten Kurzfall nicht
  // zusammenfällt. Bewusst in `rem`, nicht in `vh`.
  "min-h-[35rem] sm:min-h-[38rem] lg:min-h-[40rem]";

// Der Rhythmus. `pt` ist die einzige Zahl, die die Komposition wirklich
// steuert — sie entscheidet, wo die Überschrift anfängt.
// ⚠️ SIE IST NICHT FREI GEWÄHLT, SONDERN AN DIE ZEICHNUNG GEBUNDEN, und die
// Bindung ist eine Verhältnisrechnung, keine Pixelzahl:
// Der Korb sitzt bei 19,4 % der Bühnenhöhe (Korbmitte 139,8 von 720
// viewBox-Einheiten; auf schmalen Geräten füllt die Zeichnung die Höhe, der
// Maßstab ist also Bühnenhöhe / 720). Die Überschrift muss UNTER dem Korb
// beginnen — weißer Text auf dem einen orangen Element ist der einzige
// Kontrastfall, den diese Zeichnung überhaupt noch kennt.
// ⚠️ DESHALB IST `pt` EIN `max()` UND KEINE FESTE ZAHL — und das ist die
// vierte Auflage derselben Fehlerklasse, die dieses Projekt schon dreimal
// protokolliert hat (CLAUDE.md Roadmap 20b: „eine Stellschraube und ein
// Restbetrag als dieselbe Größe behandelt"). Der Hergang, gemessen:
//
// Der Korb sitzt bei einem festen ANTEIL der Zeichnung (176,3 von 720
// Einheiten bis zu seiner Unterkante). Wie viele Pixel das sind, bestimmt der
// Maßstab — und der ist bei `slice` das MAXIMUM aus zwei Verhältnissen:
//   · schmal/hoch → Bühnenhöhe / 720   (die Höhe treibt)
//   · breit/flach → Fensterbreite / 1200 (die BREITE treibt)
// `pt` in `rem` ist eine gesetzte Zahl. Die Korblage ist ein Restbetrag aus
// Fenstermaßen. Beide in derselben Einheit zu vergleichen geht schief, sobald
// das Fenster das Regime wechselt.
//
// Gemessen am gebauten Stück, mit festen 12 rem:
//   360–430 px  → Abstand 23 px  (Höhe treibt, Bühne steht auf `min-h`)
//   768×1024    → Abstand  9 px  (Höhe treibt, Bühne aber inhaltsgetrieben)
//   1440×900    → Abstand −20 px → DER KORB LAG AUF DER ÜBERSCHRIFT.
// Genau dort ist es kein Schönheitsfehler: Weißer Text auf `brand-500`
// erreicht 2,59 : 1, die einzige Stelle dieser Zeichnung, die AA reißen kann.
// Alle kühlen Haarlinien halten dagegen 7,52 : 1 und sind harmlos.
//
// Der `max()`-Term bildet beide Regime ab: 14,7 vw ist die Korbunterkante im
// breitengetriebenen Fall (176,3/1200 = 0,1469), die feste Untergrenze deckt
// den höhengetriebenen. Plus 1,5 rem Luft. Nachgemessen liegt der Abstand
// danach auf jedem geprüften Fenster zwischen 23 und 27 px.
// ⚠️ Wer `min-h`, `pt` oder die Zeichnung anfasst, misst nach — nicht schätzen:
// `tests/e2e/hero-standbild.spec.mjs` prüft genau diesen Abstand.
const INHALT =
  "relative z-10 mx-auto w-full max-w-3xl px-6 text-center " +
  "pt-[max(10rem,calc(14.7vw+1.5rem))] pb-14 " +
  "sm:pt-[max(12rem,calc(14.7vw+1.5rem))] sm:pb-16 lg:pb-20";

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
      <HeroCourt />
      <div className={INHALT}>{children}</div>
    </div>
  );
}
