"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaTrophy, FaUsers } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <FaTrophy className="text-brand-500" /> Ligen
        </h1>
        <p className="text-sm text-gray-500 mb-6">Tabellen und Wettbewerbe.</p>

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
            {leagues.map((l) => (
              <Link
                key={l._id}
                href={`/ligen/${l._id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <p className="font-semibold text-gray-900">{l.name}</p>
                {l.season && <p className="text-xs text-gray-500">{l.season}</p>}
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                  <FaUsers /> {l.teamCount} Teams
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
