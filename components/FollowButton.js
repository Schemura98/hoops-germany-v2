"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiCheckBold, PiPlusBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";

// Wiederverwendbarer Folgen-Button für Spieler oder Teams.
// type: "player" | "team"
export default function FollowButton({ type, targetId, onCountChange }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [following, setFollowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  const keyField = type === "team" ? "teamId" : "playerId";
  const endpoint = type === "team" ? "followteam" : "followplayer";

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      setReady(true);
      return;
    }
    setLoggedIn(true);
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/checkfollowing", {
          token,
          [keyField]: targetId,
        });
        if (active) {
          setFollowing(data.following);
          // Ein Token kann ABGELAUFEN sein: Dann hielt sich der Knopf für
          // angemeldet, und der Klick lief in eine stumme 401-Abweisung –
          // die Oberfläche reagierte gar nicht (Befund Tobias H2, 23.08.2026).
          // checkfollowing wirft dafür KEIN 401, sondern antwortet 200 mit
          // authenticated:false (Auflage Kai: die erste Fassung dieses Fixes
          // wartete auf ein 401, das hier nie kommt). Bei ungültiger Sitzung
          // wird der Knopf sofort wieder zum Login-Link.
          if (data.authenticated === false) setLoggedIn(false);
        }
      } catch {
        /* Netzfehler: Zustand unverändert lassen – der Klick-Pfad fängt 401 ab. */
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [targetId, keyField]);

  async function toggle() {
    setBusy(true);
    try {
      const token = getPlayerToken();
      const payload =
        type === "team" ? { token, teamId: targetId } : { token, targetId };
      const { data } = await axios.post(`/api/player/${endpoint}`, payload);
      setFollowing(data.following);
      onCountChange?.(data.followersCount);
    } catch (err) {
      // Sitzung abgelaufen: nicht stumm schlucken, sondern zum Login führen –
      // ein Knopf, der auf den Klick sichtbar NICHT reagiert, ist ein toter
      // Knopf (Befund Tobias H2). Andere Fehler bleiben bewusst still.
      // Mit ?next= zurück auf die Seite, von der der Klick kam – geprüft wird
      // das Ziel serverseitig ohnehin über lib/sichererPfad.js.
      if (err?.response?.status === 401) {
        window.location.assign(
          `/login?next=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <span className="inline-block h-[42px] w-28 rounded-sm bg-navy-700 animate-pulse" />
    );
  }

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-5 py-2.5 text-sm font-medium"
      >
        <PiPlusBold className="text-xs" /> Folgen
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-medium transition-colors disabled:bg-navy-600 disabled:text-mist-300 ${
        following
          ? "border border-navy-600 text-mist-300 hover:border-signal-error hover:text-signal-error"
          : "bg-brand-500 hover:bg-brand-400 text-navy-950"
      }`}
    >
      {following ? (
        <>
          <PiCheckBold className="text-xs" /> Gefolgt
        </>
      ) : (
        <>
          <PiPlusBold className="text-xs" /> Folgen
        </>
      )}
    </button>
  );
}
