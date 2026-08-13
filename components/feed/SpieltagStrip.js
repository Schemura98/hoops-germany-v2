"use client";

import Link from "next/link";
import Avatar from "@/components/Avatar";
import Card from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { teamScores, matchVerification } from "@/lib/matchScore";

// „Spieltag-Leiste" am Kopf des Newsfeeds (13.08.2026, Newsfeed-Umbau).
//
// Beantwortet die Frage, mit der ein wiederkehrender Spieler die Seite öffnet:
// „Was ist passiert, seit ich weg war?" – mit den zwei ehrlichsten Antworten,
// die die Daten hergeben: dem nächsten angesetzten Spiel und dem letzten
// Ergebnis des EIGENEN Teams. Beides sind Verbindungen zu bereits Gebautem
// (`/match/[id]`), keine neuen Funktionen – ganz im Sinne von Ronjas Befund
// (docs/RETENTION-BEFUND-2026-08-13.md: es fehlten Verbindungen, keine Teile).
//
// Ehrlichkeits-Regeln (docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md):
// - Kein „Heim/Auswärts": teamA/teamB trägt diese Bedeutung im Datenmodell nicht.
// - Der Beleg-Status steht NEBEN dem Ergebnis (Bestätigt/strittig/unbestätigt),
//   Quelle ist matchVerification – dieselbe Logik wie auf /match/[id].
// - Ergebnisse ohne Punktestand (z.B. offener Mismatch) erscheinen nicht als Zahl.
// - Kein Team / keine Spiele → die Leiste erscheint gar nicht, statt mit
//   leeren Kästen Präsenz zu behaupten.
//
// Daten kommen als Prop von der Seite (ein my-matches-Abruf für Leiste UND
// Spiele-Widget), hier wird nur gelesen.

function dateLabel(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function dayLabel(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
}

const LABEL = "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400";

function StripCard({ href, children }) {
  return (
    <Link href={href} className="block min-w-0">
      <Card hover padding="p-4">
        {children}
      </Card>
    </Link>
  );
}

export default function SpieltagStrip({ data, loading, player }) {
  // Ohne eigenes Team gibt es keinen Spieltag – nichts anzeigen (kein Platzhalter).
  if (!player?.teamId) return null;

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 mb-6" aria-hidden="true">
        <div className="rounded-md border border-navy-600 bg-navy-800 p-4">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <div className="hidden sm:block rounded-md border border-navy-600 bg-navy-800 p-4">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
    );
  }

  const myTeamId = data?.myTeamId ? String(data.myTeamId) : null;
  if (!myTeamId) return null;

  const involvesMe = (m) =>
    String(m.teamA?._id || m.teamA) === myTeamId ||
    String(m.teamB?._id || m.teamB) === myTeamId;
  const mine = (data.matches || []).filter(involvesMe);

  const now = Date.now();
  const next =
    mine
      .filter((m) => m.status === "scheduled" && new Date(m.date).getTime() >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;
  const last =
    mine
      .filter((m) => m.status === "completed" && teamScores(m))
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

  if (!next && !last) return null;

  // Letztes Ergebnis aus Sicht des eigenen Teams lesen.
  let lastView = null;
  if (last) {
    const score = teamScores(last);
    const aIsMine = String(last.teamA?._id || last.teamA) === myTeamId;
    const my = aIsMine ? score.a : score.b;
    const opp = aIsMine ? score.b : score.a;
    const opponent = aIsMine ? last.teamB : last.teamA;
    // Drei Ausgänge, nicht zwei. `won: my > opp` hätte ein Unentschieden als
    // „Niederlage" in Fehlerrot angezeigt — das Datenmodell sieht Unentschieden
    // ausdrücklich vor (submit-match-result setzt bei aPts === bPts kein
    // winningTeam, lib/matchScore.js nennt es beim Namen).
    const ausgang = my > opp ? "sieg" : my < opp ? "niederlage" : "unentschieden";
    const verify = matchVerification(last);
    // Nur ein beidseitig bestätigtes Ergebnis darf als Tatsache auftreten.
    // Solange nur eine Seite gemeldet hat (oder sich beide widersprechen), ist
    // „Sieg" eine Behauptung aus einer Quelle — dann bleibt das Wort stehen,
    // aber ohne die grüne Zusage, und der Vorbehalt darunter trägt die Aussage.
    const belegt = verify?.state === "confirmed" || verify?.state === "final";
    lastView = { my, opp, ausgang, belegt, opponent, verify };
  }

  const nextOpponent = next
    ? String(next.teamA?._id || next.teamA) === myTeamId
      ? next.teamB
      : next.teamA
    : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 mb-6">
      {next && (
        <StripCard href={`/match/${next._id}`}>
          <p className={LABEL}>Nächstes Spiel</p>
          <div className="mt-2 flex items-center gap-2.5 min-w-0">
            <Avatar
              name={nextOpponent?.teamName}
              src={nextOpponent?.logo}
              className="h-8 w-8 flex-shrink-0"
              textClass="text-[10px]"
              square
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-paper-50 truncate">
                gegen {nextOpponent?.teamName || "Unbekannt"}
              </p>
              <p className="text-xs text-mist-400 font-mono truncate">
                {dateLabel(next.date)}
                {next.location ? ` · ${next.location}` : ""}
              </p>
            </div>
          </div>
        </StripCard>
      )}
      {lastView && (
        <StripCard href={`/match/${last._id}`}>
          <p className={LABEL}>Letztes Ergebnis</p>
          <div className="mt-2 flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-lg font-bold tabular-nums text-paper-50 flex-shrink-0">
              {lastView.my}:{lastView.opp}
            </span>
            <span
              className={`text-xs font-semibold flex-shrink-0 ${
                !lastView.belegt
                  ? "text-mist-300"
                  : lastView.ausgang === "sieg"
                  ? "text-signal-ok"
                  : lastView.ausgang === "niederlage"
                  ? "text-signal-error"
                  : "text-mist-300"
              }`}
            >
              {lastView.ausgang === "sieg"
                ? "Sieg"
                : lastView.ausgang === "niederlage"
                ? "Niederlage"
                : "Unentschieden"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-mist-400 truncate">
                gegen {lastView.opponent?.teamName || "Unbekannt"} · {dayLabel(last.date)}
              </p>
              {lastView.verify && lastView.verify.state !== "confirmed" && lastView.verify.state !== "final" && (
                <p
                  className={`text-[11px] truncate ${
                    lastView.verify.state === "mismatch" ? "text-signal-error" : "text-signal-wait"
                  }`}
                >
                  {lastView.verify.label}
                </p>
              )}
            </div>
          </div>
        </StripCard>
      )}
    </div>
  );
}
