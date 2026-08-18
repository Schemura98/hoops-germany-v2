"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PiBasketballBold,
  PiTrophyBold,
  PiUsersThreeBold,
} from "react-icons/pi";
import { useCurrentPlayer } from "@/lib/useCurrentPlayer";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { getPlayerToken } from "@/lib/clientAuth";
import PlayerNav from "@/components/layout/PlayerNav";
import Footer from "@/components/layout/Footer";
import PostFeed from "@/components/feed/PostFeed";
import Anzeigetafel from "@/components/feed/Anzeigetafel";
import Schiene, { SchienenAbschnitt } from "@/components/feed/Schiene";
import TeamMatchesWidget from "@/components/feed/TeamMatchesWidget";
import TopTeamsWidget from "@/components/feed/TopTeamsWidget";
import FollowSuggestions from "@/components/feed/FollowSuggestions";
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
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main id="hauptinhalt" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
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

      <main id="hauptinhalt" tabIndex={-1} className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* ⚠️ ABWEICHUNG von Viviens Entwurf, bewusst: Sie will den Seitenkopf
            ganz durch die Tafel ersetzen. Der Kopf bleibt – aber schlank –,
            weil er die einzige `h1` der Seite trägt. Ohne sie fiele Tobias'
            Befund L5 zurück („es gab kein h1"), und das ist ein
            Zugänglichkeits-Punkt, keine Geschmacksfrage.
            Ihr eigentliches Anliegen ist trotzdem erfüllt: Die Signaturleiste
            sitzt jetzt auf der Tafel, nicht mehr nirgends. Der Kopf ist von
            `text-4xl` auf `text-2xl` zurückgenommen, damit die Tafel und nicht
            das Wort „Newsfeed" das erste Gewicht der Seite ist. */}
        <header className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-400 truncate">
              Hallo{player?.firstName ? ` ${player.firstName}` : ""}
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-black uppercase tracking-wide leading-none text-paper-50">
              Newsfeed
            </h1>
          </div>
          <p className="font-mono text-xs text-mist-400 tabular-nums whitespace-nowrap pb-0.5">
            {heute}
          </p>
        </header>

        <Anzeigetafel data={matchData} loading={matchesLoading} player={player} />

        <OnboardingChecklist player={player} />

        {isDesktop ? (
          // ZWEI Zonen statt drei Spalten (Entwurf Vivien, 15.08.2026, §3.2).
          //
          // Vorher: `[260px_minmax(0,1fr)_300px]`. Das Dreispalten-Schema fällt
          // nicht weg, weil drei Spalten schlecht wären, sondern weil ZWEI
          // davon Restrampen waren: Ihr Inhalt endete, die Spalte lief leer
          // aus. Der Feed blieb dabei auf 544 px – zu schmal für Fließtext UND
          // Zahlen zugleich.
          //
          // Jetzt: Feed + EINE Schiene. Der Feed-Text wird in `PostCard` auf
          // Lesebreite gekappt, die Spalte selbst nicht – so dürfen Ergebnis-
          // zeilen die volle Breite für Zahlen nutzen.
          <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-x-10 gap-y-6 items-start">
            <PostFeed player={player} />

            {/* `haftend` setzt Haftkante UND Höhendeckel zusammen – siehe
                Kommentar in `Schiene.js`. Ein blankes `lg:sticky` hier hat den
                unteren Teil der Schiene auf jedem Desktop unerreichbar gemacht. */}
            <Schiene haftend>
              <SchienenAbschnitt label="Spiele">
                <TeamMatchesWidget
                  preloaded={matchData}
                  preloadedLoading={matchesLoading}
                  nackt
                />
              </SchienenAbschnitt>

              <SchienenAbschnitt label="Tabelle">
                {/* Personalisiert (Befund Ronja): eigene Liga vorgewählt,
                    eigenes Team markiert. Vorher stand hier „Alle Ligen" ohne
                    jede Markierung – dieselbe Lücke, die /topscorer seit R5
                    nicht mehr hat. */}
                <TopTeamsWidget
                  nackt
                  meinTeamId={player?.teamId}
                  meineLigaId={player?.team?.leagueId}
                />
              </SchienenAbschnitt>

              <SchienenAbschnitt label="Folgen">
                {/* Von acht auf drei (Ronja/Vivien): acht Vorschläge waren ein
                    halber Bildschirm für die unwichtigste Aussage der Seite. */}
                <FollowSuggestions nackt maxAnzahl={3} />
              </SchienenAbschnitt>

              {/* ⚠️ `TransferFeedWidget` ist hier ENTFERNT (Befund Ronja):
                  `lib/recordTransfer.js` schreibt bei jedem Wechsel BEIDES –
                  den TransferEvent für dieses Widget UND den Auto-Post im
                  Feed. Dieselbe Nachricht stand also zweimal auf einem Bild.
                  Entlarvend ist der Kommentar in `transfer-feed/route.js`
                  selbst: Es füllt „mit aktuellen Community-Transfers auf,
                  damit das Widget nie leer ist" – eine Fläche, die mit
                  Belanglosem gefüllt werden muss, hat kein eigenes Publikum.
                  Die Wechsel stehen weiterhin im Feed, mit Kontext. */}

              {/* ⚠️ `NewsWidget` bleibt vorerst, BEWUSST gegen Viviens
                  Streichvorschlag. Mats hat Ronjas Begründung korrigiert: Die
                  „wird NICHT gebraucht"-Zeile der Bedarfsanalyse zielt auf
                  EIGENE Redaktion, nicht auf einen fremden Strom – für diese
                  Frage gibt es schlicht keinen Nutzerbeleg, in keine Richtung.
                  Also: unterste Position, kleinstes Gewicht, und die
                  Entscheidung fällt nach einer Klickmessung. */}
              <SchienenAbschnitt label="Basketball-News">
                <NewsWidget compact nackt />
              </SchienenAbschnitt>
            </Schiene>
          </div>
        ) : (
          // MOBIL – neu geordnet am 18.08.2026 (Gestaltungsvorschlag „Der Feed
          // als Anzeigetafel", Befund Patrick).
          //
          // VORHER standen hier VIER optisch identische Akkordeon-Kästen
          // (Spiele · Vorschläge · Tabelle · News) VOR dem Feed. Zwei Probleme:
          //
          // (1) Sekundäres vor Primärem. Der erste Beitrag begann dadurch erst
          //     bei y ≈ 888 – auf dem Gerät, das der Hauptfall ist.
          // (2) Viermal dieselbe Geste. Genau diese Gleichförmigkeit war am
          //     15.08. die Hauptbegründung für den Desktop-Umbau; mobil ist sie
          //     nie angekommen. Dazu sitzt der Aufklapp-Pfeil oben rechts – aus
          //     der Recherche: „two thumbs of stretch away from where any human
          //     actually holds a phone".
          //
          // JETZT eine Zeile Wegweiser statt vier Blöcken. Das ist kein
          // Weglassen: Alle vier Inhalte existieren vollständig woanders und
          // sind von hier aus einen Fingertipp entfernt.
          //
          // ⚠️ WARUM DIE INHALTE NICHT EINFACH UNTER DEN FEED WANDERN:
          // Der Feed lädt endlos nach. Alles darunter ist praktisch
          // unerreichbar – das stand schon im alten Kommentar an dieser Stelle
          // und ist der Grund, warum die Kästen überhaupt oben lagen. Die
          // Wegweiser lösen das, das Verschieben hätte es nur umgedreht.
          //
          // ⚠️ WARUM KEINE FILTERLEISTE (Abweichung vom Entwurf, bewusst):
          // Der Entwurf zeigte hier Chips „Alles / Ergebnisse / Wechsel / Team".
          // `PostFeed` hat aber bereits einen Umschalter („Für dich" / „Folge
          // ich"). Zwei Umschaltleisten direkt übereinander sind zwei
          // Bedienebenen für dieselbe Liste – der Nutzer müsste raten, welche
          // welche schlägt. Die Filterung ist eine eigene Entscheidung und
          // gehört nicht in diesen Umbau.
          <div className="space-y-5">
            <nav aria-label="Weitere Bereiche">
              <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { href: "/spiele", label: "Spiele", Icon: PiBasketballBold },
                  { href: "/rangliste", label: "Tabelle", Icon: PiTrophyBold },
                  { href: "/spieler", label: "Spieler", Icon: PiUsersThreeBold },
                ].map(({ href, label, Icon }) => (
                  <li key={href}>
                    {/* min-h-11 ≈ 44px: Tippziel nach WCAG 2.5.8, statt der
                        20-px-Pfeile von vorher. */}
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1.5 min-h-11 rounded-full border border-navy-600 bg-navy-800 px-3.5 text-sm text-mist-300 whitespace-nowrap hover:border-brand-500 hover:text-paper-50"
                    >
                      <Icon className="text-brand-400" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <PostFeed player={player} compactComposer />

            {/* Nach dem Feed bewusst nur EINE Sache, und die richtige:
                Folge-Vorschläge sind das Mittel gegen einen leeren Feed – sie
                gehören genau dorthin, wo jemand ankommt, der nichts mehr zu
                lesen hat.

                ⚠️ KORREKTUR (Befund Tobias, Gate 18.08.2026): Hier stand
                „Tabelle und News stehen oben als Wegweiser". Tabelle ja –
                NEWS NICHT. Die drei Wegweiser sind Spiele, Tabelle, Spieler;
                eine Seite `/news` gibt es nicht. „Basketball-News" ist damit
                vom Newsfeed aus mobil nicht mehr erreichbar (weiterhin über die
                Startseite und die rechte Schiene am Desktop).
                Sachlich ist das vertretbar – News hatte die geringste
                Priorität. Aber die Begründung beschrieb einen anderen Zustand
                als der Code, und daran wäre die nächste Entscheidung
                gescheitert: „News nach Klickmessung behalten oder streichen"
                lässt sich nicht messen, wenn auf dem Hauptgerät gar keine
                Klicks mehr entstehen können.
                ⚠️ OFFEN bei Vivien (Gewichtung) und Ronja (hat die Fläche
                überhaupt Publikum?). */}
            <div className="pt-2 border-t border-navy-600">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400 mb-2.5">
                Folgen
              </p>
              <FollowSuggestions
                maxAnzahl={3}
                nackt
                fallbackText="Gerade keine Vorschläge – schau bei Spielern und Teams vorbei."
              />
            </div>
          </div>
        )}
      </main>

      {/* Impressum/Datenschutz waren auf dieser Seite nirgends erreichbar
          (Befund Tobias L4, von Nora als rechtlich zu bewerten markiert). */}
      <Footer />
    </div>
  );
}
