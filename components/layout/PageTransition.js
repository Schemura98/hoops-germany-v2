"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Seitenwechsel (Wow-Konzept Stufe C.3).
//
// Zwei Ebenen, bewusst getrennt:
//
// 1. Der Enter-Effekt am Inhalt (`animate-page-in`). Er läuft überall, braucht
//    keine Browser-Neuerung und war schon vorher da.
//
// 2. Ein weicher Übergang über die native `document.startViewTransition()`.
//    Ausdrücklich die BROWSER-API, nicht das React-`ViewTransition`-Experiment
//    aus dem React-19-Kanal – das ist mit Next 14.2.35/React 18 nicht
//    kompatibel. Browser ohne Unterstützung (heute vor allem Firefox und
//    ältere Safari) bekommen den normalen, sofortigen Seitenwechsel; das ist
//    kein Fehlerzustand, sondern der Ausgangszustand.
//
// Warum NUR ausgezeichnete Verweise (`data-vt`) und nicht jede Navigation:
// Der erste Entwurf hing an jedem Klick im Dokument – und feuerte nie. Grund:
// Next.js' <Link> ruft in seinem eigenen React-Handler `preventDefault()`, und
// der läuft vor einem Listener auf `document`. Die naheliegende Abhilfe wäre
// die Capture-Phase gewesen; dort hätte ein `stopPropagation()` aber auch die
// eigenen onClick-Handler der Verweise verschluckt – etwa das Schließen des
// mobilen Menüs. Für einen weichen Übergang eine Bedienfunktion zu opfern wäre
// der schlechteste Tausch der ganzen Stufe.
//
// Deshalb greift der Übergang genau dort, wo Vivien ihn vorgesehen hat: an der
// Team- und Spielerkarte, die zur Detailseite führt („Trading-Card"-Moment).
// Diese Verweise tragen keine eigenen Klick-Handler, hier ist die
// Capture-Phase gefahrlos. Alles andere navigiert unverändert.

// Obergrenze, wie lange der Browser das alte Bild halten darf. Unsere
// Detailseiten laden ihre Daten erst im Client nach; ohne Deckel würde der
// Übergang auf ein Ergebnis warten, das erst nach einer Netzwerkrunde kommt –
// und der Nutzer sähe so lange ein eingefrorenes Bild. Lieber ein kurzer
// Übergang auf den Ladezustand als ein langer auf den fertigen Inhalt.
const MAX_MS = 320;

function darfUebergehen(e) {
  if (e.defaultPrevented || e.button !== 0) return null;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;

  const a = e.target?.closest?.("a[data-vt][href]");
  if (!a) return null;
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download")) return null;

  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Reiner Sprungmarken-Wechsel auf derselben Seite: Da gibt es nichts zu
  // überblenden, und ein Übergang würde das Springen nur verzögern.
  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return null;
  }
  return url.pathname + url.search;
}

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e) => {
      const ziel = darfUebergehen(e);
      if (!ziel) return;
      e.preventDefault();
      // In der Capture-Phase abgefangen: Ohne das Stoppen würde Next.js'
      // eigener Handler zusätzlich navigieren und einen doppelten
      // Verlaufseintrag hinterlassen.
      e.stopPropagation();
      try {
        // Während der Blende darf der Enter-Effekt des Inhalts nicht zusätzlich
        // laufen – sonst blendet erst die Seite über und der neue Inhalt danach
        // noch einmal ein. Zwei Bewegungen für einen Vorgang wirken unruhig.
        document.documentElement.dataset.vtRunning = "";
        const vt = document.startViewTransition(() => {
          router.push(ziel);
          // Auflösen, sobald der Pfad gewechselt hat – spätestens aber nach
          // MAX_MS. `finally` gibt es hier nicht: Die Zusage darf unter keinen
          // Umständen offen bleiben, sonst hält der Browser das alte Bild fest.
          return new Promise((fertig) => {
            const start = performance.now();
            const pruefen = () => {
              if (
                window.location.pathname + window.location.search === ziel ||
                performance.now() - start > MAX_MS
              ) {
                fertig();
                return;
              }
              requestAnimationFrame(pruefen);
            };
            requestAnimationFrame(pruefen);
          });
        });
        vt.finished
          .catch(() => {})
          .then(() => delete document.documentElement.dataset.vtRunning);
      } catch {
        delete document.documentElement.dataset.vtRunning;
        // Auffanglinie: Wenn irgendetwas an der Übergangs-API scheitert, muss
        // die Navigation trotzdem stattfinden.
        router.push(ziel);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div key={pathname} className="animate-page-in motion-reduce:animate-none">
      {children}
    </div>
  );
}
