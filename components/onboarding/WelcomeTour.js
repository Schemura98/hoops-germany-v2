"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  PiBasketballBold,
  PiChartBarBold,
  PiUsersBold,
  PiTrophyBold,
  PiArrowsLeftRightBold,
  PiXBold,
  PiArrowLeftBold,
  PiArrowRightBold,
} from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import { trackEvent } from "@/lib/trackEvent";

// Inhalt der Willkommens-Tour (Anreiz: „Was kannst du hier alles tun?").
const STEPS = [
  {
    icon: PiBasketballBold,
    title: "Willkommen bei Hoops Germany! 🏀",
    text: "Deine Community-Plattform für Amateur-Basketball in NRW – Spieler, Teams, Ligen, Spiele, Tryouts und Transfers an einem Ort. Hier ein kurzer Überblick, was du alles machen kannst.",
  },
  {
    icon: PiChartBarBold,
    title: "Dein Profil & deine Statistiken",
    text: "Lege ein aussagekräftiges Profil an – mit Foto, Position, Verein und Steckbrief. Deine Spiele zahlen automatisch auf deine Karriere-Statistiken (Punkte, Assists, Rebounds) und deine Spielerhistorie ein.",
  },
  {
    icon: PiUsersBold,
    title: "Teams & Kader",
    text: "Tritt deinem Verein bei – oder gründe dein eigenes Team und werde automatisch Team-Admin. Verwalte deinen Kader, lade Mitspieler ein und ernenne weitere Admins.",
  },
  {
    icon: PiTrophyBold,
    title: "Spiele, Ligen & Tabellen",
    text: "Trage Spiele und Ergebnisse ein, verfolge offizielle Ligen mit Tabellen und Playoffs und sieh dir die Topscorer an. Beide Teams bestätigen Ergebnisse – fair und transparent.",
  },
  {
    icon: PiArrowsLeftRightBold,
    title: "Transfermarkt, Tryouts & Community",
    text: "Finde Spieler oder Vereine im Transfermarkt, bewirb dich auf Tryouts und bleib im Newsfeed auf dem Laufenden – folge Spielern und Teams und teile deine Highlights: mit Fotos, @Erwähnungen, #Hashtags und Video-Links (z. B. YouTube).",
  },
];

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const pathname = usePathname();

  // Auto-Start einmalig pro Login/Registrierung. Läuft bei jedem Routenwechsel neu,
  // damit ein Login/Registrierung NACH dem ersten Mount erkannt wird (Tour liegt im
  // Root-Layout und remountet bei Client-Navigation nicht). Wächter ist an den TOKEN
  // gebunden: pro Token wird nur 1× geprüft (kein wiederholtes getmyinfo bei Navigation),
  // aber ein NEUER Token (neuer Login / neue Registrierung, auch mit gleicher Mail nach
  // Account-Löschung) löst eine erneute Prüfung aus.
  useEffect(() => {
    const token = getPlayerToken();
    if (!token) return;
    if (sessionStorage.getItem("hg_welcome_token") === token) return;
    sessionStorage.setItem("hg_welcome_token", token);
    (async () => {
      try {
        const { data } = await axios.post("/api/player/getmyinfo", { token });
        if (data?.player && !data.player.welcomeSeen) {
          setStep(0);
          setOpen(true);
        }
      } catch {
        /* ignorieren */
      }
    })();
  }, [pathname]);

  // Erneut öffnen (z.B. aus dem Footer) via Custom-Event.
  useEffect(() => {
    const handler = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener("hg:open-tour", handler);
    return () => window.removeEventListener("hg:open-tour", handler);
  }, []);

  // completed=true nur beim expliziten Abschluss auf der letzten Seite ("Los geht's"),
  // sonst gilt die Tour als übersprungen (X-Button oder "Überspringen").
  async function close(completed = false) {
    setOpen(false);
    trackEvent(completed ? "tour_completed" : "tour_skipped", pathname);
    const token = getPlayerToken();
    if (token) {
      try {
        await axios.post("/api/player/mark-welcome-seen", { token });
      } catch {
        /* ignorieren */
      }
    }
  }

  if (!open) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="relative w-full max-w-md rounded-md bg-navy-800 overflow-hidden">
        {/* Schließen */}
        <button
          onClick={() => close(false)}
          aria-label="Schließen"
          className="absolute top-3 right-3 text-paper-50/70 hover:text-paper-50 p-1 z-10"
        >
          <PiXBold />
        </button>

        {/* Navy-Kopf mit Icon */}
        <div className="bg-navy-900 px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-md bg-brand-500 flex items-center justify-center text-navy-950 text-2xl">
            <Icon />
          </div>
          <h2 className="text-paper-50 font-black text-lg">{s.title}</h2>
        </div>

        {/* Text */}
        <div className="px-6 py-5">
          <p className="text-sm text-mist-400 leading-relaxed text-center min-h-[88px]">
            {s.text}
          </p>

          {/* Fortschritts-Punkte */}
          <div className="flex justify-center gap-2 mt-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Schritt ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === step ? "w-6 bg-brand-500" : "w-2 bg-navy-600 hover:bg-navy-500"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            {step > 0 ? (
              <button
                onClick={() => setStep((n) => n - 1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-400 hover:text-paper-50"
              >
                <PiArrowLeftBold className="text-xs" /> Zurück
              </button>
            ) : (
              <button
                onClick={() => close(false)}
                className="text-sm font-medium text-mist-400 hover:text-paper-50 transition-colors"
              >
                Überspringen
              </button>
            )}

            {isLast ? (
              <button
                onClick={() => close(true)}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-navy-950 font-semibold rounded-md px-5 py-2.5 text-sm"
              >
                Los geht&apos;s
              </button>
            ) : (
              <button
                onClick={() => setStep((n) => n + 1)}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-navy-950 font-semibold rounded-md px-5 py-2.5 text-sm"
              >
                Weiter <PiArrowRightBold className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
