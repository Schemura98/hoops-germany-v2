"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function PlayerUpdatePasswordPage() {
  const { player, status } = useCurrentPlayer();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 6) {
      setError("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/player/update-password", {
        token,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(data.message || "Passwort erfolgreich geändert.");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Passwort konnte nicht geändert werden. Bitte erneut versuchen."
      );
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-700">Seite konnte nicht geladen werden.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-medium"
        >
          Erneut versuchen
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Passwort ändern</h1>
          <Link
            href="/player/player-detail"
            className="text-sm text-gray-500 hover:text-brand-600"
          >
            Zurück
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelles Passwort
            </label>
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              required
              value={form.currentPassword}
              onChange={onChange}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neues Passwort
            </label>
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
              Neues Passwort bestätigen
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
            disabled={saving}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {saving ? "Speichern…" : "Passwort ändern"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Google-Konto ohne Passwort?{" "}
            <Link href="/reset-password" className="text-brand-600 hover:underline">
              Hier ein Passwort setzen
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
