// Backfill: isDemo:true auf alle bereits geseedeten Demo-Dokumente setzen, deren Seeds das
// Feld noch nicht kannten (seed-nrw-demo lief vor Einführung von Team.isDemo; Player.isDemo
// ist neu). ADDITIV + idempotent: setzt NUR isDemo anhand der vorhandenen seedTags, löscht
// nichts, ändert keine echten Daten (echte Vereine/Spieler tragen kein seedTag).
//   node scripts/backfill-demo-flags.mjs --dry   → Vorschau (Anzahl betroffener Dokumente)
//   node scripts/backfill-demo-flags.mjs         → ausführen
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

const DRY = process.argv.includes("--dry");
// Alle bekannten Demo-Seed-Tags (siehe scripts/seed-*.mjs). Echte Daten tragen KEIN seedTag.
const DEMO_TAGS = ["nrw-demo", "kreisliga-demo", "kreisliga-demo-niers", "world", "showcase-posts"];

await mongoose.connect(readEnv("MONGODB_URI"));
const db = mongoose.connection.db;
console.log(`DB: ${db.databaseName}${DRY ? " (DRY-RUN, keine Änderungen)" : ""}`);

const filter = { seedTag: { $in: DEMO_TAGS }, isDemo: { $ne: true } };
for (const coll of ["teams", "players", "leagues"]) {
  const n = await db.collection(coll).countDocuments(filter);
  if (DRY) {
    console.log(`${coll}: ${n} Dokumente würden isDemo:true erhalten`);
  } else {
    const r = await db.collection(coll).updateMany(filter, { $set: { isDemo: true } });
    console.log(`${coll}: ${r.modifiedCount} Dokumente auf isDemo:true gesetzt (${n} gefunden)`);
  }
}
await mongoose.disconnect();
console.log(DRY ? "Vorschau beendet." : "✅ Backfill abgeschlossen (nur seedTag-Dokumente, additiv).");
