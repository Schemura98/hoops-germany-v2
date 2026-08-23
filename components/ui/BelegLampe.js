"use client";

import { beidseitigBelegt, matchVerification } from "@/lib/matchScore";

// Die Beleg-Lampe – das Bonus-Lampen-Zitat der echten Anzeigetafel, gefüllt
// mit unserem Inhalt: Sie leuchtet, wenn ein Ergebnis BEIDSEITIG belegt ist
// (Konzept docs/ANZEIGETAFEL-KONZEPT-2026-08-23.md, Abschnitt 2.4; als
// wiederkehrendes Zeichen von Patrick am 23.08.2026 freigegeben).
//
// Quelle ist AUSSCHLIESSLICH lib/matchScore.js – beidseitigBelegt() für die
// Leuchte, matchVerification() für den Text. Diese Komponente rechnet nichts
// selbst nach (genau die Verwechslung, die am 15.08. der Blocker war).
//
// Der Zustand hängt NIE an der Farbe allein (Farbfehlsicht): Die Lampe trägt
// immer ein Textlabel – kompakt als title + sr-only, sonst sichtbar.
// P6-Regel (Entscheidung Patrick, 23.08.2026): Ein admin-gesetztes
// „confirmed" ohne beidseitige Meldung heißt „Ergebnis steht", nie
// „Bestätigt".
export default function BelegLampe({ match, kompakt = false, className = "" }) {
  const v = matchVerification(match);
  if (!v) return null;

  const belegt = beidseitigBelegt(match);
  const label = belegt
    ? "Von beiden Teams bestätigt"
    : v.state === "confirmed"
    ? "Ergebnis steht"
    : v.label;

  const kreis = belegt
    ? "bg-signal-ok"
    : v.state === "mismatch"
    ? "border border-signal-wait"
    : "border border-mist-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={kompakt ? label : undefined}
    >
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${kreis}`} />
      {kompakt ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className={`text-xs font-medium ${belegt ? "text-signal-ok" : "text-mist-400"}`}>
          {label}
        </span>
      )}
    </span>
  );
}
