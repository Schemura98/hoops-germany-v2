"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  PiArrowRightBold,
  PiMapPinBold,
  PiCheckBold,
} from "react-icons/pi";
import Avatar from "@/components/Avatar";
import Button from "@/components/ui/Button";
import CityInput from "@/components/CityInput";
import FormAlert from "@/components/ui/FormAlert";
import Reveal from "@/components/ui/Reveal";
import { getPlayerToken } from "@/lib/clientAuth";
import { loadCities, cityCoords, haversineKm } from "@/lib/geo";
import { inputClassSm, staffel } from "@/lib/ui";

// ---------------------------------------------------------------------------
// „Wege zu einem Verein" – der Unterbau von /tryouts.
//
// Warum es diese Komponente gibt (Ronja, docs/RETENTION-BEFUND-2026-08-13.md,
// R2 / K5 / K9): /tryouts hatte im Leerzustand null Links im <main>. Das ist die
// Seite von Zielgruppe 3 (Vereinslose, docs/ZIELGRUPPEN.md) – „wer zweimal
// nichts findet, kommt nicht wieder". Und laut Mats' H4 bleibt der Leerzustand
// auf Monate der Normalfall, nicht die Ausnahme.
//
// Die Konsequenz daraus ist nicht „ein Link unter die leere Liste", sondern eine
// andere Frage: Der Mensch will keine Tryouts sehen, er will einen Verein
// finden. Tryouts sind ein Weg dorthin, nicht das Ziel. Diese Komponente zeigt
// deshalb die anderen Wege – mit echten Daten, nicht mit Versprechen.
//
// Bewusste Entscheidungen:
// - **Keine Demo-Vereine in Route 01.** Die Karte fordert zum Anfragen auf; ein
//   Beispielverein kann nicht antworten. Auf /teams und /transfermarkt stehen
//   sie weiter (dort mit Beispieldaten-Abzeichen) – dort ist es eine Übersicht,
//   hier eine Handlungsaufforderung. Der Unterschied rechtfertigt den Filter.
// - **Der 1-MB-Städtedatensatz wird nicht automatisch geladen.** Ohne Ort wird
//   nach Bundesland des Profils vorsortiert (reiner String-Vergleich, kostenlos);
//   `lib/geo.js` lädt erst, wenn jemand die Umkreis-Sortierung wirklich öffnet.
//   Sonst zahlt jeder Handy-Besucher 1 MB für eine Sortierung, die er nicht
//   angefordert hat.
// - **Keine erfundenen Zahlen.** Jede Zahl unten kommt aus einer Antwort des
//   eigenen Servers. Wo nichts da ist, steht das da – nicht „bald mehr".
//
// Ton nach docs/ZIELGRUPPEN.md Z3 („ehrlich als im Aufbau rahmen statt als
// Marktplatz") und im gleichen Register wie Schritt 5 der Tour
// (components/onboarding/TourSteps.js) – der Einstieg und diese Seite dürfen
// nicht wie zwei verschiedene Produkte klingen.
// ---------------------------------------------------------------------------

const MAX_VEREINE = 4;

// Kopfzeilen je Einsatzort. Der Fehlerfall braucht einen eigenen: „Kein
// passendes dabei?" wäre dort schlicht gelogen – wir wissen ja gar nicht, was
// es gegeben hätte.
const KOPF = {
  leer: {
    eyebrow: "Gerade nichts ausgeschrieben",
    titel: "Dann eben direkt zum Verein",
    text: "Probetrainings schreiben die Vereine selbst aus – gerade steht keines offen. Ein Team zu finden geht trotzdem: Jeden Verein hier kannst du direkt anfragen.",
  },
  anhang: {
    titel: "Kein passendes dabei?",
    text: "Ein Probetraining ist nur einer der Wege zu einem Verein. Diese hier gehen jederzeit.",
  },
  fehler: {
    titel: "Diese Wege gehen trotzdem",
    text: "Die Probetrainings konnten wir gerade nicht laden. Was hier steht, hängt nicht daran.",
  },
};

// Eine Route: laufende Nummer + Titel + Inhalt. Die Nummern sind der einzige
// Hierarchie-Träger neben der Flächenstufe – font-mono/tabular-nums, weil die
// Designsprache Zahlen grundsätzlich in der Monospace setzt.
function Route({ nr, titel, hervorgehoben = false, children, className = "" }) {
  return (
    <div className={`flex gap-3 sm:gap-4 ${className}`}>
      <span
        aria-hidden="true"
        className={`w-6 flex-shrink-0 pt-0.5 font-mono text-xs tabular-nums ${
          hervorgehoben ? "text-brand-400" : "text-mist-400"
        }`}
      >
        {nr}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-paper-50">
          {titel}
        </h3>
        {children}
      </div>
    </div>
  );
}

export default function WegeZumVerein({ variant = "leer" }) {
  const leer = variant === "leer";
  const kopf = KOPF[variant] || KOPF.anhang;

  const [me, setMe] = useState(null);
  const [angemeldet, setAngemeldet] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsFehler, setTeamsFehler] = useState(false);
  const [suchendeVereine, setSuchendeVereine] = useState(null); // null = unbekannt/Fehler
  const [geladen, setGeladen] = useState(false);

  // Umkreis: erst auf ausdrücklichen Wunsch – siehe Kopfkommentar.
  const [ortOffen, setOrtOffen] = useState(false);
  const [ortTerm, setOrtTerm] = useState("");
  const [ort, setOrt] = useState(null); // { n, lat, lng }
  const [cityMap, setCityMap] = useState(null);

  const [verfuegbar, setVerfuegbar] = useState(false);
  const [transferBusy, setTransferBusy] = useState(false);
  const [transferFehler, setTransferFehler] = useState(false);

  useEffect(() => {
    const token = getPlayerToken();
    setAngemeldet(!!token);
    let aktiv = true;

    (async () => {
      const anfragen = [
        axios.post("/api/team/fetchteams", {}).catch(() => null),
        axios.post("/api/team/recruiting-list", {}).catch(() => null),
        token
          ? axios.post("/api/player/getmyinfo", { token }).catch(() => null)
          : Promise.resolve(null),
      ];
      const [tRes, rRes, mRes] = await Promise.all(anfragen);
      if (!aktiv) return;
      // Fehlgeschlagene Anfragen werden als Fehler geführt, nicht als „nichts
      // da". „Aktuell sucht kein Verein" wäre bei einem Netzwerkfehler eine
      // falsche Tatsachenbehauptung – und genau die Sorte Halbwahrheit, die
      // dieser Umbau eigentlich abstellen soll.
      setTeamsFehler(!tRes);
      setTeams(tRes?.data?.teams || []);
      // Beispielvereine zaehlen NICHT mit (Fund von Kai, 13.08.2026). Route 01
      // filtert sie 18 Zeilen weiter unten korrekt heraus — Route 02 zaehlte
      // sie mit und behauptete einem Vereinssuchenden gegenueber, es gaebe
      // Vereine, die ihn nie erreichen wird. Derselbe Filter, dieselbe Datei.
      setSuchendeVereine(
        rRes ? (rRes.data?.teams || []).filter((t) => !t.isDemo).length : null,
      );
      const spieler = mRes?.data?.player || null;
      setMe(spieler);
      setVerfuegbar(spieler?.transferStatus === "verfuegbar");
      setGeladen(true);
    })();

    return () => {
      aktiv = false;
    };
  }, []);

  // Städtedatensatz erst laden, wenn die Umkreis-Sortierung geöffnet wurde.
  useEffect(() => {
    if (ortOffen && !cityMap) loadCities().then(({ map }) => setCityMap(map));
  }, [ortOffen, cityMap]);

  const vereine = useMemo(() => {
    const echte = teams.filter((t) => !t.isDemo);

    if (ort && cityMap) {
      return echte
        .map((t) => {
          const c = cityCoords(cityMap, t.region);
          return {
            ...t,
            km: c ? Math.round(haversineKm(ort.lat, ort.lng, c.lat, c.lng)) : null,
          };
        })
        .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    }

    const land = me?.bundesland || "";
    return [...echte].sort((a, b) => {
      const av = land && a.bundesland === land ? 0 : 1;
      const bv = land && b.bundesland === land ? 0 : 1;
      return (
        av - bv ||
        String(a.teamName || "").localeCompare(String(b.teamName || ""), "de")
      );
    });
  }, [teams, ort, cityMap, me]);

  // Wonach ist sortiert? Wird ausgeschrieben, damit die Reihenfolge nicht wie
  // ein Ranking gelesen wird, das sie nicht ist.
  //
  // „Zuerst aus <Land>" steht nur da, wenn dort auch wirklich einer ist. Sonst
  // las Sven (Profil: Sachsen) über einer Liste aus Hamburg, München, Köln und
  // Berlin die Zeile „Zuerst aus Sachsen" – eine Überschrift, die ihr eigener
  // Inhalt widerlegt. Beim ersten Belegbild genau so aufgetreten.
  const landTreffer =
    !!me?.bundesland && vereine.some((t) => t.bundesland === me.bundesland);
  const sortierHinweis = ort
    ? `Nach Entfernung zu ${ort.n}`
    : landTreffer
    ? `Zuerst aus ${me.bundesland}`
    : "Alphabetisch";

  async function alsVerfuegbarEintragen() {
    setTransferBusy(true);
    setTransferFehler(false);
    try {
      await axios.post("/api/player/update-transfer", {
        token: getPlayerToken(),
        transferStatus: "verfuegbar",
      });
      setVerfuegbar(true);
    } catch {
      setTransferFehler(true);
    } finally {
      setTransferBusy(false);
    }
  }

  // Route 04 sieht nur, wen sie angeht: Team-Admins – und Ausgeloggte, weil bei
  // ihnen offen ist, ob sie Spieler oder Trainerin sind. Ein eingeloggter
  // Spieler ohne Team bekommt sie nicht, für ihn ist sie Rauschen.
  const zeigeAusschreiben = !angemeldet || !!me?.isTeamAdmin;

  return (
    <section className={leer ? "" : "mt-12 border-t border-navy-600 pt-8"}>
      <Reveal className="max-w-2xl">
        {kopf.eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist-400">
            {kopf.eyebrow}
          </p>
        )}
        <h2
          className={
            leer
              ? "mt-2 font-display text-3xl font-black uppercase leading-[0.95] tracking-tight text-paper-50 text-balance sm:text-5xl"
              : "font-display text-2xl font-bold uppercase leading-tight tracking-wide text-paper-50"
          }
        >
          {kopf.titel}
        </h2>
        <p className={`max-w-prose text-sm leading-relaxed text-mist-300 ${leer ? "mt-4" : "mt-2"}`}>
          {kopf.text}
        </p>
      </Reveal>

      <div className="mt-8 space-y-6">
        {/* ------------------------------------------------------------- */}
        {/* 01 – Die eine hervorgehobene Karte. Auf dem Leerzustand trägt  */}
        {/* sie die 2px-Markenleiste an der Oberkante: laut visueller      */}
        {/* Richtung genau der Ort dafür („Oberkante der einen             */}
        {/* hervorgehobenen Karte"). Im Anhang-Fall bleibt sie weg – dort  */}
        {/* liegt der Fokus auf der Tryout-Liste darüber.                  */}
        {/* ------------------------------------------------------------- */}
        <Reveal delay={staffel(0)}>
          <Route nr="01" titel="Vereine in deiner Nähe" hervorgehoben={leer}>
            <p className="mt-1 max-w-prose text-sm text-mist-400">
              Auf jeder Vereinsseite kannst du direkt anfragen.
            </p>

            <div
              className={`mt-3 rounded-md border border-navy-600 bg-navy-800 ${
                leer ? "border-t-2 border-t-brand-500" : ""
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-navy-600 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-mist-400">
                  {sortierHinweis}
                </p>
                {!ortOffen && (
                  <button
                    type="button"
                    onClick={() => setOrtOffen(true)}
                    className="inline-flex items-center gap-1.5 rounded-sm text-xs font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
                  >
                    <PiMapPinBold aria-hidden="true" />
                    Nach Entfernung sortieren
                  </button>
                )}
              </div>

              {ortOffen && (
                <div className="border-b border-navy-600 px-4 py-3">
                  <CityInput
                    value={ortTerm}
                    onChange={(v) => {
                      setOrtTerm(v);
                      if (!v) setOrt(null);
                    }}
                    onPick={(c) => {
                      setOrtTerm(c.n);
                      setOrt({ n: c.n, lat: c.lat, lng: c.lng });
                    }}
                    placeholder="Deine Stadt…"
                    className={inputClassSm}
                  />
                </div>
              )}

              {!geladen ? (
                <p className="px-4 py-6 text-sm text-mist-400">Wird geladen…</p>
              ) : teamsFehler ? (
                <p className="px-4 py-6 text-sm text-mist-400">
                  Die Vereinsliste konnte gerade nicht geladen werden.{" "}
                  <Link
                    href="/teams"
                    className="rounded-sm font-medium text-brand-400 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    Zur Vereinsübersicht
                  </Link>
                </p>
              ) : vereine.length === 0 ? (
                <p className="px-4 py-6 text-sm text-mist-400">
                  Auf Hoops Germany ist bisher kein Verein eingetragen, den du
                  anfragen könntest. Wir sind in der Testphase – du wärst einer
                  der Ersten.
                </p>
              ) : (
                <ul className="divide-y divide-navy-600">
                  {vereine.slice(0, MAX_VEREINE).map((t) => (
                    <li key={t._id}>
                      <Link
                        href={`/team/team-detail/${t.slug}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400"
                      >
                        <Avatar
                          name={t.teamName}
                          src={t.logo}
                          className="h-9 w-9 flex-shrink-0"
                          textClass="text-[10px]"
                          square
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-paper-50 transition-colors duration-150 group-hover:text-brand-300">
                            {t.teamName}
                          </span>
                          <span className="block truncate text-xs text-mist-400">
                            {[t.region, t.bundesland].filter(Boolean).join(" · ") ||
                              "Ort nicht angegeben"}
                          </span>
                        </span>
                        {typeof t.km === "number" && (
                          <span className="flex-shrink-0 font-mono text-xs tabular-nums text-mist-400">
                            {t.km} km
                          </span>
                        )}
                        <PiArrowRightBold
                          aria-hidden="true"
                          className="flex-shrink-0 text-xs text-navy-500 transition-colors duration-150 group-hover:text-brand-400"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {geladen && vereine.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-navy-600 px-4 py-3">
                  <p className="text-xs text-mist-400">
                    <span className="font-mono tabular-nums text-mist-300">
                      {vereine.length}
                    </span>{" "}
                    {vereine.length === 1 ? "Verein" : "Vereine"}, die du anfragen
                    kannst
                  </p>
                  <Link
                    href="/teams"
                    className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
                  >
                    Alle Vereine ansehen
                    <PiArrowRightBold aria-hidden="true" className="text-[10px]" />
                  </Link>
                </div>
              )}
            </div>
          </Route>
        </Reveal>

        {/* --------------------------------------------------------------- */}
        {/* 02 – Transfermarkt. Das ist der Rückweg, den Ronja als K9 führt: */}
        {/* /transfermarkt verlinkte hierher, aber nicht zurück.             */}
        {/* --------------------------------------------------------------- */}
        <Reveal delay={staffel(1)}>
          <Route nr="02" titel="Transfermarkt">
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-400">
              {suchendeVereine === null ? (
                // Zahl unbekannt (noch nicht geladen oder Anfrage fehlgeschlagen)
                // – dann wird keine behauptet.
                <>Dort steht, welche Vereine gerade öffentlich Verstärkung suchen.</>
              ) : suchendeVereine > 0 ? (
                <>
                  <span className="font-mono tabular-nums text-mist-300">
                    {suchendeVereine}
                  </span>{" "}
                  {suchendeVereine === 1 ? "Verein sucht" : "Vereine suchen"} dort
                  gerade öffentlich Verstärkung.
                </>
              ) : (
                <>
                  Dort steht, wer gerade Verstärkung sucht – aktuell kein Verein
                  öffentlich. Es ist aber die Stelle, an der es zuerst auftaucht.
                </>
              )}
            </p>
            <Link
              href="/transfermarkt"
              className="mt-2 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-brand-400 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            >
              Transfermarkt öffnen
              <PiArrowRightBold aria-hidden="true" className="text-xs" />
            </Link>
          </Route>
        </Reveal>

        {/* --------------------------------------------------------------- */}
        {/* 03 – Die Gegenrichtung: nicht suchen, sondern auffindbar sein.   */}
        {/* Wortlaut bewusst nah an Schritt 5 der Tour (TourSteps.js), damit */}
        {/* Einstieg und Seite dieselbe Sprache sprechen – inklusive des     */}
        {/* ehrlichen „noch im Aufbau", das Nele dort am 13.08. gesetzt hat. */}
        {/* --------------------------------------------------------------- */}
        <Reveal delay={staffel(2)}>
          <Route nr="03" titel="Von Vereinen gefunden werden">
            {!angemeldet ? (
              <>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-400">
                  Mit einem Profil stehst du im Transfermarkt, sobald du dich als
                  verfügbar einträgst. Der ist noch im Aufbau – du gehörst zu den
                  Ersten.
                </p>
                {/* Bewusst NICHT der gefüllte Primärbutton: Wer hier steht,
                    sucht einen Verein, nicht ein Konto. Die orange Fläche
                    gehört auf dieser Seite keiner Anmeldung, sondern bleibt
                    für die Vereinsliste reserviert (Route 01). */}
                <div className="mt-3">
                  <Button href="/signup" size="sm" variant="secondary">
                    Profil anlegen
                  </Button>
                </div>
              </>
            ) : verfuegbar ? (
              <>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-signal-ok">
                  <PiCheckBold aria-hidden="true" className="flex-shrink-0" />
                  Du stehst als verfügbar im Transfermarkt.
                </p>
                <Link
                  href="/player/player-detail"
                  className="mt-2 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                >
                  Spielklasse und Notiz ergänzen
                  <PiArrowRightBold aria-hidden="true" className="text-xs" />
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-400">
                  Trag dich als verfügbar ein – du bist damit sichtbar, sobald ein
                  Verein im Transfermarkt sucht. Der ist noch im Aufbau, du
                  gehörst zu den Ersten.
                </p>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={alsVerfuegbarEintragen}
                    disabled={transferBusy}
                  >
                    {transferBusy ? "Wird gespeichert…" : "Als verfügbar eintragen"}
                  </Button>
                </div>
                {transferFehler && (
                  <FormAlert className="mt-3">
                    Konnte gerade nicht gespeichert werden – im Profil unter
                    „Transfer&ldquo; nachholbar.
                  </FormAlert>
                )}
              </>
            )}
          </Route>
        </Reveal>

        {/* --------------------------------------------------------------- */}
        {/* 04 – Die Angebotsseite. Ohne sie bleibt diese Seite dauerhaft    */}
        {/* leer: Tryouts entstehen nur, wenn jemand eines ausschreibt.      */}
        {/* --------------------------------------------------------------- */}
        {zeigeAusschreiben && (
          <Reveal delay={staffel(3)}>
            <Route nr="04" titel="Ihr sucht Spieler?">
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-mist-400">
                Schreibt ein Probetraining aus – es steht dann auf dieser Seite.
              </p>
              <Link
                href={me?.isTeamAdmin ? "/team/admin?tab=tryouts" : "/team/create"}
                className="mt-2 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-mist-300 transition-colors duration-150 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
              >
                {me?.isTeamAdmin ? "Probetraining ausschreiben" : "Team eintragen"}
                <PiArrowRightBold aria-hidden="true" className="text-xs" />
              </Link>
            </Route>
          </Reveal>
        )}
      </div>
    </section>
  );
}
