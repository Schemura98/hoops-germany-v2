import mongoose from "mongoose";
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync("/root/hoops-v2/.env", "utf8").split("\n")
  .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
  .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection.db;
const NUR_ECHT = { isDemo: { $ne: true }, isInternal: { $ne: true } };
const teams = db.collection("teams"), players = db.collection("players");
console.log("Datenbank:", db.databaseName);
console.log("Teams gesamt:", await teams.countDocuments({}));
console.log("  davon extern (zaehlt):", await teams.countDocuments({ ...NUR_ECHT, approved: { $ne: false } }));
console.log("  als intern markiert:", await teams.countDocuments({ isInternal: true }));
const rest = await teams.find({ ...NUR_ECHT, approved: { $ne: false } }, { projection: { teamName: 1, createdAt: 1 } }).toArray();
rest.forEach((t) => console.log(`    - ${t.teamName} (angelegt ${String(t.createdAt).slice(0, 10)})`));
console.log("Spieler gesamt:", await players.countDocuments({}));
console.log("  davon extern (zaehlt):", await players.countDocuments(NUR_ECHT));
console.log("  als intern markiert:", await players.countDocuments({ isInternal: true }));
const restP = await players.find(NUR_ECHT, { projection: { firstName: 1, lastName: 1, email: 1 } }).toArray();
restP.forEach((p) => console.log(`    - ${p.firstName} ${p.lastName} <${p.email}>`));
await mongoose.disconnect();
