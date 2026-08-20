"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";
import KorbRuhe from "@/components/landing/KorbRuhe";
import BallPass from "@/components/landing/BallPass";
import Aussenlinie from "@/components/landing/Aussenlinie";

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
    // ⚠️ `SwishSequence` IST AM 19.08.2026 ENTFALLEN — 45 Rasterbilder, 191 KB,
    // bei Deckkraft 0,28. An ihrer Stelle steht dieselbe Geometrie als Vektor
    // (`KorbRuhe`, rund 0,5 KB): Ring und Netz, sonst nichts.
    // Zwei Gründe, und der erste ist der wichtigere:
    //   1. Der Hero macht den Korb jetzt selbst. Vorher gab es auf dieser Seite
    //      DREI Momente, in denen ein Ball in einen Korb geht; mit dem
    //      Hero-Dunk wären es vier gewesen. Das ist kein Motiv mehr, das ist
    //      ein Tick. Der Abschluss-Block bekommt deshalb das ZIEL, nicht noch
    //      einen Ballwurf.
    //   2. Ein fotografisch modellierter Körper in einer Strichzeichnung ist
    //      ein Genrebruch – und Genrebrüche sind genau das, was Seiten billig
    //      aussehen lässt. Der Verlust ist real (echte Kugelrotation ist mit
    //      Vektoren nicht erreichbar); das Verlorene passt nicht ins neue Bild.
    <section
      data-passfeld
      className="relative overflow-hidden bg-navy-900 text-paper-50 py-20 px-4 text-center"
    >
      {/* Der Pass liegt als eigene Ebene über dem Abschnitt und unter nichts:
          Er zeichnet ausschließlich in den Aussenbereich der Taste, nie darauf.
          Bezugsfeld ist `[data-passfeld]`, Ziel `[data-pass-ziel]`. */}
      <Aussenlinie grundlinie />
      <BallPass />
      <div className="relative">
        {/* ⚠️ DER KORB STEHT IM FLUSS, NICHT MEHR IM HINTERGRUND (20.08.2026).
          Vorher lag er als `absolute` Zeichnung hinter Headline und Tasten und
          kreuzte beide – auf jeder Breite, weil Text und Zeichnung beide
          mittig sind. Die Begründung steht ausführlich in `KorbRuhe.js`;
          die Kurzfassung: Eine Hintergrund-Zeichnung hinter einem mittigen
          Textblock kann dem Text nicht ausweichen, und Deckkraft ist keine
          Lösung dafür, sondern der Weg ins Braun.
          Als Element im Fluss kann sie per Konstruktion nichts überlagern.
          Und die Stelle ist die inhaltlich richtige: Der Hero setzt denselben
          orangen Ring über seine Überschrift. Die Seite bekommt Buchstützen. */}
        {/* ⚠️ DIE ANZEIGEGRÖSSE IST TEIL DER ZEICHNUNG, NICHT DES LAYOUTS.
          Unter rund 72 px verschmiert das Netz zu einem Fleck – gebaut,
          angesehen, gemessen (Begründung und die zwei verworfenen Fassungen
          stehen in `KorbRuhe.js`). `tests/e2e/abschluss-korb.spec.mjs` hält die
          Untergrenze fest; wer sie unterschreitet, bekommt keinen kleineren
          Korb, sondern Rauschen.
          Ab `md` 88 px, weil die Überschrift dort von `text-4xl` auf
          `text-6xl` springt – die Marke folgt dem Sprung, statt daneben zu
          verschwinden. */}
        <KorbRuhe className="mx-auto mb-6 h-[72px] w-[72px] md:h-[88px] md:w-[88px]" />
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
