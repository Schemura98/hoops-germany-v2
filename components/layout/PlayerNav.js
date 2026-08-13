"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PiSignOutBold,
  PiListBold,
  PiXBold,
  PiShieldCheckBold,
  PiTrophyBold,
  PiDeviceMobileBold,
} from "react-icons/pi";
import { clearPlayerToken, setStoredPlayer } from "@/lib/clientAuth";
import NotificationBell from "@/components/layout/NotificationBell";

// Gleiche Ordnung wie in der öffentlichen Navbar (Befund R7/K8, 13.08.2026):
// „Bestenlisten" trägt Topscorer UND Rangliste – die Rangliste war aus keiner
// Navigationsliste des Projekts erreichbar. Im Mobil-Menü tragen die Punkte
// Gruppentitel; die senkrechte Liste kann sich das leisten.
//
// Gruppe „Wechseln" nachgetragen (13.08.2026): Der Newsfeed rendert KEINEN
// Footer, und diese Leiste kannte weder Transfermarkt noch Tryouts. Ein
// eingeloggter Spieler stand auf seiner Startseite damit vor einer echten
// Sackgasse – er musste erst eine öffentliche Seite ansteuern, um überhaupt an
// die Navbar zu kommen, die beides führt. Betroffen war ausgerechnet die
// Zielgruppe, für die beide Seiten gebaut sind (Vereinslose, Z3).
//
// `nurMobil` heißt: erscheint im Mobil-Menü, nicht in der waagerechten Leiste.
// Auf dem Handy kostet eine Zeile mehr nichts, waagerecht kostet sie einen von
// sieben Plätzen. /transfermarkt führt prominent auf /tryouts weiter (und seit
// heute Nacht auch zurück) – der Weg bleibt also einen Klick lang.
const NAV_GRUPPEN = [
  {
    titel: "Wettbewerb",
    links: [
      { href: "/ligen", label: "Ligen" },
      { href: "/spiele", label: "Spiele" },
      { href: "/topscorer", label: "Bestenlisten", auchAktivAuf: ["/rangliste"] },
    ],
  },
  {
    titel: "Wer spielt",
    links: [
      { href: "/teams", label: "Teams" },
      { href: "/spieler", label: "Spieler" },
    ],
  },
  {
    titel: "Wechseln",
    links: [
      { href: "/transfermarkt", label: "Transfermarkt" },
      { href: "/tryouts", label: "Tryouts", nurMobil: true },
    ],
  },
];

const START = { href: "/player/newsfeed", label: "Newsfeed" };
const PROFIL = { href: "/player/player-detail", label: "Mein Profil" };

// Waagerechte Leiste: OHNE „Mein Profil" – direkt daneben steht dasselbe Ziel
// als Bild-und-Name-Verknüpfung (größeres Ziel, eindeutiger). Der Platz gehört
// dem Transfermarkt, der bisher gar nicht erreichbar war. Punktzahl unverändert.
const links = [START, ...NAV_GRUPPEN.flatMap((g) => g.links).filter((l) => !l.nurMobil)];

// Eine Zeile im Mobil-Menü (aktiv = Markenkante links, wie am aktiven Tab).
const zeileClass = (aktiv) =>
  `block px-5 py-3.5 text-sm font-medium border-l-4 transition-colors ${
    aktiv
      ? "bg-navy-800 text-paper-50 border-brand-500"
      : "text-mist-300 hover:bg-navy-700 hover:text-paper-50 border-transparent"
  }`;

export default function PlayerNav({ player }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Aktive Seite markieren (exakt oder als Unterpfad).
  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  // Ein Punkt kann für mehrere Seiten stehen („Bestenlisten" = Topscorer + Rangliste).
  const linkAktiv = (l) =>
    isActive(l.href) || (l.auchAktivAuf || []).some((h) => isActive(h));

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
    ? { href: "/admin/dashboard", label: "Super Admin", Icon: PiShieldCheckBold }
    : player?.isTeamAdmin
    ? { href: "/team/admin", label: "Team-Admin", Icon: PiTrophyBold }
    : null;
  const AdminIcon = adminLink?.Icon;

  return (
    <nav className="bg-navy-900 sticky top-0 z-50">
      {/* max-w-6xl wie die Gast-Navbar (Fund von Tobias, 13.08.2026). Mit
          max-w-5xl war der Streifen 128 px schmaler als die oeffentliche Leiste
          — bei inzwischen sieben Punkten plus Admin-Verweis, Glocke, Suche und
          Avatar klebten Wortmarke und erster Punkt aneinander („HOOPS
          GERMANYLigen") und die laengeren Beschriftungen brachen zweizeilig um.
          Unabhaengig von der Fensterbreite, weil die Begrenzung am Container
          hing, nicht am Bildschirm. */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/images/logo.svg" alt="Hoops Germany" className="h-9 w-auto object-contain" />
        </Link>

        {/* Inline-Navigation ab großen Screens, sonst Hamburger */}
        <div className="hidden lg:flex items-center gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={linkAktiv(l) ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap text-sm transition-colors border-b-2 pb-0.5 ${
                linkAktiv(l)
                  ? "text-paper-50 font-semibold border-brand-500"
                  : "text-mist-300 hover:text-paper-50 border-transparent"
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
            // Seit die waagerechte Leiste „Mein Profil" nicht mehr doppelt
            // führt, ist das hier der Profil-Punkt – also trägt er auch dessen
            // Markierung.
            aria-current={isActive("/player/player-detail") ? "page" : undefined}
            className="flex items-center gap-2 px-1 rounded-full hover:bg-navy-700/5 transition-colors"
            title="Mein Profil"
          >
            {player?.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImage}
                alt={initials}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-paper-50/15"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold flex items-center justify-center">
                {initials}
              </span>
            )}
            <span className="hidden sm:block text-sm text-mist-300 hover:text-paper-50">{player?.firstName}</span>
          </Link>
          {/* Abmelden: auf Mobil im Hamburger-Menü, hier nur ab Desktop */}
          <button
            onClick={logout}
            className="hidden lg:block p-2 -m-1 text-paper-50/80 hover:text-brand-400 transition-colors"
            aria-label="Abmelden"
            title="Abmelden"
          >
            <PiSignOutBold />
          </button>
          {/* Mobile-Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 -m-1 text-paper-50/80 hover:text-brand-400 transition-colors"
            aria-label="Menü"
          >
            {mobileOpen ? <PiXBold className="w-5 h-5" /> : <PiListBold className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy-900 border-t border-navy-600 divide-y divide-navy-600/60">
          <Link
            href={START.href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive(START.href) ? "page" : undefined}
            className={zeileClass(isActive(START.href))}
          >
            {START.label}
          </Link>
          {NAV_GRUPPEN.map((g) => (
            <div key={g.titel}>
              <p className="bg-navy-950 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
                {g.titel}
              </p>
              <div className="divide-y divide-navy-600/60">
                {g.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={linkAktiv(l) ? "page" : undefined}
                    className={zeileClass(linkAktiv(l))}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <p className="bg-navy-950 px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
            Mein Bereich
          </p>
          <Link
            href={PROFIL.href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive(PROFIL.href) ? "page" : undefined}
            className={zeileClass(isActive(PROFIL.href))}
          >
            {PROFIL.label}
          </Link>
          {/* Die PWA-Seite stand bisher nur im Footer – ausgerechnet die Seite,
              die am direktesten auf Wiederkehr einzahlt (Symbol auf dem
              Startbildschirm). Sie gehört zum Konto, nicht zu den Inhalten,
              deshalb steht sie hier und nicht in der Hauptleiste. */}
          <Link
            href="/installieren"
            onClick={() => setMobileOpen(false)}
            aria-current={isActive("/installieren") ? "page" : undefined}
            className={`flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
              isActive("/installieren")
                ? "bg-navy-800 text-paper-50 border-brand-500"
                : "text-mist-300 hover:bg-navy-700 hover:text-paper-50 border-transparent"
            }`}
          >
            <PiDeviceMobileBold className="w-4 h-4 flex-shrink-0 text-brand-400" />
            <span className="text-sm font-medium">App installieren</span>
          </Link>
          {adminLink && (
            <Link
              href={adminLink.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(adminLink.href) ? "page" : undefined}
              className={`flex items-center gap-3 px-5 py-3.5 border-l-4 transition-colors ${
                isActive(adminLink.href)
                  ? "bg-navy-800 text-brand-300 border-brand-500"
                  : "text-brand-400 hover:bg-navy-700 border-transparent"
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
            className="flex w-full items-center gap-3 px-5 py-3.5 border-l-4 border-transparent text-mist-400 hover:bg-navy-700 hover:text-paper-50 transition-colors"
          >
            <PiSignOutBold className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      )}
    </nav>
  );
}
