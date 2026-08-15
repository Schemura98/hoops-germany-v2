"use client";

import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { teamScores, matchVerification, beidseitigBelegt } from "@/lib/matchScore";

// Die Anzeigetafel am Kopf des Newsfeeds (15.08.2026).
//
// Ersetzt den früheren `SpieltagStrip` UND den eigenen Seitenkopf. Entwurf:
// `docs/NEWSFEED-DESKTOP-2026-08-15.md` (Vivien), Inhalt:
// `docs/NEWSFEED-BEFUND-2026-08-15.md` (Ronja).
//
// WARUM ES DIESE FLÄCHE GIBT
// Der Newsfeed benutzte als einzige nennenswerte Seite KEINES der fünf
// Signatur-Mittel des Projekts (Signaturleiste, SplitFlap, CountUp, Reveal,
// ScrollTable) – gemessen, nicht geschätzt. Er baute sogar einen eigenen
// `<header>` statt `PageHeader`, weshalb die Marken-Leiste fehlte. Und die
// Kernpositionierung („Scouting mit BELEGBAREN Fakten") wurde auf der
// meistbesuchten Fläche mit keiner einzigen Zahl über den Betrachter
// eingelöst: Ronja hat auf dem Live-Stand bei beiden Personas null eigene
// Werte gefunden.
//
// ⚠️ ALLE EHRLICHKEITSREGELN DES ALTEN `SpieltagStrip` GELTEN WEITER.
// Sie sind teuer erarbeitet, deshalb hier vollständig übernommen:
//   · Kein „Heim/Auswärts" – `teamA`/`teamB` trägt diese Bedeutung nicht.
//   · Der Beleg-Status steht NEBEN dem Ergebnis, Quelle `matchVerification`
//     – dieselbe Logik wie auf `/match/[id]`.
//   · Drei Ausgänge, nicht zwei: Unentschieden ist im Datenmodell vorgesehen.
//   · Bei STRITTIGEM Ergebnis erscheint die Zahl, aber KEIN Urteilswort:
//     `submit-match-result` setzt bei Mismatch den Stand aus Sicht von Team A.
//     Ein „Sieg" wäre dann die Meinung einer Seite, als Tatsache gesetzt.
//   · Kein Team / keine Daten → die Tafel erscheint GAR NICHT, statt mit
//     leeren Registern Präsenz zu behaupten.
//
// ⚠️ ABWEICHUNG VON VIVIENS ENTWURF, bewusst: Register 3 heißt bei ihr
// „Deine Saison" mit „12 Sp · 14,2 Pkt". Das baue ich NICHT, weil ich es nicht
// belegen kann: `my-matches` liefert die Spiele des eigenen und der gefolgten
// Teams – **nicht nach Saison gefiltert**. Eine Zahl „Saison" zu nennen, die
// keine Saisongrenze kennt, wäre exakt das Muster aus
// `docs/MUSTER-ZAHLEN-DIE-LUEGEN`: im Sinne des Codes eine Summe, im Sinne des
// Lesers eine Saisonbilanz. Stattdessen zeigt Register 3 **die eigenen Zahlen
// aus dem letzten Spiel, in dem welche erfasst sind** – dieselbe Aussage, die
// `lib/statsNotify.js` seit dem 13.08. per Glocke verschickt („Deine Zahlen
// stehen"), nur endlich auch auf der Fläche, auf der man täglich landet.
// Ein echter Saison-Schnitt braucht eine Saison-Grenze; das ist ein eigener
// Vorgang und steht als offener Punkt in der Übergabe.

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

const LABEL =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400";

// Ein Register der Tafel. Trenner sind Haarlinien, keine Kästen – die Tafel ist
// EINE Fläche mit Registern, nicht drei Karten nebeneinander.
function Register({ href, label, children, className = "" }) {
  const inhalt = (
    <>
      <p className={LABEL}>{label}</p>
      <div className="mt-2">{children}</div>
    </>
  );
  if (!href) return <div className={`min-w-0 p-4 sm:p-5 ${className}`}>{inhalt}</div>;
  return (
    <Link
      href={href}
      className={`block min-w-0 p-4 sm:p-5 transition-colors duration-200 hover:bg-navy-800 ${className}`}
    >
      {inhalt}
    </Link>
  );
}

export default function Anzeigetafel({ data, loading, player }) {
  // Ohne eigenes Team gibt es keinen Spieltag – nichts anzeigen.
  if (!player?.teamId) return null;

  if (loading) {
    return (
      <div
        className="mb-6 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-900"
        aria-hidden="true"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-navy-600">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`p-4 sm:p-5 ${i === 2 ? "hidden lg:block" : ""}`}>
              <Skeleton className="h-3 w-24 mb-3" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          ))}
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

  // Register 3: das jüngste Spiel, in dem für mich Werte erfasst sind.
  // ⚠️ Nicht zwingend dasselbe Spiel wie `last`: Ein Ergebnis kann eingetragen
  // sein, ohne dass jemand den Box-Score gepflegt hat. Deshalb eigene Suche –
  // sonst zeigte die Tafel „keine Zahlen", obwohl welche vorliegen.
  // ⚠️ Zwei Bedingungen, jede aus einem Gate-Befund (Kai B3/B4):
  //
  //  1. `status === "completed"` – Register 2 filterte danach, Register 3
  //     nicht. `match-stats/save` hat keine Status-Sperre; ein noch nicht
  //     gespieltes Spiel mit vorab getipptem Box-Score sortierte per Datum
  //     VOR alles andere und erschien als „Deine Zahlen".
  //
  //  2. Summe > 0 statt `!= null`. `toCount()` in `match-stats/save` liefert
  //     bei leerer Eingabe **0**, nicht null – der alte Filter griff also nie.
  //     Wer nur im Kader-Formular aufgeführt wurde, ohne dass jemand Zahlen
  //     eintrug, sah „0 PKT · 0 AST · 0 REB". `lib/statsNotify.js` fängt genau
  //     das ab („summe <= 0 → continue", Leerzeile aus dem Kader-Formular) –
  //     die Regel stand da, ich hatte sie beim Bauen nicht mitgenommen.
  const letztesMitWerten =
    mine
      .filter((m) => {
        if (m.status !== "completed") return false;
        const w = m.meineWerte;
        if (!w) return false;
        const summe = (w.points || 0) + (w.assists || 0) + (w.rebounds || 0);
        return summe > 0;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

  if (!next && !last && !letztesMitWerten) return null;

  // Letztes Ergebnis aus Sicht des eigenen Teams lesen.
  let lastView = null;
  if (last) {
    const score = teamScores(last);
    const aIsMine = String(last.teamA?._id || last.teamA) === myTeamId;
    const my = aIsMine ? score.a : score.b;
    const opp = aIsMine ? score.b : score.a;
    const opponent = aIsMine ? last.teamB : last.teamA;
    const ausgang = my > opp ? "sieg" : my < opp ? "niederlage" : "unentschieden";
    const verify = matchVerification(last);
    const belegt = verify?.state === "confirmed" || verify?.state === "final";
    const strittig = verify?.state === "mismatch";
    lastView = { my, opp, ausgang, belegt, strittig, opponent, verify };
  }

  const nextOpponent = next
    ? String(next.teamA?._id || next.teamA) === myTeamId
      ? next.teamB
      : next.teamA
    : null;

  // Wie viele Register stehen wirklich? Die Spaltenzahl richtet sich danach –
  // ein leeres Register wäre genau der Kasten, den die Regel verbietet.
  const anzahl = [next, lastView, letztesMitWerten].filter(Boolean).length;
  const spalten =
    anzahl >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : anzahl === 2 ? "sm:grid-cols-2" : "";

  return (
    <section
      className="mb-6 overflow-hidden rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-900"
      aria-label="Deine Anzeigetafel"
    >
      <div
        className={`grid divide-y divide-navy-600 sm:divide-y-0 sm:divide-x ${spalten}`}
      >
        {next && (
          <Register href={`/match/${next._id}`} label="Nächstes Spiel">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={nextOpponent?.teamName}
                src={nextOpponent?.logo}
                className="h-9 w-9 flex-shrink-0"
                textClass="text-[10px]"
                square
              />
              <div className="min-w-0">
                <p className="font-display text-xl font-black uppercase leading-none tracking-wide text-paper-50 truncate">
                  {nextOpponent?.teamName || "Unbekannt"}
                </p>
                <p className="mt-1 font-mono text-xs text-mist-400 truncate">
                  {dateLabel(next.date)}
                  {next.location ? ` · ${next.location}` : ""}
                </p>
              </div>
            </div>
          </Register>
        )}

        {lastView && (
          <Register href={`/match/${last._id}`} label="Letztes Ergebnis">
            <div className="flex items-baseline gap-3 min-w-0">
              {/* Anzeigetafel-Proportion: die Zahl ist das Element, nicht eine
                  Beschriftung daneben. Vorher `text-lg`. */}
              <span className="font-display text-4xl sm:text-5xl font-black leading-none tabular-nums text-paper-50 flex-shrink-0">
                {lastView.my}:{lastView.opp}
              </span>
              {lastView.strittig ? null : (
                <span
                  className={`text-sm font-semibold flex-shrink-0 ${
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
              )}
            </div>
            <p className="mt-1.5 text-xs text-mist-400 truncate">
              gegen {lastView.opponent?.teamName || "Unbekannt"} · {dayLabel(last.date)}
            </p>
            {lastView.verify &&
              lastView.verify.state !== "confirmed" &&
              lastView.verify.state !== "final" && (
                <p
                  className={`text-[11px] truncate ${
                    lastView.verify.state === "mismatch"
                      ? "text-signal-error"
                      : "text-signal-wait"
                  }`}
                >
                  {lastView.verify.label}
                </p>
              )}
          </Register>
        )}

        {letztesMitWerten && (
          <Register
            href={`/match/${letztesMitWerten._id}`}
            label="Deine Zahlen"
            className="hidden lg:block"
          >
            <div className="flex items-baseline gap-4 min-w-0">
              {[
                ["PKT", letztesMitWerten.meineWerte.points],
                ["AST", letztesMitWerten.meineWerte.assists],
                ["REB", letztesMitWerten.meineWerte.rebounds],
              ]
                // Ein nicht erfasster Wert ist nicht null Punkte. Nur zeigen,
                // was auch eingetragen wurde.
                .filter(([, v]) => v != null)
                .map(([k, v]) => (
                  <span key={k} className="flex-shrink-0">
                    <span className="font-display text-4xl sm:text-5xl font-black leading-none tabular-nums text-paper-50">
                      {v}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mist-400">
                      {k}
                    </span>
                  </span>
                ))}
            </div>
            {/* Der Beleg-Stand gehört an die eigene Zahl, nicht nur an das
                Team-Ergebnis – das IST das Versprechen der Plattform.
                ⚠️ Quelle ist `beidseitigBelegt`, NICHT `matchVerification`.
                Die erste Fassung fragte `state === "confirmed" || "final"` und
                behauptete damit „beidseitig bestätigt" für ein einseitig
                gemeldetes Ergebnis nach 48 Stunden UND für jedes vom Admin
                eingetragene. Beide Gates haben das unabhängig als blockierend
                gemeldet; Tobias hat es mit echten Seed-Daten reproduziert.
                ⚠️ Und: Das Ergebnis ist beidseitig bestätigt, der BOX-SCORE
                nicht – den trägt EIN Team-Admin ein. Der Satz sagt deshalb,
                worauf sich die Bestätigung bezieht. Derselbe Fehler war am
                14.08. schon einmal in Tour-Schritt 1. */}
            <p className="mt-1.5 text-xs text-mist-400 truncate">
              {dayLabel(letztesMitWerten.date)} ·{" "}
              {(() => {
                const v = matchVerification(letztesMitWerten);
                if (v?.state === "mismatch") return "Ergebnis strittig";
                if (beidseitigBelegt(letztesMitWerten))
                  return "Ergebnis von beiden Teams bestätigt";
                return "Ergebnis noch nicht beidseitig bestätigt";
              })()}
            </p>
          </Register>
        )}
      </div>
    </section>
  );
}
