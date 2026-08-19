"use client";

import { useEffect, useState } from "react";
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

// Vollbild-Hero auf ruhiger Fläche (seit 12.08.2026 ohne Foto). Zeigt einen
// personalisierten Bereich für eingeloggte Spieler, sonst die öffentliche
// Aufforderung.
//
// Die Fläche selbst liefert `HeroScrollStage` (scroll-gezeichneter Dunk,
// Konzept docs/HERO-DUNK-KONZEPT-2026-08-19.md).
//
// ⚠️ `inhaltRef` IST AM 19.08.2026 ENTFALLEN. Sie reichte den Inhaltsblock an
// die Bühne durch, damit der alte Ball zur Laufzeit wusste, wo jede Textzeile
// steht. Eine Linie darf jede Zeile kreuzen – die Bühne braucht den Inhalt
// nicht mehr zu kennen. Das ist auch der Grund, warum Roadmap 20e und 20f
// (Ballsprung beim späten Anmelde-Wechsel) gegenstandslos sind: Die Zeichnung
// hängt an keinem Inhaltselement, der Zweigtausch ist ihr gleichgültig.
//
// ⚠️ DER AUSGELOGGTE HERO TRUG SECHS DINGE UND TRÄGT JETZT VIER.
// Entscheidung Nele (docs/HERO-AKTION-ENTSCHEIDUNG-2026-08-19.md), Auftrag
// Patrick. Was den Apple-Eindruck am meisten beschädigt hat, war nicht der
// Ball, sondern die Dichte: Abzeichen + vierzeilige Display-Überschrift +
// Absatz + DREI gleich gewichtete Schaltflächen + Zeichnung + Ball.
// Geblieben sind: Überschrift · eine Taste · eine Kleinzeile · die Zeichnung.
export default function LandingHero() {
  const [player, setPlayer] = useState(null); // null = lädt / ausgeloggt
  const [checked, setChecked] = useState(false);
  const [signal, setSignal] = useState(null); // offene Sache für Wiederkehrer

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
    <HeroScrollStage>
      <>
        {checked && player ? (
          <>
            <div>
              <Reveal as="div" delay={0} className="mb-6">
                {/* ⚠️ `data-hero-eyebrow` ist am 19.08.2026 entfallen. Der
                  Marker war der Anker der mobilen Ball-Ruhelage; mit dem Ball
                  hat er keinen Leser mehr. Ein Attribut ohne Leser ist keine
                  Dokumentation, sondern eine Spur, der der Nächste folgt. */}
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
                {/* ⚠️ KEIN FARBAKZENT MEHR – dieselbe Regel wie im
                  ausgeloggten Hero (Befund Tobias B4, 19.08.2026). Hier stand
                  `text-brand-400`, während die ausgeloggte Überschrift beim
                  Umbau auf Weiss gewechselt ist: zwei Regeln für dieselbe
                  Stelle, je nachdem ob jemand angemeldet ist.
                  Die Begründung ist wortgleich die des ausgeloggten Zweigs und
                  steht dort ausführlich: Das Designsystem erlaubt EIN Orange,
                  und es gehört der Handlung (Taste) und dem Motiv (Zeichnung).
                  Ein Überschriftswort markiert hier nichts, was ohne Markierung
                  übersehen würde.
                  ⚠️ Der UMFANG des eingeloggten Heros – acht Dinge, fünf Tasten
                  – ist damit NICHT erledigt und gehört zu Nele; das hier ist
                  ausschliesslich die Farbfrage. */}
                <SplitFlap delay={420}>
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
                  <Link href="/home" className={`${HERO_PRIMARY} ${HERO_W}`}>
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
            <div>
              {/* ⚠️ DAS ABZEICHEN (EYEBROW) IST ENTFALLEN (Nele, 19.08.2026).
                Es trug „Amateur-Basketball in NRW", die Überschrift darunter
                „Deine Basketball-Community in NRW" – von sechs Dingen im Hero
                sagten also zwei dasselbe. Das ist die billigste Kürzung, die es
                hier gab: ein Element weniger, keine Information verloren, kein
                neuer Anspruch. */}
              <Reveal
                as="h1"
                delay={0}
                className="font-display text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight mb-8 leading-[0.9]"
              >
                Deine Basketball-
                {/* ⚠️ DER UMKLAPP-EFFEKT AUF „COMMUNITY" IST ENTFALLEN
                  (Entscheidung Vivien; Nele hatte sie mir ausdrücklich
                  überlassen). Er war ab diesem Umbau das ZWEITE bewegte Element
                  im selben Bild – neben der Zeichnung, die jetzt schon im
                  ersten Bild mit dem Ring beginnt. Dieselbe Dichte-Frage wie
                  bei den sechs Elementen, nur auf der Zeitachse. Neles Befund
                  dazu: „Das Wort Community gewinnt durch das Umklappen keine
                  Bedeutung." Der Farbakzent bleibt, die Bewegung geht. */}
                {/* ⚠️ DIE ÜBERSCHRIFT HAT KEINEN FARBAKZENT MEHR — und das
                  ist die härteste Entscheidung dieses Umbaus, deshalb steht der
                  ganze Weg dahin hier.
                  `docs/VISUELLE-RICHTUNG-2026-08-12.md` sieht ein
                  „Schlüsselwort in brand-500" vor; gebaut war „Community" in
                  `brand-400`.
                  **Gemessen kreuzt der Zug (wirksame Deckkraft 0,558) genau
                  dieses Wort auf 1024×768 — Kontrast 2,77 : 1.** Orange auf
                  Orange.
                  ⚠️ Geometrie löst das NICHT: Der Ball muss über dem Ring
                  stehen, der Ring steht auf halber Bühnenhöhe, und dort steht
                  der mittig gesetzte Inhalt. Auf kurzen Querformat-Bühnen
                  liegen Zug-Spitze und Überschrift zwangsläufig im selben Band.
                  Wer es über die Lage löst, landet wieder bei der Kastenlogik,
                  die dieser Umbau gerade abgeschafft hat.
                  ⚠️ Und Aufhellen löst es auch nicht: `brand-100` (#FFE3C6)
                  hält zwar 4,74 : 1, aber am gebauten Stück gesehen ist es ein
                  blasses Creme, das sich von der weißen Zeile kaum noch
                  absetzt — „Barrierefreiheit gewonnen, Wirkung verloren"
                  (Tobias, CLAUDE.md) in klein.
                  **Die eigentliche Ursache ist, dass ZWEI Dinge im Hero
                  denselben einen Akzent beanspruchen.** Das Designsystem
                  erlaubt genau ein Orange. Nach der Reduktion trugen es Taste
                  UND Überschriftswort UND Zeichnung. Eines muss weichen, und
                  das schwächste ist das Wort: Es markiert nichts, was ohne
                  Markierung übersehen würde — der Hero hat nur noch EINEN
                  Textblock, und was gefunden werden muss, ist die Taste.
                  Das Orange gehört jetzt der Handlung und dem Motiv.
                  ⚠️ Das ist eine Abweichung von der Visuellen Richtung. Sie
                  gilt ausdrücklich NUR für diesen Hero; wer sie zurückdreht,
                  bekommt den Befund auf 1024×768 zurück und muss ihn anders
                  lösen (`tests/e2e/hero-dunk.spec.mjs`, P1, wird dann rot). */}
                Community
                <br />
                in NRW
              </Reveal>
              {/* ⚠️ DER ABSATZ IST ENTFALLEN (Nele). Er zählte drei Funktionen
                auf – genau das, was die Feature-Strecke darunter seit dem
                11.08. in sechs Szenen mit Bewegung erzählt. Was NICHT verloren
                gehen durfte, ist die Tatsache „kostenlos": sie sitzt jetzt in
                der Taste selbst.
                ⚠️ EINE Taste, EIN Ziel. Der Hero hat nach dieser Reduktion
                genau einen Ausgang, und der ist `/signup`. Das hebt Roadmap 22
                (`/signup` liefert ohne JavaScript eine leere Seite) in der
                Dringlichkeit – bisher standen daneben zwei andere Tasten.
                `?src=home-hero` nutzt die bereits produktive Kampagnen-Quelle
                (Muster `[a-z0-9-_]`, max. 40 Zeichen); ab jetzt ist trennbar,
                wie viele Registrierungen aus dem Hero kommen und wie viele aus
                dem Flyer-QR.
                ⚠️ ES IST NELES RÜCKFALL-WORTLAUT, NICHT IHR EMPFOHLENER —
                und zwar gemessen, nicht geglaubt. Ihre erste Wahl war
                „Kostenloses Profil anlegen" (26 Zeichen) mit der Kleinzeile
                „Ab 16 Jahren"; sie hat den Rückfall ausdrücklich an die
                Bedingung geknüpft, dass 26 Zeichen die Taste auf 360 px
                zweizeilig machen. Genau das tun sie: am gebauten Stück auf
                360 px stand dort „Kostenloses Profil / anlegen". Eine
                zweizeilige Primärtaste in einem Hero, der auf VIER Elemente
                reduziert wurde, gibt die Ruhe wieder her, für die reduziert
                wurde. Also 14 Zeichen auf der Taste, und „kostenlos" wandert
                in die Kleinzeile — die Tatsache bleibt, sie steht nur eine
                Zeile tiefer. */}
              <Reveal as="div" delay={90} className="flex justify-center">
                <Link
                  href="/signup?src=home-hero"
                  className="bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold py-4 px-8 rounded-md text-lg flex items-center justify-center gap-2 transition-[transform,background-color] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  Profil anlegen <PiArrowRightBold />
                </Link>
              </Reveal>
              {/* Kleinzeile UNTER der Taste, nicht darüber: Überschrift →
                Angebot → Bedingung. Eine Bedingung über dem Angebot ist eine
                Hürde, unter dem Angebot ist sie eine Fußnote (Nele).
                Sie schließt zugleich eine gemessene Lücke: Die Altersgrenze
                wurde auf der Startseite bisher NIRGENDS genannt, ein
                14-Jähriger erfuhr sie erst nach fünf ausgefüllten Feldern
                (Lina, docs/ENTDECKBARKEIT-BEFUND-2026-08-14.md, P2-3). */}
              {/* ⚠️ `text-paper-100`, NICHT `text-mist-400` (Neles Vorgabe war
                „klein, gedämpft" — die Farbe ist meine Entscheidung, die
                Lesbarkeit nicht verhandelbar). Gemessen kreuzen die stärksten
                Linien der Zeichnung genau diese Zeile: auf 360/375/768 die
                Abschluss-Ebene (wirksam 0,620), auf 1280/1440 der Zug (0,558).
                `mist-400` fällt darüber auf **2,79 : 1** bzw. 3,19 : 1 — unter
                der AA-Schwelle von 4,5. `paper-100` hält über JEDER Ebene
                mindestens **4,84 : 1**, ist also unabhängig davon, wo die Linie
                künftig verläuft.
                Die Unterordnung trägt die GRÖSSE (14 px gegen 48–96 px), nicht
                die Farbe — auf dunklem Grund ist gedämpftes Grau ohnehin der
                häufigere Barrierefreiheits-Fehler. */}
              <Reveal
                as="p"
                delay={180}
                className="mt-4 text-sm text-paper-100"
              >
                Kostenlos · ab 16 Jahren
              </Reveal>
            </div>
          </>
        )}
      </>
    </HeroScrollStage>
  );
}
