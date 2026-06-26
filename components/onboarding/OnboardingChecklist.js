"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaCheckCircle, FaRegCircle, FaTimes, FaArrowRight } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";

// Leitet den Erledigt-Status der 4 Schritte aus dem Spieler-Objekt ab (aus getmyinfo).
function computeSteps(player) {
  return [
    {
      key: "photo",
      label: "Profilfoto hochladen",
      desc: "Zeig dein Gesicht – das wirkt gleich persönlicher.",
      href: "/player/edit-profile",
      done: !!player?.profileImage,
    },
    {
      key: "profile",
      label: "Profil vervollständigen",
      desc: "Trag deine Position und dein Bundesland ein.",
      href: "/player/edit-profile",
      done: !!(player?.position && player?.bundesland),
    },
    {
      key: "team",
      label: "Team beitreten oder gründen",
      desc: "Finde dein Team – oder gründe ein neues.",
      href: "/teams",
      done: !!(player?.teamId || player?.teamAdminOf || player?.isTeamAdmin),
    },
    {
      key: "follow",
      label: "Spielern oder Teams folgen",
      desc: "Bleib über Neuigkeiten in deinem Feed auf dem Laufenden.",
      href: "/spieler",
      done: (player?.following?.length || 0) > 0 || (player?.followingTeams?.length || 0) > 0,
    },
  ];
}

// Onboarding-Checklist für den Newsfeed. Blendet sich aus, sobald alle Schritte
// erledigt sind ODER der Nutzer „Nicht mehr anzeigen" wählt (Server-Flag).
export default function OnboardingChecklist({ player, onDismiss }) {
  const [hidden, setHidden] = useState(false);

  const steps = useMemo(() => computeSteps(player), [player]);
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  if (!player || hidden || player.onboardingDismissed || allDone) return null;

  async function dismiss() {
    setHidden(true); // sofort ausblenden (optimistisch)
    try {
      await axios.post("/api/player/dismiss-onboarding", { token: getPlayerToken() });
    } catch {
      /* In-App-Anzeige ist ausgeblendet; Flag wird beim nächsten Mal erneut versucht */
    }
    onDismiss?.();
  }

  const pct = Math.round((doneCount / steps.length) * 100);
  const greetName = player.firstName ? `, ${player.firstName}` : "";

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 text-white p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black">Willkommen{greetName}! 🏀</h2>
          <p className="text-sm text-white/70 mt-0.5">
            Richte dein Profil ein, um direkt loszulegen.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Ausblenden"
          className="text-white/50 hover:text-white p-1 flex-shrink-0"
        >
          <FaTimes />
        </button>
      </div>

      {/* Fortschritt */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-white/70 mb-1">
          <span>
            {doneCount} von {steps.length} erledigt
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Schritte */}
      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                s.done ? "bg-white/5" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {s.done ? (
                <FaCheckCircle className="text-brand-500 flex-shrink-0" />
              ) : (
                <FaRegCircle className="text-white/40 flex-shrink-0" />
              )}
              <span className="flex-1 min-w-0">
                <span
                  className={`block text-sm font-semibold ${
                    s.done ? "line-through text-white/50" : "text-white"
                  }`}
                >
                  {s.label}
                </span>
                {!s.done && <span className="block text-xs text-white/60">{s.desc}</span>}
              </span>
              {!s.done && <FaArrowRight className="text-white/40 flex-shrink-0 text-xs" />}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={dismiss}
        className="mt-3 text-xs text-white/50 hover:text-white/80 underline"
      >
        Nicht mehr anzeigen
      </button>
    </div>
  );
}
