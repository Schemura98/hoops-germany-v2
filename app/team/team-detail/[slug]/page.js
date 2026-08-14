"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiUsersBold,
  PiMapPinBold,
  PiBasketballBold,
  PiCalendarBlankBold,
  PiNewspaperBold,
  PiTrophyBold,
  PiClockCounterClockwiseBold,
  PiCrownBold,
} from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import DemoBadge from "@/components/DemoBadge";
import Footer from "@/components/layout/Footer";
import Tabs from "@/components/ui/Tabs";
import { Skeleton, SkeletonList } from "@/components/ui/Skeleton";
import FollowButton from "@/components/FollowButton";
import PostCard from "@/components/posts/PostCard";
import { teamScores } from "@/lib/matchScore";
import { positionLabel, teamSeasonStatusLabel, POSITION_FEHLT } from "@/lib/constants";
import { getPlayerToken } from "@/lib/clientAuth";
import Avatar from "@/components/Avatar";

const TABS = [
  { key: "kader", label: "Kader", icon: PiUsersBold },
  { key: "spielplan", label: "Spielplan", icon: PiCalendarBlankBold },
  { key: "saisons", label: "Saisons", icon: PiClockCounterClockwiseBold },
  { key: "news", label: "News", icon: PiNewspaperBold },
];

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// Skeleton für die Team-Detailseite: Navy-Hero + Tabs + Kader-Liste bleiben in Form
// bestehen, damit beim Nachladen kein Layout-Sprung entsteht (Navbar bleibt sichtbar).
function TeamDetailSkeleton() {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />
      <div className="bg-navy-900">
        <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className="h-24 w-24 rounded-md bg-navy-800/10 animate-pulse motion-reduce:animate-none flex-shrink-0" />
          <div className="min-w-0 flex-1 w-full text-center sm:text-left">
            <div className="h-8 w-48 mx-auto sm:mx-0 rounded bg-navy-800/10 animate-pulse motion-reduce:animate-none mb-3" />
            <div className="h-4 w-56 mx-auto sm:mx-0 rounded bg-navy-800/10 animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </div>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="flex gap-2 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <SkeletonList rows={6} />
      </main>
      <Footer />
    </div>
  );
}

export default function TeamTeamDetailSlugPage({ params }) {
  const slug = params.slug;

  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("kader");
  const [scheduleFilter, setScheduleFilter] = useState("upcoming"); // upcoming | past | all | playoffs

  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [meId, setMeId] = useState(null);

  useEffect(() => {
    const token = getPlayerToken();
    setLoggedIn(!!token);
    let active = true;
    // Eigene Spieler-ID (nur zur Like-Hervorhebung) – ohne Login-Redirect.
    if (token) {
      axios
        .post("/api/player/getmyinfo", { token })
        .then((r) => active && setMeId(r.data?.player?._id || null))
        .catch(() => {});
    }
    (async () => {
      try {
        const res = await axios.post("/api/team/fetchsingleteaminfo", { slug });
        if (active) {
          setData(res.data);
          setFollowerCount(res.data.team.followersCount || 0);
          setState("ready");
          // Saison-Historie (eingefrorene TeamSeason-Snapshots) nachladen.
          axios
            .post("/api/team/season-history", { teamId: res.data.team._id })
            .then((h) => active && setHistory(h.data.history || []))
            .catch(() => {});
        }
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  async function join() {
    setJoining(true);
    setJoinMsg(null);
    try {
      const token = getPlayerToken();
      const res = await axios.post("/api/team/requestjoin", {
        token,
        teamId: data.team._id,
      });
      setJoinMsg({ type: "ok", text: res.data.message });
    } catch (err) {
      setJoinMsg({
        type: "err",
        text: err.response?.data?.message || "Anfrage fehlgeschlagen.",
      });
    } finally {
      setJoining(false);
    }
  }

  if (state === "loading") {
    return <TeamDetailSkeleton />;
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-paper-50">Team nicht gefunden</h1>
          <Link href="/teams" className="mt-4 text-brand-400 hover:underline">
            Zurück zur Team-Übersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { team, members, matches = [], posts = [], league = null } = data;
  const leagueMeta = league
    ? [league.gender, league.ageGroup !== "Senioren" ? league.ageGroup : null, league.region]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      {/* Navy-Hero */}
      <div
        className="bg-navy-900 relative bg-cover bg-center"
        style={team.banner ? { backgroundImage: `url('${team.banner}')` } : undefined}
      >
        {team.banner && <div className="absolute inset-0 bg-navy-950/70" />}
        <div className="relative max-w-3xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <Avatar
            name={team.teamName}
            src={team.logo}
            className="h-24 w-24"
            textClass="text-3xl"
            square
            ring="ring-4 ring-paper-50/10"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display uppercase tracking-tight text-3xl sm:text-4xl font-black text-paper-50">{team.teamName}</h1>
            {team.isDemo && <DemoBadge className="mt-2" />}
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-mist-300">
              {team.region && (
                <span className="flex items-center gap-1">
                  <PiMapPinBold className="text-brand-400" /> {team.region}
                </span>
              )}
              <span>{followerCount} Follower</span>
              <span>{members.length} Spieler</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:ml-auto">
            <FollowButton type="team" targetId={team._id} onCountChange={setFollowerCount} />
            {loggedIn ? (
              <button
                onClick={join}
                disabled={joining}
                className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {joining ? "Senden…" : "Team beitreten"}
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-navy-800/10 hover:bg-navy-700/20 text-paper-50 rounded-sm px-5 py-2.5 text-sm font-medium transition-colors"
              >
                Zum Beitreten anmelden
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {joinMsg && (
          <div
            className={`mb-4 rounded-sm border px-4 py-3 text-sm ${
              joinMsg.type === "ok"
                ? "bg-signal-ok/10 border-signal-ok/50 text-signal-ok"
                : "bg-signal-error/10 border-signal-error/50 text-signal-error"
            }`}
          >
            {joinMsg.text}
          </div>
        )}

        {/* Liga + Platzierung */}
        {league && (
          <Link
            href={`/ligen/${league._id}`}
            className="mb-6 block bg-navy-800 rounded-md border border-navy-600 p-5 hover:border-brand-500/50 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-400">
                  Liga{league.season ? ` · ${league.season}` : ""}
                </p>
                <p className="font-semibold text-paper-50 truncate">{league.name}</p>
                {leagueMeta && <p className="text-xs text-mist-400">{leagueMeta}</p>}
              </div>
              {league.isChampion ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-signal-wait bg-signal-wait/15 rounded-sm px-3 py-1">
                  <PiTrophyBold className="text-[10px]" /> Meister
                </span>
              ) : league.rank ? (
                <div className="shrink-0 text-right">
                  <p className="text-xl font-black text-paper-50 leading-none">
                    {league.rank}.
                  </p>
                  <p className="text-[11px] text-mist-400">von {league.totalTeams}</p>
                </div>
              ) : null}
            </div>
            {league.record && league.record.games > 0 && (
              <p className="mt-2 text-xs text-mist-400">
                {league.record.wins}S · {league.record.losses}N
                <span className="text-mist-400">
                  {" "}
                  · Korbdiff {league.record.diff > 0 ? `+${league.record.diff}` : league.record.diff}
                </span>
                {league.finished && (
                  <span className="ml-2 text-signal-wait font-medium">Saison abgeschlossen</span>
                )}
              </p>
            )}
          </Link>
        )}

        {team.about && (
          <div className="mb-6 bg-navy-800 rounded-md border border-navy-600 p-6">
            <p className="text-sm text-mist-400 whitespace-pre-line">{team.about}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          className="mb-5"
          value={tab}
          onChange={setTab}
          tabs={TABS.map(({ key, label, icon: Icon }) => ({
            key,
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Icon className="text-xs" /> {label}
              </span>
            ),
          }))}
        />

        {/* Kader */}
        {tab === "kader" && (
          <div className="bg-navy-800 rounded-md border border-navy-600 p-6">
            {members.length === 0 && team.rosterSlots.length === 0 ? (
              <p className="text-sm text-mist-400">Noch keine Kaderinformationen.</p>
            ) : (
              <div className="divide-y divide-navy-600">
                {members.map((m) => {
                  const initials = `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <Link
                      key={m._id}
                      href={`/player/view-player/${m.slug || m._id}`}
                      className="flex items-center gap-3 py-3 hover:bg-navy-700 -mx-2 px-2 rounded-sm transition-colors"
                    >
                      <Avatar
                        name={`${m.firstName} ${m.lastName}`}
                        src={m.profileImage}
                        className="h-10 w-10"
                        textClass="text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-paper-50 truncate">
                          {m.firstName} {m.lastName}
                          {m.number && (
                            <span className="ml-1.5 text-xs font-semibold text-mist-400">
                              #{m.number}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-mist-400">{positionLabel(m.position) || POSITION_FEHLT}</p>
                      </div>
                      {/* ⚠️ Hier stand bis zum 14.08.2026 zusätzlich ein oranges
                          Positions-Abzeichen – dieselbe Angabe wie die Unterzeile
                          darüber (Befund Tobias, Browser-Gate, „niedrig").
                          Entfernt, nicht die Unterzeile, aus drei Gründen:
                          (1) Der rechte Rand dieser Liste gehört dem STATUS: Bei
                          den offenen Plätzen direkt darunter sitzt an genau
                          derselben Stelle „Ausstehend"/„eingeladen". Die Spalte
                          wechselte mitten in einer Liste ihre Bedeutung von
                          Position auf Status – wer sie von oben nach unten
                          scannt, liest zwei Dinge als eins.
                          (2) Die Unterzeile ist die Zeilensprache, die die
                          Slot-Zeilen hier und die Kader-/Slot-Listen in
                          `components/team/tabs/KaderTab.js` sowie
                          `/transfermarkt` ohnehin verwenden. Das Abzeichen war
                          die Ausnahme, nicht die Regel.
                          (3) `brand-500` ist der EINE Akzent (Anzeigetafel,
                          `docs/VISUELLE-RICHTUNG-2026-08-12.md`). Eine Position
                          ist keine Auszeichnung und darf ihn nicht verbrauchen.
                          Das Chip auf `/spieler` bleibt bewusst: Das ist eine
                          Kachelansicht ohne Unterzeile, dort ist es die einzige
                          Darstellung und doppelt nichts. */}
                    </Link>
                  );
                })}
                {/* Offene/Slot-Plätze ohne Account */}
                {team.rosterSlots
                  .filter((s) => !s.claimedBy)
                  .map((slot) => (
                    <div key={slot._id} className="flex items-center gap-3 py-3 opacity-70">
                      <span className="h-10 w-10 rounded-full bg-navy-700 text-mist-400 text-xs font-semibold flex items-center justify-center">
                        {slot.number || "–"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-mist-300 truncate">
                          {slot.name || "Offener Platz"}
                        </p>
                        <p className="text-xs text-mist-400">{positionLabel(slot.position) || POSITION_FEHLT}</p>
                      </div>
                      {/* ⚠️ EIN Wert statt „Ausstehend"/„eingeladen" (Befund und
                          Wortlaut Nele, 15.08.2026). Beides war falsch:
                          • `pending` wird im ganzen Code NIRGENDS gesetzt –
                            `request-claim` springt direkt auf `confirmed`,
                            `approve-claim` prüft nur darauf. Der erste Zweig war
                            unerreichbar, öffentlich erschien immer „eingeladen".
                          • Und „eingeladen" behauptete etwas, das kein Feld
                            belegt: Das Slot-Schema hält nicht fest, ob je ein
                            Link verschickt wurde. Ein Platz, den ein Admin vor
                            einer Minute angelegt und niemandem geschickt hat,
                            stand öffentlich als „eingeladen".
                          • Derselbe Datensatz heißt im Team-Admin-Panel „Frei" –
                            ein Zustand, zwei sich widersprechende Wörter.
                          Für einen Fremden, der einen Gegner-Kader ansieht,
                          zählt ohnehin nur eines: Der Name ist noch nicht
                          bestätigt. „Noch" macht daraus einen Zwischenstand –
                          „Nicht bestätigt" allein läse sich wie „abgelehnt". */}
                      <span className="text-xs font-medium rounded-sm px-3 py-1 bg-signal-wait/15 text-signal-wait">
                        Noch nicht bestätigt
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Spielplan */}
        {tab === "spielplan" &&
          (() => {
            const list = matches
              .filter((m) => {
                if (scheduleFilter === "upcoming") return m.status === "scheduled";
                if (scheduleFilter === "past") return m.status === "completed";
                if (scheduleFilter === "playoffs") return m.stage === "Playoffs";
                return true;
              })
              .sort((a, b) =>
                scheduleFilter === "upcoming"
                  ? new Date(a.date) - new Date(b.date)
                  : new Date(b.date) - new Date(a.date)
              );
            return (
              <div className="space-y-3">
                <Tabs
                  className="max-w-md"
                  fluid
                  value={scheduleFilter}
                  onChange={setScheduleFilter}
                  tabs={[
                    { key: "upcoming", label: "Anstehend" },
                    { key: "past", label: "Vergangen" },
                    { key: "all", label: "Alle" },
                    { key: "playoffs", label: "Playoffs" },
                  ]}
                />
                {list.length === 0 ? (
                  <div className="bg-navy-800 rounded-md border border-navy-600 p-10 text-center text-sm text-mist-400">
                    Keine Spiele in dieser Ansicht.
                  </div>
                ) : (
                  list.map((m) => {
                    const isHome = String(m.teamA?._id) === String(team._id);
                    const opponent = isHome ? m.teamB : m.teamA;
                    const score = teamScores(m);
                    const own = score ? (isHome ? score.a : score.b) : null;
                    const opp = score ? (isHome ? score.b : score.a) : null;
                    const won = score && own > opp;
                    const isPlayoff = m.stage === "Playoffs";
                    return (
                      <div
                        key={m._id}
                        className="bg-navy-800 rounded-md border border-navy-600 p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-paper-50 truncate">
                            {isHome ? "vs." : "@"} {opponent?.teamName || "Unbekannt"}
                            {isPlayoff && (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-sm bg-signal-wait/10 text-signal-wait text-[10px] font-semibold px-2 py-0.5 align-middle">
                                <PiTrophyBold className="text-[9px]" />
                                {m.playoffRound || "Playoffs"}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-mist-400">
                            {formatDate(m.date)}
                            {m.location ? ` · ${m.location}` : ""}
                            {m.leagueId?.name ? ` · ${m.leagueId.name}` : ""}
                          </p>
                        </div>
                        {score ? (
                          <span
                            className={`text-lg font-bold flex-shrink-0 ${
                              won ? "text-signal-ok" : "text-paper-50"
                            }`}
                          >
                            {own} : {opp}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-signal-wait bg-signal-wait/10 rounded-sm px-3 py-1 flex-shrink-0">
                            Anstehend
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}

        {/* Saison-Historie */}
        {tab === "saisons" && (
          <div>
            {history.length === 0 ? (
              <div className="bg-navy-800 rounded-md border border-navy-600 p-10 text-center text-sm text-mist-400">
                Noch keine abgeschlossene Saison. Die Historie (Liga, Platz, Bilanz,
                Status) wird beim Saisonabschluss eingefroren.
              </div>
            ) : (
              <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-mist-400 text-left border-b border-navy-600">
                        <th className="font-medium py-3 pl-4">Saison</th>
                        <th className="font-medium py-3">Liga</th>
                        <th className="font-medium py-3 text-center">Platz</th>
                        <th className="font-medium py-3 text-center">S–N</th>
                        <th className="font-medium py-3 text-center">Diff</th>
                        <th className="font-medium py-3 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id} className="border-b border-navy-600 last:border-0">
                          <td className="py-3 pl-4 font-medium text-paper-50">{h.season || "—"}</td>
                          <td className="py-3 text-mist-300">
                            {h.leagueId ? (
                              <Link href={`/ligen/${h.leagueId}`} className="hover:text-brand-400">
                                {h.leagueName}
                              </Link>
                            ) : (
                              h.leagueName || "—"
                            )}
                          </td>
                          <td className="py-3 text-center text-mist-300">
                            {h.champion ? (
                              <span className="inline-flex items-center gap-1 text-signal-wait font-semibold">
                                <PiCrownBold className="text-xs" /> Meister
                              </span>
                            ) : (
                              h.placement ?? "—"
                            )}
                          </td>
                          <td className="py-3 text-center text-mist-400">
                            {h.wins}–{h.losses}
                          </td>
                          <td
                            className={`py-3 text-center font-medium ${
                              h.diff > 0 ? "text-signal-ok" : h.diff < 0 ? "text-signal-error" : "text-mist-400"
                            }`}
                          >
                            {h.diff > 0 ? `+${h.diff}` : h.diff}
                          </td>
                          <td className="py-3 pr-4">
                            {h.status && h.status !== "aktiv" ? (
                              <span className="text-xs rounded-sm bg-navy-700 text-mist-400 px-2 py-0.5">
                                {teamSeasonStatusLabel(h.status)}
                              </span>
                            ) : (
                              <span className="text-xs text-mist-400">Aktiv</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* News */}
        {tab === "news" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-navy-800 rounded-md border border-navy-600 p-10 text-center text-sm text-mist-400">
                Noch keine Beiträge.
              </div>
            ) : (
              posts.map((p) => (
                <PostCard key={p._id} post={p} currentPlayerId={meId} />
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
