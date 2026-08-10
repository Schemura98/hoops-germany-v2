"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { BUNDESLAENDER, MATCH_STAGES, PLAYOFF_ROUNDS } from "@/lib/constants";
import LeagueReportLink from "@/components/team/LeagueReportLink";
import ConfirmAction from "@/components/ui/ConfirmAction";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import TabAlert from "@/components/team/tabs/TabAlert";
import { inputClassSm } from "@/lib/ui";

const STATUS_BADGE = {
  scheduled: { label: "Geplant", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Abgeschlossen", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Abgesagt", cls: "bg-red-100 text-red-700" },
};

function formatDate(d) {
  try {
    return new Date(d).toLocaleString("de-DE", {
      weekday: "short",
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

export default function SpielplanTab({ team }) {
  const [matches, setMatches] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    opponentId: "",
    date: "",
    location: "",
    leagueId: "",
    stage: "Hauptrunde",
    playoffRound: "",
  });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Gegner-Filter (damit das Dropdown bei vielen Teams übersichtlich bleibt)
  const [filterBundesland, setFilterBundesland] = useState("");
  const [filterLeagueId, setFilterLeagueId] = useState("");

  // Liga erstellen

  const loadMatches = useCallback(async () => {
    const token = getTeamAuthToken();
    const { data } = await axios.post("/api/team/matches/list", { token });
    setMatches(data.matches || []);
    setTeamId(data.teamId);
  }, []);

  const loadLeagues = useCallback(async () => {
    const { data } = await axios.get("/api/leagues");
    setLeagues(data.leagues || []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [, teamsRes] = await Promise.all([
          loadMatches(),
          axios.post("/api/team/fetchteams", {}),
          loadLeagues(),
        ]);
        if (!active) return;
        setTeams(teamsRes.data.teams || []);
      } catch {
        if (active) setMsg({ type: "err", text: "Spiele konnten nicht geladen werden." });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadMatches, loadLeagues]);

  async function addMatch(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/matches/create", { token, ...form });
      setForm({ opponentId: "", date: "", location: "", leagueId: "", stage: "Hauptrunde", playoffRound: "" });
      setShowAdd(false);
      await loadMatches();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Spiel konnte nicht angelegt werden." });
    } finally {
      setSaving(false);
    }
  }

  async function removeMatch(matchId) {
    setBusyId(matchId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/matches/delete", { token, matchId });
      await loadMatches();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Spiel konnte nicht entfernt werden." });
    } finally {
      setBusyId(null);
    }
  }

  // Gegner = die Seite, die nicht das eigene Team ist
  function opponentOf(match) {
    const isA = String(match.teamA?._id) === String(teamId);
    return isA ? match.teamB : match.teamA;
  }

  const opponents = teams.filter((t) => String(t._id) !== String(team?._id));

  // Nur tatsächlich vertretene Bundesländer anbieten (in kanonischer Reihenfolge).
  const availableBL = useMemo(() => {
    const present = new Set(opponents.map((t) => t.bundesland).filter(Boolean));
    return BUNDESLAENDER.filter((b) => present.has(b));
  }, [opponents]);

  const filteredOpponents = useMemo(() => {
    let list = opponents;
    if (filterBundesland) list = list.filter((t) => t.bundesland === filterBundesland);
    if (filterLeagueId) {
      const lg = leagues.find((l) => String(l._id) === String(filterLeagueId));
      const ids = new Set((lg?.teams || []).map(String));
      list = list.filter((t) => ids.has(String(t._id)));
    }
    return list;
  }, [opponents, leagues, filterBundesland, filterLeagueId]);

  // Ausgewählten Gegner zurücksetzen, falls er aus dem Filter fällt.
  useEffect(() => {
    if (
      form.opponentId &&
      !filteredOpponents.some((t) => String(t._id) === String(form.opponentId))
    ) {
      setForm((f) => ({ ...f, opponentId: "" }));
    }
  }, [filteredOpponents, form.opponentId]);

  if (loading) return <Loading className="py-12" size="text-2xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Spielplan <span className="text-sm font-normal text-gray-500">· {matches.length} Spiele</span>
        </h2>
        <Button
          onClick={() => setShowAdd((v) => !v)}
          aria-expanded={showAdd}
          className="flex-shrink-0"
        >
          <FaPlus className="text-xs" /> Spiel hinzufügen
        </Button>
      </div>

      <TabAlert msg={msg} />

      {showAdd && (
        <form
          onSubmit={addMatch}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3"
        >
          {/* Gegner eingrenzen (Bundesland/Liga) – hält das Dropdown übersichtlich */}
          {opponents.length > 0 && (availableBL.length > 0 || leagues.length > 0) && (
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Gegner eingrenzen (optional)</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={filterBundesland}
                  onChange={(e) => setFilterBundesland(e.target.value)}
                  className={inputClassSm}
                  aria-label="Nach Bundesland filtern"
                >
                  <option value="">Alle Bundesländer</option>
                  {availableBL.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <select
                  value={filterLeagueId}
                  onChange={(e) => setFilterLeagueId(e.target.value)}
                  className={inputClassSm}
                  aria-label="Nach Liga filtern"
                >
                  <option value="">Alle Ligen</option>
                  {leagues.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                      {l.season ? ` (${l.season})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Gegner{" "}
                <span className="text-gray-500 font-normal">· {filteredOpponents.length}</span>
              </label>
              <select
                required
                value={form.opponentId}
                onChange={(e) => setForm((f) => ({ ...f, opponentId: e.target.value }))}
                className={inputClassSm}
              >
                <option value="">– Team wählen –</option>
                {filteredOpponents.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.teamName}
                    {t.region ? ` · ${t.region}` : ""}
                  </option>
                ))}
              </select>
              {opponents.length === 0 ? (
                <p className="mt-1 text-xs text-gray-500">
                  Noch keine anderen Teams registriert.
                </p>
              ) : filteredOpponents.length === 0 ? (
                <p className="mt-1 text-xs text-gray-500">
                  Keine Teams für diesen Filter – Auswahl anpassen.
                </p>
              ) : null}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Datum & Uhrzeit</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClassSm}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ort <span className="text-gray-500">(optional)</span>
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClassSm}
                placeholder="z.B. Sporthalle Mitte"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Liga <span className="text-gray-500">(optional)</span>
              </label>
              <select
                value={form.leagueId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    leagueId: e.target.value,
                    // ohne Liga keine Playoffs
                    stage: e.target.value ? f.stage : "Hauptrunde",
                    playoffRound: e.target.value ? f.playoffRound : "",
                  }))
                }
                className={inputClassSm}
              >
                <option value="">– Freundschaftsspiel –</option>
                {leagues.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                    {l.season ? ` (${l.season})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Spieltyp (nur mit Liga): Hauptrunde vs. Playoffs + Runde */}
          {form.leagueId && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Spieltyp</label>
                <select
                  value={form.stage}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      stage: e.target.value,
                      playoffRound: e.target.value === "Playoffs" ? f.playoffRound : "",
                    }))
                  }
                  className={inputClassSm}
                >
                  {MATCH_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {form.stage === "Playoffs" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Playoff-Runde</label>
                  <select
                    required
                    value={form.playoffRound}
                    onChange={(e) => setForm((f) => ({ ...f, playoffRound: e.target.value }))}
                    className={inputClassSm}
                  >
                    <option value="">– Runde wählen –</option>
                    {PLAYOFF_ROUNDS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Ligen werden nicht mehr selbst angelegt – nur aus dem Katalog gewählt. */}
          <div className="text-xs text-gray-500">
            Fehlt deine Liga in der Auswahl?{" "}
            <LeagueReportLink bundesland={team?.bundesland || ""} className="align-middle" />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                saving ||
                !form.opponentId ||
                !form.date ||
                (form.stage === "Playoffs" && !form.playoffRound)
              }
              className="px-6"
            >
              {saving ? "Speichern…" : "Spiel eintragen"}
            </Button>
          </div>
        </form>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon={FaCalendarAlt}
          title="Noch keine Spiele eingetragen"
          text="Lege das erste Spiel an – es erscheint dann auch im öffentlichen Spielplan."
          action={
            !showAdd && (
              <Button onClick={() => setShowAdd(true)}>
                <FaPlus className="text-xs" /> Spiel hinzufügen
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {matches.map((match) => {
            const opp = opponentOf(match);
            const badge = STATUS_BADGE[match.status] || STATUS_BADGE.scheduled;
            return (
              <div key={match._id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    vs. {opp?.teamName || "Unbekannt"}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(match.date)}</p>
                  {match.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt /> {match.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {match.status === "completed" &&
                    match.winningTeamPoints != null && (
                      <span className="text-sm font-semibold text-gray-700">
                        {match.winningTeamPoints}:{match.losingTeamPoints}
                      </span>
                    )}
                  <span className={`text-xs font-medium rounded-full px-3 py-1 ${badge.cls}`}>
                    {badge.label}
                  </span>
                  {match.status === "scheduled" && (
                    <ConfirmAction
                      trigger={({ onClick }) => (
                        <button
                          onClick={onClick}
                          disabled={busyId === match._id}
                          className="text-gray-500 hover:text-red-600 disabled:opacity-60 p-1.5"
                          title="Spiel entfernen"
                          aria-label={`Spiel gegen ${opp?.teamName || "Gegner"} entfernen`}
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                      message={`Spiel gegen ${opp?.teamName || "den Gegner"} wirklich entfernen?`}
                      confirmLabel="Entfernen"
                      busy={busyId === match._id}
                      onConfirm={() => removeMatch(match._id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
