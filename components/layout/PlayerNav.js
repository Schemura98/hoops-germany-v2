"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { clearPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import NotificationBell from "@/components/layout/NotificationBell";

const links = [
  { href: "/player/newsfeed", label: "Newsfeed" },
  { href: "/spieler", label: "Spieler" },
  { href: "/teams", label: "Teams" },
  { href: "/spiele", label: "Spiele" },
  { href: "/player/player-detail", label: "Mein Profil" },
];

export default function PlayerNav({ player }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    clearPlayerToken();
    setStoredPlayer(null);
    router.replace("/login");
  }

  const initials =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <nav className="bg-gradient-to-r from-slate-950 to-slate-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/player/newsfeed" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/images/logo.svg" alt="Hoops Germany" className="h-9 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2">
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
            <span className="hidden sm:block text-sm text-gray-200">{player?.firstName}</span>
          </div>
          <button
            onClick={logout}
            className="text-white/80 hover:text-orange-400 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <FaSignOutAlt />
          </button>
          {/* Mobile-Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-white/80 hover:text-orange-400 transition-colors"
            aria-label="Menü"
          >
            {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700 divide-y divide-slate-700/60">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-5 py-3.5 text-sm font-medium text-gray-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
