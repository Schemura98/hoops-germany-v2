"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PiShieldCheckBold, PiSignOutBold, PiArrowLeftBold } from "react-icons/pi";
import { clearAdminToken } from "@/lib/clientAuth";

const links = [
  { href: "/admin/dashboard", label: "Übersicht" },
  { href: "/admin/players", label: "Spieler" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/matches", label: "Spiele" },
  { href: "/admin/leagues", label: "Ligen" },
  { href: "/admin/league-requests", label: "Liga-Anfragen" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/feedback", label: "Feedback" },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  return (
    <nav className="bg-ink-900 text-paper-50 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
          <PiShieldCheckBold className="text-brand-400" />
          Admin
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap px-3 py-1.5 rounded-sm text-sm transition-colors ${
                  active ? "bg-brand-500 text-ink-950" : "text-mist-300 hover:bg-ink-700"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/player/newsfeed"
            className="ml-2 inline-flex items-center gap-1.5 whitespace-nowrap text-mist-300 hover:text-paper-50 text-sm"
            title="Zurück zur Seite"
          >
            <PiArrowLeftBold className="text-xs" /> Zur Seite
          </Link>
          <button
            onClick={logout}
            className="ml-1 text-mist-600 hover:text-brand-400"
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
