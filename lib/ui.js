// Zentrale UI-Tokens/Klassen für ein einheitliches Designsystem.

// Einheitliches Formularfeld (Input/Select/Textarea). Ersetzt lokale Kopien.
export const inputClass =
  "w-full rounded-sm border border-ink-600 bg-ink-700 px-4 py-2.5 text-paper-50 placeholder:text-ink-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Kompaktes Formularfeld (z.B. in dichten Tabs/Filtern).
export const inputClassSm =
  "w-full rounded-sm border border-ink-600 bg-ink-700 px-3 py-2 text-sm text-paper-50 placeholder:text-ink-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Zahlenfeld (Ergebnis-Score). Bewusst OHNE Breitenklasse: die Breite setzt die
// aufrufende Stelle (w-20 o.ä.) – ein `w-full` in der Basis würde sich sonst mit
// der lokalen Breitenklasse überlagern (Tailwind-Reihenfolge, nicht String-Reihenfolge).
export const inputClassNum =
  "rounded-sm border border-ink-600 bg-ink-700 px-3 py-2 text-sm text-center font-mono text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Sehr kompaktes Zahlenfeld (Statistik-Tabellen, Rückennummer). Breite s.o.
export const inputClassStat =
  "rounded-sm border border-ink-600 bg-ink-700 px-2 py-1.5 text-sm text-center font-mono text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Karte (für Stellen ohne die Card-Komponente).
export const cardClass = "rounded-md border border-ink-600 bg-ink-800";
