"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiUsersBold, PiTrophyBold, PiMagnifyingGlassBold, PiFunnelBold, PiXBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPlayerToken } from "@/lib/clientAuth";
import {
  LEAGUE_LEVELS,
  BASKETBALLKREISE_NRW_GRUPPIERT,
  BUNDESLAENDER,
  bezirkOfKreis,
  kreisFromText,
} from "@/lib/constants";

const NRW = "Nordrhein-Westfalen";
const BEZIRKE = BASKETBALLKREISE_NRW_GRUPPIERT.map((g) => g.bezirk);

// Bereichsgruppen (gegenseitig ausschließend). Reihenfolge = Sortier-/Anzeigereihenfolge.
const GROUPS = [
  { key: "sh", label: "Senioren Herren", cap: 3 },
  { key: "sd", label: "Senioren Damen", cap: 2 },
  { key: "u18", label: "U18", cap: 2 },
  { key: "kreis", label: "Kreisligen", cap: 3 },
];
function groupKey(l) {
  if (l.level === "Kreisliga") return "kreis";
  // Jede Jugendklasse (nicht nur U18) gehört in den Jugend-Abschnitt. Vorher
  // fiel alles außer „U18" und „Senioren Damen" in „Senioren Herren" durch —
  // ein Altbestand mit „U16" wäre auf der öffentlichen Seite als
  // Herren-Seniorenliga erschienen. Das Seed-Skript lässt solche Ligen
  // bewusst stehen, wenn sie Teams oder Spiele haben, der Fall ist also
  // vorgesehen. Dreimal unabhängig gemeldet in Kais Prüfkette.
  if (typeof l.ageGroup === "string" && /^U\d/i.test(l.ageGroup)) return "u18";
  if (l.ageGroup === "Senioren" && l.gender === "Damen") return "sd";
  return "sh";
}
const groupOrder = (l) => GROUPS.findIndex((g) => g.key === groupKey(l));

// Reine Bereichs-/Kategorie-Einordnung (ignoriert level) – für die Kreisliga-interne
// Gliederung (Senioren Herren/Damen/U18 INNERHALB eines Basketballkreises).
const AGE_BRACKETS = [
  { key: "sh", label: "Senioren Herren" },
  { key: "sd", label: "Senioren Damen" },
  { key: "u18", label: "U18" },
];
function ageBracketKey(l) {
  // Wie groupKey: jede Jugendklasse in den Jugend-Bereich, nicht nur U18.
  if (typeof l.ageGroup === "string" && /^U\d/i.test(l.ageGroup)) return "u18";
  if (l.ageGroup === "Senioren" && l.gender === "Damen") return "sd";
  return "sh";
}

// Unterstuetzt wird nur U18 (Plattform ab 16 Jahren, seit 13.08.2026). Die
// Pruefung bleibt aber bewusst breit: Ein Altbestand mit einer anderen
// Jugendklasse soll die maennlich/weiblich-Beschriftung bekommen und nicht als
// Seniorenliga durchgehen.
const isYouthAge = (a) => typeof a === "string" && /^U\d/i.test(a);
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

// Sortierung innerhalb einer Bereichsgruppe (bzw. innerhalb eines Kreis-Age-Brackets).
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
// Vollständige Sortierung (Gruppe zuerst, dann innerhalb) – für den flachen Katalog.
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
      className="block min-w-0 bg-navy-800 rounded-md border border-navy-600 p-5 hover:border-brand-500/50 hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out-strong motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-paper-50 break-words min-w-0">{l.name}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {l.isDemo && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-mist-300 bg-navy-700 rounded-sm px-2 py-0.5">
              Beispieldaten
            </span>
          )}
          {l.finished ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-signal-wait bg-signal-wait/15 rounded-sm px-2 py-0.5">
              <PiTrophyBold className="text-[9px]" /> Abgeschlossen
            </span>
          ) : empty ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-mist-400 bg-navy-700 rounded-sm px-2 py-0.5">
              In Vorbereitung
            </span>
          ) : null}
        </div>
      </div>
      {line2 && <p className="mt-1 text-xs text-mist-400 break-words">{line2}</p>}
      <p className="mt-1 text-xs text-mist-400">
        {l.season ? `Saison ${l.season} · ` : ""}
        {l.teamCount} {l.teamCount === 1 ? "Team" : "Teams"}
      </p>
      {l.finished && l.champion && (
        <p className="mt-1 text-xs font-medium text-signal-wait flex items-center gap-1">
          <PiTrophyBold className="text-[9px]" /> Meister: {l.champion.teamName}
        </p>
      )}
    </Link>
  );
}

// Karten-Skeleton im Format der echten Liga-Karte + Skeleton für die geführte Startansicht
// (Schnellzugriffe + gruppierte Liga-Karten), damit beim Laden kein Layout-Sprung entsteht.
function LeagueCardSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 p-5">
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

function LigenPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-full" />
        ))}
      </div>
      <div>
        <Skeleton className="h-3.5 w-40 mb-3" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <LeagueCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [status, setStatus] = useState("aktiv"); // aktiv | alle | abgeschlossen | vorbereitung
  const [land, setLand] = useState(""); // Bundesland (nur relevant, sobald ≥2 Länder Ligen haben)
  const [bereich, setBereich] = useState(""); // "" | Senioren | U18
  const [kategorie, setKategorie] = useState(""); // "" | Herren | Damen | Mixed
  const [level, setLevel] = useState("");
  const [bezirk, setBezirk] = useState(""); // Regierungsbezirk (nur UI-Gruppierung, keine DB-Entität)
  const [kreis, setKreis] = useState("");
  const [search, setSearch] = useState("");
  const [browse, setBrowse] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [myTeamId, setMyTeamId] = useState(null);
  const [myHometown, setMyHometown] = useState("");

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
      .then((r) => {
        if (!active) return;
        setMyTeamId(r.data?.player?.teamId || null);
        setMyHometown(r.data?.player?.hometown || r.data?.player?.bundesland || "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Bevorzugter Kreis aus Heimatort/Region des Nutzers (nur Vorauswahl/Sortierung,
  // KEINE automatische feste Ligazuordnung).
  const preferredKreis = useMemo(() => kreisFromText(myHometown), [myHometown]);

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

  const showKreisFilter = level === "Kreisliga";

  // Basketballkreise mit Liga-ANZAHL im aktuellen Bereichs-/Kategorie-Kontext (aus den
  // bereits geladenen Ligen berechnet – keine zusätzliche Abfrage nötig).
  const kreisCounts = useMemo(() => {
    const m = new Map();
    for (const l of leagues) {
      if (l.level !== "Kreisliga") continue;
      if (bereich && l.ageGroup !== bereich) continue;
      if (kategorie && l.gender !== kategorie) continue;
      if (!l.region) continue;
      m.set(l.region, (m.get(l.region) || 0) + 1);
    }
    return m;
  }, [leagues, bereich, kategorie]);

  // Regierungsbezirke, die (im aktuellen Kontext) mindestens einen Kreis mit Ligen haben.
  const bezirkeMitLigen = useMemo(() => {
    const s = new Set();
    for (const k of kreisCounts.keys()) {
      const b = bezirkOfKreis(k);
      if (b) s.add(b);
    }
    return s;
  }, [kreisCounts]);

  // Kreis/Bezirk zurücksetzen, wenn Spielklasse ≠ Kreisliga.
  useEffect(() => {
    if (!showKreisFilter) {
      if (kreis) setKreis("");
      if (bezirk) setBezirk("");
    }
  }, [showKreisFilter, kreis, bezirk]);

  // Kreis zurücksetzen, wenn er nicht (mehr) zum gewählten Regierungsbezirk gehört.
  useEffect(() => {
    if (bezirk && kreis && bezirkOfKreis(kreis) !== bezirk) setKreis("");
  }, [bezirk, kreis]);

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
    const qKreis = q ? kreisFromText(q) : null;
    return leagues.filter((l) => {
      if (!statusPred(l)) return false;
      if (land && l.bundesland !== land) return false;
      if (bereich && l.ageGroup !== bereich) return false;
      if (kategorie && l.gender !== kategorie) return false;
      if (level && l.level !== level) return false;
      if (showKreisFilter && bezirk && bezirkOfKreis(l.region) !== bezirk) return false;
      if (showKreisFilter && kreis && l.region !== kreis) return false;
      if (q) {
        const matchesAlias = qKreis && l.region === qKreis; // z.B. "Viersen" → Kreis Niers
        const matchesText = `${l.name} ${l.region} ${l.bundesland}`.toLowerCase().includes(q);
        if (!matchesAlias && !matchesText) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagues, status, land, bereich, kategorie, level, bezirk, kreis, showKreisFilter, search]);

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

  // Katalog-Gruppen (Durchsuchen ohne Kreisliga-Filter → nach Bereich gruppiert).
  const catalogGroups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        items: filtered.filter((l) => groupKey(l) === g.key).sort(withinGroup),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );
  const flatResults = useMemo(() => [...filtered].sort(fullCmp), [filtered]);

  // Kreisliga-spezifische Gliederung: Regierungsbezirk → Basketballkreis → Bereich/Kategorie
  // → Staffel (numerisch). Persönlich relevanter Kreis (Heimatort) zuerst.
  const kreisligaNested = useMemo(() => {
    if (level !== "Kreisliga") return null;
    const byKreis = new Map();
    for (const l of filtered) {
      const k = l.region || "Ohne Kreis";
      if (!byKreis.has(k)) byKreis.set(k, []);
      byKreis.get(k).push(l);
    }
    const kreisGroups = [...byKreis.entries()].map(([kreisName, items]) => ({
      kreisName,
      bezirk: bezirkOfKreis(kreisName) || "Sonstige",
      count: items.length,
      brackets: AGE_BRACKETS.map((b) => ({
        ...b,
        items: items.filter((l) => ageBracketKey(l) === b.key).sort(withinGroup),
      })).filter((b) => b.items.length > 0),
    }));
    kreisGroups.sort((a, b) => {
      const pref = (x) => (preferredKreis && x.kreisName === preferredKreis ? 0 : 1);
      if (pref(a) !== pref(b)) return pref(a) - pref(b);
      const bi = BEZIRKE.indexOf(a.bezirk), bj = BEZIRKE.indexOf(b.bezirk);
      if (bi !== bj) return (bi < 0 ? 99 : bi) - (bj < 0 ? 99 : bj);
      return a.kreisName.localeCompare(b.kreisName, "de");
    });
    const byBezirk = [];
    for (const kg of kreisGroups) {
      let entry = byBezirk.find((e) => e.bezirk === kg.bezirk);
      if (!entry) {
        entry = { bezirk: kg.bezirk, kreise: [] };
        byBezirk.push(entry);
      }
      entry.kreise.push(kg);
    }
    return byBezirk;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, level, preferredKreis]);

  function applyQuick(next) {
    setLand("");
    setBereich(next.bereich || "");
    setKategorie(next.kategorie || "");
    setLevel(next.level || "");
    // „Kreisligen"-Schnellzugriff: bevorzugten Kreis (aus Heimatort) direkt vorschlagen,
    // bleibt jederzeit über den Filterchip entfernbar (keine feste Zuordnung).
    if (next.level === "Kreisliga" && preferredKreis) {
      setBezirk(bezirkOfKreis(preferredKreis));
      setKreis(preferredKreis);
    } else {
      setBezirk("");
      setKreis("");
    }
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
    setBezirk("");
    setKreis("");
    setSearch("");
    setBrowse(false);
    setShowFilters(false);
  }

  const QUICKS = [
    { label: "Senioren Herren", apply: { bereich: "Senioren", kategorie: "Herren" } },
    { label: "Senioren Damen", apply: { bereich: "Senioren", kategorie: "Damen" } },
    { label: "U18", apply: { bereich: "U18" } },
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
    level && {
      k: "level",
      label: level,
      clear: () => {
        setLevel("");
        setBezirk("");
        setKreis("");
      },
    },
    bezirk && { k: "bezirk", label: bezirk.replace("Regierungsbezirk ", ""), clear: () => setBezirk("") },
    kreis && { k: "kreis", label: kreis, clear: () => setKreis("") },
    search.trim() && { k: "search", label: `„${search.trim()}"`, clear: () => setSearch("") },
  ].filter(Boolean);

  const selectCls =
    "w-full min-w-0 rounded-md border border-navy-600 px-3 py-2.5 text-sm text-mist-300 bg-navy-800 outline-none focus:border-brand-400";

  // Basketballkreise fürs Dropdown: bei gewähltem Bezirk nur dessen Kreise, sonst alle 22
  // (gruppiert nach Bezirk). Kreise ohne Liga bleiben SICHTBAR, aber deaktiviert.
  const kreisGroupsForSelect = bezirk
    ? BASKETBALLKREISE_NRW_GRUPPIERT.filter((g) => g.bezirk === bezirk)
    : BASKETBALLKREISE_NRW_GRUPPIERT;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col overflow-x-hidden">
      <Navbar />
      <PageHeader eyebrow="Wettbewerb" title="Ligen" subtitle="Tabellen und Wettbewerbe." />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {loading ? (
          <LigenPageSkeleton />
        ) : error ? (
          <EmptyState title="Ligen konnten nicht geladen werden." />
        ) : leagues.length === 0 ? (
          <EmptyState icon={PiTrophyBold} title="Noch keine Ligen vorhanden." />
        ) : !browse ? (
          /* ══ Geführte Startansicht ══ */
          <div className="space-y-8">
            {!showBundesland && (
              <p className="text-xs text-mist-400">Region: {NRW} · weitere Bundesländer folgen</p>
            )}

            {/* Schnellzugriffe (nur Voreinstellungen) */}
            <div className="flex flex-wrap gap-2">
              {QUICKS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => applyQuick(q.apply)}
                  className="rounded-full border border-navy-600 bg-navy-800 px-4 py-2 text-sm font-medium text-mist-300 hover:border-brand-400 hover:text-brand-400 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {myLeague && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-paper-50">Deine Liga</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <LeagueCard l={myLeague} />
                </div>
              </section>
            )}

            <section className="space-y-6">
              <h2 className="text-sm font-bold text-paper-50">Aktive Ligen entdecken</h2>
              {guidedGroups.length === 0 ? (
                <EmptyState title="Aktuell keine laufenden Ligen mit Teams." text="Durchsuche den vollständigen Katalog." />
              ) : (
                guidedGroups.map((g) => (
                  <div key={g.key}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">{g.label}</h3>
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
              className="w-full rounded-md bg-navy-900 text-paper-50 py-3 text-sm font-semibold hover:bg-navy-700 transition-colors"
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
                <span className="text-sm font-medium text-mist-300">
                  {filtered.length} {filtered.length === 1 ? "Liga" : "Ligen"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="sm:hidden inline-flex items-center gap-2 rounded-md border border-navy-600 bg-navy-800 px-3 py-2 text-sm font-medium text-mist-300"
                >
                  <PiFunnelBold className="text-xs" /> Filter{chips.length ? ` (${chips.length})` : ""}
                </button>
              </div>
              <div className="relative">
                <PiMagnifyingGlassBold className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mist-400" />
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
                  setBezirk("");
                  setKreis("");
                }}
                className={selectCls}
                aria-label="Bereich"
              >
                <option value="">Alle Bereiche</option>
                <option value="Senioren">Senioren</option>
                <option value="U18">U18</option>
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
                <select
                  value={bezirk}
                  onChange={(e) => setBezirk(e.target.value)}
                  className={selectCls}
                  aria-label="Regierungsbezirk"
                >
                  <option value="">Alle Regierungsbezirke</option>
                  {BEZIRKE.map((b) => (
                    <option key={b} value={b} disabled={!bezirkeMitLigen.has(b)}>
                      {b}
                      {!bezirkeMitLigen.has(b) ? " – noch keine Ligen" : ""}
                    </option>
                  ))}
                </select>
              )}

              {showKreisFilter && (
                <select value={kreis} onChange={(e) => setKreis(e.target.value)} className={selectCls} aria-label="Basketballkreis">
                  <option value="">Alle Basketballkreise</option>
                  {kreisGroupsForSelect.map((g) => (
                    <optgroup key={g.bezirk} label={g.bezirk}>
                      {g.kreise.map((k) => {
                        const c = kreisCounts.get(k) || 0;
                        return (
                          <option key={k} value={k} disabled={c === 0}>
                            {k}
                            {c > 0 ? ` (${c})` : " – noch keine Ligen"}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              )}

              {showFilters && (
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="sm:hidden rounded-md bg-brand-500 text-navy-950 py-2.5 text-sm font-semibold"
                >
                  Ergebnisse anzeigen
                </button>
              )}
            </div>

            {/* Nutzerregion-Hinweis (nur als bequemer Vorschlag, keine feste Zuordnung) */}
            {showKreisFilter && preferredKreis && !kreis && (
              <button
                type="button"
                onClick={() => {
                  setBezirk(bezirkOfKreis(preferredKreis));
                  setKreis(preferredKreis);
                }}
                className="mb-3 text-xs font-medium text-brand-400 hover:underline"
              >
                Dein Kreis: {preferredKreis} auswählen
              </button>
            )}

            {/* Aktive Filter-Chips + Zurücksetzen */}
            <div className="mt-1 mb-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex items-center gap-1 rounded-sm bg-brand-500/10 text-brand-400 text-xs font-medium px-2.5 py-1 hover:bg-brand-500/15"
                >
                  {c.label} <PiXBold className="text-[9px]" />
                </button>
              ))}
              <button type="button" onClick={resetAll} className="text-xs font-medium text-mist-400 hover:text-brand-400 underline">
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
            ) : kreisligaNested ? (
              /* Kreisliga-Gliederung: Regierungsbezirk → Basketballkreis → Bereich */
              <div className="space-y-8">
                {kreisligaNested.map((be) => (
                  <div key={be.bezirk}>
                    <h3 className="mb-3 text-sm font-bold text-paper-50">{be.bezirk}</h3>
                    <div className="space-y-5 pl-3 border-l-2 border-navy-600">
                      {be.kreise.map((kg) => (
                        <div key={kg.kreisName}>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">
                            {kg.kreisName}
                            {preferredKreis === kg.kreisName && (
                              <span className="ml-1.5 normal-case text-brand-400">· dein Kreis</span>
                            )}
                          </h4>
                          <div className="space-y-3">
                            {kg.brackets.map((br) => (
                              <div key={br.key}>
                                <p className="mb-1.5 text-[11px] font-medium text-mist-400">{br.label}</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {br.items.map((l) => (
                                    <LeagueCard key={l._id} l={l} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">{g.label}</h3>
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
