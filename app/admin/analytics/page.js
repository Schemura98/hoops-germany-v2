"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  PiEyeBold,
  PiUserCircleDashedBold,
  PiUsersBold,
  PiShieldCheckBold,
  PiTrophyBold,
  PiArrowsLeftRightBold,
  PiUserPlusBold,
  PiBasketballBold,
  PiUserFocusBold,
  PiDeviceMobileBold,
  PiFileCsvBold,
  PiFilePdfBold,
  PiArrowClockwiseBold,
  PiChartLineUpBold,
} from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import StatCard from "@/components/admin/StatCard";
import LineChart from "@/components/admin/LineChart";
import SharesManager from "@/components/admin/SharesManager";
import { getAdminToken } from "@/lib/clientAuth";

const PERIODS = [
  { v: 7, l: "7 Tage" },
  { v: 30, l: "30 Tage" },
  { v: 90, l: "90 Tage" },
  { v: 365, l: "1 Jahr" },
];
const TABS = [
  { k: "intern", l: "Plattform (intern)" },
  { k: "sponsor", l: "Sponsor-Report" },
];

const nf = (n) => (n ?? 0).toLocaleString("de-DE");

// Horizontale Balkenliste
function Bars({ items, empty = "Noch keine Daten." }) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;
  if (!items.length) return <p className="text-sm text-mist-400">{empty}</p>;
  return (
    <div className="space-y-2.5">
      {/* Schluessel mit Index: Beschriftungen sind nicht eindeutig (zwei Ligen
          koennen "Oberliga 1" heissen) - React warnte hier ueber doppelte
          Schluessel. Vorbestehend, beim Pruefen aufgefallen. */}
      {items.map((it, i) => (
        <div key={`${it.label}-${i}`} className="flex items-center gap-3">
          <span className="w-36 sm:w-44 text-xs text-mist-400 truncate">{it.label}</span>
          <div className="flex-1 bg-navy-700 rounded-full h-3 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-12 text-right text-xs font-semibold text-paper-50">{nf(it.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, hint, children, right }) {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-sm font-semibold text-paper-50">{title}</h2>
        {right}
      </div>
      {hint && <p className="text-xs text-mist-400 mb-4">{hint}</p>}
      {children}
    </div>
  );
}

// „Deine Zahlen stehen" – trägt der Wiederaufrufgrund aus Ronjas Befund R1?
// Versendet vs. geöffnet. Bewusst nur diese zwei Zahlen: eine Öffnungsquote ohne
// Versand wäre erfunden, deshalb wird sie bei 0 gar nicht gezeigt.
function OwnStatsCard({ os, period }) {
  if (!os) return null;
  return (
    <Card
      title="Benachrichtigung „Deine Zahlen stehen“"
      hint={`Spieler über ihre eigenen Werte im Box-Score informiert · ${period}`}
      right={
        os.openRate !== null && (
          <span className="font-mono text-xs tabular-nums text-brand-400">
            {os.openRate}% geöffnet
          </span>
        )
      }
    >
      {os.notified === 0 ? (
        <p className="text-sm text-mist-400">
          Im gewählten Zeitraum wurde noch keine solche Benachrichtigung versendet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={PiChartLineUpBold} label="Versendet" value={os.notified} />
          <StatCard icon={PiUsersBold} label="Erreichte Spieler" value={os.notifiedPlayers} />
          <StatCard icon={PiEyeBold} label="Geöffnet" value={os.opened} />
        </div>
      )}
    </Card>
  );
}

const fmtDur = (sec) => {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
};

// Phase 2: Nutzung/Engagement
function EngagementCards({ eng, period }) {
  return (
    <Card title="Nutzung & Engagement" hint={`Sitzungen (30-Min-Inaktivität) · ${period}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={PiUserFocusBold} label="Sitzungen" value={eng.sessions} />
        <StatCard icon={PiEyeBold} label="Seiten / Sitzung" value={eng.pagesPerSession} />
        <StatCard icon={PiUserFocusBold} label="Ø Sitzungsdauer" value={fmtDur(eng.avgDurationSec)} />
      </div>
    </Card>
  );
}

// Phase 2: Regionale Stärke (aus Profildaten – aggregiert)
function RegionCard({ region }) {
  return (
    <Card title="Regionale Stärke" hint="Aus Profilangaben (aggregiert, keine personenbezogenen Daten)">
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-xs font-semibold text-mist-300 mb-2">Nutzer nach Bundesland</p>
          <Bars items={region.usersByState} empty="Keine Regionsangaben." />
        </div>
        <div>
          <p className="text-xs font-semibold text-mist-300 mb-2">Nutzer nach Stadt</p>
          <Bars items={region.usersByCity} empty="Keine Stadtangaben." />
        </div>
        <div>
          <p className="text-xs font-semibold text-mist-300 mb-2">Teams / Vereine nach Stadt</p>
          <Bars items={region.teamsByCity} empty="Keine Teamstandorte." />
        </div>
        <div>
          <p className="text-xs font-semibold text-mist-300 mb-2">
            Besucher nach Bundesland <span className="font-normal text-mist-400">(eingeloggt)</span>
          </p>
          <Bars items={region.visitorsByState} empty="Noch keine eingeloggten Besucher mit Region." />
        </div>
      </div>
    </Card>
  );
}

// Phase 2: Content-Performance (beliebteste Inhalte nach Aufrufen)
function ContentCard({ content, period }) {
  const cols = [
    { title: "Beliebteste Spielerprofile", items: content.topPlayers },
    { title: "Beliebteste Teams", items: content.topTeams },
    { title: "Beliebteste Ligen", items: content.topLeagues },
  ];
  return (
    <Card title="Beliebteste Inhalte" hint={`Nach Aufrufen · ${period}`}>
      <div className="grid sm:grid-cols-3 gap-x-6 gap-y-4">
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold text-mist-300 mb-2">{c.title}</p>
            <Bars items={c.items.map((i) => ({ label: i.label, value: i.count }))} empty="Noch keine Aufrufe." />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [tab, setTab] = useState("intern");

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/analytics/summary", { token, period: p });
      setSummary(data.summary);
    } catch {
      /* ignorieren */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  function exportCsv() {
    if (!summary) return;
    const s = summary;
    const rows = [
      ["Hoops Germany – Analytics-Export"],
      ["Zeitraum (Tage)", s.period],
      [],
      ["Reichweite (Zeitraum)", "Wert", "Wachstum %"],
      ["Seitenaufrufe", s.reach.views.current, s.reach.views.growth],
      ["Besucher", s.reach.visitors.current, s.reach.visitors.growth],
      ["Neue Besucher", s.reach.newVisitors, ""],
      ["Wiederkehrende Besucher", s.reach.returningVisitors, ""],
      ["Seitenaufrufe gesamt (allzeit)", s.reach.viewsAllTime, ""],
      ["Besucher gesamt (allzeit)", s.reach.visitorsAllTime, ""],
      ["Aktive Nutzer (7 Tage)", s.activeUsers.d7, ""],
      ["Aktive Nutzer (30 Tage)", s.activeUsers.d30, ""],
      [],
      ["Geräte", "Aufrufe"],
      ["Mobil", s.devices.mobile],
      ["Desktop", s.devices.desktop],
      ["Tablet", s.devices.tablet],
      [],
      ["Plattform", "Gesamt", "Neu (30T)", "Wachstum %"],
      ["Registrierte Nutzer", s.platform.users.total, s.platform.users.newLast30, s.platform.users.growth],
      ["Teams / Vereine", s.platform.teams.total, s.platform.teams.newLast30, s.platform.teams.growth],
      ["davon extern (ohne Beispieldaten/intern)", s.platform.externeTeams.total, s.platform.externeTeams.newLast30, s.platform.externeTeams.growth],
      ["Nutzer extern (ohne Beispieldaten/intern)", s.platform.externeUsers.total, s.platform.externeUsers.newLast30, s.platform.externeUsers.growth],
      ["Spiele", s.platform.matches.total, s.platform.matches.newLast30, s.platform.matches.growth],
      ["Offizielle Ligen", s.platform.leagues.total, "", ""],
      ["Transferbereite Spieler", s.platform.transferAvailable, "", ""],
      ["Suchende Vereine", s.platform.recruitingTeams, "", ""],
      [],
      ["Registrierungen nach Quelle (?src=)", "Anzahl"],
      ...s.signupSources.map((x) => [x.src, x.count]),
      [],
      ["Traffic nach Bereich", "Aufrufe"],
      ...s.sections.map((x) => [x.section, x.count]),
      [],
      ["Top-Seiten", "Aufrufe"],
      ...s.topPaths.map((x) => [x.path, x.count]),
      [],
      ["Nutzung", "Wert"],
      ["Sitzungen", s.engagement.sessions],
      ["Seiten / Sitzung", s.engagement.pagesPerSession],
      ["Ø Sitzungsdauer (Sek.)", s.engagement.avgDurationSec],
      [],
      ["Nutzer nach Bundesland", "Anzahl"],
      ...s.region.usersByState.map((x) => [x.label, x.value]),
      [],
      ["Beliebteste Spielerprofile", "Aufrufe"],
      ...s.content.topPlayers.map((x) => [x.label, x.count]),
      [],
      ["Beliebteste Teams", "Aufrufe"],
      ...s.content.topTeams.map((x) => [x.label, x.count]),
      [],
      ["Beliebteste Ligen", "Aufrufe"],
      ...s.content.topLeagues.map((x) => [x.label, x.count]),
    ];
    const csv =
      "﻿" +
      rows
        .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
        .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoops-analytics-${s.period}tage.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const periodLabel = PERIODS.find((p) => p.v === period)?.l || `${period} Tage`;

  return (
    <AdminShell title="Analytics">
      {/* Steuerleiste: Tabs + Zeitraum */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-1 bg-navy-700 rounded-md p-1">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${
                tab === t.k ? "bg-navy-800 text-paper-50" : "text-mist-400 hover:text-paper-50"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 sm:ml-auto">
          {PERIODS.map((p) => (
            <button
              key={p.v}
              onClick={() => setPeriod(p.v)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition ${
                period === p.v
                  ? "bg-brand-500 text-navy-950"
                  : "bg-navy-800 border border-navy-600 text-mist-400 hover:border-brand-300"
              }`}
            >
              {p.l}
            </button>
          ))}
          <button
            onClick={() => load(period)}
            title="Aktualisieren"
            className="ml-1 p-2 rounded-sm bg-navy-800 border border-navy-600 text-mist-400 hover:text-brand-400"
          >
            <PiArrowClockwiseBold className="text-xs" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <PiBasketballBold className="text-brand-400 text-3xl animate-bounce" />
        </div>
      ) : !summary ? (
        <p className="text-mist-400">Keine Daten verfügbar.</p>
      ) : tab === "intern" ? (
        /* ===================== INTERNE PLATTFORM-ANALYTICS ===================== */
        <div className="space-y-6">
          <Card title="Plattform-Wachstum" hint={`Bestand & Neuzugänge · Wachstum = letzte 30 Tage ggü. Vormonatsfenster`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard icon={PiUsersBold} label="Registrierte Nutzer" value={summary.platform.users.total} growth={summary.platform.users.growth} sub={`+${summary.platform.users.newThisMonth} diesen Monat`} />
              <StatCard icon={PiShieldCheckBold} label="Teams / Vereine" value={summary.platform.teams.total} growth={summary.platform.teams.growth} sub={`+${summary.platform.teams.newThisMonth} diesen Monat`} />
              <StatCard icon={PiBasketballBold} label="Spiele" value={summary.platform.matches.total} growth={summary.platform.matches.growth} sub={`+${summary.platform.matches.newThisMonth} diesen Monat`} />
              <StatCard icon={PiTrophyBold} label="Offizielle Ligen" value={summary.platform.leagues.total} />
              <StatCard icon={PiArrowsLeftRightBold} label="Transferbereite Spieler" value={summary.platform.transferAvailable} />
              <StatCard icon={PiUserPlusBold} label="Suchende Vereine" value={summary.platform.recruitingTeams} />
              <StatCard icon={PiUserFocusBold} label="Aktive Nutzer (7T)" value={summary.activeUsers.d7} hint="Eingeloggte Nutzer mit Aktivität" />
              <StatCard icon={PiUserFocusBold} label="Aktive Nutzer (30T)" value={summary.activeUsers.d30} hint="Eingeloggte Nutzer mit Aktivität" />
            </div>
          </Card>

          <Card
            title="Echte Beteiligung (ohne Beispieldaten und interne Testkonten)"
            hint="Nur diese Zahlen dürfen nach außen – Demo-Fixtures und eigene Testkonten sind herausgerechnet"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={PiShieldCheckBold}
                label="Externe Teams"
                value={summary.platform.externeTeams.total}
                growth={summary.platform.externeTeams.growth}
                sub={`+${summary.platform.externeTeams.newThisMonth} diesen Monat`}
              />
              <StatCard
                icon={PiUsersBold}
                label="Externe Nutzer"
                value={summary.platform.externeUsers.total}
                growth={summary.platform.externeUsers.growth}
                sub={`+${summary.platform.externeUsers.newThisMonth} diesen Monat`}
              />
              <StatCard
                icon={PiShieldCheckBold}
                label="davon nicht gezählt: Beispiel/intern"
                value={summary.platform.teams.total - summary.platform.externeTeams.total}
                hint="Teams mit Kennzeichnung Beispieldaten oder intern, plus noch nicht freigegebene"
              />
              <StatCard
                icon={PiUsersBold}
                label="Schwelle für eine öffentliche Zahl"
                value={20}
                hint="Nele: ab 20–25 verifizierten externen Teams, und nur wenn die Zahl sich über Wochen bewegt"
              />
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Aufrufe je Inhaltsbereich" hint={`Im Zeitraum: ${periodLabel}`}>
              <Bars items={summary.sections.map((s) => ({ label: s.section, value: s.count }))} />
            </Card>
            <Card title="Aufrufe einzelner Bereiche" hint={`Im Zeitraum: ${periodLabel}`}>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={PiEyeBold} label="Profilaufrufe" value={summary.sectionViews.profiles} />
                <StatCard icon={PiEyeBold} label="Teamseiten" value={summary.sectionViews.teams} />
                <StatCard icon={PiEyeBold} label="Ligaseiten" value={summary.sectionViews.leagues} />
                <StatCard icon={PiEyeBold} label="Newsfeed" value={summary.sectionViews.newsfeed} />
                <StatCard icon={PiEyeBold} label="Transfermarkt" value={summary.sectionViews.transfermarkt} />
              </div>
            </Card>
          </div>

          <EngagementCards eng={summary.engagement} period={periodLabel} />
          <RegionCard region={summary.region} />
          <ContentCard content={summary.content} period={periodLabel} />
          <OwnStatsCard os={summary.ownStats} period={periodLabel} />

          {summary.signupSources?.length > 0 && (
            <Card title="Registrierungen nach Quelle" hint="Aus ?src= beim Registrieren (z.B. Flyer-QR-Codes) · allzeit, nur echte Accounts">
              <Bars items={summary.signupSources.map((s) => ({ label: s.src, value: s.count }))} />
            </Card>
          )}

          <Card title="Beliebteste Seiten" hint={`Im Zeitraum: ${periodLabel}`}>
            {summary.topPaths.length === 0 ? (
              <p className="text-sm text-mist-400">Noch keine Aufrufe.</p>
            ) : (
              <ul className="divide-y divide-navy-600">
                {summary.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between py-2">
                    <span className="text-sm text-mist-300 truncate">{p.path}</span>
                    <span className="text-sm font-medium text-paper-50">{nf(p.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : (
        /* ===================== SPONSOR-REPORT ===================== */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/sponsor-report?period=${period}`}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-navy-950 font-semibold rounded-md px-4 py-2.5 text-sm"
            >
              <PiFilePdfBold /> Sponsoring-Report öffnen
            </Link>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 bg-navy-800 border border-navy-600 hover:border-brand-300 text-mist-300 font-semibold rounded-md px-4 py-2.5 text-sm"
            >
              <PiFileCsvBold /> CSV exportieren
            </button>
          </div>

          <Card title="Teilbare Sponsor-Reports" hint="Passwortgeschützte Links zum Versenden an (potenzielle) Sponsoren – zeigen nur aggregierte Zahlen">
            <SharesManager />
          </Card>

          <Card title="Reichweite" hint={`Im Zeitraum: ${periodLabel} · Wachstum ggü. vorherigem Zeitraum`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard icon={PiEyeBold} label="Seitenaufrufe" value={summary.reach.views.current} growth={summary.reach.views.growth} />
              <StatCard icon={PiUserCircleDashedBold} label="Besucher" value={summary.reach.visitors.current} growth={summary.reach.visitors.growth} />
              <StatCard icon={PiUserPlusBold} label="Neue Besucher" value={summary.reach.newVisitors} />
              <StatCard icon={PiArrowClockwiseBold} label="Wiederkehrende" value={summary.reach.returningVisitors} />
              <StatCard icon={PiEyeBold} label="Aufrufe gesamt" value={summary.reach.viewsAllTime} hint="allzeit" />
              <StatCard icon={PiUserCircleDashedBold} label="Besucher gesamt" value={summary.reach.visitorsAllTime} hint="allzeit" />
              <StatCard icon={PiUserFocusBold} label="Aktive Nutzer (7T)" value={summary.activeUsers.d7} />
              <StatCard icon={PiUserFocusBold} label="Aktive Nutzer (30T)" value={summary.activeUsers.d30} />
            </div>
          </Card>

          <Card title="Verlauf" hint={`Seitenaufrufe & Besucher · ${periodLabel}`}>
            <LineChart data={summary.timeseries} />
          </Card>

          <EngagementCards eng={summary.engagement} period={periodLabel} />
          <RegionCard region={summary.region} />
          <ContentCard content={summary.content} period={periodLabel} />

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Geräte" hint={`Aufrufe nach Gerätetyp · ${periodLabel}`}>
              <Bars
                items={[
                  { label: "Mobil", value: summary.devices.mobile },
                  { label: "Desktop", value: summary.devices.desktop },
                  { label: "Tablet", value: summary.devices.tablet },
                  ...(summary.devices.unbekannt ? [{ label: "Unbekannt (Altdaten)", value: summary.devices.unbekannt }] : []),
                ]}
              />
            </Card>
            <Card title="Beliebteste Bereiche" hint={`Aufrufe je Inhaltsbereich · ${periodLabel}`}>
              <Bars items={summary.sections.map((s) => ({ label: s.section, value: s.count }))} />
            </Card>
          </div>

          <Card title="Beliebteste Seiten" hint={`Im Zeitraum: ${periodLabel}`}>
            {summary.topPaths.length === 0 ? (
              <p className="text-sm text-mist-400">Noch keine Aufrufe.</p>
            ) : (
              <ul className="divide-y divide-navy-600">
                {summary.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between py-2">
                    <span className="text-sm text-mist-300 truncate">{p.path}</span>
                    <span className="text-sm font-medium text-paper-50">{nf(p.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
