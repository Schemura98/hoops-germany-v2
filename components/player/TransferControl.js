"use client";

import { useState } from "react";
import axios from "axios";
import { PiArrowsLeftRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import { LEAGUE_LEVELS } from "@/lib/constants";

const inputClass =
  "w-full rounded-sm border border-ink-600 px-3 py-2 text-sm text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Transfer-Status & -Infos im eigenen Profil verwalten.
export default function TransferControl({ player }) {
  const [available, setAvailable] = useState(
    player?.transferStatus === "verfuegbar"
  );
  const [league, setLeague] = useState(player?.preferredLeague || "");
  const [note, setNote] = useState(player?.transferNote || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function save(nextAvailable) {
    setSaving(true);
    setMsg(null);
    try {
      const token = getPlayerToken();
      await axios.post("/api/player/update-transfer", {
        token,
        transferStatus: nextAvailable ? "verfuegbar" : "nicht_verfuegbar",
        preferredLeague: league,
        transferNote: note,
      });
      setMsg({ type: "ok", text: "Transfer-Status gespeichert." });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Speichern fehlgeschlagen." });
    } finally {
      setSaving(false);
    }
  }

  function toggle() {
    const next = !available;
    setAvailable(next);
    save(next);
  }

  return (
    <div className="bg-ink-800 rounded-md border border-ink-600 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-paper-50 flex items-center gap-2">
          <PiArrowsLeftRightBold className="text-brand-400" /> Transfermarkt
        </h2>
        {/* Verfügbarkeits-Schalter */}
        <button
          onClick={toggle}
          disabled={saving}
          role="switch"
          aria-checked={available}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
            available ? "bg-brand-500" : "bg-ink-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-ink-800 transition-transform ${
              available ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <p className="mt-1 text-xs text-mist-400">
        {available
          ? "Du bist als transferbereit gelistet und erscheinst im Transfermarkt."
          : "Aktiviere den Schalter, um dich als transferbereit zu listen."}
      </p>

      {available && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">
              Bevorzugte Spielklasse
            </label>
            <select
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              className={inputClass}
            >
              <option value="">– keine Angabe –</option>
              {LEAGUE_LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-mist-400 mb-1">
              Notiz
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Worauf legst du Wert? Verfügbarkeit, Region…"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-ink-950 rounded-sm px-5 py-2 text-sm font-medium"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p
          className={`mt-3 text-sm ${
            msg.type === "ok" ? "text-signal-ok" : "text-signal-error"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
