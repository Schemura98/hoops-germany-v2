"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";
import KorbRuhe from "@/components/landing/KorbRuhe";

// Abschluss-CTA der Landing-Page – nur für ausgeloggte Besucher.
// Eingeloggte User brauchen die Registrieren/Anmelden-Aufforderung nicht.
export default function LandingCTA() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getPlayerToken());
    setChecked(true);
  }, []);

  if (!checked || loggedIn) return null;

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
    <section className="relative overflow-hidden bg-navy-900 text-paper-50 py-20 px-4 text-center">
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
          Bereit loszulegen?
        </Reveal>
        <Reveal as="p" delay={80} className="text-mist-400 mb-10 text-lg">
          Werde Teil der Community-Plattform für Amateur-Basketball in NRW.
        </Reveal>
        <Reveal
          delay={160}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center gap-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Jetzt registrieren <PiArrowRightBold />
          </Link>
          <Link
            href="/login"
            className="border-2 border-navy-600 hover:border-brand-500 transition-colors text-paper-50 font-bold py-4 px-10 rounded-sm text-lg flex items-center justify-center transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
          >
            Bereits registriert? Anmelden
          </Link>
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
          <Link
            href="/signup?next=/team/create&src=home-cta"
            className="text-mist-400 hover:text-brand-400 underline underline-offset-4 transition-colors"
          >
            Du organisierst dein Team? Team gründen
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
