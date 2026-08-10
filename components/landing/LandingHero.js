"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  FaArrowRight,
  FaUsers,
  FaUser,
  FaNewspaper,
  FaCalendarAlt,
  FaCommentDots,
} from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";

// Einheitliche Hero-Buttons: ein primärer (orange) + gleichartige „Ghost"-Buttons,
// damit der Button-Block farblich ruhig und konsistent wirkt.
const HERO_BTN =
  "font-bold py-3.5 px-6 rounded-lg text-base flex items-center justify-center gap-2 transition-colors";
const HERO_PRIMARY = `${HERO_BTN} bg-brand-500 hover:bg-brand-600 text-white`;
const HERO_GHOST = `${HERO_BTN} border-2 border-white/70 bg-white/10 hover:bg-white hover:text-gray-900 text-white`;
const HERO_W = "w-full sm:w-52";

// Vollbild-Hero mit Hintergrundbild + dunklem Overlay.
// Zeigt einen personalisierten Bereich für eingeloggte Spieler, sonst die
// öffentliche Call-to-Action. Original-Design, v2-Architektur.
export default function LandingHero() {
  const [player, setPlayer] = useState(null); // null = lädt / ausgeloggt
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      setChecked(true);
      return;
    }
    let active = true;
    axios
      .post("/api/player/getmyinfo", { token })
      .then(({ data }) => {
        if (active) setPlayer(data.player || null);
      })
      .catch(() => active && setPlayer(null))
      .finally(() => active && setChecked(true));
    return () => {
      active = false;
    };
  }, []);

  const teamSlug = player?.team?.slug || null;

  return (
    <div
      className="relative flex items-center justify-center text-white"
      style={{
        backgroundImage: "url('/images/login image.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "calc(100vh - 4rem)",
      }}
    >
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-24">
        {checked && player ? (
          <>
            <div className="mb-6">
              <span className="bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Willkommen zurück
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Hey {player.firstName},
              <br />
              <span className="text-brand-400">schön, dass du da bist!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Was möchtest du heute machen?
            </p>
            <div className="space-y-3 max-w-2xl mx-auto">
              {/* Obere Reihe: 3 Buttons – primärer „Zum Feed" mittig */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/player/player-detail" className={`${HERO_GHOST} ${HERO_W}`}>
                  <FaUser /> Mein Profil
                </Link>
                <Link href="/home" className={`${HERO_PRIMARY} ${HERO_W}`}>
                  <FaNewspaper /> Zum Feed
                </Link>
                <Link
                  href={teamSlug ? `/team/team-detail/${teamSlug}` : "/teams"}
                  className={`${HERO_GHOST} ${HERO_W}`}
                >
                  <FaUsers /> {teamSlug ? "Mein Team" : "Teams"}
                </Link>
              </div>
              {/* Untere Reihe: 2 Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/spiele" className={`${HERO_GHOST} ${HERO_W}`}>
                  <FaCalendarAlt /> Spielplan
                </Link>
                <Link href="/feedback" className={`${HERO_GHOST} ${HERO_W}`}>
                  <FaCommentDots /> Feedback
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <span className="bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Amateur-Basketball in Deutschland
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Deine Basketball-
              <span className="text-brand-400"> Community</span>
              <br />
              in Deutschland
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Finde Spieler, tritt Vereinen bei und verfolge Ligen in deiner Region. Die
              Plattform für Amateur-Basketball – von Spielern, für Spieler.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-2"
              >
                Als Spieler registrieren <FaArrowRight />
              </Link>
              <Link
                href="/team/register"
                className="border-2 border-white/70 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center"
              >
                Team gründen
              </Link>
              <Link
                href="/teams"
                className="border-2 border-white/70 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-2"
              >
                <FaUsers /> Teams entdecken
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
