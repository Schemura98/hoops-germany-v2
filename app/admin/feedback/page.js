"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
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
        <p className="text-gray-500">Lädt…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Kein Feedback vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div
              key={f._id}
              className={`bg-white rounded-2xl shadow-sm border p-5 ${
                f.status === "new" ? "border-brand-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                    {f.type}
                  </span>
                  {f.status === "new" && (
                    <span className="text-xs font-medium bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">
                      neu
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(f.createdAt)}</span>
                </div>
                {f.status === "new" && (
                  <button
                    onClick={() => markRead(f._id)}
                    disabled={busyId === f._id}
                    className="inline-flex items-center gap-1.5 text-xs border border-gray-300 hover:border-brand-500 text-gray-600 rounded-lg px-3 py-1.5 disabled:opacity-60"
                  >
                    <FaCheck /> Als gelesen
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
