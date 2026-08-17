"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken } from "@/lib/clientAuth";
import { PiBasketballBold } from "react-icons/pi";

// Team-Login wurde entfernt: Teams sind spieler-geführt.
// Eingeloggte Spieler → Team-Admin/-Gründung, sonst Spieler-Login.
export default function TeamLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getPlayerToken() ? "/team/admin" : "/login");
  }, [router]);
  return (
    <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
      <PiBasketballBold className="text-brand-400 text-3xl animate-bounce" />
    </main>
  );
}
