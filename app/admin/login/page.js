"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaShieldAlt } from "react-icons/fa";
import { setAdminToken } from "@/lib/clientAuth";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

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
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-white mb-8">
          <FaShieldAlt className="text-brand-500 text-xl" />
          Hoops Germany · Admin
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin-Login</h1>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
              <input
                name="username"
                required
                value={form.username}
                onChange={onChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
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
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
            >
              {loading ? "Anmelden…" : "Anmelden"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
