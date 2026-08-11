import mongoose from "mongoose";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync("/root/hoops-v2/.env", "utf8").split("\n")
  .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
  .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection.db;
if (db.databaseName !== "hoops_prod") { console.log("ABBRUCH"); process.exit(1); }
// Nur Profile, deren VOR- ODER NACHNAME woertlich "Test" enthaelt - kein Raten.
const filter = { $or: [{ firstName: /test/i }, { lastName: /test/i }], isDemo: { $ne: true }, isInternal: { $ne: true } };
const treffer = await db.collection("players").find(filter, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray();
treffer.forEach((p) => console.log(`  markiere: ${p.firstName} ${p.lastName} <${p.email}>`));
if (process.argv.includes("--apply") && treffer.length) {
  const r = await db.collection("players").updateMany(filter, { $set: { isInternal: true } });
  console.log("Geschrieben:", r.modifiedCount);
}
const NUR_ECHT = { isDemo: { $ne: true }, isInternal: { $ne: true } };
console.log("Verbleibend extern gezaehlt - Spieler:", await db.collection("players").countDocuments(NUR_ECHT),
            "| Teams:", await db.collection("teams").countDocuments({ ...NUR_ECHT, approved: { $ne: false } }));
await mongoose.disconnect();
