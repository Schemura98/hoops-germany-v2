"use client";

import { useEffect, useState } from "react";
import axios from "axios";

function Tile({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

// Zeigt die aggregierte Karriere-Statistik eines Spielers.
export default function CareerStats({ playerId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/careerstats", { playerId });
        if (active) setStats(data.stats);
      } catch {
        if (active) setStats(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [playerId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Karriere-Statistik</h2>

      {loading ? (
        <div className="h-12 flex items-center text-sm text-gray-400">Lädt…</div>
      ) : !stats || stats.games === 0 ? (
        <p className="text-sm text-gray-400">Noch keine Spiele erfasst.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Tile label="Spiele" value={stats.games} />
            <Tile label="Ø PKT" value={stats.ppg.toFixed(1)} />
            <Tile label="Ø AST" value={stats.apg.toFixed(1)} />
            <Tile label="Ø REB" value={stats.rpg.toFixed(1)} />
          </div>
          <p className="mt-4 text-xs text-gray-400 text-center">
            Gesamt: {stats.points} Punkte · {stats.assists} Assists · {stats.rebounds} Rebounds
          </p>
        </>
      )}
    </div>
  );
}
