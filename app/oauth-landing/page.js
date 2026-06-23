"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBasketballBall } from "react-icons/fa";
import { setPlayerToken } from "@/lib/clientAuth";

function OauthLandingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Kein Token erhalten. Bitte erneut anmelden.");
      const t = setTimeout(() => router.replace("/login?error=oauth"), 2000);
      return () => clearTimeout(t);
    }
    setPlayerToken(token);
    router.replace("/player/newsfeed");
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
      <p className="mt-4 text-gray-600">
        {error || "Anmeldung wird abgeschlossen…"}
      </p>
    </main>
  );
}

export default function OauthLandingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <FaBasketballBall className="text-brand-500 text-3xl animate-bounce" />
        </main>
      }
    >
      <OauthLandingInner />
    </Suspense>
  );
}
