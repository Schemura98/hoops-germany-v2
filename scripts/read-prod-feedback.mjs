// READ-ONLY: liest Feedback aus der Produktiv-DB hoops_prod. Schreibt NICHTS.
// Aufruf: node scripts/read-prod-feedback.mjs
import { readFileSync } from "fs";
import mongoose from "mongoose";

function readEnv(key) {
  try {
    const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
    }
  } catch {}
  return "";
}

const baseUri = readEnv("MONGODB_URI");
const prodUri = baseUri.replace("/hoopsgermany?", "/hoops_prod?");

const fbSchema = new mongoose.Schema({}, { strict: false, collection: "feedbacks" });

await mongoose.connect(prodUri, { serverSelectionTimeoutMS: 10000 });
console.log("DB:", mongoose.connection.name);
const Feedback = mongoose.model("feedbacks", fbSchema);
const all = await Feedback.find({}).sort({ createdAt: -1 }).lean();
console.log(`\n=== ${all.length} Feedback-Einträge ===\n`);
for (const f of all) {
  console.log("----------------------------------------");
  console.log("Datum:    ", f.createdAt);
  console.log("Typ:      ", f.type || "(kein)");
  console.log("Rating:   ", f.rating ?? "(kein)");
  console.log("Bereiche: ", (f.areas || []).join(", ") || "(keine)");
  if (f.likes) console.log("Gefällt:  ", f.likes);
  if (f.dislikes) console.log("Kritik:   ", f.dislikes);
  if (f.suggestions) console.log("Wunsch:   ", f.suggestions);
  if (f.message) console.log("Nachricht:", f.message);
  console.log("Status:   ", f.status);
}
console.log("\n=== Ende ===");
await mongoose.disconnect();
process.exit(0);
