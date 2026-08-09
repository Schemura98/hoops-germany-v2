"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

const inputClass =
  "w-24 rounded-lg border border-gray-300 px-3 py-2 text-center text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function AdminUpdateMatchPage({ params }) {
  const id = params["match-id"];
  const router = useRouter();

  const [match, setMatch] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | notfound
  const [status, setStatus] = useState("completed");
  const [aPts, setAPts] = useState("");
  const [bPts, setBPts] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [audit, setAudit] = useState([]);

  async function loadAudit() {
    try {
      const token = getAdminToken();
      const { data } = await axios.post("/api/admin/match-audit", { token, matchId: id });
      setAudit(data.audit || []);
    } catch {
      /* still */
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get(`/api/match/${id}`);
        if (!active) return;
        const m = data.match;
        setMatch(m);
        setStatus(m.status || "scheduled");
        if (m.teamAResult?.ownPoints != null) setAPts(String(m.teamAResult.ownPoints));
        if (m.teamBResult?.ownPoints != null) setBPts(String(m.teamBResult.ownPoints));
        setState("ready");
        loadAudit();
      } catch {
        if (active) setState("notfound");
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const token = getAdminToken();
      await axios.post("/api/admin/updatematch", {
        token,
        matchId: id,
        status,
        teamAPoints: aPts,
        teamBPoints: bPts,
      });
      setMsg({ type: "ok", text: "Gespeichert." });
      loadAudit();
      setTimeout(() => router.push("/admin/matches"), 1200);
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Speichern fehlgeschlagen." });
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <AdminShell title="Spiel bearbeiten"><p className="text-gray-500">Lädt…</p></AdminShell>;
  }
  if (state === "notfound") {
    return (
      <AdminShell title="Spiel bearbeiten">
        <p className="text-gray-500">Spiel nicht gefunden.</p>
        <Link href="/admin/matches" className="mt-4 inline-block text-brand-600 hover:underline">
          Zurück zur Spieleliste
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Spiel bearbeiten">
      <div className="max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-lg font-semibold text-gray-900">
          {match.teamA?.teamName} <span className="text-gray-500">vs</span> {match.teamB?.teamName}
        </p>

        {msg && (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {match.resultStatus === "mismatch" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Widersprüchliche Meldungen – bitte richtiges Ergebnis festlegen
            </p>
            <div className="mt-3 space-y-2">
              {[
                {
                  label: match.teamA?.teamName,
                  a: match.teamAResult?.ownPoints,
                  b: match.teamAResult?.opponentPoints,
                },
                {
                  label: match.teamB?.teamName,
                  a: match.teamBResult?.opponentPoints,
                  b: match.teamBResult?.ownPoints,
                },
              ].map((r, i) =>
                r.a != null && r.b != null ? (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700">
                      <strong>{r.label}</strong> meldet{" "}
                      <span className="font-semibold text-gray-900">
                        {r.a} : {r.b}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("completed");
                        setAPts(String(r.a));
                        setBPts(String(r.b));
                      }}
                      className="text-xs border border-red-300 hover:border-red-500 text-red-700 rounded-lg px-3 py-1"
                    >
                      Übernehmen
                    </button>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="scheduled">Geplant (Ergebnis zurücksetzen)</option>
            <option value="completed">Beendet (Ergebnis setzen)</option>
            <option value="cancelled">Abgesagt</option>
          </select>
        </div>

        {status === "completed" && (
          <div className="mt-4 flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {match.teamA?.teamName}
              </label>
              <input
                type="number"
                min="0"
                value={aPts}
                onChange={(e) => setAPts(e.target.value)}
                className={inputClass}
              />
            </div>
            <span className="pb-2 text-gray-500 font-semibold">:</span>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {match.teamB?.teamName}
              </label>
              <input
                type="number"
                min="0"
                value={bPts}
                onChange={(e) => setBPts(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-6 py-2.5 font-medium"
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
          <Link
            href="/admin/matches"
            className="border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-6 py-2.5 font-medium"
          >
            Abbrechen
          </Link>
        </div>
      </div>

      {/* Änderungsverlauf (Audit-Log) */}
      <div className="max-w-lg mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Änderungsverlauf</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine protokollierten Änderungen.</p>
        ) : (
          <ul className="space-y-3">
            {audit.map((a) => (
              <li key={a._id} className="flex gap-3 text-sm">
                <span
                  className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                    a.actorRole === "super_admin" ? "bg-amber-500" : "bg-brand-500"
                  }`}
                />
                <div>
                  <p className="text-gray-800">{a.summary}</p>
                  <p className="text-xs text-gray-500">
                    {a.actorName}
                    {a.actorRole === "super_admin" ? " (Super-Admin)" : ""} ·{" "}
                    {new Date(a.createdAt).toLocaleString("de-DE")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
