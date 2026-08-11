"use client";

import { useEffect, useRef, useState } from "react";
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
import Reveal from "@/components/ui/Reveal";
import HeroScrollStage from "@/components/landing/HeroScrollStage";

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
//
// Die Fläche selbst liefert `HeroScrollStage` (scroll-gesteuerte Bewegung,
// Konzept docs/HERO-KONZEPT-2026-08-11.md). Der Inhalt hier bleibt unverändert –
// bis auf `ctaRef` an der primären Schaltfläche: Dort landet der Ball, und der
// Zielpunkt wird zur Laufzeit an genau diesem Element gemessen.
export default function LandingHero() {
  const [player, setPlayer] = useState(null); // null = lädt / ausgeloggt
  const [checked, setChecked] = useState(false);
  const ctaRef = useRef(null);

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
    <HeroScrollStage ctaRef={ctaRef} backgroundImage="/images/login image.jpg">
      <>
        {checked && player ? (
          <>
            <Reveal as="div" delay={0} className="mb-6">
              <span className="bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Willkommen zurück
              </span>
            </Reveal>
            <Reveal as="h1" delay={90} className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Hey {player.firstName},
              <br />
              <span className="text-brand-400">schön, dass du da bist!</span>
            </Reveal>
            <Reveal
              as="p"
              delay={180}
              className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Was möchtest du heute machen?
            </Reveal>
            <Reveal as="div" delay={270} className="space-y-3 max-w-2xl mx-auto">
              {/* Obere Reihe: 3 Buttons – primärer „Zum Feed" mittig */}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/player/player-detail" className={`${HERO_GHOST} ${HERO_W}`}>
                  <FaUser /> Mein Profil
                </Link>
                <Link ref={ctaRef} href="/home" className={`${HERO_PRIMARY} ${HERO_W}`}>
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
            </Reveal>
          </>
        ) : (
          <>
            <Reveal as="div" delay={0} className="mb-6">
              <span className="bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Amateur-Basketball in NRW
              </span>
            </Reveal>
            <Reveal as="h1" delay={90} className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Deine Basketball-
              <span className="text-brand-400"> Community</span>
              <br />
              in NRW
            </Reveal>
            <Reveal
              as="p"
              delay={180}
              className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Finde Spieler, tritt Vereinen bei und verfolge Ligen in deiner Region. Die
              Plattform für Amateur-Basketball – von Spielern, für Spieler.
            </Reveal>
            <Reveal as="div" delay={270} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                ref={ctaRef}
                href="/signup"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
              >
                Als Spieler registrieren <FaArrowRight />
              </Link>
              <Link
                href="/team/register"
                className="border-2 border-white/70 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
              >
                Team gründen
              </Link>
              <Link
                href="/teams"
                className="border-2 border-white/70 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center justify-center gap-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
              >
                <FaUsers /> Teams entdecken
              </Link>
            </Reveal>
          </>
        )}
      </>
    </HeroScrollStage>
  );
}
