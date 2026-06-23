"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaUsers } from "react-icons/fa";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken } from "@/lib/clientAuth";
import { BUNDESLAENDER } from "@/lib/constants";
import PlayerNav from "@/components/layout/PlayerNav";
import CityInput from "@/components/CityInput";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function TeamCreatePage() {
  const router = useRouter();
  const { player, status } = useCurrentPlayer();
  const [form, setForm] = useState({ teamName: "", region: "", bundesland: "", about: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verwaltet der Spieler schon ein Team? → direkt ins Admin-Panel
  useEffect(() => {
    if (player?.isTeamAdmin && player?.teamAdminOf) {
      router.replace("/team/admin");
    }
  }, [player, router]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/create", { token, ...form });
      // Spieler-Flags haben sich geändert → harter Reload ins Admin-Panel
      window.location.href = "/team/admin";
    } catch (err) {
      setError(err.response?.data?.message || "Team konnte nicht erstellt werden.");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerNav player={player} />

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <span className="inline-flex h-14 w-14 rounded-2xl bg-brand-100 text-brand-600 items-center justify-center mb-3">
            <FaUsers className="text-2xl" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Team gründen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Erstelle dein Team – du wirst automatisch Team-Admin und kannst Kader,
            Spiele, Ergebnisse und Tryouts verwalten.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teamname</label>
            <input
              name="teamName"
              required
              value={form.teamName}
              onChange={onChange}
              className={inputClass}
              placeholder="z.B. Baskets Berlin"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stadt/Region <span className="text-gray-400">(optional)</span>
              </label>
              <CityInput
                value={form.region}
                onChange={(v) => setForm((f) => ({ ...f, region: v }))}
                onPick={(c) =>
                  setForm((f) => ({ ...f, region: c.n, bundesland: c.s || f.bundesland }))
                }
                placeholder="z.B. Berlin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundesland <span className="text-gray-400">(optional)</span>
              </label>
              <select
                name="bundesland"
                value={form.bundesland}
                onChange={onChange}
                className={inputClass}
              >
                <option value="">– wählen –</option>
                {BUNDESLAENDER.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Über das Team <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="about"
              value={form.about}
              onChange={onChange}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Kurze Beschreibung deines Vereins…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 font-medium transition-colors"
          >
            {loading ? "Team wird erstellt…" : "Team erstellen"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link href="/teams" className="text-brand-600 hover:underline">
            Erst Teams entdecken
          </Link>
        </p>
      </main>
    </div>
  );
}
