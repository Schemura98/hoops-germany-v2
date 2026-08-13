"use client";

import {
  PiCheckCircleBold,
  PiArrowRightBold,
  PiCalendarBlankBold,
} from "react-icons/pi";
import { Skeleton } from "@/components/ui/Skeleton";

// ---------------------------------------------------------------------------
// Die erste Zeile, die ein Team-Admin beim Wiedereinstieg liest.
//
// Sie sagt in einem Blick, ob es etwas zu tun gibt – und wenn nicht, sagt sie
// auch DAS, statt ihn suchen zu lassen (Ronjas Befund R3). Keine Farbdramatik,
// kein Countdown, keine erfundene Dringlichkeit: nur die Wahrheit, die die
// Seite ohnehin schon kennt.
//
// Die Zahlen kommen aus lib/useTeamAufgaben.js; dort steht, was jede einzelne
// genau zählt.
// ---------------------------------------------------------------------------

function datumKurz(d) {
  try {
    return new Date(d).toLocaleDateString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function Posten({ anzahl, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-sm border border-navy-600 bg-navy-700 px-3 py-2 text-left text-sm text-paper-50 transition-colors duration-150 hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
    >
      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-signal-wait px-1.5 font-mono text-xs font-bold tabular-nums text-navy-950">
        {anzahl}
      </span>
      <span>{text}</span>
      <PiArrowRightBold className="text-xs text-mist-400 transition-colors group-hover:text-brand-400" />
    </button>
  );
}

export default function AufgabenLeiste({ aufgaben, status, sichtbareTabs = [], onSpringen }) {
  // Solange die Zahlen nicht sicher sind, behaupten wir gar nichts – aber die
  // Fläche bleibt stehen, sonst rutscht die Tab-Leiste unter dem Finger weg.
  if (status === "loading") {
    return (
      <div className="mb-6 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-9 w-48" />
        <Skeleton className="mt-4 h-3 w-56" />
      </div>
    );
  }
  // Fehlgeschlagen: lieber gar keine Leiste als eine Zahl, für die wir nicht
  // geradestehen können. Das Panel bleibt vollständig bedienbar.
  if (status !== "ready") return null;

  const sichtbar = (key) => sichtbareTabs.includes(key);
  const posten = [];

  if (sichtbar("anfragen") && aufgaben.anfragen > 0) {
    posten.push({
      key: "anfragen",
      anzahl: aufgaben.anfragen,
      text: aufgaben.anfragen === 1 ? "Beitrittsanfrage" : "Beitrittsanfragen",
      tab: "anfragen",
    });
  }
  if (sichtbar("kader") && aufgaben.kaderFreigabe > 0) {
    posten.push({
      key: "kader",
      anzahl: aufgaben.kaderFreigabe,
      text: aufgaben.kaderFreigabe === 1 ? "Platz freigeben" : "Plätze freigeben",
      tab: "kader",
    });
  }
  if (sichtbar("ergebnisse") && aufgaben.widerspruch > 0) {
    posten.push({
      key: "widerspruch",
      anzahl: aufgaben.widerspruch,
      text: aufgaben.widerspruch === 1 ? "Widerspruch klären" : "Widersprüche klären",
      tab: "ergebnisse",
    });
  }
  if (sichtbar("ergebnisse") && aufgaben.ergebnisFehlt > 0) {
    posten.push({
      key: "ergebnis",
      anzahl: aufgaben.ergebnisFehlt,
      text: aufgaben.ergebnisFehlt === 1 ? "Ergebnis fehlt" : "Ergebnisse fehlen",
      tab: "ergebnisse",
    });
  }
  if (sichtbar("ergebnisse") && aufgaben.boxscoreFehlt > 0) {
    posten.push({
      key: "boxscore",
      anzahl: aufgaben.boxscoreFehlt,
      text: aufgaben.boxscoreFehlt === 1 ? "Box-Score fehlt" : "Box-Scores fehlen",
      tab: "ergebnisse",
    });
  }

  const naechstes = aufgaben.naechstesSpiel;

  return (
    <div className="mb-6 rounded-md border border-navy-600 border-t-2 border-t-brand-500 bg-navy-800 p-4">
      {posten.length > 0 ? (
        <>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
            Zu erledigen
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {posten.map((p) => (
              <Posten
                key={p.key}
                anzahl={p.anzahl}
                text={p.text}
                onClick={() => onSpringen(p.tab)}
              />
            ))}
          </div>
          {aufgaben.boxscoreFehlt > 0 && (
            // Der Grund, warum diese Eingabe sich lohnt – seit dem 13.08.2026
            // ist sie das einzige Ereignis, das einen Spieler von sich aus
            // erreicht (lib/statsNotify.js).
            <p className="mt-3 text-sm text-mist-400">
              Sobald der Box-Score gespeichert ist, bekommen eure Spieler mit Konto ihre
              Zahlen als Benachrichtigung.
            </p>
          )}
        </>
      ) : (
        <>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-mist-600">
            Alles erledigt
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm text-paper-50">
            <PiCheckCircleBold className="mt-0.5 flex-shrink-0 text-signal-ok" />
            <span>
              Keine offene Anfrage, kein fehlendes Ergebnis. Hier wartet gerade nichts auf
              dich.
            </span>
          </p>
        </>
      )}

      {/* Der ehrlichste Wiederkehr-Anker, den ein Team-Admin hat: das nächste
          Spiel. Steht in beiden Zuständen – nach getaner Arbeit als Ausblick,
          bei offenen Posten als Einordnung, wie eilig es ist. */}
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-navy-600 pt-3 text-sm text-mist-400">
        <PiCalendarBlankBold className="flex-shrink-0 text-mist-600" />
        {naechstes ? (
          <>
            <span className="text-mist-300">Nächstes Spiel:</span>
            <span className="text-paper-50">
              {datumKurz(naechstes.date)}
              {naechstes.gegner ? ` · ${naechstes.gegner}` : ""}
            </span>
          </>
        ) : (
          <>
            <span>Kein kommendes Spiel eingetragen.</span>
            {sichtbar("spielplan") && (
              <button
                type="button"
                onClick={() => onSpringen("spielplan")}
                className="font-semibold text-brand-400 hover:text-brand-300"
              >
                Spielplan öffnen
              </button>
            )}
          </>
        )}
      </p>
    </div>
  );
}
