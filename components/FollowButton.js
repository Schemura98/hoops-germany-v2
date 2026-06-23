"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaCheck, FaPlus } from "react-icons/fa";
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
        if (active) setFollowing(data.following);
      } catch {
        /* ignorieren */
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
    } catch {
      /* ignorieren */
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <span className="inline-block h-[42px] w-28 rounded-lg bg-gray-100 animate-pulse" />
    );
  }

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium"
      >
        <FaPlus className="text-xs" /> Folgen
      </Link>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? "border border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-600"
          : "bg-brand-500 hover:bg-brand-600 text-white"
      }`}
    >
      {following ? (
        <>
          <FaCheck className="text-xs" /> Gefolgt
        </>
      ) : (
        <>
          <FaPlus className="text-xs" /> Folgen
        </>
      )}
    </button>
  );
}
