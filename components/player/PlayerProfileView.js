"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaUsers,
  FaInstagram,
  FaExternalLinkAlt,
  FaBasketballBall,
  FaChartBar,
  FaIdCard,
  FaRegNewspaper,
  FaExchangeAlt,
} from "react-icons/fa";
import PlayerPosts from "@/components/posts/PlayerPosts";
import Avatar from "@/components/Avatar";
import { ageFromBirthdate, formatBirthdate } from "@/lib/age";

const round1 = (n) => Math.round(n * 10) / 10;

function StatCell({ label, value, sub }) {
  return (
    <div className="px-4 py-3 text-center min-w-[84px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white leading-tight mt-0.5">{value ?? "–"}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-5 py-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <FaBasketballBall className="text-orange-400 text-sm" /> {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const TABS = [
  { key: "stats", label: "Stats", icon: FaChartBar },
  { key: "steckbrief", label: "Steckbrief", icon: FaIdCard },
  { key: "beitraege", label: "Beiträge", icon: FaRegNewspaper },
];

export default function PlayerProfileView({ player, viewerId, actions }) {
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [tab, setTab] = useState("stats");
  const [season, setSeason] = useState(""); // "" = alle

  const fullName = `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
  const rawTeam = player?.team || player?.teamId;
  const team = rawTeam && typeof rawTeam === "object" ? rawTeam : null;
  const ig = player?.instagram ? player.instagram.replace(/^@/, "") : null;

  useEffect(() => {
    if (!player?._id) return;
    let active = true;
    (async () => {
      try {
        const [s, st] = await Promise.all([
          axios.post("/api/player/careerstats", { playerId: player._id }),
          axios.post("/api/player/stations", { playerId: player._id }),
        ]);
        if (!active) return;
        setStats(s.data.stats);
        setStations(st.data.stations || []);
      } catch {
        /* ignorieren */
      }
    })();
    return () => {
      active = false;
    };
  }, [player?._id]);

  // Verfügbare Saisons (für den Filter)
  const seasons = useMemo(() => {
    const set = new Set(stations.map((s) => s.season).filter(Boolean));
    return [...set].sort().reverse();
  }, [stations]);

  const filteredStations = useMemo(
    () => (season ? stations.filter((s) => s.season === season) : stations),
    [stations, season]
  );

  // Bilanz aus den (gefilterten) Stationen aufsummieren
  const bilanz = useMemo(() => {
    const t = filteredStations.reduce(
      (a, s) => ({
        games: a.games + s.games,
        points: a.points + s.points,
        assists: a.assists + s.assists,
        rebounds: a.rebounds + s.rebounds,
      }),
      { games: 0, points: 0, assists: 0, rebounds: 0 }
    );
    const g = t.games || 0;
    return {
      ...t,
      ppg: g ? round1(t.points / g) : 0,
      apg: g ? round1(t.assists / g) : 0,
      rpg: g ? round1(t.rebounds / g) : 0,
    };
  }, [filteredStations]);

  // Karriere-Verlauf: Team-Wechsel in chronologischer Reihenfolge
  const teamHistory = useMemo(() => {
    const asc = [...stations].sort(
      (a, b) => new Date(a.lastDate || 0) - new Date(b.lastDate || 0)
    );
    const hist = [];
    for (const s of asc) {
      const last = hist[hist.length - 1];
      if (!last || last.teamName !== s.teamName) {
        hist.push({ teamName: s.teamName, teamLogo: s.teamLogo, teamSlug: s.teamSlug, season: s.season });
      }
    }
    return hist;
  }, [stations]);

  return (
    <div>
      {/* Navy-Hero mit Stats-Leiste */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <Avatar
              name={fullName}
              src={player?.profileImage}
              className="h-28 w-28"
              textClass="text-3xl"
              ring="ring-4 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="text-orange-400 text-sm font-semibold flex items-center justify-center sm:justify-start gap-2">
                {team?.teamName || "Vereinslos"}
                {player?.position && <span className="text-slate-400">| {player.position}</span>}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{fullName}</h1>
              <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-4 text-sm text-slate-300">
                <span>
                  <strong className="text-white">{player?.followersCount ?? 0}</strong> Follower
                </span>
                <span>
                  <strong className="text-white">{player?.followingCount ?? 0}</strong> Folgt
                </span>
                {player?.transferStatus === "verfuegbar" && (
                  <span className="text-xs font-semibold bg-green-500/20 text-green-300 rounded-full px-3 py-1">
                    Transferbereit
                  </span>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex flex-wrap items-center justify-center gap-3 sm:ml-auto sm:pb-1">
                {actions}
              </div>
            )}
          </div>

          {/* Stats-Leiste */}
          <div className="mt-6 overflow-x-auto">
            <div className="inline-flex min-w-full rounded-t-2xl bg-white/5 divide-x divide-white/10 border border-white/10 border-b-0">
              <div className="px-4 py-3 flex flex-col items-center justify-center min-w-[110px]">
                <Avatar name={team?.teamName} src={team?.logo} className="h-9 w-9" textClass="text-xs" square />
                <span className="text-[10px] text-slate-300 mt-1 truncate max-w-[96px]">
                  {team?.teamName || "—"}
                </span>
              </div>
              <StatCell label="PPG" value={stats ? stats.ppg.toFixed(1) : "–"} />
              <StatCell label="APG" value={stats ? stats.apg.toFixed(1) : "–"} />
              <StatCell label="RPG" value={stats ? stats.rpg.toFixed(1) : "–"} />
              <div className="grid grid-cols-1 divide-y divide-white/10 min-w-[120px]">
                <StatCell label="Größe" value={player?.height} />
                <StatCell label="Alter" value={ageFromBirthdate(player?.birthdate) ?? player?.age} />
              </div>
              <div className="grid grid-cols-1 divide-y divide-white/10 min-w-[120px]">
                <StatCell label="Gewicht" value={player?.weight} />
                <StatCell label="Heimatort" value={player?.hometown} />
              </div>
              <div className="grid grid-cols-1 divide-y divide-white/10 min-w-[110px]">
                <StatCell label="Land" value={player?.country || player?.nationality} />
                <StatCell label="Bundesland" value={player?.bundesland} />
              </div>
              {player?.fibaLink && (
                <a
                  href={player.fibaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 flex flex-col items-center justify-center min-w-[80px] hover:bg-white/5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">FIBA</span>
                  <span className="text-orange-400 text-sm font-semibold mt-1 inline-flex items-center gap-1">
                    Link <FaExternalLinkAlt className="text-[10px]" />
                  </span>
                </a>
              )}
              {ig && (
                <a
                  href={`https://instagram.com/${ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 flex flex-col items-center justify-center min-w-[80px] hover:bg-white/5"
                >
                  <FaInstagram className="text-white text-lg" />
                  <span className="text-[10px] text-slate-300 mt-1">Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 flex gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === key
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="text-xs" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {tab === "stats" && (
          <>
            <SectionCard
              title="Karriere-Bilanz"
              action={
                seasons.length > 0 && (
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="text-xs bg-white/10 text-white rounded-lg px-2 py-1 outline-none border border-white/10"
                  >
                    <option className="text-gray-900" value="">
                      Alle Saisons
                    </option>
                    {seasons.map((s) => (
                      <option className="text-gray-900" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )
              }
            >
              {bilanz.games === 0 ? (
                <p className="text-sm text-gray-400">
                  {season ? "Keine Spiele in dieser Saison." : "Noch keine Spiele erfasst."}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong className="text-gray-900">{bilanz.games}</strong> Spiele ·{" "}
                    <strong className="text-gray-900">{bilanz.points}</strong> Punkte ·{" "}
                    <strong className="text-gray-900">{bilanz.assists}</strong> Assists ·{" "}
                    <strong className="text-gray-900">{bilanz.rebounds}</strong> Rebounds
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: bilanz.ppg, l: "PPG", s: "Punkte/Spiel" },
                      { v: bilanz.apg, l: "APG", s: "Assists/Spiel" },
                      { v: bilanz.rpg, l: "RPG", s: "Rebounds/Spiel" },
                    ].map((x) => (
                      <div key={x.l} className="bg-gray-50 rounded-xl py-4 text-center">
                        <p className="text-3xl font-black text-gray-900">{x.v.toFixed(1)}</p>
                        <p className="text-xs font-bold text-brand-500 mt-1">{x.l}</p>
                        <p className="text-[11px] text-gray-400">{x.s}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Spielerstationen">
              {filteredStations.length === 0 ? (
                <p className="text-sm text-gray-400">Noch keine Stationen erfasst.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 text-left">
                        <th className="font-medium py-2">Team / Liga</th>
                        <th className="font-medium py-2 text-center w-12">Sp.</th>
                        <th className="font-medium py-2 text-center w-16">PTS</th>
                        <th className="font-medium py-2 text-center w-16">AST</th>
                        <th className="font-medium py-2 text-center w-16">REB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.map((s, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={s.teamName} src={s.teamLogo} className="h-7 w-7" textClass="text-[10px]" square />
                              <div className="min-w-0">
                                {s.teamSlug ? (
                                  <Link
                                    href={`/team/team-detail/${s.teamSlug}`}
                                    className="font-semibold text-gray-900 hover:text-brand-600"
                                  >
                                    {s.teamName}
                                  </Link>
                                ) : (
                                  <span className="font-semibold text-gray-900">{s.teamName}</span>
                                )}
                                <p className="text-xs text-gray-400">
                                  {s.leagueName}
                                  {s.season ? ` · ${s.season}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 text-center font-medium text-gray-900">{s.games}</td>
                          <td className="py-2.5 text-center">
                            <span className="font-semibold text-gray-900">{s.points}</span>
                            <span className="block text-[10px] text-gray-400">{s.ppg.toFixed(1)}ø</span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="font-semibold text-gray-900">{s.assists}</span>
                            <span className="block text-[10px] text-gray-400">{s.apg.toFixed(1)}ø</span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="font-semibold text-gray-900">{s.rebounds}</span>
                            <span className="block text-[10px] text-gray-400">{s.rpg.toFixed(1)}ø</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}

        {tab === "steckbrief" && (
          <>
            {player?.aboutPlayer && (
              <SectionCard title="Über">
                <p className="text-sm text-gray-600 whitespace-pre-line">{player.aboutPlayer}</p>
              </SectionCard>
            )}
            <SectionCard title="Steckbrief">
              <InfoRow label="Größe" value={player?.height} />
              <InfoRow label="Gewicht" value={player?.weight} />
              <InfoRow label="Alter" value={ageFromBirthdate(player?.birthdate) ?? player?.age} />
              <InfoRow label="Geburtsdatum" value={formatBirthdate(player?.birthdate)} />
              <InfoRow label="Position" value={player?.position} />
              <InfoRow label="Nationalität" value={player?.nationality} />
              <InfoRow label="Land" value={player?.country} />
              <InfoRow label="Heimatort" value={player?.hometown} />
              <InfoRow label="Bundesland" value={player?.bundesland} />
              <InfoRow label="Bevorzugte Liga" value={player?.preferredLeague} />
            </SectionCard>

            {/* Karriere-Verlauf / Transfers */}
            {teamHistory.length > 0 && (
              <SectionCard title="Karriere-Verlauf">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {teamHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-1 flex-shrink-0">
                      {i > 0 && (
                        <div className="flex flex-col items-center px-1 text-brand-500">
                          <FaExchangeAlt className="text-xs" />
                          <span className="text-[9px] font-semibold uppercase tracking-wide">Wechsel</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-1 px-2 py-1 min-w-[88px]">
                        {h.teamSlug ? (
                          <Link href={`/team/team-detail/${h.teamSlug}`}>
                            <Avatar name={h.teamName} src={h.teamLogo} className="h-11 w-11" textClass="text-sm" square />
                          </Link>
                        ) : (
                          <Avatar name={h.teamName} src={h.teamLogo} className="h-11 w-11" textClass="text-sm" square />
                        )}
                        <span className="text-xs font-medium text-gray-900 text-center leading-tight truncate max-w-[88px]">
                          {h.teamName}
                        </span>
                        {h.season && <span className="text-[10px] text-gray-400">{h.season}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {teamHistory.length === 1 && (
                  <p className="mt-2 text-xs text-gray-400">Noch kein Vereinswechsel.</p>
                )}
              </SectionCard>
            )}
          </>
        )}

        {tab === "beitraege" && <PlayerPosts playerId={player?._id} currentPlayerId={viewerId} />}
      </div>
    </div>
  );
}
