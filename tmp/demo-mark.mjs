import mongoose from "mongoose";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync("/root/hoops-v2/.env", "utf8").split("\n")
  .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
  .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const apply = process.argv.includes("--apply");
await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection.db;
if (db.databaseName !== "hoops_prod") { console.log("ABBRUCH"); process.exit(1); }
console.log(apply ? "SCHREIBEND" : "Trockenlauf", "auf", db.databaseName);

const NAMEN = ["Test Baskets", "Rhein Ballers", "Munich Hoops", "Hamburg Towers United"];
const teams = await db.collection("teams").find({ teamName: { $in: NAMEN } }, { projection: { teamName: 1, isDemo: 1, isInternal: 1, leagueId: 1, _id: 1 } }).toArray();
console.log("\nBetroffene Teams:");
teams.forEach((t) => console.log(`  ${t.teamName.padEnd(24)} isDemo: ${!!t.isDemo}  isInternal: ${!!t.isInternal}`));

const ids = teams.map((t) => t._id);
const spieler = await db.collection("players").countDocuments({ teamId: { $in: ids } });
const spielerOhneDemo = await db.collection("players").countDocuments({ teamId: { $in: ids }, isDemo: { $ne: true } });
console.log(`\nSpieler in diesen Teams: ${spieler} (davon ohne Demo-Kennzeichnung: ${spielerOhneDemo})`);

const spiele = await db.collection("matches").countDocuments({ $or: [{ teamA: { $in: ids } }, { teamB: { $in: ids } }] });
console.log(`Spiele mit diesen Teams: ${spiele}`);

const ligaIds = [...new Set(teams.map((t) => String(t.leagueId)).filter((x) => x && x !== "null" && x !== "undefined"))];
if (ligaIds.length) {
  const ligen = await db.collection("leagues").find({ _id: { $in: ligaIds.map((x) => new mongoose.Types.ObjectId(x)) } }, { projection: { name: 1, isDemo: 1 } }).toArray();
  console.log("Ligen dieser Teams:");
  ligen.forEach((l) => console.log(`  ${String(l.name).padEnd(24)} isDemo: ${!!l.isDemo}`));
}

if (apply) {
  const r = await db.collection("teams").updateMany({ teamName: { $in: NAMEN } }, { $set: { isDemo: true } });
  console.log("\nGeschrieben:", r.modifiedCount, "Teams als Beispieldaten gekennzeichnet.");
}
await mongoose.disconnect();
