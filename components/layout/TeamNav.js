"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUsers, FaSignOutAlt, FaExternalLinkAlt } from "react-icons/fa";
import { clearTeamToken } from "@/lib/clientAuth";

export default function TeamNav({ team }) {
  const router = useRouter();

  function logout() {
    clearTeamToken();
    router.replace("/team/login");
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-16">
        <Link
          href="/team/admin"
          className="flex items-center gap-2 font-bold text-gray-900"
        >
          {team?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.logo}
              alt={team.teamName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <FaUsers className="text-brand-500" />
          )}
          <span className="truncate max-w-[180px]">{team?.teamName || "Team"}</span>
        </Link>

        <div className="flex items-center gap-4">
          {team?.slug && (
            <Link
              href={`/team/team-detail/${team.slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600"
            >
              Öffentliches Profil <FaExternalLinkAlt className="text-xs" />
            </Link>
          )}
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
