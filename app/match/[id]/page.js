"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiBasketballBold,
  PiCheckCircleBold,
  PiMapPinBold,
  PiStarFill,
  PiUsersBold,
} from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Loading from "@/components/ui/Loading";
import Footer from "@/components/layout/Footer";
import Avatar from "@/components/Avatar";
import SplitFlap from "@/components/ui/SplitFlap";
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
        ring="ring-2 ring-paper-50/10"
      />
      <span className="text-sm font-semibold text-paper-50 text-center truncate w-full group-hover:text-brand-300 transition-colors">
        {team?.teamName || "Unbekannt"}
      </span>
    </Link>
  );
}

function StatTable({ stats }) {
  const playing = stats.filter((s) => !s.didNotPlay);
  if (playing.length === 0) {
    return <p className="text-sm text-mist-400 py-2">Keine Statistiken erfasst.</p>;
  }
  const sorted = [...playing].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  const topPoints = sorted[0]?.points ?? 0;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs text-mist-400 text-left">
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
            <tr key={s._id} className="border-t border-navy-600">
              <td className="py-2">
                <span className="inline-flex items-center gap-1.5">
                  {s.player?.slug ? (
                    <Link
                      href={`/player/view-player/${s.player.slug}`}
                      className="text-paper-50 hover:text-brand-400"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="text-paper-50">{name}</span>
                  )}
                  {isTop && (
                    <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                      Top
                    </span>
                  )}
                </span>
              </td>
              <td className={`py-2 text-center font-semibold ${isTop ? "text-brand-400" : "text-paper-50"}`}>
                {s.points ?? 0}
              </td>
              <td className="font-mono tabular-nums py-2 text-center text-mist-400">{s.assists ?? 0}</td>
              <td className="font-mono tabular-nums py-2 text-center text-mist-400">{s.rebounds ?? 0}</td>
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
        <Loading />
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-paper-50">Spiel nicht gefunden</h1>
          <Link href="/spiele" className="mt-4 text-brand-400 hover:underline">
            Zurück zur Spielübersicht
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const score = teamScores(match);
  const completed = match.status === "completed";
  // Die Doppelbestätigung ist der Vertrauensunterschied der Plattform: Beide
  // Teams haben unabhängig gemeldet und es stimmte überein.
  //
  // `resultStatus === "confirmed"` allein reicht dafür NICHT als Beleg: Trägt
  // ein Super-Admin ein Ergebnis über /admin/update-match ein (Standardfall bei
  // Mismatch-Auflösung oder fehlender Rückmeldung), setzt die API beide
  // teamXResult-Objekte aus derselben Eingabe und `confirmed` obendrauf –
  // gemeldet hat dann aber nur eine Partei. Der Satz "Von beiden Teams
  // bestätigt" wäre in dem Fall schlicht falsch, und eine falsche
  // Vertrauensaussage ist an dieser Stelle der teuerste denkbare Fehler
  // (Befund Kai, 12.08.2026).
  //
  // `submittedBy` ist das belastbare Merkmal: Es wird ausschließlich im echten
  // Meldeweg gesetzt (app/api/team/submit-match-result), nie im Admin-Pfad.
  const bestaetigt =
    match.resultStatus === "confirmed" &&
    !!match.teamAResult?.submittedBy &&
    !!match.teamBResult?.submittedBy;
  const verify = matchVerification(match);
  const statsA = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamA?._id)
  );
  const statsB = (match.playerStats || []).filter(
    (s) => String(s.team) === String(match.teamB?._id)
  );

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      {/* Navy-Scoreboard-Hero */}
      <div className="bg-navy-900">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {match.leagueId?.name && (
            <p
              className={`text-center text-xs font-semibold text-brand-400 uppercase tracking-widest ${
                match.stage === "Playoffs" ? "mb-2" : "mb-6"
              }`}
            >
              {match.leagueId.name}
              {match.leagueId.season ? ` · ${match.leagueId.season}` : ""}
            </p>
          )}
          {match.stage === "Playoffs" && (
            <p className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-1 rounded-sm bg-signal-wait/15 text-signal-wait text-xs font-semibold px-3 py-1">
                🏆 Playoffs{match.playoffRound ? ` · ${match.playoffRound}` : ""}
              </span>
            </p>
          )}
          <div className="flex items-start gap-4">
            <TeamBadge team={match.teamA} />
            <div className="text-center px-2 pt-3">
              {score ? (
                // Anzeigetafel: Monospace mit Tabellenziffern, damit der Doppelpunkt
                // nicht wandert, und die 2px-Markenleiste als Unterkante – die
                // dritte und letzte Stelle, an der dieses Signaturelement steht.
                // Der aeussere Block erzwingt den Zeilenumbruch: Ohne ihn stand
                // die inline-block-Anzeigetafel auf 390px in derselben Zeile wie
                // das Status-Etikett und quetschte die Teamnamen auf "Esse…".
                <div>
                <div className="inline-block border-b-2 border-brand-500 pb-1">
                  <div className="font-mono tabular-nums text-4xl sm:text-5xl font-bold whitespace-nowrap">
                    <SplitFlap delay={0} className={score.a >= score.b ? "text-paper-50" : "text-mist-400"}>
                      {score.a}
                    </SplitFlap>
                    <span className="text-mist-600 mx-1.5">:</span>
                    <SplitFlap delay={140} className={score.b >= score.a ? "text-paper-50" : "text-mist-400"}>
                      {score.b}
                    </SplitFlap>
                  </div>
                </div>
                </div>
              ) : (
                <div className="text-xl font-semibold text-mist-400 pt-3">vs</div>
              )}
              <span
                className={`mt-3 inline-block text-xs font-medium rounded-full px-3 py-1 ${
                  completed
                    ? "bg-signal-ok/20 text-signal-ok"
                    : "bg-navy-600/20 text-mist-300"
                }`}
              >
                {completed ? "Beendet" : "Geplant"}
              </span>
            </div>
            <TeamBadge team={match.teamB} />
          </div>

          {/* Bewusst UNTER der Teamzeile, nicht in der Mittelspalte: Dort machte
              der Satz die Spalte so breit, dass die Teamnamen auf 390px zu
              "Essen En…" abgeschnitten wurden. */}
          {bestaetigt && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-mist-400">
              <PiCheckCircleBold className="text-signal-ok" />
              Von beiden Teams bestätigt
            </p>
          )}

          <div className="mt-6 flex flex-col items-center gap-1 text-sm text-mist-400">
            <span>{formatDate(match.date)}</span>
            {match.location && (
              <span className="flex items-center gap-1">
                <PiMapPinBold className="text-brand-400" /> {match.location}
              </span>
            )}
            {verify && (verify.state === "unverified" || verify.state === "mismatch") && (
              <span
                className={`mt-2 text-xs font-medium rounded-full px-3 py-1 ${
                  verify.state === "mismatch"
                    ? "bg-signal-error/20 text-signal-error"
                    : "bg-signal-wait/20 text-signal-wait"
                }`}
              >
                {verify.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* MVP / Zuschauer / Spielbericht (optional) */}
        {completed && (match.mvp || match.attendance || match.report) && (
          <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {match.mvp && (
                <span className="inline-flex items-center gap-1.5">
                  <PiStarFill className="text-signal-wait" />
                  <span className="text-mist-400">MVP:</span>
                  <Link
                    href={`/player/view-player/${match.mvp.slug || match.mvp._id}`}
                    className="font-medium text-paper-50 hover:text-brand-400"
                  >
                    {match.mvp.firstName} {match.mvp.lastName}
                  </Link>
                </span>
              )}
              {match.attendance ? (
                <span className="inline-flex items-center gap-1.5 text-mist-400">
                  <PiUsersBold className="text-mist-400" /> {match.attendance} Zuschauer
                </span>
              ) : null}
            </div>
            {match.report && (
              <p className="mt-3 border-t border-navy-600 pt-3 text-sm text-mist-300 whitespace-pre-line">
                {match.report}
              </p>
            )}
          </div>
        )}

        {/* Spieler-Stats */}
        {completed && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
              <h2 className="font-semibold text-paper-50 mb-2 truncate">
                {match.teamA?.teamName}
              </h2>
              <StatTable stats={statsA} />
            </div>
            <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
              <h2 className="font-semibold text-paper-50 mb-2 truncate">
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
