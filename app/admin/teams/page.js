"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiTrashBold, PiCheckBold, PiXBold, PiUserGearBold, PiFlaskBold } from "react-icons/pi";
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

  // Interner Testaccount: real angelegt, aber von uns selbst – zaehlt nicht in
  // Beteiligungszahlen (siehe lib/echteZahlen.js).
  async function toggleIntern(t) {
    setBusyId(t._id);
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/admin/set-internal", {
        token,
        art: "team",
        id: t._id,
        isInternal: !t.isInternal,
      });
      setTeams((list) =>
        list.map((x) => (x._id === t._id ? { ...x, isInternal: data.isInternal } : x))
      );
    } catch {
      /* Fehler bleibt sichtbar durch unveraenderten Zustand */
    } finally {
      setBusyId(null);
    }
  }

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

  // Team-Admin verwalten (Übertragung)
  const [manage, setManage] = useState(null); // { teamId, teamName, members, currentAdminId }
  const [selPlayer, setSelPlayer] = useState("");
  const [mMsg, setMMsg] = useState(null);
  const [mBusy, setMBusy] = useState(false);

  async function openManage(teamId) {
    setMMsg(null);
    setSelPlayer("");
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/admin/team-members", { token, teamId });
      setManage({ teamId, teamName: data.teamName, members: data.members || [], currentAdminId: data.currentAdminId });
    } catch {
      setManage({ teamId, members: [], error: true });
    }
  }

  async function transferAdmin() {
    if (!selPlayer) return;
    setMBusy(true);
    setMMsg(null);
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/admin/transfer-team-admin", {
        token,
        teamId: manage.teamId,
        playerId: selPlayer,
      });
      setMMsg({ type: "ok", text: data.message || "Übertragen." });
      await openManage(manage.teamId); // Liste aktualisieren
    } catch (err) {
      setMMsg({ type: "err", text: err.response?.data?.message || "Übertragung fehlgeschlagen." });
    } finally {
      setMBusy(false);
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
        className="mb-4 w-full sm:w-80 rounded-sm border border-navy-600 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />

      {!loading && pending.length > 0 && (
        <div className="mb-6 bg-signal-wait/10 border border-signal-wait/50 rounded-md p-4">
          <h2 className="text-sm font-bold text-signal-wait mb-3">
            Wartet auf Freigabe ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between gap-3 bg-navy-800 rounded-md border border-signal-wait/40 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-paper-50 truncate">{t.teamName}</p>
                  <p className="text-xs text-mist-400 truncate">
                    {adminName(t) ? `Haupt-Admin: ${adminName(t)}` : "—"}
                    {t.region ? ` · ${t.region}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decide(t._id, t.teamName, true)}
                    disabled={busyId === t._id}
                    className="inline-flex items-center gap-1.5 bg-signal-ok hover:brightness-110 disabled:opacity-60 text-paper-50 rounded-sm px-3 py-1.5 text-sm font-medium"
                  >
                    <PiCheckBold className="text-xs" /> Freigeben
                  </button>
                  <button
                    onClick={() => decide(t._id, t.teamName, false)}
                    disabled={busyId === t._id}
                    className="inline-flex items-center gap-1.5 border border-navy-600 hover:border-signal-error hover:text-signal-error text-mist-400 rounded-sm px-3 py-1.5 text-sm font-medium"
                  >
                    <PiXBold className="text-xs" /> Ablehnen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : (
        <div className="bg-navy-800 rounded-md border border-navy-600 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-mist-400 text-left border-b border-navy-600">
                <th className="font-medium py-3 pl-4">Team</th>
                <th className="font-medium py-3">E-Mail</th>
                <th className="font-medium py-3">Region</th>
                <th className="font-medium py-3 pr-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-b border-navy-600 last:border-0">
                  <td className="py-3 pl-4">
                    <Link
                      href={`/team/team-detail/${t.slug}`}
                      className="font-medium text-paper-50 hover:text-brand-400"
                    >
                      {t.teamName}
                    </Link>
                    {t.approved === false && (
                      <span className="ml-2 text-[11px] font-medium rounded-sm px-2 py-0.5 bg-signal-wait/15 text-signal-wait">
                        in Prüfung
                      </span>
                    )}
                    {t.isDemo && (
                      <span className="ml-2 text-[11px] font-medium rounded-sm px-2 py-0.5 bg-navy-700 text-mist-400">
                        Beispieldaten
                      </span>
                    )}
                    {t.isInternal && (
                      <span className="ml-2 text-[11px] font-medium rounded-sm px-2 py-0.5 bg-navy-700 text-mist-300">
                        intern
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-mist-400">{t.email}</td>
                  <td className="py-3 text-mist-400">{t.region || "—"}</td>
                  <td className="py-3 pr-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleIntern(t)}
                      disabled={busyId === t._id}
                      className={`p-1.5 disabled:opacity-60 ${
                        t.isInternal ? "text-mist-300" : "text-mist-400 hover:text-mist-300"
                      }`}
                      title={
                        t.isInternal
                          ? "Interner Testaccount – aus Beteiligungszahlen ausgenommen. Klicken, um die Markierung aufzuheben."
                          : "Als internen Testaccount markieren (zählt dann nicht in Beteiligungszahlen)"
                      }
                      aria-label={
                        t.isInternal
                          ? `${t.teamName}: Markierung als interner Testaccount aufheben`
                          : `${t.teamName} als internen Testaccount markieren`
                      }
                      aria-pressed={!!t.isInternal}
                    >
                      <PiFlaskBold />
                    </button>
                    <button
                      onClick={() => openManage(t._id)}
                      className="text-mist-400 hover:text-brand-400 p-1.5"
                      title="Team-Admin verwalten"
                    >
                      <PiUserGearBold />
                    </button>
                    <button
                      onClick={() => remove(t._id, t.teamName)}
                      disabled={busyId === t._id}
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
            <p className="px-4 py-8 text-center text-sm text-mist-400">Keine Teams gefunden.</p>
          )}
        </div>
      )}

      {/* Team-Admin verwalten (Übertragung) */}
      {manage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setManage(null)}>
          <div className="w-full max-w-md bg-navy-800 rounded-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-bold text-paper-50">
                Team-Admin verwalten{manage.teamName ? ` · ${manage.teamName}` : ""}
              </h2>
              <button onClick={() => setManage(null)} className="text-mist-400 hover:text-mist-300 p-1">
                <PiXBold />
              </button>
            </div>

            {manage.error ? (
              <p className="mt-4 text-sm text-signal-error">Mitglieder konnten nicht geladen werden.</p>
            ) : manage.members.length === 0 ? (
              <p className="mt-4 text-sm text-mist-400">Dieses Team hat keine Mitglieder mit Konto.</p>
            ) : (
              <>
                <p className="mt-3 text-sm text-mist-400">
                  Aktueller Admin:{" "}
                  <span className="font-medium text-paper-50">
                    {manage.members.find((m) => m.id === manage.currentAdminId)?.name || "—"}
                  </span>
                </p>
                <label className="block text-sm font-medium text-mist-300 mt-4 mb-1">
                  Neuen Team-Admin wählen
                </label>
                <select
                  value={selPlayer}
                  onChange={(e) => setSelPlayer(e.target.value)}
                  className="w-full rounded-sm border border-navy-600 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                >
                  <option value="">– Mitglied auswählen –</option>
                  {manage.members.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.id === manage.currentAdminId}>
                      {m.name}
                      {m.id === manage.currentAdminId ? " (aktueller Admin)" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-mist-400">
                  Der bisherige Admin wird zu einem normalen Mitglied. Der neue Admin wird benachrichtigt.
                </p>
                {mMsg && (
                  <p className={`mt-2 text-sm ${mMsg.type === "ok" ? "text-signal-ok" : "text-signal-error"}`}>
                    {mMsg.text}
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setManage(null)}
                    className="border border-navy-600 hover:border-navy-500 text-mist-300 rounded-sm px-4 py-2 text-sm font-medium"
                  >
                    Schließen
                  </button>
                  <button
                    onClick={transferAdmin}
                    disabled={!selPlayer || mBusy}
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-4 py-2 text-sm font-medium"
                  >
                    <PiUserGearBold className="text-xs" /> Als Admin übertragen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
