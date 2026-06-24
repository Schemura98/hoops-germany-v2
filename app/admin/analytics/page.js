"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaUserSecret, FaUsers, FaShieldAlt, FaTrophy, FaExchangeAlt, FaUserPlus } from "react-icons/fa";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = getAdminToken();
        const { data } = await axios.post("/api/analytics/summary", { token });
        setSummary(data.summary);
      } catch {
        /* ignorieren */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const maxDaily = summary?.daily?.reduce((m, d) => Math.max(m, d.count), 0) || 1;
  const maxSection = summary?.sections?.reduce((m, s) => Math.max(m, s.count), 0) || 1;

  return (
    <AdminShell title="Analytics">
      {loading ? (
        <p className="text-gray-500">Lädt…</p>
      ) : !summary ? (
        <p className="text-gray-500">Keine Daten verfügbar.</p>
      ) : (
        <div className="space-y-6">
          {/* Plattform-Überblick (Reichweite – für Sponsoren-Präsentation) */}
          {summary.platform && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Plattform-Überblick</h2>
              <p className="text-xs text-gray-400 mb-4">Reichweite & Aktivität der Plattform</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { icon: FaUsers, label: "Spieler", value: summary.platform.players },
                  { icon: FaShieldAlt, label: "Teams", value: summary.platform.teams },
                  { icon: FaTrophy, label: "Offizielle Ligen", value: summary.platform.leagues },
                  { icon: FaExchangeAlt, label: "Transferbereit", value: summary.platform.transferAvailable },
                  { icon: FaUserPlus, label: "Suchende Vereine", value: summary.platform.recruitingTeams },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                      <Icon className="text-brand-500 mx-auto" />
                      <p className="mt-1.5 text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-[11px] text-gray-500 leading-tight">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kennzahlen */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <FaEye className="text-brand-500 text-xl" />
              <p className="mt-3 text-2xl font-bold text-gray-900">{summary.totalViews}</p>
              <p className="text-sm text-gray-500">Seitenaufrufe gesamt</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <FaUserSecret className="text-brand-500 text-xl" />
              <p className="mt-3 text-2xl font-bold text-gray-900">{summary.uniqueSessions}</p>
              <p className="text-sm text-gray-500">Eindeutige Besucher (Sessions)</p>
            </div>
          </div>

          {/* Traffic nach Bereich – bündelt dynamische Pfade (Spielerprofile,
              Teams, Spiele …) für eine sponsoren-taugliche Bereichs-Übersicht. */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Traffic nach Bereich</h2>
            <p className="text-xs text-gray-400 mb-4">
              Aufrufe je Inhaltsbereich (Spielerprofile, Teams, Spiele … gebündelt)
            </p>
            {!summary.sections || summary.sections.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Aufrufe.</p>
            ) : (
              <div className="space-y-2.5">
                {summary.sections.map((s) => (
                  <div key={s.section} className="flex items-center gap-3">
                    <span className="w-40 sm:w-48 text-xs text-gray-600 truncate">{s.section}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full"
                        style={{ width: `${(s.count / maxSection) * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-gray-900">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Letzte 7 Tage */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Letzte 7 Tage</h2>
            {summary.daily.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Aufrufe.</p>
            ) : (
              <div className="space-y-2">
                {summary.daily.map((d) => (
                  <div key={d.date} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-gray-500">{d.date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full"
                        style={{ width: `${(d.count / maxDaily) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-gray-700">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top-Seiten */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Beliebteste Seiten</h2>
            {summary.topPaths.length === 0 ? (
              <p className="text-sm text-gray-400">Noch keine Aufrufe.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {summary.topPaths.map((p) => (
                  <li key={p.path} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700 truncate">{p.path}</span>
                    <span className="text-sm font-medium text-gray-900">{p.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
