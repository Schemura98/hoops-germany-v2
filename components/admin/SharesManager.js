"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PiLinkBold, PiCopyBold, PiCheckBold, PiTrashBold, PiPlusBold } from "react-icons/pi";
import { getAdminToken } from "@/lib/clientAuth";

// Verwaltung teilbarer, passwortgeschützter Sponsor-Report-Links.
export default function SharesManager() {
  const [shares, setShares] = useState([]);
  const [label, setLabel] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, []);

  async function load() {
    try {
      const { data } = await axios.post("/api/analytics/shares", { token: getAdminToken(), action: "list" });
      setShares(data.shares || []);
    } catch {
      /* ignorieren */
    }
  }

  async function create(e) {
    e.preventDefault();
    if (!password || password.length < 4) {
      setMsg({ type: "err", text: "Passwort muss mindestens 4 Zeichen haben." });
      return;
    }
    setCreating(true);
    setMsg(null);
    try {
      await axios.post("/api/analytics/shares", { token: getAdminToken(), action: "create", label, password });
      setLabel("");
      setPassword("");
      setMsg({ type: "ok", text: "Link erstellt. Passwort separat an den Sponsor weitergeben." });
      load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Erstellen fehlgeschlagen." });
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id) {
    if (!window.confirm("Diesen Link deaktivieren? Er funktioniert danach nicht mehr.")) return;
    try {
      await axios.post("/api/analytics/shares", { token: getAdminToken(), action: "revoke", id });
      load();
    } catch {
      /* ignorieren */
    }
  }

  function copy(token, id) {
    const url = `${origin}/sponsor-report/${token}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex flex-col sm:flex-row gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Bezeichnung (z.B. Autohaus Müller)"
          className="flex-1 rounded-sm border border-navy-600 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort (min. 4 Zeichen)"
          className="sm:w-52 rounded-sm border border-navy-600 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 font-semibold rounded-sm px-4 py-2 text-sm whitespace-nowrap"
        >
          <PiPlusBold className="text-xs" /> Link erstellen
        </button>
      </form>
      {msg && (
        <p className={`text-xs ${msg.type === "ok" ? "text-signal-ok" : "text-signal-error"}`}>{msg.text}</p>
      )}

      {shares.length === 0 ? (
        <p className="text-sm text-mist-400">Noch keine teilbaren Links.</p>
      ) : (
        <ul className="divide-y divide-navy-600 border border-navy-600 rounded-md">
          {shares.map((s) => (
            <li key={s._id} className="flex items-center gap-3 px-4 py-2.5">
              <PiLinkBold className={`flex-shrink-0 text-sm ${s.active ? "text-brand-400" : "text-navy-500"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-paper-50 truncate">
                  {s.label || "Ohne Bezeichnung"}
                  {!s.active && <span className="ml-2 text-xs text-signal-error">(deaktiviert)</span>}
                </p>
                <p className="text-xs text-mist-400 truncate">/sponsor-report/{s.token}</p>
              </div>
              {s.active && (
                <>
                  <button
                    onClick={() => copy(s.token, s._id)}
                    title="Link kopieren"
                    className="text-mist-400 hover:text-brand-400 p-1.5"
                  >
                    {copiedId === s._id ? <PiCheckBold className="text-signal-ok text-sm" /> : <PiCopyBold className="text-sm" />}
                  </button>
                  <button onClick={() => revoke(s._id)} title="Deaktivieren" className="text-mist-400 hover:text-signal-error p-1.5">
                    <PiTrashBold className="text-sm" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-mist-400">
        Der Link zeigt nur aggregierte Zahlen (keine personenbezogenen Daten). Passwort separat (nicht per
        selbem Kanal) an den Sponsor weitergeben.
      </p>
    </div>
  );
}
