"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const token = getAdminToken();
    const { data } = await axios.post("/api/admin/fetchallteams", { token });
    setTeams(data.teams || []);
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

  async function remove(id, name) {
    if (!window.confirm(`Team „${name}" wirklich löschen?`)) return;
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/deleteteam", { token, teamId: id });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  async function decide(id, name, approve) {
    if (!approve && !window.confirm(`Team „${name}" ablehnen? Es wird dabei entfernt.`)) return;
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/approve-team", { token, teamId: id, approve });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  const pending = teams.filter((t) => t.approved === false);
  const adminName = (t) =>
    t.adminPlayerId ? `${t.adminPlayerId.firstName || ""} ${t.adminPlayerId.lastName || ""}`.trim() : "";

  const filtered = teams.filter((t) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.teamName?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q);
  });

  return (
    <AdminShell title="Teams verwalten">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Suche nach Name oder E-Mail…"
        className="mb-4 w-full sm:w-80 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      {!loading && pending.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h2 className="text-sm font-bold text-amber-800 mb-3">
            Wartet auf Freigabe ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between gap-3 bg-white rounded-xl border border-amber-100 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{t.teamName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {adminName(t) ? `Gründer: ${adminName(t)}` : "—"}
                    {t.region ? ` · ${t.region}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decide(t._id, t.teamName, true)}
                    disabled={busyId === t._id}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-sm font-medium"
                  >
                    <FaCheck className="text-xs" /> Freigeben
                  </button>
                  <button
                    onClick={() => decide(t._id, t.teamName, false)}
                    disabled={busyId === t._id}
                    className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium"
                  >
                    <FaTimes className="text-xs" /> Ablehnen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Lädt…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 text-left border-b border-gray-100">
                <th className="font-medium py-3 pl-4">Team</th>
                <th className="font-medium py-3">E-Mail</th>
                <th className="font-medium py-3">Region</th>
                <th className="font-medium py-3 pr-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pl-4">
                    <Link
                      href={`/team/team-detail/${t.slug}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {t.teamName}
                    </Link>
                    {t.approved === false && (
                      <span className="ml-2 text-[11px] font-medium rounded-full px-2 py-0.5 bg-amber-100 text-amber-700">
                        in Prüfung
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-600">{t.email}</td>
                  <td className="py-3 text-gray-600">{t.region || "—"}</td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => remove(t._id, t.teamName)}
                      disabled={busyId === t._id}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-60 p-1.5"
                      title="Löschen"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">Keine Teams gefunden.</p>
          )}
        </div>
      )}
    </AdminShell>
  );
}
