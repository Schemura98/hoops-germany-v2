"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaGoogle } from "react-icons/fa";
import { setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fehler aus Google-OAuth-Redirect (?error=...) anzeigen
  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason) {
      setError("Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
    }
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/player/playerlogin", form);
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      router.push("/player/newsfeed");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login fehlgeschlagen. Bitte erneut versuchen."
      );
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Anmelden</h1>
          <p className="mt-1 text-sm text-gray-500">
            Willkommen zurück! Melde dich mit deinem Account an.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={onChange}
                className={inputClass}
                placeholder="name@beispiel.de"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Passwort
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Vergessen?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={form.password}
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
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">oder</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            <FaGoogle className="text-brand-500" />
            Mit Google anmelden
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Noch kein Konto?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}
