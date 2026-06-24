"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaTrash, FaUsers, FaPlus } from "react-icons/fa";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";
import { BUNDESLAENDER } from "@/lib/constants";

const inputClass =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const EMPTY_NEW = { name: "", season: "", bundesland: "" };

export default function AdminLeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [edits, setEdits] = useState({}); // { [id]: { name, season, bundesland } }
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [newLeague, setNewLeague] = useState(EMPTY_NEW);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const token = getAdminToken();
    const { data } = await axios.post("/api/admin/leagues", { token });
    const list = data.leagues || [];
    setLeagues(list);
    const e = {};
    for (const l of list)
      e[l._id] = { name: l.name, season: l.season || "", bundesland: l.bundesland || "" };
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
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Neue Liga erstellen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Neue Liga erstellen</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              value={newLeague.name}
              onChange={(e) => setNewLeague((l) => ({ ...l, name: e.target.value }))}
              className={`${inputClass} w-full`}
              placeholder="z.B. Regionalliga Süd"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Saison</label>
            <input
              value={newLeague.season}
              onChange={(e) => setNewLeague((l) => ({ ...l, season: e.target.value }))}
              className={`${inputClass} w-full`}
              placeholder="2025/26"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">Bundesland</label>
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
          <button
            onClick={createLeague}
            disabled={creating || !newLeague.name.trim()}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium"
          >
            <FaPlus className="text-xs" /> {creating ? "…" : "Erstellen"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Lädt…</p>
      ) : leagues.length === 0 ? (
        <p className="text-gray-500">Keine Ligen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {leagues.map((l) => (
            <div
              key={l._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-end gap-3"
            >
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  value={edits[l._id]?.name || ""}
                  onChange={(e) => setField(l._id, "name", e.target.value)}
                  className={`${inputClass} w-full`}
                />
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-gray-600 mb-1">Saison</label>
                <input
                  value={edits[l._id]?.season || ""}
                  onChange={(e) => setField(l._id, "season", e.target.value)}
                  className={`${inputClass} w-full`}
                />
              </div>
              <div className="w-44">
                <label className="block text-xs font-medium text-gray-600 mb-1">Bundesland</label>
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
              <Link
                href={`/ligen/${l._id}`}
                className="text-xs text-gray-500 hover:text-brand-600 inline-flex items-center gap-1 pb-2"
              >
                <FaUsers /> {l.teamCount}
              </Link>

              <button
                onClick={() => toggleActive(l)}
                disabled={busyId === l._id}
                className={`text-xs rounded-lg px-3 py-2 font-medium disabled:opacity-60 ${
                  l.active
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {l.active ? "Aktiv" : "Inaktiv"}
              </button>
              <button
                onClick={() => save(l._id)}
                disabled={busyId === l._id}
                className="text-xs bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 font-medium"
              >
                Speichern
              </button>
              <button
                onClick={() => remove(l._id, l.name)}
                disabled={busyId === l._id}
                className="text-gray-400 hover:text-red-600 disabled:opacity-60 p-2"
                title="Löschen"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
