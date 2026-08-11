"use client";

import { useState } from "react";
import axios from "axios";
import { PiCheckCircleBold, PiEnvelopeSimpleBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
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
    <div className="min-h-screen bg-ink-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12">
        <div className="bg-ink-800 rounded-md border border-ink-600 p-8">
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50 flex items-center gap-2">
            <PiEnvelopeSimpleBold className="text-brand-400" /> Kontakt
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            Fragen, Anregungen oder Kooperationen? Schreib uns.
          </p>

          {done ? (
            <FormAlert type="success" className="mt-6 flex items-center gap-2 py-4">
              <PiCheckCircleBold className="flex-shrink-0" />
              <span>Danke! Wir melden uns bei dir.</span>
            </FormAlert>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && <FormAlert>{error}</FormAlert>}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-mist-300 mb-1">Name</label>
                  <input name="name" required value={form.name} onChange={onChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mist-300 mb-1">E-Mail</label>
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
                <label className="block text-sm font-medium text-mist-300 mb-1">Nachricht</label>
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
              <Button
                type="submit"
                disabled={loading || !form.name.trim() || !form.email.trim() || !form.message.trim()}
                className="w-full"
              >
                {loading ? "Senden…" : "Nachricht senden"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-mist-400">
            Oder direkt:{" "}
            <a href="mailto:info@hoopsgermany.de" className="text-brand-400 hover:underline">
              info@hoopsgermany.de
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
