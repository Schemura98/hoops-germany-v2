"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import axios from "axios";
import { PiXBold, PiArrowLeftBold, PiArrowRightBold } from "react-icons/pi";
import Button from "@/components/ui/Button";
import SplitFlap from "@/components/ui/SplitFlap";
import TourProofBoard from "@/components/onboarding/TourProofBoard";
import { StepWeg, StepPosition, StepStadt, StepUebergabe, StepFeed } from "@/components/onboarding/TourSteps";
import { computeSteps } from "@/components/onboarding/OnboardingChecklist";
import { getPlayerToken } from "@/lib/clientAuth";
import { positionLabel } from "@/lib/constants";
import { sperreAn, sperreAus } from "@/lib/scrollSperre";
import { trackEvent } from "@/lib/trackEvent";

// ---------------------------------------------------------------------------
// Plattform-Tour „Aufwärmen"
//
// Umbau 13.08.2026 (Vivien, Auftrag Patrick). Die Vorgänger-Fassung waren fünf
// identische Lesefolien mit Icon, Absatz und Weiter-Knopf. Drei Dinge daran
// waren das eigentliche Problem, und alle drei sind hier adressiert:
//
//   1. Sie endete im Nichts – `close(true)` schloss das Fenster und ließ den
//      Nutzer stehen. Jetzt endet sie auf demselben Fortschrittsstand, den die
//      Checkliste im Feed führt (gemeinsame Quelle `computeSteps`), mit den
//      ersten Punkten bereits abgehakt, weil sie in der Tour passiert sind.
//   2. Tour und Checkliste wussten nichts voneinander. Jetzt teilen sie die
//      Definition der Startschritte.
//   3. Sie maß nur „fertig"/„abgebrochen". Jetzt bekommt jeder Schritt ein
//      eigenes Ereignis, und der Abbruch trägt den Schritt als Zusatzfeld –
//      erst damit ist überhaupt sichtbar, WO Leute aussteigen.
//
// Leitgedanke: Jeder Schritt tut etwas Echtes, statt etwas zu beschreiben.
// Position und Stadt werden wirklich gespeichert (keine Attrappe), die Frage
// nach der Situation verkürzt den Rest, und der Beweis steht vorn – bevor um
// irgendetwas gebeten wird.
//
// Bewusst NICHT gebaut: Abzeichen, Punktestände, Serien-Mechanik, Konfetti.
// Das wäre „spaßig" auf Kosten der Glaubwürdigkeit – und die Belegbarkeit der
// Zahlen ist das einzige Argument, das diese Plattform wirklich hat.
// ---------------------------------------------------------------------------

const SCHRITTE = [
  {
    key: "beweis",
    marke: "Warum hier",
    // Korrektur Nele, 13.08.2026: Der erste Entwurf hieß „Zahlen, die niemand
    // bestreitet". Das ist nicht bloß zugespitzt, sondern falsch – die
    // Plattform kennt sehr wohl einen `resultStatus: "mismatch"`, Widerspruch
    // passiert und wird eskaliert. Die Aussage ist „beide bestätigen
    // unabhängig", nicht „es gibt keinen Streit". Eine Behauptung, die das
    // eigene Produkt widerlegt, ist genau dort tödlich, wo Belegbarkeit das
    // einzige Argument ist.
    // Zweite Korrektur Nele, 14.08.2026 – derselbe Fehlertyp eine Ebene tiefer,
    // und diesmal der teuerste: Titel und Schlusssatz bezogen die Doppel-
    // bestätigung auf die ZAHLEN („Zahlen, die beide Seiten bestätigen" /
    // „Deshalb muss ein Verein deinen Statistiken nicht glauben"). Doppelt
    // bestätigt ist aber das ERGEBNIS – `teamAResult`/`teamBResult` tragen
    // Punktzahlen, der Box-Score kommt von EINEM Team-Admin. `lib/statsNotify.js`
    // formuliert das korrekt („beide Teams haben das Ergebnis unabhängig
    // gemeldet"), die Tour tat es nicht. Ein Muster-Fall aus
    // docs/MUSTER-ZAHLEN-DIE-LUEGEN: im Sinne des Codes fast richtig, im Sinne
    // des Lesers ein Prüfversprechen für seine 24 Punkte, das es nicht gibt.
    // Der neue Titel ist wörtlich die Choreografie, die TourProofBoard darunter
    // vorführt; der Schlusssatz behauptet nur noch, was `beidseitigBelegt` prüft.
    titel: "Beide melden. Dann zählt es.",
    text: "Beide Teams melden das Ergebnis unabhängig voneinander – erst wenn beide dasselbe sagen, zählt es. Deshalb steht hinter deinen Zahlen ein Spiel, das beide Seiten so gemeldet haben.",
  },
  {
    // Neu am 18.08.2026 (Auftrag Patrick): Der Newsfeed ist die Seite, auf der
    // jeder eingeloggte Nutzer landet – die Tour erwähnte ihn bis dahin nur im
    // Schlusssatz und erklärte ihn nie.
    //
    // Er steht bewusst HIER und nicht am Ende: Der Schritt davor erklärt das
    // Prinzip („beide melden unabhängig"), dieser zeigt, wo man es wiedersieht.
    // Am Ende wäre es eine Zusatzinformation; hier ist es die Antwort auf die
    // Frage, die der vorige Schritt gerade aufgemacht hat.
    //
    // ⚠️ Der Titel sagt bewusst NICHT „dein persönlicher Feed" o. Ä. Der Feed
    // zeigt Ereignisse aus dem eigenen Umfeld, aber er ist keine Zeitung über
    // einen selbst – und die eigenen Zahlen erscheinen nur, wenn man im
    // Box-Score steht. Ein Versprechen auf ständige Eigenpräsenz wäre genau
    // die Sorte Zusage, die das Produkt nicht hält.
    key: "feed",
    marke: "Dein Feed",
    titel: "Und so siehst du es wieder",
    text: "Nach jedem Spieltag steht das Ergebnis in deinem Feed – mit dem Vermerk, ob beide Vereine dasselbe gemeldet haben. Standest du im Box-Score, stehen deine Zahlen gleich daneben.",
    // Ohne Konto gibt es keinen eigenen Feed und keinen Box-Score-Eintrag.
    // Die Fassung nimmt genau die zwei Zusagen zurück und lässt den Rest
    // stehen – der Feed selbst ist ja auch ohne Konto sichtbar.
    textOhneKonto:
      "Nach jedem Spieltag steht das Ergebnis im Feed – mit dem Vermerk, ob beide Vereine dasselbe gemeldet haben. Sobald du selbst spielst, stehen deine Zahlen gleich daneben.",
  },
  {
    key: "weg",
    marke: "Kurz nachgefragt",
    titel: "Was passt gerade auf dich?",
    text: "Eine Frage – danach wird der Rest kürzer.",
  },
  {
    key: "position",
    marke: "Dein Profil",
    titel: "Wo stehst du auf dem Feld?",
    titelAdmin: "Was machst du im Team?",
    // „Ein Tipp genügt" liest sich auf Deutsch zuerst als Ratschlag, nicht als
    // Antippen – ein Stolperer ausgerechnet in dem Satz, der Einfachheit
    // verspricht (Nele, 14.08.2026).
    text: "Einmal antippen genügt – es steht sofort in deinem Profil, kein Formular.",
    // Ohne Konto gibt es kein Profil, in dem etwas „sofort steht" (Befund B2
    // von Tobias). Eine Einheitsfassung müsste genau das Versprechen wegnehmen,
    // das den Schritt für den Hauptfall trägt – deshalb zwei Fassungen (Nele).
    // Der zweite Halbsatz greift wörtlich die Quittung darunter auf, damit
    // Einleitung und Quittung dieselbe Zusage machen statt sich zu korrigieren.
    textOhneKonto:
      "Einmal antippen genügt, kein Formular – so schnell ist dein Profil ausgefüllt, sobald du ein Konto hast.",
  },
  {
    key: "stadt",
    marke: "Dein Profil",
    // „Wo spielst du?" stand direkt hinter „Wo stehst du auf dem Feld?" und
    // konnte als zweite Positionsfrage gelesen werden (Nele, 14.08.2026).
    titel: "In welcher Stadt spielst du?",
    // Nele, 13.08.2026: Vorher stand hier der Funktionsname „Umkreissuche".
    // Der Nutzen ist „Leute aus deiner Nähe finden dich", nicht der Name des
    // Filters, der das erledigt.
    // Nachtrag 14.08.2026: „damit dich Teams und Tryouts finden" drehte die
    // Richtung um und versprach eine Nachfrage-Seite, die es heute nicht gibt –
    // dieselbe Übertreibung, die eine Folie weiter schon zu „im Aufbau"
    // korrigiert wurde. Ein Tryout findet ohnehin niemanden; man findet es.
    text: "Eine Stadt genügt, das Bundesland kommt mit – damit du Teams und Tryouts in deiner Nähe findest.",
  },
  {
    key: "start",
    marke: "Los geht's",
    // Titel und Text sind hier nur der Normalfall (1–3 von 4). Die beiden
    // Ränder liefert `schlussfolie()` – s. dort, warum.
    titel: "Du hast schon angefangen",
    text: "Der Rest wartet als Checkliste in deinem Feed. Du kannst jederzeit dort weitermachen.",
  },
];

// Schlussfolie nach Stand. Bis zum 14.08.2026 stand „Du hast schon angefangen"
// auch über „0 von 4 · 0 %" – ein Muster-Fall in Reinform (Befund Lina,
// Fassungen Nele): Die Überschrift behauptet einen Anfang, den die Zahl
// darunter im selben Blickfeld bestreitet. Der Text trug denselben Defekt,
// „DER REST wartet" setzt voraus, dass etwas davor war.
// Der 4-von-4-Fall ist selten (setzt Foto, Profil, Team und einen Follow VOR
// der Tour voraus), kostet aber nichts und verhindert die Umkehrung des alten
// Fehlers – „du hast angefangen" über 100 %.
function schlussfolie({ angemeldet, erledigt, gesamt }) {
  if (!angemeldet) {
    return {
      titel: "Jetzt fehlt nur dein Konto",
      text: "Kostenlos, in einer Minute angelegt – und du bist früh genug dabei, um dein Team als Erstes einzutragen.",
    };
  }
  if (erledigt === 0) {
    return {
      titel: "Fang mit einem an",
      text: "Vier Startschritte warten als Checkliste in deinem Feed. Einer reicht für heute.",
    };
  }
  if (erledigt >= gesamt) {
    return {
      titel: "Du bist startklar",
      text: "Alle Startschritte stehen. Deinen Feed findest du ab jetzt unter Newsfeed.",
    };
  }
  return null; // Normalfall: die Werte aus SCHRITTE gelten
}

// Der eine konkrete nächste Schritt je Weg. Gründung und Beitritt sind eigene
// Seiten mit eigenem Freigabeprozess – die gehören nicht in ein Dialogfenster,
// deshalb sind das Links und keine Formulare.
const ZIELE = {
  verein: { label: "Team suchen", href: "/teams" },
  admin: { label: "Team gründen", href: "/team/create" },
  suche: { label: "Tryouts ansehen", href: "/tryouts" },
};

// Ausgeloggter Zweitausgang. ⚠️ `ZIELE.admin` zeigt auf /team/create, und das
// verlangt einen Login – ohne diese Ausnahme endete der „Erst mal umsehen"-Weg
// wieder in der Anmeldemaske, also genau dort, wovor dieser Umbau schützt
// (Hinweis Nele, 14.08.2026).
function zielOhneKonto(weg) {
  const ziel = ZIELE[weg] || ZIELE.verein;
  return weg === "admin" ? ZIELE.verein : ziel;
}

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [sichtbar, setSichtbar] = useState(false); // treibt die Ein-/Ausblende-Kurve
  const [index, setIndex] = useState(0);
  const [richtung, setRichtung] = useState(1);
  const [player, setPlayer] = useState(null);
  // Ob die Tour gerade FÜR EIN KONTO läuft. Beim Auto-Start ist das immer wahr;
  // über den Footer-Link kann sie auch ohne Konto geöffnet werden, und dann
  // muss sie sich anders verhalten (nichts speichern, keine Fortschrittszahl,
  // Ausgang zur Registrierung statt in die Anmeldemaske). Als State und nicht
  // als direkter `getPlayerToken()`-Aufruf im Rendern, weil ein Login während
  // der offenen Tour sonst kein Neuzeichnen auslöst.
  const [angemeldet, setAngemeldet] = useState(true);

  // Antworten der Tour. Werden aus dem Profil vorbelegt, damit ein bereits
  // gepflegtes Feld nicht als leer erscheint (und nicht überschrieben wird).
  const [weg, setWeg] = useState("");
  const [position, setPosition] = useState("");
  const [ort, setOrt] = useState({ stadt: "", land: "" });
  const [verfuegbar, setVerfuegbar] = useState(false);

  const pathname = usePathname();
  const panelRef = useRef(null);
  const schliessendRef = useRef(false);

  const profilUebernehmen = useCallback((p) => {
    setPlayer(p);
    // Alt-Kürzel auf den ausgeschriebenen Namen bringen (Befund Tobias,
    // 14.08.2026). Bestandskonten tragen teils noch `"SF"` statt
    // `"Small Forward"`; die Chips der Tour heißen ausgeschrieben, also war bei
    // einem gepflegten Feld trotzdem nichts vorausgewählt – es sah aus, als
    // hätte der Nutzer nie eine Position angegeben. `positionLabel` mappt die
    // Kürzel und lässt alles andere (auch Rollen wie „Coach") unverändert
    // durch.
    setPosition(positionLabel(p?.position) || "");
    setOrt({ stadt: p?.hometown || "", land: p?.bundesland || "" });
    setVerfuegbar(p?.transferStatus === "verfuegbar");
  }, []);

  // Auto-Start einmalig pro Login/Registrierung. Läuft bei jedem Routenwechsel neu,
  // damit ein Login/Registrierung NACH dem ersten Mount erkannt wird (Tour liegt im
  // Root-Layout und remountet bei Client-Navigation nicht). Wächter ist an den TOKEN
  // gebunden: pro Token wird nur 1× geprüft (kein wiederholtes getmyinfo bei Navigation),
  // aber ein NEUER Token (neuer Login / neue Registrierung, auch mit gleicher Mail nach
  // Account-Löschung) löst eine erneute Prüfung aus.
  useEffect(() => {
    const token = getPlayerToken();
    if (!token) return;
    if (sessionStorage.getItem("hg_welcome_token") === token) return;
    sessionStorage.setItem("hg_welcome_token", token);
    (async () => {
      try {
        const { data } = await axios.post("/api/player/getmyinfo", { token });
        if (data?.player && !data.player.welcomeSeen) {
          profilUebernehmen(data.player);
          setAngemeldet(true);
          setIndex(0);
          setRichtung(1);
          setOpen(true);
        }
      } catch {
        /* ignorieren */
      }
    })();
  }, [pathname, profilUebernehmen]);

  // Erneut öffnen (z.B. aus dem Footer) via Custom-Event. Hier fehlt das
  // Profil – es wird nachgeladen, sonst stünde die letzte Seite ohne Stand da.
  useEffect(() => {
    const handler = () => {
      setIndex(0);
      setRichtung(1);
      setOpen(true);
      const token = getPlayerToken();
      setAngemeldet(!!token);
      if (!token) return;
      axios
        .post("/api/player/getmyinfo", { token })
        .then(({ data }) => data?.player && profilUebernehmen(data.player))
        .catch(() => {});
    };
    window.addEventListener("hg:open-tour", handler);
    return () => window.removeEventListener("hg:open-tour", handler);
  }, [profilUebernehmen]);

  // Auftritt: erst mounten, dann im nächsten Frame die Zielwerte setzen, damit
  // der Übergang überhaupt läuft. Beim Schließen umgekehrt – und schneller:
  // Wo der Nutzer entscheidet, darf es ruhig sein, wo das System antwortet,
  // muss es zügig sein.
  useEffect(() => {
    if (!open) return;
    schliessendRef.current = false;
    const raf = requestAnimationFrame(() => setSichtbar(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Seite hinter dem Dialog nicht mitscrollen lassen.
  useEffect(() => {
    if (!open) return;
    // ⚠️ Über `lib/scrollSperre.js` statt eines selbst gemerkten Wertes
    // (Befund A2 von Kai, 14.08.2026): Diese Ebene und das Such-Overlay können
    // gleichzeitig offen sein, und beim Schließen in der falschen Reihenfolge
    // blieb die Seite dauerhaft gesperrt. Der Zähler dort gibt erst frei, wenn
    // keine Ebene mehr sperrt.
    sperreAn();
    return sperreAus;
  }, [open]);

  const schritt = SCHRITTE[index];
  const letzter = index === SCHRITTE.length - 1;

  // Jeder Schritt meldet sich selbst. Erst dadurch entsteht die Abbruchkurve:
  // Ohne dieses Ereignis weiß man nur, DASS jemand ausgestiegen ist.
  useEffect(() => {
    if (!open || !sichtbar) return;
    trackEvent("tour_step", pathname, schritt.key);
  }, [open, sichtbar, schritt.key, pathname]);

  // completed=true nur beim expliziten Abschluss auf der letzten Seite,
  // sonst gilt die Tour als übersprungen (X-Knopf, „Überspringen", Escape).
  // Das Zusatzfeld trägt beim Abschluss den gewählten Weg und beim Abbruch
  // den Schritt, auf dem abgebrochen wurde.
  const close = useCallback(
    async (completed = false) => {
      if (schliessendRef.current) return;
      schliessendRef.current = true;
      // Ausgeloggte Durchläufe werden als solche gekennzeichnet (Hinweis
      // Nele/Ben, 14.08.2026): Sonst mischt sich der Erstbesucher, der die Tour
      // über den Footer geöffnet hat, in dieselbe Quote wie ein frisch
      // registrierter Nutzer – zwei Gruppen mit völlig verschiedener Bedeutung
      // in einer Zahl.
      // Der Abbruch trägt die Kennzeichnung seit dem Nachtrag ebenfalls (Befund
      // A8 von Kai): Vorher war nur die Abschlussquote getrennt, während die
      // Abbruchkurve – die interessantere der beiden – weiter beide Gruppen
      // vermischte. Eine halb gezogene Trennlinie ist irreführender als keine.
      trackEvent(
        completed ? "tour_completed" : "tour_skipped",
        pathname,
        completed
          ? angemeldet
            ? weg || "ohne_weg"
            : "ohne_konto"
          : `${SCHRITTE[index].key}${angemeldet ? "" : ":ohne_konto"}`
      );
      setSichtbar(false);
      setTimeout(() => setOpen(false), 200);
      // Die Seite dahinter hat den Spieler geladen, BEVOR die Tour Position und
      // Ort gespeichert hat. Ohne dieses Signal stünde die Checkliste im Feed
      // danach auf einem Stand, den die Tour gerade widerlegt hat.
      window.dispatchEvent(new Event("hg:player-updated"));
      const token = getPlayerToken();
      if (token) {
        try {
          await axios.post("/api/player/mark-welcome-seen", { token });
        } catch {
          /* ignorieren */
        }
      }
    },
    [pathname, index, weg, angemeldet]
  );

  // Escape schließt, Tab bleibt im Dialog. Beides fehlte der Vorgängerfassung –
  // wer mit der Tastatur ankam, konnte hinter das Fenster tabben und dort
  // unsichtbar navigieren.
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

  // Beim Öffnen den Fokus ins Fenster holen (Screenreader lesen dann Titel und
  // Inhalt, statt weiter auf der Seite dahinter zu stehen).
  useEffect(() => {
    if (open && sichtbar) panelRef.current?.focus();
  }, [open, sichtbar]);

  function weiter() {
    setRichtung(1);
    setIndex((n) => Math.min(n + 1, SCHRITTE.length - 1));
  }
  function zurueck() {
    setRichtung(-1);
    setIndex((n) => Math.max(n - 1, 0));
  }

  // Ein gewählter Weg führt direkt weiter – die Antwort IST die Bestätigung,
  // ein zusätzliches „Weiter" wäre ein Klick ohne Aussage.
  function wegWaehlen(k) {
    setWeg(k);
    trackEvent("tour_branch", pathname, k);
    setTimeout(() => weiter(), 160);
  }

  function aktionGemeldet(k) {
    trackEvent("tour_action", pathname, k);
  }

  // Der lokale Stand fließt in das Spieler-Objekt zurück, damit die letzte
  // Seite die gerade eben gesetzten Werte schon als erledigt zeigt.
  const spielerStand = useMemo(
    () => ({
      ...(player || {}),
      position: position || player?.position,
      bundesland: ort.land || player?.bundesland,
      hometown: ort.stadt || player?.hometown,
    }),
    [player, position, ort]
  );

  const ziel = angemeldet ? ZIELE[weg] || ZIELE.verein : zielOhneKonto(weg);

  // Stand für die Schlussfolie – dieselbe Quelle wie die Liste darin, damit
  // Überschrift und Zahl nicht auseinanderlaufen können. Das war der Fehler:
  // Die Überschrift war fest, die Zahl gerechnet.
  const startSchritte = computeSteps(spielerStand);
  const abweichung =
    schritt.key === "start"
      ? schlussfolie({
          angemeldet,
          erledigt: startSchritte.filter((s) => s.done).length,
          gesamt: startSchritte.length,
        })
      : null;

  const titel =
    abweichung?.titel ??
    (weg === "admin" && schritt.titelAdmin ? schritt.titelAdmin : schritt.titel);
  // `textOhneKonto` schlägt den Standardtext, wenn niemand angemeldet ist –
  // heute nur bei Schritt „position" gesetzt (s. dort).
  const text =
    abweichung?.text ?? (!angemeldet && schritt.textOhneKonto ? schritt.textOhneKonto : schritt.text);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-titel"
    >
      {/* Verdunklung – eigene Ebene, damit sie unabhängig vom Fenster blendet */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tour schließen"
        onClick={() => close(false)}
        className={`absolute inset-0 bg-navy-950/90 transition-opacity duration-300 ease-out-strong motion-reduce:transition-none ${
          sichtbar ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Fenster. Mobil eine Bogenfläche von unten (Daumenreichweite, volle
          Breite), ab sm ein zentriertes Panel. Die Bewegung unterscheidet sich
          entsprechend: unten hereinfahren vs. zentriert aufziehen. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-lg border border-navy-600 bg-navy-800 outline-none transition-[opacity,transform] duration-300 ease-out-strong motion-reduce:transition-opacity motion-reduce:!translate-y-0 motion-reduce:!scale-100 sm:max-h-[88dvh] sm:max-w-lg sm:rounded-lg ${
          sichtbar
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-[0.97] sm:opacity-0"
        }`}
      >
        {/* Signaturleiste der Richtung „Anzeigetafel": 2px Marke an der
            Oberkante – dieselbe Geste wie an Navbar und Seitenkopf. */}
        <div className="h-0.5 flex-shrink-0 bg-brand-500" />

        {/* Griff – sagt mobil ohne Worte, dass das eine Fläche von unten ist */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-full bg-navy-600" />
        </div>

        {/* Kopf */}
        <div className="flex-shrink-0 px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Kapitelziffer als Konturzahl – dieselbe Sprache wie die
                  Kapitelmarken der Startseite, hier als Schrittzähler. Die
                  Klappe schlägt bei jedem Wechsel um: eine Anzeigetafel
                  wechselt ihre Ziffern nicht sanft. */}
              <SplitFlap key={schritt.key}>
                <span
                  className="font-display block select-none text-[2.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#F68C3E]"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </SplitFlap>
              <div className="min-w-0">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-400">
                  {schritt.marke}
                </p>
                <p className="font-mono text-[11px] tabular-nums text-mist-400">
                  Schritt {index + 1} von {SCHRITTE.length}
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

          {/* Segmentleiste statt Punkten – Anzeigetafel-Sprache, und sie zeigt
              gleichzeitig, wie viel noch kommt. Anklickbar nur rückwärts:
              vorspringen würde die Schritte überspringen, die etwas speichern. */}
          <div className="mt-4 flex items-center gap-1" aria-hidden="true">
            {SCHRITTE.map((s, i) => (
              <button
                key={s.key}
                type="button"
                tabIndex={-1}
                disabled={i > index}
                onClick={() => {
                  setRichtung(-1);
                  setIndex(i);
                }}
                className="flex h-4 flex-1 items-center disabled:cursor-default"
              >
                <span
                  className={`w-full rounded-full transition-[height,background-color] duration-300 ease-out-strong motion-reduce:transition-none ${
                    i === index
                      ? "h-[5px] bg-brand-500"
                      : i < index
                        ? "h-[3px] bg-brand-700"
                        : "h-[3px] bg-navy-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Inhalt. Eigene Scrollfläche, damit der Fuß mobil immer erreichbar
            bleibt; Mindesthöhe, damit das Fenster zwischen den Schritten nicht
            springt. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
          {/* Mindesthöhe: 15rem als Boden, damit das Fenster zwischen den
              Schritten nicht zappelt. Der Stadt-Schritt bekommt mehr, weil der
              Vorschlagskasten der Typeahead-Eingabe sonst am Panelrand
              abgeschnitten wird – das Panel schrumpft ohne diese Zeile auf die
              Höhe des Eingabefelds (auf 390px UND auf dem Desktop gemessen).
              Bewusst nur dort und nicht pauschal: 20rem überall hinterlässt auf
              den kurzen Schritten eine tote Fläche unter dem Inhalt. */}
          <div
            key={schritt.key}
            className={`tour-step-in ${schritt.key === "stadt" ? "min-h-[20rem]" : "min-h-[15rem]"}`}
            style={{ "--tour-dir": richtung > 0 ? "14px" : "-14px" }}
          >
            <h2
              id="tour-titel"
              className="font-display text-balance text-2xl font-black uppercase leading-[1.05] tracking-tight text-paper-50 sm:text-3xl"
            >
              {titel}
            </h2>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-mist-400">
              {text}
            </p>

            <div className="mt-4">
              {schritt.key === "beweis" && <TourProofBoard />}
              {schritt.key === "feed" && <StepFeed />}
              {schritt.key === "weg" && <StepWeg weg={weg} onWeg={wegWaehlen} />}
              {schritt.key === "position" && (
                <StepPosition
                  weg={weg}
                  wert={position}
                  onWert={setPosition}
                  onGespeichert={aktionGemeldet}
                  // Für das Avatar-Zitat in der Quittung: Es soll genau die
                  // Form zeigen, die gleich oben rechts in der Leiste steht –
                  // also mit demselben Bild bzw. denselben Initialen.
                  player={spielerStand}
                />
              )}
              {schritt.key === "stadt" && (
                <StepStadt
                  stadt={ort.stadt}
                  land={ort.land}
                  onOrt={setOrt}
                  onGespeichert={aktionGemeldet}
                />
              )}
              {schritt.key === "start" && (
                <StepUebergabe
                  player={spielerStand}
                  weg={weg}
                  verfuegbar={verfuegbar}
                  onVerfuegbar={setVerfuegbar}
                  onGespeichert={aktionGemeldet}
                  angemeldet={angemeldet}
                />
              )}
            </div>
          </div>
        </div>

        {/* Fuß */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-navy-600 bg-navy-900 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">
          {index > 0 ? (
            <Button variant="ghost" size="sm" onClick={zurueck} className="-ml-3">
              <PiArrowLeftBold className="text-xs" aria-hidden="true" /> Zurück
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => close(false)} className="-ml-3">
              Überspringen
            </Button>
          )}

          {letzter ? (
            <div className="flex items-center gap-2">
              {/* Ohne Konto führte der Zweitausgang „Zum Feed" direkt in die
                  Anmeldemaske – die Tour ist über den Footer ausgeloggt
                  erreichbar und ist dort die EINZIGE Fläche, die vor der
                  Registrierung erklärt (Befund Lina, 14.08.2026). Sie mit einem
                  Login-Zwang zu beenden, verschenkt genau den Menschen, für den
                  sie gebaut ist. Beschriftung „Konto erstellen" ist wörtlich die
                  auf /signup – Knopf und Ziel sagen dasselbe Wort. */}
              <Button
                variant="ghost"
                size="sm"
                href={angemeldet ? "/player/newsfeed" : ziel.href}
                onClick={() => close(true)}
              >
                {angemeldet ? "Zum Feed" : "Erst mal umsehen"}
              </Button>
              <Button
                size="md"
                href={angemeldet ? ziel.href : "/signup"}
                onClick={() => close(true)}
              >
                {angemeldet ? ziel.label : "Konto erstellen"}{" "}
                <PiArrowRightBold className="text-xs" aria-hidden="true" />
              </Button>
            </div>
          ) : schritt.key === "weg" ? (
            // Auf der Frage-Seite sind die drei Antworten die Handlung. Ein
            // orangefarbenes „Weiter" daneben wäre ein zweites Primärziel im
            // selben Blickfeld und würde genau an der Antwort vorbeiführen –
            // deshalb hier bewusst leise. Weggehen bleibt trotzdem möglich:
            // niemand wird zu einer Angabe gezwungen.
            <Button variant="ghost" size="sm" onClick={weiter} className="-mr-3">
              Ohne Angabe weiter <PiArrowRightBold className="text-xs" aria-hidden="true" />
            </Button>
          ) : (
            <Button size="md" onClick={weiter}>
              Weiter <PiArrowRightBold className="text-xs" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
