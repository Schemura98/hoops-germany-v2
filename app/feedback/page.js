"use client";

import { useState } from "react";
import axios from "axios";
import {
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaLightbulb,
  FaBug,
  FaRegSmile,
  FaRegFrown,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const TYPES = [
  { key: "Lob", label: "Lob", icon: FaThumbsUp },
  { key: "Kritik", label: "Kritik", icon: FaThumbsDown },
  { key: "Idee", label: "Idee", icon: FaLightbulb },
  { key: "Bug", label: "Bug", icon: FaBug },
];

const AREAS = [
  "Design & Optik",
  "Onboarding / Einstieg",
  "Spielerprofile",
  "Teams & Kader",
  "Spiele & Ergebnisse",
  "Ligen & Tabellen",
  "Transfermarkt & Scouting",
  "Tryouts",
  "Suche & Filter",
  "Newsfeed & Community",
  "Mobile / Handy",
  "Performance / Ladezeit",
  "Sonstiges",
];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
        active
          ? "bg-brand-500 text-white border-brand-500"
          : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function FeedbackPage() {
  const [type, setType] = useState("Lob");
  const [rating, setRating] = useState(0);
  const [areas, setAreas] = useState([]);
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleArea(a) {
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  const hasContent =
    rating > 0 || areas.length > 0 || likes.trim() || dislikes.trim() || suggestions.trim();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/feedback", { type, rating, areas, likes, dislikes, suggestions });
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

      <PageHeader
        eyebrow="Testphase"
        title="Dein Feedback"
        subtitle="Hilf uns, Hoops Germany vor dem Launch perfekt zu machen. Je konkreter, desto besser."
      />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-8">
        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <FaRegSmile className="text-brand-500 text-4xl mx-auto mb-3" />
            <p className="font-bold text-gray-900 text-lg">Danke für dein Feedback! 🙌</p>
            <p className="text-sm text-gray-500 mt-1">
              Jede Rückmeldung hilft uns, die Plattform besser zu machen.
            </p>
            <button
              onClick={() => {
                setDone(false);
                setRating(0);
                setAreas([]);
                setLikes("");
                setDislikes("");
                setSuggestions("");
              }}
              className="mt-6 text-sm text-brand-600 font-medium hover:underline"
            >
              Weiteres Feedback geben
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-7"
          >
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Gesamteindruck */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Wie gefällt dir Hoops Germany insgesamt?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} von 5`}
                    className={`text-2xl transition-colors ${
                      n <= rating ? "text-amber-400" : "text-gray-300 hover:text-amber-200"
                    }`}
                  >
                    <FaStar />
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-sm text-gray-500">{rating}/5</span>}
              </div>
            </div>

            {/* Art */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Was ist es für eine Rückmeldung?
              </label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Chip key={t.key} active={type === t.key} onClick={() => setType(t.key)}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon className="text-xs" /> {t.label}
                      </span>
                    </Chip>
                  );
                })}
              </div>
            </div>

            {/* Themen */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Worum geht es?{" "}
                <span className="font-normal text-gray-400">(Mehrfachauswahl)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <Chip key={a} active={areas.includes(a)} onClick={() => toggleArea(a)}>
                    {a}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Gezielte Fragen */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                <FaRegSmile className="text-green-500" /> Was gefällt dir gut?
              </label>
              <textarea
                rows={2}
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="z. B. „Die Box-Scores und die Tabelle sind super übersichtlich.“"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                <FaRegFrown className="text-red-400" /> Was gefällt dir nicht / stört dich?
              </label>
              <textarea
                rows={2}
                value={dislikes}
                onChange={(e) => setDislikes(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="z. B. „Auf dem Handy ist die Filterleiste zu voll.“"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                <FaLightbulb className="text-amber-400" /> Was würdest du anders machen / dir
                wünschen?
              </label>
              <textarea
                rows={2}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className={`${inputClass} resize-none`}
                placeholder="z. B. „Eine Benachrichtigung, wenn mein Team ein Spiel hat.“"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !hasContent}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-3 font-medium transition-colors"
            >
              {loading ? "Senden…" : "Feedback senden"}
            </button>
            {!hasContent && (
              <p className="text-center text-xs text-gray-400 -mt-3">
                Wähle eine Bewertung/ein Thema oder schreib uns kurz etwas.
              </p>
            )}
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
