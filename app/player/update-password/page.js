"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { inputClass } from "@/lib/ui";

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
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Seite konnte nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <PlayerNav player={player} />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Passwort ändern</h1>
          <Link
            href="/player/player-detail"
            className="text-sm text-mist-400 hover:text-brand-400"
          >
            Zurück
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-sm bg-signal-error/10 border border-signal-error/50 px-4 py-3 text-sm text-signal-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-sm bg-signal-ok/10 border border-signal-ok/50 px-4 py-3 text-sm text-signal-ok">
            {success}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-navy-800 rounded-md border border-navy-600 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">
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
            <label className="block text-sm font-medium text-mist-300 mb-1">
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
            <label className="block text-sm font-medium text-mist-300 mb-1">
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

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? "Speichern…" : "Passwort ändern"}
          </Button>

          <p className="text-center text-xs text-mist-400">
            Google-Konto ohne Passwort?{" "}
            <Link href="/reset-password" className="text-brand-400 hover:underline">
              Hier ein Passwort setzen
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
}
