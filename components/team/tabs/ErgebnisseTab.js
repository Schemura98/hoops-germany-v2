"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaBasketballBall,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartBar,
} from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";

const numInput =
  "w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const statInput =
  "w-14 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

function formatDate(d) {
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

export default function ErgebnisseTab({ team }) {
  const [matches, setMatches] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [forms, setForms] = useState({}); // Score je Spiel
  const [roster, setRoster] = useState({ players: [], slots: [] });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  // Stats-Editor: standardmäßig aufgeklappt; collapsedStats = vom User eingeklappte Spiele.
  const [collapsedStats, setCollapsedStats] = useState(() => new Set());
  const [statsForms, setStatsForms] = useState({}); // { [matchId]: { [key]: {points,assists,rebounds,didNotPlay} } }
  const [savingStatsId, setSavingStatsId] = useState(null);

  const ownResult = useCallback(
    (match, tid) =>
      String(match.teamA?._id || match.teamA) === String(tid)
        ? match.teamAResult
        : match.teamBResult,
    []
  );
  const oppResult = useCallback(
    (match, tid) =>
      String(match.teamA?._id || match.teamA) === String(tid)
        ? match.teamBResult
        : match.teamAResult,
    []
  );

  // Einheitliche Kaderliste für die Statistik-Erfassung
  const rosterList = useMemo(() => {
    const fromPlayers = roster.players.map((p) => ({
      key: p.playerId,
      playerId: p.playerId,
      name: p.name,
      position: p.position,
    }));
    const fromSlots = roster.slots.map((s) => ({
      key: `slot:${s.rosterSlotId}`,
      rosterSlotId: s.rosterSlotId,
      name: s.name,
      position: s.position,
    }));
    return [...fromPlayers, ...fromSlots];
  }, [roster]);

  // Stats-Formular eines Spiels aus vorhandenen playerStats aufbauen.
  const buildStatsForm = useCallback(
    (match) => {
      const own = (match.playerStats || []).filter(
        (s) => String(s.team) === String(teamId)
      );
      const map = {};
      for (const s of own) {
        const k = s.player ? String(s.player) : `slot:${s.rosterSlotId}`;
        map[k] = s;
      }
      const f = {};
      for (const r of rosterList) {
        const e = map[r.key];
        f[r.key] = {
          points: e?.points ?? "",
          assists: e?.assists ?? "",
          rebounds: e?.rebounds ?? "",
          didNotPlay: !!e?.didNotPlay,
        };
      }
      return f;
    },
    [teamId, rosterList]
  );

  // Formulare für alle Spiele vorbereiten, damit der aufgeklappte Editor direkt da ist.
  useEffect(() => {
    if (!teamId || rosterList.length === 0) return;
    setStatsForms((prev) => {
      const next = { ...prev };
      for (const m of matches) if (!next[m._id]) next[m._id] = buildStatsForm(m);
      return next;
    });
  }, [matches, rosterList, teamId, buildStatsForm]);

  const loadMatches = useCallback(async () => {
    const token = getTeamAuthToken();
    const { data } = await axios.post("/api/team/matches/list", { token });
    const list = data.matches || [];
    setMatches(list);
    setTeamId(data.teamId);
    const f = {};
    for (const m of list) {
      const own = ownResult(m, data.teamId);
      f[m._id] = {
        ownPoints: own?.ownPoints ?? "",
        opponentPoints: own?.opponentPoints ?? "",
      };
    }
    setForms(f);
  }, [ownResult]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = getTeamAuthToken();
        const [, rosterRes] = await Promise.all([
          loadMatches(),
          axios.post("/api/team/roster-players", { token }),
        ]);
        if (!active) return;
        setRoster({
          players: rosterRes.data.players || [],
          slots: rosterRes.data.slots || [],
        });
      } catch {
        if (active) setMsg({ type: "err", text: "Spiele konnten nicht geladen werden." });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadMatches]);

  function setField(matchId, key, value) {
    setForms((f) => ({ ...f, [matchId]: { ...f[matchId], [key]: value } }));
  }

  async function submit(matchId) {
    const form = forms[matchId];
    setBusyId(matchId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/submit-match-result", {
        token,
        matchId,
        ownPoints: form.ownPoints,
        opponentPoints: form.opponentPoints,
      });
      setMsg({ type: data.resultStatus === "mismatch" ? "err" : "ok", text: data.message });
      await loadMatches();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Einreichen fehlgeschlagen." });
    } finally {
      setBusyId(null);
    }
  }

  function toggleStats(match) {
    setCollapsedStats((prev) => {
      const next = new Set(prev);
      if (next.has(match._id)) next.delete(match._id);
      else next.add(match._id);
      return next;
    });
    if (!statsForms[match._id]) {
      setStatsForms((prev) => ({ ...prev, [match._id]: buildStatsForm(match) }));
    }
  }

  function setStatField(matchId, key, field, value) {
    setStatsForms((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [key]: { ...prev[matchId][key], [field]: value },
      },
    }));
  }

  async function saveStats(matchId) {
    const f = statsForms[matchId];
    const stats = rosterList.map((r) => ({
      playerId: r.playerId,
      rosterSlotId: r.rosterSlotId,
      playerName: r.rosterSlotId ? r.name : undefined,
      points: f[r.key].points,
      assists: f[r.key].assists,
      rebounds: f[r.key].rebounds,
      didNotPlay: f[r.key].didNotPlay,
    }));
    setSavingStatsId(matchId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/match-stats/save", { token, matchId, stats });
      setMsg({ type: "ok", text: "Statistiken gespeichert." });
      await loadMatches();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Speichern fehlgeschlagen." });
    } finally {
      setSavingStatsId(null);
    }
  }

  function opponentOf(match) {
    const isA = String(match.teamA?._id) === String(teamId);
    return isA ? match.teamB : match.teamA;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaBasketballBall className="text-brand-500 text-2xl animate-bounce" />
      </div>
    );
  }

  const relevant = matches.filter((m) => m.status !== "cancelled");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Ergebnisse</h2>
      <p className="text-sm text-gray-500 -mt-2">
        Beide Teams melden ihr Ergebnis. Stimmen die Angaben überein, wird das Spiel
        bestätigt. Spieler-Statistiken könnt ihr jederzeit erfassen.
      </p>

      {msg && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {relevant.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Noch keine Spiele vorhanden. Trage zuerst Spiele im Spielplan ein.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevant.map((match) => {
            const opp = opponentOf(match);
            const own = ownResult(match, teamId);
            const other = oppResult(match, teamId);
            const ownSubmitted = own && own.ownPoints != null;
            const otherSubmitted = other && other.ownPoints != null;
            const form = forms[match._id] || { ownPoints: "", opponentPoints: "" };
            const confirmed = match.resultStatus === "confirmed";
            const mismatch = match.resultStatus === "mismatch";
            const statsOpen = !collapsedStats.has(match._id);
            const sForm = statsForms[match._id] || {};
            // Ergebnis/Statistiken erst ab Spielbeginn – außer es liegt schon etwas vor.
            const isOver = new Date(match.date).getTime() <= Date.now();
            const canEnter =
              isOver || ownSubmitted || otherSubmitted || match.status === "completed";

            return (
              <div
                key={match._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">vs. {opp?.teamName || "Unbekannt"}</p>
                    <p className="text-xs text-gray-500">{formatDate(match.date)}</p>
                  </div>
                  {confirmed && (
                    <span className="inline-flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                      <FaCheckCircle /> Bestätigt
                    </span>
                  )}
                  {mismatch && (
                    <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-semibold">
                      <FaExclamationTriangle /> Widerspruch
                    </span>
                  )}
                </div>

                {!canEnter ? (
                  <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-500">
                    ⏳ Dieses Spiel findet erst am <strong>{formatDate(match.date)}</strong> statt –
                    Ergebnis &amp; Statistiken kannst du danach eintragen.
                  </div>
                ) : (
                  <>
                {/* Score */}
                {confirmed ? (
                  <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {own.ownPoints} : {own.opponentPoints}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Endstand (dein Team : Gegner)</p>
                  </div>
                ) : (
                  <>
                    {mismatch && (
                      <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-700">
                        Eure Meldung: <strong>{own?.ownPoints}:{own?.opponentPoints}</strong>
                        {otherSubmitted && (
                          <>
                            {" · "}Gegner meldet:{" "}
                            <strong>
                              {other.opponentPoints}:{other.ownPoints}
                            </strong>
                          </>
                        )}
                        . Bitte abstimmen und korrigiert erneut einreichen.
                      </div>
                    )}
                    {!mismatch && ownSubmitted && !otherSubmitted && (
                      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-xs text-amber-700">
                        Deine Meldung ist eingegangen – warte auf die Bestätigung des Gegners.
                      </div>
                    )}
                    {!mismatch && !ownSubmitted && otherSubmitted && (
                      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-xs text-blue-700">
                        Der Gegner hat bereits gemeldet. Trage jetzt euer Ergebnis ein.
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Eigene Punkte
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.ownPoints}
                          onChange={(e) => setField(match._id, "ownPoints", e.target.value)}
                          className={numInput}
                        />
                      </div>
                      <span className="pb-2 text-gray-500 font-semibold">:</span>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Gegner-Punkte
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={form.opponentPoints}
                          onChange={(e) => setField(match._id, "opponentPoints", e.target.value)}
                          className={numInput}
                        />
                      </div>
                      <button
                        onClick={() => submit(match._id)}
                        disabled={
                          busyId === match._id ||
                          form.ownPoints === "" ||
                          form.opponentPoints === ""
                        }
                        className="ml-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium"
                      >
                        {busyId === match._id ? "…" : ownSubmitted ? "Aktualisieren" : "Einreichen"}
                      </button>
                    </div>
                  </>
                )}

                {/* Statistik-Editor */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => toggleStats(match)}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600"
                  >
                    <FaChartBar /> Spieler-Statistiken {statsOpen ? "ausblenden" : "erfassen"}
                  </button>

                  {statsOpen && (
                    <div className="mt-3">
                      {rosterList.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Kein Kader erfasst. Lege Slots im Kader-Tab an oder nimm Spieler auf.
                        </p>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-gray-500 text-left">
                                  <th className="font-medium py-1 pr-2">Spieler</th>
                                  <th className="font-medium py-1 text-center">PKT</th>
                                  <th className="font-medium py-1 text-center">AST</th>
                                  <th className="font-medium py-1 text-center">REB</th>
                                  <th className="font-medium py-1 text-center">DNP</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rosterList.map((r) => {
                                  const row = sForm[r.key] || {};
                                  const dnp = !!row.didNotPlay;
                                  return (
                                    <tr key={r.key} className="border-t border-gray-100">
                                      <td className="py-1.5 pr-2">
                                        <span className="text-gray-900">{r.name}</span>
                                        {r.position && (
                                          <span className="text-xs text-gray-500"> · {r.position}</span>
                                        )}
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          value={row.points ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "points", e.target.value)}
                                          className={`${statInput} disabled:bg-gray-50 disabled:text-gray-300`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          value={row.assists ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "assists", e.target.value)}
                                          className={`${statInput} disabled:bg-gray-50 disabled:text-gray-300`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          value={row.rebounds ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "rebounds", e.target.value)}
                                          className={`${statInput} disabled:bg-gray-50 disabled:text-gray-300`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="checkbox"
                                          checked={dnp}
                                          onChange={(e) => setStatField(match._id, r.key, "didNotPlay", e.target.checked)}
                                          className="h-4 w-4 accent-brand-500"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => saveStats(match._id)}
                              disabled={savingStatsId === match._id}
                              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium"
                            >
                              {savingStatsId === match._id ? "Speichern…" : "Statistiken speichern"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
