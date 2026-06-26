"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { FaBasketballBall, FaPrint, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import LineChart from "@/components/admin/LineChart";
import { getAdminToken } from "@/lib/clientAuth";

const nf = (n) => (n ?? 0).toLocaleString("de-DE");
const PERIOD_LABEL = { 7: "letzte 7 Tage", 30: "letzte 30 Tage", 90: "letzte 90 Tage", 365: "letztes Jahr" };

// Verfügbare Werbeflächen (Teaser für Sponsoren; echtes Tracking folgt in Phase 3).
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
  if (!items.length) return <p className="text-sm text-gray-400">Keine Daten.</p>;
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

function ReportInner() {
  const params = useSearchParams();
  const period = [7, 30, 90, 365].includes(Number(params.get("period"))) ? Number(params.get("period")) : 30;
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | denied | error
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    setGeneratedAt(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
    (async () => {
      const token = getAdminToken();
      if (!token) {
        setStatus("denied");
        return;
      }
      try {
        const { data } = await axios.post("/api/analytics/summary", { token, period });
        setSummary(data.summary);
        setStatus("ready");
      } catch (err) {
        setStatus(err.response?.status === 401 ? "denied" : "error");
      }
    })();
  }, [period]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </div>
    );
  }
  if (status === "denied") {
    return <div className="min-h-screen flex items-center justify-center p-8 text-gray-600">Kein Zugriff – bitte als Admin anmelden.</div>;
  }
  if (status === "error" || !summary) {
    return <div className="min-h-screen flex items-center justify-center p-8 text-gray-600">Report konnte nicht geladen werden.</div>;
  }

  const p = summary.platform;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      {/* Steuerleiste (nicht im Druck) */}
      <div className="max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between print:hidden">
        <Link href="/admin/analytics" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          <FaArrowLeft className="text-xs" /> Zurück
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm"
        >
          <FaPrint /> Drucken / als PDF speichern
        </button>
      </div>

      {/* Report-Blatt */}
      <div className="max-w-3xl mx-auto bg-white print:shadow-none shadow-sm rounded-2xl print:rounded-none border border-gray-100 print:border-0 p-8 space-y-7">
        {/* Kopf */}
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-gray-900">
              <span className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <FaBasketballBall />
              </span>
              <span className="font-black text-lg">Hoops Germany</span>
            </div>
            <p className="mt-2 text-xl font-black text-gray-900">Sponsoring-Report</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Zeitraum: {PERIOD_LABEL[period]}</p>
            <p>Erstellt am {generatedAt}</p>
          </div>
        </header>

        <p className="text-sm text-gray-600">
          Hoops Germany ist die Community-Plattform für Amateur-Basketball in Deutschland. Dieser Report fasst
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
            <Kpi label="Aufrufe gesamt" value={summary.reach.viewsAllTime} />
            <Kpi label="Besucher gesamt" value={summary.reach.visitorsAllTime} />
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

        <footer className="border-t border-gray-200 pt-3 text-[11px] text-gray-400">
          Hoops Germany · hoopsgermany.de · Aggregierte Statistiken, Stand {generatedAt}
        </footer>
      </div>
    </div>
  );
}

export default function SponsorReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><FaBasketballBall className="text-brand-500 text-3xl animate-bounce" /></div>}>
      <ReportInner />
    </Suspense>
  );
}
