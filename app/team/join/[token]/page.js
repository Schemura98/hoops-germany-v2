"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiBasketballBold, PiUsersBold } from "react-icons/pi";
import { getPlayerToken, setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";

function Shell({ children }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-bold text-paper-50 mb-8"
        >
          <PiBasketballBold className="text-brand-400 text-xl" />
          Hoops Germany
        </Link>
        <div className="bg-navy-800 rounded-md border border-navy-600 p-8">{children}</div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-sm border border-navy-600 px-3 py-2.5 text-sm text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function TeamJoinTokenPage({ params }) {
  const inviteToken = params.token;

  const [state, setState] = useState("loading"); // loading | invalid | ready | done
  const [team, setTeam] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [myTeam, setMyTeam] = useState(null); // aktuelles Team des eingeloggten Spielers
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  // Register-on-Join (nicht eingeloggte Eingeladene)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  // Mindestalter-Selbstauskunft, wie auf /signup (13.08.2026). Ohne sie weist
  // playerregister die Anlage ab – dieser Weg haette sonst eine Fehlermeldung
  // gezeigt, zu der es kein Bedienelement gibt.
  const [abSechzehn, setAbSechzehn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getPlayerToken();
    setLoggedIn(!!token);
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/invite-info", { inviteToken });
        if (!active) return;
        setTeam(data.team);
        setState("ready");
      } catch {
        if (!active) return;
        setState("invalid");
        return;
      }
      // Aktuelles Team des eingeloggten Spielers (für den Wechsel-Hinweis).
      if (token) {
        try {
          const { data } = await axios.post("/api/player/getmyinfo", { token });
          if (active) setMyTeam(data?.player?.team || null);
        } catch {
          /* ignorieren */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [inviteToken]);

  // Eingeloggter Spieler tritt direkt bei.
  async function joinTeam() {
    setError("");
    setJoining(true);
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/join-via-link", { token, inviteToken });
      setState("done");
    } catch (err) {
      setError(err.response?.data?.message || "Beitritt fehlgeschlagen.");
      setJoining(false);
    }
  }

  // Konto anlegen + in einem Schritt beitreten.
  async function registerAndJoin(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (!abSechzehn) {
      setError("Bitte bestätige, dass du mindestens 16 Jahre alt bist.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/player/playerregister", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        minAgeConfirmed: abSechzehn,
      });
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      await axios.post("/api/team/join-via-link", { token: data.token, inviteToken });
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
        <PiBasketballBold className="text-brand-400 text-3xl animate-bounce" />
      </main>
    );
  }

  if (state === "invalid") {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-paper-50">Link ungültig</h1>
        <p className="mt-2 text-sm text-mist-400">
          Dieser Einladungslink ist ungültig oder abgelaufen. Bitte fordere beim Team einen neuen
          Link an.
        </p>
        <Link
          href="/"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-4 py-2.5 font-medium"
        >
          Zur Startseite
        </Link>
      </Shell>
    );
  }

  if (state === "done") {
    return (
      <Shell>
        <h1 className="text-xl font-bold text-paper-50">Willkommen im Kader! 🎉</h1>
        <p className="mt-2 text-sm text-mist-400">
          Du bist jetzt im Kader von <strong>{team?.teamName}</strong>. Vervollständige jetzt dein
          Profil – Foto, Position und Co. – damit dich alle finden.
        </p>
        <Link
          href="/player/edit-profile"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-4 py-2.5 font-medium"
        >
          Profil jetzt vervollständigen
        </Link>
        <Link
          href="/player/newsfeed"
          className="mt-3 block text-center text-sm text-mist-400 hover:text-brand-400"
        >
          Später – zum Newsfeed
        </Link>
      </Shell>
    );
  }

  // state === "ready"
  return (
    <Shell>
      <div className="flex items-center gap-3">
        {team?.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={team.logo} alt={team.teamName} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <span className="h-12 w-12 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
            <PiUsersBold />
          </span>
        )}
        <div>
          <h1 className="text-lg font-bold text-paper-50">{team?.teamName}</h1>
          {team?.region && <p className="text-xs text-mist-400">{team.region}</p>}
        </div>
      </div>

      <div className="mt-5 rounded-sm bg-navy-950 border border-navy-600 p-4">
        <p className="text-sm text-mist-300">
          Du wurdest eingeladen, <strong>{team?.teamName}</strong> beizutreten. Über diesen Link
          landest du direkt im Kader.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-sm bg-signal-error/10 border border-signal-error/50 px-4 py-3 text-sm text-signal-error">
          {error}
        </div>
      )}

      {loggedIn ? (
        myTeam && team && myTeam.slug === team.slug ? (
          // Schon in genau diesem Team
          <div className="mt-6">
            <div className="rounded-sm bg-signal-ok/10 border border-signal-ok/50 px-4 py-3 text-sm text-signal-ok">
              Du bist bereits im Kader von <strong>{team.teamName}</strong>.
            </div>
            <Link
              href={`/team/team-detail/${team.slug}`}
              className="mt-4 block text-center bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-4 py-2.5 font-medium"
            >
              Zur Teamseite
            </Link>
          </div>
        ) : myTeam ? (
          // In einem ANDEREN Team → Wechsel-Hinweis (Sicherheitsabfrage)
          <div className="mt-6 space-y-3">
            <div className="rounded-sm bg-signal-wait/10 border border-signal-wait/50 px-4 py-3 text-sm text-signal-wait">
              Du bist aktuell bei <strong>{myTeam.teamName}</strong>. Wenn du beitrittst, verlässt du
              dieses Team und wechselst zu <strong>{team?.teamName}</strong>.
            </div>
            <button
              onClick={joinTeam}
              disabled={joining}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-4 py-2.5 font-medium transition-colors"
            >
              {joining ? "Wechsle…" : `Zu ${team?.teamName} wechseln`}
            </button>
            <Link
              href="/"
              className="block text-center text-sm text-mist-400 hover:text-brand-400"
            >
              Abbrechen
            </Link>
          </div>
        ) : (
          // Kein Team → normaler Beitritt
          <button
            onClick={joinTeam}
            disabled={joining}
            className="mt-6 w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-4 py-2.5 font-medium transition-colors"
          >
            {joining ? "Trete bei…" : "Dem Team beitreten"}
          </button>
        )
      ) : (
        <form onSubmit={registerAndJoin} className="mt-6 space-y-3">
          <p className="text-sm text-mist-400">
            Erstelle in wenigen Sekunden dein Konto und tritt dem Team bei:
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
          {/* Mindestalter wie auf /signup – serverseitig in playerregister erzwungen. */}
          <label className="flex items-start gap-2.5 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={abSechzehn}
              onChange={(e) => setAbSechzehn(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
            />
            <span className="text-sm text-mist-300">Ich bin mindestens 16 Jahre alt.</span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-4 py-2.5 font-medium transition-colors"
          >
            {submitting ? "Konto wird erstellt…" : "Konto erstellen & beitreten"}
          </button>
          <p className="text-center text-xs text-mist-400">
            Du hast schon ein Konto?{" "}
            <Link href="/login" className="text-brand-400 font-medium">
              Anmelden
            </Link>{" "}
            und dann zu diesem Link zurückkehren.
          </p>
        </form>
      )}
    </Shell>
  );
}
