"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaSearch, FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
      (t) =>
        t.teamName?.toLowerCase().includes(q) ||
        t.region?.toLowerCase().includes(q)
    );
  }, [teams, query]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-sm text-gray-500">Entdecke Vereine und Mannschaften.</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Team oder Region suchen…"
              className="w-full sm:w-72 rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">
            Teams konnten nicht geladen werden.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {query ? "Keine Teams gefunden." : "Noch keine Teams registriert."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Link
                key={t._id}
                href={`/team/team-detail/${t.slug}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  {t.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.logo}
                      alt={t.teamName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                      <FaUsers />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{t.teamName}</p>
                    {t.region && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FaMapMarkerAlt /> {t.region}
                      </p>
                    )}
                  </div>
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
