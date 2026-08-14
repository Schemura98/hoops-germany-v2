// ---------------------------------------------------------------------------
// Scroll-Sperre für Overlays – EINE Stelle, mit Zähler.
//
// Warum das eine eigene Datei ist (Befund A2 von Kai, 14.08.2026):
// Vorher merkte sich jede Ebene den vorherigen `body.overflow`-Wert selbst und
// stellte ihn beim Schließen wieder her. Das bricht, sobald zwei Ebenen offen
// sind und in der falschen Reihenfolge schließen:
//
//   Suche auf   → merkt sich ""      , setzt "hidden"
//   Tour auf    → merkt sich "hidden", setzt "hidden"
//   Suche zu    → setzt ""            ← Hintergrund scrollt hinter der Tour
//   Tour zu     → setzt "hidden"      ← und bleibt für immer gesperrt
//
// Ergebnis: eine Seite, die sich nicht mehr scrollen lässt, ohne dass ein
// Overlay zu sehen wäre. Nur ein Reload hilft. Und die schädliche Reihenfolge
// ist die WAHRSCHEINLICHE: Das Such-Overlay liegt auf `z-[999]`, die Tour auf
// `z-[60]` – die Tour erscheint dahinter, man schließt naheliegend zuerst die
// Suche. Ein einzelner Escape-Druck erledigt ohnehin beide, wobei die Tour ihr
// Schließen um 200 ms verzögert; damit ist die Reihenfolge sogar immer die
// falsche.
//
// Der Zähler löst das: Gesperrt wird beim ersten `sperreAn()`, freigegeben erst
// beim letzten `sperreAus()`. Wer zwischendurch schließt, gibt nichts frei, was
// eine andere Ebene noch braucht.
//
// ⚠️ `scrollbar-gutter` (Befund A7 von Kai): `overflow: hidden` nimmt unter
// Windows/Chrome die Scrollleiste weg, die Seite samt Sticky-Navbar springt
// dann ~15 px zur Seite – ausgerechnet in einer Änderung, deren Zweck das
// Halten der Leseposition ist. Statt eines globalen `scrollbar-gutter: stable`
// (das auf JEDER Seite dauerhaft Platz reserviert) kompensieren wir hier nur
// solange, wie tatsächlich gesperrt ist.
// ---------------------------------------------------------------------------

let offen = 0;
let vorherOverflow = "";
let vorherPadding = "";

export function sperreAn() {
  if (typeof document === "undefined") return;
  offen += 1;
  if (offen > 1) return; // schon gesperrt – nur mitzählen

  const breite = window.innerWidth - document.documentElement.clientWidth;
  vorherOverflow = document.body.style.overflow;
  vorherPadding = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (breite > 0) {
    const bisher = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${bisher + breite}px`;
  }
}

export function sperreAus() {
  if (typeof document === "undefined") return;
  offen = Math.max(0, offen - 1);
  if (offen > 0) return; // eine andere Ebene braucht die Sperre noch

  document.body.style.overflow = vorherOverflow;
  document.body.style.paddingRight = vorherPadding;
}

// Nur für Tests: der aktuelle Stand des Zählers.
export function sperrenOffen() {
  return offen;
}
