"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  PiCheckCircleBold,
  PiCircleBold,
  PiXBold,
  PiArrowRightBold,
  PiDeviceMobileBold,
} from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import { trackEvent } from "@/lib/trackEvent";

// Leitet den Erledigt-Status der 4 Kern-Schritte aus dem Spieler-Objekt ab (aus getmyinfo).
//
// Exportiert, weil die Plattform-Tour (components/onboarding/WelcomeTour.js) auf
// ihrer letzten Seite denselben Stand anzeigt und dorthin übergibt. Zwei Kopien
// dieser Liste würden sofort auseinanderlaufen: Die Tour würde „erledigt" melden,
// was die Checkliste im Feed noch offen führt.
export function computeSteps(player) {
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
  const [appInstalled, setAppInstalled] = useState(false);
  const pathname = usePathname();
  const prevDoneRef = useRef(null);

  // App-Installation erkennen: läuft die Seite im Standalone-Modus (= installiert),
  // oder wurde sie auf diesem Gerät schon einmal installiert (gemerkt via appinstalled).
  useEffect(() => {
    const detect = () =>
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      (() => {
        try {
          return localStorage.getItem("hg_pwa_installed") === "1";
        } catch {
          return false;
        }
      })();
    setAppInstalled(!!detect());
    const onInstalled = () => {
      try {
        localStorage.setItem("hg_pwa_installed", "1");
      } catch {
        /* localStorage evtl. blockiert – Standalone-Erkennung greift trotzdem */
      }
      setAppInstalled(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  // Nur die 4 Kern-Schritte bestimmen Fortschritt + „alles erledigt" (auto-ausblenden).
  const steps = useMemo(() => computeSteps(player), [player]);
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Feuert checklist_step_done für jeden Schritt, der neu (in dieser Sitzung) erledigt
  // wurde – nicht beim ersten Mount, sonst würden bereits erledigte Alt-Schritte mitzählen.
  useEffect(() => {
    const doneMap = Object.fromEntries(steps.map((s) => [s.key, s.done]));
    if (prevDoneRef.current) {
      for (const s of steps) {
        if (!prevDoneRef.current[s.key] && s.done) {
          trackEvent("checklist_step_done", pathname, s.key);
        }
      }
    }
    prevDoneRef.current = doneMap;
  }, [steps, pathname]);

  if (!player || hidden || player.onboardingDismissed || allDone) return null;

  // Bonus-Baustein (zählt NICHT in den Fortschritt) – Hoops Germany als App aufs Handy.
  const appStep = {
    key: "app",
    label: "Als App installieren",
    desc: "Hol dir Hoops Germany aufs Handy – Vollbild, ein Tap zum Start.",
    href: "/installieren",
    done: appInstalled,
    bonus: true,
    Icon: PiDeviceMobileBold,
  };

  async function dismiss() {
    setHidden(true); // sofort ausblenden (optimistisch)
    trackEvent("checklist_dismissed", pathname);
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
    <div className="rounded-md bg-navy-900 text-paper-50 p-5 sm:p-6 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black">Willkommen{greetName}! 🏀</h2>
          <p className="text-sm text-paper-50/70 mt-0.5">
            Richte dein Profil ein, um direkt loszulegen.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Ausblenden"
          className="text-paper-50/50 hover:text-paper-50 p-1 flex-shrink-0"
        >
          <PiXBold />
        </button>
      </div>

      {/* Fortschritt */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-paper-50/70 mb-1">
          <span>
            {doneCount} von {steps.length} erledigt
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-navy-800/15 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Schritte (4 Kern + 1 Bonus: App-Installation) */}
      <ul className="mt-4 space-y-2">
        {[...steps, appStep].map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition ${
                s.done ? "bg-navy-800/5" : "bg-navy-800/10 hover:bg-navy-700/20"
              }`}
            >
              {s.done ? (
                <PiCheckCircleBold className="text-brand-400 flex-shrink-0" />
              ) : s.Icon ? (
                <s.Icon className="text-paper-50/60 flex-shrink-0" />
              ) : (
                <PiCircleBold className="text-paper-50/40 flex-shrink-0" />
              )}
              <span className="flex-1 min-w-0">
                <span
                  className={`block text-sm font-semibold ${
                    s.done ? "line-through text-paper-50/50" : "text-paper-50"
                  }`}
                >
                  {s.label}
                  {s.bonus && !s.done && (
                    <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-brand-400">
                      Bonus
                    </span>
                  )}
                </span>
                {!s.done && <span className="block text-xs text-paper-50/60">{s.desc}</span>}
              </span>
              {!s.done && <PiArrowRightBold className="text-paper-50/40 flex-shrink-0 text-xs" />}
            </Link>
          </li>
        ))}
      </ul>

      <button
        onClick={dismiss}
        className="mt-3 text-xs text-paper-50/50 hover:text-paper-50/80 underline"
      >
        Nicht mehr anzeigen
      </button>
    </div>
  );
}
