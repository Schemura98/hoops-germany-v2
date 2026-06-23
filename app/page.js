import Link from "next/link";
import { FaTrophy, FaUsers, FaChartBar, FaArrowRight } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingHero from "@/components/landing/LandingHero";
import NewsWidget from "@/components/NewsWidget";

const features = [
  {
    icon: FaUsers,
    title: "Spielerprofile",
    text: "Erstelle dein persönliches Profil, teile deine Stats und Highlights und werde von Vereinen und Scouts entdeckt.",
  },
  {
    icon: FaTrophy,
    title: "Ligen und Tabellen",
    text: "Verfolge Ergebnisse, Tabellenstände und Spielpläne deiner Liga – in Echtzeit, direkt auf deinem Handy.",
  },
  {
    icon: FaChartBar,
    title: "Transfers und News",
    text: "Bleib auf dem Laufenden: Vereinswechsel, Tryouts, Turniere und News direkt aus der deutschen Basketball-Szene.",
  },
];

const steps = [
  { n: 1, dark: true, title: "Kostenlos registrieren", text: "Erstelle deinen Account in unter 2 Minuten – komplett kostenlos." },
  { n: 2, dark: false, title: "Profil vervollständigen", text: "Füge deine Position, Stats und ein Profilbild hinzu." },
  { n: 3, dark: true, title: "Community beitreten", text: "Tritt deinem Verein bei, verfolge Ligen und vernetze dich mit anderen Spielern." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <LandingHero />

      {/* Features */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4 text-gray-900">
            Alles, was du brauchst
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            Von deinem Spielerprofil bis hin zu Liga-Tabellen – Hoops Germany bringt die
            deutsche Basketball-Community zusammen.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
                >
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-orange-500 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* So funktionierts */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">So funktionierts</h2>
          <p className="text-gray-500 mb-16">In 3 einfachen Schritten dabei</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div
                  className={`w-16 h-16 ${
                    s.dark ? "bg-gray-900" : "bg-orange-500"
                  } text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black`}
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Basketball-News */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <NewsWidget />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4">Bereit loszulegen?</h2>
        <p className="text-gray-300 mb-10 text-lg">
          Werde Teil der größten Amateur-Basketball Community in Deutschland.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-lg text-lg flex items-center justify-center gap-2"
          >
            Jetzt registrieren <FaArrowRight />
          </Link>
          <Link
            href="/login"
            className="border-2 border-gray-500 hover:border-white text-white font-bold py-4 px-10 rounded-lg text-lg flex items-center justify-center"
          >
            Bereits registriert? Anmelden
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
