// Schneller MongoDB-Verbindungstest. Liest MONGODB_URI aus .env.
// Aufruf:  node scripts/dbcheck.mjs
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
  } catch {
    /* .env nicht lesbar */
  }
  return "";
}

const uri = readEnv("MONGODB_URI");
if (!uri) {
  console.error("❌ MONGODB_URI ist in .env leer. Bitte Atlas-String eintragen.");
  process.exit(1);
}

console.log("⏳ Verbinde mit MongoDB…");
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const cols = await mongoose.connection.db.listCollections().toArray();
  console.log("✅ Verbindung erfolgreich!");
  console.log("   Datenbank:", mongoose.connection.name);
  console.log("   Collections:", cols.length ? cols.map((c) => c.name).join(", ") : "(noch keine)");
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error("❌ Verbindung fehlgeschlagen:", err.message);
  console.error("   Prüfe: Passwort korrekt? IP unter Network Access freigegeben (0.0.0.0/0)?");
  process.exit(1);
}
