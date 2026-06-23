"use client";

import { useState } from "react";
import axios from "axios";
import { FaCommentDots } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const TYPES = ["Allgemein", "Fehler / Bug", "Vorschlag", "Lob"];

export default function FeedbackPage() {
  const [type, setType] = useState("Allgemein");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/feedback", { type, message });
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
            <FaCommentDots className="text-brand-500" /> Feedback
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Hilf uns, Hoops Germany besser zu machen.
          </p>

          {done ? (
            <div className="mt-6 rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700">
              Danke für dein Feedback! 🙌
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Art</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachricht</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder="Was möchtest du uns mitteilen?"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
              >
                {loading ? "Senden…" : "Feedback senden"}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
