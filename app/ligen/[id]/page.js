"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaBasketballBall, FaTrophy, FaCrown } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import ScrollTable from "@/components/ui/ScrollTable";
import DemoBadge from "@/components/DemoBadge";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

// Tabellen-Skeleton im Format der echten Standings-Tabelle, damit Navbar/PageHeader
// beim Laden stehen bleiben (kein Layout-Sprung beim Wechsel auf den echten Inhalt).
function StandingsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3.5 flex-1 max-w-[140px]" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LigaDetailPage({ params }) {
  const id = params.id;
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`/api/leagues/${id}`);
        if (active) {
          setData(res.data);
          setState("ready");
        }
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <PageHeader eyebrow="Liga-Tabelle" title="Liga" />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          <StandingsSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Liga nicht gefunden</h1>
          <Link href="/ligen" className="mt-4 text-brand-600 hover:underline">
            Zurück zur Liga-Übersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { league, standings, champion, playoffs = [] } = data;
  const championId = champion?.teamId ? String(champion.teamId) : null;

  // Playoffs nach Runde gruppieren (API liefert sie bereits in Runden-Reihenfolge).
  const playoffRounds = [];
  for (const p of playoffs) {
    const last = playoffRounds[playoffRounds.length - 1];
    if (last && last.round === p.round) last.games.push(p);
    else playoffRounds.push({ round: p.round, games: [p] });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Liga-Tabelle" title={league.name} subtitle={league.season} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {league.finished && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4">
            <FaTrophy className="text-amber-500 text-2xl shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Saison abgeschlossen
              </p>
              {champion ? (
                <p className="text-sm font-bold text-gray-900">
                  Meister:{" "}
                  <Link
                    href={`/team/team-detail/${champion.slug}`}
                    className="text-amber-700 hover:underline"
                  >
                    {champion.teamName}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-gray-600">Kein Meister hinterlegt.</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ScrollTable label="Tabelle, seitlich scrollbar">
            <table className="w-full text-sm">
              <thead>
                {/* Rang und Team bleiben beim seitlichen Wischen stehen (Welle 3) */}
                <tr className="bg-white text-xs text-gray-500 text-left border-b border-gray-100">
                  <th className="sticky left-0 z-10 bg-inherit font-medium py-3 pl-4 w-12">#</th>
                  <th className="sticky left-12 z-10 bg-inherit font-medium py-3">Team</th>
                  <th className="font-medium py-3 text-center w-12">Sp</th>
                  <th className="font-medium py-3 text-center w-10">S</th>
                  <th className="font-medium py-3 text-center w-10">N</th>
                  <th className="font-medium py-3 text-center w-16 pr-4">Diff</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.teamId}
                    className="bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="sticky left-0 z-10 bg-inherit py-3 pl-4 w-12 font-semibold text-gray-500">
                      {championId && String(s.teamId) === championId ? (
                        <FaCrown className="text-amber-500" title="Meister" />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="sticky left-12 z-10 bg-inherit py-3">
                      <Link
                        href={`/team/team-detail/${s.slug}`}
                        className="flex items-center gap-2 font-medium text-gray-900 hover:text-brand-600"
                      >
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="h-6 w-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                            <FaUsers className="text-[10px]" />
                          </span>
                        )}
                        <span className="truncate">{s.teamName}</span>
                        {s.isDemo && <DemoBadge className="shrink-0" />}
                      </Link>
                    </td>
                    <td className="py-3 text-center text-gray-600">{s.games}</td>
                    <td className="py-3 text-center text-gray-600">{s.wins}</td>
                    <td className="py-3 text-center text-gray-600">{s.losses}</td>
                    <td
                      className={`py-3 text-center font-medium pr-4 ${
                        s.diff > 0 ? "text-green-600" : s.diff < 0 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {s.diff > 0 ? `+${s.diff}` : s.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollTable>

          {standings.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Noch keine Teams in dieser Liga.
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Sp = Spiele · S = Siege · N = Niederlagen · Diff = Korbdifferenz. Tabelle aus
          bestätigten Ergebnissen der Hauptrunde.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          🏆{" "}
          {league.championBasis === "playoffs"
            ? "Meister über die Playoffs (Finalsieger)."
            : "Meister über die Abschlusstabelle der Hauptrunde (keine Playoffs)."}
        </p>

        {/* Playoffs */}
        {playoffRounds.length > 0 && (
          <div className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
              <FaTrophy className="text-amber-500" /> Playoffs
            </h2>
            <div className="space-y-5">
              {playoffRounds.map(({ round, games }) => (
                <div key={round}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    {round}
                  </p>
                  <div className="space-y-2">
                    {games.map((g) => {
                      const done = g.scoreA != null && g.scoreB != null;
                      const aWon = g.winnerSide === "A";
                      const bWon = g.winnerSide === "B";
                      return (
                        <Link
                          key={g._id}
                          href={`/match/${g._id}`}
                          className="block bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:border-brand-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className={`min-w-0 truncate ${aWon ? "font-bold text-gray-900" : "text-gray-700"}`}>
                              {g.teamA?.teamName || "—"}
                            </span>
                            <span className="shrink-0 font-bold text-gray-900 tabular-nums">
                              {done ? `${g.scoreA} : ${g.scoreB}` : "–"}
                            </span>
                            <span className={`min-w-0 truncate text-right ${bWon ? "font-bold text-gray-900" : "text-gray-700"}`}>
                              {g.teamB?.teamName || "—"}
                            </span>
                          </div>
                          {!done && (
                            <p className="mt-1 text-[11px] text-amber-600">Anstehend</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
