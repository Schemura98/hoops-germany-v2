"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaSearch, FaBasketballBall } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SpielerPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/fetchall", {});
        if (active) setPlayers(data.players || []);
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
    if (!q) return players;
    return players.filter(
      (p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q) ||
        p.teamId?.teamName?.toLowerCase().includes(q)
    );
  }, [players, query]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Spieler</h1>
            <p className="text-sm text-gray-500">Entdecke Spieler der Community.</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, Position oder Team…"
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
            Spieler konnten nicht geladen werden.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {query ? "Keine Spieler gefunden." : "Noch keine Spieler registriert."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const initials =
                `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
              return (
                <Link
                  key={p._id}
                  href={`/player/view-player/${p.slug || p._id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {p.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImage}
                        alt={initials}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                        {initials || "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {p.position || "Position offen"}
                        {p.teamId?.teamName ? ` · ${p.teamId.teamName}` : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
