"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaSearch, FaBasketballBall, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import Avatar from "@/components/Avatar";
import {
  BUNDESLAENDER,
  POSITIONS,
  PLAYER_ROLES,
  positionLabel,
} from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";
import { getPlayerToken } from "@/lib/clientAuth";

const TABS = [
  { key: "players", label: "Spieler suchen Verein" },
  { key: "teams", label: "Vereine suchen Spieler" },
];

export default function TransfermarktPage() {
  const [view, setView] = useState("players");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("");
  const [land, setLand] = useState("");
  const [geo, setGeo] = useState({ center: null, radiusKm: 50 });
  const [cityMap, setCityMap] = useState(null);

  const [loggedIn, setLoggedIn] = useState(false);
  const [joinState, setJoinState] = useState({}); // { [teamId]: { busy, msg, type } }

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
  }, []);

  useEffect(() => {
    if (geo.center && !cityMap) loadCities().then(({ map }) => setCityMap(map));
  }, [geo.center, cityMap]);

  async function requestJoin(teamId) {
    setJoinState((s) => ({ ...s, [teamId]: { busy: true } }));
    try {
      const token = getPlayerToken();
      const { data } = await axios.post("/api/team/requestjoin", { token, teamId });
      setJoinState((s) => ({
        ...s,
        [teamId]: { busy: false, type: "ok", msg: data.message || "Anfrage gesendet." },
      }));
    } catch (err) {
      setJoinState((s) => ({
        ...s,
        [teamId]: {
          busy: false,
          type: "err",
          msg: err.response?.data?.message || "Anfrage fehlgeschlagen.",
        },
      }));
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          axios.post("/api/player/transferlist", {}),
          axios.post("/api/team/recruiting-list", {}),
        ]);
        if (active) {
          setPlayers(pRes.data.players || []);
          setTeams(tRes.data.teams || []);
        }
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

  const geoOk = (cityName) => {
    if (!geo.center) return true;
    if (!cityMap) return true;
    const coords = cityCoords(cityMap, cityName);
    return (
      !!coords &&
      haversineKm(geo.center.lat, geo.center.lng, coords.lat, coords.lng) <= geo.radiusKm
    );
  };

  const filteredPlayers = useMemo(() => {
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
      return matchesQuery && matchesPosition && matchesLand && geoOk(p.hometown);
    });
  }, [players, query, position, land, geo, cityMap]);

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const posLabels = (t.positions || []).map(positionLabel);
      const matchesQuery =
        !q ||
        t.teamName?.toLowerCase().includes(q) ||
        t.note?.toLowerCase().includes(q) ||
        posLabels.join(" ").toLowerCase().includes(q) ||
        t.region?.toLowerCase().includes(q);
      const matchesPosition = !position || posLabels.includes(position);
      const matchesLand = !land || t.bundesland === land;
      return matchesQuery && matchesPosition && matchesLand && geoOk(t.region);
    });
  }, [teams, query, position, land, geo, cityMap]);

  const list = view === "players" ? filteredPlayers : filteredTeams;

  const selectCls =
    "rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wechselbörse"
        title="Transfermarkt"
        subtitle="Finde einen Verein – oder die passende Verstärkung."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                view === t.key
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === "players" ? "Name, Rolle, Liga oder Stadt…" : "Team, Rolle oder Stadt…"}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className={selectCls}
            aria-label="Position oder Rolle"
          >
            <option value="">{view === "players" ? "Alle Positionen & Rollen" : "Alle gesuchten Rollen"}</option>
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
            {list.length} {list.length === 1 ? "Eintrag" : "Einträge"}
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
        ) : list.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            {query || position || land || geo.center
              ? "Keine passenden Einträge gefunden."
              : view === "players"
              ? "Aktuell ist niemand als transferbereit gelistet."
              : "Aktuell sucht kein Verein öffentlich Verstärkung."}
          </p>
        ) : view === "players" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredPlayers.map((p) => {
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredTeams.map((t) => {
              const js = joinState[t._id] || {};
              return (
                <div
                  key={t._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-200 transition-all"
                >
                  <Link
                    href={`/team/team-detail/${t.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar name={t.teamName} src={t.logo} className="h-12 w-12" textClass="text-sm" square />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-brand-600">
                        {t.teamName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.league?.name ? t.league.name : "Verein"}
                      </p>
                      {(t.region || t.bundesland) && (
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <FaMapMarkerAlt className="flex-shrink-0 text-gray-300" />
                          {[t.region, t.bundesland].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </Link>

                  {t.positions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.positions.map((p) => (
                        <span
                          key={p}
                          className="text-xs font-medium bg-brand-50 text-brand-700 rounded-full px-2 py-0.5"
                        >
                          {positionLabel(p)}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.note && (
                    <p className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">{t.note}</p>
                  )}

                  {/* Direktkontakt: Beitritt anfragen */}
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    {js.msg ? (
                      <p className={`text-xs ${js.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                        {js.msg}
                      </p>
                    ) : loggedIn ? (
                      <button
                        onClick={() => requestJoin(t._id)}
                        disabled={js.busy}
                        className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {js.busy ? "Senden…" : "Beitritt anfragen"}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="block text-center w-full border border-gray-300 hover:border-brand-500 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium"
                      >
                        Zum Anfragen anmelden
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
