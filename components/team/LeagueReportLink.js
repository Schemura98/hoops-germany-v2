"use client";

import { useState } from "react";
import axios from "axios";
import { PiFlagBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";

// „Liga melden": meldet eine fehlende oder falsche Liga an die Super-Admins.
// Bewusst niedrigschwellig (aufklappbar), aber nur für den Notfall gedacht –
// Ligen werden nicht mehr frei von Teams erstellt.
export default function LeagueReportLink({ bundesland = "", className = "" }) {
  const [open, setOpen] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!leagueName.trim() && !message.trim()) {
      setErr("Bitte beschreibe kurz, was fehlt oder nicht stimmt.");
      return;
    }
    setSending(true);
    setErr("");
    try {
      const token = getPlayerToken();
      await axios.post("/api/leagues/report", { token, leagueName, message, bundesland });
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.message || "Senden fehlgeschlagen.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <p className={`text-xs text-signal-ok ${className}`}>
        Danke! Deine Liga-Meldung ist bei den Admins eingegangen.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs text-brand-400 hover:underline inline-flex items-center gap-1 ${className}`}
      >
        <PiFlagBold className="text-[10px]" /> Liga fehlt oder stimmt nicht? Den Admins melden
      </button>
    );
  }

  return (
    <div className="rounded-sm bg-signal-wait/10 border border-signal-wait/50 p-3 space-y-2">
      <p className="text-xs font-medium text-signal-wait">Liga melden (geht an die Super-Admins)</p>
      <input
        value={leagueName}
        onChange={(e) => setLeagueName(e.target.value)}
        placeholder="Name der Liga (falls bekannt)"
        className="w-full rounded-md border border-navy-600 bg-navy-700 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 placeholder:text-mist-400"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Was fehlt oder stimmt nicht?"
        className="w-full rounded-md border border-navy-600 bg-navy-700 px-2.5 py-1.5 text-sm outline-none focus:border-brand-500 resize-none placeholder:text-mist-400"
      />
      {err && <p className="text-xs text-signal-error">{err}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={sending}
          className="text-xs bg-brand-500 hover:bg-brand-400 disabled:bg-navy-600 disabled:text-mist-300 text-navy-950 rounded-md px-3 py-1.5 font-medium"
        >
          {sending ? "Senden…" : "Melden"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-mist-400 hover:text-paper-50 px-2 py-1.5"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
