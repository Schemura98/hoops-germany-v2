import Link from "next/link";
import NewsWidget from "@/components/NewsWidget";

const features = [
  { title: "Spieler-Profile", text: "Erstelle dein Profil, zeige Stats und finde Anschluss." },
  { title: "Teams & Kader", text: "Verwalte deinen Kader, lade Spieler ein, organisiere Slots." },
  { title: "Ligen & Spiele", text: "Spielpläne, Ergebnisse und Tabellen an einem Ort." },
  { title: "Tryouts & Transfers", text: "Finde Tryouts oder den nächsten Verein für deine Karriere." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Amateur-Basketball in <span className="text-brand-500">Deutschland</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Hoops Germany verbindet Spieler, Teams und Ligen – Spielpläne, Ergebnisse,
            Tryouts und Transfers in einer Community-Plattform.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Jetzt registrieren
            </Link>
            <Link
              href="/teams"
              className="border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-6 py-3 font-medium transition-colors"
            >
              Teams entdecken
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Basketball-News */}
      <NewsWidget />
    </main>
  );
}
