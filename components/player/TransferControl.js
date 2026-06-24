"use client";

import { useState } from "react";
import axios from "axios";
import { FaExchangeAlt } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import { LEAGUE_LEVELS } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FaExchangeAlt className="text-brand-500" /> Transfermarkt
        </h2>
        {/* Verfügbarkeits-Schalter */}
        <button
          onClick={toggle}
          disabled={saving}
          role="switch"
          aria-checked={available}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-60 ${
            available ? "bg-brand-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              available ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {available
          ? "Du bist als transferbereit gelistet und erscheinst im Transfermarkt."
          : "Aktiviere den Schalter, um dich als transferbereit zu listen."}
      </p>

      {available && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium"
            >
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p
          className={`mt-3 text-sm ${
            msg.type === "ok" ? "text-green-600" : "text-red-600"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
