"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrophyBold } from "react-icons/pi";
import Avatar from "@/components/Avatar";
import { BUNDESLAENDER } from "@/lib/constants";

const selectClass =
  "rounded-sm border border-navy-600 bg-navy-800 px-2 py-1 text-xs text-mist-300 outline-none focus:border-brand-500";

function rankColor(i) {
  if (i === 0) return "text-signal-wait";
  if (i === 1) return "text-mist-400";
  if (i === 2) return "text-brand-400";
  return "text-mist-400";
}

export default function TopTeamsWidget() {
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState("all");
  const [bundesland, setBundesland] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get("/api/teams/standings", {
          params: leagueId !== "all" ? { leagueId } : {},
        });
        if (!active) return;
        setStandings(data.standings || []);
        setLeagues(data.leagues || []);
      } catch {
        if (active) setStandings([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [leagueId]);

  // Im Datensatz vertretene Bundesländer (in kanonischer Reihenfolge).
  const availableBL = useMemo(() => {
    const present = new Set(standings.map((s) => s.bundesland).filter(Boolean));
    return BUNDESLAENDER.filter((b) => present.has(b));
  }, [standings]);

  const rows = useMemo(() => {
    if (bundesland === "all") return standings;
    return standings.filter((s) => s.bundesland === bundesland);
  }, [standings, bundesland]);

  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-4">
      <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2">
        <PiTrophyBold className="text-brand-400" /> Top-Teams
      </h3>

      {/* Filter */}
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          className={selectClass}
          aria-label="Liga"
        >
          <option value="all">Alle Ligen</option>
          {leagues.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
              {l.season ? ` ${l.season}` : ""}
            </option>
          ))}
        </select>
        {availableBL.length > 0 && (
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className={selectClass}
            aria-label="Bundesland"
          >
            <option value="all">Alle Länder</option>
            {availableBL.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Rangliste (gedeckelte Höhe + interner Scroll) */}
      <div className="mt-3 max-h-80 overflow-y-auto -mr-1 pr-1">
        {loading ? (
          <p className="text-xs text-mist-400 py-4">Lädt…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-mist-400 py-4">
            Noch keine Ergebnisse für diese Auswahl.
          </p>
        ) : (
          <ol className="space-y-1 pb-1">
            {rows.map((t, i) => (
              <li key={t.teamId}>
                <Link
                  href={`/team/team-detail/${t.slug}`}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-navy-700 transition-colors"
                >
                  <span className={`w-4 text-center text-sm font-bold ${rankColor(i)}`}>
                    {i + 1}
                  </span>
                  <Avatar
                    name={t.teamName}
                    src={t.logo}
                    className="h-6 w-6"
                    textClass="text-[9px]"
                    square
                  />
                  <span className="flex-1 truncate text-sm text-paper-50">
                    {t.teamName}
                  </span>
                  <span className="text-xs font-medium text-mist-400 tabular-nums whitespace-nowrap">
                    {t.wins}-{t.losses}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <Link
          href="/rangliste"
          className="mt-2 block text-center text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
        >
          Komplette Rangliste
        </Link>
      )}
    </div>
  );
}
