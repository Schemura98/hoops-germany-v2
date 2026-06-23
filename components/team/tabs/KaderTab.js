"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaTrash,
  FaCopy,
  FaCheck,
  FaEnvelope,
  FaUserCheck,
} from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { POSITIONS } from "@/lib/constants";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const STATUS_BADGE = {
  empty: { label: "Frei", cls: "bg-gray-100 text-gray-600" },
  pending: { label: "Ausstehend", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Bestätigt", cls: "bg-green-100 text-green-700" },
};

export default function KaderTab({ team, reload }) {
  const slots = team?.rosterSlots || [];

  const [origin, setOrigin] = useState("");
  const [msg, setMsg] = useState(null); // { type, text }

  // Slot hinzufügen
  const [showAdd, setShowAdd] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: "", position: "", number: "" });
  const [adding, setAdding] = useState(false);

  // Pro-Slot UI-State
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [inviteOpenId, setInviteOpenId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function flash(type, text) {
    setMsg({ type, text });
  }

  async function addSlot(e) {
    e.preventDefault();
    if (!newSlot.name.trim()) return;
    setAdding(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/add-slot", { token, ...newSlot });
      setNewSlot({ name: "", position: "", number: "" });
      setShowAdd(false);
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Slot konnte nicht angelegt werden.");
    } finally {
      setAdding(false);
    }
  }

  async function removeSlot(slotId) {
    if (!window.confirm("Diesen Slot wirklich entfernen?")) return;
    setBusyId(slotId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/remove-slot", { token, slotId });
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Slot konnte nicht entfernt werden.");
    } finally {
      setBusyId(null);
    }
  }

  async function approveClaim(slotId) {
    setBusyId(slotId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      await axios.post("/api/team/roster/approve-claim", { token, slotId });
      flash("ok", "Anspruch bestätigt.");
      reload?.();
    } catch (err) {
      flash("err", err.response?.data?.message || "Bestätigung fehlgeschlagen.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyClaim(slot) {
    const link = `${origin}/team/claim/${slot.claimToken}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(slot._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* Clipboard nicht verfügbar */
    }
  }

  async function sendInvite(slotId) {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/roster/send-invite-email", {
        token,
        slotId,
        email: inviteEmail,
      });
      flash("ok", data.message || "Einladung gesendet.");
      setInviteOpenId(null);
      setInviteEmail("");
    } catch (err) {
      flash("err", err.response?.data?.message || "E-Mail konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Kader <span className="text-sm font-normal text-gray-500">· {slots.length} Slots</span>
        </h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          <FaPlus className="text-xs" /> Slot hinzufügen
        </button>
      </div>

      {msg && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.type === "ok"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Formular: Slot hinzufügen */}
      {showAdd && (
        <form
          onSubmit={addSlot}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid sm:grid-cols-[1fr_140px_90px_auto] gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              autoFocus
              value={newSlot.name}
              onChange={(e) => setNewSlot((s) => ({ ...s, name: e.target.value }))}
              className={inputClass}
              placeholder="Spielername"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
            <select
              value={newSlot.position}
              onChange={(e) => setNewSlot((s) => ({ ...s, position: e.target.value }))}
              className={inputClass}
            >
              <option value="">–</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nr.</label>
            <input
              value={newSlot.number}
              onChange={(e) => setNewSlot((s) => ({ ...s, number: e.target.value }))}
              className={inputClass}
              placeholder="#"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newSlot.name.trim()}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium h-[38px]"
          >
            {adding ? "…" : "Anlegen"}
          </button>
        </form>
      )}

      {/* Slot-Liste */}
      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Noch keine Kader-Slots. Lege Slots an, um Spieler einzuladen.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {slots.map((slot) => {
            const badge = STATUS_BADGE[slot.status] || STATUS_BADGE.empty;
            const isBusy = busyId === slot._id;
            return (
              <div key={slot._id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-9 w-9 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center">
                      {slot.number || "–"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {slot.name || "Unbenannter Slot"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {slot.position || "Position offen"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium rounded-full px-3 py-1 ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {slot.status === "pending" && (
                      <button
                        onClick={() => approveClaim(slot._id)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-xs font-medium"
                      >
                        <FaUserCheck /> Genehmigen
                      </button>
                    )}
                    <button
                      onClick={() => removeSlot(slot._id)}
                      disabled={isBusy}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-60 p-1.5"
                      title="Slot entfernen"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Einladungs-Aktionen (nur solange nicht bestätigt) */}
                {slot.status !== "confirmed" && slot.claimToken && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-12">
                    <button
                      onClick={() => copyClaim(slot)}
                      className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      {copiedId === slot._id ? (
                        <FaCheck className="text-green-600" />
                      ) : (
                        <FaCopy />
                      )}
                      {copiedId === slot._id ? "Link kopiert" : "Claim-Link"}
                    </button>
                    <button
                      onClick={() =>
                        setInviteOpenId((id) => (id === slot._id ? null : slot._id))
                      }
                      className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                    >
                      <FaEnvelope /> Per E-Mail einladen
                    </button>

                    {inviteOpenId === slot._id && (
                      <div className="flex items-center gap-2 w-full mt-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className={inputClass}
                          placeholder="spieler@beispiel.de"
                        />
                        <button
                          onClick={() => sendInvite(slot._id)}
                          disabled={sending || !inviteEmail.trim()}
                          className="flex-shrink-0 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium"
                        >
                          {sending ? "…" : "Senden"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
