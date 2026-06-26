"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = window.localStorage.getItem("analyticsSessionId");
  if (!sid) {
    sid =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    window.localStorage.setItem("analyticsSessionId", sid);
  }
  return sid;
}

// Erfasst Seitenaufrufe bei jedem Routenwechsel (Admin-Bereich ausgenommen).
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/sponsor-report")) return;
    // Player-Token mitsenden (falls eingeloggt) → Server leitet daraus „aktive Nutzer" ab.
    const token =
      (typeof window !== "undefined" &&
        window.localStorage.getItem("playerAuthToken")) ||
      undefined;
    axios
      .post("/api/analytics/track", {
        eventType: "pageview",
        path: pathname,
        sessionId: getSessionId(),
        token,
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
