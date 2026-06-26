"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaUsers,
  FaMapMarkerAlt,
  FaBasketballBall,
  FaCalendarAlt,
  FaNewspaper,
  FaHeart,
  FaRegComment,
  FaTrophy,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Tabs from "@/components/ui/Tabs";
import Loading from "@/components/ui/Loading";
import FollowButton from "@/components/FollowButton";
import { teamScores } from "@/lib/matchScore";
import { timeAgo } from "@/lib/timeAgo";
import { positionLabel } from "@/lib/constants";
import { getPlayerToken } from "@/lib/clientAuth";
import Avatar from "@/components/Avatar";

const TABS = [
  { key: "kader", label: "Kader", icon: FaUsers },
  { key: "spielplan", label: "Spielplan", icon: FaCalendarAlt },
  { key: "news", label: "News", icon: FaNewspaper },
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

export default function TeamTeamDetailSlugPage({ params }) {
  const slug = params.slug;

  const [data, setData] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("kader");

  const [joining, setJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    let active = true;
    (async () => {
      try {
        const res = await axios.post("/api/team/fetchsingleteaminfo", { slug });
        if (active) {
          setData(res.data);
          setFollowerCount(res.data.team.followersCount || 0);
          setState("ready");
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
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Team nicht gefunden</h1>
          <Link href="/teams" className="mt-4 text-brand-600 hover:underline">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Navy-Hero */}
      <div
        className="bg-gradient-to-r from-slate-950 to-slate-800 relative bg-cover bg-center"
        style={team.banner ? { backgroundImage: `url('${team.banner}')` } : undefined}
      >
        {team.banner && <div className="absolute inset-0 bg-slate-950/70" />}
        <div className="relative max-w-3xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <Avatar
            name={team.teamName}
            src={team.logo}
            className="h-24 w-24"
            textClass="text-3xl"
            square
            ring="ring-4 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white">{team.teamName}</h1>
            <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-300">
              {team.region && (
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-brand-400" /> {team.region}
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
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
              >
                {joining ? "Senden…" : "Team beitreten"}
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
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
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              joinMsg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {joinMsg.text}
          </div>
        )}

        {/* Liga + Platzierung */}
        {league && (
          <Link
            href={`/ligen/${league._id}`}
            className="mb-6 block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Liga{league.season ? ` · ${league.season}` : ""}
                </p>
                <p className="font-semibold text-gray-900 truncate">{league.name}</p>
                {leagueMeta && <p className="text-xs text-gray-500">{leagueMeta}</p>}
              </div>
              {league.isChampion ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-3 py-1">
                  <FaTrophy className="text-[10px]" /> Meister
                </span>
              ) : league.rank ? (
                <div className="shrink-0 text-right">
                  <p className="text-xl font-black text-gray-900 leading-none">
                    {league.rank}.
                  </p>
                  <p className="text-[11px] text-gray-400">von {league.totalTeams}</p>
                </div>
              ) : null}
            </div>
            {league.record && league.record.games > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                {league.record.wins}S · {league.record.losses}N
                <span className="text-gray-400">
                  {" "}
                  · Korbdiff {league.record.diff > 0 ? `+${league.record.diff}` : league.record.diff}
                </span>
                {league.finished && (
                  <span className="ml-2 text-amber-700 font-medium">Saison abgeschlossen</span>
                )}
              </p>
            )}
          </Link>
        )}

        {team.about && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600 whitespace-pre-line">{team.about}</p>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {members.length === 0 && team.rosterSlots.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine Kaderinformationen.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {members.map((m) => {
                  const initials = `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();
                  return (
                    <Link
                      key={m._id}
                      href={`/player/view-player/${m.slug || m._id}`}
                      className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <Avatar
                        name={`${m.firstName} ${m.lastName}`}
                        src={m.profileImage}
                        className="h-10 w-10"
                        textClass="text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{positionLabel(m.position) || "—"}</p>
                      </div>
                      {m.position && (
                        <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-md">
                          {positionLabel(m.position)}
                        </span>
                      )}
                    </Link>
                  );
                })}
                {/* Offene/Slot-Plätze ohne Account */}
                {team.rosterSlots
                  .filter((s) => !s.claimedBy)
                  .map((slot) => (
                    <div key={slot._id} className="flex items-center gap-3 py-3 opacity-70">
                      <span className="h-10 w-10 rounded-full bg-gray-100 text-gray-400 text-xs font-semibold flex items-center justify-center">
                        {slot.number || "–"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {slot.name || "Offener Platz"}
                        </p>
                        <p className="text-xs text-gray-400">{positionLabel(slot.position) || "—"}</p>
                      </div>
                      <span className="text-xs font-medium rounded-full px-3 py-1 bg-amber-100 text-amber-700">
                        {slot.status === "pending" ? "Ausstehend" : "Frei"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Spielplan */}
        {tab === "spielplan" && (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
                Noch keine Spiele angesetzt.
              </div>
            ) : (
              matches.map((m) => {
                const isHome = String(m.teamA?._id) === String(team._id);
                const opponent = isHome ? m.teamB : m.teamA;
                const score = teamScores(m);
                const own = score ? (isHome ? score.a : score.b) : null;
                const opp = score ? (isHome ? score.b : score.a) : null;
                const won = score && own > opp;
                return (
                  <div
                    key={m._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {isHome ? "vs." : "@"} {opponent?.teamName || "Unbekannt"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(m.date)}
                        {m.location ? ` · ${m.location}` : ""}
                      </p>
                    </div>
                    {score ? (
                      <span
                        className={`text-lg font-bold flex-shrink-0 ${
                          won ? "text-green-600" : "text-gray-900"
                        }`}
                      >
                        {own} : {opp}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-3 py-1 flex-shrink-0">
                        Anstehend
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* News */}
        {tab === "news" && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-500">
                Noch keine Beiträge.
              </div>
            ) : (
              posts.map((p) => {
                const author = p.player || {};
                const initials = `${author.firstName?.[0] || ""}${author.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      {author.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={author.profileImage} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                          {initials || "?"}
                        </span>
                      )}
                      <div>
                        <Link
                          href={`/player/view-player/${author.slug || author._id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-brand-600"
                        >
                          {author.firstName} {author.lastName}
                        </Link>
                        <p className="text-xs text-gray-400">{timeAgo(p.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{p.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaHeart /> {p.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaRegComment /> {p.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
