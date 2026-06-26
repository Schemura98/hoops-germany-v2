"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUsers, FaSearch, FaBasketballBall, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import { BUNDESLAENDER } from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";
import { colorFor, initialsFor } from "@/components/Avatar";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [land, setLand] = useState("");
  const [geo, setGeo] = useState({ center: null, radiusKm: 50 });
  const [cityMap, setCityMap] = useState(null);

  useEffect(() => {
    if (geo.center && !cityMap) loadCities().then(({ map }) => setCityMap(map));
  }, [geo.center, cityMap]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/team/fetchteams", {});
        if (active) setTeams(data.teams || []);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchesQuery =
        !q ||
        t.teamName?.toLowerCase().includes(q) ||
        t.region?.toLowerCase().includes(q);
      const matchesLand = !land || t.bundesland === land;
      let matchesGeo = true;
      if (geo.center) {
        if (!cityMap) matchesGeo = true;
        else {
          const coords = cityCoords(cityMap, t.region);
          matchesGeo =
            !!coords &&
            haversineKm(geo.center.lat, geo.center.lng, coords.lat, coords.lng) <=
              geo.radiusKm;
        }
      }
      return matchesQuery && matchesLand && matchesGeo;
    });
  }, [teams, query, land, geo, cityMap]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Vereine"
        title="Teams entdecken"
        subtitle="Finde Vereine und Mannschaften, folge ihnen und bleib am Ball."
      >
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Link
            href="/team/create"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-5 py-3 shadow-sm whitespace-nowrap"
          >
            <FaPlus /> Eigenes Team gründen
          </Link>
          <p className="text-slate-400 text-sm">
            Dein Team ist nicht dabei? Gründe es selbst – du wirst automatisch{" "}
            <span className="text-slate-200 font-medium">Team-Admin</span> und verwaltest Kader,
            Spiele &amp; mehr.
          </p>
        </div>
      </PageHeader>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Team oder Stadt suchen…"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-400 bg-white shadow-sm"
            />
          </div>
          <select
            value={land}
            onChange={(e) => setLand(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-400"
          >
            <option value="">Alle Bundesländer</option>
            {BUNDESLAENDER.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <CityRadiusFilter value={geo} onChange={setGeo} />
        </div>

        {!loading && !error && (
          <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">
            {filtered.length} Teams
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">Teams konnten nicht geladen werden.</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FaUsers className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Keine Teams gefunden</p>
            <p className="text-gray-400 text-sm mt-1">
              {query ? "Versuche einen anderen Suchbegriff." : "Noch keine Teams registriert."}
            </p>
            <p className="text-gray-500 text-sm mt-5">Dein Team ist nicht dabei?</p>
            <Link
              href="/team/create"
              className="mt-2 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-5 py-3 shadow-sm"
            >
              <FaPlus /> Eigenes Team gründen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((t) => (
              <Link
                key={t._id}
                href={`/team/team-detail/${t.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-200 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center h-40 w-full">
                  {t.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo} alt={t.teamName} className="h-28 w-28 object-contain" />
                  ) : (
                    <div
                      className={`h-24 w-24 rounded-2xl ${colorFor(
                        t.teamName
                      )} flex items-center justify-center text-white text-3xl font-black`}
                    >
                      {initialsFor(t.teamName)}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand-600 transition-colors truncate">
                    {t.teamName}
                  </h2>
                  {t.region && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-xs">
                      <FaMapMarkerAlt className="flex-shrink-0 text-brand-400" />
                      <span className="truncate">{t.region}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
