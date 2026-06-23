"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { setTeamToken } from "@/lib/clientAuth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function TeamRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    teamName: "",
    email: "",
    region: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/team/teamregister", {
        teamName: form.teamName,
        email: form.email,
        region: form.region,
        password: form.password,
      });
      setTeamToken(data.token);
      router.push("/team/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registrierung fehlgeschlagen. Bitte erneut versuchen."
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
          <h1 className="text-2xl font-bold text-gray-900">Team registrieren</h1>
          <p className="mt-1 text-sm text-gray-500">
            Erstelle einen Team-Account und verwalte Kader, Spiele und Tryouts.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teamname
              </label>
              <input
                name="teamName"
                required
                value={form.teamName}
                onChange={onChange}
                className={inputClass}
                placeholder="z.B. Baskets Berlin"
              />
            </div>

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
                Region <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="region"
                value={form.region}
                onChange={onChange}
                className={inputClass}
                placeholder="z.B. Berlin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
                value={form.password}
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
              {loading ? "Team wird erstellt…" : "Team erstellen"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Bereits ein Team-Account?{" "}
          <Link href="/team/login" className="text-brand-600 font-medium hover:underline">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </main>
  );
}
