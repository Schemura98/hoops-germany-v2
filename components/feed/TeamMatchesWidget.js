"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiBasketballBold, PiMapPinBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Avatar from "@/components/Avatar";
import Tabs from "@/components/ui/Tabs";
import Loading from "@/components/ui/Loading";
import { teamScores, matchVerification } from "@/lib/matchScore";

function dateLabel(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Eine Mannschaft als Zeile mit optionaler Punktzahl (Sieger hervorgehoben).
function TeamRow({ team, points, isWinner }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar
        name={team?.teamName}
        src={team?.logo}
        className="h-5 w-5"
        textClass="text-[9px]"
        square
      />
      <span
        className={`flex-1 truncate text-sm ${
          isWinner ? "font-semibold text-paper-50" : "text-mist-300"
        }`}
      >
        {team?.teamName || "Unbekannt"}
      </span>
      {points != null && (
        <span
          className={`text-sm tabular-nums ${
            isWinner ? "font-bold text-paper-50" : "text-mist-400"
          }`}
        >
          {points}
        </span>
      )}
    </div>
  );
}

function MatchMini({ match }) {
  const score = teamScores(match);
  const verify = matchVerification(match);
  const winId = String(match.winningTeam || "");
  const aId = String(match.teamA?._id || match.teamA || "");
  const bId = String(match.teamB?._id || match.teamB || "");

  return (
    <Link
      href={`/match/${match._id}`}
      className="block rounded-md border border-navy-600 hover:border-brand-500/50 hover:bg-navy-700 px-3 py-2.5 transition-colors"
    >
      <div className="space-y-1.5">
        <TeamRow team={match.teamA} points={score?.a} isWinner={!!winId && winId === aId} />
        <TeamRow team={match.teamB} points={score?.b} isWinner={!!winId && winId === bId} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-mist-400">
        <span className="whitespace-nowrap">{dateLabel(match.date)}</span>
        {match.location && (
          <span className="flex items-center gap-1 min-w-0 truncate">
            <PiMapPinBold className="flex-shrink-0" /> {match.location}
          </span>
        )}
      </div>
      {verify && (verify.state === "unverified" || verify.state === "mismatch") && (
        <div
          className={`mt-1.5 text-[10px] font-medium rounded-full px-2 py-0.5 inline-block ${
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

const LIMIT = 5;

// preloaded/preloadedLoading: Die Newsfeed-Seite lädt my-matches bereits für die
// Spieltag-Leiste und reicht die Daten hier durch – sonst würde derselbe
// Endpunkt beim Öffnen zweimal abgefragt. Ohne diese Props lädt das Widget
// weiterhin selbst (Stand-alone-Verwendung).
export default function TeamMatchesWidget({ preloaded, preloadedLoading, nackt = false }) {
  const external = preloaded !== undefined || preloadedLoading !== undefined;
  const [ownData, setOwnData] = useState(null); // { matches, myTeamId, followedTeamIds }
  const [ownLoading, setOwnLoading] = useState(true);
  const [scope, setScope] = useState("mine"); // mine | followed
  const [tab, setTab] = useState("upcoming"); // upcoming | results

  useEffect(() => {
    if (external) return;
    let active = true;
    (async () => {
      try {
        const token = getPlayerToken();
        const { data } = await axios.post("/api/player/my-matches", { token });
        if (!active) return;
        setOwnData(data);
      } catch {
        if (active) setOwnData({ matches: [], myTeamId: null, followedTeamIds: [] });
      } finally {
        if (active) setOwnLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [external]);

  const data = external ? preloaded : ownData;
  const loading = external ? !!preloadedLoading : ownLoading;

  // Sinnvoller Standard-Bereich, sobald Daten da sind: eigenes Team, sonst gefolgte.
  useEffect(() => {
    if (data) setScope(data.myTeamId ? "mine" : "followed");
  }, [data]);

  const hasMine = !!data?.myTeamId;
  const hasFollowed = (data?.followedTeamIds || []).length > 0;
  const showScopeToggle = hasMine && hasFollowed;

  const { upcoming, results } = useMemo(() => {
    if (!data) return { upcoming: [], results: [] };
    const ids =
      scope === "mine"
        ? data.myTeamId
          ? [data.myTeamId]
          : []
        : data.followedTeamIds || [];
    const inScope = (m) =>
      ids.includes(String(m.teamA?._id || m.teamA)) ||
      ids.includes(String(m.teamB?._id || m.teamB));

    const filtered = (data.matches || []).filter(inScope);
    const up = filtered
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const res = filtered
      .filter((m) => m.status === "completed")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { upcoming: up, results: res };
  }, [data, scope]);

  const list = tab === "upcoming" ? upcoming : results;

  return (
    <div className={nackt ? "" : "bg-navy-800 rounded-md border border-navy-600 p-4"}>
      {!nackt && (
        <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2">
          <PiBasketballBold className="text-brand-400" /> Spiele
        </h3>
      )}

      {showScopeToggle && (
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-sm bg-navy-700 p-1 text-xs font-medium">
          <button
            onClick={() => setScope("mine")}
            className={`rounded-md px-2 py-1.5 transition-colors ${
              scope === "mine" ? "bg-navy-800 text-paper-50" : "text-mist-400"
            }`}
          >
            Mein Team
          </button>
          <button
            onClick={() => setScope("followed")}
            className={`rounded-md px-2 py-1.5 transition-colors ${
              scope === "followed" ? "bg-navy-800 text-paper-50" : "text-mist-400"
            }`}
          >
            Gefolgte
          </button>
        </div>
      )}

      <div className="mt-3">
        <Tabs
          fluid
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "upcoming", label: "Anstehend" },
            { key: "results", label: "Ergebnisse" },
          ]}
        />
      </div>

      <div className="mt-3 space-y-2 max-h-80 overflow-y-auto -mr-1 pr-1">
        {loading ? (
          <Loading className="py-6" size="text-xl" />
        ) : !hasMine && !hasFollowed ? (
          <p className="text-xs text-mist-400 py-4">
            Tritt einem Team bei oder folge Teams, um ihre Spiele hier zu sehen.{" "}
            <Link href="/teams" className="text-brand-400 font-medium">
              Teams entdecken
            </Link>
          </p>
        ) : list.length === 0 ? (
          <p className="text-xs text-mist-400 py-4">
            {tab === "upcoming"
              ? "Keine anstehenden Spiele."
              : "Noch keine Ergebnisse."}
          </p>
        ) : (
          <>
            {list.slice(0, LIMIT).map((m) => (
              <MatchMini key={m._id} match={m} />
            ))}
            <Link
              href="/spiele"
              className="block text-center text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors pt-1"
            >
              Alle Spiele ansehen
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
