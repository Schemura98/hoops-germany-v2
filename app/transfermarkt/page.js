"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaSearch, FaBasketballBall, FaMapMarkerAlt, FaUsers, FaExchangeAlt, FaBullhorn, FaArrowRight } from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import DemoBadge from "@/components/DemoBadge";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";
import CityRadiusFilter from "@/components/CityRadiusFilter";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import Avatar from "@/components/Avatar";
import {
  BUNDESLAENDER,
  POSITIONS,
  PLAYER_ROLES,
  positionLabel,
} from "@/lib/constants";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";
import { getPlayerToken } from "@/lib/clientAuth";
import { inputClassSm } from "@/lib/ui";

const TABS = [
  { key: "players", label: "Spieler suchen Verein" },
  { key: "teams", label: "Vereine suchen Spieler" },
];

// Karten-Skeleton im Format der echten Spieler-/Vereinskarte (Avatar + Textzeilen).
function TransferCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-3.5 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

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
  const [me, setMe] = useState(null);
  const [joinState, setJoinState] = useState({}); // { [teamId]: { busy, msg, type } }

  useEffect(() => {
    const token = getPlayerToken();
    setLoggedIn(!!token);
    if (!token) return;
    let active = true;
    axios
      .post("/api/player/getmyinfo", { token })
      .then(({ data }) => active && setMe(data.player || null))
      .catch(() => {});
    return () => {
      active = false;
    };
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

  // Matching: Vereine, die zum eingeloggten (transferbereiten) Spieler passen.
  const matchTeams = useMemo(() => {
    if (!me || me.transferStatus !== "verfuegbar") return [];
    const myPos = positionLabel(me.position);
    return teams
      .filter((t) => String(t._id) !== String(me.teamAdminOf || ""))
      .filter((t) => {
        const posMatch = myPos && (t.positions || []).map(positionLabel).includes(myPos);
        const regionMatch = me.bundesland && t.bundesland === me.bundesland;
        return posMatch || regionMatch;
      })
      .slice(0, 4);
  }, [teams, me]);

  // Mein eigenes Team (falls es aktiv sucht) aus der recruiting-list.
  const myRecruitingTeam = useMemo(
    () => (me?.teamAdminOf ? teams.find((t) => String(t._id) === String(me.teamAdminOf)) : null),
    [teams, me]
  );

  // Matching: transferbereite Spieler, die zur Suche meines Teams passen.
  const matchPlayers = useMemo(() => {
    if (!myRecruitingTeam) return [];
    const sought = (myRecruitingTeam.positions || []).map(positionLabel);
    return players
      .filter((p) => String(p.teamId?._id || p.teamId || "") !== String(myRecruitingTeam._id))
      .filter((p) => {
        const posMatch = sought.includes(positionLabel(p.position));
        const regionMatch =
          myRecruitingTeam.bundesland && p.bundesland === myRecruitingTeam.bundesland;
        return posMatch || regionMatch;
      })
      .slice(0, 4);
  }, [players, myRecruitingTeam]);

  const selectCls = `${inputClassSm} shadow-sm`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <PageHeader
        eyebrow="Wechselbörse"
        title="Transfermarkt"
        subtitle="Finde einen Verein – oder die passende Verstärkung."
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Passende Treffer (personalisiert) */}
        {(matchTeams.length > 0 || matchPlayers.length > 0) && (
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
            <h2 className="text-sm font-bold text-brand-700 mb-3">Passende Treffer für dich</h2>

            {matchTeams.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-2">Vereine, die jemanden wie dich suchen:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {matchTeams.map((t) => (
                    <Link
                      key={t._id}
                      href={`/team/team-detail/${t.slug}`}
                      className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 hover:border-brand-300"
                    >
                      <Avatar name={t.teamName} src={t.logo} className="h-8 w-8" textClass="text-[10px]" square />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">
                          {t.teamName}
                          {t.isDemo && <DemoBadge className="ml-1.5 align-middle" />}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {(t.positions || []).map(positionLabel).join(", ") || t.bundesland}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {matchPlayers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Spieler, die zu eurer Suche passen:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {matchPlayers.map((p) => (
                    <Link
                      key={p._id}
                      href={`/player/view-player/${p.slug || p._id}`}
                      className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 hover:border-brand-300"
                    >
                      <Avatar name={`${p.firstName} ${p.lastName}`} src={p.profileImage} className="h-8 w-8" textClass="text-[10px]" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">
                          {p.firstName} {p.lastName}
                          {p.isDemo && <DemoBadge className="ml-1.5 align-middle" />}
                        </span>
                        <span className="block text-xs text-gray-500 truncate">
                          {[positionLabel(p.position), p.bundesland].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs className="mb-5" tabs={TABS} value={view} onChange={setView} />

        {/* Dezenter Querverweis auf Tryouts */}
        <Link
          href="/tryouts"
          className="mb-6 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm hover:border-brand-200 hover:text-brand-700 transition-colors"
        >
          <FaBullhorn className="flex-shrink-0 text-brand-500" />
          <span className="flex-1">
            Auf der Suche nach einem Team? Schau auch bei offenen Probetrainings vorbei.
          </span>
          <span className="flex-shrink-0 inline-flex items-center gap-1 font-medium">
            Probetrainings ansehen <FaArrowRight className="text-xs" />
          </span>
        </Link>

        {/* Filter */}
        {/* Filterleiste: Suche volle Breite, Auswahlfelder zweispaltig,
            Umkreis eigene Zeile – gleiches Muster wie /spieler und /teams. */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === "players" ? "Name, Rolle, Liga oder Stadt…" : "Team, Rolle oder Stadt…"}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
          </div>
          <CityRadiusFilter value={geo} onChange={setGeo} />
        </div>

        {loading ? (
          <Skeleton className="h-3.5 w-20 mb-4" />
        ) : !error ? (
          <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wide">
            {list.length} {list.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <TransferCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Transferliste konnte nicht geladen werden." />
        ) : list.length === 0 ? (
          <EmptyState
            icon={FaExchangeAlt}
            title={
              query || position || land || geo.center
                ? "Keine passenden Einträge gefunden."
                : view === "players"
                ? "Aktuell ist niemand als transferbereit gelistet."
                : "Aktuell sucht kein Verein öffentlich Verstärkung."
            }
          />
        ) : view === "players" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredPlayers.map((p) => {
              const initials =
                `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
              return (
                <Link
                  key={p._id}
                  href={`/player/view-player/${p.slug || p._id}`}
                  className="min-w-0 break-words bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-brand-200 transition-[transform,box-shadow,border-color] duration-200 ease-out-strong hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-center gap-3">
                    {p.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImage}
                        alt={initials}
                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="h-12 w-12 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                        {initials || "?"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {p.firstName} {p.lastName}
                        {p.isDemo && <DemoBadge className="ml-2 align-middle" />}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {positionLabel(p.position) || "Position offen"}
                        {p.teamId?.teamName ? ` · aktuell: ${p.teamId.teamName}` : ""}
                      </p>
                      {(p.hometown || p.bundesland) && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
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
                          <span className="font-medium text-gray-700">Spielklasse:</span>{" "}
                          {p.preferredLeague}
                        </p>
                      )}
                      {p.transferNote && (
                        <p className="text-sm text-gray-600 break-words">{p.transferNote}</p>
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
                  className="min-w-0 break-words bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-200 transition-[transform,box-shadow,border-color] duration-200 ease-out-strong hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                >
                  <Link
                    href={`/team/team-detail/${t.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar name={t.teamName} src={t.logo} className="h-12 w-12" textClass="text-sm" square />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-brand-600">
                        {t.teamName}
                        {t.isDemo && <DemoBadge className="ml-2 align-middle" />}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.league?.name ? t.league.name : "Verein"}
                      </p>
                      {(t.region || t.bundesland) && (
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
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
                    <p className="mt-2 text-sm text-gray-600 break-words border-t border-gray-100 pt-2">{t.note}</p>
                  )}

                  {/* Direktkontakt: Beitritt anfragen */}
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    {js.msg ? (
                      <p className={`text-xs ${js.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                        {js.msg}
                      </p>
                    ) : loggedIn ? (
                      <Button
                        onClick={() => requestJoin(t._id)}
                        disabled={js.busy}
                        className="w-full"
                      >
                        {js.busy ? "Senden…" : "Beitritt anfragen"}
                      </Button>
                    ) : (
                      <Button href="/login" variant="secondary" className="w-full">
                        Zum Anfragen anmelden
                      </Button>
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
