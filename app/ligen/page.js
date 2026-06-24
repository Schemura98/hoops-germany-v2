"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaBasketballBall, FaUsers } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import {
  BUNDESLAENDER,
  LEAGUE_LEVELS,
  LEAGUE_GENDERS,
  LEAGUE_AGE_GROUPS,
} from "@/lib/constants";

export default function LigenPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [land, setLand] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/leagues");
        if (active) setLeagues(data.leagues || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Welche Bundesländer haben bereits Ligen? (für „folgt in Kürze"-Hinweis,
  // wächst automatisch mit, sobald weitere Länder geseedet werden)
  const laenderMitLigen = useMemo(
    () => new Set(leagues.map((l) => l.bundesland).filter(Boolean)),
    [leagues]
  );

  const filtered = useMemo(
    () =>
      leagues.filter((l) => {
        if (land && l.bundesland !== land) return false;
        if (gender && l.gender !== gender) return false;
        if (ageGroup && l.ageGroup !== ageGroup) return false;
        if (level && l.level !== level) return false;
        return true;
      }),
    [leagues, land, gender, ageGroup, level]
  );

  const selectCls =
    "rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader eyebrow="Wettbewerb" title="Ligen" subtitle="Tabellen und Wettbewerbe." />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {!loading && !error && leagues.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <select
              value={land}
              onChange={(e) => setLand(e.target.value)}
              className={selectCls}
              aria-label="Bundesland"
            >
              <option value="">Alle Bundesländer</option>
              {BUNDESLAENDER.map((b) => {
                const verfuegbar = laenderMitLigen.has(b);
                return (
                  <option key={b} value={b} disabled={!verfuegbar}>
                    {verfuegbar ? b : `${b} – folgt in Kürze`}
                  </option>
                );
              })}
            </select>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={selectCls}
              aria-label="Geschlecht"
            >
              <option value="">Alle Geschlechter</option>
              {LEAGUE_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className={selectCls}
              aria-label="Altersklasse"
            >
              <option value="">Alle Altersklassen</option>
              {LEAGUE_AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={selectCls}
              aria-label="Spielklasse"
            >
              <option value="">Alle Spielklassen</option>
              {LEAGUE_LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">
            Ligen konnten nicht geladen werden.
          </p>
        ) : leagues.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Noch keine Ligen vorhanden.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Keine Ligen für diese Auswahl. Probier andere Filter.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? "Liga" : "Ligen"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((l) => (
                <Link
                  key={l._id}
                  href={`/ligen/${l._id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
                >
                  <p className="font-semibold text-gray-900">{l.name}</p>
                  {l.season && <p className="text-xs text-gray-500">{l.season}</p>}
                  {(l.gender || l.ageGroup || l.region) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {[l.gender, l.ageGroup, l.region].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaUsers /> {l.teamCount} Teams
                    </span>
                    {l.bundesland && <span>· {l.bundesland}</span>}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
