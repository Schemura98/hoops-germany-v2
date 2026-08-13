"use client";

import { useCallback, useEffect, useState } from "react";
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

  // Nachladen auf Zuruf: `window.dispatchEvent(new Event("hg:player-updated"))`.
  //
  // Grund (13.08.2026): Die Plattform-Tour speichert Position und Bundesland
  // wirklich. Ohne dieses Signal stand die Onboarding-Checkliste im Feed danach
  // weiter auf „0 von 4 erledigt", während die Tour im selben Moment „1 von 4"
  // meldete – der Nutzer sieht zwei Wahrheiten nebeneinander und hält die
  // Speicherung für kaputt. Beim Nachladen kein `status`-Wechsel auf "loading":
  // sonst blitzt die halbe Seite kurz als Skelett auf.
  const nachladen = useCallback(async () => {
    const token = getPlayerToken();
    if (!token) return;
    try {
      const { data } = await axios.post("/api/player/getmyinfo", { token });
      setPlayer(data.player);
      setStoredPlayer(data.player);
    } catch {
      /* stiller Fehlschlag: der zuletzt geladene Stand bleibt stehen */
    }
  }, []);

  useEffect(() => {
    window.addEventListener("hg:player-updated", nachladen);
    return () => window.removeEventListener("hg:player-updated", nachladen);
  }, [nachladen]);

  return { player, status, setPlayer };
}
