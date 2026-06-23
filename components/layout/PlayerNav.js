"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBasketballBall, FaSignOutAlt } from "react-icons/fa";
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

  function logout() {
    clearPlayerToken();
    setStoredPlayer(null);
    router.replace("/login");
  }

  const initials =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() ||
    "?";

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/player/newsfeed"
          className="flex items-center gap-2 font-bold text-gray-900"
        >
          <FaBasketballBall className="text-brand-500" />
          Hoops Germany
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2">
            {player?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImage}
                alt={initials}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                {initials}
              </span>
            )}
            <span className="hidden sm:block text-sm text-gray-700">
              {player?.firstName}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-brand-600 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </nav>
  );
}
