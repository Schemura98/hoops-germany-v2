"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FaBasketballBall, FaLock, FaPrint } from "react-icons/fa";
import SponsorReportView from "@/components/admin/SponsorReportView";

const PERIODS = [
  { v: 7, l: "7 Tage" },
  { v: 30, l: "30 Tage" },
  { v: 90, l: "90 Tage" },
  { v: 365, l: "1 Jahr" },
];

export default function PublicSponsorReportPage() {
  const params = useParams();
  const token = params?.token;

  const [password, setPassword] = useState("");
  const [period, setPeriod] = useState(30);
  const [summary, setSummary] = useState(null);
  const [label, setLabel] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchReport(pw, p) {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/analytics/public-report", { token, password: pw, period: p });
      setSummary(data.summary);
      setLabel(data.label || "");
      setGeneratedAt(new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }));
      setUnlocked(true);
    } catch (err) {
      setError(err.response?.data?.message || "Zugriff fehlgeschlagen.");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (password) fetchReport(password, period);
  }

  function changePeriod(p) {
    setPeriod(p);
    if (unlocked) fetchReport(password, p);
  }

  // Passwort-Gate
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex items-center justify-center p-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 text-gray-900 mb-1">
            <span className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
              <FaBasketballBall />
            </span>
            <span className="font-black text-lg">Hoops Germany</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 mt-3">Sponsoring-Report</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Dieser Report ist passwortgeschützt. Bitte gib das Passwort ein, das du erhalten hast.
          </p>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              autoFocus
              className="w-full rounded-xl border border-gray-300 pl-9 pr-4 py-3 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl px-4 py-3"
          >
            {loading ? <FaBasketballBall className="animate-bounce" /> : "Report ansehen"}
          </button>
        </form>
      </div>
    );
  }

  // Entsperrt → Report
  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      <div className="max-w-3xl mx-auto px-4 mb-4 flex flex-wrap items-center gap-2 justify-between print:hidden">
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.v}
              onClick={() => changePeriod(p.v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                period === p.v ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm"
        >
          <FaPrint /> Drucken / als PDF speichern
        </button>
      </div>
      <SponsorReportView summary={summary} period={period} generatedAt={generatedAt} label={label} />
    </div>
  );
}
