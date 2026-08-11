import {
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaExchangeAlt,
  FaRegNewspaper,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import {
  ProfileMock,
  RosterMock,
  MatchMock,
  TableMock,
  ScoutingMock,
  FeedMock,
} from "@/components/landing/FeatureMocks";

// Feature-Sektion der Landing-Page: asymmetrisches Zickzack statt generischer
// 3-Spalten-Icon-Karten. Jeder Block koppelt Text mit einer leichten,
// markenkonformen "Produkt-Miniatur" aus echten Tailwind-Elementen (kein
// Screenshot/Bild) – ein Mockup-Ausschnitt aus dem jeweiligen Bereich.
//
// Die Miniaturen selbst liegen in components/landing/FeatureMocks.js: Sie
// spielen beim Ins-Bild-Scrollen einmal ihre echte Funktion vor ("Ein Spielzug
// in sechs Szenen", docs/LANDING-KONZEPT-2026-08-11.md, Stufe 1).

const FEATURES = [
  {
    icon: FaChartBar,
    title: "Spielerprofile & Statistiken",
    text: "Erstelle dein Profil, sammle Punkte, Assists & Rebounds und verfolge deine komplette Karrierehistorie – sichtbar für Vereine und Scouts.",
    visual: "profile",
  },
  {
    icon: FaUsers,
    title: "Teams & Kaderverwaltung",
    text: "Gründe ein Team oder tritt einem bei, verwalte deinen Kader, lade Spieler ein und organisiere alles an einem Ort.",
    visual: "roster",
  },
  {
    icon: FaCalendarAlt,
    title: "Spielplan & Ergebnisse",
    text: "Trage Spiele und Ergebnisse ein, erfasse Box-Scores je Spieler und behalte kommende Partien immer im Blick.",
    visual: "match",
  },
  {
    icon: FaTrophy,
    title: "Ligen & Tabellen",
    text: "Verfolge Tabellenstände, Spielpläne und die Topscorer-Liste deiner Liga – in Echtzeit, direkt auf dem Handy.",
    visual: "table",
  },
  {
    icon: FaExchangeAlt,
    title: "Tryouts & Transfermarkt",
    text: "Schreibe Probetrainings aus oder bewirb dich, finde transferbereite Spieler und neue Vereine in deiner Region.",
    visual: "scouting",
  },
  {
    icon: FaRegNewspaper,
    title: "Community & News",
    text: "Teile Beiträge, folge Spielern und Teams, bleib per Benachrichtigung am Ball und lies aktuelle Basketball-News.",
    visual: "feed",
  },
];

const VISUALS = {
  profile: ProfileMock,
  roster: RosterMock,
  match: MatchMock,
  table: TableMock,
  scouting: ScoutingMock,
  feed: FeedMock,
};

export default function LandingFeatures() {
  return (
    // overflow-x-hidden: Der Einblend-Versatz der Reveal-Spalten (-translate-x-6 = 24px)
    // ist breiter als das Section-Padding (px-4 = 16px) und erzeugte sonst 8px
    // horizontalen Ueberlauf auf Mobile, solange die Karten noch nicht eingeblendet sind
    // (Befund Tobias 11.08.2026, Entscheid Vivien).
    <section className="bg-gray-50 py-20 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Reveal as="h2" className="text-3xl md:text-4xl font-black text-center mb-4 text-gray-900 text-balance">
          Alles, was du brauchst
        </Reveal>
        <Reveal
          as="p"
          delay={80}
          className="text-center text-gray-500 mb-16 md:mb-20 max-w-xl mx-auto"
        >
          Von deinem Spielerprofil bis hin zu Liga-Tabellen – Hoops Germany bringt die
          Basketball-Community in NRW zusammen.
        </Reveal>
        <div className="space-y-16 md:space-y-24">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const Visual = VISUALS[f.visual];
            const reversed = i % 2 === 1;
            return (
              <div
                key={f.title}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  reversed ? "md:flex-row-reverse" : ""
                }`}
              >
                <Reveal
                  direction={reversed ? "right" : "left"}
                  className="flex-1 max-w-md text-center md:text-left"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 mb-5">
                    <Icon className="text-brand-500 text-xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 text-balance">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.text}</p>
                </Reveal>
                <Reveal
                  delay={120}
                  direction={reversed ? "left" : "right"}
                  className="flex-1 w-full flex justify-center"
                >
                  <Visual />
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
