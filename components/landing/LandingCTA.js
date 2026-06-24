"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";

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
    <section className="bg-gray-900 text-white py-20 px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-black mb-4">Bereit loszulegen?</h2>
      <p className="text-gray-300 mb-10 text-lg">
        Werde Teil der größten Amateur-Basketball Community in Deutschland.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-lg text-lg flex items-center justify-center gap-2"
        >
          Jetzt registrieren <FaArrowRight />
        </Link>
        <Link
          href="/login"
          className="border-2 border-gray-500 hover:border-white text-white font-bold py-4 px-10 rounded-lg text-lg flex items-center justify-center"
        >
          Bereits registriert? Anmelden
        </Link>
      </div>
    </section>
  );
}
