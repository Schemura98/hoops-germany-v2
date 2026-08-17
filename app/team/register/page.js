"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken } from "@/lib/clientAuth";
import { PiBasketballBold } from "react-icons/pi";

// Team-Registrierung (eigener Account) wurde entfernt: Teams sind spieler-geführt.
// Eingeloggte Spieler → Team gründen, sonst Spieler-Login (danach Team gründen).
export default function TeamRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getPlayerToken() ? "/team/create" : "/login?next=/team/create");
  }, [router]);
  return (
    <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
      <PiBasketballBold className="text-brand-400 text-3xl animate-bounce" />
    </main>
  );
}
