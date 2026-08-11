import {
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaExchangeAlt,
  FaRegNewspaper,
} from "react-icons/fa";
import Reveal from "@/components/ui/Reveal";
import FeatureProgressRail from "@/components/landing/FeatureProgressRail";
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
    eyebrow: "Aufstellung",
    title: "Spielerprofile & Statistiken",
    text: "Erstelle dein Profil, sammle Punkte, Assists & Rebounds und verfolge deine komplette Karrierehistorie – sichtbar für Vereine und Scouts.",
    visual: "profile",
  },
  {
    icon: FaUsers,
    eyebrow: "Kader füllt sich",
    title: "Teams & Kaderverwaltung",
    text: "Gründe ein Team oder tritt einem bei, verwalte deinen Kader, lade Spieler ein und organisiere alles an einem Ort.",
    visual: "roster",
  },
  {
    icon: FaCalendarAlt,
    eyebrow: "Doppelt bestätigt",
    title: "Spielplan & Ergebnisse",
    // Der bisherige Text erwähnte die doppelte Bestätigung nicht – genau das ist
    // aber der Vertrauensunterschied der Plattform und die stärkste Szene daneben.
    text: "Beide Teams tragen ihr Ergebnis unabhängig ein – erst wenn sie übereinstimmen, ist es bestätigt. Dazu Box-Scores je Spieler und der komplette Spielplan im Blick.",
    visual: "match",
  },
  {
    icon: FaTrophy,
    eyebrow: "Tabelle sortiert sich",
    title: "Ligen & Tabellen",
    // „in Echtzeit" behauptete einen Live-Ticker, den es bewusst nicht gibt –
    // die Tabelle aktualisiert sich, sobald ein Ergebnis bestätigt ist.
    text: "Nach jedem bestätigten Spiel setzt sich die Tabelle neu – Topscorer und Spielplan deiner Liga direkt auf dem Handy.",
    visual: "table",
  },
  {
    icon: FaExchangeAlt,
    eyebrow: "Der nächste Zug",
    title: "Tryouts & Transfermarkt",
    text: "Schreibe Probetrainings aus oder bewirb dich, finde transferbereite Spieler und neue Vereine in deiner Region.",
    visual: "scouting",
  },
  {
    icon: FaRegNewspaper,
    eyebrow: "Nachspielzeit",
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
    <section className="relative bg-gray-50 py-20 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <Reveal as="h2" className="text-3xl md:text-4xl font-black text-center mb-4 text-gray-900 text-balance">
          Eine Saison, sechs Spielzüge
        </Reveal>
        <Reveal
          as="p"
          delay={80}
          className="text-center text-gray-500 mb-16 md:mb-20 max-w-xl mx-auto"
        >
          Vom eigenen Profil bis zur Liga-Tabelle: So läuft eine Saison bei Hoops Germany
          ab – Schritt für Schritt, mitten in der Basketball-Community NRW.
        </Reveal>
        <FeatureProgressRail labels={FEATURES.map((f) => f.eyebrow)} />

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
                  {f.eyebrow && (
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
                      <span className="text-gray-400">{i + 1}/6 ·</span> {f.eyebrow}
                    </p>
                  )}
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
