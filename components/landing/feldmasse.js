// ══ DIE FELDMASSE — EINE QUELLE FÜR BEIDE ENDEN DER SEITE ═══════════════════
//
// Angelegt am 21.08.2026, als die Startseite ein ZWEITES Feldstück bekommen
// hat (Auftrag Patrick: „wie wäre es denn, wenn das Spielfeld aus der Hero
// unten auf der Seite gespiegelt dargestellt wird und somit die ganze Seite
// ein Spielfeld ergibt").
//
// ⚠️ WARUM DIESE DATEI EXISTIERT — und warum sie nicht „nur Aufräumen" ist:
// Bis dahin standen die Maße in `HeroCourt.js`. Ein zweites Feldstück hätte
// sie kopiert, und damit hätte die Seite ZWEI Stellen, an denen dasselbe Maß
// steht. Genau diese Bauart hat in diesem Projekt schon mehrfach still
// gelogen: Wer eines von beiden ändert, ändert das Feld an einem Ende und
// nicht am anderen — und nichts sieht kaputt aus, es passt nur nicht mehr
// zusammen. Ein Feld mit zwei verschiedenen Zonenbreiten ist kein Feld.
//
// ⚠️ WAS HIER NICHT HINEINGEHÖRT: Farben, Strichstärken, Verläufe, Anzeige-
// größen. Das sind Gestaltungsentscheidungen und sie sind an den beiden Enden
// bewusst NICHT gleich (Nahaufnahme oben, Ankunft unten). Hier stehen
// ausschließlich Größen, die aus dem Regelwerk kommen — also alles, was
// falsch sein KANN statt bloß anders.
//
// ── Quelle ─────────────────────────────────────────────────────────────────
// FIBA, Official Basketball Rules 2026 (gültig ab Juli 2026), Rule 2.1 und
// 2.5.1–2.5.7 sowie Diagram 3. Gegen die Ausgabe 2024 gegengelesen: identisch.
// ⚠️ Die Werte sind am 20.08.2026 gegen das Regelwerk geprüft worden, nachdem
// vier davon falsch waren (Dreipunktlinie auf halber Entfernung, Ladezone
// r = 1,25 statt 1,30, Freiwurfkreis als Vollkreis, Zone fehlte ganz). Die
// Fundstelle steht deshalb an jeder Zeile — eine Zahl ohne Fundstelle ist in
// dieser Datei eine Behauptung.

// Maßstab: 1 m = 60 viewBox-Einheiten. Beide Zeichnungen benutzen ihn, damit
// derselbe Gegenstand an beiden Enden gleich groß ist.
export const M = 60;
export const MITTE = 600;

export const m = (meter) => meter * M; // Meter → viewBox-Einheiten
export const n = (v) => Number(v.toFixed(2));

// ⚠️ MIT EINHEIT. Hier stand einmal eine nackte Zahl, und `calc(<Zahl> + 2px)`
// ist eine ungültige Rechnung — sie macht nicht den Summanden kaputt, sondern
// die ganze Deklaration: `stroke-dasharray` fiel auf `none` zurück und die
// Einblendung fand auf KEINEM Browser statt, ohne Fehlermeldung.
export const px = (v) => `${n(v)}px`;

// ── Die Maße, jeweils mit ihrer Fundstelle ─────────────────────────────────
export const HALB_BREIT = 7.5; // Rule 2.1 — Feld 28 × 15 m, also ± 7,50 m
export const ZONE_HALB = 2.45; // Rule 2.5.3 — Aussenkante 2,45 m von der Mitte
export const ZONE_TIEF = 5.8; // Rule 2.5.3 — Freiwurflinie 5,80 m von der Grundlinie
export const KORB_TIEF = 1.575; // Rule 2.5.4 — Korbmitte 1,575 m von der Grundlinie
export const KORB_R = 0.225; // Ring Ø 0,45 m
export const BRETT_HALB = 0.9; // Brett 1,80 m breit
export const BRETT_TIEF = 1.2; // Rule 2.5.7 — Brettvorderkante 1,20 m
export const LADE_R = 1.3; // Rule 2.5.7 — Ladezone r = 1,30 m
export const LADE_SCHENKEL = 0.375; // Rule 2.5.7 — Länge der zwei Geraden
export const DREI_R = 6.75; // Rule 2.5.4 — Bogen r = 6,75 m um die Korbmitte
export const DREI_X = HALB_BREIT - 0.9; // Rule 2.5.4 — 0,90 m innerhalb der Seitenlinie ⇒ 6,60 m
export const MARKE_LANG = 0.1; // Diagram 3 — die Marken sind 0,10 m lang

// Freiwurf-Aufstellung: die Marken an den Zonenkanten. Abstände ab der
// Grundlinie, aus Diagram 3 abgelesen UND aus der Kette nachgerechnet:
// 1,75 → erste Marke · +0,85 → Ende des ersten Platzes · +0,40 → Ende der
// neutralen Zone · +0,85 · +0,85. Die neutrale Zone ist in der Regel ein
// AUSGEFÜLLTER Block, kein Strich.
export const MARKEN = [1.75, 2.6, 3.0, 3.85, 4.7];
export const NEUTRAL_VON = 2.6;
export const NEUTRAL_BIS = 3.0;

// Wo die Dreipunkt-Gerade in den Bogen übergeht. GERECHNET, nicht gesetzt:
// der Punkt des Kreises (r = 6,75 m um die Korbmitte) bei x = 6,60 m.
// Ergibt 1,575 + 1,4151 = 2,9901 m — die bekannten „knapp 3 m" der Ecken-Drei.
export const UEBERGANG = KORB_TIEF + Math.sqrt(DREI_R * DREI_R - DREI_X * DREI_X);

// Der Bogenscheitel, gemessen ab der Grundlinie. Das ist der TIEFSTE Punkt,
// den ein Feldstück überhaupt zeichnet — beide Zeichnungen brauchen ihn, um
// ihr Helligkeitsgefälle zu setzen, ohne eine Linie hart abzuschneiden.
export const BOGEN_SCHEITEL = KORB_TIEF + DREI_R;

// Die Unterkante der Ladezone: der tiefste Punkt dessen, was zum KORBBEREICH
// gehört. Sie ist an beiden Enden der Anker für den Textabstand — im Hero der
// obere (`pt`), im Abschluss-Block der untere (`pb`).
// ⚠️ Anker ist NICHT der Ring. Seit die Ladezone regelkonform mitgezeichnet
// wird (Halbkreis r = 1,30 m um die Korbmitte), reicht sie 1,075 m tiefer als
// der Ring; am Ring gemessen liefe der Text in den Bogen hinein.
export const KORBBEREICH_TIEF = KORB_TIEF + LADE_R;

// Bogenlänge einer Kreissehne — für die Strichmuster der Einblendung.
export const bogenLaenge = (r, halbSehne) => 2 * r * Math.asin(halbSehne / r);
