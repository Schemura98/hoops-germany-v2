import {
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaTrophy,
  FaExchangeAlt,
  FaRegNewspaper,
  FaHeart,
  FaRegComment,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Feature-Sektion der Landing-Page: asymmetrisches Zickzack statt generischer
// 3-Spalten-Icon-Karten. Jeder Block koppelt Text mit einer leichten,
// markenkonformen "Produkt-Miniatur" aus echten Tailwind-Elementen (kein
// Screenshot/Bild) – ein Mockup-Ausschnitt aus dem jeweiligen Bereich.

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

// Gemeinsamer Karten-Rahmen für alle Mini-Mockups.
function MockFrame({ children }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/60 p-5 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {children}
    </div>
  );
}

function ProfileMock() {
  return (
    <MockFrame>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-12 w-12 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
          MB
        </span>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">Max Bauer</p>
          <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide mt-0.5">
            Point Guard
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
        {[
          ["18.4", "PTS"],
          ["6.1", "AST"],
          ["4.2", "REB"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="font-black text-lg text-gray-900">{v}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function RosterMock() {
  const rows = [
    { n: 4, name: "Jonas Weber", pos: "SG" },
    { n: 11, name: "Elif Kaya", pos: "PF" },
    { n: 23, name: "Tom Richter", pos: "C" },
  ];
  return (
    <MockFrame>
      <div className="flex items-center gap-3 mb-4">
        <span className="h-9 w-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
          TB
        </span>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">Test Baskets</p>
          <p className="text-[11px] text-gray-400">12 Spieler im Kader</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.n} className="flex items-center gap-2.5 rounded-lg bg-gray-50 px-2.5 py-1.5">
            <span className="h-6 w-6 rounded-md bg-white border border-gray-200 text-[11px] font-bold text-gray-600 flex items-center justify-center flex-shrink-0">
              {r.n}
            </span>
            <span className="text-xs font-medium text-gray-800 flex-1 truncate">{r.name}</span>
            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded flex-shrink-0">
              {r.pos}
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function MatchMock() {
  return (
    <MockFrame>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center gap-1.5 w-16">
          <span className="h-10 w-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
            TB
          </span>
          <span className="text-[11px] font-semibold text-gray-600 text-center">Test Baskets</span>
        </div>
        <div className="text-center">
          <p className="font-black text-2xl text-gray-900 tracking-tight">78 : 65</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Bestätigt
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 w-16">
          <span className="h-10 w-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
            RH
          </span>
          <span className="text-[11px] font-semibold text-gray-600 text-center">Rhein Hawks</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 border-t border-gray-100 pt-3">
        <FaMapMarkerAlt className="text-brand-400 flex-shrink-0" /> Sa, 20:00 · Sporthalle Nord
      </div>
    </MockFrame>
  );
}

function TableMock() {
  const rows = [
    { pos: 1, team: "Rhein Hawks", sp: 14, pkt: 26 },
    { pos: 2, team: "Test Baskets", sp: 14, pkt: 24 },
    { pos: 3, team: "Köln Comets", sp: 14, pkt: 21 },
  ];
  return (
    <MockFrame>
      <div className="grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem] gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-1.5">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">Sp</span>
        <span className="text-center">Pkt</span>
      </div>
      <div className="space-y-1">
        {rows.map((r) => (
          <div
            key={r.pos}
            className={`grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem] gap-1 items-center rounded-lg px-1 py-1.5 ${
              r.pos === 1 ? "bg-brand-50" : ""
            }`}
          >
            <span className={`text-xs font-black ${r.pos === 1 ? "text-brand-600" : "text-gray-400"}`}>
              {r.pos}
            </span>
            <span className="text-xs font-medium text-gray-800 truncate">{r.team}</span>
            <span className="text-xs text-center text-gray-500">{r.sp}</span>
            <span className="text-xs text-center font-bold text-gray-900">{r.pkt}</span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function ScoutingMock() {
  return (
    <MockFrame>
      <span className="inline-block text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
        Tryout offen
      </span>
      <p className="text-sm font-bold text-gray-900 mb-1">Sucht: Point Guard, Flügel</p>
      <p className="text-xs text-gray-500 mb-4">Test Baskets · Bezirksliga NRW</p>
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex -space-x-2">
          {["EK", "TR", "JW"].map((i) => (
            <span
              key={i}
              className="h-7 w-7 rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            >
              {i}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-semibold text-gray-500">5 Bewerbungen</span>
      </div>
    </MockFrame>
  );
}

function FeedMock() {
  return (
    <MockFrame>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-8 w-8 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0">
          MB
        </span>
        <div>
          <p className="text-xs font-bold text-gray-900">Max Bauer</p>
          <p className="text-[10px] text-gray-400">vor 2 Std</p>
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="h-2 rounded-full bg-gray-100 w-full" />
        <div className="h-2 rounded-full bg-gray-100 w-2/3" />
      </div>
      <div className="flex items-center gap-4 text-gray-400 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <FaHeart className="text-brand-500" /> 24
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <FaRegComment /> 6
        </span>
      </div>
    </MockFrame>
  );
}

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
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-4 text-gray-900 text-balance">
          Alles, was du brauchst
        </h2>
        <p className="text-center text-gray-500 mb-16 md:mb-20 max-w-xl mx-auto">
          Von deinem Spielerprofil bis hin zu Liga-Tabellen – Hoops Germany bringt die
          deutsche Basketball-Community zusammen.
        </p>
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
                <div className="flex-1 max-w-md text-center md:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 mb-5">
                    <Icon className="text-brand-500 text-xl" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 text-balance">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.text}</p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <Visual />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
