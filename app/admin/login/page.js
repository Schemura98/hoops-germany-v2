"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PiShieldCheckBold } from "react-icons/pi";
import { setAdminToken } from "@/lib/clientAuth";
import { inputClass } from "@/lib/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/admin/adminlogin", form);
      setAdminToken(data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center px-6 py-12 bg-navy-900">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-paper-50 mb-8">
          <PiShieldCheckBold className="text-brand-400 text-xl" />
          Hoops Germany · Admin
        </div>

        <div className="bg-navy-800 rounded-md p-8">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Admin-Login</h1>

          {error && (
            <div className="mt-4 rounded-sm bg-signal-error/10 border border-signal-error/50 px-4 py-3 text-sm text-signal-error">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-1">Benutzername</label>
              <input
                name="username"
                required
                value={form.username}
                onChange={onChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-mist-300 mb-1">Passwort</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={onChange}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-navy-950 rounded-sm px-4 py-2.5 font-medium transition-colors"
            >
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
