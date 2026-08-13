"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  PiBasketballBold,
  PiTrophyBold,
  PiArrowsLeftRightBold,
  PiNewspaperBold,
  PiUsersThreeBold,
} from "react-icons/pi";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import PostFeed from "@/components/feed/PostFeed";
import SpieltagStrip from "@/components/feed/SpieltagStrip";
import TeamMatchesWidget from "@/components/feed/TeamMatchesWidget";
import TopTeamsWidget from "@/components/feed/TopTeamsWidget";
import TransferFeedWidget from "@/components/feed/TransferFeedWidget";
import FollowSuggestions from "@/components/feed/FollowSuggestions";
import CollapsibleWidget from "@/components/feed/CollapsibleWidget";
import NewsWidget from "@/components/NewsWidget";
import OnboardingChecklist from "@/components/onboarding/OnboardingChecklist";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";

// Newsfeed – die Seite, auf der jeder eingeloggte Nutzer landet.
//
// Umbau 13.08.2026 („Was ist passiert, seit ich weg war?"):
// - Kopf mit h1 + Spieltag-Leiste (nächstes Spiel / letztes Ergebnis des
//   eigenen Teams) als erste Antwort für Wiederkehrer – Ronjas R3, auf den
//   Spieler übertragen.
// - Mobil steht der Feed deutlich weiter oben: alle Seiten-Widgets starten
//   eingeklappt, der Composer beginnt einzeilig. Beleg für die Reihenfolge:
//   „Do not hide critical next steps below large promotional modules"
//   (uxpatterns.dev/patterns/social/activity-feed, Sweep 13.08.2026).
// - my-matches wird EINMAL hier geladen und an Spieltag-Leiste UND
//   Spiele-Widget gereicht (vorher zwei Abrufe derselben Daten).
// - Footer mit Impressum/Datenschutz (Befund Tobias L4, rechtlich relevant:
//   diese Seite hatte als einzige keinen Verweis).
// - Feed-Logik ausgelagert nach components/feed/PostFeed.js.

export default function PlayerNewsfeedPage() {
  const { player, status } = useCurrentPlayer();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Spiele des eigenen/gefolgter Teams – ein Abruf für Leiste + Widget.
  const [matchData, setMatchData] = useState(null);
  const [matchesLoading, setMatchesLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = getPlayerToken();
        const { data } = await axios.post("/api/player/my-matches", { token });
        if (active) setMatchData(data);
      } catch {
        if (active) setMatchData({ matches: [], myTeamId: null, followedTeamIds: [] });
      } finally {
        if (active) setMatchesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <p className="text-mist-300">Profil konnte nicht geladen werden.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Erneut versuchen
        </Button>
      </main>
    );
  }

  const heute = new Date().toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PlayerNav player={player} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Seitenkopf: Anrede als Eyebrow, h1 (Befund Tobias L5: es gab keins),
            rechts das heutige Datum in Mono – die Anzeigetafel kennt den Spieltag. */}
        <header className="mb-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400 truncate">
              Hallo{player?.firstName ? ` ${player.firstName}` : ""}
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-black uppercase tracking-wide leading-none text-paper-50">
              Newsfeed
            </h1>
          </div>
          <p className="font-mono text-xs text-mist-400 tabular-nums whitespace-nowrap pb-0.5">
            {heute}
          </p>
        </header>

        <SpieltagStrip data={matchData} loading={matchesLoading} player={player} />

        <OnboardingChecklist player={player} />

        {isDesktop ? (
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-6 items-start">
            {/* Linke Leiste: Spiele von eigenem/gefolgten Teams */}
            <aside className="space-y-4 lg:sticky lg:top-24">
              <TeamMatchesWidget preloaded={matchData} preloadedLoading={matchesLoading} />
              <TopTeamsWidget />
            </aside>

            {/* Mitte: Composer + Feed */}
            <PostFeed player={player} />

            {/* Rechte Leiste: Vorschläge + Transfers + News (Sponsorfläche folgt mit #6) */}
            <aside className="space-y-4 lg:sticky lg:top-24">
              <FollowSuggestions />
              <TransferFeedWidget />
              <NewsWidget compact />
            </aside>
          </div>
        ) : (
          // Mobil: Widgets als eingeklappte Akkordeons über dem Feed (hinter dem
          // Infinite Scroll wären sie unerreichbar) – aber ALLE geschlossen,
          // damit der erste Beitrag nah am Seitenanfang bleibt. Das Nötigste
          // aus „Spiele" trägt bereits die Spieltag-Leiste oben.
          <div className="space-y-6">
            <div className="space-y-3">
              <CollapsibleWidget
                icon={<PiBasketballBold className="text-brand-400" />}
                title="Spiele"
              >
                <TeamMatchesWidget preloaded={matchData} preloadedLoading={matchesLoading} />
              </CollapsibleWidget>
              <CollapsibleWidget
                icon={<PiUsersThreeBold className="text-brand-400" />}
                title="Vorschläge für dich"
              >
                <FollowSuggestions fallbackText="Gerade keine Vorschläge – schau bei Spielern und Teams vorbei." />
              </CollapsibleWidget>
              <CollapsibleWidget
                icon={<PiTrophyBold className="text-brand-400" />}
                title="Top-Teams"
              >
                <TopTeamsWidget />
              </CollapsibleWidget>
              <CollapsibleWidget
                icon={<PiArrowsLeftRightBold className="text-brand-400" />}
                title="Transfers"
              >
                <TransferFeedWidget />
              </CollapsibleWidget>
              <CollapsibleWidget
                icon={<PiNewspaperBold className="text-brand-400" />}
                title="Basketball-News"
              >
                <NewsWidget compact />
              </CollapsibleWidget>
            </div>
            <PostFeed player={player} compactComposer />
          </div>
        )}
      </main>

      {/* Impressum/Datenschutz waren auf dieser Seite nirgends erreichbar
          (Befund Tobias L4, von Nora als rechtlich zu bewerten markiert). */}
      <Footer />
    </div>
  );
}
