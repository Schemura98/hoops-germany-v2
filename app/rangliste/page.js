"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { BUNDESLAENDER } from "@/lib/constants";
import { inputClassSm } from "@/lib/ui";
import ScrollTable from "@/components/ui/ScrollTable";
import CountUp from "@/components/ui/CountUp";

const selectClass = `${inputClassSm} sm:w-auto`;

// Tabellenzeilen-Skeleton im Format der echten Rangliste (Rang + Team + Sp/S/N/+-).
function RanglisteSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <div className="divide-y divide-navy-600">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            <Skeleton className="h-8 w-8 rounded-sm flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-1/3 mb-1.5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function rankBadge(i) {
  const base =
    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold";
  if (i === 0) return `${base} bg-signal-wait/15 text-signal-wait`;
  if (i === 1) return `${base} bg-navy-700 text-mist-400`;
  if (i === 2) return `${base} bg-brand-500/15 text-brand-400`;
  return `${base} text-mist-400`;
}

export default function RanglistePage() {
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("all");
  const [leagueId, setLeagueId] = useState("all");
  const [bundesland, setBundesland] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const params = {};
        if (leagueId !== "all") params.leagueId = leagueId;
        else if (season !== "all") params.season = season;
        const { data } = await axios.get("/api/teams/standings", { params });
        if (!active) return;
        setStandings(data.standings || []);
        setLeagues(data.leagues || []);
        if (data.seasons) setSeasons(data.seasons);
      } catch {
        if (active) setStandings([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [leagueId, season]);

  // Liga-Optionen auf die gewählte Saison eingrenzen.
  const leagueOptions = useMemo(
    () => (season === "all" ? leagues : leagues.filter((l) => l.season === season)),
    [leagues, season]
  );

  const availableBL = useMemo(() => {
    const present = new Set(standings.map((s) => s.bundesland).filter(Boolean));
    return BUNDESLAENDER.filter((b) => present.has(b));
  }, [standings]);

  const rows = useMemo(() => {
    if (bundesland === "all") return standings;
    return standings.filter((s) => s.bundesland === bundesland);
  }, [standings, bundesland]);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wettbewerb"
        title="Rangliste"
        subtitle="Teams nach Siegen und Korbdifferenz – über alle Ligen oder gefiltert."
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-5">
          {seasons.length > 0 && (
            <select
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                setLeagueId("all");
              }}
              className={selectClass}
              aria-label="Saison"
            >
              <option value="all">Alle Saisons</option>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  Saison {s}
                </option>
              ))}
            </select>
          )}
          <select
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className={selectClass}
            aria-label="Liga"
          >
            <option value="all">Alle Ligen</option>
            {leagueOptions.map((l) => (
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
              <option value="all">Alle Bundesländer</option>
              {availableBL.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <RanglisteSkeleton />
        ) : rows.length === 0 ? (
          <p className="text-center text-mist-400 py-16">
            Noch keine Ergebnisse für diese Auswahl.
          </p>
        ) : (
          <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
            <ScrollTable label="Rangliste, seitlich scrollbar">
            <table className="w-full text-sm">
              <thead>
                {/* Rang und Team bleiben beim seitlichen Wischen stehen –
                    sonst sieht man auf dem Handy entweder den Namen oder die
                    Korbdifferenz, nie beides (Design-Review Welle 3). */}
                <tr className="bg-navy-800 text-xs uppercase tracking-wide text-mist-400 border-b border-navy-600">
                  <th className="sticky left-0 z-10 bg-inherit text-left font-medium px-3 py-3 w-14">#</th>
                  <th className="sticky left-14 z-10 bg-inherit text-left font-medium px-2 py-3">Team</th>
                  <th className="text-center font-medium px-2 py-3 w-12">Sp</th>
                  <th className="text-center font-medium px-2 py-3 w-12">S</th>
                  <th className="text-center font-medium px-2 py-3 w-12">N</th>
                  <th className="text-center font-medium px-3 py-3 w-16">+/–</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-600">
                {rows.map((t, i) => (
                  <tr key={t.teamId} className="bg-navy-800 hover:bg-navy-700 transition-colors">
                    <td className="sticky left-0 z-10 bg-inherit px-3 py-3 w-14">
                      <span className={rankBadge(i)}>{i + 1}</span>
                    </td>
                    <td className="sticky left-14 z-10 bg-inherit px-2 py-3">
                      <Link
                        href={`/team/team-detail/${t.slug}`}
                        className="flex items-center gap-2.5 min-w-0 group"
                      >
                        <Avatar
                          name={t.teamName}
                          src={t.logo}
                          className="h-8 w-8"
                          textClass="text-[10px]"
                          square
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-paper-50 group-hover:text-brand-400">
                            {t.teamName}
                          </span>
                          {t.bundesland && (
                            <span className="block text-xs text-mist-400">
                              {t.bundesland}
                            </span>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="font-mono tabular-nums text-center px-2 py-3 text-mist-400 tabular-nums">
                      {t.games}
                    </td>
                    {/* Podium zaehlt hoch, der Rest steht sofort (Entscheid Vivien) */}
                    <td className="font-mono tabular-nums text-center px-2 py-3 font-semibold text-paper-50 tabular-nums">
                      {i < 3 ? <CountUp value={t.wins} /> : t.wins}
                    </td>
                    <td className="font-mono tabular-nums text-center px-2 py-3 text-mist-400 tabular-nums">
                      {i < 3 ? <CountUp value={t.losses} /> : t.losses}
                    </td>
                    <td
                      className={`text-center px-3 py-3 font-medium tabular-nums ${
                        t.diff > 0
                          ? "text-signal-ok"
                          : t.diff < 0
                          ? "text-signal-error"
                          : "text-mist-400"
                      }`}
                    >
                      {i < 3 ? (
                        <>
                          {t.diff > 0 ? "+" : ""}
                          <CountUp value={t.diff} />
                        </>
                      ) : t.diff > 0 ? (
                        `+${t.diff}`
                      ) : (
                        t.diff
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </ScrollTable>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
