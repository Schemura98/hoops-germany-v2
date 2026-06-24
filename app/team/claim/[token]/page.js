"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaUsers } from "react-icons/fa";
import { getPlayerToken, setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";

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

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Vollen Slot-Namen in Vor-/Nachname aufteilen (zum Vorbefüllen).
function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
}

export default function TeamClaimTokenPage({ params }) {
  const claimToken = params.token;

  const [state, setState] = useState("loading"); // loading | invalid | ready | done
  const [info, setInfo] = useState(null); // { team, slot, claimable }
  const [loggedIn, setLoggedIn] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  // Register-on-Claim (nicht eingeloggte Eingeladene)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());

    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/roster/slot-info", { claimToken });
        if (!active) return;
        setInfo(data);
        // Namen aus dem Slot vorbefüllen
        const { firstName, lastName } = splitName(data?.slot?.name);
        setForm((f) => ({ ...f, firstName, lastName }));
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

  // Eingeloggter Spieler beansprucht direkt.
  async function claim() {
    setError("");
    setClaiming(true);
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/roster/request-claim", { token, claimToken });
      setState("done");
    } catch (err) {
      setError(err.response?.data?.message || "Anspruch konnte nicht gesendet werden.");
      setClaiming(false);
    }
  }

  // Konto anlegen + Platz in einem Schritt beanspruchen.
  async function registerAndClaim(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/player/playerregister", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      await axios.post("/api/team/roster/request-claim", {
        token: data.token,
        claimToken,
      });
      setState("done");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Konto konnte nicht erstellt werden. Bitte erneut versuchen."
      );
      setSubmitting(false);
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
          das Team dich bestätigt, erscheinst du im Kader. Vervollständige in der
          Zwischenzeit gern dein Profil.
        </p>
        <Link
          href="/player/edit-profile"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 font-medium"
        >
          Profil jetzt vervollständigen
        </Link>
        <Link
          href="/player/newsfeed"
          className="mt-3 block text-center text-sm text-gray-500 hover:text-brand-600"
        >
          Später – zum Newsfeed
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
        <form onSubmit={registerAndClaim} className="mt-6 space-y-3">
          <p className="text-sm text-gray-600">
            Erstelle in wenigen Sekunden dein Konto und übernimm deinen Platz im Kader:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className={inputClass}
              placeholder="Vorname"
              required
            />
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className={inputClass}
              placeholder="Nachname"
              required
            />
          </div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputClass}
            placeholder="E-Mail"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={inputClass}
            placeholder="Passwort (mind. 6 Zeichen)"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {submitting ? "Konto wird erstellt…" : "Konto erstellen & Platz annehmen"}
          </button>
          <p className="text-center text-xs text-gray-400">
            Du hast schon ein Konto?{" "}
            <Link href="/login" className="text-brand-600 font-medium">
              Anmelden
            </Link>{" "}
            und dann zu diesem Link zurückkehren.
          </p>
        </form>
      )}
    </Shell>
  );
}
