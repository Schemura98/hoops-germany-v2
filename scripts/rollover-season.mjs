// Season-Rollover: klont die offiziellen Liga-Hüllen einer Saison in die nächste.
// Da wir nur Hüllen (Name/Stufe/Geschlecht/Altersklasse/Bezirk) führen – KEINE
// Verbands-Kader – sind die Liga-Namen Jahr für Jahr stabil; der Rollover legt
// einfach frische, leere Ligen für die neue Saison an. Teams ordnen sich danach
// selbst zu (Auf-/Abstieg passiert in der App, nicht im Katalog).
//
// IDEMPOTENT (Upsert auf name+season+gender+ageGroup, legt nur fehlende an).
// Sicher auf Dev (hoopsgermany) UND Prod (hoops_prod).
//
// Aufruf:
//   node scripts/rollover-season.mjs --from "2025/26" --to "2026/27"
//   node scripts/rollover-season.mjs --from "2025/26" --to "2026/27" --dry
//   node scripts/rollover-season.mjs --from "2025/26" --to "2026/27" --deactivate-old
//
// --dry            nur anzeigen, nichts schreiben
// --deactivate-old setzt die offiziellen Ligen der ALTEN Saison auf active:false
//                  (Archiv; sie verschwinden aus /ligen, bleiben per Direktlink/Tabelle
//                  einsehbar). Standard: alte Saison bleibt unverändert (Übergangsphase).
import { readFileSync } from "fs";
import mongoose from "mongoose";

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

function argVal(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : "";
}

const uri = readEnv("MONGODB_URI");
if (!uri) {
  console.error("❌ MONGODB_URI fehlt in .env");
  process.exit(1);
}

const FROM = argVal("--from");
const TO = argVal("--to");
const DRY = process.argv.includes("--dry");
const DEACTIVATE_OLD = process.argv.includes("--deactivate-old");

if (!FROM || !TO) {
  console.error('❌ Bitte --from und --to angeben, z. B.: --from "2025/26" --to "2026/27"');
  process.exit(1);
}
if (FROM === TO) {
  console.error("❌ --from und --to dürfen nicht gleich sein.");
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log(`⏳ Verbunden mit ${mongoose.connection.name} ${DRY ? "(DRY-RUN)" : ""}`);
const Leagues = mongoose.connection.collection("leagues");

// Quelle: offizielle Ligen der alten Saison
const source = await Leagues.find({ official: true, season: FROM }).toArray();
if (source.length === 0) {
  console.error(`❌ Keine offiziellen Ligen mit season="${FROM}" gefunden – nichts zu klonen.`);
  await mongoose.disconnect();
  process.exit(1);
}

const now = new Date();
let created = 0;
let updated = 0;

for (const s of source) {
  const filter = { name: s.name, season: TO, gender: s.gender, ageGroup: s.ageGroup };
  if (DRY) {
    const exists = await Leagues.findOne(filter);
    console.log(`${exists ? "↻ vorhanden" : "+ neu      "}  ${s.gender || "?"} / ${s.ageGroup || "?"}  ${s.name}`);
    exists ? updated++ : created++;
    continue;
  }
  const res = await Leagues.updateOne(
    filter,
    {
      $set: {
        bundesland: s.bundesland || "",
        level: s.level || "",
        gender: s.gender || "",
        ageGroup: s.ageGroup || "",
        region: s.region || "",
        official: true,
        active: true,
        updatedAt: now,
      },
      $setOnInsert: {
        name: s.name,
        season: TO,
        teams: [],
        matches: [],
        createdAt: now,
      },
    },
    { upsert: true }
  );
  if (res.upsertedCount) created++;
  else updated++;
}

let deactivated = 0;
if (DEACTIVATE_OLD) {
  if (DRY) {
    deactivated = await Leagues.countDocuments({ official: true, season: FROM, active: { $ne: false } });
    console.log(`  (würde ${deactivated} Ligen der Saison ${FROM} auf active:false setzen)`);
  } else {
    const res = await Leagues.updateMany(
      { official: true, season: FROM },
      { $set: { active: false, updatedAt: now } }
    );
    deactivated = res.modifiedCount;
  }
}

console.log(
  `✅ Rollover ${FROM} → ${TO}: ${created} neu, ${updated} bereits vorhanden` +
    (DEACTIVATE_OLD ? `, ${deactivated} alte Ligen archiviert (active:false)` : "") +
    ` (Quelle: ${source.length} offizielle Ligen ${FROM}).`
);
console.log(
  "ℹ️  Teams müssen sich für die neue Saison neu zuordnen (Auf-/Abstieg) – die geklonten Ligen starten leer."
);
await mongoose.disconnect();
process.exit(0);
