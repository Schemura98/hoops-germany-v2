// Entfernt die Testkonten, die Tobias im Deploy-Gate vom 13.08.2026 angelegt
// und ausdruecklich zur Entfernung gemeldet hat (1x "Tobias Qatest",
// 7x "Tobias Tourtest"). Nur Dev-DB, nur exakt diese Adressmuster.
//
// Probelauf:  node tmp/qa-konten-aufraeumen.mjs
// Loeschen:   node tmp/qa-konten-aufraeumen.mjs --weg
import { readFileSync } from "fs";
import mongoose from "mongoose";

// .env wie in scripts/seed-demo.mjs lesen - dotenv ist keine Abhaengigkeit
// dieses Projekts.
function readEnv(key) {
  try {
    const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const zeile of txt.split(/\r?\n/)) {
      const t = zeile.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
    }
  } catch {
    /* keine .env - dann eben nicht */
  }
  return "";
}

const MUSTER = [/^qa\.tobias\./i, /^qa\.tour\./i];

await mongoose.connect(readEnv("MONGODB_URI"));
const db = mongoose.connection;
console.log("Datenbank:", db.name);

// Harte Sperre: Dieses Skript loescht. Es darf ausschliesslich gegen die
// Dev-DB laufen, niemals gegen hoops_prod oder test.
if (db.name !== "hoopsgermany") {
  console.error("ABBRUCH: nicht die Dev-DB.");
  await mongoose.disconnect();
  process.exit(1);
}

const Player = db.collection("players");
const treffer = await Player.find({ $or: MUSTER.map((r) => ({ email: r })) })
  .project({ email: 1, firstName: 1, lastName: 1 })
  .toArray();

console.log(`Gefunden: ${treffer.length}`);
for (const t of treffer) console.log(`  ${t.firstName} ${t.lastName} · ${t.email}`);

if (process.argv.includes("--weg")) {
  const ids = treffer.map((t) => t._id);
  const r = await Player.deleteMany({ _id: { $in: ids } });
  // Verweise aus Follower-/Following-Listen mitentfernen, damit keine
  // Waisen-Ids zurueckbleiben.
  await Player.updateMany(
    {},
    { $pull: { followers: { $in: ids }, following: { $in: ids } } },
  );
  console.log(`\nGelöscht: ${r.deletedCount}`);
} else {
  console.log("\n(Probelauf – mit --weg wirklich löschen)");
}

await mongoose.disconnect();
