"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PiBasketballBold,
  PiCheckCircleBold,
  PiWarningBold,
  PiChartBarBold,
} from "react-icons/pi";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import TabAlert from "@/components/team/tabs/TabAlert";
import { inputClassNum, inputClassStat } from "@/lib/ui";
import { positionLabel } from "@/lib/constants";

// Breiten lokal, Feld-Tokens zentral (lib/ui.js) – s. Kommentar dort.
const numInput = `w-20 ${inputClassNum}`;
const statInput = `w-14 ${inputClassStat}`;

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

  if (loading) return <Loading className="py-12" size="text-2xl" />;

  const relevant = matches.filter((m) => m.status !== "cancelled");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-paper-50">Ergebnisse</h2>
      <p className="text-sm text-mist-400 -mt-2">
        Beide Teams melden ihr Ergebnis. Stimmen die Angaben überein, wird das Spiel
        bestätigt. Spieler-Statistiken könnt ihr jederzeit erfassen.
      </p>

      <TabAlert msg={msg} />

      {relevant.length === 0 ? (
        <EmptyState
          icon={PiBasketballBold}
          title="Noch keine Spiele vorhanden"
          text="Trage zuerst Spiele im Spielplan ein – danach könnt ihr hier Ergebnisse und Statistiken melden."
        />
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
                className="bg-navy-800 rounded-md border border-navy-600 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-paper-50">vs. {opp?.teamName || "Unbekannt"}</p>
                    <p className="text-xs text-mist-400">{formatDate(match.date)}</p>
                  </div>
                  {confirmed && (
                    <span className="inline-flex items-center gap-1.5 text-signal-ok text-sm font-semibold">
                      <PiCheckCircleBold /> Bestätigt
                    </span>
                  )}
                  {mismatch && (
                    <span className="inline-flex items-center gap-1.5 text-signal-error text-sm font-semibold">
                      <PiWarningBold /> Widerspruch
                    </span>
                  )}
                </div>

                {!canEnter ? (
                  <div className="mt-3 rounded-sm bg-navy-950 border border-navy-600 px-4 py-3 text-sm text-mist-400">
                    ⏳ Dieses Spiel findet erst am <strong>{formatDate(match.date)}</strong> statt –
                    Ergebnis &amp; Statistiken kannst du danach eintragen.
                  </div>
                ) : (
                  <>
                {/* Score */}
                {confirmed ? (
                  <div className="mt-3 rounded-sm bg-signal-ok/10 border border-signal-ok/50 px-4 py-3 text-center">
                    <span className="text-2xl font-bold text-paper-50">
                      {own.ownPoints} : {own.opponentPoints}
                    </span>
                    <p className="text-xs text-mist-400 mt-1">Endstand (dein Team : Gegner)</p>
                  </div>
                ) : (
                  <>
                    {mismatch && (
                      <div className="mt-3 rounded-sm bg-signal-error/10 border border-signal-error/50 px-4 py-2 text-xs text-signal-error">
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
                      <div className="mt-3 rounded-sm bg-signal-wait/10 border border-signal-wait/50 px-4 py-2 text-xs text-signal-wait">
                        Deine Meldung ist eingegangen – warte auf die Bestätigung des Gegners.
                      </div>
                    )}
                    {!mismatch && !ownSubmitted && otherSubmitted && (
                      <div className="mt-3 rounded-sm bg-navy-700 border border-navy-600 px-4 py-2 text-xs text-mist-300">
                        Der Gegner hat bereits gemeldet. Trage jetzt euer Ergebnis ein.
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <div>
                        <label
                          htmlFor={`own-${match._id}`}
                          className="block text-xs font-medium text-mist-400 mb-1"
                        >
                          Eigene Punkte <span className="text-brand-400">*</span>
                        </label>
                        <input
                          id={`own-${match._id}`}
                          type="number"
                          min="0"
                          required
                          value={form.ownPoints}
                          onChange={(e) => setField(match._id, "ownPoints", e.target.value)}
                          className={numInput}
                        />
                      </div>
                      <span className="pb-2 text-mist-400 font-semibold" aria-hidden="true">
                        :
                      </span>
                      <div>
                        <label
                          htmlFor={`opp-${match._id}`}
                          className="block text-xs font-medium text-mist-400 mb-1"
                        >
                          Gegner-Punkte <span className="text-brand-400">*</span>
                        </label>
                        <input
                          id={`opp-${match._id}`}
                          type="number"
                          min="0"
                          required
                          value={form.opponentPoints}
                          onChange={(e) => setField(match._id, "opponentPoints", e.target.value)}
                          className={numInput}
                        />
                      </div>
                      <Button
                        onClick={() => submit(match._id)}
                        disabled={
                          busyId === match._id ||
                          form.ownPoints === "" ||
                          form.opponentPoints === ""
                        }
                        className="ml-auto px-5"
                      >
                        {busyId === match._id ? "…" : ownSubmitted ? "Aktualisieren" : "Einreichen"}
                      </Button>
                    </div>
                  </>
                )}

                {/* Statistik-Editor */}
                <div className="mt-4 border-t border-navy-600 pt-3">
                  <button
                    onClick={() => toggleStats(match)}
                    aria-expanded={statsOpen}
                    className="inline-flex items-center gap-2 text-sm text-mist-400 hover:text-brand-400"
                  >
                    <PiChartBarBold /> Spieler-Statistiken {statsOpen ? "ausblenden" : "erfassen"}
                  </button>

                  {statsOpen && (
                    <div className="mt-3">
                      {rosterList.length === 0 ? (
                        <p className="text-sm text-mist-400">
                          Kein Kader erfasst. Lege Slots im Kader-Tab an oder nimm Spieler auf.
                        </p>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-mist-400 text-left">
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
                                    <tr key={r.key} className="border-t border-navy-600">
                                      <td className="py-1.5 pr-2">
                                        <span className="text-paper-50">{r.name}</span>
                                        {/* `positionLabel` statt roher Wert
                                            (Kai F-2, 15.08.2026). Kein
                                            POSITION_FEHLT: Das ist die
                                            Eingabemaske für den Box-Score –
                                            die Position steht als Hilfe neben
                                            dem Namen, nicht als Angabe über
                                            die Person. */}
                                        {r.position && (
                                          <span className="text-xs text-mist-400">
                                            {" · "}
                                            {positionLabel(r.position)}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          aria-label={`Punkte ${r.name}`}
                                          value={row.points ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "points", e.target.value)}
                                          className={`${statInput} disabled:bg-navy-950 disabled:text-navy-500`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          aria-label={`Assists ${r.name}`}
                                          value={row.assists ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "assists", e.target.value)}
                                          className={`${statInput} disabled:bg-navy-950 disabled:text-navy-500`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          disabled={dnp}
                                          aria-label={`Rebounds ${r.name}`}
                                          value={row.rebounds ?? ""}
                                          onChange={(e) => setStatField(match._id, r.key, "rebounds", e.target.value)}
                                          className={`${statInput} disabled:bg-navy-950 disabled:text-navy-500`}
                                        />
                                      </td>
                                      <td className="py-1.5 text-center">
                                        {/* Touch-Ziel: die Box selbst bleibt klein, die Klickfläche
                                            ist 44px hoch (WCAG 2.5.5) – Welle-2b-Befund. */}
                                        <label className="mx-auto flex min-h-11 min-w-11 items-center justify-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={dnp}
                                            aria-label={`${r.name} hat nicht gespielt`}
                                            onChange={(e) => setStatField(match._id, r.key, "didNotPlay", e.target.checked)}
                                            className="h-4 w-4 accent-brand-500"
                                          />
                                        </label>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button
                              onClick={() => saveStats(match._id)}
                              disabled={savingStatsId === match._id}
                              className="px-5"
                            >
                              {savingStatsId === match._id ? "Speichern…" : "Statistiken speichern"}
                            </Button>
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
