"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  PiBasketballBold,
  PiMapPinBold,
  PiTrophyBold,
  PiTableBold,
} from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Avatar from "@/components/Avatar";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { inputClassSm } from "@/lib/ui";
import { teamScores, matchVerification } from "@/lib/matchScore";

function TeamSide({ team, align = "left" }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <Avatar name={team?.teamName} src={team?.logo} className="h-8 w-8" textClass="text-[10px]" square />
      <span className="text-sm font-medium text-paper-50 truncate">
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
      className="block bg-navy-800 rounded-md border border-navy-600 p-4 hover:border-brand-500 hover:bg-navy-700 transition-[background-color,border-color] duration-200 ease-out-strong [&_.font-mono]:transition-colors [&_.font-mono]:duration-200 hover:[&_.font-mono]:text-brand-400"
    >
      {(match.leagueId?.name || isPlayoff) && (
        <div className="mb-2 flex items-center justify-center gap-2">
          {match.leagueId?.name && (
            <span className="text-[11px] font-medium text-mist-400">
              {match.leagueId.name}
              {match.leagueId.season ? ` · ${match.leagueId.season}` : ""}
            </span>
          )}
          {isPlayoff && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-signal-wait/10 text-signal-wait text-[10px] font-semibold px-2 py-0.5">
              <PiTrophyBold className="text-[9px]" /> Playoffs
              {match.playoffRound ? ` · ${match.playoffRound}` : ""}
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={match.teamA} />
        <div className="text-center">
          {score ? (
            <span className="font-mono tabular-nums text-lg font-bold text-paper-50 whitespace-nowrap">
              {score.a} : {score.b}
            </span>
          ) : (
            <span className="text-xs text-mist-400 font-medium">vs</span>
          )}
        </div>
        <TeamSide team={match.teamB} align="right" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-mist-400">
        <span>{formatDate(match.date)}</span>
        {match.location && (
          <span className="flex items-center gap-1">
            <PiMapPinBold /> {match.location}
          </span>
        )}
      </div>
      {resultPending && (
        <div className="mt-2 text-center text-[11px] font-medium rounded-sm px-3 py-1 bg-navy-700 text-mist-400">
          Ergebnis ausstehend
        </div>
      )}
      {verify && (verify.state === "unverified" || verify.state === "mismatch") && (
        <div
          className={`mt-2 text-center text-[11px] font-medium rounded-full px-3 py-1 ${
            verify.state === "mismatch"
              ? "bg-signal-error/10 text-signal-error"
              : "bg-signal-wait/10 text-signal-wait"
          }`}
        >
          {verify.label}
        </div>
      )}
    </Link>
  );
}

// Karten-Skeleton im Format der echten Spielkarte (Team-vs-Team + Datum), plus
// Tabs-/Filter-Platzhalter für die Listenseite.
function MatchCardSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <Skeleton className="h-4 w-8" />
        <div className="flex items-center gap-2 justify-end">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-24 mx-auto mt-3" />
    </div>
  );
}

function SpielePageSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-full max-w-md rounded-md mb-4" />
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 rounded-sm" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Erlaubte Tab-Werte – aus der URL darf nichts Beliebiges in den Zustand.
const TABS = ["upcoming", "results", "all"];
const STAGES = ["all", "Hauptrunde", "Playoffs"];

function SpieleInhalt() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Startwerte kommen aus der URL: Damit ist /spiele?league=… ein echter,
  // teilbarer Zustand – und erst dadurch sind die Liga-Seite und die
  // Spielseite überhaupt auf den Spielplan verlinkbar.
  const [tab, setTab] = useState(() => {
    const t = searchParams.get("tab");
    return TABS.includes(t) ? t : "upcoming";
  });
  const [stage, setStage] = useState(() => {
    const s = searchParams.get("stage");
    return STAGES.includes(s) ? s : "all";
  });
  const [league, setLeague] = useState(() => searchParams.get("league") || ""); // leagueId
  const [season, setSeason] = useState(() => searchParams.get("season") || "");
  const [ort, setOrt] = useState(() => searchParams.get("ort") || "");
  const [dateFrom, setDateFrom] = useState(() => searchParams.get("ab") || "");

  // Zustand → URL. Bewusst `replace` statt `push`: Ein Filterklick ist kein
  // Seitenwechsel. Wer von der Liga-Tabelle herkommt, landet mit der
  // Zurück-Taste wieder dort und nicht in seiner eigenen Filter-Historie.
  const zuletztGeschrieben = useRef(null);
  useEffect(() => {
    const qs = new URLSearchParams();
    if (tab !== "upcoming") qs.set("tab", tab);
    if (stage !== "all") qs.set("stage", stage);
    if (league) qs.set("league", league);
    if (season) qs.set("season", season);
    if (ort) qs.set("ort", ort);
    if (dateFrom) qs.set("ab", dateFrom);
    const next = qs.toString();
    if (next === zuletztGeschrieben.current) return;
    zuletztGeschrieben.current = next;
    if (next === searchParams.toString()) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    // searchParams absichtlich nicht in den Abhängigkeiten: sonst schreibt
    // dieser Effekt seine eigene Änderung erneut.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, stage, league, season, ort, dateFrom, pathname, router]);

  // URL → Zustand. Greift, wenn die Adresse von außen wechselt: Zurück-Taste
  // oder ein Link auf /spiele?league=… , während die Seite schon offen ist.
  useEffect(() => {
    const cur = searchParams.toString();
    if (cur === zuletztGeschrieben.current) return;
    zuletztGeschrieben.current = cur;
    const t = searchParams.get("tab");
    const s = searchParams.get("stage");
    setTab(TABS.includes(t) ? t : "upcoming");
    setStage(STAGES.includes(s) ? s : "all");
    setLeague(searchParams.get("league") || "");
    setSeason(searchParams.get("season") || "");
    setOrt(searchParams.get("ort") || "");
    setDateFrom(searchParams.get("ab") || "");
  }, [searchParams]);

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

  // Kommt jemand über einen Liga-Link hier an, muss die Seite sagen, wo er
  // ist – und der Weg zurück zur Tabelle derselben Liga muss dieselbe Zeile
  // anbieten, nicht ein Menü drei Klicks weiter.
  const aktiveLiga = league ? leagueOptions.find((l) => l.id === league) : null;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wettbewerb"
        title="Spiele"
        subtitle={
          aktiveLiga ? aktiveLiga.label : "Anstehende Partien und aktuelle Ergebnisse."
        }
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {loading ? (
          <SpielePageSkeleton />
        ) : error ? (
          <EmptyState title="Spiele konnten nicht geladen werden." />
        ) : matches.length === 0 ? (
          <EmptyState icon={PiBasketballBold} title="Noch keine Spiele angesetzt." />
        ) : (
          <div>
            {/* Der Rückweg zur Tabelle steht dort, wo die Liga-Ansicht anfängt –
                nicht am Seitenende. Wer den Spielplan einer Liga ansieht, hat
                genau eine nächste Frage: wo stehen die jetzt? */}
            {aktiveLiga && (
              <Link
                href={`/ligen/${league}`}
                className="mb-4 inline-flex items-center gap-2 rounded-md border border-navy-600 bg-navy-800 px-4 py-2.5 text-sm font-semibold text-paper-50 hover:border-brand-500 hover:text-brand-300 transition-colors duration-150"
              >
                <PiTableBold className="text-brand-400" /> Tabelle dieser Liga
              </Link>
            )}

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
                  className="rounded-sm border border-navy-600 text-sm text-mist-400 hover:text-brand-400 hover:border-brand-300"
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

// useSearchParams verlangt eine Suspense-Grenze, sonst bricht der Build beim
// Vorrendern. Der Platzhalter ist derselbe Skelett-Aufbau wie beim Laden der
// Spiele – die Seite springt beim Übergang also nicht.
export default function SpielePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-950 flex flex-col">
          <Navbar />
          <PageHeader
            eyebrow="Wettbewerb"
            title="Spiele"
            subtitle="Anstehende Partien und aktuelle Ergebnisse."
          />
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
            <SpielePageSkeleton />
          </main>
          <Footer />
        </div>
      }
    >
      <SpieleInhalt />
    </Suspense>
  );
}
