"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrophyBold } from "react-icons/pi";
import Avatar from "@/components/Avatar";
import { BUNDESLAENDER } from "@/lib/constants";

// ⚠️ `min-w-0` und `w-full` sind hier NICHT kosmetisch (Befund Patrick,
// 15.08.2026: „Das Drop-Down ragt komplett in die Mitte und verdeckt Kontent").
//
// Ein natives `<select>` bemisst seine Breite an der LÄNGSTEN `<option>`, nicht
// am Container. Sobald eine Liga „Regionalliga West Herren 2025/26" heißt,
// wuchs das Feld über die Seitenspalte hinaus in den Feed. `flex-wrap` half
// nicht: Umbrechen kann nur zwischen Elementen, nicht innerhalb eines zu
// breiten. Und ohne `min-w-0` darf ein Flex-Element unter seine Inhaltsbreite
// gar nicht schrumpfen – das ist die Voreinstellung `min-width: auto`.
const selectClass =
  "w-full min-w-0 flex-1 truncate rounded-sm border border-navy-600 bg-navy-800 px-2 py-1 text-xs text-mist-300 outline-none focus:border-brand-500";

function rankColor(i) {
  if (i === 0) return "text-signal-wait";
  if (i === 1) return "text-mist-400";
  if (i === 2) return "text-brand-400";
  return "text-mist-400";
}

// ⚠️ `meinTeamId`/`meineLigaId` sind der Unterschied zwischen einer Rangliste
// und DEINER Rangliste (Befund Ronja, 15.08.2026): Das Widget stand auf „Alle
// Ligen" und markierte das eigene Team nicht – es wiederholte damit genau den
// Fehler, den `/topscorer` seit R5 nicht mehr macht. Wer seine eigene Liga
// sehen will, musste sie aus einer Liste heraussuchen, in der sie nicht
// hervorgehoben war.
export default function TopTeamsWidget({ nackt = false, meinTeamId, meineLigaId } = {}) {
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  // Eigene Liga vorwählen, wenn bekannt. Bewusst nur als ANFANGSWERT – wer
  // umstellt, bleibt umgestellt.
  const [leagueId, setLeagueId] = useState(meineLigaId ? String(meineLigaId) : "all");
  const [bundesland, setBundesland] = useState("all");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get("/api/teams/standings", {
          params: leagueId !== "all" ? { leagueId } : {},
        });
        if (!active) return;
        setStandings(data.standings || []);
        setLeagues(data.leagues || []);
      } catch {
        if (active) setStandings([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [leagueId]);

  // Im Datensatz vertretene Bundesländer (in kanonischer Reihenfolge).
  const availableBL = useMemo(() => {
    const present = new Set(standings.map((s) => s.bundesland).filter(Boolean));
    return BUNDESLAENDER.filter((b) => present.has(b));
  }, [standings]);

  const rows = useMemo(() => {
    if (bundesland === "all") return standings;
    return standings.filter((s) => s.bundesland === bundesland);
  }, [standings, bundesland]);

  return (
    <div className={nackt ? "" : "bg-navy-800 rounded-md border border-navy-600 p-4"}>
      {!nackt && (
        <h3 className="text-sm font-bold text-paper-50 flex items-center gap-2">
          <PiTrophyBold className="text-brand-400" /> Top-Teams
        </h3>
      )}

      {/* Filter */}
      {/* Kein `flex-wrap`: Die beiden Felder sollen sich die Breite TEILEN,
          nicht untereinander springen. Mit `flex-1 min-w-0` je Feld passt das
          in jede Spaltenbreite; steht nur ein Feld da (kein Bundesland in den
          Daten), nimmt es die volle Breite. */}
      <div className="mt-3 flex gap-2">
        <select
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          className={selectClass}
          aria-label="Liga"
        >
          <option value="all">Alle Ligen</option>
          {leagues.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
              {l.season ? ` ${l.season}` : ""}
            </option>
          ))}
        </select>
        {availableBL.length > 0 && (
          <select
            value={bundesland}
            onChange={(e) => setBundesland(e.target.value)}
            className={selectClass}
            aria-label="Bundesland"
          >
            <option value="all">Alle Länder</option>
            {availableBL.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Rangliste (gedeckelte Höhe + interner Scroll) */}
      <div className="mt-3 max-h-80 overflow-y-auto -mr-1 pr-1">
        {loading ? (
          <p className="text-xs text-mist-400 py-4">Lädt…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-mist-400 py-4">
            Noch keine Ergebnisse für diese Auswahl.
          </p>
        ) : (
          <ol className="space-y-1 pb-1">
            {rows.map((t, i) => {
              // Das eigene Team markieren – der zweite Teil von Ronjas Befund.
              // Bewusst über die Flächenstufe (`bg-navy-700`) und eine
              // 2px-Kante links, NICHT über eine zweite orange Fläche: Der
              // Akzent gehört auf dieser Seite der Anzeigetafel.
              const istMeins = meinTeamId && String(t.teamId) === String(meinTeamId);
              return (
              <li key={t.teamId}>
                <Link
                  href={`/team/team-detail/${t.slug}`}
                  aria-current={istMeins ? "true" : undefined}
                  className={`flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors ${
                    istMeins
                      ? "bg-navy-700 border-l-2 border-brand-500 pl-1.5"
                      : "hover:bg-navy-700"
                  }`}
                >
                  <span className={`w-4 text-center text-sm font-bold ${rankColor(i)}`}>
                    {i + 1}
                  </span>
                  <Avatar
                    name={t.teamName}
                    src={t.logo}
                    className="h-6 w-6"
                    textClass="text-[9px]"
                    square
                  />
                  <span
                    className={`flex-1 truncate text-sm ${
                      istMeins ? "font-semibold text-paper-50" : "text-paper-50"
                    }`}
                  >
                    {t.teamName}
                  </span>
                  <span className="text-xs font-medium text-mist-400 tabular-nums whitespace-nowrap">
                    {t.wins}-{t.losses}
                  </span>
                </Link>
              </li>
              );
            })}
          </ol>
        )}
      </div>

      {!loading && rows.length > 0 && (
        <Link
          href="/rangliste"
          className="mt-2 block text-center text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
        >
          Komplette Rangliste
        </Link>
      )}
    </div>
  );
}
