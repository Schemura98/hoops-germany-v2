"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FaEye,
  FaUserSecret,
  FaUsers,
  FaShieldAlt,
  FaTrophy,
  FaExchangeAlt,
  FaUserPlus,
  FaBasketballBall,
  FaUserClock,
  FaMobileAlt,
  FaFileCsv,
  FaFilePdf,
  FaRedo,
} from "react-icons/fa";
import AdminShell from "@/components/layout/AdminShell";
import StatCard from "@/components/admin/StatCard";
import LineChart from "@/components/admin/LineChart";
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
  if (!items.length) return <p className="text-sm text-gray-400">{empty}</p>;
  return (
    <div className="space-y-2.5">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <span className="w-36 sm:w-44 text-xs text-gray-600 truncate">{it.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-12 text-right text-xs font-semibold text-gray-900">{nf(it.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, hint, children, right }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {right}
      </div>
      {hint && <p className="text-xs text-gray-400 mb-4">{hint}</p>}
      {children}
    </div>
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
      ["Spiele", s.platform.matches.total, s.platform.matches.newLast30, s.platform.matches.growth],
      ["Offizielle Ligen", s.platform.leagues.total, "", ""],
      ["Transferbereite Spieler", s.platform.transferAvailable, "", ""],
      ["Suchende Vereine", s.platform.recruitingTeams, "", ""],
      [],
      ["Traffic nach Bereich", "Aufrufe"],
      ...s.sections.map((x) => [x.section, x.count]),
      [],
      ["Top-Seiten", "Aufrufe"],
      ...s.topPaths.map((x) => [x.path, x.count]),
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
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t.k ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                period === p.v
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              {p.l}
            </button>
          ))}
          <button
            onClick={() => load(period)}
            title="Aktualisieren"
            className="ml-1 p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-brand-600"
          >
            <FaRedo className="text-xs" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
        </div>
      ) : !summary ? (
        <p className="text-gray-500">Keine Daten verfügbar.</p>
      ) : tab === "intern" ? (
        /* ===================== INTERNE PLATTFORM-ANALYTICS ===================== */
        <div className="space-y-6">
          <Card title="Plattform-Wachstum" hint={`Bestand & Neuzugänge · Wachstum = letzte 30 Tage ggü. Vormonatsfenster`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard icon={FaUsers} label="Registrierte Nutzer" value={summary.platform.users.total} growth={summary.platform.users.growth} sub={`+${summary.platform.users.newThisMonth} diesen Monat`} />
              <StatCard icon={FaShieldAlt} label="Teams / Vereine" value={summary.platform.teams.total} growth={summary.platform.teams.growth} sub={`+${summary.platform.teams.newThisMonth} diesen Monat`} />
              <StatCard icon={FaBasketballBall} label="Spiele" value={summary.platform.matches.total} growth={summary.platform.matches.growth} sub={`+${summary.platform.matches.newThisMonth} diesen Monat`} />
              <StatCard icon={FaTrophy} label="Offizielle Ligen" value={summary.platform.leagues.total} />
              <StatCard icon={FaExchangeAlt} label="Transferbereite Spieler" value={summary.platform.transferAvailable} />
              <StatCard icon={FaUserPlus} label="Suchende Vereine" value={summary.platform.recruitingTeams} />
              <StatCard icon={FaUserClock} label="Aktive Nutzer (7T)" value={summary.activeUsers.d7} hint="Eingeloggte Nutzer mit Aktivität" />
              <StatCard icon={FaUserClock} label="Aktive Nutzer (30T)" value={summary.activeUsers.d30} hint="Eingeloggte Nutzer mit Aktivität" />
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Aufrufe je Inhaltsbereich" hint={`Im Zeitraum: ${periodLabel}`}>
              <Bars items={summary.sections.map((s) => ({ label: s.section, value: s.count }))} />
            </Card>
            <Card title="Aufrufe einzelner Bereiche" hint={`Im Zeitraum: ${periodLabel}`}>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={FaEye} label="Profilaufrufe" value={summary.sectionViews.profiles} />
                <StatCard icon={FaEye} label="Teamseiten" value={summary.sectionViews.teams} />
                <StatCard icon={FaEye} label="Ligaseiten" value={summary.sectionViews.leagues} />
                <StatCard icon={FaEye} label="Newsfeed" value={summary.sectionViews.newsfeed} />
                <StatCard icon={FaEye} label="Transfermarkt" value={summary.sectionViews.transfermarkt} />
              </div>
            </Card>
          </div>

          <Card title="Beliebteste Seiten" hint={`Im Zeitraum: ${periodLabel}`}>
            {summary.topPaths.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Aufrufe.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {summary.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 truncate">{p.path}</span>
                    <span className="text-sm font-medium text-gray-900">{nf(p.count)}</span>
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
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm"
            >
              <FaFilePdf /> Sponsoring-Report öffnen
            </Link>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-300 text-gray-700 font-semibold rounded-xl px-4 py-2.5 text-sm"
            >
              <FaFileCsv /> CSV exportieren
            </button>
          </div>

          <Card title="Reichweite" hint={`Im Zeitraum: ${periodLabel} · Wachstum ggü. vorherigem Zeitraum`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard icon={FaEye} label="Seitenaufrufe" value={summary.reach.views.current} growth={summary.reach.views.growth} />
              <StatCard icon={FaUserSecret} label="Besucher" value={summary.reach.visitors.current} growth={summary.reach.visitors.growth} />
              <StatCard icon={FaUserPlus} label="Neue Besucher" value={summary.reach.newVisitors} />
              <StatCard icon={FaRedo} label="Wiederkehrende" value={summary.reach.returningVisitors} />
              <StatCard icon={FaEye} label="Aufrufe gesamt" value={summary.reach.viewsAllTime} hint="allzeit" />
              <StatCard icon={FaUserSecret} label="Besucher gesamt" value={summary.reach.visitorsAllTime} hint="allzeit" />
              <StatCard icon={FaUserClock} label="Aktive Nutzer (7T)" value={summary.activeUsers.d7} />
              <StatCard icon={FaUserClock} label="Aktive Nutzer (30T)" value={summary.activeUsers.d30} />
            </div>
          </Card>

          <Card title="Verlauf" hint={`Seitenaufrufe & Besucher · ${periodLabel}`}>
            <LineChart data={summary.timeseries} />
          </Card>

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
              <p className="text-sm text-gray-400">Noch keine Aufrufe.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {summary.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 truncate">{p.path}</span>
                    <span className="text-sm font-medium text-gray-900">{nf(p.count)}</span>
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
