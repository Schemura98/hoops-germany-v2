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
      // Ertrag statt Aufforderung (Befund Lina, Wortlaut Nele, 14.08.2026):
      // Die Zeile wiederholte nur das Label darüber und nannte nicht, was man
      // danach bekommt. „Nächstes Spiel" und „Letztes Ergebnis" stehen wörtlich
      // als Beschriftungen in components/feed/SpieltagStrip.js – der Nutzer
      // erkennt sie wieder.
      // ⚠️ Bewusst „Erst mit Team …", nicht „danach steht …": Die Leiste hängt
      // an ZWEI Bedingungen (Team UND ein angesetztes/abgeschlossenes Spiel).
      // Ein Versprechen „danach steht dein nächstes Spiel oben" widerlegt ein
      // frisch gegründetes Team ohne Spielplan sofort selbst.
      desc: "Erst mit Team stehen Nächstes Spiel und Letztes Ergebnis oben in deinem Feed.",
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

  // Eine Zeile der Liste (für die 4 Kern-Schritte und den Bonus identisch).
  const renderStep = (s) => (
    <li key={s.key}>
      <Link
        href={s.href}
        className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
          s.done ? "bg-transparent" : "bg-navy-700/50 hover:bg-navy-700"
        }`}
      >
        {s.done ? (
          <PiCheckCircleBold className="text-brand-400 flex-shrink-0" />
        ) : s.Icon ? (
          <s.Icon className="text-mist-400 flex-shrink-0" />
        ) : (
          <PiCircleBold className="text-mist-600 flex-shrink-0" />
        )}
        <span className="flex-1 min-w-0">
          <span
            className={`block text-sm font-semibold ${
              s.done ? "line-through text-mist-600" : "text-paper-50"
            }`}
          >
            {s.label}
          </span>
          {!s.done && <span className="block text-xs text-mist-400">{s.desc}</span>}
        </span>
        {!s.done && <PiArrowRightBold className="text-mist-600 flex-shrink-0 text-xs" />}
      </Link>
    </li>
  );

  // ⚠️ Ab der Hälfte schrumpft die Liste auf EINE Zeile (Entwurf Vivien §4.2,
  // Befund Ronja, 15.08.2026).
  //
  // Gemessen war sie **504 px hoch** und das **einzige** Element der Seite mit
  // Marken-Rahmen – bei 75 % erledigt und mit einem einzigen offenen Schritt.
  // Die betonteste Fläche des Newsfeeds war damit eine Aufgabenliste, die fast
  // fertig war, und sie schob den ersten Beitrag mobil auf y = 1491 px bei
  // 844 px Bildschirmhöhe.
  //
  // Unter 50 % bleibt sie ein Panel – da ist sie echte Hilfe. Darüber ist sie
  // eine Erinnerung, und eine Erinnerung braucht eine Zeile.
  // Die Markenkante gibt sie in beiden Fällen ab: Sie gehört jetzt der
  // Anzeigetafel, denn die trägt die Aussage der Seite.
  if (pct >= 50) {
    const offen = steps.find((s) => !s.done);
    return (
      <div className="mb-6 flex items-center gap-3 rounded-md border border-navy-600 bg-navy-800 px-4 py-2.5">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-navy-700" aria-hidden="true">
          <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-mist-400 whitespace-nowrap">
          {doneCount}/{steps.length}
        </span>
        {offen && (
          // ⚠️ `py-2 -my-2` vergrößert die Klickfläche, ohne die Zeile höher zu
          // machen (Befund Tobias M2): Der Link maß 117 × 16 px und war der
          // einzige Weg aus der Checkliste heraus – 16 px unterschreiten jede
          // brauchbare Schwelle, und das auf dem Hauptgerät.
          <Link
            href={offen.href}
            className="truncate whitespace-nowrap py-2 -my-2 text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            {offen.label}
          </Link>
        )}
        {/* ⚠️ Der Ausblenden-Knopf MUSS hier stehen (Befund Tobias H1).
            Die erste Fassung dieser Zeile hatte keinen – er existierte nur im
            Panel-Zweig unter 50 %. Folge: Wer zwischen 50 % und 99 % steht,
            also fast jeder nach dem Einstieg, konnte die Checkliste dauerhaft
            nicht mehr wegklicken; `dismiss()` samt `dismiss-onboarding` und
            dem Analytics-Ereignis war für diese Gruppe tote Funktion.
            Vorher war der Knopf immer da – das war ein stiller Verlust durch
            meinen Umbau, keine Entwurfsentscheidung. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Ausblenden"
          className="-m-1 flex-shrink-0 p-1 text-mist-600 transition-colors hover:text-mist-300"
        >
          <PiXBold className="text-xs" />
        </button>
      </div>
    );
  }

  return (
    // Panel-Sprache der Richtung „Anzeigetafel". Die 2px-Markenkante ist hier
    // ENTFERNT: Sie sitzt seit dem 15.08. auf der Anzeigetafel, und die Regel
    // erlaubt sie nur an EINER Stelle je Seite.
    <div className="rounded-md border border-navy-600 bg-navy-800 text-paper-50 p-5 sm:p-6 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wide">
            Willkommen{greetName}!
          </h2>
          <p className="text-sm text-mist-300 mt-0.5">
            Richte dein Profil ein, um direkt loszulegen.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Ausblenden"
          className="text-mist-600 hover:text-paper-50 p-1 flex-shrink-0"
        >
          <PiXBold />
        </button>
      </div>

      {/* Fortschritt – zählt und benennt NUR die 4 Kern-Schritte; der Bonus
          steht unten sichtbar getrennt (Befund Tobias L3: „1 von 4" über einer
          Liste mit fünf Zeilen las sich als falsche Zahl). */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-mist-300 mb-1">
          <span>
            {doneCount} von {steps.length} Schritten erledigt
          </span>
          <span className="font-mono tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-navy-700 overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-500 motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Die 4 Kern-Schritte */}
      <ul className="mt-4 space-y-2">{steps.map(renderStep)}</ul>

      {/* Bonus: App-Installation – bewusst außerhalb der Schritt-Liste. */}
      <p className="mt-4 border-t border-navy-600 pt-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">
        Bonus · zählt nicht zum Fortschritt
      </p>
      <ul className="mt-2 space-y-2">{renderStep(appStep)}</ul>

      <button
        onClick={dismiss}
        className="mt-3 text-xs text-mist-600 hover:text-mist-300 underline"
      >
        Nicht mehr anzeigen
      </button>
    </div>
  );
}
