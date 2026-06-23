"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaTrophy, FaUsers } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { BUNDESLAENDER } from "@/lib/constants";

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [land, setLand] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues");
        if (active) setLeagues(data.leagues || []);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Wettbewerb" title="Ligen" subtitle="Tabellen und Wettbewerbe." />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {!loading && !error && leagues.length > 0 && (
          <div className="mb-6 max-w-xs">
            <select
              value={land}
              onChange={(e) => setLand(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400"
            >
              <option value="">Alle Bundesländer</option>
              {BUNDESLAENDER.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">
            Ligen konnten nicht geladen werden.
          </p>
        ) : leagues.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Noch keine Ligen vorhanden. Teams können Ligen im Spielplan ihres
            Admin-Bereichs anlegen.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {leagues
              .filter((l) => !land || l.bundesland === land)
              .map((l) => (
                <Link
                  key={l._id}
                  href={`/ligen/${l._id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
                >
                  <p className="font-semibold text-gray-900">{l.name}</p>
                  {l.season && <p className="text-xs text-gray-500">{l.season}</p>}
                  <p className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaUsers /> {l.teamCount} Teams
                    </span>
                    {l.bundesland && <span>· {l.bundesland}</span>}
                  </p>
                </Link>
              ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
