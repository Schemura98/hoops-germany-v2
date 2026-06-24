import {
  FaTrophy,
  FaUsers,
  FaChartBar,
  FaCalendarAlt,
  FaExchangeAlt,
  FaRegNewspaper,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingHero from "@/components/landing/LandingHero";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingCTA from "@/components/landing/LandingCTA";
import NewsWidget from "@/components/NewsWidget";

const features = [
  {
    icon: FaChartBar,
    title: "Spielerprofile & Statistiken",
    text: "Erstelle dein Profil, sammle Punkte, Assists & Rebounds und verfolge deine komplette Karrierehistorie – sichtbar für Vereine und Scouts.",
  },
  {
    icon: FaUsers,
    title: "Teams & Kaderverwaltung",
    text: "Gründe ein Team oder tritt einem bei, verwalte deinen Kader, lade Spieler ein und organisiere alles an einem Ort.",
  },
  {
    icon: FaCalendarAlt,
    title: "Spielplan & Ergebnisse",
    text: "Trage Spiele und Ergebnisse ein, erfasse Box-Scores je Spieler und behalte kommende Partien immer im Blick.",
  },
  {
    icon: FaTrophy,
    title: "Ligen & Tabellen",
    text: "Verfolge Tabellenstände, Spielpläne und die Topscorer-Liste deiner Liga – in Echtzeit, direkt auf dem Handy.",
  },
  {
    icon: FaExchangeAlt,
    title: "Tryouts & Transfermarkt",
    text: "Schreibe Probetrainings aus oder bewirb dich, finde transferbereite Spieler und neue Vereine in deiner Region.",
  },
  {
    icon: FaRegNewspaper,
    title: "Community & News",
    text: "Teile Beiträge, folge Spielern und Teams, bleib per Benachrichtigung am Ball und lies aktuelle Basketball-News.",
  },
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

      {/* So funktionierts / Nächste Schritte – je nach Login-Status */}
      <LandingHowItWorks />

      {/* Basketball-News */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <NewsWidget />
        </div>
      </section>

      {/* CTA – nur für ausgeloggte Besucher */}
      <LandingCTA />

      <Footer />
    </div>
  );
}
