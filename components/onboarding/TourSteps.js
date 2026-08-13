"use client";

import { useState } from "react";
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
    hint: "Liga, Kader, Ergebnisse",
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
    hint: "Kader, Spielplan, Ergebnisse",
    Icon: PiClipboardTextBold,
  },
};

// Rollen zur Auswahl. Wer ein Team organisiert, steht nicht zwingend auf dem
// Feld – deshalb bekommt dieser Weg zwei zusätzliche Einträge statt einer
// Position, die dann falsch im Profil steht.
export function rollenFuerWeg(weg) {
  return weg === "admin" ? [...POSITIONS, "Coach", "Manager"] : POSITIONS;
}

// Einheitlicher Speicher-Aufruf. Gibt true/false zurück; die Tour bricht bei
// einem Fehler NIE ab – ein Netzwerkfehler darf niemanden aus dem Einstieg
// werfen, der Schritt bleibt dann einfach offen und steht später in der
// Checkliste im Feed.
async function speichern(pfad, daten) {
  const token = getPlayerToken();
  if (!token) return false;
  try {
    await axios.post(pfad, { token, ...daten });
    return true;
  } catch {
    return false;
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
export function StepPosition({ weg, wert, onWert, onGespeichert }) {
  const [fehler, setFehler] = useState(false);
  const [laeuft, setLaeuft] = useState(null);

  async function waehlen(rolle) {
    const neu = wert === rolle ? "" : rolle; // nochmal tippen = abwählen
    onWert(neu);
    setLaeuft(rolle);
    const ok = await speichern("/api/player/update-profile", { position: neu });
    setLaeuft(null);
    setFehler(!ok);
    if (ok && neu) onGespeichert?.("position");
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

      {wert && !fehler && <Gespeichert>Steht in deinem Profil.</Gespeichert>}
      {fehler && (
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
  const [fehler, setFehler] = useState(false);

  async function waehlen(c) {
    onOrt({ stadt: c.n, land: c.s });
    const ok = await speichern("/api/player/update-profile", {
      hometown: c.n,
      bundesland: c.s,
    });
    setFehler(!ok);
    if (ok) onGespeichert?.("stadt");
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

      {land && !fehler && <Gespeichert>{stadt} · {land} – gespeichert.</Gespeichert>}
      {fehler && (
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
export function StepUebergabe({ player, weg, verfuegbar, onVerfuegbar, onGespeichert }) {
  const [fehler, setFehler] = useState(false);
  const schritte = computeSteps(player);
  const erledigt = schritte.filter((s) => s.done).length;
  const pct = Math.round((erledigt / schritte.length) * 100);

  async function verfuegbarSetzen() {
    onVerfuegbar(true);
    const ok = await speichern("/api/player/update-transfer", {
      transferStatus: "verfuegbar",
    });
    setFehler(!ok);
    if (ok) onGespeichert?.("verfuegbar");
  }

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
          {verfuegbar && !fehler ? (
            <Gespeichert>Du stehst jetzt als verfügbar im Transfermarkt.</Gespeichert>
          ) : (
            <button
              type="button"
              onClick={verfuegbarSetzen}
              className="mt-3 inline-flex items-center gap-2 rounded-md border-[1.5px] border-mist-400 px-3 py-1.5 text-sm font-semibold text-paper-50 transition-[color,border-color,transform] duration-150 ease-out-strong hover:border-brand-500 hover:text-brand-300 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
            >
              Als verfügbar eintragen
            </button>
          )}
          {fehler && (
            <FormAlert className="mt-3">
              Konnte gerade nicht gespeichert werden – im Profil unter &bdquo;Transfer&ldquo; nachholbar.
            </FormAlert>
          )}
        </div>
      )}
    </div>
  );
}
