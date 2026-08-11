"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { PiCheckBold, PiStarFill } from "react-icons/pi";
import AdminShell from "@/components/layout/AdminShell";
import { getAdminToken } from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";

export default function AdminFeedbackPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const token = getAdminToken();
    const { data } = await axios.post("/api/admin/feedback", { token });
    setItems(data.feedback || []);
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

  async function markRead(id) {
    setBusyId(id);
    try {
      const token = getAdminToken();
      await axios.patch("/api/admin/feedback", { token, feedbackId: id, status: "read" });
      await load();
    } catch {
      /* ignorieren */
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminShell title="Feedback">
      {loading ? (
        <p className="text-mist-400">Lädt…</p>
      ) : items.length === 0 ? (
        <p className="text-mist-400">Kein Feedback vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div
              key={f._id}
              className={`bg-ink-800 rounded-md border p-5 ${
                f.status === "new" ? "border-brand-500/50" : "border-ink-600"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-ink-700 text-mist-300 rounded-sm px-2 py-0.5">
                    {f.type}
                  </span>
                  {f.status === "new" && (
                    <span className="text-xs font-medium bg-brand-500/15 text-brand-400 rounded-sm px-2 py-0.5">
                      neu
                    </span>
                  )}
                  <span className="text-xs text-mist-400">{timeAgo(f.createdAt)}</span>
                </div>
                {f.status === "new" && (
                  <button
                    onClick={() => markRead(f._id)}
                    disabled={busyId === f._id}
                    className="inline-flex items-center gap-1.5 text-xs border border-ink-600 hover:border-brand-500 text-mist-400 rounded-sm px-3 py-1.5 disabled:opacity-60"
                  >
                    <PiCheckBold /> Als gelesen
                  </button>
                )}
              </div>
              {(f.rating || (f.areas && f.areas.length > 0)) && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {f.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-signal-wait">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <PiStarFill
                          key={i}
                          className={i < f.rating ? "text-signal-wait" : "text-ink-600"}
                        />
                      ))}
                    </span>
                  )}
                  {(f.areas || []).map((a) => (
                    <span
                      key={a}
                      className="text-xs font-medium bg-ink-700 text-mist-400 rounded-sm px-2 py-0.5"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm text-mist-300 whitespace-pre-line">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
