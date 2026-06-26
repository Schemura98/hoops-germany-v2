"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaTrophy } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { positionLabel } from "@/lib/constants";

const RANK_COLOR = {
  1: "text-amber-500",
  2: "text-gray-400",
  3: "text-orange-700",
};

const selectClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function TopscorerPage() {
  const [scorers, setScorers] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.post("/api/player/topscorer", season ? { season } : {});
        if (active) {
          setScorers(data.scorers || []);
          if (data.seasons) setSeasons(data.seasons);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Bestenliste"
        title="Topscorer"
        subtitle="Rangliste nach erzielten Punkten (bestätigte Spiele)."
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {seasons.length > 0 && (
          <div className="mb-5">
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className={selectClass}
              aria-label="Saison"
            >
              <option value="">Alle Saisons</option>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  Saison {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Tabelle konnte nicht geladen werden." />
        ) : scorers.length === 0 ? (
          <EmptyState
            icon={FaBasketballBall}
            title="Noch keine Statistiken erfasst"
            text="Sobald Teams Spieler-Stats eintragen, erscheint hier die Rangliste."
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 text-left border-b border-gray-100">
                  <th className="font-medium py-3 pl-4 w-10">#</th>
                  <th className="font-medium py-3">Spieler</th>
                  <th className="font-medium py-3 text-center w-12">Sp.</th>
                  <th className="font-medium py-3 text-center w-14">Ø</th>
                  <th className="font-medium py-3 text-center w-16 pr-4">PKT</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((s, i) => {
                  const rank = i + 1;
                  return (
                    <tr key={s.playerId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className={`py-3 pl-4 font-bold ${RANK_COLOR[rank] || "text-gray-300"}`}>
                        {rank}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/player/view-player/${s.slug || s.playerId}`}
                          className="font-medium text-gray-900 hover:text-brand-600"
                        >
                          {s.firstName} {s.lastName}
                        </Link>
                        <div className="text-xs text-gray-400">
                          {positionLabel(s.position) || "—"}
                          {s.teamName ? ` · ${s.teamName}` : ""}
                        </div>
                      </td>
                      <td className="py-3 text-center text-gray-600">{s.games}</td>
                      <td className="py-3 text-center text-gray-600">
                        {s.ppg.toFixed(1)}
                      </td>
                      <td className="py-3 text-center font-semibold text-gray-900 pr-4">
                        {s.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
