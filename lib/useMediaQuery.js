"use client";

import { useEffect, useState } from "react";

/**
 * Reagiert auf einen CSS-Media-Query (z. B. "(min-width: 1024px)").
 * SSR-sicher: rendert zuerst `false`, gleicht nach dem Mount ab.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}
