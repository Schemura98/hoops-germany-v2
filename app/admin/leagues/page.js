"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrashBold, PiUsersBold, PiPlusBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  LEAGUE_GENDERS,
  LEAGUE_AGE_GROUPS,
  LEAGUE_PLAYOFF_MODES,
  TEAM_SEASON_STATUS,
} from "@/lib/constants";

const inputClass =
  "rounded-sm border border-ink-600 px-3 py-2 text-sm text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const EMPTY_NEW = {
  name: "",
  season: "",
  bundesland: "Nordrhein-Westfalen",
  level: "",
  gender: "Herren",
  ageGroup: "Senioren",
  region: "",
  playoffMode: "keine",
};

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [edits, setEdits] = useState({}); // { [id]: { name, season, bundesland } }
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [newLeague, setNewLeague] = useState(EMPTY_NEW);
  const [creating, setCreating] = useState(false);
  const [seasonsByLeague, setSeasonsByLeague] = useState({}); // { [leagueId]: rows }
  const [openSeasons, setOpenSeasons] = useState(null); // leagueId

  async function toggleSeasons(leagueId) {
    if (openSeasons === leagueId) {
      setOpenSeasons(null);
      return;
    }
    setOpenSeasons(leagueId);
    if (!seasonsByLeague[leagueId]) {
      try {
        const token = getAdminToken();
        const { data } = await axios.post("/api/admin/league-seasons", { token, leagueId });
        setSeasonsByLeague((s) => ({ ...s, [leagueId]: data.seasons || [] }));
      } catch {
        setSeasonsByLeague((s) => ({ ...s, [leagueId]: [] }));
      }
    }
  }

  async function setSeasonStatus(leagueId, teamSeasonId, status) {
    setSeasonsByLeague((s) => ({
      ...s,
      [leagueId]: (s[leagueId] || []).map((r) =>
        r._id === teamSeasonId ? { ...r, status } : r
      ),
    }));
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/season-status", { token, teamSeasonId, status });
    } catch {
      /* still */
    }
  }

  const load = useCallback(async () => {
    const token = getAdminToken();
    const { data } = await axios.post("/api/admin/leagues", { token });
    const list = data.leagues || [];
    setLeagues(list);
    const e = {};
    for (const l of list)
      e[l._id] = {
        name: l.name,
        season: l.season || "",
        bundesland: l.bundesland || "",
        level: l.level || "",
        gender: l.gender || "Herren",
        ageGroup: l.ageGroup || "Senioren",
        region: l.region || "",
        finished: !!l.finished,
        champion: l.champion || "",
        playoffMode: l.playoffMode || "keine",
      };
    setEdits(e);
  }, []);

  async function createLeague() {
    if (!newLeague.name.trim()) return;
    setCreating(true);
    setMsg(null);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/createleague", { token, ...newLeague });
      setNewLeague(EMPTY_NEW);
      setMsg({ type: "ok", text: "Liga erstellt." });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Erstellen fehlgeschlagen." });
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  function setField(id, key, value) {
    setEdits((e) => ({ ...e, [id]: { ...e[id], [key]: value } }));
  }

  async function save(id) {
    setBusyId(id);
    setMsg(null);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/updateleague", { token, leagueId: id, ...edits[id] });
      setMsg({ type: "ok", text: "Gespeichert." });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Speichern fehlgeschlagen." });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(l) {
    setBusyId(l._id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/updateleague", { token, leagueId: l._id, active: !l.active });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`Liga „${name}" wirklich löschen?`)) return;
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/deleteleague", { token, leagueId: id });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Ligen verwalten">
      {msg && (
        <div
          className={`mb-4 rounded-sm border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-signal-ok/10 border-signal-ok/50 text-signal-ok"
              : "bg-signal-error/10 border-signal-error/50 text-signal-error"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Neue Liga erstellen */}
      <div className="bg-ink-800 rounded-md border border-ink-600 p-4 mb-5">
        <h2 className="text-sm font-semibold text-paper-50 mb-3">Neue Liga erstellen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-mist-400 mb-1">Name</label>
            <input
              value={newLeague.name}
              onChange={(e) => setNewLeague((l) => ({ ...l, name: e.target.value }))}
              className={`${inputClass} w-full`}
              placeholder="z.B. Oberliga 1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Stufe</label>
            <select
              value={newLeague.level}
              onChange={(e) => setNewLeague((l) => ({ ...l, level: e.target.value }))}
              className={`${inputClass} w-full`}
            >
              <option value="">– wählen –</option>
              {LEAGUE_LEVELS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Saison</label>
            <input
              value={newLeague.season}
              onChange={(e) => setNewLeague((l) => ({ ...l, season: e.target.value }))}
              className={`${inputClass} w-full`}
              placeholder="2025/26"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Geschlecht</label>
            <select
              value={newLeague.gender}
              onChange={(e) => setNewLeague((l) => ({ ...l, gender: e.target.value }))}
              className={`${inputClass} w-full`}
            >
              {LEAGUE_GENDERS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Altersklasse</label>
            <select
              value={newLeague.ageGroup}
              onChange={(e) => setNewLeague((l) => ({ ...l, ageGroup: e.target.value }))}
              className={`${inputClass} w-full`}
            >
              {LEAGUE_AGE_GROUPS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">Bundesland</label>
            <select
              value={newLeague.bundesland}
              onChange={(e) => setNewLeague((l) => ({ ...l, bundesland: e.target.value }))}
              className={`${inputClass} w-full`}
            >
              <option value="">– wählen –</option>
              {BUNDESLAENDER.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">
              Region <span className="text-mist-400">(Bezirk/Kreis)</span>
            </label>
            <input
              value={newLeague.region}
              onChange={(e) => setNewLeague((l) => ({ ...l, region: e.target.value }))}
              className={`${inputClass} w-full`}
              placeholder="z.B. Bezirk Köln/Aachen"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-mist-400 mb-1">Meister-Modus</label>
            <select
              value={newLeague.playoffMode}
              onChange={(e) => setNewLeague((l) => ({ ...l, playoffMode: e.target.value }))}
              className={`${inputClass} w-full`}
            >
              {LEAGUE_PLAYOFF_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={createLeague}
            disabled={creating || !newLeague.name.trim()}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-ink-950 rounded-sm px-4 py-2 text-sm font-medium"
          >
            <PiPlusBold className="text-xs" /> {creating ? "…" : "Liga erstellen"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : leagues.length === 0 ? (
        <p className="text-mist-400">Keine Ligen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {leagues.map((l) => (
            <div
              key={l._id}
              className="bg-ink-800 rounded-md border border-ink-600 p-4 space-y-3"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-mist-400 mb-1">Name</label>
                  <input
                    value={edits[l._id]?.name || ""}
                    onChange={(e) => setField(l._id, "name", e.target.value)}
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Stufe</label>
                  <select
                    value={edits[l._id]?.level || ""}
                    onChange={(e) => setField(l._id, "level", e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option value="">– keine –</option>
                    {LEAGUE_LEVELS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Saison</label>
                  <input
                    value={edits[l._id]?.season || ""}
                    onChange={(e) => setField(l._id, "season", e.target.value)}
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Geschlecht</label>
                  <select
                    value={edits[l._id]?.gender || "Herren"}
                    onChange={(e) => setField(l._id, "gender", e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    {LEAGUE_GENDERS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Altersklasse</label>
                  <select
                    value={edits[l._id]?.ageGroup || "Senioren"}
                    onChange={(e) => setField(l._id, "ageGroup", e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    {LEAGUE_AGE_GROUPS.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Bundesland</label>
                  <select
                    value={edits[l._id]?.bundesland || ""}
                    onChange={(e) => setField(l._id, "bundesland", e.target.value)}
                    className={`${inputClass} w-full`}
                  >
                    <option value="">– keins –</option>
                    {BUNDESLAENDER.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-mist-400 mb-1">Region</label>
                  <input
                    value={edits[l._id]?.region || ""}
                    onChange={(e) => setField(l._id, "region", e.target.value)}
                    className={`${inputClass} w-full`}
                    placeholder="Bezirk/Kreis"
                  />
                </div>
              </div>

              {/* Playoff-Modus */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-600">
                <label className="text-xs font-medium text-mist-400">Meister-Modus</label>
                <select
                  value={edits[l._id]?.playoffMode || "keine"}
                  onChange={(e) => setField(l._id, "playoffMode", e.target.value)}
                  className={`${inputClass}`}
                >
                  {LEAGUE_PLAYOFF_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Saison-Abschluss + Meister */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-ink-600">
                <label className="inline-flex items-center gap-2 text-sm text-mist-300">
                  <input
                    type="checkbox"
                    checked={!!edits[l._id]?.finished}
                    onChange={(e) => setField(l._id, "finished", e.target.checked)}
                    className="h-4 w-4 rounded border-ink-600 text-brand-400 focus:ring-brand-500"
                  />
                  Saison abgeschlossen
                </label>
                {edits[l._id]?.finished && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-mist-400">Meister</label>
                    <select
                      value={edits[l._id]?.champion || ""}
                      onChange={(e) => setField(l._id, "champion", e.target.value)}
                      className={`${inputClass}`}
                    >
                      <option value="">– Tabellenführer automatisch –</option>
                      {(l.teams || []).map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.teamName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Saison-Status (eingefrorene TeamSeason-Einträge) */}
              {l.finished && (
                <div className="pt-2 border-t border-ink-600">
                  <button
                    type="button"
                    onClick={() => toggleSeasons(l._id)}
                    className="text-xs font-medium text-brand-400 hover:underline"
                  >
                    {openSeasons === l._id ? "Saison-Status ausblenden" : "Saison-Status verwalten"}
                  </button>
                  {openSeasons === l._id && (
                    <div className="mt-2 space-y-1.5">
                      {!seasonsByLeague[l._id] ? (
                        <p className="text-xs text-mist-400">Lädt…</p>
                      ) : seasonsByLeague[l._id].length === 0 ? (
                        <p className="text-xs text-mist-400">
                          Noch keine eingefrorenen Einträge – Saison (erneut) abschließen, um den
                          Endstand einzufrieren.
                        </p>
                      ) : (
                        seasonsByLeague[l._id].map((r) => (
                          <div key={r._id} className="flex items-center justify-between gap-2">
                            <span className="text-sm text-mist-300">
                              {r.placement ? `${r.placement}. ` : ""}
                              {r.teamName}
                              {r.champion ? " 🏆" : ""}
                              <span className="text-mist-400"> ({r.wins}–{r.losses})</span>
                            </span>
                            <select
                              value={r.status}
                              onChange={(e) => setSeasonStatus(l._id, r._id, e.target.value)}
                              className={inputClass}
                            >
                              {TEAM_SEASON_STATUS.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-ink-600">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/ligen/${l._id}`}
                    className="text-xs text-mist-400 hover:text-brand-400 inline-flex items-center gap-1"
                  >
                    <PiUsersBold /> {l.teamCount} Teams
                  </Link>
                  {l.official && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-400 bg-brand-500/10 rounded-sm px-2 py-0.5">
                      Offiziell
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(l)}
                    disabled={busyId === l._id}
                    className={`text-xs rounded-sm px-3 py-2 font-medium disabled:opacity-60 ${
                      l.active
                        ? "bg-signal-ok/15 text-signal-ok hover:bg-signal-ok/25"
                        : "bg-ink-700 text-mist-400 hover:bg-ink-700"
                    }`}
                  >
                    {l.active ? "Aktiv" : "Inaktiv"}
                  </button>
                  <button
                    onClick={() => save(l._id)}
                    disabled={busyId === l._id}
                    className="text-xs bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-ink-950 rounded-sm px-4 py-2 font-medium"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => remove(l._id, l.name)}
                    disabled={busyId === l._id}
                    className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-2"
                    title="Löschen"
                  >
                    <PiTrashBold />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
