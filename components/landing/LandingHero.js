"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiArrowRightBold,
  PiUsersBold,
  PiUserBold,
  PiNewspaperBold,
  PiCalendarBlankBold,
  PiChatCircleDotsBold,
} from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";

// Rückkehr-Signal: Welche offene Sache zeigen wir dem eingeloggten Nutzer?
// Reihenfolge = Dringlichkeit. Es wird ausschließlich gezeigt, was tatsächlich
// ungelesen vorliegt – gibt es nichts, bleibt die neutrale Frage stehen
// (Befund Ronja O3, Rolle Lina/Skill update-onboarding-surfaces).
const SIGNALE = [
  {
    typ: "join_request",
    href: "/team/admin?tab=anfragen",
    text: (n) =>
      n === 1
        ? "1 Beitrittsanfrage wartet auf dich"
        : `${n} Beitrittsanfragen warten auf dich`,
  },
  {
    typ: "pending_result",
    href: "/team/admin?tab=ergebnisse",
    text: (n) =>
      n === 1
        ? "1 Spiel wartet auf dein Ergebnis"
        : `${n} Spiele warten auf dein Ergebnis`,
  },
  {
    typ: "match_result",
    href: "/spiele",
    text: (n) =>
      n === 1 ? "1 neues Ergebnis ist da" : `${n} neue Ergebnisse sind da`,
  },
];

function rueckkehrSignal(notifications) {
  const offen = (notifications || []).filter((n) => !n.read);
  for (const s of SIGNALE) {
    const treffer = offen.filter((n) => n.type === s.typ).length;
    if (treffer > 0) return { href: s.href, text: s.text(treffer) };
  }
  if (offen.length > 0) {
    return {
      href: "/home",
      text:
        offen.length === 1
          ? "1 neue Benachrichtigung"
          : `${offen.length} neue Benachrichtigungen`,
    };
  }
  return null;
}
import Reveal from "@/components/ui/Reveal";
import SplitFlap from "@/components/ui/SplitFlap";
import HeroScrollStage from "@/components/landing/HeroScrollStage";

// Einheitliche Hero-Buttons: ein primärer (orange) + gleichartige „Ghost"-Buttons,
// damit der Button-Block farblich ruhig und konsistent wirkt.
const HERO_BTN =
  "font-bold py-3.5 px-6 rounded-sm text-base flex items-center justify-center gap-2 transition-colors";
const HERO_PRIMARY = `${HERO_BTN} bg-brand-500 hover:bg-brand-400 text-navy-950`;
const HERO_GHOST = `${HERO_BTN} border border-navy-600 hover:border-brand-500 hover:bg-navy-800 text-paper-50`;
const HERO_W = "w-full sm:w-52";

// Vollbild-Hero auf ruhiger Fläche (seit 12.08.2026 ohne Foto, Begründung in
// HeroScrollStage.js). Zeigt einen personalisierten Bereich für eingeloggte
// Spieler, sonst die öffentliche Call-to-Action.
//
// Die Fläche selbst liefert `HeroScrollStage` (scroll-gesteuerte Bewegung,
// Konzept docs/HERO-KONZEPT-2026-08-11.md). Der Inhalt hier bleibt unverändert –
// ⚠️ `ctaRef` zeigt seit dem 15.08.2026 auf NICHTS mehr in der Bühne: Der Ball
// zielt nicht mehr auf die Schaltfläche. Die Ref bleibt hier, weil sie die
// primäre Aktion markiert und das eine nützliche Information ist – sie wird nur
// nicht mehr an `HeroScrollStage` weitergereicht.
export default function LandingHero() {
  const [player, setPlayer] = useState(null); // null = lädt / ausgeloggt
  const [checked, setChecked] = useState(false);
  const [signal, setSignal] = useState(null); // offene Sache für Wiederkehrer
  const ctaRef = useRef(null);
  // Inhaltsblock: Badge + Headline + Subline UND die Schaltflaechenreihe. Der
  // fallende Ball dunkelt ab, solange er auf dieser Hoehe ist.
  // ⚠️ Die Schaltflaechen kamen am 15.08.2026 dazu (Befund Tobias B): Vorher
  // umfasste der Bezug nur den Text, und der auf 176px vergroesserte Ball lief
  // bei VOLLER Deckkraft ueber "Teams entdecken" – Kontrast der Beschriftung
  // 1,67:1 statt der geforderten 4,5:1. Beim 28px-Ball war das folgenlos.
  // Deshalb heisst er auch nicht mehr `textRef`: Ein Name, der nur "Text" sagt,
  // laedt genau dazu ein, die naechste Flaeche wieder zu vergessen.
  const inhaltRef = useRef(null);

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
    // Zweiter, unabhängiger Aufruf: Schlägt er fehl, bleibt der Hero exakt wie
    // vorher – das Signal ist eine Zugabe, keine Voraussetzung.
    axios
      .post("/api/player/getnotifications", { token })
      .then(({ data }) => {
        if (active) setSignal(rueckkehrSignal(data.notifications));
      })
      .catch(() => {
        /* ohne Signal ist der Hero unveraendert nutzbar */
      });
    return () => {
      active = false;
    };
  }, []);

  const teamSlug = player?.team?.slug || null;

  return (
    <HeroScrollStage inhaltRef={inhaltRef}>
      <>
        {checked && player ? (
          <>
            <div ref={inhaltRef}>
              <Reveal as="div" delay={0} className="mb-6">
                <span className="font-display bg-brand-500 text-navy-950 text-sm font-bold px-4 py-1.5 rounded-sm uppercase tracking-[0.2em]">
                  Willkommen zurück
                </span>
              </Reveal>
              <Reveal
                as="h1"
                delay={90}
                className="font-display text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight mb-4 leading-[0.9]"
              >
                Hey {player.firstName},
                <br />
                <SplitFlap delay={420} className="text-brand-400">
                  schön, dass du da bist!
                </SplitFlap>
              </Reveal>
              {/* Feste Mindesthoehe: Pille (42px) und Fliesstext (29px) wuerden die
                Schaltflaechen sonst je nach Nutzerzustand unterschiedlich weit
                nach unten schieben (Befund Tobias, 12.08.2026). */}
              <Reveal
                as="div"
                delay={180}
                className="mb-10 max-w-2xl mx-auto flex min-h-[46px] items-center justify-center"
              >
                {signal ? (
                  <Link
                    href={signal.href}
                    className="inline-flex items-center gap-2 rounded-sm border border-navy-600 bg-navy-800 px-4 py-2 text-base md:text-lg text-paper-50 hover:border-brand-500 transition-colors"
                  >
                    <span
                      className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-400"
                      aria-hidden="true"
                    />
                    {signal.text}
                  </Link>
                ) : (
                  <p className="text-lg md:text-xl text-mist-400 leading-relaxed">
                    Was möchtest du heute machen?
                  </p>
                )}
              </Reveal>
              <Reveal
                as="div"
                delay={270}
                className="space-y-3 max-w-2xl mx-auto"
              >
                {/* Obere Reihe: 3 Buttons – primärer „Zum Feed" mittig */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    href="/player/player-detail"
                    className={`${HERO_GHOST} ${HERO_W}`}
                  >
                    <PiUserBold /> Mein Profil
                  </Link>
                  <Link
                    ref={ctaRef}
                    href="/home"
                    className={`${HERO_PRIMARY} ${HERO_W}`}
                  >
                    <PiNewspaperBold /> Zum Feed
                  </Link>
                  <Link
                    href={teamSlug ? `/team/team-detail/${teamSlug}` : "/teams"}
                    className={`${HERO_GHOST} ${HERO_W}`}
                  >
                    <PiUsersBold /> {teamSlug ? "Mein Team" : "Teams"}
                  </Link>
                </div>
                {/* Untere Reihe: Feedback steht bewusst vorn und traegt den
                  Testphasen-Akzent. Waehrend der Testphase ist "Feedback-gebende
                  Tester" die selbstdefinierte Kennzahl der Kampagne - der Button
                  stand aber an letzter von fuenf Stellen (Befund Nele 11.08.,
                  unabhaengig bestaetigt von Ronja 12.08.). Kein Primaer-Platz:
                  der bleibt bei "Zum Feed". */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link
                    href="/feedback"
                    className={`${HERO_BTN} ${HERO_W} group border border-signal-wait/70 bg-signal-wait/10 text-paper-50 hover:bg-signal-wait hover:text-navy-950`}
                  >
                    {/* Icon-Farbe an den Hover-Zustand koppeln: Beim Hover wird die
                      Flaeche solide amber-300 - ein fest verdrahtetes text-signal-wait
                      liesse das Icon darin verschwinden (Befund Tobias, 12.08.2026). */}
                    <PiChatCircleDotsBold className="text-signal-wait group-hover:text-navy-950" />{" "}
                    Feedback
                  </Link>
                  <Link href="/spiele" className={`${HERO_GHOST} ${HERO_W}`}>
                    <PiCalendarBlankBold /> Spielplan
                  </Link>
                </div>
              </Reveal>
            </div>
          </>
        ) : (
          <>
            <div ref={inhaltRef}>
              <Reveal as="div" delay={0} className="mb-6">
                <span className="font-display bg-brand-500 text-navy-950 text-sm font-bold px-4 py-1.5 rounded-sm uppercase tracking-[0.2em]">
                  Amateur-Basketball in NRW
                </span>
              </Reveal>
              <Reveal
                as="h1"
                delay={90}
                className="font-display text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight mb-6 leading-[0.9]"
              >
                Deine Basketball-
                {/* Genau EIN Wort klappt um – siehe Begründung in SplitFlap.js. */}
                <SplitFlap delay={420} className="text-brand-400">
                  {" "}
                  Community
                </SplitFlap>
                <br />
                in NRW
              </Reveal>
              <Reveal
                as="p"
                delay={180}
                className="text-lg md:text-xl text-mist-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                Finde Spieler, tritt Vereinen bei und verfolge Ligen in deiner
                Region. Die Plattform für Amateur-Basketball – von Spielern, für
                Spieler.
              </Reveal>
              <Reveal
                as="div"
                delay={270}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  ref={ctaRef}
                  href="/signup"
                  className="bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold py-4 px-8 rounded-md text-lg flex items-center justify-center gap-2 transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  Als Spieler registrieren <PiArrowRightBold />
                </Link>
                <Link
                  href="/team/register"
                  className="border border-navy-600 hover:border-brand-500 hover:bg-navy-800 text-paper-50 font-bold py-4 px-8 rounded-md text-lg flex items-center justify-center transition-[transform,background-color,border-color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  Team gründen
                </Link>
                <Link
                  href="/teams"
                  className="border border-navy-600 hover:border-brand-500 hover:bg-navy-800 text-paper-50 font-bold py-4 px-8 rounded-md text-lg flex items-center justify-center gap-2 transition-[transform,background-color,border-color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  <PiUsersBold /> Teams entdecken
                </Link>
              </Reveal>
            </div>
          </>
        )}
      </>
    </HeroScrollStage>
  );
}
