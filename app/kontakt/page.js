"use client";

import { useState } from "react";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { inputClass } from "@/lib/ui";

export default function KontaktPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/kontakt", form);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Senden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaEnvelope className="text-brand-500" /> Kontakt
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fragen, Anregungen oder Kooperationen? Schreib uns.
          </p>

          {done ? (
            <div className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
              Danke! Wir melden uns bei dir. 📬
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" required value={form.name} onChange={onChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={onChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Deine Nachricht…"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !form.name.trim() || !form.email.trim() || !form.message.trim()}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
              >
                {loading ? "Senden…" : "Nachricht senden"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Oder direkt:{" "}
            <a href="mailto:info@hoopsgermany.de" className="text-brand-600 hover:underline">
              info@hoopsgermany.de
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
