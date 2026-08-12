import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingHero from "@/components/landing/LandingHero";
import Reveal from "@/components/ui/Reveal";
import { ProfileMock } from "@/components/landing/FeatureMocks";
import { PiWarningBold, PiChartBarBold } from "react-icons/pi";

// ══════════════════════════════════════════════════════════════════════════
//  EINBAUVERSUCH „Platzhalter-Fotos“ – Vivien, 13.08.2026
//  task-material-eignungspruefung, Option 2 der Entscheidung
//  `dec-hoops-material-richtung`.
//
//  Das ist ein VERSUCH, keine Richtungsaenderung. Die entschiedene Linie
//  „kein Foto, Vektor“ (Option 1) steht. Zweck: Jonatan soll an der echten
//  Gestaltung sehen, wie sich Fotos einfuegen – statt darueber zu reden.
//
//  Bewusst so gebaut, dass ein einziger Commit alles rueckstandslos entfernt:
//    - diese Route (app/versuch-fotos/)
//    - public/images/platzhalter/ (ein Ordner, ein Loeschen)
//    - die Prop `foto` in LandingHero.js und HeroScrollStage.js
//      (ohne sie rendern beide unveraendert – app/page.js uebergibt nichts)
//
//  Urteil und Messwerte: docs/MATERIAL-EIGNUNGSPRUEFUNG-2026-08-13.md
// ══════════════════════════════════════════════════════════════════════════

export const metadata = {
  title: "Einbauversuch Platzhalter-Fotos – nicht oeffentlich",
  robots: { index: false, follow: false },
};

// Overlay-Wert nicht geschaetzt: Bei 0.55 blieb die dunkelste Stelle des
// Motivs zwar tragfaehig, die HELLSTE (Lichtkegel auf dem Hallenboden, unten
// rechts) fiel fuer paper-50 unter AA. 0.72 ist der Wert, ab dem die hellste
// gemessene Stelle wieder ueber 4,5:1 liegt – gemessen am gerenderten Bild,
// Rechnung im Urteilsdokument.
const HERO_FOTO = {
  avif: "/images/platzhalter/ph-halle-lichtkegel-1600.avif",
  webp: "/images/platzhalter/ph-halle-lichtkegel-1600.webp",
  overlay: 0.72,
};

function PlatzhalterMarke({ className = "" }) {
  return (
    <span
      className={`font-display pointer-events-none select-none rounded-sm bg-navy-950/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-signal-wait ${className}`}
    >
      Platzhalter
    </span>
  );
}

export default function VersuchFotosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hinweisstreifen: klebt unter der Navbar und ist damit in JEDEM
          Zustand und auf jedem Bildschirmfoto zu sehen. Ohne ihn wird aus
          einer Anschauung stillschweigend eine Entscheidung – besonders bei
          der Weitergabe an Jonatan. Farbe ist die semantische Warn-Farbe
          `signal-wait` mit navy-950-Text (gerechnet 7,65:1), keine neue Farbe. */}
      <div className="sticky top-16 z-40 bg-signal-wait text-navy-950">
        <div className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-2.5">
          <PiWarningBold className="mt-0.5 flex-shrink-0 text-base" aria-hidden="true" />
          <p className="text-sm font-semibold leading-snug">
            <span className="font-display uppercase tracking-[0.14em]">Einbauversuch</span>{" "}
            <span className="font-normal">
              — alle Fotos auf dieser Seite sind Platzhalter aus einer Stock-Bibliothek und
              zeigen weder Hoops-Teams noch NRW. Die entschiedene Gestaltungsrichtung ist
              &bdquo;kein Foto, Vektor&ldquo;. Diese Seite ist nicht verlinkt und nicht indexiert.
            </span>
          </p>
        </div>
      </div>

      {/* ─── Fall 1: Foto als Hero-Vollflaeche ─────────────────────────────
          Der haerteste Fall. Die Richtung hat das Hero-Foto ausdruecklich
          abgeschafft (VISUELLE-RICHTUNG §5). Hier kommt es zurueck – mit
          allem, was daran haengt: Overlay, Bildrauschen hinter der Headline,
          Fremdfarben hinter dem orangen Primaerbutton. */}
      <div className="relative">
        <LandingHero foto={HERO_FOTO} />
        <PlatzhalterMarke className="absolute bottom-4 right-4 z-20" />
      </div>

      {/* ─── Fall 2: Foto im Panel, neben der echten Vektor-Miniatur ───────
          Direkter Vergleich in derselben Zeile, damit man nicht zwischen zwei
          Seiten erinnern muss: links der Baustein, den die Feature-Strecke
          heute benutzt (ProfileMock – echte Elemente, keine Bilddaten),
          rechts dieselbe Flaeche als Foto-Panel. */}
      <section className="bg-navy-950 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal
            as="h2"
            className="font-display text-3xl font-black uppercase tracking-tight text-paper-50 md:text-5xl"
          >
            Fall 2 — Foto im Panel
          </Reveal>
          <Reveal as="p" delay={80} className="mt-4 max-w-xl text-mist-400 leading-relaxed">
            Dieselbe Panel-Flaeche, zweimal: links der Baustein, den die
            Feature-Strecke heute verwendet, rechts ein Foto im selben Rahmen.
            Die 2px-Markenleiste sitzt bei beiden an der Oberkante.
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-16">
            {/* Links: Bestand */}
            <Reveal direction="left">
              <p className="font-display mb-4 text-xs font-bold uppercase tracking-[0.18em] text-mist-600">
                Heute — Vektor
              </p>
              <div className="border-t-2 border-brand-500">
                <div className="pt-4">
                  <ProfileMock />
                </div>
              </div>
            </Reveal>

            {/* Rechts: Versuch */}
            <Reveal direction="right" delay={120}>
              <p className="font-display mb-4 text-xs font-bold uppercase tracking-[0.18em] text-mist-600">
                Versuch — Foto
              </p>
              <div className="border-t-2 border-brand-500">
                <div className="pt-4">
                  <div className="relative w-full max-w-sm overflow-hidden rounded-md border border-navy-600 bg-navy-800">
                    <picture>
                      <source
                        srcSet="/images/platzhalter/ph-training-halle-1000.avif"
                        type="image/avif"
                      />
                      <img
                        src="/images/platzhalter/ph-training-halle-1000.webp"
                        alt="Platzhalter: Basketballtraining in einer Halle. Stock-Foto, kein Hoops-Team."
                        width={1000}
                        height={666}
                        loading="lazy"
                        className="block w-full"
                      />
                    </picture>
                    <PlatzhalterMarke className="absolute right-2 top-2" />
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <PiChartBarBold className="text-brand-400" aria-hidden="true" />
                        <p className="text-sm font-bold text-paper-50">Spielerprofile &amp; Statistiken</p>
                      </div>
                      <p className="text-sm leading-relaxed text-mist-400">
                        Dieselbe Karte, dieselben Rahmen, dieselbe Markenleiste — nur traegt
                        die obere Haelfte jetzt ein Foto statt der Zahlen, die das Produkt
                        eigentlich zeigt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Fall 3: Foto als Akzentblock auf flacher Flaeche ──────────────
          Der Fall, an dem Milos erste Bildsequenz gescheitert ist: Ein Bild
          mit eingebranntem Hintergrund liegt als sichtbares Rechteck auf der
          Flaeche. Hier bewusst OHNE Weichzeichner, Verlauf oder Schatten –
          die Richtung kennt keinen davon. Nur Flaechenstufe und Haarlinie. */}
      <section className="bg-navy-950 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal
            as="h2"
            className="font-display text-3xl font-black uppercase tracking-tight text-paper-50 md:text-5xl"
          >
            Fall 3 — Foto auf der flachen Flaeche
          </Reveal>
          <Reveal as="p" delay={80} className="mt-4 max-w-xl text-mist-400 leading-relaxed">
            Das Bild, das in der Auswahl als bester Treffer gefuehrt wird
            (&bdquo;dunkler Grund fuegt sich in Navy, der orange Ring ist fast die
            Markenfarbe&ldquo;). Hier steht es unretuschiert auf navy-950, ohne
            Verlauf und ohne Schatten — die Richtung kennt beides nicht.
          </Reveal>

          <Reveal delay={140} className="mt-12 flex justify-center">
            <figure className="relative w-full max-w-2xl">
              <picture>
                <source
                  srcSet="/images/platzhalter/ph-korb-von-unten-1000.avif"
                  type="image/avif"
                />
                <img
                  src="/images/platzhalter/ph-korb-von-unten-1000.webp"
                  alt="Platzhalter: Basketballkorb von unten gegen ein dunkles Hallendach. Stock-Foto."
                  width={1000}
                  height={750}
                  loading="lazy"
                  className="block w-full rounded-md border border-navy-600"
                />
              </picture>
              <PlatzhalterMarke className="absolute right-2 top-2" />
              <figcaption className="mt-4 text-sm leading-relaxed text-mist-400">
                Danebenstehen lassen und selbst pruefen: Ist der Rand des Bildes eine
                Kante der Gestaltung oder ein Fremdkoerper? Und wie viele Farben
                traegt das Foto neben dem einen erlaubten Akzent herein?
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ─── Einordnung ────────────────────────────────────────────────── */}
      <section className="bg-navy-900 px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-paper-50">
            Was diese Seite ist — und was nicht
          </h2>
          <div className="mt-6 space-y-4 text-mist-400 leading-relaxed">
            <p>
              Drei Fotos, drei Einbaustellen, sonst unveraenderte Gestaltung. Nichts
              hiervon ist beschlossen. Die entschiedene Richtung bleibt &bdquo;kein Foto,
              Vektor&ldquo;; dieser Versuch existiert, damit die Entscheidung an etwas
              Sichtbarem gepruefft werden kann statt an einer Beschreibung.
            </p>
            <p>
              Die Fotos stammen aus einer freien Stock-Bibliothek. Sie zeigen keine
              Hoops-Teams, keine NRW-Halle und niemanden, der gefragt wurde. Als
              echtes Material kaemen sie nie in Frage — als Pruefmaterial fuer die
              Frage &bdquo;traegt ein Foto diese Flaeche?&ldquo; reichen sie.
            </p>
            <p className="text-mist-600">
              Urteil, Messwerte und Empfehlung:{" "}
              <span className="font-mono text-mist-400">
                docs/MATERIAL-EIGNUNGSPRUEFUNG-2026-08-13.md
              </span>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
