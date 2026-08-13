"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Umschalter zwischen zwei GLEICHRANGIGEN Seiten – optisch identisch mit
// `components/ui/Tabs`, aber als echte Links: teilbar, in neuem Tab zu öffnen,
// für Suchmaschinen sichtbar. Genau das braucht ein Geschwisterpaar wie
// Topscorer (Spieler) und Rangliste (Teams).
//
// tabs: [{ href, label }]
export default function LinkTabs({ tabs = [], className = "", label = "Ansicht wechseln" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className={`inline-flex max-w-full gap-1 border-b border-navy-600 ${className}`}
    >
      {tabs.map((t) => {
        const aktiv = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={aktiv ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 sm:px-4 py-2 text-sm font-semibold tracking-tight transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 whitespace-nowrap ${
              aktiv
                ? "border-brand-500 text-paper-50"
                : "border-transparent text-mist-400 hover:text-paper-50 hover:border-navy-500"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
