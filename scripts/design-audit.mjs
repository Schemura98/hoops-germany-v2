// Misst, wie konsequent die Designsystem-Primitive aus components/ui/ und die
// Tokens aus lib/ui.js tatsächlich genutzt werden – statt die Zahlen in CLAUDE.md
// nur zu behaupten. Hintergrund: der Posten "Card wird nicht genutzt, N Stellen
// bauen die Panel-Fläche von Hand" stand am 12.08.2026 auf 126 und war am
// 15.08.2026 schon bei 141. Die Zahl altert schneller, als die Doku gepflegt wird.
//
// Aufruf:
//   node scripts/design-audit.mjs            Bericht (Standard)
//   node scripts/design-audit.mjs --files    zusätzlich alle Fundstellen
//   node scripts/design-audit.mjs --json     maschinenlesbar
//   node scripts/design-audit.mjs --check    Abgleich mit BASELINE, exit 1 bei Drift
//
// Reine Node-Standardbibliothek, keine Abhängigkeiten, kein grep – läuft damit
// auch in PowerShell identisch zur Git-Bash.
import { readdirSync, readFileSync, statSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = ["app", "components", "lib"];
const UI_DIR = path.join(REPO, "components", "ui");
const TOKEN_FILE = path.join(REPO, "lib", "ui.js");

// Zuletzt in CLAUDE.md dokumentierter Stand. Bei --check wird dagegen verglichen.
// WICHTIG: Wenn hier etwas geändert wird, IMMER auch den Abschnitt
// "Designsystem-Primitive" in CLAUDE.md samt Messdatum nachziehen – sonst
// verliert der Abgleich seinen Zweck.
// ⚠️ NACHGEZOGEN AM 19.08.2026 — und der GRÖSSTE TEIL DER DRIFT WAR SCHON DA,
// bevor der Hero-Umbau begann. Nachgemessen am unveränderten Stand `062989e`:
// Card 3→2, Reveal 12→11, strikt 141→143, weit 180→184. Es wurde seit dem
// 15.08. also mehrfach an Panels gebaut, ohne diese Baseline zu pflegen.
// Der Hero-Umbau selbst hat die Zahl der handgebauten Panels GESENKT
// (143→141 strikt, 184→182 weit), weil er zwei Komponenten gelöscht hat.
const BASELINE = {
  datum: "22.08.2026",
  importe: {
    // ConfirmAction 3 -> 4 am 22.08.2026: Der Loeschweg fuer eigene Beitraege
    // und Kommentare (Roadmap 37) benutzt das Primitiv, statt eine eigene
    // Rueckfrage zu bauen. `window.confirm` ist im Projekt verboten.
    Button: 25, Card: 2, ConfirmAction: 4, CountUp: 5, EmptyState: 15,
    FormAlert: 9, LinkTabs: 1, Loading: 19, Reveal: 11, ScrollTable: 3,
    Skeleton: 13, SplitFlap: 3, Tabs: 6,
  },
  tokens: { cardClass: 0 },
  // ⚠️ 141 -> 140 / 182 -> 181 am 22.08.2026, und die Richtung ist die gute:
  // Der aufgeklappte Beitrags-Composer baute dieselbe Klassenkette von Hand,
  // die die eingeklappte Fassung zwei Zeilen darueber ueber `Card` bezieht.
  // Eine Flaeche, zwei Wege, in einer Datei – jetzt einer.
  panelsStrikt: 140,
  panelsWeit: 181,
};

const ARGS = new Set(process.argv.slice(2));
const WANT_JSON = ARGS.has("--json");
const WANT_FILES = ARGS.has("--files");
const WANT_CHECK = ARGS.has("--check");

// ---------------------------------------------------------------- Dateien lesen

function sammleDateien(dir, treffer = []) {
  for (const eintrag of readdirSync(dir)) {
    if (eintrag === "node_modules" || eintrag === ".next" || eintrag === ".git") continue;
    const voll = path.join(dir, eintrag);
    if (statSync(voll).isDirectory()) sammleDateien(voll, treffer);
    else if (/\.jsx?$/.test(eintrag)) treffer.push(voll);
  }
  return treffer;
}

const rel = (p) => path.relative(REPO, p).split(path.sep).join("/");

const dateien = ROOTS.flatMap((r) => {
  const dir = path.join(REPO, r);
  try {
    return sammleDateien(dir);
  } catch {
    console.error(`Ordner fehlt, wird übersprungen: ${r}`);
    return [];
  }
}).map((p) => ({ pfad: p, rel: rel(p), zeilen: readFileSync(p, "utf8").split(/\r?\n/) }));

// ------------------------------------------------------------------- Messungen

// 1. Importe der Primitive – gezählt werden DATEIEN, nicht Importzeilen
//    (entspricht dem ursprünglichen `grep -rln 'from "@/components/ui/Card"'`).
//    Die Primitive werden aus components/ui/ ausgelesen, damit ein neues Primitiv
//    automatisch mitgezählt wird und nicht still durchs Raster fällt.
const primitive = readdirSync(UI_DIR)
  .filter((f) => /\.jsx?$/.test(f))
  .map((f) => f.replace(/\.jsx?$/, ""))
  .sort();

//    Importe INNERHALB von components/ui/ (ein Primitiv nutzt ein anderes, z.B.
//    ConfirmAction -> Button) werden getrennt ausgewiesen statt weggeworfen: sie
//    sagen nichts über die Verbreitung in der App aus, sind aber auch nicht nichts.
const importe = {};
for (const name of primitive) {
  // Deckt den Alias-Import und einen etwaigen relativen Import gleichermaßen ab.
  const muster = new RegExp(`from\\s+["'][^"']*ui/${name}["']`);
  const treffer = dateien.filter((d) => d.zeilen.some((z) => muster.test(z)));
  const extern = treffer.filter((d) => !d.rel.startsWith("components/ui/"));
  const intern = treffer.filter((d) => d.rel.startsWith("components/ui/"));
  importe[name] = {
    anzahl: extern.length,
    intern: intern.length,
    dateien: extern.map((d) => d.rel),
    internDateien: intern.map((d) => d.rel),
  };
}

// 2. Tokens aus lib/ui.js – die Definitionszeile selbst zählt nicht als Verwendung.
//    Nutzung innerhalb von lib/ui.js zählt getrennt: STAFFEL_MS wird z.B. nur von
//    staffel() in derselben Datei benutzt. Das als "ungenutzt" zu melden wäre falsch.
const tokenNamen = [...readFileSync(TOKEN_FILE, "utf8").matchAll(/export const (\w+)/g)].map(
  (m) => m[1]
);

const tokens = {};
for (const name of tokenNamen) {
  const muster = new RegExp(`\\b${name}\\b`);
  const definition = new RegExp(`export const ${name}\\b`);
  const fund = [];
  let intern = 0;
  for (const d of dateien) {
    d.zeilen.forEach((z, i) => {
      if (!muster.test(z)) return;
      if (d.pfad === TOKEN_FILE) {
        if (!definition.test(z)) intern++; // Definition ist keine Verwendung
        return;
      }
      fund.push(`${d.rel}:${i + 1}`);
    });
  }
  tokens[name] = {
    anzahl: fund.length,
    intern,
    dateien: [...new Set(fund.map((f) => f.split(":")[0]))].length,
    fundstellen: fund,
  };
}

// 3. Von Hand gebaute Panel-Flächen.
//    strikt = Fläche UND Rahmen in einer Zeile (die in CLAUDE.md dokumentierte Zahl)
//    weit   = jede Zeile mit der Panel-Fläche, unabhängig von der Rahmenfarbe.
//    Die Differenz sind Panels mit abweichendem Rahmen (signal-ok, brand-500,
//    dynamisch) oder ganz ohne – ebenfalls handgebaut, nur nicht vom strikten
//    Muster erfasst. Beide Zahlen sind zeilenbasiert und damit eine UNTERGRENZE:
//    über mehrere Zeilen umgebrochene className-Ketten werden nicht erkannt.
const panelStrikt = [];
const panelWeit = [];
for (const d of dateien) {
  if (d.rel.startsWith("lib/")) continue; // Tokens sind der gewollte Weg, kein Handbau
  d.zeilen.forEach((z, i) => {
    if (!z.includes("bg-navy-800")) return;
    panelWeit.push(`${d.rel}:${i + 1}`);
    if (z.includes("border-navy-600")) panelStrikt.push(`${d.rel}:${i + 1}`);
  });
}

const ergebnis = {
  gemessenAm: new Date().toISOString().slice(0, 10),
  importe: Object.fromEntries(Object.entries(importe).map(([k, v]) => [k, v.anzahl])),
  tokens: Object.fromEntries(Object.entries(tokens).map(([k, v]) => [k, v.anzahl])),
  panelsStrikt: panelStrikt.length,
  panelsWeit: panelWeit.length,
  panelDateien: [...new Set(panelWeit.map((f) => f.split(":")[0]))].length,
  dateienGesamt: dateien.length,
};

// -------------------------------------------------------------------- Ausgabe

if (WANT_JSON) {
  console.log(JSON.stringify(ergebnis, null, 2));
  process.exit(0);
}

const pad = (s, n) => String(s).padEnd(n);
const zahl = (n, breite = 4) => String(n).padStart(breite);

console.log(`\nDesignsystem-Audit – ${ergebnis.dateienGesamt} Dateien in ${ROOTS.join(", ")}\n`);

console.log("Primitive (components/ui/) – Anzahl importierender Dateien in der App");
for (const [name, v] of Object.entries(importe).sort((a, b) => b[1].anzahl - a[1].anzahl)) {
  const zusatz =
    v.anzahl === 0 && v.intern === 0
      ? "  <- ungenutzt"
      : v.intern
        ? `  (+${v.intern} intern in components/ui/)`
        : "";
  console.log(`  ${pad(name, 16)}${zahl(v.anzahl)}${zusatz}`);
  if (WANT_FILES) {
    v.dateien.forEach((f) => console.log(`      ${f}`));
    v.internDateien.forEach((f) => console.log(`      ${f}  (intern)`));
  }
}

console.log("\nTokens (lib/ui.js) – Verwendungen ohne die Definitionszeile");
for (const [name, v] of Object.entries(tokens).sort((a, b) => b[1].anzahl - a[1].anzahl)) {
  const zusatz =
    v.anzahl === 0 && v.intern === 0
      ? "  <- ungenutzt"
      : v.anzahl === 0
        ? `  nur intern in lib/ui.js (${v.intern}x)`
        : `  (in ${v.dateien} ${v.dateien === 1 ? "Datei" : "Dateien"})`;
  console.log(`  ${pad(name, 16)}${zahl(v.anzahl)}${zusatz}`);
  if (WANT_FILES) v.fundstellen.forEach((f) => console.log(`      ${f}`));
}

console.log("\nVon Hand gebaute Panel-Flächen (Zeilen, Untergrenze)");
console.log(`  ${pad("strikt", 16)}${zahl(ergebnis.panelsStrikt)}  bg-navy-800 + border-navy-600`);
console.log(`  ${pad("weit", 16)}${zahl(ergebnis.panelsWeit)}  jede Zeile mit bg-navy-800`);
console.log(`  ${pad("Dateien", 16)}${zahl(ergebnis.panelDateien)}`);
console.log(
  `  Differenz ${ergebnis.panelsWeit - ergebnis.panelsStrikt}: Panels mit anderem oder ohne Rahmen –`
);
console.log("  ebenfalls handgebaut, nur nicht vom strikten Muster erfasst.");
if (WANT_FILES) panelWeit.forEach((f) => console.log(`      ${f}`));

console.log(
  `\nSatz für CLAUDE.md: Card ${ergebnis.importe.Card} Importe, cardClass ` +
    `${ergebnis.tokens.cardClass} Verwendungen, ${ergebnis.panelsStrikt} Stellen von Hand.\n`
);

// ---------------------------------------------------------------- Drift-Abgleich

if (WANT_CHECK) {
  const drift = [];
  for (const [name, erwartet] of Object.entries(BASELINE.importe)) {
    const ist = ergebnis.importe[name];
    if (ist === undefined) drift.push(`Primitiv ${name} existiert nicht mehr (Baseline: ${erwartet})`);
    else if (ist !== erwartet) drift.push(`Import ${name}: ${erwartet} -> ${ist}`);
  }
  for (const name of Object.keys(ergebnis.importe)) {
    if (!(name in BASELINE.importe)) drift.push(`Primitiv ${name} ist neu, fehlt in der Baseline`);
  }
  for (const [name, erwartet] of Object.entries(BASELINE.tokens)) {
    if (ergebnis.tokens[name] !== erwartet) {
      drift.push(`Token ${name}: ${erwartet} -> ${ergebnis.tokens[name]}`);
    }
  }
  if (ergebnis.panelsStrikt !== BASELINE.panelsStrikt) {
    drift.push(`Panels strikt: ${BASELINE.panelsStrikt} -> ${ergebnis.panelsStrikt}`);
  }
  if (ergebnis.panelsWeit !== BASELINE.panelsWeit) {
    drift.push(`Panels weit: ${BASELINE.panelsWeit} -> ${ergebnis.panelsWeit}`);
  }

  if (drift.length === 0) {
    console.log(`--check: keine Abweichung zur Baseline vom ${BASELINE.datum}.\n`);
    process.exit(0);
  }
  console.log(`--check: ${drift.length} Abweichung(en) zur Baseline vom ${BASELINE.datum}:`);
  drift.forEach((d) => console.log(`  ${d}`));
  console.log(
    "\nBitte BASELINE in dieser Datei UND den Abschnitt 'Designsystem-Primitive'\n" +
      "in CLAUDE.md samt Messdatum nachziehen.\n"
  );
  process.exit(1);
}
