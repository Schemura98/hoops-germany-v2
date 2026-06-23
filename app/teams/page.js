"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaSearch, FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/fetchteams", {});
        if (active) setTeams(data.teams || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) => t.teamName?.toLowerCase().includes(q) || t.region?.toLowerCase().includes(q)
    );
  }, [teams, query]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Vereine"
        title="Teams entdecken"
        subtitle="Finde Vereine und Mannschaften, folge ihnen und bleib am Ball."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="relative mb-6 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Team oder Region suchen…"
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-400 bg-white shadow-sm"
          />
        </div>

        {!loading && !error && (
          <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">
            {filtered.length} Teams
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">Teams konnten nicht geladen werden.</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FaUsers className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Keine Teams gefunden</p>
            <p className="text-gray-400 text-sm mt-1">
              {query ? "Versuche einen anderen Suchbegriff." : "Noch keine Teams registriert."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((t) => (
              <Link
                key={t._id}
                href={`/team/team-detail/${t.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-200 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center h-40 w-full">
                  {t.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo} alt={t.teamName} className="h-28 w-28 object-contain" />
                  ) : (
                    <FaUsers className="text-5xl text-slate-500" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand-600 transition-colors truncate">
                    {t.teamName}
                  </h2>
                  {t.region && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-xs">
                      <FaMapMarkerAlt className="flex-shrink-0 text-brand-400" />
                      <span className="truncate">{t.region}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
