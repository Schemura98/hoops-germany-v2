import { FaBasketballBall } from "react-icons/fa";
import LineChart from "@/components/admin/LineChart";

const nf = (n) => (n ?? 0).toLocaleString("de-DE");
const fmtDur = (sec) => {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
};
const PERIOD_LABEL = { 7: "letzte 7 Tage", 30: "letzte 30 Tage", 90: "letzte 90 Tage", 365: "letztes Jahr" };

const AD_PLACEMENTS = [
  "Startseiten-Banner (oben)",
  "Newsfeed-Banner",
  "Liga-Seiten-Banner",
  "Teamseiten-Banner",
  "Spielerprofil-Banner",
  "Transfermarkt-Banner",
];

function Growth({ v }) {
  if (v === null || v === undefined) return null;
  const up = v >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-green-600" : "text-red-600"}`}>
      {up ? "+" : ""}
      {v}%
    </span>
  );
}

function Kpi({ label, value, growth }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{typeof value === "number" ? nf(value) : value}</p>
      {growth !== undefined && <Growth v={growth} />}
    </div>
  );
}

function Bars({ items }) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  if (!items.length) return <p className="text-sm text-gray-500">Keine Daten.</p>;
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="w-40 text-xs text-gray-600 truncate">{it.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-12 text-right text-xs font-semibold text-gray-900">{nf(it.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="text-base font-black text-gray-900 border-b border-gray-200 pb-1 mb-3">{title}</h2>
      {children}
    </section>
  );
}

// Präsentationsfertiges Report-Blatt (aggregierte Zahlen). Wird vom Admin-Report
// UND von der öffentlichen, passwortgeschützten Sponsor-Seite genutzt.
export default function SponsorReportView({ summary, period, generatedAt, label }) {
  if (!summary) return null;
  const p = summary.platform;
  return (
    <div className="max-w-3xl mx-auto bg-white print:shadow-none shadow-sm rounded-2xl print:rounded-none border border-gray-100 print:border-0 p-8 space-y-7">
      <header className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <span className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
              <FaBasketballBall />
            </span>
            <span className="font-black text-lg">Hoops Germany</span>
          </div>
          <p className="mt-2 text-xl font-black text-gray-900">Sponsoring-Report</p>
          {label && <p className="text-sm text-gray-500">für {label}</p>}
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Zeitraum: {PERIOD_LABEL[period] || `${period} Tage`}</p>
          {generatedAt && <p>Erstellt am {generatedAt}</p>}
        </div>
      </header>

      <p className="text-sm text-gray-600">
        Hoops Germany ist die Community-Plattform für Amateur-Basketball in NRW. Dieser Report fasst
        Reichweite, Wachstum, Zielgruppe und beliebteste Inhalte zusammen – alle Angaben sind aggregiert
        (keine personenbezogenen Daten).
      </p>

      <Section title="Reichweite">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Seitenaufrufe" value={summary.reach.views.current} growth={summary.reach.views.growth} />
          <Kpi label="Besucher" value={summary.reach.visitors.current} growth={summary.reach.visitors.growth} />
          <Kpi label="Neue Besucher" value={summary.reach.newVisitors} />
          <Kpi label="Wiederkehrende" value={summary.reach.returningVisitors} />
          <Kpi label="Aktive Nutzer (30T)" value={summary.activeUsers.d30} />
          <Kpi label="Sitzungen" value={summary.engagement.sessions} />
          <Kpi label="Seiten / Sitzung" value={summary.engagement.pagesPerSession} />
          <Kpi label="Ø Sitzungsdauer" value={fmtDur(summary.engagement.avgDurationSec)} />
        </div>
      </Section>

      <Section title="Verlauf">
        <LineChart data={summary.timeseries} height={180} />
      </Section>

      <div className="grid sm:grid-cols-2 gap-6">
        <Section title="Zielgruppe · Geräte">
          <Bars
            items={[
              { label: "Mobil", value: summary.devices.mobile },
              { label: "Desktop", value: summary.devices.desktop },
              { label: "Tablet", value: summary.devices.tablet },
            ]}
          />
        </Section>
        <Section title="Beliebteste Bereiche">
          <Bars items={summary.sections.slice(0, 6).map((s) => ({ label: s.section, value: s.count }))} />
        </Section>
      </div>

      <Section title="Regionale Stärke">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Nutzer nach Bundesland</p>
            <Bars items={summary.region.usersByState.slice(0, 8)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Teams / Vereine nach Stadt</p>
            <Bars items={summary.region.teamsByCity.slice(0, 8)} />
          </div>
        </div>
      </Section>

      <Section title="Beliebteste Inhalte">
        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-4">
          {[
            { t: "Spielerprofile", items: summary.content.topPlayers },
            { t: "Teams", items: summary.content.topTeams },
            { t: "Ligen", items: summary.content.topLeagues },
          ].map((c) => (
            <div key={c.t}>
              <p className="text-xs font-semibold text-gray-700 mb-2">{c.t}</p>
              <Bars items={c.items.slice(0, 5).map((i) => ({ label: i.label, value: i.count }))} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Plattform-Stärke">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Registrierte Nutzer" value={p.users.total} growth={p.users.growth} />
          <Kpi label="Teams / Vereine" value={p.teams.total} growth={p.teams.growth} />
          <Kpi label="Offizielle Ligen" value={p.leagues.total} />
          <Kpi label="Spiele" value={p.matches.total} growth={p.matches.growth} />
        </div>
      </Section>

      <Section title="Beliebteste Seiten">
        <ul className="divide-y divide-gray-100">
          {summary.topPaths.slice(0, 8).map((x) => (
            <li key={x.path} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700 truncate">{x.path}</span>
              <span className="text-sm font-semibold text-gray-900">{nf(x.count)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Werbemöglichkeiten">
        <p className="text-sm text-gray-600 mb-2">Verfügbare Werbeflächen für Sponsoren:</p>
        <div className="flex flex-wrap gap-2">
          {AD_PLACEMENTS.map((a) => (
            <span key={a} className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">
              {a}
            </span>
          ))}
        </div>
      </Section>

      <footer className="border-t border-gray-200 pt-3 text-[11px] text-gray-500">
        Hoops Germany · hoopsgermany.de · Aggregierte Statistiken{generatedAt ? `, Stand ${generatedAt}` : ""}
      </footer>
    </div>
  );
}
