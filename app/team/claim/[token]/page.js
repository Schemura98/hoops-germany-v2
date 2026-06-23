"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaUsers } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";

function Shell({ children }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-bold text-gray-900 mb-8"
        >
          <FaBasketballBall className="text-brand-500 text-xl" />
          Hoops Germany
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </main>
  );
}

const SLOT_STATUS_TEXT = {
  pending: "Dieser Platz wurde bereits beansprucht und wartet auf Bestätigung.",
  confirmed: "Dieser Platz ist bereits vergeben.",
};

export default function TeamClaimTokenPage({ params }) {
  const claimToken = params.token;

  const [state, setState] = useState("loading"); // loading | invalid | ready | done
  const [info, setInfo] = useState(null); // { team, slot, claimable }
  const [loggedIn, setLoggedIn] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());

    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/roster/slot-info", { claimToken });
        if (!active) return;
        setInfo(data);
        setState("ready");
      } catch {
        if (!active) return;
        setState("invalid");
      }
    })();

    return () => {
      active = false;
    };
  }, [claimToken]);

  async function claim() {
    setError("");
    setClaiming(true);
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/roster/request-claim", { token, claimToken });
      setState("done");
    } catch (err) {
      setError(
        err.response?.data?.message || "Anspruch konnte nicht gesendet werden."
      );
      setClaiming(false);
    }
  }

  if (state === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (state === "invalid") {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-gray-900">Link ungültig</h1>
        <p className="mt-2 text-sm text-gray-500">
          Dieser Einladungslink ist ungültig oder abgelaufen. Bitte fordere beim Team
          einen neuen Link an.
        </p>
        <Link
          href="/"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 font-medium"
        >
          Zur Startseite
        </Link>
      </Shell>
    );
  }

  if (state === "done") {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-gray-900">Anspruch gesendet 🎉</h1>
        <p className="mt-2 text-sm text-gray-500">
          Deine Anfrage wurde an <strong>{info?.team?.teamName}</strong> gesendet. Sobald
          das Team dich bestätigt, erscheinst du im Kader.
        </p>
        <Link
          href="/player/newsfeed"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 font-medium"
        >
          Zum Newsfeed
        </Link>
      </Shell>
    );
  }

  // state === "ready"
  const { team, slot, claimable } = info;

  return (
    <Shell>
      <div className="flex items-center gap-3">
        {team?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.logo} alt={team.teamName} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
            <FaUsers />
          </span>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900">{team?.teamName}</h1>
          {team?.region && <p className="text-xs text-gray-500">{team.region}</p>}
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-gray-50 border border-gray-100 p-4">
        <p className="text-sm text-gray-500">Du wurdest eingeladen für:</p>
        <p className="mt-1 font-semibold text-gray-900">
          {slot?.name || "Kaderplatz"}
          {slot?.position ? ` · ${slot.position}` : ""}
          {slot?.number ? ` · #${slot.number}` : ""}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!claimable ? (
        <div className="mt-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
          {SLOT_STATUS_TEXT[slot?.status] || "Dieser Platz ist aktuell nicht verfügbar."}
        </div>
      ) : loggedIn ? (
        <button
          onClick={claim}
          disabled={claiming}
          className="mt-6 w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          {claiming ? "Senden…" : "Platz beanspruchen"}
        </button>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-gray-500 text-center">
            Melde dich als Spieler an, um den Platz zu beanspruchen.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 font-medium"
            >
              Anmelden
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2.5 font-medium"
            >
              Registrieren
            </Link>
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            Danach kehre einfach zu diesem Link zurück.
          </p>
        </div>
      )}
    </Shell>
  );
}
