"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrashBold, PiXBold, PiFlaskBold } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState({}); // { [playerId]: teamId }

  const load = useCallback(async () => {
    const token = getAdminToken();
    const [pRes, tRes] = await Promise.all([
      axios.post("/api/admin/fetchallplayers", { token }),
      axios.post("/api/admin/fetchallteams", { token }),
    ]);
    setPlayers(pRes.data.players || []);
    setTeams(tRes.data.teams || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  // Internes Testkonto: real angelegt, aber uns selbst gehoerend - zaehlt nicht
  // in Beteiligungszahlen (siehe lib/echteZahlen.js).
  async function toggleIntern(p) {
    setBusyId(p._id);
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/admin/set-internal", {
        token,
        art: "spieler",
        id: p._id,
        isInternal: !p.isInternal,
      });
      setPlayers((list) =>
        list.map((x) => (x._id === p._id ? { ...x, isInternal: data.isInternal } : x))
      );
    } catch {
      /* Fehler bleibt sichtbar durch unveraenderten Zustand */
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`Spieler „${name}" wirklich löschen? Beiträge werden mit entfernt.`)) return;
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/deleteplayer", { token, playerId: id });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  async function assignAdmin(playerId) {
    const teamId = picked[playerId];
    if (!teamId) return;
    setBusyId(playerId);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/setteamadmin", { token, playerId, teamId });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  async function removeAdmin(playerId) {
    setBusyId(playerId);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/setteamadmin", { token, playerId, remove: true });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  const filtered = players.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell title="Spieler verwalten">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suche nach Name oder E-Mail…"
        className="mb-4 w-full sm:w-80 rounded-sm border border-navy-600 bg-navy-700 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder:text-mist-400"
      />

      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : (
        <div className="bg-navy-800 rounded-md border border-navy-600 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-mist-400 text-left border-b border-navy-600">
                <th className="font-medium py-3 pl-4">Name</th>
                <th className="font-medium py-3">E-Mail</th>
                <th className="font-medium py-3">Team-Admin</th>
                <th className="font-medium py-3 pr-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b border-navy-600 last:border-0 align-top">
                  <td className="py-3 pl-4">
                    <Link
                      href={`/player/view-player/${p.slug || p._id}`}
                      className="font-medium text-paper-50 hover:text-brand-400"
                    >
                      {p.firstName} {p.lastName}
                    </Link>
                    {p.isSuperAdmin && (
                      <span className="ml-2 text-xs bg-navy-900 text-paper-50 rounded-sm px-2 py-0.5">
                        Admin
                      </span>
                    )}
                    {p.isDemo && (
                      <span className="ml-2 text-[11px] font-medium rounded-sm px-2 py-0.5 bg-navy-700 text-mist-400">
                        Beispieldaten
                      </span>
                    )}
                    {p.isInternal && (
                      <span className="ml-2 text-[11px] font-medium rounded-sm px-2 py-0.5 bg-navy-700 text-mist-300">
                        intern
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-mist-400">{p.email}</td>
                  <td className="py-3">
                    {p.isTeamAdmin && p.teamAdminOf ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs font-medium bg-brand-500/15 text-brand-400 rounded-sm px-2 py-0.5">
                          {p.teamAdminOf.teamName}
                        </span>
                        <button
                          onClick={() => removeAdmin(p._id)}
                          disabled={busyId === p._id}
                          className="text-mist-400 hover:text-signal-error disabled:opacity-60"
                          title="Rechte entfernen"
                        >
                          <PiXBold className="text-xs" />
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <select
                          value={picked[p._id] || ""}
                          onChange={(e) =>
                            setPicked((s) => ({ ...s, [p._id]: e.target.value }))
                          }
                          className="rounded-sm border border-navy-600 bg-navy-700 px-2 py-1 text-xs outline-none focus:border-brand-500 placeholder:text-mist-400"
                        >
                          <option value="">Team wählen…</option>
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.teamName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignAdmin(p._id)}
                          disabled={busyId === p._id || !picked[p._id]}
                          className="text-xs bg-brand-500 hover:bg-brand-400 disabled:bg-navy-600 disabled:text-mist-300 text-navy-950 rounded-sm px-3 py-1 font-medium"
                        >
                          Setzen
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleIntern(p)}
                      disabled={busyId === p._id}
                      className={`p-1.5 disabled:opacity-60 ${
                        p.isInternal ? "text-mist-300" : "text-mist-400 hover:text-mist-300"
                      }`}
                      title={
                        p.isInternal
                          ? "Internes Testkonto – aus Beteiligungszahlen ausgenommen. Klicken, um die Markierung aufzuheben."
                          : "Als internes Testkonto markieren (zählt dann nicht in Beteiligungszahlen)"
                      }
                      aria-label={
                        p.isInternal
                          ? `${p.firstName} ${p.lastName}: Markierung als internes Testkonto aufheben`
                          : `${p.firstName} ${p.lastName} als internes Testkonto markieren`
                      }
                      aria-pressed={!!p.isInternal}
                    >
                      <PiFlaskBold />
                    </button>
                    <button
                      onClick={() => remove(p._id, `${p.firstName} ${p.lastName}`)}
                      disabled={busyId === p._id}
                      className="text-mist-400 hover:text-signal-error disabled:opacity-60 p-1.5"
                      title="Löschen"
                    >
                      <PiTrashBold />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-mist-400">Keine Spieler gefunden.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
