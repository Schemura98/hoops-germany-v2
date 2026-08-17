import Link from "next/link";

// Schlanker, immer sichtbarer Hinweis auf den Testbetrieb. Informiert zufällige
// Besucher (rechtliche Absicherung) und lädt zu Feedback ein. Bewusst nicht
// schließbar, damit der Disclaimer auf jeder Seite präsent ist.
export default function TestPhaseBanner() {
  return (
    <div className="bg-signal-wait text-navy-950 text-center text-xs sm:text-sm px-3 py-1.5 leading-snug print:hidden">
      <span className="font-semibold">🚧 Testphase:</span> Hoops Germany ist im
      Testbetrieb – einige Inhalte sind Beispieldaten.{" "}
      {/* ══ KLICKFLÄCHE ≥ 24px, OHNE DIE BANDHÖHE ZU ÄNDERN ═══════════════════
          Entscheidung Vivien (17.08.2026) auf Tobias' Befund N2: Das war die
          ERSTE Tab-Station der Seite und nur 95 × 16 px groß.
          ⚠️ WICHTIGE KORREKTUR AN DER GRUNDLAGE (Vivien): Das ist **kein**
          WCAG-Verstoß. SC 2.5.8 „Target Size (Minimum)" hat eine ausdrückliche
          Inline-Ausnahme für Ziele, die in einem Satz liegen und deren Größe von
          der Zeilenhöhe des umgebenden Textes bestimmt wird — genau dieser Fall.
          Wir erfüllen hier also keine Pflicht, wir treffen eine Wahl: Es ist die
          erste Tab-Station und wird auch mit dem Daumen getroffen, und 24 px
          kosten nichts.
          Umsetzung über INNENABSTAND statt Schriftgröße, aus dem Zeilenfluss
          genommen durch einen gleich großen negativen Außenabstand — so bleibt
          `py-1.5` am Band und die zweizeilige Umbruchhöhe bei 375 px unverändert.
          Dazu ein eigener Fokusring: Auf `signal-wait` (gelb) ist der
          Standardring des Browsers schwach.
          ⚠️ Der Zugang bleibt bewusst HIER. Vivien: Der Banner nennt den Anlass
          („Testbetrieb, einige Inhalte sind Beispieldaten"), die Einladung steht
          also im Satz, der sie begründet. `FeedbackLink.js` im Sticky-Chrome ist
          der beständige Weg (36 × 36 px, erfüllt 24 px bereits), dieser der
          anlassbezogene — und er fällt nach der Testphase mit dem Banner weg.
          Das berührt die Entscheidung vom 13.08. nicht: Dort wurde der
          SCHWEBENDE Knopf wegen Inhalts-Verdeckung entfernt; ein Link im
          Textfluss verdeckt nichts. */}
      <Link
        href="/feedback"
        className="font-semibold underline underline-offset-2 hover:text-navy-800 inline-block -my-1 py-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-950 focus-visible:ring-offset-1 focus-visible:ring-offset-signal-wait"
      >
        Feedback geben
      </Link>
    </div>
  );
}
