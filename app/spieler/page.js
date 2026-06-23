"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaSearch, FaBasketballBall, FaUser, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import { BUNDESLAENDER } from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";

const POSITIONS = ["Alle", "PG", "SG", "SF", "PF", "C"];

export default function SpielerPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("Alle");
  const [land, setLand] = useState("");
  const [geo, setGeo] = useState({ center: null, radiusKm: 50 });
  const [cityMap, setCityMap] = useState(null);

  // Städte-Datensatz nur laden, wenn der Umkreis-Filter genutzt wird
  useEffect(() => {
    if (geo.center && !cityMap) loadCities().then(({ map }) => setCityMap(map));
  }, [geo.center, cityMap]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/fetchall", {});
        if (active) setPlayers(data.players || []);
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
    return players.filter((p) => {
      const matchesQuery =
        !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.position?.toLowerCase().includes(q) ||
        p.hometown?.toLowerCase().includes(q) ||
        p.teamId?.teamName?.toLowerCase().includes(q);
      const matchesPosition = position === "Alle" || p.position === position;
      const matchesLand = !land || p.bundesland === land;
      let matchesGeo = true;
      if (geo.center) {
        if (!cityMap) matchesGeo = true; // Datensatz lädt noch
        else {
          const coords = cityCoords(cityMap, p.hometown);
          matchesGeo =
            !!coords &&
            haversineKm(geo.center.lat, geo.center.lng, coords.lat, coords.lng) <=
              geo.radiusKm;
        }
      }
      return matchesQuery && matchesPosition && matchesLand && matchesGeo;
    });
  }, [players, query, position, land, geo, cityMap]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Community"
        title="Spieler entdecken"
        subtitle="Finde Spieler, folge ihnen und bleib vernetzt."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, Team oder Stadt suchen…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm text-gray-900 outline-none focus:border-brand-400 bg-white shadow-sm"
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
          <div className="flex gap-2 flex-wrap">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                  position === pos
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">
            {filtered.length} Spieler
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">
            Spieler konnten nicht geladen werden.
          </p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FaBasketballBall className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">Keine Spieler gefunden</p>
            <p className="text-gray-400 text-sm mt-1">
              {query || position !== "Alle"
                ? "Versuche einen anderen Filter."
                : "Noch keine Spieler registriert."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <Link
                key={p._id}
                href={`/player/view-player/${p.slug || p._id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                  {p.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.profileImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <FaUser className="text-4xl text-slate-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors leading-tight truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  {p.position && (
                    <span className="inline-block text-xs font-semibold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-md mt-1">
                      {p.position}
                    </span>
                  )}
                  {p.teamId?.teamName && (
                    <p className="text-xs text-gray-400 mt-1.5 truncate flex items-center gap-1">
                      {p.teamId.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.teamId.logo}
                          alt=""
                          className="w-3.5 h-3.5 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      {p.teamId.teamName}
                    </p>
                  )}
                  {p.hometown && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                      <FaMapMarkerAlt className="flex-shrink-0 text-gray-300" />
                      {p.hometown}
                    </p>
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
