import { PiBasketballBold } from "react-icons/pi";
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
    <span className={`text-xs font-semibold ${up ? "text-signal-ok" : "text-signal-error"}`}>
      {up ? "+" : ""}
      {v}%
    </span>
  );
}

function Kpi({ label, value, growth }) {
  return (
    <div className="rounded-md border border-navy-600 p-4">
      <p className="text-xs text-mist-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-paper-50">{typeof value === "number" ? nf(value) : value}</p>
      {growth !== undefined && <Growth v={growth} />}
    </div>
  );
}

function Bars({ items }) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  if (!items.length) return <p className="text-sm text-mist-400">Keine Daten.</p>;
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="w-40 text-xs text-mist-400 truncate">{it.label}</span>
          <div className="flex-1 bg-navy-700 rounded-full h-2.5 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-12 text-right text-xs font-semibold text-paper-50">{nf(it.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="text-base font-black text-paper-50 border-b border-navy-600 pb-1 mb-3">{title}</h2>
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
    <div className="max-w-3xl mx-auto bg-navy-800 print:shadow-none rounded-md print:rounded-none border border-navy-600 print:border-0 p-8 space-y-7">
      <header className="flex items-start justify-between gap-4 border-b border-navy-600 pb-4">
        <div>
          <div className="flex items-center gap-2 text-paper-50">
            <span className="h-9 w-9 rounded-md bg-brand-500 flex items-center justify-center text-navy-950">
              <PiBasketballBold />
            </span>
            <span className="font-black text-lg">Hoops Germany</span>
          </div>
          <p className="mt-2 text-xl font-black text-paper-50">Sponsoring-Report</p>
          {label && <p className="text-sm text-mist-400">für {label}</p>}
        </div>
        <div className="text-right text-xs text-mist-400">
          <p>Zeitraum: {PERIOD_LABEL[period] || `${period} Tage`}</p>
          {generatedAt && <p>Erstellt am {generatedAt}</p>}
        </div>
      </header>

      <p className="text-sm text-mist-400">
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
            <p className="text-xs font-semibold text-mist-300 mb-2">Nutzer nach Bundesland</p>
            <Bars items={summary.region.usersByState.slice(0, 8)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-mist-300 mb-2">Teams / Vereine nach Stadt</p>
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
              <p className="text-xs font-semibold text-mist-300 mb-2">{c.t}</p>
              <Bars items={c.items.slice(0, 5).map((i) => ({ label: i.label, value: i.count }))} />
            </div>
          ))}
        </div>
      </Section>

      {/* KORREKTUR 13.08.2026 — vorher standen hier `p.users.total` und
          `p.teams.total`. Das sind `countDocuments({})` OHNE Basisfilter
          (`lib/analyticsSummary.js` Z. 134/135), also inklusive Demo-Fixtures
          und interner Testkonten. In einem Dokument, das das Haus verlaesst,
          war das eine Falschaussage um etwa den Faktor 70 (Teams) bzw. 45
          (Nutzer). `lib/analyticsSummary.js` Z. 137 sagt ueber die gefilterten
          Zahlen woertlich, sie seien "die einzige Zahl, die man nach aussen
          zeigen duerfte" — der Report benutzte die anderen.

          ACHTUNG, noch nicht sauber: Fuer Spiele gibt es keine gefilterte
          Entsprechung, `p.matches` enthaelt sehr wahrscheinlich Demo-Spiele.
          "Offizielle Ligen" ist der Katalog (57), nicht die Zahl der Ligen mit
          echten Teams. Beide sind unten deshalb als das benannt, was sie sind,
          statt als Beteiligung ausgegeben zu werden. Endgueltige Fassung
          braucht Nele (Aussage) und einen `NUR_ECHT`-Filter fuer Matches.
          Vollstaendiger Befund: docs/RETENTION-BEFUND-2026-08-13.md */}
      <Section title="Plattform-Stärke">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Kpi label="Registrierte Nutzer" value={p.externeUsers.total} growth={p.externeUsers.growth} />
          <Kpi label="Teams / Vereine" value={p.externeTeams.total} growth={p.externeTeams.growth} />
          <Kpi label="Ligen im Katalog" value={p.leagues.total} />
          <Kpi label="Spiele inkl. Beispieldaten" value={p.matches.total} growth={p.matches.growth} />
        </div>
        <p className="mt-3 text-xs text-mist-400">
          Nutzer und Teams zählen ausschließlich externe Konten — Beispieldaten und
          interne Testkonten sind herausgerechnet.
        </p>
      </Section>

      <Section title="Beliebteste Seiten">
        <ul className="divide-y divide-navy-600">
          {summary.topPaths.slice(0, 8).map((x) => (
            <li key={x.path} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-mist-300 truncate">{x.path}</span>
              <span className="text-sm font-semibold text-paper-50">{nf(x.count)}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Werbemöglichkeiten">
        <p className="text-sm text-mist-400 mb-2">Verfügbare Werbeflächen für Sponsoren:</p>
        <div className="flex flex-wrap gap-2">
          {AD_PLACEMENTS.map((a) => (
            <span key={a} className="text-xs bg-navy-700 text-mist-300 rounded-sm px-3 py-1">
              {a}
            </span>
          ))}
        </div>
      </Section>

      <footer className="border-t border-navy-600 pt-3 text-[11px] text-mist-400">
        Hoops Germany · hoopsgermany.de · Aggregierte Statistiken{generatedAt ? `, Stand ${generatedAt}` : ""}
      </footer>
    </div>
  );
}
