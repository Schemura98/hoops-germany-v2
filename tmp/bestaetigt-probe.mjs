// Setzt an EINEM Dev-Spiel die beidseitige Meldung, damit der neue Zweig
// ueberhaupt einmal gerendert wird - und nimmt es danach wieder zurueck.
// Nur Dev-DB, mit harter Abbruchpruefung.
import { readFileSync } from "fs";
import mongoose from "mongoose";
function readEnv(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
  }
  return "";
}
const modus = process.argv[2]; // "setzen" | "zuruecknehmen"
const id = process.argv[3];
await mongoose.connect(readEnv("MONGODB_URI"));
const name = mongoose.connection.db.databaseName;
if (name !== "hoopsgermany") { console.error("ABBRUCH: DB ist", name); process.exit(1); }
const M = mongoose.connection.collection("matches");
const P = mongoose.connection.collection("players");
const m = await M.findOne({ _id: new mongoose.Types.ObjectId(id) });
if (!m) { console.error("Spiel nicht gefunden"); process.exit(1); }
if (modus === "setzen") {
  const a = await P.findOne({ teamId: m.teamA }, { projection: { _id: 1 } });
  const b = await P.findOne({ teamId: m.teamB }, { projection: { _id: 1 } });
  if (!a || !b) { console.error("keine Spieler in beiden Teams"); process.exit(1); }
  await M.updateOne({ _id: m._id }, { $set: { "teamAResult.submittedBy": a._id, "teamBResult.submittedBy": b._id } });
  console.log("gesetzt an", id);
} else {
  await M.updateOne({ _id: m._id }, { $unset: { "teamAResult.submittedBy": "", "teamBResult.submittedBy": "" } });
  console.log("zurueckgenommen an", id);
}
await mongoose.disconnect();
