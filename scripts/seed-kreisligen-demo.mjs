// DEMO-Kreisligen für die Testphase (NRW). ADDITIV + getaggt (seedTag:"kreisliga-demo"),
// idempotent (Match auf seedTag+name+season+region+gender+ageGroup), purgebar.
// ⚠️ DEMO/PROVISORISCH: Kreisnamen aus der (unverifizierten) BASKETBALLKREISE_NRW-Liste;
// official:false (nicht als echter Verbandskatalog markiert). Vor „echt" gegen WBV prüfen.
//   node scripts/seed-kreisligen-demo.mjs          → anlegen/aktualisieren
//   node scripts/seed-kreisligen-demo.mjs --dry     → Vorschau
//   node scripts/seed-kreisligen-demo.mjs --purge   → nur die getaggten Demo-Kreisligen löschen
import { readFileSync } from "fs";
import mongoose from "mongoose";

function readEnv(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const PURGE = process.argv.includes("--purge");
const DRY = process.argv.includes("--dry");
const SEED_TAG = "kreisliga-demo";
const SEASON = "2025/26";
const NRW = "Nordrhein-Westfalen";

// Repräsentative Kreise über alle 5 Regierungsbezirke (Demo).
const KREISE = ["Kreis Köln", "Kreis Düsseldorf", "Kreis Dortmund", "Kreis Münster", "Kreis Paderborn"];
// Kreise, für die zusätzlich Jugend-Kreisligen (U18/U16 männlich) angelegt werden.
const JUGEND_KREISE = ["Kreis Köln", "Kreis Düsseldorf"];

function buildLeagues() {
  const out = [];
  for (const kreis of KREISE) {
    // Senioren Herren: 1. + 2. Kreisliga
    out.push({ name: `1. Kreisliga Herren – ${kreis}`, region: kreis, gender: "Herren", ageGroup: "Senioren" });
    out.push({ name: `2. Kreisliga Herren – ${kreis}`, region: kreis, gender: "Herren", ageGroup: "Senioren" });
  }
  for (const kreis of JUGEND_KREISE) {
    // Jugend männlich (gender-Feld bleibt "Herren"): 1. Kreisliga U18 + U16
    out.push({ name: `1. Kreisliga U18 männlich – ${kreis}`, region: kreis, gender: "Herren", ageGroup: "U18" });
    out.push({ name: `1. Kreisliga U16 männlich – ${kreis}`, region: kreis, gender: "Herren", ageGroup: "U16" });
  }
  return out;
}

const uri = readEnv("MONGODB_URI");
if (!uri) { console.error("❌ MONGODB_URI fehlt"); process.exit(1); }
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection;
console.log("⏳ Verbunden mit", db.name, PURGE ? "(PURGE)" : DRY ? "(DRY)" : "");
const Leagues = db.collection("leagues");
const Teams = db.collection("teams");

if (PURGE) {
  const r = DRY
    ? { deletedCount: await Leagues.countDocuments({ seedTag: SEED_TAG }) }
    : await Leagues.deleteMany({ seedTag: SEED_TAG });
  console.log(`🧹 ${DRY ? "(dry) " : ""}${r.deletedCount} Demo-Kreisliga(en) entfernt.`);
  await mongoose.disconnect();
  process.exit(0);
}

// Ein paar Demo-Teams für EIN Beispiel (nicht-leere Kreisliga) – nur getaggte Demo-Teams.
const demoTeams = await Teams.find({ seedTag: { $in: ["nrw-demo", "world"] } })
  .project({ _id: 1 })
  .limit(4)
  .toArray();
const exampleTeamIds = demoTeams.map((t) => t._id);

let created = 0, updated = 0;
for (const l of buildLeagues()) {
  const key = { seedTag: SEED_TAG, name: l.name, season: SEASON, region: l.region, gender: l.gender, ageGroup: l.ageGroup };
  const isExample = l.name === `1. Kreisliga Herren – Kreis Köln`;
  const doc = {
    ...key,
    bundesland: NRW,
    level: "Kreisliga",
    official: false, // DEMO, nicht verifizierter Verbandskatalog
    active: true,
    finished: false,
    playoffMode: "keine",
    // Beispiel-Liga mit Demo-Teams befüllen, damit eine nicht-leere Kreisliga sichtbar ist.
    teams: isExample ? exampleTeamIds : [],
    matches: [],
  };
  console.log(`  • ${l.name}  (${l.ageGroup}/${l.gender})${isExample ? ` [+${exampleTeamIds.length} Demo-Teams]` : ""}`);
  if (DRY) continue;
  const existing = await Leagues.findOne(key);
  if (existing) { await Leagues.updateOne({ _id: existing._id }, { $set: doc }); updated++; }
  else { await Leagues.insertOne({ ...doc, createdAt: new Date(), updatedAt: new Date() }); created++; }
}

console.log(`✅ ${DRY ? "(dry) " : ""}Fertig: ${created} neu, ${updated} aktualisiert (Kreise: ${KREISE.length}, davon Jugend: ${JUGEND_KREISE.length}).`);
await mongoose.disconnect();
