"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  PiBasketballBold,
  PiMagnifyingGlassBold,
  PiClipboardTextBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiCircleBold,
  PiArrowRightBold,
} from "react-icons/pi";
import CityInput from "@/components/CityInput";
import FormAlert from "@/components/ui/FormAlert";
import { computeSteps } from "@/components/onboarding/OnboardingChecklist";
import { getPlayerToken } from "@/lib/clientAuth";
import { inputClass, staffel } from "@/lib/ui";
import { POSITIONS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Die drei Wege der Tour. Sie bilden Z1/Z2/Z3 aus docs/ZIELGRUPPEN.md ab –
// nicht als Etikett, sondern als tatsächlich unterschiedlicher letzter Schritt.
// Z4 (Vereinsverantwortliche) und Z5 (Sponsoren) tauchen bewusst nicht auf:
// beide sind laut Zielgruppen-Papier nicht zu bewerben bzw. kein Produktweg.
// ---------------------------------------------------------------------------
export const WEGE = {
  verein: {
    key: "verein",
    label: "Ich spiele in einem Verein",
    // Die Hinweise von „verein" und „admin" waren fast wortgleich („Liga,
    // Kader, Ergebnisse" / „Kader, Spielplan, Ergebnisse"). Wer zwischen „ich
    // spiele" und „ich organisiere" schwankt, bekam damit keine Entscheidungs-
    // hilfe, sondern zweimal dieselbe Liste (Nele, 14.08.2026). Jetzt trennt
    // sie, was der Nutzer TUT: mitspielen gegen eintragen.
    hint: "Deine Liga, dein Kader, deine Zahlen",
    Icon: PiBasketballBold,
  },
  suche: {
    key: "suche",
    label: "Ich suche ein Team",
    hint: "Tryouts und Vereine in deiner Nähe",
    Icon: PiMagnifyingGlassBold,
  },
  admin: {
    key: "admin",
    label: "Ich organisiere ein Team",
    hint: "Du trägst Kader und Ergebnisse ein",
    Icon: PiClipboardTextBold,
  },
};

// Rollen zur Auswahl. Wer ein Team organisiert, steht nicht zwingend auf dem
// Feld – deshalb bekommt dieser Weg zwei zusätzliche Einträge statt einer
// Position, die dann falsch im Profil steht.
export function rollenFuerWeg(weg) {
  return weg === "admin" ? [...POSITIONS, "Coach", "Manager"] : POSITIONS;
}

// Einheitlicher Speicher-Aufruf. Die Tour bricht bei einem Fehler NIE ab – ein
// Netzwerkfehler darf niemanden aus dem Einstieg werfen, der Schritt bleibt
// dann einfach offen und steht später in der Checkliste im Feed.
//
// Drei Ausgänge statt zwei (Befund Lina, 14.08.2026). Vorher gab der fehlende
// Token dasselbe `false` zurück wie ein echter Fehler – und weil die Tour über
// den Footer AUCH OHNE KONTO erreichbar ist, las ein Erstbesucher dort
// „Konnte gerade nicht gespeichert werden": eine Fehlermeldung über einen
// Versuch, den es nie gab. Genau die Fläche, die vor der Registrierung
// erklären soll, meldete sich als defekt.
export const SPEICHERN_OK = "ok";
export const SPEICHERN_FEHLER = "fehler";
export const SPEICHERN_ANONYM = "anonym"; // kein Konto – kein Fehler, nur (noch) kein Ziel

async function speichern(pfad, daten) {
  const token = getPlayerToken();
  if (!token) return SPEICHERN_ANONYM;
  try {
    await axios.post(pfad, { token, ...daten });
    return SPEICHERN_OK;
  } catch {
    return SPEICHERN_FEHLER;
  }
}

// Kleine Bestätigungszeile nach einer echten Speicherung. Bewusst zurückhaltend
// (kein Konfetti, kein Abzeichen): Sie sagt nur, dass etwas passiert ist.
function Gespeichert({ children }) {
  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs text-signal-ok" aria-live="polite">
      <PiCheckBold className="flex-shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

// Gegenstück für den ausgeloggten Fall: gleiche Zeile, aber ohne grünen Haken
// und in gedämpfter Farbe. Es ist keine Bestätigung (nichts wurde gespeichert)
// und kein Fehler (nichts ist schiefgegangen) – deshalb weder `Gespeichert`
// noch `FormAlert`.
function Hinweis({ children }) {
  return (
    <p className="mt-3 text-xs text-mist-400" aria-live="polite">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Schritt „Die Frage" – eine Frage, danach ist die Tour kürzer.
// ---------------------------------------------------------------------------
export function StepWeg({ weg, onWeg }) {
  return (
    <ul className="space-y-2">
      {Object.values(WEGE).map((w, i) => {
        const aktiv = weg === w.key;
        return (
          <li
            key={w.key}
            className="animate-page-in motion-reduce:animate-none"
            style={{ animationDelay: `${staffel(i, 60)}ms` }}
          >
            <button
              type="button"
              onClick={() => onWeg(w.key)}
              aria-pressed={aktiv}
              className={`group flex w-full items-center gap-3 rounded-md border px-3.5 py-3 text-left transition-[background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 ${
                aktiv
                  ? "border-brand-500 bg-navy-700"
                  : "border-navy-600 bg-navy-950 hover:border-brand-500 hover:bg-navy-700"
              }`}
            >
              <span
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm text-lg transition-colors duration-150 ${
                  aktiv ? "bg-brand-500 text-navy-950" : "bg-navy-800 text-mist-300 group-hover:text-brand-400"
                }`}
              >
                <w.Icon aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-paper-50">{w.label}</span>
                <span className="block text-xs text-mist-400">{w.hint}</span>
              </span>
              <PiArrowRightBold
                className={`flex-shrink-0 text-xs transition-colors duration-150 ${
                  aktiv ? "text-brand-500" : "text-navy-500 group-hover:text-brand-400"
                }`}
                aria-hidden="true"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Schritt „Position" – ein Tipp, und es steht im Profil.
// ---------------------------------------------------------------------------
// Zitat des Profil-Punkts aus der Spieler-Leiste. Bewusst KEIN Coach-Mark und
// kein Spotlight über der echten Leiste (Lina, 14.08.2026): eine neue
// Overlay-Mechanik für einen Satz wäre teuer, und die Plattform hat gerade
// erst eine schwebende Ebene abgeschafft. Stattdessen steht die Form hier im
// Text – dieselben Maße, dieselbe Ringfarbe, dieselbe Initialen-Kachel wie in
// components/layout/PlayerNav.js:167-178. Wer sie hier sieht, erkennt sie
// oben rechts wieder. `aria-hidden`, weil der Satz daneben die Aussage trägt;
// vorgelesen wäre die Kachel nur Rauschen.
function AvatarZitat({ player }) {
  const initialen =
    `${player?.firstName?.[0] || ""}${player?.lastName?.[0] || ""}`.toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className="inline-flex flex-shrink-0 items-center justify-center align-middle"
    >
      {player?.profileImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={player.profileImage}
          alt=""
          className="h-6 w-6 rounded-full object-cover ring-2 ring-paper-50/15"
        />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-semibold text-brand-300">
          {initialen}
        </span>
      )}
    </span>
  );
}

export function StepPosition({ weg, wert, onWert, onGespeichert, player }) {
  const [stand, setStand] = useState(null); // null | ok | fehler | anonym
  const [laeuft, setLaeuft] = useState(null);
  // Steht die Spieler-Leiste mit dem Profil-Avatar gerade auf dem Bildschirm?
  // Nur dann darf die Quittung „oben rechts" sagen und die Form zeigen – auf
  // öffentlichen Seiten gibt es dort einen Textlink oder (mobil) nur den
  // Hamburger (Befund Tobias, 14.08.2026). Zur Laufzeit geprüft statt über eine
  // Pfadliste, die still veraltet.
  const [zeigtAvatar, setZeigtAvatar] = useState(false);
  useEffect(() => {
    setZeigtAvatar(!!document.querySelector("[data-profil-avatar]"));
  }, []);

  async function waehlen(rolle) {
    const neu = wert === rolle ? "" : rolle; // nochmal tippen = abwählen
    onWert(neu);
    setLaeuft(rolle);
    const ergebnis = await speichern("/api/player/update-profile", { position: neu });
    setLaeuft(null);
    setStand(ergebnis);
    if (ergebnis === SPEICHERN_OK && neu) onGespeichert?.("position");
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {rollenFuerWeg(weg).map((rolle) => {
          const aktiv = wert === rolle;
          return (
            <button
              key={rolle}
              type="button"
              onClick={() => waehlen(rolle)}
              aria-pressed={aktiv}
              disabled={laeuft === rolle}
              className={`rounded-sm border px-3 py-2 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800 ${
                aktiv
                  ? "border-brand-500 bg-brand-500 text-navy-950"
                  : "border-navy-600 bg-navy-950 text-mist-300 hover:border-brand-300 hover:text-brand-400"
              }`}
            >
              {rolle}
            </button>
          );
        })}
      </div>

      {/* Patricks Auftrag vom 14.08.2026: „Mein Profil" steht nicht mehr in der
          waagerechten Leiste, nur noch der Avatar führt hin – das soll im
          Onboarding DEMONSTRIERT werden, nicht bloß behauptet. Diese Quittung
          ist der einzige Moment der Tour, in dem das Wort „Profil" fällt,
          während der Nutzer gerade etwas hineingeschrieben hat (Lina).
          Nele hat den Wortlaut geschärft: Sie nennt bewusst nur den ORT, nicht
          die Form – „über dein Bild oben rechts" wäre für den typischen Leser
          falsch, denn der ist zwei Minuten alt, hat noch kein Foto und findet
          oben rechts einen Initialenkreis. Die Form zeigt das Zitat daneben. */}
      {/* `stand === null` heisst „noch nichts angetippt" – der Wert kommt dann
          aus dem Profil und ist sehr wohl gespeichert. Ohne diesen Zweig
          verliert ein Spieler mit gepflegter Position seine Bestätigungszeile
          (Befund A6 von Kai); die alte Bedingung `!fehler` war initial `true`
          und deckte das ab. Ausgeloggt greift er nicht, weil dort kein Profil
          vorbelegt und `wert` leer ist. */}
      {wert && (stand === SPEICHERN_OK || stand === null) && (
        <Gespeichert>
          {zeigtAvatar ? (
            // `whitespace-nowrap` um das letzte Wort UND das Zitat: Auf 390 px
            // rutschte der Avatar sonst allein in eine dritte Zeile und las
            // sich als loses Abzeichen statt als Zitat der Form (Befund Tobias).
            <>
              Steht in deinem Profil – da kommst du jederzeit oben{" "}
              <span className="whitespace-nowrap">
                rechts hin. <AvatarZitat player={player} />
              </span>
            </>
          ) : (
            // Ohne sichtbare Spieler-Leiste bliebe „oben rechts" eine Aussage
            // über etwas, das dort nicht steht – genau der Fehlertyp, gegen den
            // dieser Umbau angetreten ist.
            "Steht in deinem Profil."
          )}
        </Gespeichert>
      )}
      {/* ⚠️ Ohne diesen eigenen Zweig wäre der Fix ein Rückschritt (Warnung von
          Nele): Sobald ausgeloggt kein Fehler mehr gesetzt wird, griffe die
          Quittung oben – und ein Mensch ohne Konto läse „Steht in deinem
          Profil" über einem Profil, das es nicht gibt. Aus einer sichtbaren
          Fehlermeldung würde eine unsichtbare Unwahrheit, und das ist die
          schlechtere von beiden.
          Bewusst „Für dein Profil", nicht „Notiert": Die Auswahl lebt nur im
          State dieser Tour, `/signup` weiß nichts von ihr. „Notiert" würde
          zusagen, dass der Wert bei der Registrierung mitkommt – das tut er
          nicht. */}
      {wert && stand === SPEICHERN_ANONYM && (
        <Hinweis>Für dein Profil – gespeichert wird es, sobald du ein Konto hast.</Hinweis>
      )}
      {/* Abwählen quittiert sonst gar nichts (Befund Tobias, 14.08.2026):
          Nochmal auf den aktiven Chip tippen speichert `""` – eingeloggt löscht
          man die Position damit still aus dem Profil, ohne jede Rückmeldung. */}
      {!wert && stand === SPEICHERN_OK && <Hinweis>Position wieder entfernt.</Hinweis>}
      {stand === SPEICHERN_FEHLER && (
        <FormAlert className="mt-3">
          Konnte gerade nicht gespeichert werden. Du kannst das später im Profil nachholen.
        </FormAlert>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Schritt „Stadt" – setzt Heimatort UND Bundesland in einem Zug. Das Bundesland
// ist das Feld, an dem die Umkreissuche hängt; hier fällt es beiläufig ab,
// statt in einem Formular abgefragt zu werden, das niemand ausfüllt.
// ---------------------------------------------------------------------------
export function StepStadt({ stadt, land, onOrt, onGespeichert }) {
  const [stand, setStand] = useState(null); // null | ok | fehler | anonym

  async function waehlen(c) {
    onOrt({ stadt: c.n, land: c.s });
    const ergebnis = await speichern("/api/player/update-profile", {
      hometown: c.n,
      bundesland: c.s,
    });
    setStand(ergebnis);
    if (ergebnis === SPEICHERN_OK) onGespeichert?.("stadt");
  }

  return (
    <>
      <CityInput
        value={stadt}
        onChange={(v) => onOrt({ stadt: v, land: v ? land : "" })}
        onPick={waehlen}
        placeholder="Stadt eingeben…"
        className={inputClass}
      />

      {/* `stand === null`: aus dem Profil vorbelegt, also gespeichert – s. die
          gleichlautende Stelle in StepPosition (Befund A6 von Kai). */}
      {land && (stand === SPEICHERN_OK || stand === null) && (
        <Gespeichert>
          {stadt} · {land} – gespeichert.
        </Gespeichert>
      )}
      {land && stand === SPEICHERN_ANONYM && (
        <Hinweis>
          {stadt} · {land} – gespeichert wird es, sobald du ein Konto hast.
        </Hinweis>
      )}
      {stand === SPEICHERN_FEHLER && (
        <FormAlert className="mt-3">
          Konnte gerade nicht gespeichert werden. Du kannst das später im Profil nachholen.
        </FormAlert>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Schritt „Übergabe" – die Tour endet nicht, sie reicht weiter. Angezeigt wird
// derselbe Stand, den die Checkliste im Feed führt (gemeinsame Quelle:
// computeSteps aus OnboardingChecklist), damit hier nichts als erledigt gilt,
// was dort noch offen steht.
// ---------------------------------------------------------------------------
export function StepUebergabe({
  player,
  weg,
  verfuegbar,
  onVerfuegbar,
  onGespeichert,
  angemeldet = true,
}) {
  const [stand, setStand] = useState(null); // null | ok | fehler | anonym
  const schritte = computeSteps(player);
  const erledigt = schritte.filter((s) => s.done).length;
  const pct = Math.round((erledigt / schritte.length) * 100);

  async function verfuegbarSetzen() {
    onVerfuegbar(true);
    const ergebnis = await speichern("/api/player/update-transfer", {
      transferStatus: "verfuegbar",
    });
    setStand(ergebnis);
    if (ergebnis === SPEICHERN_OK) onGespeichert?.("verfuegbar");
  }

  // Ohne Konto trägt die Folie nur Titel, Satz und den Weg zur Registrierung
  // (s. WelcomeTour). Fortschrittsleiste und Checkliste bleiben hier weg:
  // `computeSteps` rechnet gegen einen `player`, den es ausgeloggt nicht gibt –
  // „0 von 4 · 0 %" wäre kein Fortschritt, sondern die Aussage „du hast nichts
  // geschafft" gegenüber jemandem, der noch gar nichts schaffen konnte
  // (Befund Lina, Begründung Nele, 14.08.2026). Auch der Verfügbar-Handgriff
  // entfällt: Er würde ins Leere speichern.
  if (!angemeldet) return null;

  return (
    <div className="space-y-4">
      {/* Fortschritt – dieselbe Leiste wie in der Checkliste im Feed, damit die
          Übergabe als Fortsetzung gelesen wird und nicht als neues Ding. */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs text-mist-400">
            {erledigt} von {schritte.length} Startschritten erledigt
          </span>
          <span className="font-mono text-xs tabular-nums text-brand-400">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-navy-700">
          <div
            className="h-full bg-brand-500 transition-[width] duration-700 ease-out-strong motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1.5">
        {schritte.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 text-sm">
            {s.done ? (
              <PiCheckCircleBold className="flex-shrink-0 text-signal-ok" aria-hidden="true" />
            ) : (
              <PiCircleBold className="flex-shrink-0 text-navy-500" aria-hidden="true" />
            )}
            <span className={s.done ? "text-mist-400 line-through" : "text-paper-50"}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Der eine Weg-spezifische Handgriff. Bei „suche" ist er echt und
          speichert; bei den anderen beiden ist er ein Link, weil Team gründen
          bzw. beitreten eine eigene Seite mit Freigabe ist und in einem
          Dialogfenster nichts verloren hat. */}
      {weg === "suche" && (
        <div className="rounded-md border border-navy-600 bg-navy-950 p-3.5">
          {/* Korrektur Nele, 13.08.2026: Der erste Entwurf lautete „…dann sehen
              dich Vereine im Transfermarkt" und unterstellte damit eine
              Nachfrage-Seite, die es heute nicht gibt (3 Ligen mit echten
              Teams, H4 unvalidiert). docs/ZIELGRUPPEN.md sagt zu genau dieser
              Gruppe: solange das Inventar klein ist, ehrlich als „im Aufbau"
              rahmen statt als Marktplatz. Wer zweimal nichts findet, kommt
              nicht wieder – ein zu großes Versprechen kostet hier mehr, als
              es bringt. */}
          <p className="text-sm text-mist-300">
            Trag dich als verfügbar ein – du bist damit sichtbar, sobald ein Verein
            im Transfermarkt sucht. Der ist noch im Aufbau, du gehörst zu den Ersten.
          </p>
          {/* `stand === null` = aus dem Profil vorbelegt (WelcomeTour setzt
              `verfuegbar` aus `transferStatus`). Ohne diesen Zweig las ein
              Spieler, der längst verfügbar ist, die Aufforderung „Als verfügbar
              eintragen" – eine Handlungsaufforderung für etwas Erledigtes und
              damit eine falsche Aussage über sein eigenes Profil (Befund A1 von
              Kai). Die alte Bedingung `!fehler` war initial `true`; beim Umbau
              auf `stand` ist das durchgerutscht.
              Der Satz sagt bewusst nicht mehr „Du stehst JETZT als verfügbar":
              Bei einem vorbelegten Wert behauptete das, die Zeile sei die Folge
              eines gerade getanen Klicks. Neutral stimmt er in beiden Fällen;
              dass es geklappt hat, trägt ohnehin der grüne Haken. */}
          {verfuegbar && (stand === SPEICHERN_OK || stand === null) ? (
            <Gespeichert>Du stehst als verfügbar im Transfermarkt.</Gespeichert>
          ) : (
            <button
              type="button"
              onClick={verfuegbarSetzen}
              className="mt-3 inline-flex items-center gap-2 rounded-md border-[1.5px] border-mist-400 px-3 py-1.5 text-sm font-semibold text-paper-50 transition-[color,border-color,transform] duration-150 ease-out-strong hover:border-brand-500 hover:text-brand-300 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
            >
              Als verfügbar eintragen
            </button>
          )}
          {stand === SPEICHERN_FEHLER && (
            <FormAlert className="mt-3">
              Konnte gerade nicht gespeichert werden – im Profil unter &bdquo;Transfer&ldquo; nachholbar.
            </FormAlert>
          )}
        </div>
      )}
    </div>
  );
}
