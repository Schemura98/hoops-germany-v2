"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayerToken } from "@/lib/clientAuth";
import { FaBasketballBall } from "react-icons/fa";

// Team-Login wurde entfernt: Teams sind spieler-geführt.
// Eingeloggte Spieler → Team-Admin/-Gründung, sonst Spieler-Login.
export default function TeamLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getPlayerToken() ? "/team/admin" : "/login");
  }, [router]);
  return (
    <main className="min-h-screen flex items-center justify-center">
      <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
    </main>
  );
}
