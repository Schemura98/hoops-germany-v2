"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";

const inputClass =
  "w-24 rounded-sm border border-ink-600 px-3 py-2 text-center text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

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
    return <AdminShell title="Spiel bearbeiten"><p className="text-mist-400">Lädt…</p></AdminShell>;
  }
  if (state === "notfound") {
    return (
      <AdminShell title="Spiel bearbeiten">
        <p className="text-mist-400">Spiel nicht gefunden.</p>
        <Link href="/admin/matches" className="mt-4 inline-block text-brand-400 hover:underline">
          Zurück zur Spieleliste
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Spiel bearbeiten">
      <div className="max-w-lg bg-ink-800 rounded-md border border-ink-600 p-6">
        <p className="text-lg font-semibold text-paper-50">
          {match.teamA?.teamName} <span className="text-mist-400">vs</span> {match.teamB?.teamName}
        </p>

        {msg && (
          <div
            className={`mt-4 rounded-sm border px-4 py-3 text-sm ${
              msg.type === "ok"
                ? "bg-signal-ok/10 border-signal-ok/50 text-signal-ok"
                : "bg-signal-error/10 border-signal-error/50 text-signal-error"
            }`}
          >
            {msg.text}
          </div>
        )}

        {match.resultStatus === "mismatch" && (
          <div className="mt-4 rounded-sm border border-signal-error/50 bg-signal-error/10 p-4">
            <p className="text-sm font-semibold text-signal-error">
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
                    <span className="text-sm text-mist-300">
                      <strong>{r.label}</strong> meldet{" "}
                      <span className="font-semibold text-paper-50">
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
                      className="text-xs border border-signal-error/50 hover:border-signal-error text-signal-error rounded-sm px-3 py-1"
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
          <label className="block text-sm font-medium text-mist-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-sm border border-ink-600 px-4 py-2.5 text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="scheduled">Geplant (Ergebnis zurücksetzen)</option>
            <option value="completed">Beendet (Ergebnis setzen)</option>
            <option value="cancelled">Abgesagt</option>
          </select>
        </div>

        {status === "completed" && (
          <div className="mt-4 flex items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-mist-400 mb-1">
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
            <span className="pb-2 text-mist-400 font-semibold">:</span>
            <div>
              <label className="block text-xs font-medium text-mist-400 mb-1">
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
            className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-ink-950 rounded-sm px-6 py-2.5 font-medium"
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
          <Link
            href="/admin/matches"
            className="border border-ink-600 hover:border-brand-500 text-mist-300 rounded-sm px-6 py-2.5 font-medium"
          >
            Abbrechen
          </Link>
        </div>
      </div>

      {/* Änderungsverlauf (Audit-Log) */}
      <div className="max-w-lg mt-6 bg-ink-800 rounded-md border border-ink-600 p-6">
        <h2 className="text-sm font-semibold text-paper-50 mb-3">Änderungsverlauf</h2>
        {audit.length === 0 ? (
          <p className="text-sm text-mist-400">Noch keine protokollierten Änderungen.</p>
        ) : (
          <ul className="space-y-3">
            {audit.map((a) => (
              <li key={a._id} className="flex gap-3 text-sm">
                <span
                  className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${
                    a.actorRole === "super_admin" ? "bg-signal-wait" : "bg-brand-500"
                  }`}
                />
                <div>
                  <p className="text-paper-50">{a.summary}</p>
                  <p className="text-xs text-mist-400">
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
