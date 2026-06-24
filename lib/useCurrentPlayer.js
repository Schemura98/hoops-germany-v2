"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  getPlayerToken,
  clearPlayerToken,
  setStoredPlayer,
} from "@/lib/clientAuth";

// Auth-Guard + Laden des eingeloggten Players.
// Leitet ohne/mit ungültigem Token nach /login um.
// Rückgabe: { player, status: "loading"|"ready"|"error", setPlayer }
export function useCurrentPlayer() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    // Aktuellen Pfad als Zielort merken (zurück nach dem Login).
    const loginWithNext = () => {
      const here = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    };

    const token = getPlayerToken();
    if (!token) {
      loginWithNext();
      return;
    }

    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/getmyinfo", { token });
        if (!active) return;
        setPlayer(data.player);
        setStoredPlayer(data.player);
        setStatus("ready");
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          clearPlayerToken();
          setStoredPlayer(null);
          loginWithNext();
          return;
        }
        setStatus("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return { player, status, setPlayer };
}
