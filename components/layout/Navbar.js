"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  PiMagnifyingGlassBold,
  PiBellBold,
  PiXBold,
  PiListBold,
  PiUserBold,
  PiUsersBold,
  PiShieldCheckBold,
  PiTrophyBold,
  PiBasketballBold,
  PiCalendarBlankBold,
  PiCaretDownBold,
  PiNewspaperClippingBold,
  PiArrowsLeftRightBold,
  PiMegaphoneBold,
} from "react-icons/pi";
import {
  getPlayerToken,
  clearPlayerToken,
  clearTeamToken,
  clearAdminToken,
} from "@/lib/clientAuth";
import { timeAgo } from "@/lib/timeAgo";
import { notificationHref } from "@/lib/notifications";
import Avatar from "@/components/Avatar";
import Reveal from "@/components/ui/Reveal";

// Öffentliche, login-bewusste Navigation auf ink-900 mit Wortmarken-Logo.
// Der aktive Punkt wird durch die 2px-Brand-Leiste markiert – dasselbe Signal
// wie am aktiven Tab (visuelle Richtung „Anzeigetafel", Abschnitt 4).
// Saubere Neuimplementierung in v2-Architektur (Original-Design, ohne Altlasten).
const PUBLIC_LINKS = [
  { href: "/ligen", label: "Ligen", icon: PiTrophyBold },
  { href: "/spiele", label: "Spiele", icon: PiCalendarBlankBold },
  { href: "/teams", label: "Teams", icon: PiUsersBold },
  { href: "/spieler", label: "Spieler", icon: PiUserBold },
  { href: "/transfermarkt", label: "Transfermarkt", icon: PiArrowsLeftRightBold },
  { href: "/tryouts", label: "Tryouts", icon: PiMegaphoneBold },
  { href: "/topscorer", label: "Topscorer", icon: PiBasketballBold },
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
        ? "text-paper-50 font-semibold border-brand-500"
        : "text-mist-300 hover:text-paper-50 border-transparent"
    }`;
  const deskAdminClass = (href) =>
    `flex items-center gap-1.5 text-sm font-medium border-b-2 pb-0.5 ${
      isActive(href)
        ? "text-brand-300 border-brand-500"
        : "text-brand-400 hover:text-brand-300 border-transparent"
    }`;
  const mobClass = (href) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      isActive(href)
        ? "bg-ink-800 text-paper-50 border-brand-500"
        : "text-paper-50 hover:bg-ink-700 border-transparent"
    }`;
  const mobAdminClass = (href) =>
    `flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
      isActive(href)
        ? "bg-ink-800 text-brand-300 border-brand-500"
        : "text-brand-400 hover:bg-ink-700 border-transparent"
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
      <nav className="sticky top-0 z-50 bg-ink-900 text-paper-50 border-b border-ink-600">
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
          <div className="hidden lg:flex items-center gap-5">
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
              className="text-paper-50 hover:text-brand-400 transition-colors"
              aria-label="Suche öffnen"
            >
              <PiMagnifyingGlassBold className="w-5 h-5" />
            </button>

            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative text-paper-50 hover:text-brand-400 transition-colors"
                  aria-label="Benachrichtigungen"
                >
                  <PiBellBold className="w-5 h-5" />
                  {unread > 0 && (
                    <Reveal
                      key={unread}
                      as="span"
                      direction="pop"
                      duration={200}
                      className="absolute -top-1.5 -right-1.5 bg-signal-error text-paper-50 text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center leading-none"
                    >
                      {unread > 9 ? "9+" : unread}
                    </Reveal>
                  )}
                </button>

                {notifOpen && (
                  <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-9 sm:w-80 bg-ink-800 border border-ink-600 rounded-md z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-ink-600">
                      <h3 className="font-bold text-paper-50 text-sm">Benachrichtigungen</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-ink-600">
                      {notifs.length === 0 ? (
                        <p className="px-4 py-8 text-center text-mist-400 text-sm">
                          Keine Benachrichtigungen
                        </p>
                      ) : (
                        notifs.map((n, i) => {
                          const href = notificationHref(n, me);
                          const inner = (
                            <div
                              className={`flex gap-3 px-4 py-3 ${n.read ? "" : "bg-brand-500/10"} ${
                                href ? "hover:bg-ink-700 transition-colors" : ""
                              }`}
                            >
                              <span className="h-8 w-8 flex-shrink-0 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center">
                                <PiBasketballBold className="text-sm" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-paper-50 leading-snug">{n.message}</p>
                                <p className="text-xs text-mist-400 mt-0.5">{timeAgo(n.createdAt)}</p>
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
              <div className="hidden lg:flex items-center gap-4">
                {isLoggedIn ? (
                  <>
                    {me?.isSuperAdmin && (
                      <Link
                        href="/admin/dashboard"
                        aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                        className={deskAdminClass("/admin/dashboard")}
                      >
                        <PiShieldCheckBold className="w-4 h-4" /> Admin
                      </Link>
                    )}
                    {me?.isTeamAdmin && !me?.isSuperAdmin && (
                      <Link
                        href="/team/admin"
                        aria-current={isActive("/team/admin") ? "page" : undefined}
                        className={deskAdminClass("/team/admin")}
                      >
                        <PiTrophyBold className="w-4 h-4" /> Team-Admin
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
                      className="text-sm text-mist-300 hover:text-paper-50 transition-colors"
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
                      className="bg-brand-500 hover:bg-brand-400 text-ink-950 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
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
              className="lg:hidden text-paper-50 hover:text-brand-400 transition-colors"
              aria-label="Menü öffnen"
            >
              {mobileOpen ? <PiXBold className="w-5 h-5" /> : <PiListBold className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile-Menü */}
        {mobileOpen && (
          <div className="lg:hidden bg-ink-900 border-t border-ink-600 divide-y divide-ink-600/60">
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
                  <Icon className="text-brand-400 w-4 h-4 flex-shrink-0" />
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
                    <PiBasketballBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Mein Team</span>
                  </Link>
                )}
                <Link
                  href="/player/newsfeed"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/newsfeed") ? "page" : undefined}
                  className={mobClass("/player/newsfeed")}
                >
                  <PiNewspaperClippingBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Feed</span>
                </Link>
                <Link
                  href="/player/player-detail"
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive("/player/player-detail") ? "page" : undefined}
                  className={mobClass("/player/player-detail")}
                >
                  <PiUserBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Mein Profil</span>
                </Link>
                {me?.isSuperAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/admin/dashboard") ? "page" : undefined}
                    className={mobAdminClass("/admin/dashboard")}
                  >
                    <PiShieldCheckBold className="w-4 h-4 flex-shrink-0" />
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
                    <PiTrophyBold className="w-4 h-4 flex-shrink-0" />
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
                    <PiUsersBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Team gründen</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-5 py-3.5 w-full text-left text-mist-600 hover:bg-ink-700 transition-colors"
                >
                  <PiXBold className="w-4 h-4 flex-shrink-0" />
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
                  <PiUserBold className="text-brand-400 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Anmelden</span>
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-brand-400 hover:bg-ink-700 transition-colors"
                >
                  <PiBasketballBold className="w-4 h-4 flex-shrink-0" />
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
          <div className="bg-ink-800 border border-ink-600 rounded-md w-full max-w-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-600">
              <PiMagnifyingGlassBold className="text-mist-600 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Spieler oder Team suchen…"
                className="flex-1 outline-none text-sm text-paper-50 placeholder-ink-500"
                value={searchTerm}
                onChange={onSearchChange}
              />
              <button
                onClick={closeSearch}
                className="text-mist-400 hover:text-mist-300 transition-colors"
                aria-label="Suche schließen"
              >
                <PiXBold className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-ink-600">
              {searchTerm && results.length === 0 && (
                <div className="px-4 py-6 text-center text-mist-400 text-sm">
                  {searchData ? "Keine Ergebnisse" : "Lädt…"}
                </div>
              )}
              {results.map((item) =>
                item._type === "team" ? (
                  <Link
                    key={`t-${item._id}`}
                    href={`/team/team-detail/${item.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-ink-700 transition-colors"
                  >
                    <Avatar name={item.teamName} src={item.logo} className="w-9 h-9" textClass="text-xs" square />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-paper-50 truncate">{item.teamName}</p>
                      <span className="text-[10px] font-bold text-mist-400 bg-ink-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Team
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={`p-${item._id}`}
                    href={item.slug ? `/player/view-player/${item.slug}` : "#"}
                    onClick={closeSearch}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-ink-700 transition-colors"
                  >
                    <Avatar
                      name={`${item.firstName} ${item.lastName}`}
                      src={item.profileImage}
                      className="w-9 h-9"
                      textClass="text-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-paper-50 truncate">
                        {item.firstName} {item.lastName}
                      </p>
                      <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
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
