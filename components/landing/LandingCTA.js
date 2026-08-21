"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";
import AbschlussFeld from "@/components/landing/AbschlussFeld";
import BallPass from "@/components/landing/BallPass";
import Aussenlinie from "@/components/landing/Aussenlinie";

// ══ DER ABSCHLUSS-BLOCK — DAS GEGNERISCHE ENDE DES FELDES ═══════════════════
//
// Auftrag Patrick, 21.08.2026: „wie wäre es denn, wenn das Spielfeld aus der
// Hero unten auf der Seite gespiegelt dargestellt wird und somit die ganze
// Seite ein Spielfeld ergibt und somit am Ende der Pass an die Funktion/den
// Button zu einem Wurf in den gegnerischen minimalistischen Korb landet."
//
// ══ DIE ENTSCHEIDUNG ZUERST: DER BALL BLEIBT AN DER TASTE ═══════════════════
//
// Der Ring liegt UNTER der Tastenreihe, in Laufrichtung dahinter. Der Ball
// kommt weiterhin an der Taste zur Ruhe und fliegt NICHT in den Korb. Das ist
// eine Abweichung von Patricks Bild, und sie hat vier Gründe — der erste ist
// der, der nicht verhandelbar ist:
//
// (1) EINE DRAUFSICHT KANN KEINEN WURF ZEIGEN. Was einen Wurf zum Wurf macht,
//     ist der BOGEN — und der liegt in der senkrechten Ebene, also genau in
//     der Richtung, die eine Draufsicht auf null projiziert. Von senkrecht
//     oben sind ein Wurf und ein Rollen dasselbe Bild: eine gerade Linie zum
//     Ring. Der Bogen wäre nur in der Schrägansicht zu zeichnen — und zwei
//     Projektionen auf einer Seite sind der Befund, mit dem Patrick am
//     19.08.2026 die ganze alte Hero-Choreografie zurückgenommen hat.
//     ⚠️ Ein Ball, der von oben gesehen auf einen Ring zuläuft und dort
//     verschwindet, liest sich nicht als Korb, sondern als Loch.
//
// (2) DIE LANDUNG WÄRE WIEDER UNSICHTBAR. Unter der Ziel-Oberkante liegen
//     rund 385 px Seite, und diese Zahl WÄCHST NICHT MIT DEM FENSTER
//     (`BallPass.js`, Blocker vom 21.08.2026). Ein zweiter Flugabschnitt nach
//     der Taste bräuchte zusätzlichen Scrollweg, den es auf hohen Fenstern
//     nicht gibt. Tobias hat gerade nachgemessen, dass die Ankunft erstmals auf
//     allen zehn geprüften Fenstern frei sichtbar ist — das ist der Kern von
//     Roadmap 20 (d) und darf nicht zurückgenommen werden.
//
// (3) DIE TASTE IST DIE EINZIGE HANDLUNGSAUFFORDERUNG DER SEITE. Der Ball ist
//     die einzige gefüllte Fläche der ganzen Startseite und damit ihr
//     stärkster Blickfang. Ihn an der Taste vorbei in eine Zeichnung zu
//     schicken, gibt den stärksten Blickfang für Dekoration aus.
//
// (4) DAS BILD IST SO BESSER, NICHT NUR BILLIGER. Der letzte Pass vor dem
//     Abschluss ist der Assist. Die Seite spielt den Assist; der Wurf gehört
//     dem Leser, und der Klick ist er. Deshalb liegt der Ring HINTER der Taste
//     in Laufrichtung: Ball → Taste (deine Hand) → Ring (wofür).
//
// ⚠️ UND DESHALB SITZT DER RING NICHT ÜBER DER TASTE. Das wäre kein Spiegel,
// sondern eine Wiederholung des Heros — und ein zweiter oranger Ring
// unmittelbar über einer orangen Taste ist genau der Fall, den der Hero am
// 20.08.2026 schon einmal hatte („von zwei gleichfarbigen Zeichen betont
// keines mehr etwas"). Unten ist er vom Knopf durch den ganzen Korbbereich
// getrennt und tut eine andere Arbeit.
//
// ══ DIE DREI ORANGEN MARKEN — und warum sie sich hier nicht schlagen ════════
//
// Im Bild stehen gleichzeitig: der Ball, die Taste, der Ring. Das war schon
// vorher so (Ball, Taste, `KorbRuhe`), die Zahl steigt also nicht. Sie
// vertragen sich, weil sie DREI VERSCHIEDENE ARBEITEN tun und drei
// verschiedene Formen haben: eine kleine bewegte Scheibe (der Gegenstand),
// eine große ruhende Fläche (die Handlung), ein dünner Umriss (das Ziel).
// Der Fall vom 20.08. war ein anderer: Dort standen zwei Marken übereinander,
// die BEIDE betonen sollten — gleiche Arbeit, also Konkurrenz.
// Alles Kühle ist das Feld, alles Orange ist das Spiel. Das ist die Regel;
// nachgesehen wurde sie am gebauten Stück, nicht nur behauptet.
//
// ══ DIE UNTERE LEITER — GESPIEGELT AUS DEM HERO, MIT EINER KORREKTUR ═══════
//
// `HeroStage.js` setzt den Textabstand nach oben aus der Lage des
// Korbbereichs: Anker ist die Unterkante der Ladezone (Korbmitte 1,575 m +
// Radius 1,30 m = 2,875 m), plus 1,5 rem Luft. Hier gilt dasselbe nach unten —
// mit EINEM Unterschied, und der ist ein Befund, kein Geschmack.
//
// ⚠️ DER ANKER IST NICHT DER GEGENSTAND, SONDERN DIE STELLE, AN DER DIE
// ZEICHNUNG AUFHÖRT SICHTBAR ZU SEIN. Mit dem Hero-Anker (2,875 m) gebaut,
// angesehen und gemessen: Die ZONENLINIEN reichen 5,80 m tief und sind erst
// bei 4,2 m auf Deckkraft null. Bei 2,875 m + 24 px stand die letzte Textzeile
// also mitten in ihnen — gemessen mit Deckkraft **0,47 bis 0,69**, je nach
// Fenster. Am 3-fach vergrößerten Standbild ist es unmissverständlich: zwei
// senkrechte Striche laufen durch „Du organisierst dein Team? Team gründen"
// bzw. „Ein Satz reicht" und kreuzen deren Unterstreichung.
// Das ist genau der Fall, den `HeroCourt.js` als unzulässig benennt: ein Strich
// durch einen Buchstaben liest sich als Panne, nicht als Raum.
//
// ⚠️ WARUM DER HERO DENSELBEN FEHLER NICHT HAT, UND WARUM DAS KEIN GEGENARGU-
// MENT IST: Dort steht an der Ankerstelle die Überschrift, und deren TINTE ist
// schmaler als die Zone (die Zeilen sind mittig und kurz). Die Striche laufen
// dort neben den Buchstaben vorbei. Das ist Glück, keine Konstruktion — hier
// steht an derselben Stelle eine randfüllende Textzeile, und dann fällt es auf.
// Der Anker ist deshalb 4,2 m: die Tiefe, bei der das Nah-Gefälle null
// erreicht. Über dieser Linie ist nichts mehr zu sehen, also kann dort auch
// nichts mehr etwas kreuzen — unabhängig davon, wie breit der Text ist.
//
// Die Rechnung, vollständig, damit sie nachprüfbar ist statt geglaubt:
//   Nullstelle des Nah-Gefälles = 4,20 m × 60 = 252,00 Einheiten über der
//   Grundlinie; die Grundlinie liegt auf der Unterkante des Abschnitts
//   (viewBox-Höhe 720).
//   Bei `slice` ist der Maßstab max(Breite/1200, Zeichnungshöhe/720), also:
//     · breit/flach → 252,00/1200        = 21 vw
//     · schmal/hoch → 252,00/720 × Höhe  = 0,35 × Zeichnungshöhe
//         35 rem → 12,25 rem · 38 rem → 13,30 rem · 40 rem → 14,00 rem
//   Die Zeichnungshöhe ist dieselbe feste Leiter wie im Hero (35/38/40 rem) —
//   damit ist der Maßstab an beiden Enden gleich und der Ring an beiden Enden
//   gleich groß (mobil 21,0 px, auf 1440 px 32,4 px, nachgemessen).
//
// ⚠️ WER EINE DER ZAHLEN ANFASST, FASST DREI STELLEN AN: die Höhenleiter in
// `AbschlussFeld.js`, das Nah-Gefälle ebendort und diese Leiter. Sie hängen an
// derselben Größe; eine allein zu ändern verschiebt den Text gegen die
// Zeichnung, ohne dass irgendetwas kaputt aussieht.
// ⚠️ Insbesondere: Wer die letzte Stufe des Nah-Gefälles von 4,2 m wegzieht,
// muss diese Leiter mitziehen. Sonst ist die Zusicherung „kein sichtbarer
// Strich im Text" still nicht mehr wahr.
//
// ⚠️ HIER STAND BIS ZUM 21.08.2026 `py-20` — ALSO 80 px UNTEN. Das war kein
// Fehler, solange unten nichts stand. Jetzt steht dort der Korbbereich.
const ABSCHNITT =
  "relative overflow-hidden bg-navy-900 text-paper-50 px-4 text-center pt-20 " +
  "pb-[calc(max(21vw,12.25rem)+1.5rem)] " +
  "sm:pb-[calc(max(21vw,13.3rem)+1.5rem)] " +
  "lg:pb-[calc(max(21vw,14rem)+1.5rem)]";

// Abschluss-Block der Startseite – seit 21.08.2026 in BEIDEN
// Anmeldezuständen. Er ist zugleich der Empfänger des Passes (`BallPass`).
export default function LandingCTA() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    setChecked(true);
  }, []);

  // ⚠️ HIER STAND `if (!checked || loggedIn) return null;` — DER GANZE BLOCK
  // FIEL FÜR ANGEMELDETE WEG. Solange darin nur „Registrieren" und „Anmelden"
  // standen, war das richtig. Mit der Ballreise über die Seite wird es ein
  // Defekt: Der Ball wird an ein Ziel gepasst, und für jeden angemeldeten
  // Besucher gäbe es das Ziel nicht — die Reise endete im Nichts.
  // Entscheidung und Wortlaut: Nele, `docs/ABSCHLUSS-BLOCK-EINGELOGGT-2026-08-21.md`.
  // Der angemeldete Block ist ausdrücklich ein ZIELPUNKT, keine zweite
  // Handlungsaufforderung: „Zum Newsfeed" ist von ihr verworfen, weil direkt
  // darüber schon „Deine nächsten Schritte" mit drei Karten steht.
  if (!checked) return null;

  return (
    <section data-passfeld className={ABSCHNITT}>
      {/* Das gegnerische Feldende. Es liegt GANZ UNTEN in der Malreihenfolge —
          alles andere in diesem Block steht darauf. */}
      <AbschlussFeld />
      {/* Der Pass liegt als eigene Ebene über dem Abschnitt und unter nichts:
          Er zeichnet ausschließlich in den Aussenbereich der Taste, nie darauf.
          Bezugsfeld ist `[data-passfeld]`, Ziel `[data-pass-ziel]`. */}
      <Aussenlinie grundlinie />
      <BallPass />
      <div className="relative">
        <Reveal
          as="h2"
          className="font-display uppercase tracking-tight text-4xl md:text-6xl font-black mb-4"
        >
          {loggedIn ? "Was fehlt?" : "Bereit loszulegen?"}
        </Reveal>
        <Reveal as="p" delay={80} className="text-mist-400 mb-10 text-lg">
          {loggedIn
            ? "Hoops ist in der Testphase. Was hier fehlt, wissen wir nur, wenn es jemand sagt."
            : "Werde Teil der Community-Plattform für Amateur-Basketball in NRW."}
        </Reveal>
        <Reveal
          delay={160}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {/* ⚠️ `data-pass-ziel` MARKIERT DEN EMPFÄNGER DES PASSES — und es ist
              die EINE Stelle, an der das Ziel gewechselt wird.
              Patrick hat am 21.08.2026 drei Möglichkeiten offen gelassen
              (Pass in eine der drei Karten von „Deine nächsten Schritte" /
              Pass in diesen Block / beides mit verschiedener Rolle). Die
              Entscheidung liegt bei ihm und Nele, nicht hier. Gebaut ist die
              Mechanik so, dass sie NUR an diesem Attribut hängt: Wer es an ein
              anderes Element hängt, hat das Ziel gewechselt — kein weiterer
              Eingriff, keine Zahl, die mitwandern muss.
              ⚠️ Bedingung an jedes künftige Ziel: Es muss ein Element mit
              eigener Box im selben `[data-passfeld]` sein. Die Ruhelage wird
              aus SEINER Box gerechnet, nicht aus der Blockhöhe — deshalb
              trägt dieselbe Geometrie beide Anmeldezustände, obwohl die
              Blöcke verschieden hoch sind. */}
          <Link
            data-pass-ziel
            href={loggedIn ? "/feedback" : "/signup"}
            className="bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center gap-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
          >
            {loggedIn ? "Feedback geben" : "Jetzt registrieren"} <PiArrowRightBold />
          </Link>
          {!loggedIn && (
            <Link
              href="/login"
              className="border-2 border-navy-600 hover:border-brand-500 transition-colors text-paper-50 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
            >
              Bereits registriert? Anmelden
            </Link>
          )}
        </Reveal>
        {/* ⚠️ „TEAM GRÜNDEN" STEHT HIER UND NICHT MEHR IM HERO (Nele,
        docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md). Eine Textzeile, KEIN
        dritter Knopf – ein dritter Knopf würde die Dichte nur nach unten
        verschieben statt sie aufzulösen.
        Der Ort ist inhaltlich richtig: Wer bis hierher gescrollt hat, hat die
        sechs Szenen gesehen, darunter „Kader füllt sich". Genau dieser Leser
        ist ein Team-Admin. Wer ganz oben gefragt wird, weiß noch nicht, wofür.
        ⚠️ UND DAS ZIEL IST `/signup`, NICHT `/team/register`. Letzteres leitet
        Ausgeloggte auf `/login?next=/team/create` weiter – ein ANMELDEFORMULAR
        für jemanden ohne Konto (Befund Nele, Abschnitt 3). Das ist eine
        Sackgasse, und sie hier ungeprüft zu übernehmen hieße, sie nur zu
        verlagern. `/signup` wertet `?next=` aus (app/signup/page.js Z. 127).
        Die Weiterleitung in `app/team/register/page.js` selbst umzustellen
        gehört Lina – sie betrifft auch die Navigationsleiste. */}
        <Reveal delay={240} className="mt-8">
          {loggedIn ? (
            // Neles Kleinzeile. Bewusst KEIN Link und KEIN `?src=` an der
            // Taste: `/feedback` wertet keinen Parameter aus, und die API
            // speichert keine Herkunft – ein Parameter wäre eine Messung, die
            // niemand vornimmt.
            <p className="text-mist-400">Ein Satz reicht</p>
          ) : (
            <Link
              href="/signup?next=/team/create&src=home-cta"
              className="text-mist-400 hover:text-brand-400 underline underline-offset-4 transition-colors"
            >
              Du organisierst dein Team? Team gründen
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
