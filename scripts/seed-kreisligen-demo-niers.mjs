// DEMO-Kreisligen für den Kreis Niers (NRW). ADDITIV + getaggt (seedTag:"kreisliga-demo-niers"
// – eigener, von "kreisliga-demo" getrennter Tag), idempotent, purgebar. Legt zusätzlich klar
// erkennbare fiktive Demo-TEAMS an (Präfix "Demo ", isDemo:true), da der Kreis Niers vier
// realistisch befüllte Ligen zeigen soll (nicht nur eine Beispiel-Liga wie im Basis-Seed).
// ⚠️ DEMO: official:false – kein echter Verbandskatalog, keine echten Vereinsnamen.
//   node scripts/seed-kreisligen-demo-niers.mjs          → anlegen/aktualisieren
//   node scripts/seed-kreisligen-demo-niers.mjs --dry     → Vorschau
//   node scripts/seed-kreisligen-demo-niers.mjs --purge   → NUR diese Niers-Demo-Daten löschen
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
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PURGE = process.argv.includes("--purge");
const DRY = process.argv.includes("--dry");
const SEED_TAG = "kreisliga-demo-niers";
const SEASON = "2025/26";
const NRW = "Nordrhein-Westfalen";
const KREIS = "Kreis Niers";

// Liga-Definitionen mit ihren jeweiligen Demo-Teams (mind. 4 Teams pro Liga, wie gefordert).
const LEAGUES = [
  {
    name: "1. Kreisliga Herren – Kreis Niers",
    gender: "Herren",
    ageGroup: "Senioren",
    teams: [
      "Demo Viersen Vipers",
      "Demo Krefeld Kings",
      "Demo Mönchengladbach Meteors",
      "Demo Nettetal Nets",
      "Demo Kempen Knights",
      "Demo Willich Wolves",
    ],
  },
  {
    name: "2. Kreisliga Herren – Kreis Niers",
    gender: "Herren",
    ageGroup: "Senioren",
    teams: ["Demo Dülken Dragons", "Demo Fischeln Flyers", "Demo Rheydt Raptors", "Demo Lobberich Lions"],
  },
  {
    name: "1. Kreisliga U18 männlich – Kreis Niers",
    gender: "Herren",
    ageGroup: "U18",
    teams: [
      "Demo Viersen Vipers U18",
      "Demo Krefeld Kings U18",
      "Demo Mönchengladbach Meteors U18",
      "Demo Willich Wolves U18",
    ],
  },
  {
    name: "1. Kreisliga U16 männlich – Kreis Niers",
    gender: "Herren",
    ageGroup: "U16",
    teams: [
      "Demo Kempen Knights U16",
      "Demo Nettetal Nets U16",
      "Demo Dülken Dragons U16",
      "Demo Fischeln Flyers U16",
    ],
  },
];

const uri = readEnv("MONGODB_URI");
if (!uri) { console.error("❌ MONGODB_URI fehlt"); process.exit(1); }
await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection;
console.log("⏳ Verbunden mit", db.name, PURGE ? "(PURGE)" : DRY ? "(DRY)" : "");
const Leagues = db.collection("leagues");
const Teams = db.collection("teams");

if (PURGE) {
  // Nur Dokumente mit UNSEREM Tag – trifft nie echte Ligen/Teams (auch nicht andere Demo-Sets).
  const lCount = DRY ? await Leagues.countDocuments({ seedTag: SEED_TAG }) : (await Leagues.deleteMany({ seedTag: SEED_TAG })).deletedCount;
  const tCount = DRY ? await Teams.countDocuments({ seedTag: SEED_TAG }) : (await Teams.deleteMany({ seedTag: SEED_TAG })).deletedCount;
  console.log(`🧹 ${DRY ? "(dry) " : ""}${lCount} Niers-Liga(en) + ${tCount} Niers-Demo-Team(s) entfernt.`);
  await mongoose.disconnect();
  process.exit(0);
}

let teamsCreated = 0, teamsUpdated = 0, leaguesCreated = 0, leaguesUpdated = 0;

for (const lg of LEAGUES) {
  // 1) Teams sicherstellen (idempotent über teamName; eindeutiger, klar fiktiver Name).
  const teamIds = [];
  for (const teamName of lg.teams) {
    const slug = slugify(teamName);
    const doc = {
      teamName,
      slug,
      region: KREIS,
      bundesland: NRW,
      isDemo: true,
      seedTag: SEED_TAG,
      approved: true,
      followers: [],
      rosterSlots: [],
    };
    console.log(`  • Team: ${teamName}`);
    if (DRY) continue;
    const existing = await Teams.findOne({ teamName });
    if (existing) {
      await Teams.updateOne({ _id: existing._id }, { $set: doc });
      teamsUpdated++;
      teamIds.push(existing._id);
    } else {
      const res = await Teams.insertOne({ ...doc, createdAt: new Date(), updatedAt: new Date() });
      teamsCreated++;
      teamIds.push(res.insertedId);
    }
  }

  // 2) Liga sicherstellen (idempotent über seedTag+name+season+region+gender+ageGroup).
  const key = { seedTag: SEED_TAG, name: lg.name, season: SEASON, region: KREIS, gender: lg.gender, ageGroup: lg.ageGroup };
  const leagueDoc = {
    ...key,
    bundesland: NRW,
    level: "Kreisliga",
    official: false,
    isDemo: true,
    active: true,
    finished: false,
    playoffMode: "keine",
    teams: teamIds,
    matches: [],
  };
  console.log(`  ⇒ Liga: ${lg.name}  (${teamIds.length} Teams)`);
  if (DRY) continue;
  const existingLeague = await Leagues.findOne(key);
  let leagueId;
  if (existingLeague) {
    await Leagues.updateOne({ _id: existingLeague._id }, { $set: leagueDoc });
    leaguesUpdated++;
    leagueId = existingLeague._id;
  } else {
    const res = await Leagues.insertOne({ ...leagueDoc, createdAt: new Date(), updatedAt: new Date() });
    leaguesCreated++;
    leagueId = res.insertedId;
  }
  // Team.leagueId konsistent mitpflegen (Team ↔ Liga bidirektional, wie set-league es tut).
  if (teamIds.length) {
    await Teams.updateMany({ _id: { $in: teamIds } }, { $set: { leagueId } });
  }
}

console.log(
  `✅ Fertig: ${leaguesCreated} Liga(en) neu / ${leaguesUpdated} aktualisiert, ` +
    `${teamsCreated} Team(s) neu / ${teamsUpdated} aktualisiert (Kreis Niers, Saison ${SEASON}).`
);
await mongoose.disconnect();
