// Bereinigt public/data/de-cities.json von Nicht-Städten (Behörden/POIs/Firmen).
// Tester-Feedback 25.06.2026: Heimatstadt-Typeahead zeigte "Agentur für Arbeit",
// "Amtsgericht", Sparkassen, Kliniken etc. Wir entfernen klare Institutionen über
// PHRASEN-Muster (keine mehrdeutigen Einzelwörter – echte Orte wie "Bad Elster",
// "Schulenberg", "Elsterwerda" bleiben erhalten).
//
// Aufruf:  node scripts/clean-cities.mjs --dry   (nur Bericht)
//          node scripts/clean-cities.mjs         (schreibt die Datei)
import { readFileSync, writeFileSync } from "fs";

const DRY = process.argv.includes("--dry");
const FILE = new URL("../public/data/de-cities.json", import.meta.url);

// Institutionen/POIs – als reguläre Ausdrücke (case-insensitive) auf den Namen.
// Bewusst PHRASEN bzw. Wortgrenzen, damit Ortsnamen nicht versehentlich getroffen werden.
const BLOCK = [
  /agentur f(ür|\.) arbeit/i,
  /arbeitsagentur/i,
  /\bjobcenter\b/i,
  /amtsgericht/i,
  /landgericht/i,
  /sozialgericht/i,
  /arbeitsgericht/i,
  /verwaltungsgericht/i,
  /finanzgericht/i,
  /\bgericht\b/i,
  /finanzamt/i,
  /\bbundesagentur/i,
  /sparkasse/i,
  /\bbank\b/i, // alle Treffer geprüft: ausschließlich Geldinstitute
  /raiffeisen/i,
  /versicherung/i,
  /\bpolizei/i,
  /klinik/i, // Klinik/Klinikum
  /krankenhaus/i,
  /krankenkasse/i,
  /\b(aok|bkk|kkh|dak|barmer)\b/i,
  /universit(ä|ae)t/i,
  /hochschule/i,
  /\bmuseum\b/i,
  /rathaus/i,
  /amt für/i,
  /landesamt/i,
  /bundesamt/i,
  /zentrum für/i,
  /reha-?zentrum/i,
  /ministerium/i,
  /regierungspr(ä|ae)sidium/i,
  /stadtverwaltung/i,
  /kreisverwaltung/i,
  /gemeindeverwaltung/i,
  /\bkaserne\b/i,
  /niederlassung/i,
  /\b(gmbh|mbh|e\.?\s?v\.?|e\.?\s?g\b|\bag)\b/i,
];

const data = JSON.parse(readFileSync(FILE, "utf8"));
const before = data.length;

const removed = [];
const kept = data.filter((c) => {
  const hit = BLOCK.some((re) => re.test(c.n));
  if (hit) removed.push(c.n);
  return !hit;
});

console.log(`Einträge: ${before} → ${kept.length}  (entfernt: ${removed.length})`);

// Sicherheitscheck: kurze (≤ 2 Wörter, ≤ 14 Zeichen) entfernte Namen anzeigen –
// solche sehen eher wie echte Orte aus und sollten manuell geprüft werden.
const suspicious = removed.filter((n) => n.length <= 14 && n.split(/\s+/).length <= 2);
console.log(`\n⚠️  Kurze entfernte Namen (manuell prüfen, ${suspicious.length}):`);
console.log(suspicious.slice(0, 40).join(" | ") || "  (keine)");

console.log(`\nStichprobe entfernt (20):`);
console.log(removed.slice(0, 20).join(" | "));

if (!DRY) {
  writeFileSync(FILE, JSON.stringify(kept));
  console.log(`\n✅ Datei geschrieben (${kept.length} Orte).`);
} else {
  console.log(`\n(DRY-RUN – nichts geschrieben)`);
}
