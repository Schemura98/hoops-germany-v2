"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes, FaBasketballBall } from "react-icons/fa";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { positionLabel } from "@/lib/constants";

export default function AnfragenTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const token = getTeamAuthToken();
    const { data } = await axios.post("/api/team/fetchjoinrequests", { token });
    setRequests(data.requests || []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await load();
      } catch {
        if (active) setMsg({ type: "err", text: "Anfragen konnten nicht geladen werden." });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [load]);

  async function handle(playerId, action) {
    setBusyId(playerId);
    setMsg(null);
    try {
      const token = getTeamAuthToken();
      const { data } = await axios.post("/api/team/handlejoinrequest", {
        token,
        playerId,
        action,
      });
      setMsg({ type: "ok", text: data.message });
      await load();
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Aktion fehlgeschlagen." });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <FaBasketballBall className="text-brand-500 text-2xl animate-bounce" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Beitrittsanfragen{" "}
        <span className="text-sm font-normal text-gray-500">· {requests.length}</span>
      </h2>

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

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-500">
            Keine offenen Anfragen. Spieler können dein Team über das öffentliche Profil
            anfragen.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {requests.map((p) => {
            const initials =
              `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
            const isBusy = busyId === p._id;
            return (
              <div key={p._id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {p.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.profileImage}
                      alt={initials}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold flex items-center justify-center">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {positionLabel(p.position) || "Position offen"}
                      {p.nationality ? ` · ${p.nationality}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handle(p._id, "approve")}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 text-xs font-medium"
                  >
                    <FaCheck /> Annehmen
                  </button>
                  <button
                    onClick={() => handle(p._id, "reject")}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-red-400 text-gray-600 hover:text-red-600 rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                  >
                    <FaTimes /> Ablehnen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
