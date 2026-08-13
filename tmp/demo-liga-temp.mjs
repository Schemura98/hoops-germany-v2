// Legt EINE Demo-Liga in der Dev-DB an, um die Beispieldaten-Kennzeichnung in
// der Suche zu pruefen (Kais Blocker vom 13.08.2026). Additiv und umkehrbar.
//
//   node tmp/demo-liga-temp.mjs        anlegen
//   node tmp/demo-liga-temp.mjs --weg  entfernen
import { readFileSync } from "fs";
import mongoose from "mongoose";

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
    /* keine .env */
  }
  return "";
}

const NAME = "Kreisliga Niers (Prüfmuster)";

await mongoose.connect(readEnv("MONGODB_URI"));
const db = mongoose.connection;
console.log("Datenbank:", db.name);
if (db.name !== "hoopsgermany") {
  console.error("ABBRUCH: nicht die Dev-DB.");
  await mongoose.disconnect();
  process.exit(1);
}

const Leagues = db.collection("leagues");

if (process.argv.includes("--weg")) {
  const r = await Leagues.deleteMany({ name: NAME });
  console.log(`Entfernt: ${r.deletedCount}`);
} else {
  await Leagues.updateOne(
    { name: NAME },
    {
      $set: {
        name: NAME,
        season: "2025/26",
        bundesland: "Nordrhein-Westfalen",
        region: "Kreis Niers",
        level: "Kreisliga",
        gender: "Herren",
        ageGroup: "Senioren",
        official: false,
        isDemo: true,
        active: true,
        finished: false,
        teams: [],
        matches: [],
      },
    },
    { upsert: true },
  );
  console.log(`Angelegt/aktualisiert: ${NAME} (isDemo: true)`);
}

await mongoose.disconnect();
