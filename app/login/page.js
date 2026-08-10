"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { setPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import AuthShell from "@/components/layout/AuthShell";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import { inputClass } from "@/lib/ui";

function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleHref, setGoogleHref] = useState("/api/auth/google");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError("Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
    }
    const next = params.get("next");
    if (next) setGoogleHref(`/api/auth/google?next=${encodeURIComponent(next)}`);
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/player/playerlogin", form);
      setPlayerToken(data.token);
      setStoredPlayer(data.player);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next || "/player/newsfeed");
    } catch (err) {
      setError(err.response?.data?.message || "Login fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Anmelden"
      subtitle="Willkommen zurück! Melde dich mit deinem Account an."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Jetzt registrieren
          </Link>
        </>
      }
    >
      {error && <FormAlert className="mb-4">{error}</FormAlert>}

      <form onSubmit={onSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Passwort</label>
            <Link href="/reset-password" className="text-xs text-brand-600 hover:underline">
              Vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={onChange}
              className={`${inputClass} pr-10`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
              aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Anmelden…" : "Anmelden"}
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
        Mit Google anmelden
      </a>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
