"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { PiBasketballBold, PiUsersBold } from "react-icons/pi";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { getPlayerToken } from "@/lib/clientAuth";
import { BUNDESLAENDER, LEAGUE_LEVELS, LEAGUE_GENDERS, LEAGUE_AGE_GROUPS } from "@/lib/constants";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import CityInput from "@/components/CityInput";
import LeagueReportLink from "@/components/team/LeagueReportLink";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { inputClass } from "@/lib/ui";

export default function TeamCreatePage() {
  const router = useRouter();
  const { player, status } = useCurrentPlayer();
  const [form, setForm] = useState({ teamName: "", region: "", bundesland: "", about: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Liga-Auswahl (offizieller Katalog)
  const [leagues, setLeagues] = useState([]);
  const [leagueFilter, setLeagueFilter] = useState({ level: "", gender: "Herren", ageGroup: "Senioren" });
  const [leagueId, setLeagueId] = useState("");

  // Verwaltet der Spieler schon ein Team? → direkt ins Admin-Panel
  useEffect(() => {
    if (player?.isTeamAdmin && player?.teamAdminOf) {
      router.replace("/team/admin");
    }
  }, [player, router]);

  // Offiziellen Liga-Katalog laden
  useEffect(() => {
    let active = true;
    axios
      .get("/api/leagues")
      .then(({ data }) => active && setLeagues(data.leagues || []))
      .catch(() => active && setLeagues([]));
    return () => {
      active = false;
    };
  }, []);

  // Ligen nach Bundesland (aus dem Formular) + Filtern eingrenzen
  const matchingLeagues = useMemo(() => {
    return leagues.filter((l) => {
      if (form.bundesland && l.bundesland && l.bundesland !== form.bundesland) return false;
      if (leagueFilter.level && l.level !== leagueFilter.level) return false;
      if (leagueFilter.gender && l.gender && l.gender !== leagueFilter.gender) return false;
      if (leagueFilter.ageGroup && l.ageGroup && l.ageGroup !== leagueFilter.ageGroup) return false;
      return true;
    });
  }, [leagues, form.bundesland, leagueFilter]);

  // Auswahl zurücksetzen, wenn sie nicht mehr in die Filter passt
  useEffect(() => {
    if (leagueId && !matchingLeagues.some((l) => l._id === leagueId)) setLeagueId("");
  }, [matchingLeagues, leagueId]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = getPlayerToken();
      await axios.post("/api/team/create", { token, ...form, leagueId: leagueId || undefined });
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
        <Loading />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <PlayerNav player={player} />

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-6">
          <span className="inline-flex h-14 w-14 rounded-md bg-brand-500/15 text-brand-400 items-center justify-center mb-3">
            <PiUsersBold className="text-2xl" />
          </span>
          <h1 className="font-display uppercase tracking-tight text-2xl font-black text-paper-50">Team gründen</h1>
          <p className="text-sm text-mist-400 mt-1">
            Erstelle dein Team – du wirst automatisch Team-Admin und kannst Kader,
            Spiele, Ergebnisse und Tryouts verwalten.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-sm bg-signal-error/10 border border-signal-error/50 px-4 py-3 text-sm text-signal-error">
            {error}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="bg-navy-800 rounded-md border border-navy-600 p-6 space-y-4"
        >
          <p className="text-xs text-mist-400">
            Mit <span className="text-brand-400">*</span> markierte Felder sind Pflichtfelder.
          </p>
          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">
              Teamname{" "}
              <span className="text-brand-400" aria-hidden="true">
                *
              </span>
            </label>
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
              <label className="block text-sm font-medium text-mist-300 mb-1">
                Stadt/Region <span className="text-mist-400">(optional)</span>
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
              <label className="block text-sm font-medium text-mist-300 mb-1">
                Bundesland <span className="text-mist-400">(optional)</span>
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
          {/* Liga-Auswahl aus dem offiziellen Katalog */}
          <div className="rounded-md border border-navy-600 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-mist-300">
                Liga <span className="text-mist-400">(optional)</span>
              </label>
              <p className="text-xs text-mist-400 mt-0.5">
                Wähle die Liga, in der dein Team spielt – grenze sie über Bundesland (oben) und
                die Filter ein.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={leagueFilter.level}
                onChange={(e) => setLeagueFilter((f) => ({ ...f, level: e.target.value }))}
                className={`${inputClass} px-3 py-2 text-sm`}
              >
                <option value="">Alle Stufen</option>
                {LEAGUE_LEVELS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <select
                value={leagueFilter.gender}
                onChange={(e) => setLeagueFilter((f) => ({ ...f, gender: e.target.value }))}
                className={`${inputClass} px-3 py-2 text-sm`}
              >
                <option value="">Alle</option>
                {LEAGUE_GENDERS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
              <select
                value={leagueFilter.ageGroup}
                onChange={(e) => setLeagueFilter((f) => ({ ...f, ageGroup: e.target.value }))}
                className={`${inputClass} px-3 py-2 text-sm`}
              >
                <option value="">Alle Klassen</option>
                {LEAGUE_AGE_GROUPS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              className={inputClass}
            >
              <option value="">– Liga wählen (oder später) –</option>
              {matchingLeagues.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name}
                  {l.region ? ` · ${l.region}` : ""}
                  {l.season ? ` (${l.season})` : ""}
                </option>
              ))}
            </select>
            {matchingLeagues.length === 0 && (
              <p className="text-xs text-mist-400">
                Keine passende Liga gefunden. Du kannst dein Team auch ohne Liga gründen und sie
                später wählen.
              </p>
            )}
            <LeagueReportLink bundesland={form.bundesland} />
          </div>

          <div>
            <label className="block text-sm font-medium text-mist-300 mb-1">
              Über das Team <span className="text-mist-400">(optional)</span>
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Team wird erstellt…" : "Team erstellen"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-mist-400">
          <Link href="/teams" className="text-brand-400 hover:underline">
            Erst Teams entdecken
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
