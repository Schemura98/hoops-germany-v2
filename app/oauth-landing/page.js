"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { setPlayerToken } from "@/lib/clientAuth";
import Loading from "@/components/ui/Loading";
import FormAlert from "@/components/ui/FormAlert";
import Button from "@/components/ui/Button";
import { sichererPfad, STANDARD_ZIEL } from "@/lib/sichererPfad";

// Landepunkt nach dem Google-Login. Im Normalfall sieht man diese Seite nur
// für den Bruchteil einer Sekunde – im Fehlerfall aber schon, und dann stand
// hier bisher nur eine nackte Fehlerzeile ohne Logo und ohne Ausweg
// (Design-Review 10.08.2026, Welle 4). Jetzt trägt sie den Marken-Rahmen der
// Auth-Seiten und einen sichtbaren Weg zurück zur Anmeldung.
function Rahmen({ children }) {
  return (
    <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.svg" alt="Hoops Germany" className="mx-auto h-auto w-40 sm:w-48" />
      </Link>
      {children}
    </main>
  );
}

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
    const dest = sichererPfad(searchParams.get("next"), STANDARD_ZIEL);
    router.replace(dest);
  }, [searchParams, router]);

  if (error) {
    return (
      <Rahmen>
        <div className="w-full max-w-sm space-y-4">
          <FormAlert>{error}</FormAlert>
          <p className="text-sm text-mist-400">
            Wir leiten dich gleich automatisch weiter.
          </p>
          <Button href="/login" className="w-full">
            Zurück zur Anmeldung
          </Button>
        </div>
      </Rahmen>
    );
  }

  return (
    <Rahmen>
      <Loading className="py-0" label="Anmeldung wird abgeschlossen…" />
    </Rahmen>
  );
}

export default function OauthLandingPage() {
  return (
    <Suspense
      fallback={
        <Rahmen>
          <Loading className="py-0" label="Anmeldung wird abgeschlossen…" />
        </Rahmen>
      }
    >
      <OauthLandingInner />
    </Suspense>
  );
}
