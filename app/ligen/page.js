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
import { LEAGUE_LEVELS, BASKETBALLKREISE_NRW, BUNDESLAENDER } from "@/lib/constants";

const NRW = "Nordrhein-Westfalen";
const DISCOVER_MAX = 12;

// Bereichsgruppen (gegenseitig ausschließend). Reihenfolge = Sortier-/Anzeigereihenfolge.
const GROUPS = [
  { key: "sh", label: "Senioren Herren", cap: 3 },
  { key: "sd", label: "Senioren Damen", cap: 2 },
  { key: "u18", label: "U18", cap: 2 },
  { key: "u16", label: "U16", cap: 2 },
  { key: "kreis", label: "Kreisligen", cap: 3 },
];
function groupKey(l) {
  if (l.level === "Kreisliga") return "kreis";
  if (l.ageGroup === "U18") return "u18";
  if (l.ageGroup === "U16") return "u16";
  if (l.ageGroup === "Senioren" && l.gender === "Damen") return "sd";
  return "sh";
}
const groupOrder = (l) => GROUPS.findIndex((g) => g.key === groupKey(l));

const isYouthAge = (a) => a === "U18" || a === "U16";
// Anzeige-Mapping (Datenwerte bleiben Herren/Damen/Mixed).
function genderLabel(l) {
  if (isYouthAge(l.ageGroup)) {
    return l.gender === "Damen" ? "weiblich" : l.gender === "Mixed" ? "offen" : "männlich";
  }
  return l.gender || "";
}

// Staffelnummer robust aus dem Namen (Altersklassen-Token vorher entfernen → "U16" ≠ Staffel).
function staffelNum(name) {
  const s = String(name || "").replace(/U\d+/gi, "");
  const m = s.match(/\d+/g);
  return m ? parseInt(m[m.length - 1], 10) : 0;
}
const levelIdx = (l) => {
  const i = LEAGUE_LEVELS.indexOf(l);
  return i < 0 ? 99 : i;
};

// Sortierung innerhalb einer Bereichsgruppe.
function withinGroup(a, b) {
  const laufend = (l) => (l.active && !l.finished ? 0 : 1);
  if (laufend(a) !== laufend(b)) return laufend(a) - laufend(b);
  const hasTeams = (l) => ((l.teamCount || 0) > 0 ? 0 : 1);
  if (hasTeams(a) !== hasTeams(b)) return hasTeams(a) - hasTeams(b);
  if (levelIdx(a.level) !== levelIdx(b.level)) return levelIdx(a.level) - levelIdx(b.level);
  const ra = a.region || "", rb = b.region || "";
  if (ra !== rb) return ra.localeCompare(rb, "de");
  if (staffelNum(a.name) !== staffelNum(b.name)) return staffelNum(a.name) - staffelNum(b.name);
  return String(a.name).localeCompare(String(b.name), "de");
}
// Vollständige Sortierung (Gruppe zuerst, dann innerhalb).
function fullCmp(a, b) {
  if (groupOrder(a) !== groupOrder(b)) return groupOrder(a) - groupOrder(b);
  return withinGroup(a, b);
}

function LeagueCard({ l }) {
  const empty = (l.teamCount || 0) === 0;
  const line2 = [genderLabel(l), l.ageGroup && l.ageGroup !== "Senioren" ? l.ageGroup : null, l.region]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/ligen/${l._id}`}
      className="block min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-900 break-words min-w-0">{l.name}</p>
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
      {line2 && <p className="mt-1 text-xs text-gray-500 break-words">{line2}</p>}
      <p className="mt-1 text-xs text-gray-400">
        {l.season ? `Saison ${l.season} · ` : ""}
        {l.teamCount} {l.teamCount === 1 ? "Team" : "Teams"}
      </p>
      {l.finished && l.champion && (
        <p className="mt-1 text-xs font-medium text-amber-700 flex items-center gap-1">
          <FaTrophy className="text-[9px]" /> Meister: {l.champion.teamName}
        </p>
      )}
    </Link>
  );
}

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [status, setStatus] = useState("aktiv"); // aktiv | alle | abgeschlossen | vorbereitung
  const [land, setLand] = useState(""); // Bundesland (nur relevant, sobald ≥2 Länder Ligen haben)
  const [bereich, setBereich] = useState(""); // "" | Senioren | U18 | U16
  const [kategorie, setKategorie] = useState(""); // "" | Herren | Damen | Mixed
  const [level, setLevel] = useState("");
  const [kreis, setKreis] = useState("");
  const [search, setSearch] = useState("");
  const [browse, setBrowse] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [myTeamId, setMyTeamId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues", { params: { scope: "all" } });
        if (active) setLeagues(data.leagues || []);
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

  // „Deine Liga": Team-Mitgliedschaft in League.teams (Quelle, s. Doku). Team.leagueId ist
  // der kanonische Zeiger; da ein Team in mehreren (auch archivierten) Saison-Ligen als
  // teams-Mitglied stehen kann, bevorzugen wir die aktive, laufende Liga.
  const myLeague = useMemo(() => {
    if (!myTeamId) return null;
    const mine = leagues.filter((l) => (l.teams || []).map(String).includes(String(myTeamId)));
    mine.sort((a, b) => (a.active && !a.finished ? 0 : 1) - (b.active && !b.finished ? 0 : 1));
    return mine[0] || null;
  }, [leagues, myTeamId]);

  // Bundesland-Dropdown erst wieder anbieten, wenn ≥2 Länder Ligen haben (aktuell nur NRW).
  const laenderMitLigen = useMemo(
    () => new Set(leagues.map((l) => l.bundesland).filter(Boolean)),
    [leagues]
  );
  const showBundesland = laenderMitLigen.size >= 2;

  const showKreisFilter = level === "Kreisliga"; // NRW ist implizit der einzige Bereich
  const kreiseMitLigen = useMemo(
    () =>
      [...new Set(leagues.filter((l) => l.level === "Kreisliga").map((l) => l.region).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "de")
      ),
    [leagues]
  );
  const kreiseRemaining = Math.max(0, BASKETBALLKREISE_NRW.length - kreiseMitLigen.length);

  // Kreis zurücksetzen, wenn Spielklasse ≠ Kreisliga.
  useEffect(() => {
    if (!showKreisFilter && kreis) setKreis("");
  }, [showKreisFilter, kreis]);

  const isYouth = isYouthAge(bereich);
  const kategorieOptions = isYouth
    ? [
        { v: "", l: "Alle" },
        { v: "Herren", l: "männlich" },
        { v: "Damen", l: "weiblich" },
        { v: "Mixed", l: "offen" },
      ]
    : [
        { v: "", l: "Alle" },
        { v: "Herren", l: "Herren" },
        { v: "Damen", l: "Damen" },
      ];

  // Spielklassen-Optionen dynamisch aus den zum Bereich passenden Ligen.
  const levelOptions = useMemo(() => {
    const rel = leagues.filter((l) => (!bereich || l.ageGroup === bereich));
    const present = new Set(rel.map((l) => l.level).filter(Boolean));
    return LEAGUE_LEVELS.filter((lv) => present.has(lv));
  }, [leagues, bereich]);

  function statusPred(l) {
    if (status === "abgeschlossen") return !!l.finished;
    if (status === "vorbereitung") return !l.finished && (l.teamCount || 0) === 0;
    if (status === "alle") return true;
    return l.active && !l.finished; // aktiv
  }

  const narrowing = !!(land || bereich || kategorie || level || kreis || search.trim());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leagues.filter((l) => {
      if (!statusPred(l)) return false;
      if (land && l.bundesland !== land) return false;
      if (bereich && l.ageGroup !== bereich) return false;
      if (kategorie && l.gender !== kategorie) return false;
      if (level && l.level !== level) return false;
      if (showKreisFilter && kreis && l.region !== kreis) return false;
      if (q && !`${l.name} ${l.region} ${l.bundesland}`.toLowerCase().includes(q)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagues, status, land, bereich, kategorie, level, kreis, showKreisFilter, search]);

  // Geführte Startauswahl: pro Gruppe capped, nur laufende mit Teams, ohne eigene Liga.
  const guidedGroups = useMemo(() => {
    return GROUPS.map((g) => ({
      ...g,
      items: leagues
        .filter((l) => l.active && !l.finished && (l.teamCount || 0) > 0)
        .filter((l) => !myLeague || String(l._id) !== String(myLeague._id))
        .filter((l) => groupKey(l) === g.key)
        .sort(withinGroup)
        .slice(0, g.cap),
    })).filter((g) => g.items.length > 0);
  }, [leagues, myLeague]);

  // Katalog-Gruppen (Durchsuchen ohne einschränkende Filter → gruppiert mit Überschriften).
  const catalogGroups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        items: filtered.filter((l) => groupKey(l) === g.key).sort(withinGroup),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );
  const flatResults = useMemo(() => [...filtered].sort(fullCmp), [filtered]);

  function applyQuick(next) {
    setLand("");
    setBereich(next.bereich || "");
    setKategorie(next.kategorie || "");
    setLevel(next.level || "");
    setKreis("");
    setSearch("");
    setStatus("aktiv");
    setBrowse(true);
    setShowFilters(false);
  }
  function resetAll() {
    setStatus("aktiv");
    setLand("");
    setBereich("");
    setKategorie("");
    setLevel("");
    setKreis("");
    setSearch("");
    setBrowse(false);
    setShowFilters(false);
  }

  const QUICKS = [
    { label: "Senioren Herren", apply: { bereich: "Senioren", kategorie: "Herren" } },
    { label: "Senioren Damen", apply: { bereich: "Senioren", kategorie: "Damen" } },
    { label: "U18", apply: { bereich: "U18" } },
    { label: "U16", apply: { bereich: "U16" } },
    { label: "Kreisligen", apply: { level: "Kreisliga" } },
  ];

  // Aktive Filter-Chips (nur echte Einschränkungen; NRW/Defaults ausgenommen).
  const STATUS_LABEL = { alle: "Alle Ligen", abgeschlossen: "Abgeschlossene", vorbereitung: "In Vorbereitung" };
  const kategorieLabel = kategorie
    ? (kategorieOptions.find((o) => o.v === kategorie)?.l || kategorie)
    : "";
  const chips = [
    status !== "aktiv" && { k: "status", label: STATUS_LABEL[status], clear: () => setStatus("aktiv") },
    land && { k: "land", label: land, clear: () => setLand("") },
    bereich && { k: "bereich", label: bereich, clear: () => setBereich("") },
    kategorie && { k: "kategorie", label: kategorieLabel, clear: () => setKategorie("") },
    level && { k: "level", label: level, clear: () => { setLevel(""); setKreis(""); } },
    kreis && { k: "kreis", label: kreis, clear: () => setKreis("") },
    search.trim() && { k: "search", label: `„${search.trim()}"`, clear: () => setSearch("") },
  ].filter(Boolean);

  const selectCls =
    "w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <Navbar />
      <PageHeader eyebrow="Wettbewerb" title="Ligen" subtitle="Tabellen und Wettbewerbe." />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {loading ? (
          <Loading />
        ) : error ? (
          <EmptyState title="Ligen konnten nicht geladen werden." />
        ) : leagues.length === 0 ? (
          <EmptyState icon={FaTrophy} title="Noch keine Ligen vorhanden." />
        ) : !browse ? (
          /* ══ Geführte Startansicht ══ */
          <div className="space-y-8">
            {!showBundesland && (
              <p className="text-xs text-gray-400">Region: {NRW} · weitere Bundesländer folgen</p>
            )}

            {/* Schnellzugriffe (nur Voreinstellungen) */}
            <div className="flex flex-wrap gap-2">
              {QUICKS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => applyQuick(q.apply)}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {myLeague && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-gray-900">Deine Liga</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <LeagueCard l={myLeague} />
                </div>
              </section>
            )}

            <section className="space-y-6">
              <h2 className="text-sm font-bold text-gray-900">Aktive Ligen entdecken</h2>
              {guidedGroups.length === 0 ? (
                <EmptyState title="Aktuell keine laufenden Ligen mit Teams." text="Durchsuche den vollständigen Katalog." />
              ) : (
                guidedGroups.map((g) => (
                  <div key={g.key}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{g.label}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {g.items.map((l) => (
                        <LeagueCard key={l._id} l={l} />
                      ))}
                    </div>
                  </div>
                ))
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
          /* ══ Durchsuchen-Modus ══ */
          <div>
            {/* Zeile 1: Zähler + Suche (volle Breite) */}
            <div className="mb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {filtered.length} {filtered.length === 1 ? "Liga" : "Ligen"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="sm:hidden inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                >
                  <FaFilter className="text-xs" /> Filter{chips.length ? ` (${chips.length})` : ""}
                </button>
              </div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Liga, Region oder Basketballkreis suchen"
                  className={`${selectCls} pl-8`}
                  aria-label="Suche"
                />
              </div>
            </div>

            {/* Zeile 2: Filter-Grid (responsive, kein Horizontal-Scroll) */}
            <div className={`${showFilters ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`}>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Status">
                <option value="aktiv">Aktive Ligen</option>
                <option value="alle">Alle Ligen</option>
                <option value="abgeschlossen">Abgeschlossene Ligen</option>
                <option value="vorbereitung">In Vorbereitung</option>
              </select>

              <select
                value={bereich}
                onChange={(e) => {
                  setBereich(e.target.value);
                  setKategorie("");
                  setLevel("");
                  setKreis("");
                }}
                className={selectCls}
                aria-label="Bereich"
              >
                <option value="">Alle Bereiche</option>
                <option value="Senioren">Senioren</option>
                <option value="U18">U18</option>
                <option value="U16">U16</option>
              </select>

              <select value={kategorie} onChange={(e) => setKategorie(e.target.value)} className={selectCls} aria-label="Kategorie">
                {kategorieOptions.map((o) => (
                  <option key={o.v || "all"} value={o.v}>
                    {o.v ? o.l : "Alle Kategorien"}
                  </option>
                ))}
              </select>

              <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls} aria-label="Spielklasse">
                <option value="">Alle Spielklassen</option>
                {levelOptions.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>

              {showBundesland && (
                <select value={land} onChange={(e) => setLand(e.target.value)} className={selectCls} aria-label="Bundesland">
                  <option value="">Alle Bundesländer</option>
                  {BUNDESLAENDER.map((b) => {
                    const v = laenderMitLigen.has(b);
                    return (
                      <option key={b} value={b} disabled={!v}>
                        {v ? b : `${b} – folgt`}
                      </option>
                    );
                  })}
                </select>
              )}

              {showKreisFilter && (
                <select value={kreis} onChange={(e) => setKreis(e.target.value)} className={selectCls} aria-label="Basketballkreis">
                  <option value="">Alle Basketballkreise</option>
                  {kreiseMitLigen.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                  {kreiseRemaining > 0 && (
                    <option value="" disabled>
                      Weitere {kreiseRemaining} Basketballkreise folgen
                    </option>
                  )}
                </select>
              )}

              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="sm:hidden rounded-xl bg-brand-500 text-white py-2.5 text-sm font-semibold"
                >
                  Ergebnisse anzeigen
                </button>
              )}
            </div>

            {/* Aktive Filter-Chips + Zurücksetzen */}
            <div className="mt-3 mb-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
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
                Alle Filter zurücksetzen
              </button>
            </div>

            {/* Ergebnisse */}
            {filtered.length === 0 ? (
              <EmptyState
                title={
                  showKreisFilter && kreis
                    ? "Für diesen Basketballkreis wurden aktuell keine passenden Kreisligen gefunden."
                    : "Für diese Auswahl wurden keine Ligen gefunden."
                }
                text="Passe einen Filter an oder setze die Filter zurück."
              />
            ) : narrowing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {flatResults.map((l) => (
                  <LeagueCard key={l._id} l={l} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {catalogGroups.map((g) => (
                  <div key={g.key}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{g.label}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {g.items.map((l) => (
                        <LeagueCard key={l._id} l={l} />
                      ))}
                    </div>
                  </div>
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
