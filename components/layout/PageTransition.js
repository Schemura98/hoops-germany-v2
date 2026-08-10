"use client";

import { usePathname } from "next/navigation";

// Leichter, rein CSS-basierter Enter-Effekt für Seiteninhalte (kein Router-
// Hack, keine react-view-transitions – die API braucht React 19). Der Key
// auf dem Pathname sorgt dafür, dass die Animation bei jedem Routenwechsel
// neu abspielt. Seiten remounten beim Navigieren ohnehin bereits (kein
// gemeinsames Layout mit Navbar), diese Komponente kostet also nichts
// zusätzlich – sie fügt nur die Übergangs-Klasse hinzu.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in motion-reduce:animate-none">
      {children}
    </div>
  );
}
