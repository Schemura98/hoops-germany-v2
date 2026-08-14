"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { PiCheckBold, PiXBold, PiUsersThreeBold } from "react-icons/pi";
import { getTeamAuthToken } from "@/lib/useCurrentTeam";
import { positionLabel, POSITION_FEHLT } from "@/lib/constants";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import TabAlert from "@/components/team/tabs/TabAlert";

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

  if (loading) return <Loading className="py-12" size="text-2xl" />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-paper-50">
        Beitrittsanfragen{" "}
        <span className="text-sm font-normal text-mist-400">· {requests.length}</span>
      </h2>

      <TabAlert msg={msg} />

      {requests.length === 0 ? (
        <EmptyState
          icon={PiUsersThreeBold}
          title="Keine offenen Anfragen"
          text="Spieler können dein Team über das öffentliche Profil anfragen."
        />
      ) : (
        <div className="bg-navy-800 rounded-md border border-navy-600 divide-y divide-navy-600">
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
                    <span className="h-10 w-10 rounded-full bg-brand-500/15 text-brand-400 text-sm font-semibold flex items-center justify-center">
                      {initials || "?"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-paper-50 truncate">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-mist-400">
                      {positionLabel(p.position) || POSITION_FEHLT}
                      {p.nationality ? ` · ${p.nationality}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handle(p._id, "approve")}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 bg-signal-ok hover:brightness-110 disabled:opacity-60 text-paper-50 rounded-sm px-3 py-1.5 text-xs font-medium"
                  >
                    <PiCheckBold /> Annehmen
                  </button>
                  <button
                    onClick={() => handle(p._id, "reject")}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 border border-navy-600 hover:border-signal-error text-mist-400 hover:text-signal-error rounded-sm px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                  >
                    <PiXBold /> Ablehnen
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
