"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getTeamToken, getPlayerToken } from "@/lib/clientAuth";

// Liefert den Auth-Token für Team-Admin-Aktionen:
// Team-Token bevorzugt, sonst Player-Token (Team-Admin-Fall).
export function getTeamAuthToken() {
  return getTeamToken() || getPlayerToken();
}

// Auth-Guard + Laden des verwalteten Teams (Dual-Auth).
// Rückgabe: { team, status: "loading"|"ready"|"error", reload, setTeam }
export function useCurrentTeam() {
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(
    async (signal) => {
      const token = getTeamAuthToken();
      if (!token) {
        // Nicht eingeloggt → Spieler-Login (Teams sind spieler-geführt)
        router.replace("/login");
        return;
      }
      try {
        const { data } = await axios.post("/api/team/fetchinfo", { token });
        if (signal?.aborted) return;
        setTeam(data.team);
        setStatus("ready");
      } catch (err) {
        if (signal?.aborted) return;
        if (err.response?.status === 401) {
          // Eingeloggter Spieler ohne Team → Team gründen; sonst Login
          router.replace(getPlayerToken() ? "/team/create" : "/login");
          return;
        }
        setStatus("error");
      }
    },
    [router]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Für Aufrufer: Team-Daten nach Mutationen neu laden.
  const reload = useCallback(() => load(), [load]);

  return { team, status, reload, setTeam };
}
