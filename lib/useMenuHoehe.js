"use client";

import { useEffect, useState } from "react";

/**
 * Maximale Hoehe fuer ein aufgeklapptes Menue in einer Sticky-Leiste.
 *
 * Warum gemessen statt gerechnet (13.08.2026): Die Mobil-Menues von Navbar und
 * PlayerNav haengen in einer `sticky`-Leiste. Ist das Menue hoeher als der
 * sichtbare Bereich, erreicht der Seiten-Scroll seine unteren Zeilen nie —
 * sticky scrollt nicht mit. Es braucht also eine Hoehenbegrenzung mit eigenem
 * Innenscroll.
 *
 * Der naheliegende Weg waere eine feste Hoehenbegrenzung aus 100dvh minus der
 * Leistenhoehe (Klassenname bewusst NICHT ausgeschrieben: seit Roadmap 36 liest
 * Tailwind auch `lib/`, und es liest rohen Text — ein in einem Kommentar
 * zitierter Klassenname erzeugt eine echte, aber tote CSS-Regel; genau das ist
 * hier gemessen worden). Der zieht nur die Leiste selbst
 * ab. Darueber steht aber der nicht schliessbare Testphase-Banner, und dessen
 * Hoehe ist NICHT konstant: Sie haengt vom Textumbruch ab. Gemessen wurden
 * 45 px auf einer Breite und 53 px auf einer anderen — jede feste Zahl ist
 * irgendwo falsch, und „irgendwo falsch" heisst hier: die letzte Menuezeile ist
 * nicht antippbar. Genau so ist der neue Punkt „Feedback geben" zweimal
 * durchgerutscht.
 *
 * Deshalb: Abstand zur Oberkante des Menues zur Laufzeit messen. Das ist
 * unabhaengig davon, was ueber der Leiste steht, wie hoch es ist und ob es
 * spaeter wegfaellt.
 *
 * Die Tailwind-Klasse bleibt als Startwert an den aufrufenden Stellen stehen,
 * damit der erste Frame vor dem Effekt schon begrenzt ist.
 */
export default function useMenuHoehe(ref, offen) {
  const [maxHoehe, setMaxHoehe] = useState(undefined);

  useEffect(() => {
    if (!offen) {
      setMaxHoehe(undefined);
      return;
    }

    const messen = () => {
      const el = ref.current;
      if (!el) return;
      const oben = el.getBoundingClientRect().top;
      // Untergrenze, damit das Menue bei sehr niedrigen Fenstern (oder einer
      // Fehlmessung) nicht zu einem Streifen zusammenfaellt.
      setMaxHoehe(Math.max(200, Math.round(window.innerHeight - oben)));
    };

    messen();
    window.addEventListener("resize", messen);
    // Beim Scrollen wandert die Sticky-Leiste nach oben, sobald der Banner
    // hinausgescrollt ist — dann darf das Menue wieder hoeher werden.
    window.addEventListener("scroll", messen, { passive: true });
    return () => {
      window.removeEventListener("resize", messen);
      window.removeEventListener("scroll", messen);
    };
  }, [ref, offen]);

  return maxHoehe;
}
