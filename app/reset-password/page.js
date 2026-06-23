"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall } from "react-icons/fa";
import AuthShell from "@/components/layout/AuthShell";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Modus 1: Reset-Link per E-Mail anfordern
function RequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/player/forgotpassword", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Anfrage fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Passwort vergessen"
      subtitle="Gib deine E-Mail-Adresse ein – wir senden dir einen Link zum Zurücksetzen."
      footer={
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Zurück zum Login
        </Link>
      }
    >
      {message ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@beispiel.de"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {loading ? "Senden…" : "Link senden"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

// Modus 2: neues Passwort per Token setzen
function ResetForm({ token }) {
  const [form, setForm] = useState({ newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.newPassword.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/player/resetpassword", {
        token,
        newPassword: form.newPassword,
      });
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Zurücksetzen fehlgeschlagen. Der Link ist evtl. abgelaufen."
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Erledigt 🎉">
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Dein Passwort wurde zurückgesetzt.
        </div>
        <Link
          href="/login"
          className="mt-6 block text-center bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          Jetzt anmelden
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Neues Passwort" subtitle="Wähle ein neues Passwort für dein Konto.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            required
            value={form.newPassword}
            onChange={onChange}
            className={inputClass}
            placeholder="Mind. 6 Zeichen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passwort bestätigen
          </label>
          <input
            type="password"
            name="confirm"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={onChange}
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
        >
          {loading ? "Speichern…" : "Passwort zurücksetzen"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState(undefined); // undefined = noch nicht geprüft

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  if (token === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  return token ? <ResetForm token={token} /> : <RequestForm />;
}
