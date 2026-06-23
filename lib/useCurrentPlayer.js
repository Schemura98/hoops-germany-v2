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
    const token = getPlayerToken();
    if (!token) {
      router.replace("/login");
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
          router.replace("/login");
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
