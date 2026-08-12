"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiUsersBold, PiBasketballBold, PiTrophyBold, PiCrownBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import ScrollTable from "@/components/ui/ScrollTable";
import DemoBadge from "@/components/DemoBadge";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { getStoredPlayer } from "@/lib/clientAuth";

// Tabellen-Skeleton im Format der echten Standings-Tabelle, damit Navbar/PageHeader
// beim Laden stehen bleiben (kein Layout-Sprung beim Wechsel auf den echten Inhalt).
function StandingsSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <div className="divide-y divide-navy-600">
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
  // Eigenes Team, um die eigene Zeile hervorzuheben. Bewusst aus dem
  // localStorage statt per API: Die Seite ist öffentlich und soll für
  // Ausgeloggte keine zusätzliche Anfrage auslösen. Ist nichts gespeichert,
  // sieht die Tabelle exakt aus wie bisher.
  const [eigenesTeam, setEigenesTeam] = useState(null);

  useEffect(() => {
    const p = getStoredPlayer();
    const t = p?.teamId?._id || p?.teamId || p?.team?._id || null;
    if (t) setEigenesTeam(String(t));
  }, []);

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
      <div className="min-h-screen bg-navy-950 flex flex-col">
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
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-paper-50">Liga nicht gefunden</h1>
          <Link href="/ligen" className="mt-4 text-brand-400 hover:underline">
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
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Liga-Tabelle" title={league.name} subtitle={league.season} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {league.finished && (
          <div className="mb-4 flex items-center gap-3 rounded-md border border-signal-wait/50 bg-gradient-to-r from-signal-wait/10 to-signal-wait/5 px-5 py-4">
            <PiTrophyBold className="text-signal-wait text-2xl shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-signal-wait">
                Saison abgeschlossen
              </p>
              {champion ? (
                <p className="text-sm font-bold text-paper-50">
                  Meister:{" "}
                  <Link
                    href={`/team/team-detail/${champion.slug}`}
                    className="text-signal-wait hover:underline"
                  >
                    {champion.teamName}
                  </Link>
                </p>
              ) : (
                <p className="text-sm text-mist-400">Kein Meister hinterlegt.</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
          <ScrollTable label="Tabelle, seitlich scrollbar">
            <table className="w-full text-sm">
              <thead>
                {/* Rang und Team bleiben beim seitlichen Wischen stehen (Welle 3) */}
                <tr className="bg-navy-800 text-xs text-mist-400 text-left border-b border-navy-600">
                  <th className="sticky left-0 z-10 bg-inherit font-medium py-3 pl-4 w-12">#</th>
                  <th className="sticky left-12 z-10 bg-inherit font-medium py-3">Team</th>
                  <th className="font-medium py-3 text-center w-12">Sp</th>
                  <th className="font-medium py-3 text-center w-10">S</th>
                  <th className="font-medium py-3 text-center w-10">N</th>
                  <th className="font-medium py-3 text-center w-16 pr-4">Diff</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  // Die zweite der drei Stellen, an denen die Anzeigetafel-Leiste
                  // steht: die EINE hervorgehobene Zeile einer Liste. „Mein Team
                  // in der Tabelle" ist der wiederkehrende Moment, den Ronja als
                  // stärkeren Hebel als die Startseite benannt hat – und es ist
                  // kein Dark Pattern, weil es nur eine Tatsache sichtbar macht.
                  const eigene = eigenesTeam && String(s.teamId) === eigenesTeam;
                  return (
                  <tr
                    key={s.teamId}
                    className={`border-b border-navy-600 last:border-0 hover:bg-navy-700 ${
                      eigene ? "bg-navy-700 shadow-[inset_0_2px_0_0_#F07A27]" : "bg-navy-800"
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit py-3 pl-4 w-12 font-semibold text-mist-400">
                      {championId && String(s.teamId) === championId ? (
                        <PiCrownBold className="text-signal-wait" title="Meister" />
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="sticky left-12 z-10 bg-inherit py-3">
                      <Link
                        href={`/team/team-detail/${s.slug}`}
                        className="flex items-center gap-2 font-medium text-paper-50 hover:text-brand-400"
                      >
                        {s.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.logo} alt="" className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <span className="h-6 w-6 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                            <PiUsersBold className="text-[10px]" />
                          </span>
                        )}
                        <span className="truncate">{s.teamName}</span>
                        {s.isDemo && <DemoBadge className="shrink-0" />}
                      </Link>
                    </td>
                    <td className="font-mono tabular-nums py-3 text-center text-mist-400">{s.games}</td>
                    <td className="font-mono tabular-nums py-3 text-center text-mist-400">{s.wins}</td>
                    <td className="font-mono tabular-nums py-3 text-center text-mist-400">{s.losses}</td>
                    <td
                      className={`py-3 text-center font-medium pr-4 ${
                        s.diff > 0 ? "text-signal-ok" : s.diff < 0 ? "text-signal-error" : "text-mist-400"
                      }`}
                    >
                      {s.diff > 0 ? `+${s.diff}` : s.diff}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollTable>

          {standings.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-mist-400">
              Noch keine Teams in dieser Liga.
            </p>
          )}
        </div>

        <p className="mt-3 text-xs text-mist-400">
          Sp = Spiele · S = Siege · N = Niederlagen · Diff = Korbdifferenz. Tabelle aus
          bestätigten Ergebnissen der Hauptrunde.
        </p>
        <p className="mt-1 text-xs text-mist-400">
          🏆{" "}
          {league.championBasis === "playoffs"
            ? "Meister über die Playoffs (Finalsieger)."
            : "Meister über die Abschlusstabelle der Hauptrunde (keine Playoffs)."}
        </p>

        {/* Playoffs */}
        {playoffRounds.length > 0 && (
          <div className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-paper-50 mb-3">
              <PiTrophyBold className="text-signal-wait" /> Playoffs
            </h2>
            <div className="space-y-5">
              {playoffRounds.map(({ round, games }) => (
                <div key={round}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-mist-400 mb-2">
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
                          className="block bg-navy-800 rounded-md border border-navy-600 px-4 py-3 hover:border-brand-500/50 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className={`min-w-0 truncate ${aWon ? "font-bold text-paper-50" : "text-mist-300"}`}>
                              {g.teamA?.teamName || "—"}
                            </span>
                            <span className="shrink-0 font-bold text-paper-50 tabular-nums">
                              {done ? `${g.scoreA} : ${g.scoreB}` : "–"}
                            </span>
                            <span className={`min-w-0 truncate text-right ${bWon ? "font-bold text-paper-50" : "text-mist-300"}`}>
                              {g.teamB?.teamName || "—"}
                            </span>
                          </div>
                          {!done && (
                            <p className="mt-1 text-[11px] text-signal-wait">Anstehend</p>
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
