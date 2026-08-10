"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaShieldAlt,
  FaTrophy,
} from "react-icons/fa";
import { clearPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import NotificationBell from "@/components/layout/NotificationBell";

const links = [
  { href: "/player/newsfeed", label: "Newsfeed" },
  { href: "/spieler", label: "Spieler" },
  { href: "/teams", label: "Teams" },
  { href: "/spiele", label: "Spiele" },
  { href: "/ligen", label: "Ligen" },
  { href: "/topscorer", label: "Topscorer" },
  { href: "/player/player-detail", label: "Mein Profil" },
];

export default function PlayerNav({ player }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Aktive Seite markieren (exakt oder als Unterpfad).
  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  function logout() {
    clearPlayerToken();
    setStoredPlayer(null);
    router.replace("/login");
  }

  const initials =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  // Admin-Verknüpfung je nach Rolle (Super-Admin > Team-Admin).
  const adminLink = player?.isSuperAdmin
    ? { href: "/admin/dashboard", label: "Super Admin", Icon: FaShieldAlt }
    : player?.isTeamAdmin
    ? { href: "/team/admin", label: "Team-Admin", Icon: FaTrophy }
    : null;
  const AdminIcon = adminLink?.Icon;

  return (
    <nav className="bg-gradient-to-r from-slate-950 to-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/images/logo.svg" alt="Hoops Germany" className="h-9 w-auto object-contain" />
        </Link>

        {/* Inline-Navigation ab großen Screens, sonst Hamburger */}
        <div className="hidden lg:flex items-center gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`text-sm transition-colors border-b-2 pb-0.5 ${
                isActive(l.href)
                  ? "text-white font-semibold border-brand-500"
                  : "text-gray-300 hover:text-white border-transparent"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {adminLink && (
            <Link
              href={adminLink.href}
              aria-current={isActive(adminLink.href) ? "page" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium border-b-2 pb-0.5 ${
                isActive(adminLink.href)
                  ? "text-brand-300 border-brand-500"
                  : "text-brand-400 hover:text-brand-300 border-transparent"
              }`}
            >
              <AdminIcon className="w-4 h-4" /> {adminLink.label}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 -mr-1">
          <NotificationBell />
          <Link
            href="/player/player-detail"
            className="flex items-center gap-2 px-1 rounded-full hover:bg-white/5 transition-colors"
            title="Mein Profil"
          >
            {player?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImage}
                alt={initials}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white/15"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold flex items-center justify-center">
                {initials}
              </span>
            )}
            <span className="hidden sm:block text-sm text-gray-200 hover:text-white">{player?.firstName}</span>
          </Link>
          {/* Abmelden: auf Mobil im Hamburger-Menü, hier nur ab Desktop */}
          <button
            onClick={logout}
            className="hidden lg:block p-2 -m-1 text-white/80 hover:text-brand-400 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <FaSignOutAlt />
          </button>
          {/* Mobile-Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 -m-1 text-white/80 hover:text-brand-400 transition-colors"
            aria-label="Menü"
          >
            {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {mobileOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-700 divide-y divide-slate-700/60">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`block px-5 py-3.5 text-sm font-medium border-l-4 transition-colors ${
                isActive(l.href)
                  ? "bg-slate-800 text-white border-brand-500"
                  : "text-gray-200 hover:bg-slate-800 hover:text-white border-transparent"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {adminLink && (
            <Link
              href={adminLink.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(adminLink.href) ? "page" : undefined}
              className={`flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
                isActive(adminLink.href)
                  ? "bg-slate-800 text-brand-300 border-brand-500"
                  : "text-brand-400 hover:bg-slate-800 border-transparent"
              }`}
            >
              <AdminIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{adminLink.label}</span>
            </Link>
          )}
          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-5 py-3.5 border-l-4 border-transparent text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      )}
    </nav>
  );
}
