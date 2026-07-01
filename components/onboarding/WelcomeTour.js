"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  FaBasketballBall,
  FaChartBar,
  FaUsers,
  FaTrophy,
  FaExchangeAlt,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";

// Inhalt der Willkommens-Tour (Anreiz: „Was kannst du hier alles tun?").
const STEPS = [
  {
    icon: FaBasketballBall,
    title: "Willkommen bei Hoops Germany! 🏀",
    text: "Deine Community-Plattform für Amateur-Basketball in Deutschland – Spieler, Teams, Ligen, Spiele, Tryouts und Transfers an einem Ort. Hier ein kurzer Überblick, was du alles machen kannst.",
  },
  {
    icon: FaChartBar,
    title: "Dein Profil & deine Statistiken",
    text: "Lege ein aussagekräftiges Profil an – mit Foto, Position, Verein und Steckbrief. Deine Spiele zahlen automatisch auf deine Karriere-Statistiken (Punkte, Assists, Rebounds) und deine Spielerhistorie ein.",
  },
  {
    icon: FaUsers,
    title: "Teams & Kader",
    text: "Tritt deinem Verein bei – oder gründe dein eigenes Team und werde automatisch Team-Admin. Verwalte deinen Kader, lade Mitspieler ein und ernenne weitere Admins.",
  },
  {
    icon: FaTrophy,
    title: "Spiele, Ligen & Tabellen",
    text: "Trage Spiele und Ergebnisse ein, verfolge offizielle Ligen mit Tabellen und Playoffs und sieh dir die Topscorer an. Beide Teams bestätigen Ergebnisse – fair und transparent.",
  },
  {
    icon: FaExchangeAlt,
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

  async function close() {
    setOpen(false);
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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Schließen */}
        <button
          onClick={close}
          aria-label="Schließen"
          className="absolute top-3 right-3 text-white/70 hover:text-white p-1 z-10"
        >
          <FaTimes />
        </button>

        {/* Navy-Kopf mit Icon */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-6 pt-8 pb-6 text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl">
            <Icon />
          </div>
          <h2 className="text-white font-black text-lg">{s.title}</h2>
        </div>

        {/* Text */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed text-center min-h-[88px]">
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
                  i === step ? "w-6 bg-brand-500" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            {step > 0 ? (
              <button
                onClick={() => setStep((n) => n - 1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                <FaArrowLeft className="text-xs" /> Zurück
              </button>
            ) : (
              <button
                onClick={close}
                className="text-sm font-medium text-gray-400 hover:text-gray-600"
              >
                Überspringen
              </button>
            )}

            {isLast ? (
              <button
                onClick={close}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-5 py-2.5 text-sm"
              >
                Los geht&apos;s
              </button>
            ) : (
              <button
                onClick={() => setStep((n) => n + 1)}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-5 py-2.5 text-sm"
              >
                Weiter <FaArrowRight className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
