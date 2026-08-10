"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaMapMarkerAlt, FaTrophy } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/Avatar";
import Tabs from "@/components/ui/Tabs";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { inputClassSm } from "@/lib/ui";
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
  const isPlayoff = match.stage === "Playoffs";
  const resultPending =
    match.status === "scheduled" && new Date(match.date) < new Date();
  return (
    <Link
      href={`/match/${match._id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out-strong motion-reduce:hover:translate-y-0"
    >
      {(match.leagueId?.name || isPlayoff) && (
        <div className="mb-2 flex items-center justify-center gap-2">
          {match.leagueId?.name && (
            <span className="text-[11px] font-medium text-gray-500">
              {match.leagueId.name}
              {match.leagueId.season ? ` · ${match.leagueId.season}` : ""}
            </span>
          )}
          {isPlayoff && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5">
              <FaTrophy className="text-[9px]" /> Playoffs
              {match.playoffRound ? ` · ${match.playoffRound}` : ""}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={match.teamA} />
        <div className="text-center">
          {score ? (
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
              {score.a} : {score.b}
            </span>
          ) : (
            <span className="text-xs text-gray-500 font-medium">vs</span>
          )}
        </div>
        <TeamSide team={match.teamB} align="right" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500">
        <span>{formatDate(match.date)}</span>
        {match.location && (
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt /> {match.location}
          </span>
        )}
      </div>
      {resultPending && (
        <div className="mt-2 text-center text-[11px] font-medium rounded-full px-3 py-1 bg-gray-100 text-gray-600">
          Ergebnis ausstehend
        </div>
      )}
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
  const [tab, setTab] = useState("upcoming"); // upcoming | results | all
  const [stage, setStage] = useState("all"); // all | Hauptrunde | Playoffs
  const [league, setLeague] = useState(""); // leagueId
  const [season, setSeason] = useState("");
  const [ort, setOrt] = useState("");
  const [dateFrom, setDateFrom] = useState("");

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

  // Filter-Optionen aus den geladenen Spielen ableiten.
  const { leagueOptions, seasonOptions } = useMemo(() => {
    const lg = new Map();
    const se = new Set();
    for (const m of matches) {
      if (m.leagueId?._id) {
        lg.set(String(m.leagueId._id), {
          id: String(m.leagueId._id),
          label: `${m.leagueId.name}${m.leagueId.season ? ` · ${m.leagueId.season}` : ""}`,
        });
      }
      if (m.leagueId?.season) se.add(m.leagueId.season);
    }
    return {
      leagueOptions: [...lg.values()].sort((a, b) => a.label.localeCompare(b.label)),
      seasonOptions: [...se].sort().reverse(),
    };
  }, [matches]);

  // "Anstehend" heißt: geplant UND heute oder später – vergangene Spiele ohne
  // Ergebnis würden die Liste sonst als veraltet erscheinen lassen.
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filtered = useMemo(() => {
    const list = matches.filter((m) => {
      if (tab === "upcoming" && (m.status !== "scheduled" || new Date(m.date) < startOfToday))
        return false;
      if (tab === "results" && m.status !== "completed") return false;
      if (stage !== "all" && (m.stage || "Hauptrunde") !== stage) return false;
      if (league && String(m.leagueId?._id || "") !== league) return false;
      if (season && (m.leagueId?.season || "") !== season) return false;
      if (ort && !(m.location || "").toLowerCase().includes(ort.toLowerCase())) return false;
      if (dateFrom && new Date(m.date) < new Date(dateFrom)) return false;
      return true;
    });
    // Anstehend aufsteigend, sonst neueste zuerst.
    return list.sort((a, b) =>
      tab === "upcoming"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );
  }, [matches, tab, stage, league, season, ort, dateFrom, startOfToday]);

  const counts = useMemo(
    () => ({
      upcoming: matches.filter(
        (m) => m.status === "scheduled" && new Date(m.date) >= startOfToday
      ).length,
      results: matches.filter((m) => m.status === "completed").length,
      all: matches.length,
    }),
    [matches, startOfToday]
  );

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
              className="mb-4 max-w-md"
              fluid
              value={tab}
              onChange={setTab}
              tabs={[
                { key: "upcoming", label: "Anstehend", count: counts.upcoming },
                { key: "results", label: "Ergebnisse", count: counts.results },
                { key: "all", label: "Alle", count: counts.all },
              ]}
            />

            {/* Filterleiste */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputClassSm}>
                <option value="all">Alle Abschnitte</option>
                <option value="Hauptrunde">Hauptrunde</option>
                <option value="Playoffs">Playoffs</option>
              </select>
              <select value={league} onChange={(e) => setLeague(e.target.value)} className={inputClassSm}>
                <option value="">Alle Ligen</option>
                {leagueOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <select value={season} onChange={(e) => setSeason(e.target.value)} className={inputClassSm}>
                <option value="">Alle Saisons</option>
                {seasonOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Ort suchen…"
                className={inputClassSm}
              />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={inputClassSm}
                title="Spiele ab diesem Datum"
              />
              {(stage !== "all" || league || season || ort || dateFrom) && (
                <button
                  type="button"
                  onClick={() => {
                    setStage("all");
                    setLeague("");
                    setSeason("");
                    setOrt("");
                    setDateFrom("");
                  }}
                  className="rounded-lg border border-gray-200 text-sm text-gray-500 hover:text-brand-600 hover:border-brand-300"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <EmptyState title="Keine Spiele für diese Filter." />
            ) : (
              <div className="space-y-3">
                {filtered.map((m) => (
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
