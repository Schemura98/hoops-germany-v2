"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiCheckCircleBold } from "react-icons/pi";
import AuthShell from "@/components/layout/AuthShell";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import Loading from "@/components/ui/Loading";
import { inputClass } from "@/lib/ui";

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
        <Link href="/login" className="text-brand-400 font-medium hover:underline">
          Zurück zum Login
        </Link>
      }
    >
      {message ? (
        <FormAlert type="success">{message}</FormAlert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <FormAlert>{error}</FormAlert>}
          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@beispiel.de"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Senden…" : "Link senden"}
          </Button>
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
      <AuthShell
        title={
          <span className="inline-flex items-center justify-center gap-2">
            <PiCheckCircleBold className="text-signal-ok" /> Erledigt
          </span>
        }
      >
        <FormAlert type="success">Dein Passwort wurde zurückgesetzt.</FormAlert>
        <Button href="/login" className="mt-6 w-full">
          Jetzt anmelden
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Neues Passwort" subtitle="Wähle ein neues Passwort für dein Konto.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <FormAlert>{error}</FormAlert>}
        <div>
          <label className="block text-sm font-medium text-mist-300 mb-1">Neues Passwort</label>
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Speichern…" : "Passwort zurücksetzen"}
        </Button>
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
        <Loading />
      </main>
    );
  }

  return token ? <ResetForm token={token} /> : <RequestForm />;
}
