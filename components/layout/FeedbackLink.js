"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiChatCircleDotsBold } from "react-icons/pi";

// ---------------------------------------------------------------------------
// Fester Feedback-Zugang im Sticky-Chrome – Nachfolger des schwebenden
// FeedbackButton (entfernt 13.08.2026).
//
// Warum der schwebende Knopf weg ist: Er wurde am 13.08.2026 von drei
// unabhängigen Prüfern als Verdeckung gemeldet (Liga-Achse: Ecke dichter
// Tabellen; Spielerprofil: ø-Wert der Historie auf 390px; Tobias' Deploy-Gate,
// gemessen: „Abmelden" im offenen Mobil-Menü, Pfeil der 4. Vereinszeile auf
// /tryouts, REB-Wert im Box-Score). Die Wurzel-Ursache ist die Form, nicht
// die Route: Eine fixierte Ebene über dem Inhalt verdeckt in einem Produkt,
// dessen Argument Zahlen sind, zwangsläufig irgendwann eine Zahl oder einen
// Bedienpunkt. Jede weitere Routen-Ausnahme (das alte OHNE_KNOPF) hätte nur
// die nächste Meldung vertagt – der Reflex war das Problem.
//
// Die neue Form: ein fester Platz in den drei Sticky-Leisten (Navbar,
// PlayerNav, TeamNav) statt einer schwebenden Ebene. Das ist reservierte
// Fläche – sie liegt NIE über Inhalt, braucht keine Ausnahmeliste und keine
// Scroll-Logik. Sichtbarkeit gegenüber dem alten Knopf:
//   • Das Chrome ist 100 % der Scrollzeit sichtbar – der alte Knopf
//     versteckte sich beim Runterscrollen, also während des Lesens.
//   • Das Symbol ist das einzige markenfarbene Icon der Leiste (brand-400,
//     dasselbe Signal wie der Team-Admin-Punkt) – es fällt auf, ohne mit dem
//     einen Akzent der Designsprache zu brechen.
//   • Das Wort tragen weiterhin: der Testphase-Banner (oben auf jeder
//     Seite), die „Feedback geben"-Zeile im Mobil-Menü (variant="row",
//     eigene Gruppe „Testphase") und der Footer.
// Tastatur/Vorlesen: Der Zugang steht jetzt in der natürlichen Lesereihen-
// folge der Navigation statt als letztes fixiertes Element irgendwo im Baum.
// Kein Motion nötig (Chrome-Element, ständig sichtbar) – damit ist auch
// prefers-reduced-motion trivial erfüllt.
// ---------------------------------------------------------------------------

export default function FeedbackLink({ variant = "icon", onNavigate }) {
  const pathname = usePathname();
  const aktiv = pathname === "/feedback" || pathname?.startsWith("/feedback/");

  if (variant === "row") {
    // Zeile fürs Mobil-Menü, mit eigenem Gruppentitel im Muster der Menüs.
    // „Testphase" schlägt den Bogen zum Banner – der Zugang erklärt sich selbst.
    return (
      <>
        <p className="bg-navy-950 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
          Testphase
        </p>
        <Link
          href="/feedback"
          onClick={onNavigate}
          aria-current={aktiv ? "page" : undefined}
          className={`flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
            aktiv
              ? "bg-navy-800 text-paper-50 border-brand-500"
              : "text-mist-300 hover:bg-navy-700 hover:text-paper-50 border-transparent"
          }`}
        >
          <PiChatCircleDotsBold className="w-4 h-4 flex-shrink-0 text-brand-400" />
          <span className="text-sm font-medium">Feedback geben</span>
        </Link>
      </>
    );
  }

  // Symbol für die Aktionsleiste (neben Suche/Glocke) – gleiche Größe und
  // Rhythmus wie die Nachbarn, aber in brand-400 als einziges Farbsignal.
  //
  // `p-2 -m-1`: Das Symbol misst 20×20 px, die Klickfläche lag damit unter dem
  // 24er-Mindestmaß (WCAG 2.5.8, Gate-Befund 13.08.2026) – auf einem Handy
  // trifft man das nur mit Zielen. Das Padding hebt die Trefferfläche auf 36 px,
  // das negative Margin nimmt den Zuwachs aus dem Layout wieder heraus, sodass
  // der Abstand zu Suche und Glocke unverändert bleibt. Dasselbe Muster nutzt
  // NotificationBell bereits – hier und beim Suchknopf war es nur nicht
  // nachgezogen.
  return (
    <Link
      href="/feedback"
      aria-label="Feedback geben"
      title="Feedback geben"
      aria-current={aktiv ? "page" : undefined}
      className={`p-2 -m-1 transition-colors ${
        aktiv ? "text-brand-300" : "text-brand-400 hover:text-brand-300"
      }`}
    >
      <PiChatCircleDotsBold className="w-5 h-5" />
    </Link>
  );
}
