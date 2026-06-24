"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaSearch, FaBasketballBall, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import {
  BUNDESLAENDER,
  POSITIONS,
  PLAYER_ROLES,
  positionLabel,
} from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";

export default function TransfermarktPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(""); // "" = Alle
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
        const { data } = await axios.post("/api/player/transferlist", {});
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
        positionLabel(p.position).toLowerCase().includes(q) ||
        p.preferredLeague?.toLowerCase().includes(q) ||
        p.hometown?.toLowerCase().includes(q);
      const matchesPosition = !position || positionLabel(p.position) === position;
      const matchesLand = !land || p.bundesland === land;
      let matchesGeo = true;
      if (geo.center) {
        if (!cityMap) matchesGeo = true;
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

  const selectCls =
    "rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wechselbörse"
        title="Transfermarkt"
        subtitle="Spieler, Coaches & Funktionäre, die einen neuen Verein suchen."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Filter */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, Rolle, Liga oder Stadt…"
              className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={selectCls}
            aria-label="Position oder Rolle"
          >
            <option value="">Alle Positionen &amp; Rollen</option>
            <optgroup label="Spielposition">
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </optgroup>
            <optgroup label="Funktion">
              {PLAYER_ROLES.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </optgroup>
          </select>
          <select
            value={land}
            onChange={(e) => setLand(e.target.value)}
            className={selectCls}
            aria-label="Bundesland"
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
            {filtered.length} {filtered.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 py-16">
            Transferliste konnte nicht geladen werden.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {query || position || land || geo.center
              ? "Keine passenden Einträge gefunden."
              : "Aktuell ist niemand als transferbereit gelistet."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((p) => {
              const initials =
                `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
              return (
                <Link
                  key={p._id}
                  href={`/player/view-player/${p.slug || p._id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {p.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImage}
                        alt={initials}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                        {initials || "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {positionLabel(p.position) || "Position offen"}
                        {p.teamId?.teamName ? ` · aktuell: ${p.teamId.teamName}` : ""}
                      </p>
                      {(p.hometown || p.bundesland) && (
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <FaMapMarkerAlt className="flex-shrink-0 text-gray-300" />
                          {[p.hometown, p.bundesland].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {(p.preferredLeague || p.transferNote) && (
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                      {p.preferredLeague && (
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-gray-700">Wunschliga:</span>{" "}
                          {p.preferredLeague}
                        </p>
                      )}
                      {p.transferNote && (
                        <p className="text-sm text-gray-600">{p.transferNote}</p>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
