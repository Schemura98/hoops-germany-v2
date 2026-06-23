"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Avatar from "@/components/Avatar";
import { teamScores, matchVerification } from "@/lib/matchScore";

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function TeamBadge({ team }) {
  return (
    <Link
      href={team?.slug ? `/team/team-detail/${team.slug}` : "#"}
      className="flex flex-col items-center gap-2 flex-1 min-w-0 group"
    >
      <Avatar
        name={team?.teamName}
        src={team?.logo}
        className="h-16 w-16"
        textClass="text-xl"
        square
        ring="ring-2 ring-white/10"
      />
      <span className="text-sm font-semibold text-white text-center truncate w-full group-hover:text-orange-300 transition-colors">
        {team?.teamName || "Unbekannt"}
      </span>
    </Link>
  );
}

function StatTable({ stats }) {
  const playing = stats.filter((s) => !s.didNotPlay);
  if (playing.length === 0) {
    return <p className="text-sm text-gray-400 py-2">Keine Statistiken erfasst.</p>;
  }
  const sorted = [...playing].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  const topPoints = sorted[0]?.points ?? 0;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-gray-400 text-left">
          <th className="font-medium py-1">Spieler</th>
          <th className="font-medium py-1 text-center w-12">PKT</th>
          <th className="font-medium py-1 text-center w-12">AST</th>
          <th className="font-medium py-1 text-center w-12">REB</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((s) => {
          const name = s.player
            ? `${s.player.firstName} ${s.player.lastName}`
            : s.playerName || "—";
          const isTop = topPoints > 0 && (s.points ?? 0) === topPoints;
          return (
            <tr key={s._id} className="border-t border-gray-100">
              <td className="py-2">
                <span className="inline-flex items-center gap-1.5">
                  {s.player?.slug ? (
                    <Link
                      href={`/player/view-player/${s.player.slug}`}
                      className="text-gray-900 hover:text-brand-600"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="text-gray-900">{name}</span>
                  )}
                  {isTop && (
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                      Top
                    </span>
                  )}
                </span>
              </td>
              <td className={`py-2 text-center font-semibold ${isTop ? "text-orange-600" : "text-gray-900"}`}>
                {s.points ?? 0}
              </td>
              <td className="py-2 text-center text-gray-600">{s.assists ?? 0}</td>
              <td className="py-2 text-center text-gray-600">{s.rebounds ?? 0}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function MatchIdPage({ params }) {
  const id = params.id;
  const [match, setMatch] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/match/${id}`);
        if (active) {
          setMatch(data.match);
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
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Spiel nicht gefunden</h1>
          <Link href="/spiele" className="mt-4 text-brand-600 hover:underline">
            Zurück zur Spielübersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const score = teamScores(match);
  const completed = match.status === "completed";
  const verify = matchVerification(match);
  const statsA = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamA?._id)
  );
  const statsB = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamB?._id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Navy-Scoreboard-Hero */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {match.leagueId?.name && (
            <p className="text-center text-xs font-semibold text-orange-400 uppercase tracking-widest mb-6">
              {match.leagueId.name}
              {match.leagueId.season ? ` · ${match.leagueId.season}` : ""}
            </p>
          )}
          <div className="flex items-start gap-4">
            <TeamBadge team={match.teamA} />
            <div className="text-center px-2 pt-3">
              {score ? (
                <div className="text-4xl font-black whitespace-nowrap">
                  <span className={score.a >= score.b ? "text-white" : "text-slate-500"}>
                    {score.a}
                  </span>
                  <span className="text-slate-600 mx-1">:</span>
                  <span className={score.b >= score.a ? "text-white" : "text-slate-500"}>
                    {score.b}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-semibold text-slate-400 pt-3">vs</div>
              )}
              <span
                className={`mt-3 inline-block text-xs font-medium rounded-full px-3 py-1 ${
                  completed
                    ? "bg-green-500/20 text-green-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {completed ? "Beendet" : "Geplant"}
              </span>
            </div>
            <TeamBadge team={match.teamB} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 text-sm text-slate-400">
            <span>{formatDate(match.date)}</span>
            {match.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-orange-400" /> {match.location}
              </span>
            )}
            {verify && (verify.state === "unverified" || verify.state === "mismatch") && (
              <span
                className={`mt-2 text-xs font-medium rounded-full px-3 py-1 ${
                  verify.state === "mismatch"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {verify.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Spieler-Stats */}
        {completed && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-2 truncate">
                {match.teamA?.teamName}
              </h2>
              <StatTable stats={statsA} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-2 truncate">
                {match.teamB?.teamName}
              </h2>
              <StatTable stats={statsB} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
