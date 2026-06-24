// Seed-Skript: offizieller NRW-Herren-Liga-Katalog (WBV) oberhalb der Kreisliga,
// Saison 2025/26. IDEMPOTENT – legt fehlende Ligen an, aktualisiert die Katalog-
// Felder bestehender und LÖSCHT NICHTS (außer leere Alt-Einträge, s. u.).
// Teams/Matches/active bleiben unberührt (nur beim Neuanlegen gesetzt). Damit
// sicher auf Dev (hoopsgermany) UND Prod (hoops_prod) ausführbar.
//
// Aufruf:  node scripts/seed-nrw-leagues.mjs
//          node scripts/seed-nrw-leagues.mjs --dry   (nur anzeigen, nichts schreiben)
//
// Quelle: WBV "Ligeneinteilung für den MWB 2025/2026" (Stand 12.06.2025),
//   basketball.nrw/images/Spielbetrieb/2025_2026/ligeneinteilung_herren_20250612-1.pdf
// Namen wörtlich aus der PDF. Herren oberhalb Kreisliga:
//   1× 1. Regionalliga · 2× 2. Regionalliga · 4× Oberliga · 8× Landesliga · 16× Bezirksliga = 31 Ligen.
//
// Bezirk je Liga aus der Einteilung abgeleitet (Vereins-ID, 3. Ziffer = Regierungsbezirk:
//   111=Köln, 112=Düsseldorf, 113=Arnsberg, 114=Münster, 115=Detmold).
//   - Bezirksligen liegen je vollständig in einem RP-Bezirk → region gesetzt.
//   - Landesligen meist in einem Bezirk; LL1/LL3 mischen Köln+Düsseldorf → region leer.
//   - 1./2. Regionalliga und Oberliga 4 sind bezirksübergreifend → region leer.
import { readFileSync } from "fs";
import mongoose from "mongoose";

// ----- .env lesen -----
function readEnv(key) {
  try {
    const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
    }
  } catch {}
  return "";
}

const uri = readEnv("MONGODB_URI");
if (!uri) {
  console.error("❌ MONGODB_URI fehlt in .env");
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const SEASON = "2025/26";
const BUNDESLAND = "Nordrhein-Westfalen";

const KOELN = "Bezirk Köln";
const DDORF = "Bezirk Düsseldorf";
const ARNS = "Bezirk Arnsberg";
const MS = "Bezirk Münster";
const DT = "Bezirk Detmold";

// ----- Katalog der NRW-Herren-Ligen (Senioren) oberhalb der Kreisliga -----
const catalog = [
  // Höchste NRW-Klassen – bezirksübergreifend → region leer
  { name: "1. Regionalliga", level: "Regionalliga", region: "" },
  { name: "2. Regionalliga 1", level: "Regionalliga", region: "" },
  { name: "2. Regionalliga 2", level: "Regionalliga", region: "" },
  // Oberligen
  { name: "Oberliga 1", level: "Oberliga", region: KOELN },
  { name: "Oberliga 2", level: "Oberliga", region: DDORF },
  { name: "Oberliga 3", level: "Oberliga", region: ARNS },
  { name: "Oberliga 4", level: "Oberliga", region: "" }, // Münster/Detmold/Arnsberg gemischt
  // Landesligen
  { name: "Landesliga 1", level: "Landesliga", region: "" }, // Köln + Düsseldorf gemischt
  { name: "Landesliga 2", level: "Landesliga", region: KOELN },
  { name: "Landesliga 3", level: "Landesliga", region: "" }, // Köln + Düsseldorf gemischt
  { name: "Landesliga 4", level: "Landesliga", region: DDORF },
  { name: "Landesliga 5", level: "Landesliga", region: ARNS },
  { name: "Landesliga 6", level: "Landesliga", region: ARNS },
  { name: "Landesliga 7", level: "Landesliga", region: MS },
  { name: "Landesliga 8", level: "Landesliga", region: DT },
  // Bezirksligen (je 1 RP-Bezirk)
  { name: "Bezirksliga 1", level: "Bezirksliga", region: KOELN },
  { name: "Bezirksliga 2", level: "Bezirksliga", region: KOELN },
  { name: "Bezirksliga 3", level: "Bezirksliga", region: KOELN },
  { name: "Bezirksliga 4", level: "Bezirksliga", region: KOELN },
  { name: "Bezirksliga 5", level: "Bezirksliga", region: DDORF },
  { name: "Bezirksliga 6", level: "Bezirksliga", region: DDORF },
  { name: "Bezirksliga 7", level: "Bezirksliga", region: DDORF },
  { name: "Bezirksliga 8", level: "Bezirksliga", region: DDORF },
  { name: "Bezirksliga 9", level: "Bezirksliga", region: ARNS },
  { name: "Bezirksliga 10", level: "Bezirksliga", region: ARNS },
  { name: "Bezirksliga 11", level: "Bezirksliga", region: ARNS },
  { name: "Bezirksliga 12", level: "Bezirksliga", region: ARNS },
  { name: "Bezirksliga 13", level: "Bezirksliga", region: MS },
  { name: "Bezirksliga 14", level: "Bezirksliga", region: MS },
  { name: "Bezirksliga 15", level: "Bezirksliga", region: DT },
  { name: "Bezirksliga 16", level: "Bezirksliga", region: DT },
];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log("⏳ Verbunden mit", mongoose.connection.name, DRY ? "(DRY-RUN)" : "");
const Leagues = mongoose.connection.collection("leagues");

const now = new Date();
let created = 0;
let updated = 0;

for (const c of catalog) {
  const filter = { name: c.name, season: SEASON, gender: "Herren" };
  const setFields = {
    bundesland: BUNDESLAND,
    level: c.level,
    gender: "Herren",
    ageGroup: "Senioren",
    region: c.region,
    official: true,
    updatedAt: now,
  };
  if (DRY) {
    const exists = await Leagues.findOne(filter);
    console.log(`${exists ? "↻ update" : "+ neu  "}  ${c.name.padEnd(20)} [${c.level}] ${c.region || "—"}`);
    exists ? updated++ : created++;
    continue;
  }
  const res = await Leagues.updateOne(
    filter,
    {
      $set: setFields,
      $setOnInsert: {
        name: c.name,
        season: SEASON,
        teams: [],
        matches: [],
        active: true,
        createdAt: now,
      },
    },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

// ----- Selbstheilung: leere Alt-Einträge früherer Seed-Varianten entfernen -----
// Nur offizielle NRW-Herren-Ligen 2025/26, die NICHT im Katalog stehen UND
// keine Teams/Matches haben (also nie benutzt wurden). Schützt echte Daten.
const canonical = new Set(catalog.map((c) => c.name));
const strays = await Leagues.find({
  official: true,
  bundesland: BUNDESLAND,
  season: SEASON,
  gender: "Herren",
  name: { $nin: [...canonical] },
}).toArray();
let removed = 0;
for (const s of strays) {
  const empty = (s.teams?.length || 0) === 0 && (s.matches?.length || 0) === 0;
  if (!empty) {
    console.warn(`⚠️  Übersprungen (hat Teams/Spiele, nicht im Katalog): "${s.name}"`);
    continue;
  }
  if (DRY) console.log(`− stray  ${s.name} (leer, würde entfernt)`);
  else await Leagues.deleteOne({ _id: s._id });
  removed++;
}

console.log(
  `✅ Fertig: ${created} angelegt, ${updated} aktualisiert, ${removed} leere Alt-Einträge entfernt (${catalog.length} Katalog-Ligen, Saison ${SEASON}).`
);
await mongoose.disconnect();
process.exit(0);
