import { Big_Shoulders_Display } from "next/font/google";
import localFont from "next/font/local";

// Schriftfamilien der visuellen Richtung „Anzeigetafel"
// (docs/VISUELLE-RICHTUNG-2026-08-12.md, Abschnitt 2.2).
//
// Display: Big Shoulders – kondensierte Grotesk mit Signage-Herkunft, trägt
// Headlines, Eyebrows und große Zahlen.
export const display = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

// Text/UI und Daten: Geist bzw. Geist Mono.
//
// Bewusst NICHT über next/font/google: Der Font-Katalog, den Next 14.2.35
// mitbringt, ist zum Release-Zeitpunkt eingefroren und kennt Geist noch nicht
// (selbst geprüft im Manifest – „Big Shoulders Display" ist drin, „Geist" nicht).
// Deshalb der von Vivien vorgesehene Rückfallweg: selbst gehostete woff2-Dateien
// über next/font/local – dieselbe Ladestrategie, keine neue Abhängigkeit.
// Variable Schnitte (100–900), Latin-Subset, aus dem offiziellen Google-Fonts-CDN.
export const sans = localFont({
  src: [{ path: "../public/fonts/geist-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const mono = localFont({
  src: [{ path: "../public/fonts/geist-mono-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

// Segment-Ziffern der echten Anzeigetafel (Konzept
// docs/ANZEIGETAFEL-KONZEPT-2026-08-23.md, Entscheidung Patrick 23.08.2026):
// DSEG7 Classic Bold – echte 7-Segment-Geometrie als Font, SIL OFL 1.1
// (Lizenz liegt daneben: public/fonts/DSEG-LICENSE.txt). Selbst gehostet wie
// Geist; Bezugsweg reproduzierbar über scripts/fetch-segment-font.sh.
// adjustFontFallback aus: Für Segment-Metrik gibt es kein sinnvolles
// System-Fallback-Tuning – der Fallback (Monospace) ist LESBAR, nur ohne
// Segment-Optik. Einsatz NUR über das SegmentZahl-Primitiv in Tafel-Fenstern.
export const segment = localFont({
  src: [{ path: "../public/fonts/DSEG7Classic-Bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-segment",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
});
