"use client";

import LinkTabs from "@/components/ui/LinkTabs";

// Topscorer und Rangliste sind dieselbe Frage, einmal für Spieler und einmal
// für Teams. In der Navigation teilen sie sich deshalb einen Punkt
// („Bestenlisten"); hier steht der Umschalter, der die jeweils andere Liste
// sichtbar macht. Vorher führte in das gesamte Projekt genau EIN Link auf
// /rangliste – aus einer Seitenspalte des eingeloggten Feeds
// (Befund Ronja R7/K8, 13.08.2026).
const TABS = [
  { href: "/topscorer", label: "Spieler" },
  { href: "/rangliste", label: "Teams" },
];

export default function BestenlistenWechsel({ className = "" }) {
  return <LinkTabs tabs={TABS} className={className} label="Bestenliste wechseln" />;
}
