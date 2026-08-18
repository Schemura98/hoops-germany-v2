import Link from "next/link";
import TourLink from "@/components/onboarding/TourLink";

// ⚠️ „Basketball-News" neu am 18.08.2026 (Entscheidung Patrick).
// Vivien hat die Fläche aus dem Newsfeed gestrichen – fremde, ungeprüfte
// Inhalte, die vom Produkt wegführen, gehören nicht in einen Feed, dessen
// These „hier ist belegt, was du geleistet hast" lautet. Patricks Einwand:
// Sie sollen deshalb nicht NUR für Ausgeloggte da sein.
//
// Der Footer ist die Antwort auf beides. Er steht auf JEDER Seite, auch im
// Newsfeed, ist also auch angemeldet erreichbar – und er hebt die Nachrichten
// nicht auf dieselbe Stufe wie die Hauptnavigation. Ein vierter mobiler
// Wegweiser hätte genau das getan (Viviens Einwand: „stellt Fremdes neben
// Eigenes auf dieselbe Stufe"), eine eigene Seite `/news` wäre ein halber
// Feature-Bau für eine Fläche ohne einen einzigen Nutzerbeleg.
//
// ⚠️ Das Ziel ist ein Anker auf der Startseite, kein eigener Weg: Der
// Abschnitt steht dort für ALLE, nicht nur für Ausgeloggte – anders als der
// Registrierungs-Aufruf darunter.
const legal = [
  { href: "/#news", label: "Basketball-News" },
  { href: "/installieren", label: "App installieren" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/about", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/feedback", label: "Feedback" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-600 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-mist-600">
          © {new Date().getFullYear()} Hoops Germany. Alle Rechte vorbehalten.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {legal.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-mist-400 hover:text-brand-400 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <TourLink />
        </div>
      </div>
    </footer>
  );
}
