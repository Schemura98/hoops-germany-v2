// Markiert benannte Teams/Spieler in der PRODUKTIV-DB als interne Testkonten.
// Setzt ausschliesslich isInternal. Ohne --apply nur Bericht (Trockenlauf).
import mongoose from "mongoose";
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync("/root/hoops-v2/.env", "utf8").split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
const apply = process.argv.includes("--apply");
const TEAMS = ["Test Baskets", "Rhein Ballers", "Munich Hoops", "Hamburg Towers United"];

await mongoose.connect(env.MONGODB_URI);
const db = mongoose.connection.db;
console.log("Datenbank:", db.databaseName, apply ? "(SCHREIBEND)" : "(Trockenlauf)");
if (db.databaseName !== "hoops_prod") { console.log("ABBRUCH: unerwartete Datenbank"); process.exit(1); }

const alle = await db.collection("teams").find({}, { projection: { teamName: 1, isDemo: 1, isInternal: 1, createdAt: 1, email: 1 } }).toArray();
const echt = alle.filter((t) => !t.isDemo);
console.log(`\nTeams gesamt ${alle.length}, ohne Demo-Kennzeichnung ${echt.length}:`);
for (const t of echt) {
  const treffer = TEAMS.includes(t.teamName);
  console.log(`  ${t.teamName.padEnd(34)} angelegt ${String(t.createdAt).slice(0, 10)}  intern: ${!!t.isInternal}  ${treffer ? "<== wird markiert (Name aus seed-demo.mjs)" : ""}`);
}
const spieler = await db.collection("players").find({ isDemo: { $ne: true } }, { projection: { firstName: 1, lastName: 1, email: 1, isInternal: 1 } }).toArray();
const testMails = spieler.filter((p) => /@test\.de$/i.test(p.email || "") || /@nrw-demo\.de$/i.test(p.email || ""));
console.log(`\nSpieler ohne Demo-Kennzeichnung: ${spieler.length}, davon mit Test-Mailadresse: ${testMails.length}`);
testMails.slice(0, 12).forEach((p) => console.log(`  ${`${p.firstName} ${p.lastName}`.padEnd(26)} ${p.email}  intern: ${!!p.isInternal}`));

if (apply) {
  const rt = await db.collection("teams").updateMany({ teamName: { $in: TEAMS } }, { $set: { isInternal: true } });
  const rp = await db.collection("players").updateMany(
    { $or: [{ email: /@test\.de$/i }, { email: /@nrw-demo\.de$/i }] },
    { $set: { isInternal: true } }
  );
  console.log(`\nGeschrieben: ${rt.modifiedCount} Teams, ${rp.modifiedCount} Spieler.`);
}
await mongoose.disconnect();
