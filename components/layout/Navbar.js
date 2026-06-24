"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  FaSearch,
  FaBell,
  FaTimes,
  FaBars,
  FaUser,
  FaUsers,
  FaShieldAlt,
  FaTrophy,
  FaBasketballBall,
  FaCalendarAlt,
  FaChevronDown,
  FaRegNewspaper,
} from "react-icons/fa";
import {
  getPlayerToken,
  clearPlayerToken,
  clearTeamToken,
  clearAdminToken,
} from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import { notificationHref } from "@/lib/notifications";
import Avatar from "@/components/Avatar";

// Öffentliche, login-bewusste Navigation im Navy-Look mit Wortmarken-Logo.
// Saubere Neuimplementierung in v2-Architektur (Original-Design, ohne Altlasten).
const PUBLIC_LINKS = [
  { href: "/ligen", label: "Ligen", icon: FaTrophy },
  { href: "/spiele", label: "Spiele", icon: FaCalendarAlt },
  { href: "/topscorer", label: "Topscorer", icon: FaBasketballBall },
  { href: "/teams", label: "Teams", icon: FaUsers },
];

export default function Navbar() {
  const [me, setMe] = useState(null); // null = unbekannt/ausgeloggt
  const [checked, setChecked] = useState(false);

  // Suche
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searchData, setSearchData] = useState(null); // {players, teams}
  const searchInputRef = useRef(null);

  // Benachrichtigungen
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoggedIn = !!me;

  const pathname = usePathname();
  // Aktive Seite markieren (exakt oder als Unterpfad).
  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  // Klassen-Helfer (konsistente Borders → kein Layout-Shift zwischen aktiv/inaktiv).
  const deskClass = (href) =>
    `text-sm transition-colors border-b-2 pb-0.5 ${
      isActive(href)
        ? "text-white font-semibold border-brand-500"
        : "text-gray-300 hover:text-white border-transparent"
    }`;
  const deskAdminClass = (href) =>
    `flex items-center gap-1.5 text-sm font-medium border-b-2 pb-0.5 ${
      isActive(href)
        ? "text-orange-300 border-brand-500"
        : "text-orange-400 hover:text-orange-300 border-transparent"
    }`;
  const mobClass = (href) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      isActive(href)
        ? "bg-slate-800 text-white border-brand-500"
        : "text-white hover:bg-slate-800 border-transparent"
    }`;
  const mobAdminClass = (href) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      isActive(href)
        ? "bg-slate-800 text-orange-300 border-brand-500"
        : "text-orange-400 hover:bg-slate-800 border-transparent"
    }`;

  // Eigenes Profil + Benachrichtigungen laden
  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      setChecked(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data } = await axios.post("/api/player/getmyinfo", { token });
        if (active) setMe(data.player || null);
      } catch {
        if (active) setMe(null);
      } finally {
        if (active) setChecked(true);
      }
      try {
        const { data } = await axios.post("/api/player/getnotifications", { token });
        if (active) {
          setNotifs(data.notifications || []);
          setUnread(data.unreadCount || 0);
        }
      } catch {
        /* ignorieren */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Klick außerhalb schließt Dropdowns
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function logout() {
    clearPlayerToken();
    clearTeamToken();
    clearAdminToken();
    window.location.href = "/";
  }

  const openSearch = useCallback(async () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
    if (!searchData) {
      try {
        const [p, t] = await Promise.all([
          axios.post("/api/player/fetchall"),
          axios.post("/api/team/fetchteams"),
        ]);
        setSearchData({
          players: p.data.players || [],
          teams: t.data.teams || [],
        });
      } catch {
        setSearchData({ players: [], teams: [] });
      }
    }
  }, [searchData]);

  function onSearchChange(e) {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term || !searchData) {
      setResults([]);
      return;
    }
    const q = term.toLowerCase();
    const players = (searchData.players || [])
      .filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({ ...p, _type: "player" }));
    const teams = (searchData.teams || [])
      .filter((t) => t.teamName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({ ...t, _type: "team" }));
    setResults([...players, ...teams]);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm("");
    setResults([]);
  }

  async function toggleNotif() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setNotifs((list) => list.map((n) => ({ ...n, read: true })));
      try {
        const token = getPlayerToken();
        await axios.post("/api/player/marknotificationsread", { token });
      } catch {
        /* ignorieren */
      }
    }
  }

  const teamSlug = me?.team?.slug || null;
  const teamName = me?.team?.teamName || null;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/logo.svg"
              alt="Hoops Germany"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop-Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {PUBLIC_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={deskClass(l.href)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Aktionen rechts */}
          <div className="flex items-center gap-4">
            <button
              onClick={openSearch}
              className="text-white hover:text-orange-400 transition-colors"
              aria-label="Suche öffnen"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative text-white hover:text-orange-400 transition-colors"
                  aria-label="Benachrichtigungen"
                >
                  <FaBell className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-9 sm:w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900 text-sm">Benachrichtigungen</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifs.length === 0 ? (
                        <p className="px-4 py-8 text-center text-gray-400 text-sm">
                          Keine Benachrichtigungen
                        </p>
                      ) : (
                        notifs.map((n, i) => {
                          const href = notificationHref(n, me);
                          const inner = (
                            <div
                              className={`flex gap-3 px-4 py-3 ${n.read ? "" : "bg-orange-50"} ${
                                href ? "hover:bg-gray-50 transition-colors" : ""
                              }`}
                            >
                              <span className="h-8 w-8 flex-shrink-0 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                <FaBasketballBall className="text-sm" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          );
                          return href ? (
                            <Link key={n._id || i} href={href} onClick={() => setNotifOpen(false)}>
                              {inner}
                            </Link>
                          ) : (
                            <div key={n._id || i}>{inner}</div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop: Login-State */}
            {checked && (
              <div className="hidden md:flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    {me?.isSuperAdmin && (
                      <Link
                        href="/admin/dashboard"
                        aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                        className={deskAdminClass("/admin/dashboard")}
                      >
                        <FaShieldAlt className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    {me?.isTeamAdmin && !me?.isSuperAdmin && (
                      <Link
                        href="/team/admin"
                        aria-current={isActive("/team/admin") ? "page" : undefined}
                        className={deskAdminClass("/team/admin")}
                      >
                        <FaTrophy className="w-4 h-4" /> Team-Admin
                      </Link>
                    )}
                    {!me?.isTeamAdmin && !me?.isSuperAdmin && (
                      <Link
                        href="/team/create"
                        aria-current={isActive("/team/create") ? "page" : undefined}
                        className={deskClass("/team/create")}
                      >
                        Team gründen
                      </Link>
                    )}
                    {teamSlug && (
                      <Link
                        href={`/team/team-detail/${teamSlug}`}
                        aria-current={isActive(`/team/team-detail/${teamSlug}`) ? "page" : undefined}
                        className={deskClass(`/team/team-detail/${teamSlug}`)}
                        title={teamName || "Mein Team"}
                      >
                        Mein Team
                      </Link>
                    )}
                    <Link
                      href="/player/newsfeed"
                      aria-current={isActive("/player/newsfeed") ? "page" : undefined}
                      className={deskClass("/player/newsfeed")}
                    >
                      Feed
                    </Link>
                    <Link
                      href="/player/player-detail"
                      aria-current={isActive("/player/player-detail") ? "page" : undefined}
                      className={deskClass("/player/player-detail")}
                    >
                      Mein Profil
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      aria-current={isActive("/login") ? "page" : undefined}
                      className={deskClass("/login")}
                    >
                      Anmelden
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile-Toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden text-white hover:text-orange-400 transition-colors"
              aria-label="Menü öffnen"
            >
              {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile-Menü */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-700 divide-y divide-slate-700/60">
            {PUBLIC_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={mobClass(l.href)}
                >
                  <Icon className="text-orange-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{l.label}</span>
                </Link>
              );
            })}
            {isLoggedIn ? (
              <>
                {teamSlug && (
                  <Link
                    href={`/team/team-detail/${teamSlug}`}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(`/team/team-detail/${teamSlug}`) ? "page" : undefined}
                    className={mobClass(`/team/team-detail/${teamSlug}`)}
                  >
                    <FaBasketballBall className="text-orange-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Mein Team</span>
                  </Link>
                )}
                <Link
                  href="/player/newsfeed"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/newsfeed") ? "page" : undefined}
                  className={mobClass("/player/newsfeed")}
                >
                  <FaRegNewspaper className="text-orange-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Feed</span>
                </Link>
                <Link
                  href="/player/player-detail"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/player-detail") ? "page" : undefined}
                  className={mobClass("/player/player-detail")}
                >
                  <FaUser className="text-orange-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Mein Profil</span>
                </Link>
                {me?.isSuperAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                    className={mobAdminClass("/admin/dashboard")}
                  >
                    <FaShieldAlt className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Super Admin</span>
                  </Link>
                )}
                {me?.isTeamAdmin && !me?.isSuperAdmin && (
                  <Link
                    href="/team/admin"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/team/admin") ? "page" : undefined}
                    className={mobAdminClass("/team/admin")}
                  >
                    <FaTrophy className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Team-Admin</span>
                  </Link>
                )}
                {!me?.isTeamAdmin && !me?.isSuperAdmin && (
                  <Link
                    href="/team/create"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/team/create") ? "page" : undefined}
                    className={mobClass("/team/create")}
                  >
                    <FaUsers className="text-orange-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Team gründen</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-5 py-3.5 w-full text-left text-gray-400 hover:bg-slate-800 transition-colors"
                >
                  <FaTimes className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Abmelden</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/login") ? "page" : undefined}
                  className={mobClass("/login")}
                >
                  <FaUser className="text-orange-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Anmelden</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-orange-400 hover:bg-slate-800 transition-colors"
                >
                  <FaBasketballBall className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-bold">Registrieren</span>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Such-Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <FaSearch className="text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Spieler oder Team suchen…"
                className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400"
                value={searchTerm}
                onChange={onSearchChange}
              />
              <button
                onClick={closeSearch}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Suche schließen"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {searchTerm && results.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-400 text-sm">
                  {searchData ? "Keine Ergebnisse" : "Lädt…"}
                </div>
              )}
              {results.map((item) =>
                item._type === "team" ? (
                  <Link
                    key={`t-${item._id}`}
                    href={`/team/team-detail/${item.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar name={item.teamName} src={item.logo} className="w-9 h-9" textClass="text-xs" square />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.teamName}</p>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Team
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={`p-${item._id}`}
                    href={item.slug ? `/player/view-player/${item.slug}` : "#"}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar
                      name={`${item.firstName} ${item.lastName}`}
                      src={item.profileImage}
                      className="w-9 h-9"
                      textClass="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.firstName} {item.lastName}
                      </p>
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Spieler
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
