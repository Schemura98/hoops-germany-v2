"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiUsersBold,
  PiInstagramLogoBold,
  PiArrowSquareOutBold,
  PiBasketballBold,
  PiChartBarBold,
  PiIdentificationCardBold,
  PiNewspaperClippingBold,
  PiCaretDownBold,
  PiCalendarBlankBold,
  PiCaretRightBold,
  PiMapPinBold,
} from "react-icons/pi";
import PlayerPosts from "@/components/posts/PlayerPosts";
import Avatar from "@/components/Avatar";
import ScrollHintRow from "@/components/ScrollHintRow";
import Tabs from "@/components/ui/Tabs";
import CountUp from "@/components/ui/CountUp";
import { ageFromBirthdate, formatBirthdate } from "@/lib/age";
import { positionLabel } from "@/lib/constants";

const round1 = (n) => Math.round(n * 10) / 10;

function gameDate(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// Wochentag und Datum getrennt geholt und ohne Komma zusammengesetzt:
// `toLocaleDateString` mit `weekday` liefert im Deutschen „So., 16.08.2026" –
// das Komma kollidiert in der Zeile mit den Mittelpunkt-Trennern.
function spielDatum(d) {
  try {
    const dt = new Date(d);
    const wochentag = dt.toLocaleDateString("de-DE", { weekday: "short" });
    const datum = dt.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${wochentag} ${datum}`;
  } catch {
    return "";
  }
}

function spielZeit(d) {
  try {
    return new Date(d).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// Abstand in KALENDERTAGEN, nicht in 24-Stunden-Blöcken. „Morgen 9 Uhr" ist
// morgen, auch wenn es nur 15 Stunden hin sind – und ein Spiel heute Abend ist
// heute, nicht „in 0 Tagen". Ab einer Woche sagt das Datum selbst genug.
function wannText(d) {
  try {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const ziel = new Date(d);
    ziel.setHours(0, 0, 0, 0);
    const tage = Math.round((ziel - heute) / 86400000);
    if (tage <= 0) return "heute";
    if (tage === 1) return "morgen";
    if (tage < 7) return `in ${tage} Tagen`;
    return null;
  } catch {
    return null;
  }
}

// Der einzige zeitkritische Punkt auf einem Spielerprofil: die nächste
// angesetzte Partie seines Vereins. Deshalb bekommt genau diese Karte die
// 2px-Anzeigetafel-Leiste (Signatur-Element, „aktives Spiel" –
// docs/VISUELLE-RICHTUNG-2026-08-12.md); sonst hebt auf dieser Seite nichts ab.
//
// Bewusst zurückhaltend formuliert: Angesetzt ist die Partie des VEREINS.
// Ob dieser Spieler aufläuft, weiß niemand – „sein nächstes Spiel" wäre eine
// Behauptung, die die Daten nicht decken (Muster: docs/MUSTER-ZAHLEN-DIE-LUEGEN).
//
// Gibt es keine Ansetzung, rendert die Karte gar nichts. Ein leerer Kasten
// „Kein nächstes Spiel" wäre eine Zeile, die niemandem etwas gibt.
function NextMatchCard({ match, teamId }) {
  if (!match?._id) return null;

  const heim = String(match.teamA?._id || "") === String(teamId || "");
  const gegner = heim ? match.teamB : match.teamA;
  const wann = wannText(match.date);
  const kontext =
    match.stage === "Playoffs"
      ? match.playoffRound || "Playoffs"
      : match.leagueId?.name || "";

  return (
    <div className="overflow-hidden rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800">
      <div className="flex items-center justify-between gap-3 bg-navy-900 px-5 py-3">
        <h2 className="flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wide text-paper-50">
          <PiCalendarBlankBold className="text-sm text-brand-400" /> Nächstes Spiel
        </h2>
        {kontext && (
          <span className="min-w-0 truncate text-xs text-mist-400">{kontext}</span>
        )}
      </div>

      <Link
        href={`/match/${match._id}`}
        className="block px-5 py-4 transition-colors duration-150 hover:bg-navy-700"
      >
        <p className="font-mono text-xs uppercase tracking-wide tabular-nums text-mist-300">
          {spielDatum(match.date)} · {spielZeit(match.date)} Uhr
          {wann && <span className="text-brand-400"> · {wann}</span>}
        </p>

        <div className="mt-2.5 flex items-center gap-3">
          <Avatar
            name={gegner?.teamName}
            src={gegner?.logo}
            className="h-11 w-11 flex-shrink-0"
            textClass="text-sm"
            square
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-600">
              {heim ? "Heimspiel gegen" : "Auswärts bei"}
            </p>
            <p className="truncate font-display text-xl font-bold uppercase tracking-tight text-paper-50">
              {gegner?.teamName || "Unbekannt"}
            </p>
          </div>
          <PiCaretRightBold className="shrink-0 text-xs text-mist-600" />
        </div>

        {match.location && (
          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-mist-400">
            <PiMapPinBold className="shrink-0 text-mist-600" /> {match.location}
          </p>
        )}
      </Link>
    </div>
  );
}

function StatCell({ label, value, sub, small }) {
  return (
    <div className="px-4 py-3 text-center min-w-[84px]">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">{label}</p>
      <p
        className={`${
          small ? "text-sm" : "text-lg"
        } font-bold text-paper-50 leading-tight mt-0.5 break-words hyphens-auto`}
      >
        {value ?? "–"}
      </p>
      {sub && <p className="text-[10px] text-mist-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-navy-600 last:border-0">
      <span className="text-sm text-mist-400">{label}</span>
      <span className="text-sm font-medium text-paper-50 text-right">{value}</span>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <div className="bg-navy-900 px-5 py-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-paper-50 uppercase tracking-wide flex items-center gap-2">
          <PiBasketballBold className="text-brand-400 text-sm" /> {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const TABS = [
  { key: "stats", label: "Stats", icon: PiChartBarBold },
  { key: "steckbrief", label: "Steckbrief", icon: PiIdentificationCardBold },
  { key: "beitraege", label: "Beiträge", icon: PiNewspaperClippingBold },
];

export default function PlayerProfileView({ player, viewerId, actions }) {
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [nextMatchTeamId, setNextMatchTeamId] = useState(null);
  const [tab, setTab] = useState("stats");
  const [season, setSeason] = useState(""); // "" = alle
  const [openStation, setOpenStation] = useState(null); // key der ausgeklappten Station
  const [stationGames, setStationGames] = useState({}); // key -> Spiele[]
  const [loadingGames, setLoadingGames] = useState(false);

  const fullName = `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
  const rawTeam = player?.team || player?.teamId;
  const team = rawTeam && typeof rawTeam === "object" ? rawTeam : null;
  const ig = player?.instagram ? player.instagram.replace(/^@/, "") : null;

  useEffect(() => {
    if (!player?._id) return;
    let active = true;
    (async () => {
      try {
        const [s, st] = await Promise.all([
          axios.post("/api/player/careerstats", { playerId: player._id }),
          axios.post("/api/player/stations", { playerId: player._id }),
        ]);
        if (!active) return;
        setStats(s.data.stats);
        setStations(st.data.stations || []);
      } catch {
        /* ignorieren */
      }
    })();
    return () => {
      active = false;
    };
  }, [player?._id]);

  // Bewusst ein eigener Aufruf und nicht im Promise.all oben: Fällt die
  // Ansetzung aus, sollen die Karriere-Zahlen trotzdem erscheinen (und
  // umgekehrt). Ein gemeinsames Promise.all würde beim ersten Fehler beides
  // verschlucken.
  useEffect(() => {
    if (!player?._id) return;
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/next-match", {
          playerId: player._id,
        });
        if (!active) return;
        setNextMatch(data.nextMatch || null);
        setNextMatchTeamId(data.teamId || null);
      } catch {
        /* ohne Ansetzung bleibt die Karte einfach weg */
      }
    })();
    return () => {
      active = false;
    };
  }, [player?._id]);

  // Verfügbare Saisons (für den Filter)
  const seasons = useMemo(() => {
    const set = new Set(stations.map((s) => s.season).filter(Boolean));
    return [...set].sort().reverse();
  }, [stations]);

  const filteredStations = useMemo(
    () => (season ? stations.filter((s) => s.season === season) : stations),
    [stations, season]
  );

  // Bilanz aus den (gefilterten) Stationen aufsummieren
  const bilanz = useMemo(() => {
    const t = filteredStations.reduce(
      (a, s) => ({
        games: a.games + s.games,
        points: a.points + s.points,
        assists: a.assists + s.assists,
        rebounds: a.rebounds + s.rebounds,
      }),
      { games: 0, points: 0, assists: 0, rebounds: 0 }
    );
    const g = t.games || 0;
    return {
      ...t,
      ppg: g ? round1(t.points / g) : 0,
      apg: g ? round1(t.assists / g) : 0,
      rpg: g ? round1(t.rebounds / g) : 0,
    };
  }, [filteredStations]);

  // Karriere-Verlauf: Vereins-Stationen in chronologischer Reihenfolge (alt → neu).
  // Aufeinanderfolgende Stationen desselben Vereins werden zu einer „Stint" gebündelt;
  // die Saisons werden gesammelt und als Einzelsaison oder Bereich angezeigt.
  const teamHistory = useMemo(() => {
    const asc = [...stations].sort(
      (a, b) => new Date(a.lastDate || 0) - new Date(b.lastDate || 0)
    );
    const hist = [];
    for (const s of asc) {
      const last = hist[hist.length - 1];
      if (!last || last.teamName !== s.teamName) {
        hist.push({
          teamName: s.teamName,
          teamLogo: s.teamLogo,
          teamSlug: s.teamSlug,
          seasons: s.season ? [s.season] : [],
        });
      } else if (s.season && !last.seasons.includes(s.season)) {
        last.seasons.push(s.season);
      }
    }
    for (const h of hist) {
      h.seasons.sort();
      h.season =
        h.seasons.length === 0
          ? ""
          : h.seasons.length === 1
          ? h.seasons[0]
          : `${h.seasons[0]} – ${h.seasons[h.seasons.length - 1]}`;
    }
    return hist;
  }, [stations]);

  const stationKey = (s) => `${s.teamId || "x"}-${s.leagueId || "friendly"}`;

  async function toggleStation(s) {
    const key = stationKey(s);
    if (openStation === key) {
      setOpenStation(null);
      return;
    }
    setOpenStation(key);
    if (!stationGames[key]) {
      setLoadingGames(true);
      try {
        const { data } = await axios.post("/api/player/station-matches", {
          playerId: player._id,
          teamId: s.teamId,
          leagueId: s.leagueId,
        });
        setStationGames((m) => ({ ...m, [key]: data.games || [] }));
      } catch {
        setStationGames((m) => ({ ...m, [key]: [] }));
      } finally {
        setLoadingGames(false);
      }
    }
  }

  return (
    <div>
      {/* Navy-Hero mit Stats-Leiste */}
      <div className="bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <Avatar
              name={fullName}
              src={player?.profileImage}
              className="h-28 w-28"
              textClass="text-3xl"
              ring="ring-4 ring-paper-50/10"
            />
            <div className="min-w-0 flex-1">
              <p className="text-brand-400 text-sm font-semibold flex items-center justify-center sm:justify-start gap-2">
                {team?.slug ? (
                  <Link href={`/team/team-detail/${team.slug}`} className="hover:underline">
                    {team.teamName}
                  </Link>
                ) : (
                  team?.teamName || "Vereinslos"
                )}
                {player?.position && <span className="text-mist-400">| {positionLabel(player.position)}</span>}
                {player?.number && <span className="text-mist-400">· #{player.number}</span>}
              </p>
              <h1 className="font-display uppercase tracking-tight text-3xl sm:text-4xl font-black text-paper-50 leading-tight">{fullName}</h1>
              <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-4 text-sm text-mist-300">
                <span>
                  <strong className="text-paper-50">{player?.followersCount ?? 0}</strong> Follower
                </span>
                <span>
                  <strong className="text-paper-50">{player?.followingCount ?? 0}</strong> Folgt
                </span>
                {player?.transferStatus === "verfuegbar" && (
                  <span className="text-xs font-semibold bg-signal-ok/20 text-signal-ok rounded-sm px-3 py-1">
                    Transferbereit
                  </span>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex flex-wrap items-center justify-center gap-3 sm:ml-auto sm:pb-1">
                {actions}
              </div>
            )}
          </div>

          {/* Stats-Leiste (horizontal scrollbar mit Scroll-Hinweis) */}
          <ScrollHintRow className="mt-6">
            <div className="inline-flex min-w-full rounded-t-md bg-navy-800/5 divide-x divide-paper-50/10 border border-navy-600/10 border-b-0">
              <div className="px-4 py-3 flex flex-col items-center justify-center min-w-[110px]">
                {team?.slug ? (
                  <Link href={`/team/team-detail/${team.slug}`} className="flex flex-col items-center group">
                    <Avatar name={team?.teamName} src={team?.logo} className="h-9 w-9" textClass="text-xs" square />
                    <span className="text-[10px] text-mist-300 mt-1 truncate max-w-[96px] group-hover:text-paper-50">
                      {team?.teamName || "—"}
                    </span>
                  </Link>
                ) : (
                  <>
                    <Avatar name={team?.teamName} src={team?.logo} className="h-9 w-9" textClass="text-xs" square />
                    <span className="text-[10px] text-mist-300 mt-1 truncate max-w-[96px]">
                      {team?.teamName || "—"}
                    </span>
                  </>
                )}
              </div>
              <StatCell label="PPG" value={stats ? stats.ppg.toFixed(1) : "–"} />
              <StatCell label="APG" value={stats ? stats.apg.toFixed(1) : "–"} />
              <StatCell label="RPG" value={stats ? stats.rpg.toFixed(1) : "–"} />
              <div className="grid grid-cols-1 divide-y divide-paper-50/10 min-w-[120px]">
                <StatCell label="Größe" value={player?.height} small />
                <StatCell label="Alter" value={ageFromBirthdate(player?.birthdate) ?? player?.age} small />
              </div>
              <div className="grid grid-cols-1 divide-y divide-paper-50/10 min-w-[120px]">
                <StatCell label="Gewicht" value={player?.weight} small />
                <StatCell label="Heimatort" value={player?.hometown} small />
              </div>
              <div className="grid grid-cols-1 divide-y divide-paper-50/10 min-w-[110px]">
                <StatCell label="Nationalität" value={player?.nationality} small />
                <StatCell label="Bundesland" value={player?.bundesland} small />
              </div>
              {player?.fibaLink && (
                <a
                  href={player.fibaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 flex flex-col items-center justify-center min-w-[80px] hover:bg-navy-700/5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-mist-400">FIBA</span>
                  <span className="text-brand-400 text-sm font-semibold mt-1 inline-flex items-center gap-1">
                    Link <PiArrowSquareOutBold className="text-[10px]" />
                  </span>
                </a>
              )}
              {ig && (
                <a
                  href={`https://instagram.com/${ig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 flex flex-col items-center justify-center min-w-[80px] hover:bg-navy-700/5"
                >
                  <PiInstagramLogoBold className="text-paper-50 text-lg" />
                  <span className="text-[10px] text-mist-300 mt-1">Instagram</span>
                </a>
              )}
            </div>
          </ScrollHintRow>
        </div>

        {/* Tabs */}
        <div className="bg-navy-800 border-b border-navy-600">
          <div className="max-w-4xl mx-auto px-4 py-3 overflow-x-auto">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={TABS.map(({ key, label, icon: Icon }) => ({
                key,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="text-xs" /> {label}
                  </span>
                ),
              }))}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {tab === "stats" && (
          <>
            <NextMatchCard match={nextMatch} teamId={nextMatchTeamId} />

            <SectionCard
              title="Karriere-Bilanz"
              action={
                seasons.length > 0 && (
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="text-xs bg-navy-800/10 text-paper-50 rounded-sm px-2 py-1 outline-none border border-navy-600/10"
                  >
                    <option className="text-paper-50" value="">
                      Alle Saisons
                    </option>
                    {seasons.map((s) => (
                      <option className="text-paper-50" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )
              }
            >
              {bilanz.games === 0 ? (
                // Die Herkunftsangabe gehoert AUCH hierher, nicht nur zu
                // gefuellten Zahlen: Wer noch nichts hat, ist genau der, der
                // wissen muss, wofuer sich das Eintragen lohnt. Sie stand
                // zuerst nur im gefuellten Zweig - auf der Live-Seite war sie
                // dadurch fuer ein frisches Konto unsichtbar (nachgemessen,
                // nicht vermutet: tmp/profil-live-check.mjs).
                <>
                  <p className="text-sm text-mist-400">
                    {season ? "Keine Spiele in dieser Saison." : "Noch keine Spiele erfasst."}
                  </p>
                  <p className="mt-2 text-xs text-mist-400">
                    Zählt, sobald das Spiel als beendet eingetragen ist. Ob beide
                    Teams das Ergebnis unabhängig gemeldet haben, steht am
                    jeweiligen Spiel.
                  </p>
                </>
              ) : (
                <>
                  {/* Karriere-Summen als Anzeigetafel statt als Fließtext-Zeile:
                      Das sind die Zahlen, für die ein Spieler wiederkommt
                      (Bedarf 1 der Bedarfsanalyse, von Ronja am gebauten Produkt
                      bestätigt). Sie zählen hoch, sobald sie ins Bild kommen –
                      und zwar mit echten Werten, nicht mit Platzhaltern. */}
                  {/* Woher die Zahlen kommen. Bewusst als SYSTEMREGEL formuliert
                      und nicht als Guetesiegel fuer die konkret angezeigten
                      Werte: `careerstats` filtert auf `status: "completed"` und
                      prueft NICHT auf beidseitiges `submittedBy` – ein vom
                      Admin aufgeloestes Ergebnis zaehlt also mit. "Jede Zahl
                      hier ist von beiden Teams bestaetigt" waere damit
                      schlicht falsch (Befund Nele, 12.08.2026).
                      Die Zahlen bleiben absichtlich vollstaendig: Ein Spiel,
                      dessen Ergebnis nach einem Streitfall ein Admin eintraegt,
                      hat trotzdem stattgefunden – dem Spieler dafuer Statistik
                      wegzunehmen waere die schlechtere Loesung. */}
                  <p className="mb-4 text-xs text-mist-400">
                    Zählt, sobald das Spiel als beendet eingetragen ist. Ob beide
                    Teams das Ergebnis unabhängig gemeldet haben, steht am
                    jeweiligen Spiel.
                  </p>
                  <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { v: bilanz.games, l: "Spiele" },
                      { v: bilanz.points, l: "Punkte" },
                      { v: bilanz.assists, l: "Assists" },
                      { v: bilanz.rebounds, l: "Rebounds" },
                    ].map((x) => (
                      <div key={x.l} className="border-b-2 border-navy-600 pb-1.5">
                        <p className="font-mono text-2xl font-bold tabular-nums text-paper-50">
                          <CountUp value={x.v} />
                        </p>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-mist-600">
                          {x.l}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: bilanz.ppg, l: "PPG", s: "Punkte/Spiel" },
                      { v: bilanz.apg, l: "APG", s: "Assists/Spiel" },
                      { v: bilanz.rpg, l: "RPG", s: "Rebounds/Spiel" },
                    ].map((x) => (
                      <div key={x.l} className="bg-navy-950 rounded-md py-4 text-center">
                        <p className="font-mono text-3xl font-bold tabular-nums text-paper-50">
                          <CountUp value={x.v} decimals={1} />
                        </p>
                        <p className="text-xs font-bold text-brand-400 mt-1">{x.l}</p>
                        <p className="text-[11px] text-mist-400">{x.s}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>

            <SectionCard title="Spielerhistorie">
              {filteredStations.length === 0 ? (
                <p className="text-sm text-mist-400">Noch keine Spiele erfasst.</p>
              ) : (
                <div className="overflow-x-auto">
                  <p className="text-xs text-mist-400 mb-2">
                    Tippe auf eine Station, um die einzelnen Spiele zu sehen.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-mist-400 text-left">
                        <th className="font-medium py-2">Team / Liga</th>
                        <th className="font-medium py-2 text-center w-12">Sp.</th>
                        <th className="font-medium py-2 text-center w-16">PTS</th>
                        <th className="font-medium py-2 text-center w-16">AST</th>
                        <th className="font-medium py-2 text-center w-16">REB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStations.map((s, i) => {
                        const key = stationKey(s);
                        const isOpen = openStation === key;
                        const games = stationGames[key];
                        return (
                          <Fragment key={i}>
                            <tr
                              onClick={() => toggleStation(s)}
                              className={`border-t border-navy-600 cursor-pointer transition-colors ${
                                isOpen ? "bg-navy-950" : "hover:bg-navy-700"
                              }`}
                            >
                              <td className="py-2.5">
                                <div className="flex items-center gap-2.5">
                                  <PiCaretDownBold
                                    className={`text-navy-500 text-xs flex-shrink-0 transition-transform ${
                                      isOpen ? "rotate-180" : ""
                                    }`}
                                  />
                                  <Avatar name={s.teamName} src={s.teamLogo} className="h-7 w-7" textClass="text-[10px]" square />
                                  <div className="min-w-0">
                                    {s.teamSlug ? (
                                      <Link
                                        href={`/team/team-detail/${s.teamSlug}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="font-semibold text-paper-50 hover:text-brand-400"
                                      >
                                        {s.teamName}
                                      </Link>
                                    ) : (
                                      <span className="font-semibold text-paper-50">{s.teamName}</span>
                                    )}
                                    {/* „Da habe ich gespielt" führt jetzt auch
                                        zur Tabelle dieser Saison. Die Zeile war
                                        reiner Text – die Station verlinkte nur
                                        den Verein, nie den Wettbewerb.
                                        Freundschaftsspiele haben keine Liga und
                                        bleiben deshalb Text. */}
                                    <p className="text-xs text-mist-400">
                                      {s.leagueLinkId && s.leagueName ? (
                                        <Link
                                          href={`/ligen/${s.leagueLinkId}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-block py-0.5 underline decoration-navy-500 underline-offset-2 hover:text-brand-400 hover:decoration-brand-500"
                                        >
                                          {s.leagueName}
                                          {/* Geschuetzte Leerzeichen: Bricht die
                                              Zeile auf 390px um, soll „· 2025/26"
                                              beim Ligennamen bleiben statt der
                                              Trenner am Zeilenende zu hängen. */}
                                          {s.season ? ` · ${s.season}` : ""}
                                        </Link>
                                      ) : (
                                        <>
                                          {s.leagueName || (s.games === 0 ? "Noch kein Spiel" : "")}
                                          {s.season ? ` · ${s.season}` : ""}
                                        </>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="font-mono tabular-nums py-2.5 text-center font-medium text-paper-50">{s.games}</td>
                              <td className="font-mono tabular-nums py-2.5 text-center">
                                <span className="font-semibold text-paper-50">{s.points}</span>
                                <span className="block text-[10px] text-mist-400">{s.ppg.toFixed(1)}ø</span>
                              </td>
                              <td className="font-mono tabular-nums py-2.5 text-center">
                                <span className="font-semibold text-paper-50">{s.assists}</span>
                                <span className="block text-[10px] text-mist-400">{s.apg.toFixed(1)}ø</span>
                              </td>
                              <td className="font-mono tabular-nums py-2.5 text-center">
                                <span className="font-semibold text-paper-50">{s.rebounds}</span>
                                <span className="block text-[10px] text-mist-400">{s.rpg.toFixed(1)}ø</span>
                              </td>
                            </tr>

                            {isOpen && (
                              <tr className="bg-navy-950/60">
                                <td colSpan={5} className="px-1 pb-3 pt-0">
                                  {!games ? (
                                    <div className="flex justify-center py-4">
                                      <PiBasketballBold className="text-brand-400 animate-bounce" />
                                    </div>
                                  ) : games.length === 0 ? (
                                    <p className="text-xs text-mist-400 py-3 px-2">
                                      Keine Einzelspiele gefunden.
                                    </p>
                                  ) : (
                                    <>
                                      <p className="px-2 pt-1 pb-1.5 text-[11px] text-mist-400">
                                        Endstand · deine Werte als{" "}
                                        <span className="font-medium text-mist-400">PKT·AST·REB</span>
                                      </p>
                                      <div className="space-y-0.5">
                                        {games.map((g) => (
                                          <Link
                                            key={g.matchId}
                                            href={`/match/${g.matchId}`}
                                            className="flex items-center gap-2.5 rounded-sm px-2 py-2 hover:bg-navy-700 transition-colors"
                                          >
                                            <span
                                              className={`w-5 shrink-0 text-center text-xs font-extrabold ${
                                                g.result === "W"
                                                  ? "text-signal-ok"
                                                  : g.result === "L"
                                                  ? "text-signal-error"
                                                  : "text-mist-400"
                                              }`}
                                            >
                                              {g.result || "–"}
                                            </span>
                                            <Avatar
                                              name={g.opponent?.teamName}
                                              src={g.opponent?.logo}
                                              className="h-7 w-7"
                                              textClass="text-[9px]"
                                              square
                                            />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium text-paper-50 truncate">
                                                {g.opponent?.teamName || "Unbekannt"}
                                              </p>
                                              <p className="text-[11px] text-mist-400">{gameDate(g.date)}</p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-paper-50 tabular-nums">
                                              {g.own ?? "–"}
                                              <span className="mx-0.5 text-navy-500">:</span>
                                              {g.opp ?? "–"}
                                            </span>
                                            <span className="shrink-0 w-16 text-right text-[11px] tabular-nums">
                                              {g.didNotPlay ? (
                                                <span className="italic text-mist-400">DNP</span>
                                              ) : (
                                                <span className="text-mist-400">
                                                  {g.points}·{g.assists}·{g.rebounds}
                                                </span>
                                              )}
                                            </span>
                                          </Link>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}

        {tab === "steckbrief" && (
          <>
            {player?.aboutPlayer && (
              <SectionCard title="Über">
                <p className="text-sm text-mist-400 whitespace-pre-line">{player.aboutPlayer}</p>
              </SectionCard>
            )}
            <SectionCard title="Steckbrief">
              <InfoRow label="Größe" value={player?.height} />
              <InfoRow label="Gewicht" value={player?.weight} />
              <InfoRow label="Alter" value={ageFromBirthdate(player?.birthdate) ?? player?.age} />
              <InfoRow label="Geburtsdatum" value={formatBirthdate(player?.birthdate)} />
              <InfoRow label="Position / Rolle" value={positionLabel(player?.position)} />
              <InfoRow label="Rückennummer" value={player?.number ? `#${player.number}` : ""} />
              <InfoRow label="Nationalität" value={player?.nationality} />
              <InfoRow label="Heimatort" value={player?.hometown} />
              <InfoRow label="Bundesland" value={player?.bundesland} />
              <InfoRow label="Bevorzugte Liga" value={player?.preferredLeague} />
            </SectionCard>

            {/* Karriere-Verlauf / Transfers – vertikale Timeline (neuester Verein oben) */}
            {teamHistory.length > 0 && (
              <SectionCard title="Karriere-Verlauf">
                <div className="space-y-2">
                  {[...teamHistory].reverse().map((h, i) => {
                    const isCurrent = i === 0 && teamHistory.length > 1;
                    const inner = (
                      <div className="flex items-center gap-3 rounded-md border border-navy-600 p-3 hover:bg-navy-700 transition-colors">
                        <Avatar
                          name={h.teamName}
                          src={h.teamLogo}
                          className="h-11 w-11 flex-shrink-0"
                          textClass="text-sm"
                          square
                        />
                        <p className="flex-1 min-w-0 font-semibold text-paper-50 truncate">
                          {h.teamName}
                        </p>
                        {isCurrent && (
                          <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand-400 bg-brand-500/10 rounded-sm px-2 py-0.5">
                            Aktuell
                          </span>
                        )}
                        {h.season && (
                          <span className="flex-shrink-0 text-sm text-mist-400 whitespace-nowrap">
                            {h.season}
                          </span>
                        )}
                      </div>
                    );
                    return h.teamSlug ? (
                      <Link key={i} href={`/team/team-detail/${h.teamSlug}`} className="block">
                        {inner}
                      </Link>
                    ) : (
                      <div key={i}>{inner}</div>
                    );
                  })}
                </div>
                {teamHistory.length === 1 && (
                  <p className="mt-3 text-xs text-mist-400">Noch kein Vereinswechsel.</p>
                )}
              </SectionCard>
            )}
          </>
        )}

        {tab === "beitraege" && <PlayerPosts playerId={player?._id} currentPlayerId={viewerId} />}
      </div>
    </div>
  );
}
