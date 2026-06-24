import Link from "next/link";

// Schlanker, immer sichtbarer Hinweis auf den Testbetrieb. Informiert zufällige
// Besucher (rechtliche Absicherung) und lädt zu Feedback ein. Bewusst nicht
// schließbar, damit der Disclaimer auf jeder Seite präsent ist.
export default function TestPhaseBanner() {
  return (
    <div className="bg-amber-400 text-slate-900 text-center text-xs sm:text-sm px-3 py-1.5 leading-snug">
      <span className="font-semibold">🚧 Testphase:</span>{" "}
      Hoops Germany ist im Testbetrieb – einige Inhalte sind Beispieldaten.{" "}
      <Link href="/feedback" className="font-semibold underline underline-offset-2 hover:text-slate-700">
        Feedback geben
      </Link>
    </div>
  );
}
