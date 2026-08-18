import {
  PiChartBarBold,
  PiUsersBold,
  PiCalendarBlankBold,
  PiTrophyBold,
  PiArrowsLeftRightBold,
  PiNewspaperClippingBold,
} from "react-icons/pi";
import Reveal from "@/components/ui/Reveal";
import FeatureProgressRail from "@/components/landing/FeatureProgressRail";
import FeatureFocus from "@/components/landing/FeatureFocus";
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

// BELEG-AUSSAGE-PRINZIP – geprüft von tests/e2e/beleg-aussage.spec.mjs.
// Die Karte „Spielplan & Ergebnisse" beschreibt das VERFAHREN der doppelten
// Bestätigung, sie behauptet es nicht für ein konkretes Spiel. `beidseitigBelegt`
// ist hier nicht anwendbar, weil es kein Spiel gibt.
//
// ⚠️ Diese Fläche war bis zum 18.08.2026 UNGEPRÜFT, obwohl sie seit jeher eine
// Beleg-Aussage trifft: Der Wächter suchte nach „doppelt bestätigt" in
// Kleinschreibung, hier steht „Doppelt bestätigt". Ein Test, der an einer
// Vokabel hängt, hängt auch an ihrer Schreibweise.
const FEATURES = [
  {
    icon: PiChartBarBold,
    eyebrow: "Aufstellung",
    title: "Spielerprofile & Statistiken",
    // "sichtbar für Vereine und Scouts" ist raus – gleich aus zwei Gründen:
    // Es sagt, was jede Plattform sagt, UND es unterstellt, dass Vereine bereits
    // suchen. Tun sie nicht (Stand: 1 externes Team). Der neue Satz nennt
    // stattdessen das, was die Plattform strukturell kann und sonst niemand:
    // Die Zahlen sind nicht die eigene Behauptung des Spielers.
    // Bewusst als Systemregel formuliert, nicht als Gütesiegel für die konkret
    // angezeigten Werte – siehe Kommentar in PlayerProfileView.js.
    text: "Erstelle dein Profil, sammle Punkte, Assists & Rebounds und verfolge deine komplette Karrierehistorie – bestätigt vom Gegner, nicht nur von dir eingetragen.",
    visual: "profile",
  },
  {
    icon: PiUsersBold,
    eyebrow: "Kader füllt sich",
    title: "Teams & Kaderverwaltung",
    text: "Gründe ein Team oder tritt einem bei, verwalte deinen Kader, lade Spieler ein und organisiere alles an einem Ort.",
    visual: "roster",
  },
  {
    icon: PiCalendarBlankBold,
    eyebrow: "Doppelt bestätigt",
    title: "Spielplan & Ergebnisse",
    // Der bisherige Text erwähnte die doppelte Bestätigung nicht – genau das ist
    // aber der Vertrauensunterschied der Plattform und die stärkste Szene daneben.
    text: "Beide Teams tragen ihr Ergebnis unabhängig ein – erst wenn sie übereinstimmen, ist es bestätigt. Dazu Box-Scores je Spieler und der komplette Spielplan im Blick.",
    visual: "match",
  },
  {
    icon: PiTrophyBold,
    eyebrow: "Tabelle sortiert sich",
    title: "Ligen & Tabellen",
    // „in Echtzeit" behauptete einen Live-Ticker, den es bewusst nicht gibt –
    // die Tabelle aktualisiert sich, sobald ein Ergebnis bestätigt ist.
    text: "Nach jedem bestätigten Spiel setzt sich die Tabelle neu – Topscorer und Spielplan deiner Liga direkt auf dem Handy.",
    visual: "table",
  },
  {
    icon: PiArrowsLeftRightBold,
    eyebrow: "Der nächste Zug",
    title: "Tryouts & Transfermarkt",
    text: "Schreibe Probetrainings aus oder bewirb dich, finde transferbereite Spieler und neue Vereine in deiner Region.",
    visual: "scouting",
  },
  {
    icon: PiNewspaperClippingBold,
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
    // overflow-x-clip statt -hidden: Der Einblend-Versatz der Reveal-Spalten
    // (-translate-x-6 = 24px) ist breiter als das Section-Padding (px-4 = 16px) und
    // erzeugte sonst 8px horizontalen Ueberlauf (Befund Tobias, Entscheid Vivien).
    // ABER: overflow-hidden macht die Section zum Scroll-Container und setzt damit
    // jedes position:sticky darin ausser Kraft - genau daran ist die Fortschritts-
    // Anzeige gescheitert (zweiter Befund Tobias, 12.08.2026). `clip` schneidet
    // identisch ab, ohne einen Scroll-Container zu erzeugen.
    <section className="relative bg-navy-950 py-20 px-4 overflow-x-clip">
      {/* A1 (Mechanik-Katalog, docs/SPIELFELD-STRECKE-2026-08-12.md-Umfeld):
          Die Überschrift läuft ohne Zeilenumbruch über beide Bildränder hinaus.
          Bewusst AUSSERHALB von `max-w-6xl mx-auto` platziert: Der Full-Bleed-
          Trick (`left-1/2 w-screen -translate-x-1/2`) bezieht `left:50%` auf die
          Containing-Box des Elternelements – innerhalb des schmalen
          max-w-Containers wären das 50 % von dessen Breite, nicht der
          Viewport-Breite. Direkt im `<section>` (das selbst kein max-w hat)
          stimmt die Rechnung.
          Nachtrag Patrick (12.08.2026, deutschlandweite Perspektive): Der
          Überstand darf nicht auf DIESEN Wortlaut hin ausgemessen sein, sonst
          ist er eine Falle für jeden künftigen Text. Deshalb kein fixer
          Pixel-/Transform-Wert, sondern `clamp(min, Nvw, max)` + `nowrap` +
          `overflow-x-clip` (schon am `<section>` vorhanden) – das funktioniert
          für jede Zeichenlänge gleich: laengerer Text ueberlaeuft automatisch
          mehr, kuerzerer weniger, nichts davon ist von Hand fuer "Eine Saison,
          sechs Spielzüge" nachjustiert. Verifiziert mit `tmp/a1-check.mjs`
          (Original-Text UND eine doppelt so lange Test-Ueberschrift). */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 mb-6">
        {/* Zweite, von Reveal UNBERÜHRTE Zentrierungs-Ebene: `inline-block` +
            `left-1/2` + `-translate-x-1/2` schrumpft die Box auf die
            tatsächliche Textbreite (Voraussetzung für symmetrischen Überstand)
            und zentriert sie exakt. Zentriert wird NICHT über
            `text-align:center` (per tmp/a1-check.mjs gemessen: bei einem
            Inline-Block, der breiter als sein Container ist, hing das Ergebnis
            vom Browser ab und lief einseitig statt symmetrisch über).
            Diese Ebene ist bewusst ein einfaches `<div>`, NICHT das `<Reveal>`
            selbst: Reveal schreibt beim Sichtbarwerden selbst `translate-x-0`
            in dieselbe Klassenkaskade – in Tailwinds generiertem CSS kann das
            je nach Regel-Reihenfolge die eigene `-translate-x-1/2` wieder
            überschreiben (genau das ist beim ersten Versuch passiert, per
            tmp/a1-verify2.mjs nach echtem Sichtbarwerden nachgemessen: die
            Überschrift stand plötzlich einseitig am Bildschirmrand statt
            symmetrisch). Reveal bekommt die Zentrierung deshalb schon fertig
            und muss selbst nur noch senkrecht einblenden. */}
        <div className="relative left-1/2 inline-block -translate-x-1/2">
          <Reveal
            as="h2"
            className="block whitespace-nowrap font-display uppercase tracking-tight font-black text-paper-50"
            style={{ fontSize: "clamp(3rem, 9vw, 7rem)" }}
          >
            Eine Saison, sechs Spielzüge
          </Reveal>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <Reveal
          as="p"
          delay={80}
          className="text-center text-mist-400 mb-16 md:mb-20 max-w-xl mx-auto"
        >
          Vom eigenen Profil bis zur Liga-Tabelle: So läuft eine Saison bei Hoops Germany
          ab – Schritt für Schritt, mitten in der Basketball-Community NRW.
        </Reveal>
        <FeatureProgressRail labels={FEATURES.map((f) => f.eyebrow)} />

        <FeatureFocus className="space-y-16 md:space-y-24">
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
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-brand-500/15 mb-5">
                    <Icon className="text-brand-400 text-xl" />
                  </div>
                  {f.eyebrow && (
                    // Kapitelmarke (Mechanik A5, Video-Sweep 12.08.2026): grosse
                    // Konturziffer + gepunktete Linie + Etikett. Ersetzt die
                    // fruehere Miniaturzeile "1/6 · Aufstellung", die die
                    // Gliederung zwar benannte, aber nicht sichtbar machte.
                    //
                    // Drei bewusste Entscheidungen:
                    // 1. Die Ziffer ist DEKORATION (aria-hidden) - die Zaehlung
                    //    "Schritt x von 6" steht als sr-only-Text daneben, sonst
                    //    ginge sie fuer Screenreader verloren.
                    // 2. Kontur statt Flaeche: Big Shoulders traegt laut
                    //    VISUELLE-RICHTUNG ausdruecklich "grosse Zahlen"; eine
                    //    gefuellte Ziffer dieser Groesse wuerde die Ueberschrift
                    //    daneben erschlagen.
                    // 3. Die Linie waechst nur bis 3rem - sie soll gliedern,
                    //    nicht die Textspalte teilen.
                    <div className="mb-4 flex items-center gap-3 justify-center md:justify-start">
                      <span className="sr-only">Schritt {i + 1} von {FEATURES.length}: </span>
                      <span
                        aria-hidden="true"
                        className="font-display font-black leading-none select-none text-[3.25rem] md:text-[4rem] text-transparent [-webkit-text-stroke:1.5px_#F68C3E]"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        aria-hidden="true"
                        className="hidden sm:block w-12 border-t border-dashed border-navy-600"
                      />
                      <span className="font-display rounded-sm border border-navy-600 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-400">
                        {f.eyebrow}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-black text-paper-50 mb-3 text-balance">{f.title}</h3>
                  <p className="text-mist-400 leading-relaxed">{f.text}</p>
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
        </FeatureFocus>
      </div>
    </section>
  );
}
