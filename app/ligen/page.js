"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaTrophy, FaSearch, FaFilter, FaTimes } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { getPlayerToken } from "@/lib/clientAuth";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  LEAGUE_GENDERS,
  LEAGUE_AGE_GROUPS,
  BASKETBALLKREISE_NRW_GRUPPIERT,
} from "@/lib/constants";

const NRW = "Nordrhein-Westfalen";
const AGE_ORDER = ["Senioren", "U18", "U16"];
const GENDER_ORDER = ["Herren", "Damen", "Mixed"];
const DISCOVER_LIMIT = 12;

// Staffelnummer robust aus dem Namen lesen (Datenmodell speichert sie noch nicht separat).
// Altersklassen-Token (U18/U16) vorher entfernen, damit "16"/"18" nicht als Staffel zählt.
function staffelNum(name) {
  const s = String(name || "").replace(/U\d+/gi, "");
  const m = s.match(/\d+/g);
  return m ? parseInt(m[m.length - 1], 10) : 0;
}
const idxOf = (arr, v) => {
  const i = arr.indexOf(v);
  return i < 0 ? 99 : i;
};

// Fachliche Standardsortierung (siehe league-catalog). myLeagueId zuerst.
function makeComparator(myLeagueId) {
  return (a, b) => {
    const own = (l) => (myLeagueId && String(l._id) === String(myLeagueId) ? 0 : 1);
    if (own(a) !== own(b)) return own(a) - own(b);
    const laufend = (l) => (l.active && !l.finished ? 0 : 1);
    if (laufend(a) !== laufend(b)) return laufend(a) - laufend(b);
    const hasTeams = (l) => ((l.teamCount || 0) > 0 ? 0 : 1);
    if (hasTeams(a) !== hasTeams(b)) return hasTeams(a) - hasTeams(b);
    if (idxOf(LEAGUE_LEVELS, a.level) !== idxOf(LEAGUE_LEVELS, b.level))
      return idxOf(LEAGUE_LEVELS, a.level) - idxOf(LEAGUE_LEVELS, b.level);
    if (idxOf(AGE_ORDER, a.ageGroup) !== idxOf(AGE_ORDER, b.ageGroup))
      return idxOf(AGE_ORDER, a.ageGroup) - idxOf(AGE_ORDER, b.ageGroup);
    if (idxOf(GENDER_ORDER, a.gender) !== idxOf(GENDER_ORDER, b.gender))
      return idxOf(GENDER_ORDER, a.gender) - idxOf(GENDER_ORDER, b.gender);
    if (staffelNum(a.name) !== staffelNum(b.name)) return staffelNum(a.name) - staffelNum(b.name);
    return String(a.name).localeCompare(String(b.name), "de");
  };
}

function LeagueCard({ l }) {
  const empty = (l.teamCount || 0) === 0;
  return (
    <Link
      href={`/ligen/${l._id}`}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-900">{l.name}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {l.isDemo && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 rounded-full px-2 py-0.5">
              Beispieldaten
            </span>
          )}
          {l.finished ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
              <FaTrophy className="text-[9px]" /> Abgeschlossen
            </span>
          ) : empty ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              In Vorbereitung
            </span>
          ) : null}
        </div>
      </div>
      {l.season && <p className="text-xs text-gray-500">{l.season}</p>}
      {(l.gender || l.ageGroup || l.region) && (
        <p className="mt-1 text-xs text-gray-500">
          {[l.gender, l.ageGroup, l.region].filter(Boolean).join(" · ")}
        </p>
      )}
      {l.finished && l.champion && (
        <p className="mt-1 text-xs font-medium text-amber-700 flex items-center gap-1">
          <FaTrophy className="text-[9px]" /> Meister: {l.champion.teamName}
        </p>
      )}
      <p className="mt-2 text-xs text-gray-400 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <FaUsers /> {l.teamCount} Teams
        </span>
        {l.bundesland && <span>· {l.bundesland}</span>}
      </p>
    </Link>
  );
}

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [season, setSeason] = useState("");
  const [land, setLand] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [level, setLevel] = useState("");
  const [kreis, setKreis] = useState("");
  const [search, setSearch] = useState("");
  const [browse, setBrowse] = useState(false); // explizit „Alle Ligen durchsuchen"
  const [showFilters, setShowFilters] = useState(false); // Mobile-Panel
  const [myTeamId, setMyTeamId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues", { params: season ? { season } : {} });
        if (active) {
          setLeagues(data.leagues || []);
          if (data.seasons) setSeasons(data.seasons);
        }
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [season]);

  // Eigene Team-ID (für „Deine Liga") – ohne Login-Redirect.
  useEffect(() => {
    const token = getPlayerToken();
    if (!token) return;
    let active = true;
    axios
      .post("/api/player/getmyinfo", { token })
      .then((r) => active && setMyTeamId(r.data?.player?.teamId || null))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const showKreisFilter = land === NRW && level === "Kreisliga";
  const kreiseMitLigen = useMemo(
    () =>
      new Set(
        leagues
          .filter((l) => l.level === "Kreisliga" && l.bundesland === NRW)
          .map((l) => l.region)
          .filter(Boolean)
      ),
    [leagues]
  );
  const laenderMitLigen = useMemo(
    () => new Set(leagues.map((l) => l.bundesland).filter(Boolean)),
    [leagues]
  );

  // Eigene Liga = aktive Liga, deren teams die eigene Team-ID enthält (nutzt Team.leagueId-
  // Beziehung indirekt; KEIN Liga-Follow-System).
  const myLeague = useMemo(() => {
    if (!myTeamId) return null;
    return leagues.find((l) => (l.teams || []).map(String).includes(String(myTeamId))) || null;
  }, [leagues, myTeamId]);

  const comparator = useMemo(() => makeComparator(myLeague?._id), [myLeague]);

  // Kreis zurücksetzen, sobald der Kreisfilter nicht mehr anwendbar ist.
  useEffect(() => {
    if (!showKreisFilter && kreis) setKreis("");
  }, [showKreisFilter, kreis]);

  const hasActiveFilter = !!(season || land || gender || ageGroup || level || kreis || search.trim());
  const browsing = browse || hasActiveFilter;

  // Durchsuchen-Ergebnisse (alle passenden, fachlich sortiert).
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leagues
      .filter((l) => {
        if (land && l.bundesland !== land) return false;
        if (gender && l.gender !== gender) return false;
        if (ageGroup && l.ageGroup !== ageGroup) return false;
        if (level && l.level !== level) return false;
        if (showKreisFilter && kreis && l.region !== kreis) return false;
        if (q) {
          const hay = `${l.name} ${l.region} ${l.bundesland}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(comparator);
  }, [leagues, land, gender, ageGroup, level, kreis, showKreisFilter, search, comparator]);

  // Geführte Startauswahl: aktive, laufende Ligen MIT Teams (keine leeren/abgeschlossenen),
  // ohne die eigene Liga (die steht separat oben), max. 12.
  const discover = useMemo(
    () =>
      leagues
        .filter((l) => l.active && !l.finished && (l.teamCount || 0) > 0)
        .filter((l) => !myLeague || String(l._id) !== String(myLeague._id))
        .sort(comparator)
        .slice(0, DISCOVER_LIMIT),
    [leagues, comparator, myLeague]
  );

  function applyQuick(next) {
    setSeason(next.season || "");
    setLand(next.land || "");
    setGender(next.gender || "");
    setAgeGroup(next.ageGroup || "");
    setLevel(next.level || "");
    setKreis(next.kreis || "");
    setSearch("");
    setBrowse(true);
    setShowFilters(false);
  }
  function resetAll() {
    setSeason("");
    setLand("");
    setGender("");
    setAgeGroup("");
    setLevel("");
    setKreis("");
    setSearch("");
    setBrowse(false);
    setShowFilters(false);
  }

  const QUICKS = [
    { label: "Senioren Herren", apply: { ageGroup: "Senioren", gender: "Herren" } },
    { label: "Senioren Damen", apply: { ageGroup: "Senioren", gender: "Damen" } },
    { label: "U18", apply: { ageGroup: "U18" } },
    { label: "U16", apply: { ageGroup: "U16" } },
    { label: "Kreisligen", apply: { level: "Kreisliga", land: NRW } },
    { label: "Alle Ligen durchsuchen", apply: {} },
  ];

  const selectCls =
    "rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400";
  const chipCls =
    "rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-brand-400 hover:text-brand-600 transition-colors";

  // Aktive Filter als Chips (Label + Reset einzeln).
  const activeChips = [
    season && { k: "season", label: `Saison ${season}`, clear: () => setSeason("") },
    land && { k: "land", label: land, clear: () => setLand("") },
    gender && { k: "gender", label: gender, clear: () => setGender("") },
    ageGroup && { k: "age", label: ageGroup, clear: () => setAgeGroup("") },
    level && { k: "level", label: level, clear: () => setLevel("") },
    kreis && { k: "kreis", label: kreis, clear: () => setKreis("") },
    search.trim() && { k: "search", label: `„${search.trim()}"`, clear: () => setSearch("") },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <PageHeader eyebrow="Wettbewerb" title="Ligen" subtitle="Tabellen und Wettbewerbe." />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {loading ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Ligen konnten nicht geladen werden." />
        ) : leagues.length === 0 ? (
          <EmptyState icon={FaTrophy} title="Noch keine Ligen vorhanden." />
        ) : (
          <>
            {/* Schnellzugriffe */}
            <div className="mb-6 flex flex-wrap gap-2">
              {QUICKS.map((q) => (
                <button key={q.label} type="button" onClick={() => applyQuick(q.apply)} className={chipCls}>
                  {q.label}
                </button>
              ))}
            </div>

            {!browsing ? (
              /* ── Geführte Startansicht ── */
              <div className="space-y-8">
                {myLeague && (
                  <section>
                    <h2 className="mb-3 text-sm font-bold text-gray-900">Deine Liga</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <LeagueCard l={myLeague} />
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="mb-3 text-sm font-bold text-gray-900">Aktive Ligen entdecken</h2>
                  {discover.length === 0 ? (
                    <EmptyState title="Aktuell keine laufenden Ligen mit Teams." text="Durchsuche den vollständigen Katalog." />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {discover.map((l) => (
                        <LeagueCard key={l._id} l={l} />
                      ))}
                    </div>
                  )}
                </section>

                <button
                  type="button"
                  onClick={() => setBrowse(true)}
                  className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Alle {leagues.length} Ligen durchsuchen
                </button>
              </div>
            ) : (
              /* ── Durchsuchen-Modus ── */
              <div>
                {/* Mobile: Filter-Toggle */}
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="sm:hidden mb-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                >
                  <FaFilter className="text-xs" /> Filter {showFilters ? "ausblenden" : "anzeigen"}
                </button>

                <div className={`${showFilters ? "grid" : "hidden"} sm:flex gap-3 mb-4 grid-cols-1`}>
                  {seasons.length > 0 && (
                    <select value={season} onChange={(e) => setSeason(e.target.value)} className={selectCls} aria-label="Saison">
                      <option value="">Aktive Ligen (aktuell)</option>
                      {seasons.map((s) => (
                        <option key={s} value={s}>
                          Saison {s}
                        </option>
                      ))}
                    </select>
                  )}
                  <select value={land} onChange={(e) => setLand(e.target.value)} className={selectCls} aria-label="Bundesland">
                    <option value="">Alle Bundesländer</option>
                    {BUNDESLAENDER.map((b) => {
                      const v = laenderMitLigen.has(b);
                      return (
                        <option key={b} value={b} disabled={!v}>
                          {v ? b : `${b} – folgt in Kürze`}
                        </option>
                      );
                    })}
                  </select>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls} aria-label="Geschlecht">
                    <option value="">Alle Geschlechter</option>
                    {LEAGUE_GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={selectCls} aria-label="Altersklasse">
                    <option value="">Alle Altersklassen</option>
                    {LEAGUE_AGE_GROUPS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls} aria-label="Spielklasse">
                    <option value="">Alle Spielklassen</option>
                    {LEAGUE_LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                  {showKreisFilter && (
                    <select value={kreis} onChange={(e) => setKreis(e.target.value)} className={selectCls} aria-label="Basketballkreis">
                      <option value="">Alle Basketballkreise</option>
                      {BASKETBALLKREISE_NRW_GRUPPIERT.map((g) => (
                        <optgroup key={g.bezirk} label={g.bezirk}>
                          {g.kreise.map((k) => {
                            const v = kreiseMitLigen.has(k);
                            return (
                              <option key={k} value={k} disabled={!v}>
                                {v ? k : `${k} – folgt`}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                    </select>
                  )}
                  <div className="relative flex-1 min-w-[10rem]">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Liga, Ort oder Kreis suchen…"
                      className={`${selectCls} w-full pl-8`}
                      aria-label="Suche"
                    />
                  </div>
                </div>

                {/* Aktive Filter-Chips + Zähler + Zurücksetzen */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {results.length} {results.length === 1 ? "Liga" : "Ligen"}
                  </span>
                  {activeChips.map((c) => (
                    <button
                      key={c.k}
                      type="button"
                      onClick={c.clear}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 hover:bg-brand-100"
                    >
                      {c.label} <FaTimes className="text-[9px]" />
                    </button>
                  ))}
                  <button type="button" onClick={resetAll} className="text-xs font-medium text-gray-500 hover:text-brand-600 underline">
                    Filter zurücksetzen
                  </button>
                </div>

                {results.length === 0 ? (
                  <EmptyState
                    title={
                      showKreisFilter && kreis
                        ? "Für diesen Basketballkreis wurden aktuell keine passenden Kreisligen gefunden."
                        : "Für diese Auswahl wurden keine Ligen gefunden."
                    }
                    text="Passe einen Filter an oder setze die Filter zurück."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {results.map((l) => (
                      <LeagueCard key={l._id} l={l} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
