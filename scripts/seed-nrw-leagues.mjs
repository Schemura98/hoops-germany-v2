// Seed-Skript: offizieller NRW-Herren-Liga-Katalog (WBV) oberhalb der Kreisliga,
// Saison 2025/26. IDEMPOTENT – legt fehlende Ligen an, aktualisiert die Katalog-
// Felder bestehender und LÖSCHT NICHTS. Teams/Matches/active bleiben unberührt
// (nur beim Neuanlegen gesetzt). Damit sicher auf Dev (hoopsgermany) UND Prod
// (hoops_prod) ausführbar.
//
// Aufruf:  node scripts/seed-nrw-leagues.mjs
//          node scripts/seed-nrw-leagues.mjs --dry   (nur anzeigen, nichts schreiben)
//
// Quelle der Struktur: WBV "Ligenstruktur Senioren" (basketball.nrw) +
// vorläufige Ligeneinteilung 2025/26. Herren oberhalb Kreisliga:
//   1× 1. Regionalliga · 2× 2. Regionalliga · 4× Oberliga · 8× Landesliga · 16× Bezirksliga = 31 Ligen.
// Die 5 Regierungsbezirke des WBV (RP Köln/Düsseldorf/Arnsberg/Münster/Detmold)
// tragen die regionale Gliederung; die exakte Gruppen↔Bezirk-Zuordnung der
// Landes-/Bezirksligen ist über TeamSL nicht zuverlässig extrahierbar und wird
// im Korrektur-Check mit dem User ergänzt (region bleibt vorerst leer).
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

// ----- Katalog der NRW-Herren-Ligen (Senioren) oberhalb der Kreisliga -----
const catalog = [];
const add = (name, level) =>
  catalog.push({ name, level, region: "" });

// 1. Regionalliga (NRW-weit)
add("1. Regionalliga", "Regionalliga");
// 2. Regionalliga – 2 Gruppen
for (let i = 1; i <= 2; i++) add(`2. Regionalliga Gruppe ${i}`, "Regionalliga");
// Oberliga – 4 Gruppen
for (let i = 1; i <= 4; i++) add(`Oberliga Gruppe ${i}`, "Oberliga");
// Landesliga – 8 Gruppen
for (let i = 1; i <= 8; i++) add(`Landesliga Gruppe ${i}`, "Landesliga");
// Bezirksliga – 16 Gruppen
for (let i = 1; i <= 16; i++) add(`Bezirksliga Gruppe ${i}`, "Bezirksliga");

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
    console.log(`${exists ? "↻ update" : "+ neu  "}  ${c.name}  [${c.level}]`);
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

console.log(
  `✅ Fertig: ${created} angelegt, ${updated} aktualisiert (${catalog.length} Katalog-Ligen, Saison ${SEASON}).`
);
await mongoose.disconnect();
process.exit(0);
