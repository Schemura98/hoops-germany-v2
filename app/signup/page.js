"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaGoogle } from "react-icons/fa";
import { setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import AuthShell from "@/components/layout/AuthShell";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { inputClass } from "@/lib/ui";

// Kampagnen-Quellen-Tracking (?src=, z.B. Flyer-QR-Codes): serverseitige Regel ist
// verbindlich, hier nur ein leichter Client-Filter vor dem Puffern in sessionStorage.
const SRC_RE = /^[a-z0-9-_]{1,40}$/;
const SIGNUP_SOURCE_KEY = "signupSource";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleHref, setGoogleHref] = useState("/api/auth/google");

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) setGoogleHref(`/api/auth/google?next=${encodeURIComponent(next)}`);
  }, []);

  // ?src= puffern, damit die Quelle einen Wechsel Login↔Signup überlebt (z.B.
  // Flyer-Link landet auf /signup?src=flyer-koeln, Nutzer wechselt kurz zu /login
  // und zurück zu /signup ohne Query-Param).
  useEffect(() => {
    const src = searchParams.get("src")?.toLowerCase().trim();
    if (src && SRC_RE.test(src)) {
      window.sessionStorage.setItem(SIGNUP_SOURCE_KEY, src);
    }
  }, [searchParams]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
      const signupSource = window.sessionStorage.getItem(SIGNUP_SOURCE_KEY) || undefined;
      const sessionId = window.localStorage.getItem("analyticsSessionId") || undefined;
      const { data } = await axios.post("/api/player/playerregister", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        signupSource,
        sessionId,
      });
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next || "/player/newsfeed");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registrierung fehlgeschlagen. Bitte erneut versuchen."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      image="/images/signupImage.jpg"
      title="Registrieren"
      subtitle="Erstelle dein kostenloses Spielerprofil."
      footer={
        <>
          Bereits ein Konto?{" "}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            Jetzt anmelden
          </Link>
        </>
      }
    >
      {error && <FormAlert className="mb-4">{error}</FormAlert>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
            <input
              name="firstName"
              autoComplete="given-name"
              required
              value={form.firstName}
              onChange={onChange}
              className={inputClass}
              placeholder="Max"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
            <input
              name="lastName"
              autoComplete="family-name"
              required
              value={form.lastName}
              onChange={onChange}
              className={inputClass}
              placeholder="Mustermann"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Konto wird erstellt…" : "Konto erstellen"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-500">oder</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <a
        href={googleHref}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2.5 font-medium transition-colors"
      >
        <FaGoogle className="text-brand-500" />
        Mit Google registrieren
      </a>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
