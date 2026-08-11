import mongoose from "mongoose";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync("/root/hoops-v2/.env", "utf8").split("\n")
  .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
  .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection.db;
if (db.databaseName !== "hoops_prod") { console.log("ABBRUCH: unerwartete Datenbank"); process.exit(1); }
const r = await db.collection("players").updateOne({ email: "jonny_vo@outlook.de" }, { $set: { isInternal: true } });
console.log("Jonny Vo markiert:", r.modifiedCount);
const NUR_ECHT = { isDemo: { $ne: true }, isInternal: { $ne: true } };
const spieler = await db.collection("players").find(NUR_ECHT, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray();
const teams = await db.collection("teams").find({ ...NUR_ECHT, approved: { $ne: false } }, { projection: { teamName: 1 } }).toArray();
console.log(`\nZaehlt jetzt extern - Teams: ${teams.length} | Spieler: ${spieler.length}`);
spieler.forEach((p) => console.log(`   - ${p.firstName} ${p.lastName} <${p.email}>`));
await mongoose.disconnect();
