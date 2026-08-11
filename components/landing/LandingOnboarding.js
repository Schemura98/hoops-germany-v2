"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getPlayerToken } from "@/lib/clientAuth";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";

// Zeigt die Onboarding-Checklist auch auf der Startseite (/) für eingeloggte Nutzer.
// OnboardingChecklist blendet sich selbst aus (ausgeloggt / ausgeblendet / alle Schritte erledigt).
export default function LandingOnboarding() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) return;
    let active = true;
    axios
      .post("/api/player/getmyinfo", { token })
      .then(({ data }) => {
        if (active) setPlayer(data.player || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!player) return null;

  return (
    <section className="bg-ink-950 px-4 pt-8">
      <div className="max-w-6xl mx-auto">
        <OnboardingChecklist player={player} />
      </div>
    </section>
  );
}
