"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/Avatar";
import Tabs from "@/components/ui/Tabs";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { teamScores, matchVerification } from "@/lib/matchScore";

function TeamSide({ team, align = "left" }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Avatar name={team?.teamName} src={team?.logo} className="h-8 w-8" textClass="text-[10px]" square />
      <span className="text-sm font-medium text-gray-900 truncate">
        {team?.teamName || "Unbekannt"}
      </span>
    </div>
  );
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
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

function MatchCard({ match }) {
  const score = teamScores(match);
  const verify = matchVerification(match);
  return (
    <Link
      href={`/match/${match._id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-brand-200 transition-all"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={match.teamA} />
        <div className="text-center">
          {score ? (
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
              {score.a} : {score.b}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-medium">vs</span>
          )}
        </div>
        <TeamSide team={match.teamB} align="right" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-400">
        <span>{formatDate(match.date)}</span>
        {match.location && (
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt /> {match.location}
          </span>
        )}
      </div>
      {verify && (verify.state === "unverified" || verify.state === "mismatch") && (
        <div
          className={`mt-2 text-center text-[11px] font-medium rounded-full px-3 py-1 ${
            verify.state === "mismatch"
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {verify.label}
        </div>
      )}
    </Link>
  );
}

export default function SpielePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("upcoming"); // "upcoming" | "results"

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/matches/public");
        if (active) setMatches(data.matches || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const { upcoming, results } = useMemo(() => {
    const up = matches
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const res = matches.filter((m) => m.status === "completed");
    return { upcoming: up, results: res };
  }, [matches]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wettbewerb"
        title="Spiele"
        subtitle="Anstehende Partien und aktuelle Ergebnisse."
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {loading ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Spiele konnten nicht geladen werden." />
        ) : matches.length === 0 ? (
          <EmptyState icon={FaBasketballBall} title="Noch keine Spiele angesetzt." />
        ) : (
          <div>
            <Tabs
              className="mb-6 max-w-sm"
              fluid
              value={tab}
              onChange={setTab}
              tabs={[
                { key: "upcoming", label: "Anstehend", count: upcoming.length },
                { key: "results", label: "Ergebnisse", count: results.length },
              ]}
            />

            {tab === "upcoming" ? (
              upcoming.length === 0 ? (
                <EmptyState title="Keine anstehenden Spiele." />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((m) => (
                    <MatchCard key={m._id} match={m} />
                  ))}
                </div>
              )
            ) : results.length === 0 ? (
              <EmptyState title="Noch keine Ergebnisse." />
            ) : (
              <div className="space-y-3">
                {results.map((m) => (
                  <MatchCard key={m._id} match={m} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
