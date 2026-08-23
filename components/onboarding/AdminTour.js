"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import axios from "axios";
import {
  PiXBold,
  PiArrowLeftBold,
  PiArrowRightBold,
  PiArrowCounterClockwiseBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiMagnifyingGlassBold,
  PiLinkBold,
  PiUsersThreeBold,
} from "react-icons/pi";
import Button from "@/components/ui/Button";
import SplitFlap from "@/components/ui/SplitFlap";
import { getPlayerToken } from "@/lib/clientAuth";
import { sperreAn, sperreAus } from "@/lib/scrollSperre";
import { trackEvent } from "@/lib/trackEvent";

// ---------------------------------------------------------------------------
// Team-Admin-Tour „Der Spielberichtsbogen"
//
// Konzept + finale Wortlaute: docs/TEAMADMIN-TOUR-KONZEPT-2026-08-23.md (Nele,
// Auftrag Patrick). Zielgruppe Z2 (Ehrenamt) – jeder Schritt nennt den Aufwand
// zuerst und ehrlich, den Ertrag fürs Team danach. Die Tour verspricht nichts,
// was das Produkt nicht hält (Faktenbasis in Abschnitt 0 des Konzepts).
//
// Mechanik: dieselben Dialog-Folien wie die Spieler-Tour (WelcomeTour.js) –
// Overlay, Weiter/Zurück/Überspringen, Segmentleiste, Escape, Fokusfalle,
// Scroll-Sperre. Je Schritt zeigt die Folie eine Miniatur des echten Bauteils
// als Zitat-Karte (Muster `StepFeed`/`AvatarZitat`), KEINE Spotlights über den
// echten Elementen: Aufgaben-Leiste und Spiele-Liste laden asynchron – ein
// Spotlight auf ein Element, das noch nicht oder nie da ist, ist die
// Fehlerklasse, die dieses Projekt dreimal teuer bezahlt hat (Konzept §1).
//
// ⚠️ Der Dialog-Rahmen ist bewusst eine KOPIE des WelcomeTour-Rahmens, keine
// Extraktion: WelcomeTour ist abgenommen und mehrfach durch Gates gegangen –
// eine gemeinsame Shell herauszulösen hieße, das geprüfte Bauteil ohne Not
// anzufassen. Die Kopie ist schlanker (keine Speicher-Schritte, kein
// Weg-Zustand, kein ANONYM-Ausgang: /team/admin verlangt Login).
//
// Auslöse-Logik (Konzept §3):
//  – Auto-Start nur, wenn `adminTourSeen` NICHT gesetzt ist UND `welcomeSeen`
//    gesetzt ist. Die zweite Bedingung ist die Vorrang-Regel: Ein frisch
//    registrierter Gründer trägt beide Flags auf false, und die Spieler-Tour
//    startet routenunabhängig aus dem Root-Layout – zwei gestapelte Dialoge
//    wären ein neuer Fall für lib/scrollSperre.js. Die Admin-Tour kommt dann
//    beim nächsten /team/admin-Besuch.
//  – Wiederaufruf über das Event `hg:open-admin-tour` (Link unten im Panel).
//    Bewusst NICHT das bestehende `hg:open-tour` mitbenutzen – ein Link, der
//    je nach Rolle etwas anderes öffnet, ist eine Falle.
//  – Jedes Schließen (X, Überspringen, Escape, Abschluss, „Zeig mir das")
//    setzt `adminTourSeen` – wie bei der Spieler-Tour; wer sie wieder will,
//    hat den Link im Panel.
// ---------------------------------------------------------------------------

// BELEG-AUSSAGE-PRINZIP (geprüft von tests/e2e/beleg-aussage.spec.mjs):
// Diese Tour erklärt das VERFAHREN („sagen beide dasselbe, steht das Spiel
// als Bestätigt da") und zeigt kein echtes Spiel – sie kann `beidseitigBelegt`
// gar nicht anwenden, weil es hier kein Spiel-Objekt gibt. Genau deshalb
// tragen die Zitat-Karten das Band „Beispiel", und der Wortlaut behauptet nur,
// was das Prädikat in lib/matchScore.js tatsächlich prüft (dieselbe Einordnung
// wie StepFeed in TourSteps.js).

// Band über jeder Zitat-Karte: erfundene Inhalte tragen die Kennzeichnung
// „Beispiel" – dieselbe Regel wie StepFeed/TourProofBoard, damit aus einer
// Illustration kein vermeintlich echtes Spielergebnis wird
// (docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md).
function ZitatKarte({ etikett, children }) {
  return (
    <div className="overflow-hidden rounded-md border border-navy-600 bg-navy-800">
      <div className="border-b border-navy-600 bg-navy-900 px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">
          Beispiel · {etikett}
        </span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

// Miniatur der Aufgaben-Leiste (components/team/AufgabenLeiste.js) – beide
// Zustände nebeneinander: ein Beispiel-Posten und der Leerzustand. Wer sie
// hier sieht, erkennt sie oben im Panel wieder. `aria-hidden` auf den reinen
// Kulissen-Teilen; die Aussage trägt der Text der Folie.
function ZitatAufgaben() {
  return (
    <div className="space-y-2">
      <ZitatKarte etikett="Es steht etwas an">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-mist-600">
          Zu erledigen
        </p>
        <span
          aria-hidden="true"
          className="mt-2 inline-flex items-center gap-2 rounded-sm border border-navy-600 bg-navy-700 px-2.5 py-1.5 text-xs text-paper-50"
        >
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-signal-wait px-1 font-mono text-[11px] font-bold tabular-nums text-navy-950">
            1
          </span>
          Ergebnis fehlt
          <PiArrowRightBold className="text-[10px] text-mist-400" />
        </span>
      </ZitatKarte>
      <ZitatKarte etikett="Nichts offen">
        <p className="flex items-start gap-2 text-xs text-paper-50">
          <PiCheckCircleBold className="mt-0.5 flex-shrink-0 text-signal-ok" aria-hidden="true" />
          <span>Keine offene Anfrage, kein fehlendes Ergebnis.</span>
        </p>
      </ZitatKarte>
    </div>
  );
}

// Miniatur der Ergebnis-Meldung (ErgebnisseTab): zwei Zahlenfelder, der
// Einreichen-Knopf als Attrappe (span, aria-hidden – ein echter Button in
// einer Kulisse wäre ein Tippziel ohne Wirkung), darunter die Statuszeile
// „Bestätigt" mit gefüllter Beleg-Lampe – dieselbe Form wie im echten Tab.
function ZitatErgebnis() {
  return (
    <ZitatKarte etikett="Ergebnis melden">
      <div aria-hidden="true" className="flex flex-wrap items-end gap-2.5">
        <div>
          <span className="mb-1 block text-[10px] font-medium text-mist-400">Eigene Punkte</span>
          <span className="flex h-8 w-14 items-center justify-center rounded-sm border border-navy-600 bg-navy-700 font-mono text-sm tabular-nums text-paper-50">
            74
          </span>
        </div>
        <span className="pb-1.5 font-semibold text-mist-400">:</span>
        <div>
          <span className="mb-1 block text-[10px] font-medium text-mist-400">Gegner-Punkte</span>
          <span className="flex h-8 w-14 items-center justify-center rounded-sm border border-navy-600 bg-navy-700 font-mono text-sm tabular-nums text-paper-50">
            68
          </span>
        </div>
        <span className="ml-auto inline-flex h-8 items-center rounded-sm bg-brand-500 px-3 text-xs font-semibold text-navy-950">
          Einreichen
        </span>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 border-t border-navy-600 pt-2 text-xs font-semibold text-signal-ok">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-signal-ok" />
        Bestätigt – beide Teams haben dasselbe gemeldet
      </p>
    </ZitatKarte>
  );
}

// Miniatur des Statistik-Editors: zwei Zeilen PKT/AST/REB, darunter die grüne
// Erfolgszeile mit der echten Wortstellung aus ErgebnisseTab.js:239 – nur die
// Zahl ist erfunden, deshalb das Beispiel-Band.
function ZitatBoxscore() {
  const zeilen = [
    { name: "L. Brandt", pkt: 14, ast: 5, reb: 2 },
    { name: "J. Okafor", pkt: 9, ast: 1, reb: 7 },
  ];
  return (
    <ZitatKarte etikett="Spieler-Statistiken">
      <div aria-hidden="true">
        <div className="grid grid-cols-[1fr_repeat(3,2.25rem)] gap-x-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mist-500">
          <span />
          <span className="text-center">Pkt</span>
          <span className="text-center">Ast</span>
          <span className="text-center">Reb</span>
        </div>
        {zeilen.map((z) => (
          <div
            key={z.name}
            className="mt-1 grid grid-cols-[1fr_repeat(3,2.25rem)] items-center gap-x-1"
          >
            <span className="truncate text-xs text-paper-50">{z.name}</span>
            {[z.pkt, z.ast, z.reb].map((wert, i) => (
              <span
                key={i}
                className="flex h-7 items-center justify-center rounded-sm border border-navy-600 bg-navy-700 font-mono text-xs tabular-nums text-paper-50"
              >
                {wert}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2.5 border-t border-navy-600 pt-2 text-xs text-signal-ok">
        <PiCheckBold className="mr-1.5 inline-block align-[-0.125em]" aria-hidden="true" />
        Statistiken gespeichert – 8 Spieler wurden über die eigenen Zahlen benachrichtigt.
      </p>
    </ZitatKarte>
  );
}

// Die drei Einladewege als schlichte Dreizeilen-Liste – bewusst kein
// Formular-Nachbau (Konzept Schritt 5).
function ZitatEinladewege() {
  const wege = [
    { Icon: PiMagnifyingGlassBold, text: "Suche: Wer schon ein Konto hat, ist in Sekunden drin" },
    { Icon: PiLinkBold, text: "Persönlicher Platz-Link für einen bestimmten Spieler" },
    { Icon: PiUsersThreeBold, text: "Team-Link – einmal in die Mannschaftsgruppe" },
  ];
  return (
    <ZitatKarte etikett="Drei Einladewege">
      <ul className="space-y-2">
        {wege.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-xs text-mist-300">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm bg-navy-700 text-sm text-brand-400">
              <Icon aria-hidden="true" />
            </span>
            <span className="pt-1">{text}</span>
          </li>
        ))}
      </ul>
    </ZitatKarte>
  );
}

// Die sechs Schritte. Wortlaute FINAL aus dem Konzept – jede inhaltliche
// Abweichung (neue Zusage, neue Zahl) geht vor dem Deploy zurück an Nele
// (Konzept §6). Was die Tour bewusst NICHT sagt, steht in §5: kein „live",
// kein Ticker, keine Offline-Zusage, kein „doppelt bestätigte Zahlen".
//
// ⚠️ `brauchtTab`: Schritte werden nach den REITER-RECHTEN des Lesers
// gefiltert (Befund Lina M2, Entscheidung Nele 23.08.2026, Option a): Ein
// Co-Admin mit Teilrechten (lib/teamPermissions.js) hörte sonst drei Folien
// über Flächen, die sein Panel nicht hat – und die Tour lebt davon, dass
// jeder Satz für DIESEN Leser wahr ist. Ein „je nach deinen Rechten"-Einschub
// wurde ausdrücklich verworfen (verwässert die Aufwands-Botschaft). Gleiches
// Prinzip für die Tryouts-Fußzeile (`fusszeileTab`) und die Schlussfolie
// (`textOhneErgebnisse` – kein „Ergebnis melden"-Versprechen an jemanden ohne
// Ergebnisse-Reiter).
const SCHRITTE = [
  {
    key: "ueberblick",
    marke: "Dein Überblick",
    titel: "Ein Blick statt sechs Reiter",
    text: "Diese Leiste oben zählt, was gerade ansteht – eine Beitrittsanfrage, ein fehlendes Ergebnis. Ein Tipp darauf bringt dich direkt hin. Und steht da nichts an, ist wirklich nichts zu tun. Du musst hier nicht regelmäßig vorbeischauen – die Leiste wartet auf dich, nicht umgekehrt.",
    Zitat: ZitatAufgaben,
  },
  {
    key: "ergebnis",
    marke: "Nach dem Spiel",
    titel: "Ein Ergebnis: zwei Zahlen",
    text: "Eure Punkte, Gegner-Punkte, Einreichen – das ist die ganze Meldung, sie dauert keine Minute. Der Gegner meldet unabhängig; sagen beide dasselbe, steht das Spiel als „Bestätigt“ da. Ein Ergebnis, das hinterher niemand bestreitet – dafür brauchte es nur deine zwei Zahlen.",
    Zitat: ZitatErgebnis,
    zeigTab: "ergebnisse",
    brauchtTab: "ergebnisse",
  },
  {
    key: "boxscore",
    marke: "Der beste Moment",
    titel: "Deine Spieler bekommen ihre Zahlen",
    // „mit eigenem Konto" steht bewusst im Text: Slot-Spieler ohne Account
    // bekommen nichts (lib/statsNotify.js, Regel 1). Ohne den Einschub
    // verspräche die Tour eine Nachricht an Leute, die keine bekommen können.
    text: "Punkte, Assists, Rebounds – eine Tabelle, du füllst nur aus, was einer gemacht hat. Sobald das Ergebnis eingetragen ist, bekommt jeder erfasste Spieler mit eigenem Konto automatisch die Nachricht, dass seine Zahlen stehen – und du siehst, wie viele es waren. Zehn Minuten von dir, und das ganze Team hat etwas davon.",
    Zitat: ZitatBoxscore,
    brauchtTab: "ergebnisse",
  },
  {
    key: "punktezettel",
    marke: "Wenn du magst",
    titel: "Dein Punktezettel am Spielfeldrand",
    // Reiner Text, keine Zitat-Karte – das KANN soll nicht wie eine dritte
    // Pflichtfläche aussehen (Konzept Schritt 4). „Speichert jederzeit", nicht
    // „speichert überall": keine Offline-Zusage, Roadmap 17 ist nicht gebaut.
    text: "Die Statistik-Tabelle ist ab Spielbeginn offen und speichert jederzeit – du kannst also direkt hier mittippen, statt einen Zettel zu führen und ihn später zu übertragen. An deine Spieler geht dabei nichts raus: Die Nachricht kommt erst, wenn das Ergebnis eingetragen ist. Und genauso gut trägst du alles nach dem Spiel in Ruhe ein – beides ist richtig.",
    brauchtTab: "ergebnisse",
  },
  {
    key: "team",
    marke: "Dein Team",
    titel: "Einladen ohne Zettelwirtschaft",
    text: "Drei Wege in deinen Kader: Wer schon ein Konto hat, ist über die Suche in Sekunden drin. Sonst schickst du einen persönlichen Platz-Link – oder den Team-Link einmal in die Mannschaftsgruppe. Meldet sich jemand von selbst, wartet das unter „Anfragen“, du gibst nur frei. Und je mehr deiner Spieler ein eigenes Konto haben, desto mehr bekommen nach jedem Spiel ihre Zahlen.",
    Zitat: ZitatEinladewege,
    brauchtTab: "kader",
    // Tryouts als Fußzeile, nicht als eigener Schritt (Empfehlung Nele,
    // Konzept §7.3): jede zusätzliche Folie bezahlt die Aufwands-Botschaft.
    // `fusszeileTab`: nur mit sichtbarem Tryouts-Reiter – sonst käme das
    // M2-Problem durch die Hintertür im Kleinen zurück (Nele, 23.08.2026);
    // die Zeile war bewusst so gebaut, dass sie wegfallen kann.
    fusszeile:
      "Ihr sucht Verstärkung? Unter „Tryouts“ ist ein Probetraining schnell ausgeschrieben – es erscheint öffentlich auf der Tryouts-Seite.",
    fusszeileTab: "tryouts",
  },
  {
    key: "schluss",
    marke: "Das war's",
    titel: "Mehr ist es nicht",
    text: "Ergebnis melden, wenn eins ansteht – den Rest sagt dir die Leiste oben. Diese Tour findest du jederzeit wieder, unten im Panel.",
    // Fassung für Leser OHNE Ergebnisse-Reiter (Nele, 23.08.2026): kein
    // „Ergebnis melden"-Versprechen an jemanden, dessen Panel die Fläche
    // nicht hat – dieselbe Übergabe an die Leiste, zwei Sätze.
    textOhneErgebnisse:
      "Was bei dir ansteht, sagt dir die Leiste oben – mehr musst du dir nicht merken. Diese Tour findest du jederzeit wieder, unten im Panel.",
  },
];

export default function AdminTour({ player, onTab, sichtbareTabs }) {
  const [open, setOpen] = useState(false);
  const [sichtbar, setSichtbar] = useState(false);
  const [index, setIndex] = useState(0);
  const [richtung, setRichtung] = useState(1);

  // Die Schrittfolge DIESES Lesers (Nele, Option a): Schritte, deren Reiter er
  // nicht sehen darf, existieren für ihn auch in der Tour nicht. Ohne
  // `sichtbareTabs` (defensiv) gilt die volle Folge – die Seite übergibt die
  // Liste aber immer, und zwar erst im „ready"-Zustand mit geladenem Spieler,
  // sodass der Voll-Admin nie versehentlich die Kurzfassung sieht
  // (Neles Randfall-Hinweis; Mount-Bedingung in app/team/admin/page.js).
  const schritte = useMemo(() => {
    if (!sichtbareTabs) return SCHRITTE;
    return SCHRITTE.filter((s) => !s.brauchtTab || sichtbareTabs.includes(s.brauchtTab));
  }, [sichtbareTabs]);

  const pathname = usePathname();
  const panelRef = useRef(null);
  const schliessendRef = useRef(false);
  // Auto-Start höchstens einmal je Seitenaufbau prüfen: Nach dem Schließen
  // trägt das `player`-Prop noch `adminTourSeen: false` (die Seite lädt nicht
  // neu) – ohne den Riegel ginge die Tour beim nächsten Effektlauf wieder auf.
  const autoGeprueftRef = useRef(false);

  // Auto-Start (Konzept §3): nur wenn die Admin-Tour noch nie gesehen wurde
  // UND die Spieler-Tour durch ist (Vorrang-Regel, s. Kopfkommentar).
  useEffect(() => {
    if (!player || autoGeprueftRef.current) return;
    autoGeprueftRef.current = true;
    if (player.adminTourSeen) return;
    if (!player.welcomeSeen) return;
    setIndex(0);
    setRichtung(1);
    setOpen(true);
  }, [player]);

  // Wiederaufruf über den Link im Panel.
  useEffect(() => {
    const handler = () => {
      schliessendRef.current = false;
      setIndex(0);
      setRichtung(1);
      setOpen(true);
    };
    window.addEventListener("hg:open-admin-tour", handler);
    return () => window.removeEventListener("hg:open-admin-tour", handler);
  }, []);

  // Auftritt: erst mounten, dann im nächsten Frame die Zielwerte setzen.
  useEffect(() => {
    if (!open) return;
    schliessendRef.current = false;
    const raf = requestAnimationFrame(() => setSichtbar(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Seite hinter dem Dialog nicht mitscrollen lassen – über lib/scrollSperre.js,
  // damit gestapelte Ebenen sich beim Schließen nicht gegenseitig sperren.
  useEffect(() => {
    if (!open) return;
    sperreAn();
    return sperreAus;
  }, [open]);

  // Klemmen statt vertrauen: Sollte sich die Liste je unter einem offenen
  // Dialog verkürzen, zeigt der Index nie ins Leere.
  const sichererIndex = Math.min(index, schritte.length - 1);
  const schritt = schritte[sichererIndex];
  const letzter = sichererIndex === schritte.length - 1;

  // Jeder Schritt meldet sich selbst – erst dadurch entsteht die Abbruchkurve.
  // Eigene Ereignisnamen (admin_tour_*), NICHT die tour_*-Namen der
  // Spieler-Tour: zwei Touren in einer Abbruchkurve sind zwei Gruppen in einer
  // Zahl (Konzept §6). Versand über lib/trackEvent.js → lib/analyticsClient.js
  // (webdriver-Riegel inklusive, Roadmap 39).
  useEffect(() => {
    if (!open || !sichtbar) return;
    trackEvent("admin_tour_step", pathname, schritt.key);
  }, [open, sichtbar, schritt.key, pathname]);

  // completed=true nur beim expliziten Abschluss („Zum Panel"); sonst gilt die
  // Tour als übersprungen und das Zusatzfeld trägt den Schritt. `zusatz`
  // unterscheidet den „Zeig mir das"-Ausstieg (":zeigen") vom echten Abbruch –
  // wer zur Fläche springt, ist kein Aussteiger, und beide in einer Zahl wären
  // eine Abbruchkurve, die ihr eigenes Erfolgsmoment mitzählt.
  const close = useCallback(
    async (completed = false, zusatz = "") => {
      if (schliessendRef.current) return;
      schliessendRef.current = true;
      trackEvent(
        completed ? "admin_tour_completed" : "admin_tour_skipped",
        pathname,
        completed
          ? "panel"
          : `${schritte[Math.min(index, schritte.length - 1)].key}${zusatz}`
      );
      setSichtbar(false);
      setTimeout(() => setOpen(false), 200);
      const token = getPlayerToken();
      if (token) {
        try {
          await axios.post("/api/player/mark-admin-tour-seen", { token });
        } catch {
          /* ignorieren – die Tour käme schlimmstenfalls noch einmal */
        }
      }
    },
    [pathname, index, schritte]
  );

  // Escape schließt, Tab bleibt im Dialog (Fokusfalle wie WelcomeTour).
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
        return;
      }
      if (e.key !== "Tab") return;
      const box = panelRef.current;
      if (!box) return;
      const f = box.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!f.length) return;
      const erste = f[0];
      const letzte = f[f.length - 1];
      if (e.shiftKey && document.activeElement === erste) {
        e.preventDefault();
        letzte.focus();
      } else if (!e.shiftKey && document.activeElement === letzte) {
        e.preventDefault();
        erste.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Beim Öffnen den Fokus ins Fenster holen.
  useEffect(() => {
    if (open && sichtbar) panelRef.current?.focus();
  }, [open, sichtbar]);

  function weiter() {
    setRichtung(1);
    setIndex((n) => Math.min(n + 1, schritte.length - 1));
  }
  function zurueck() {
    setRichtung(-1);
    setIndex((n) => Math.max(n - 1, 0));
  }

  // „Zeig mir das": schließt die Tour und wechselt auf den echten Reiter –
  // der Tab-Wechsel läuft über die Seite (onTab → wechsle), der
  // ?tab=-Mechanismus bleibt für Deeplinks von außen.
  function zeigen(tabKey) {
    close(false, ":zeigen");
    onTab?.(tabKey);
  }

  if (!open) return null;

  const Zitat = schritt.Zitat;

  // ⚠️ Portal an document.body, und das ist KEINE Stilfrage: Diese Komponente
  // hängt – anders als WelcomeTour, die im Root-Layout AUSSERHALB von
  // PageTransition sitzt – unter dem `animate-page-in`-Wrapper. Dessen
  // Transform macht den Vorfahren zum Bezugsrahmen für `position: fixed`;
  // gemessen lag der Dialog dadurch am DOKUMENT statt am Fenster verankert,
  // und auf 360×800 stand der Weiter-Knopf 227 px unter dem Bildschirmrand –
  // dieselbe Fehlerklasse wie das ConfirmAction-Panel vom 22.08.2026
  // („ein sichtbarer Dialog, dessen Knöpfe man nicht erreichen kann").
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-tour-titel"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tour schließen"
        onClick={() => close(false)}
        className={`absolute inset-0 bg-navy-950/90 transition-opacity duration-300 ease-out-strong motion-reduce:transition-none ${
          sichtbar ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Fenster: mobil eine Bogenfläche von unten (Daumenreichweite), ab sm
          ein zentriertes Panel – dieselbe abgenommene Form wie WelcomeTour. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg border border-navy-600 bg-navy-800 outline-none transition-[opacity,transform] duration-300 ease-out-strong motion-reduce:transition-opacity motion-reduce:!translate-y-0 motion-reduce:!scale-100 sm:max-h-[88dvh] sm:max-w-lg sm:rounded-lg ${
          sichtbar
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-[0.97] sm:opacity-0"
        }`}
      >
        <div className="h-0.5 flex-shrink-0 bg-brand-500" />

        <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-full bg-navy-600" />
        </div>

        {/* Kopf */}
        <div className="flex-shrink-0 px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <SplitFlap key={schritt.key}>
                <span
                  className="font-display block select-none text-[2.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#F68C3E]"
                  aria-hidden="true"
                >
                  {String(sichererIndex + 1).padStart(2, "0")}
                </span>
              </SplitFlap>
              <div className="min-w-0">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">
                  {schritt.marke}
                </p>
                <p className="font-mono text-[11px] tabular-nums text-mist-400">
                  Schritt {sichererIndex + 1} von {schritte.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => close(false)}
              aria-label="Tour schließen"
              className="-mr-1 -mt-1 flex-shrink-0 rounded-sm p-2 text-mist-400 transition-colors hover:text-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <PiXBold />
            </button>
          </div>

          {/* Segmentleiste – anklickbar nur rückwärts, wie in WelcomeTour. */}
          <div className="mt-4 flex items-center gap-1" aria-hidden="true">
            {schritte.map((s, i) => (
              <button
                key={s.key}
                type="button"
                tabIndex={-1}
                disabled={i > sichererIndex}
                onClick={() => {
                  setRichtung(-1);
                  setIndex(i);
                }}
                className="flex h-4 flex-1 items-center disabled:cursor-default"
              >
                <span
                  className={`w-full rounded-full transition-[height,background-color] duration-300 ease-out-strong motion-reduce:transition-none ${
                    i === sichererIndex
                      ? "h-[5px] bg-brand-500"
                      : i < sichererIndex
                        ? "h-[3px] bg-brand-700"
                        : "h-[3px] bg-navy-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Inhalt */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
          <div
            key={schritt.key}
            className="tour-step-in min-h-[15rem]"
            style={{ "--tour-dir": richtung > 0 ? "14px" : "-14px" }}
          >
            <h2
              id="admin-tour-titel"
              className="font-display text-balance text-2xl font-black uppercase leading-[1.05] tracking-tight text-paper-50 sm:text-3xl"
            >
              {schritt.titel}
            </h2>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-mist-400">
              {schritt.textOhneErgebnisse && sichtbareTabs && !sichtbareTabs.includes("ergebnisse")
                ? schritt.textOhneErgebnisse
                : schritt.text}
            </p>

            {Zitat && (
              <div className="mt-4">
                <Zitat />
              </div>
            )}

            {/* Nur zeigen, wenn der Ziel-Reiter für DIESE Person sichtbar ist:
                Ein Co-Admin ohne Spielrecht hat keinen Ergebnisse-Reiter, und
                der Korrektur-Effekt der Seite spränge still auf den ersten
                erlaubten – Klick, Tour zu, wortlos woanders (Befund Lina M1). */}
            {schritt.zeigTab &&
              onTab &&
              (!sichtbareTabs || sichtbareTabs.includes(schritt.zeigTab)) && (
              <button
                type="button"
                onClick={() => zeigen(schritt.zeigTab)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-400 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Zeig mir das <PiArrowRightBold className="text-xs" aria-hidden="true" />
              </button>
            )}

            {schritt.fusszeile &&
              (!schritt.fusszeileTab ||
                !sichtbareTabs ||
                sichtbareTabs.includes(schritt.fusszeileTab)) && (
              <p className="mt-4 border-t border-navy-600 pt-3 text-xs text-mist-500">
                {schritt.fusszeile}
              </p>
            )}
          </div>
        </div>

        {/* Fuß */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-navy-600 bg-navy-900 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">
          {letzter ? (
            <>
              {/* Bewusst KEIN Deep-Link auf einen bestimmten Reiter: Welcher
                  dran ist, sagt die Aufgaben-Leiste – ein fester Link würde
                  ihr widersprechen (Konzept Schritt 6). */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRichtung(-1);
                  setIndex(0);
                }}
                className="-ml-3"
              >
                <PiArrowCounterClockwiseBold className="text-xs" aria-hidden="true" /> Nochmal von
                vorn
              </Button>
              <Button size="md" onClick={() => close(true)}>
                Zum Panel <PiArrowRightBold className="text-xs" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              {index > 0 ? (
                <Button variant="ghost" size="sm" onClick={zurueck} className="-ml-3">
                  <PiArrowLeftBold className="text-xs" aria-hidden="true" /> Zurück
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => close(false)} className="-ml-3">
                  Überspringen
                </Button>
              )}
              <Button size="md" onClick={weiter}>
                Weiter <PiArrowRightBold className="text-xs" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
