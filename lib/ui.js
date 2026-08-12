// Zentrale UI-Tokens/Klassen für ein einheitliches Designsystem.

// Einheitliches Formularfeld (Input/Select/Textarea). Ersetzt lokale Kopien.
export const inputClass =
  "w-full rounded-sm border border-navy-600 bg-navy-700 px-4 py-2.5 text-paper-50 placeholder:text-navy-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Kompaktes Formularfeld (z.B. in dichten Tabs/Filtern).
export const inputClassSm =
  "w-full rounded-sm border border-navy-600 bg-navy-700 px-3 py-2 text-sm text-paper-50 placeholder:text-navy-500 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Zahlenfeld (Ergebnis-Score). Bewusst OHNE Breitenklasse: die Breite setzt die
// aufrufende Stelle (w-20 o.ä.) – ein `w-full` in der Basis würde sich sonst mit
// der lokalen Breitenklasse überlagern (Tailwind-Reihenfolge, nicht String-Reihenfolge).
export const inputClassNum =
  "rounded-sm border border-navy-600 bg-navy-700 px-3 py-2 text-sm text-center font-mono text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Sehr kompaktes Zahlenfeld (Statistik-Tabellen, Rückennummer). Breite s.o.
export const inputClassStat =
  "rounded-sm border border-navy-600 bg-navy-700 px-2 py-1.5 text-sm text-center font-mono text-paper-50 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

// Karte (für Stellen ohne die Card-Komponente).
export const cardClass = "rounded-md border border-navy-600 bg-navy-800";

// Staffelung von Listen-Einblendungen (Wow-Konzept Stufe C.1).
//
// Bisher entschied jede Seite ihren Abstand selbst – 60ms hier, 90ms dort. Das
// ist genau die Sorte Detail, die einzeln niemand bemerkt und die in der Summe
// den Unterschied zwischen „ordentlich" und „aus einem Guss" ausmacht.
//
// 70ms als Mitte des von Vivien genannten Korridors 30–80ms. Gedeckelt bei
// GRENZE: Ohne Deckel bekäme das zwölfte Element einer Liste 840ms Verzögerung
// und der Nutzer sähe es erst, wenn er längst weitergescrollt ist.
export const STAFFEL_MS = 70;
const GRENZE = 6;

export function staffel(index, ms = STAFFEL_MS) {
  return Math.min(index, GRENZE) * ms;
}
