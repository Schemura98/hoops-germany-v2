"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { setTeamToken } from "@/lib/clientAuth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function TeamLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/team/teamlogin", form);
      setTeamToken(data.token);
      router.push("/team/admin");
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
          <FaUsers className="text-brand-500 text-xl" />
          Hoops Germany · Teams
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900">Team-Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            Melde dich mit deinem Team-Account an, um den Kader zu verwalten.
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
                placeholder="team@beispiel.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
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
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Noch kein Team-Account?{" "}
          <Link href="/team/register" className="text-brand-600 font-medium hover:underline">
            Team registrieren
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-400">
          Spieler?{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            Zum Spieler-Login
          </Link>
        </p>
      </div>
    </main>
  );
}
