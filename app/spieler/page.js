"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PiMagnifyingGlassBold, PiBasketballBold, PiMapPinBold } from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import { inputClassSm } from "@/lib/ui";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BUNDESLAENDER,
  POSITIONS,
  PLAYER_ROLES,
  positionLabel,
} from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";
import { colorFor, initialsFor } from "@/components/Avatar";

// Karten-Skeleton im Format der echten Spielerkarte (quadratisches Foto + Textzeilen).
function PlayerCardSkeleton() {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3">
        <Skeleton className="h-3.5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-1.5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export default function SpielerPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(""); // "" = Alle
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
      const matchesPosition = !position || positionLabel(p.position) === position;
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
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Community"
        title="Spieler entdecken"
        subtitle="Finde Spieler, folge ihnen und bleib vernetzt."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Filter */}
        {/* Filterleiste: auf dem Handy zweispaltig statt fünf gestapelter
            Zeilen – gleiches Muster wie auf /spiele (Design-Review Welle 3). */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <PiMagnifyingGlassBold className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, Team oder Stadt suchen…"
              className="w-full border border-navy-600 rounded-md pl-9 pr-4 py-3 text-sm text-paper-50 outline-none focus:border-brand-400 bg-navy-800"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <select
            value={land}
            onChange={(e) => setLand(e.target.value)}
            className={inputClassSm}
            aria-label="Bundesland"
          >
            <option value="">Alle Bundesländer</option>
            {BUNDESLAENDER.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={inputClassSm}
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
          </div>
          <CityRadiusFilter value={geo} onChange={setGeo} />
        </div>

        {loading ? (
          <Skeleton className="h-3.5 w-24 mb-4" />
        ) : !error ? (
          <p className="text-xs text-mist-400 font-medium mb-4 uppercase tracking-wide">
            {filtered.length} Spieler
          </p>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Spieler konnten nicht geladen werden." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PiBasketballBold}
            title="Keine Spieler gefunden"
            text={
              query || position ? "Versuche einen anderen Filter." : "Noch keine Spieler registriert."
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((p) => (
              <Link
                key={p._id}
                href={`/player/view-player/${p.slug || p._id}`}
                // data-vt: weicher Seitenwechsel. Gleiche Kopplung wie bei der
                // Team-Karte – PageTransition.js stoppt hier die Weitergabe des
                // Klicks, ein eigener onClick würde nicht mehr feuern.
                data-vt
                className="bg-navy-800 rounded-md border border-navy-600 hover:border-brand-500 hover:bg-navy-700 transition-[background-color,border-color] duration-200 ease-out-strong group overflow-hidden"
              >
                <div className="aspect-square flex items-center justify-center overflow-hidden">
                  {p.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.profileImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${colorFor(
                        `${p.firstName} ${p.lastName}`
                      )} flex items-center justify-center text-paper-50 text-4xl font-bold`}
                    >
                      {initialsFor(`${p.firstName} ${p.lastName}`)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-paper-50 group-hover:text-brand-400 transition-colors leading-tight truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  {/* ⚠️ Hier bewusst KEIN `POSITION_FEHLT` (Befund Tobias,
                      15.08.2026 – er hat zu Recht gemeldet, dass die Fläche in
                      Commit und Doku fälschlich als erledigt geführt war).
                      Diese Liste zeigt die Position als CHIP, nicht als
                      Unterzeile: eine orange Fläche in `brand-500`. Ein
                      Abzeichen mit „Position nicht angegeben" verbraucht den
                      EINEN Akzent der Anzeigetafel-Sprache für eine
                      Nicht-Information – dieselbe Begründung, mit der Vivien
                      das Positions-Chip von der Kaderkarte entfernt hat.
                      Und ein fehlendes Abzeichen ist nicht mehrdeutig: Die
                      Karte zeigt schlicht keins. Mehrdeutig war der
                      Gedankenstrich in einer Unterzeile, nicht das Weglassen
                      einer Auszeichnung. */}
                  {p.position && (
                    <span className="inline-block text-xs font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-md mt-1">
                      {positionLabel(p.position)}
                    </span>
                  )}
                  {p.teamId?.teamName && (
                    <p className="text-xs text-mist-400 mt-1.5 truncate flex items-center gap-1">
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
                    <p className="text-xs text-mist-400 mt-0.5 flex items-center gap-1 truncate">
                      <PiMapPinBold className="flex-shrink-0 text-navy-500" />
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
