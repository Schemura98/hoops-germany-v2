// Gibt es ueberhaupt ein Spiel, bei dem BEIDE Teams selbst gemeldet haben?
// Ohne diese Probe waere der neue Zweig nie gesehen worden - und ein Zweig,
// den niemand je gerendert hat, ist kein geprueftes Feature.
// Liest .env nach dem Muster von scripts/dbcheck.mjs (kein dotenv im Projekt).
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

await mongoose.connect(readEnv("MONGODB_URI"));
const name = mongoose.connection.db.databaseName;
if (name !== "hoopsgermany") {
  console.error("ABBRUCH: nicht die Dev-DB, sondern", name);
  process.exit(1);
}
const M = mongoose.connection.collection("matches");
const gesamt = await M.countDocuments({ resultStatus: "confirmed" });
const echt = await M.countDocuments({
  resultStatus: "confirmed",
  "teamAResult.submittedBy": { $exists: true, $ne: null },
  "teamBResult.submittedBy": { $exists: true, $ne: null },
});
console.log(`DB ${name} · confirmed gesamt: ${gesamt} · davon beidseitig gemeldet: ${echt}`);
const bsp = await M.findOne({
  resultStatus: "confirmed",
  "teamAResult.submittedBy": { $exists: true, $ne: null },
  "teamBResult.submittedBy": { $exists: true, $ne: null },
}, { projection: { _id: 1 } });
if (bsp) console.log("Beispiel-Spiel:", String(bsp._id));
await mongoose.disconnect();
