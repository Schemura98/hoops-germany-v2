"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";
import SwishSequence from "@/components/landing/SwishSequence";

// Abschluss-CTA der Landing-Page – nur für ausgeloggte Besucher.
// Eingeloggte User brauchen die Registrieren/Anmelden-Aufforderung nicht.
export default function LandingCTA() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    setChecked(true);
  }, []);

  if (!checked || loggedIn) return null;

  return (
    // Die Bildsequenz sitzt hier und nicht im Hero, aus zwei Gründen: Sie darf
    // erstens nicht mit der Taktiktafel um dieselbe Fläche streiten, und
    // zweitens ist „Ball geht rein" der passende Schlussakzent unter der
    // Aufforderung – nicht der Auftakt. Zusätzlich lädt sie hier ganz unten
    // erst, wenn jemand tatsächlich so weit scrollt.
    <section className="relative overflow-hidden bg-navy-900 text-paper-50 py-20 px-4 text-center">
      <SwishSequence className="absolute inset-0 opacity-[0.28] motion-reduce:opacity-20" />
      <div className="relative">
      <Reveal
        as="h2"
        className="font-display uppercase tracking-tight text-4xl md:text-6xl font-black mb-4"
      >
        Bereit loszulegen?
      </Reveal>
      <Reveal as="p" delay={80} className="text-mist-400 mb-10 text-lg">
        Werde Teil der Community-Plattform für Amateur-Basketball in NRW.
      </Reveal>
      <Reveal delay={160} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center gap-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Jetzt registrieren <PiArrowRightBold />
        </Link>
        <Link
          href="/login"
          className="border-2 border-navy-600 hover:border-brand-500 transition-colors text-paper-50 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Bereits registriert? Anmelden
        </Link>
      </Reveal>
      </div>
    </section>
  );
}
