"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiUsersBold, PiSignOutBold, PiArrowSquareOutBold } from "react-icons/pi";
import { clearTeamToken, clearPlayerToken } from "@/lib/clientAuth";

export default function TeamNav({ team }) {
  const router = useRouter();

  function logout() {
    // Teams sind spieler-geführt: vollständig abmelden
    clearTeamToken();
    clearPlayerToken();
    router.replace("/login");
  }

  return (
    <nav className="bg-ink-900 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/team/admin" className="flex items-center gap-2 font-bold text-paper-50">
          {team?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.logo}
              alt={team.teamName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-paper-50/15"
            />
          ) : (
            <PiUsersBold className="text-brand-400" />
          )}
          <span className="truncate max-w-[180px]">{team?.teamName || "Team"}</span>
        </Link>

        <div className="flex items-center gap-4">
          {team?.slug && (
            <Link
              href={`/team/team-detail/${team.slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-mist-300 hover:text-paper-50"
            >
              Öffentliches Profil <PiArrowSquareOutBold className="text-xs" />
            </Link>
          )}
          <button
            onClick={logout}
            className="text-paper-50/80 hover:text-brand-400 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <PiSignOutBold />
          </button>
        </div>
      </div>
    </nav>
  );
}
