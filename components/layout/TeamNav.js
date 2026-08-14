"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiUsersBold, PiSignOutBold, PiArrowSquareOutBold } from "react-icons/pi";
import { clearTeamToken, clearPlayerToken } from "@/lib/clientAuth";
import FeedbackLink from "@/components/layout/FeedbackLink";

export default function TeamNav({ team }) {
  const router = useRouter();

  function logout() {
    // Teams sind spieler-geführt: vollständig abmelden
    clearTeamToken();
    clearPlayerToken();
    router.replace("/login");
  }

  return (
    <nav className="bg-navy-900 sticky top-0 z-50">
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
          {/* Feedback fest im Chrome statt als schwebender Knopf – Herkunft
              und Begründung in components/layout/FeedbackLink.js. */}
          <FeedbackLink />
          {/* `p-2 -m-1` + feste Symbolgröße wie bei den Nachbarn. Vorher rendete
              das Symbol in Standardgröße ohne Padding und maß ~16×16 px – der
              letzte bekannte Verstoß gegen WCAG 2.5.8 (24 px), gefunden von Kai
              am 14.08.2026, und ausgerechnet auf `/team/admin`, einer stark
              mobil genutzten Fläche. */}
          <button
            onClick={logout}
            className="p-2 -m-1 text-paper-50/80 hover:text-brand-400 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <PiSignOutBold className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
