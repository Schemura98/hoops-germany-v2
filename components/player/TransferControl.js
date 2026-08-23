"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiArrowsLeftRightBold, PiArrowRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import { LEAGUE_LEVELS } from "@/lib/constants";
import { inputClassSm } from "@/lib/ui";
import Button from "@/components/ui/Button";

// Transfer-Status & -Infos im eigenen Profil verwalten.
//
// Seit dem 23.08.2026 sitzt dieser Kasten im STECKBRIEF-Reiter des eigenen
// Profils statt unterhalb der Reiter (Befund Patrick: Er stand unter allen
// drei Reitern und las sich wie dreimal dieselbe Funktion). Der Steckbrief
// ist der thematische Ort – dort stehen Position und bevorzugte Liga.
//
// ⚠️ Die Eingabefelder nutzen das echte inputClassSm-Token: Die frühere
// lokale Klassen-Kopie hatte KEINE Flächenfarbe – Felder Nr. 14 und 15 der
// grauen Familie aus e9a8ef3 (Browser-Grau rgb(59,59,59)).
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
    <div className="bg-navy-800 rounded-md border border-navy-600 p-6">
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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:bg-navy-600 disabled:text-mist-300 ${
            available ? "bg-brand-500" : "bg-navy-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-navy-800 transition-transform ${
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
              className={inputClassSm}
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
              className={`${inputClassSm} resize-none`}
              placeholder="Worauf legst du Wert? Verfügbarkeit, Region…"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => save(true)} disabled={saving} size="sm" className="px-5">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
          </div>

          {/* Der Weiterweg (Ronja M3): Nach dem Umschalten auf „verfügbar" war
              hier Schluss – kein „so sehen dich Vereine", kein Weg zu offenen
              Probetrainings. Für Vereinslose (Z3) ist genau das der nächste
              Schritt; bedient im Produkt statt über einen eigenen Kanal
              (Zielgruppen-Entscheid). */}
          <div className="mt-1 border-t border-navy-600 pt-3 space-y-1.5">
            <p className="text-xs text-mist-400">Und so geht es weiter:</p>
            <p className="text-sm">
              <Link
                href="/transfermarkt"
                className="inline-flex items-center gap-1.5 text-paper-50 hover:text-brand-400"
              >
                So sehen dich Vereine – zum Transfermarkt{" "}
                <PiArrowRightBold className="text-xs" />
              </Link>
            </p>
            <p className="text-sm">
              <Link
                href="/tryouts"
                className="inline-flex items-center gap-1.5 text-paper-50 hover:text-brand-400"
              >
                Offene Probetrainings ansehen <PiArrowRightBold className="text-xs" />
              </Link>
            </p>
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
