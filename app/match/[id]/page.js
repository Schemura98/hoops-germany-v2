"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { teamScores } from "@/lib/matchScore";

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
      className="flex flex-col items-center gap-2 flex-1 min-w-0"
    >
      {team?.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logo} alt="" className="h-14 w-14 rounded-full object-cover" />
      ) : (
        <span className="h-14 w-14 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
          <FaUsers />
        </span>
      )}
      <span className="text-sm font-medium text-gray-900 text-center truncate w-full">
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
        {playing.map((s) => {
          const name = s.player
            ? `${s.player.firstName} ${s.player.lastName}`
            : s.playerName || "—";
          return (
            <tr key={s._id} className="border-t border-gray-100">
              <td className="py-2">
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
              </td>
              <td className="py-2 text-center font-medium">{s.points ?? 0}</td>
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
  const statsA = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamA?._id)
  );
  const statsB = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamB?._id)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Scoreboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {match.leagueId?.name && (
            <p className="text-center text-xs font-medium text-brand-600 mb-4">
              {match.leagueId.name}
              {match.leagueId.season ? ` · ${match.leagueId.season}` : ""}
            </p>
          )}
          <div className="flex items-center gap-4">
            <TeamBadge team={match.teamA} />
            <div className="text-center px-2">
              {score ? (
                <div className="text-3xl font-bold text-gray-900 whitespace-nowrap">
                  {score.a} : {score.b}
                </div>
              ) : (
                <div className="text-xl font-semibold text-gray-400">vs</div>
              )}
              <span
                className={`mt-2 inline-block text-xs font-medium rounded-full px-3 py-1 ${
                  completed
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {completed ? "Beendet" : "Geplant"}
              </span>
            </div>
            <TeamBadge team={match.teamB} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 text-sm text-gray-500">
            <span>{formatDate(match.date)}</span>
            {match.location && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt /> {match.location}
              </span>
            )}
          </div>
        </div>

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
