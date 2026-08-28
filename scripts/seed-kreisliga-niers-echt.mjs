// scripts/seed-kreisliga-niers-echt.mjs
// ---------------------------------------------------------------------------
// Die ECHTE Kreisliga Herren des Kreises Niers ("KLH Niers", Saison 2026/27)
// in den offiziellen Katalog aufnehmen. Freigabe Patrick 28.08.2026 (Punkt 3
// der Vor-Teststart-Liste): Jonatans WhatsApp-Gruppe ist Kreis Niers — die
// Tester sollen ihre echte Liga finden ("trag dein Team als Erster ein" wird
// damit wörtlich einlösbar), nicht nur die Demo-Kreisligen.
//
// Datenquelle: docs/VEREINE-KREIS-NIERS-2026-08-22.md — am 22.08.2026 GEMESSEN
// auf basketball-bund.net (TeamSL, offizielles Spielbetriebs-Portal):
//   Staffel "KLH Niers", Liganr. 507200, TeamSL-Liga-ID 56045, 9 Teams,
//   erste Spieltermine ab 03.10.2026. Es gibt 2026/27 im Kreis Niers KEINE
//   Damen- und keine 2. Kreisliga (gemessen, keine Vermutung) — deshalb
//   entsteht hier genau EINE Liga.
//
// Regeln (league-catalog-Skill, Muster seed-nrw-leagues.mjs):
//   - official:true, level "Kreisliga", region = Kreis (Kanon "Kreis Niers"),
//     Senioren Herren — Jugendstaffeln bewusst NICHT: U16/U14/U12/U10 liegen
//     unter dem Plattform-Mindestalter, und die U18-Staffel hatte am Messtag
//     Datenlücken (Ränge 3+4 fehlten) — die kommt, wenn, dann als eigener,
//     geprüfter Auftrag.
//   - Saison "2026/27": die real veröffentlichte Spielzeit. Der übrige Katalog
//     steht noch auf 2025/26 (Rollover, Roadmap 7, nie gelaufen) — das ist
//     hier kein Widerspruch, sondern der ehrliche Stand: Diese Liga IST die
//     kommende Saison. Die Liga-Auswahl auf /team/create filtert nicht nach
//     Saison und zeigt sie mit "(2026/27)" an.
//   - KEINE Teams angelegt: Die 9 echten Vereine treten selbst bei
//     (Freigabeprozess) — genau das ist das Pionier-Framing der Kampagne.
//     Ein Seed echter Vereinsnamen wäre die Sorte erfundener Aktivität, die
//     Roadmap 2 gerade aufräumen soll.
//   - Idempotenter Upsert über name+season+gender+ageGroup (dasselbe Muster
//     wie seed-nrw-leagues.mjs) — mehrfacher Lauf erzeugt keine Dublette.
//   - KEIN Purge: Die Demo-Kreisligen (isDemo, 2025/26) bleiben unangetastet
//     (Roadmap 2 ist vertagt, Entscheidung Patrick 21.08.). Beide sind im
//     Dropdown über Saison und Namen unterscheidbar.
//
// Aufruf:  node scripts/seed-kreisliga-niers-echt.mjs --dry   (nur anzeigen)
//          node scripts/seed-kreisliga-niers-echt.mjs         (ausführen)
// DB über MONGODB_URI aus .env (Dev) bzw. der Server-Umgebung (Prod).
// ---------------------------------------------------------------------------
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const DRY = process.argv.includes("--dry");

// .env von Hand lesen (kein dotenv im Projekt): nur MONGODB_URI.
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
    const zeile = readFileSync(envPath, "utf8")
      .split("\n")
      .find((l) => l.startsWith("MONGODB_URI="));
    if (zeile) process.env.MONGODB_URI = zeile.slice("MONGODB_URI=".length).trim();
  } catch {
    /* unten sauber abbrechen */
  }
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI fehlt (in .env oder der Umgebung).");
  process.exit(1);
}

const LIGA = {
  // "KLH Niers" ist der TeamSL-Staffelname, den die Spieler des Kreises
  // kennen — er gehört in den Namen, damit die Liga im Dropdown sofort als
  // die echte erkennbar ist (die Demo heißt "1. Kreisliga Herren – Kreis Niers").
  name: "Kreisliga Herren (KLH Niers)",
  season: "2026/27",
  gender: "Herren",
  ageGroup: "Senioren",
  level: "Kreisliga",
  region: "Kreis Niers",
  bundesland: "Nordrhein-Westfalen",
};

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
console.log(`DB: ${db.databaseName}${DRY ? "  (DRY — es wird nichts geschrieben)" : ""}`);

const Leagues = db.collection("leagues");
const filter = {
  name: LIGA.name,
  season: LIGA.season,
  gender: LIGA.gender,
  ageGroup: LIGA.ageGroup,
};

const vorhanden = await Leagues.findOne(filter);
if (DRY) {
  console.log(
    `${vorhanden ? "↻ update" : "+ neu  "}  ${LIGA.name} · ${LIGA.region} · ${LIGA.season} [${LIGA.level}, official]`
  );
} else {
  const now = new Date();
  await Leagues.updateOne(
    filter,
    {
      $set: {
        bundesland: LIGA.bundesland,
        level: LIGA.level,
        gender: LIGA.gender,
        ageGroup: LIGA.ageGroup,
        region: LIGA.region,
        official: true,
        updatedAt: now,
      },
      $setOnInsert: {
        name: LIGA.name,
        season: LIGA.season,
        teams: [],
        matches: [],
        active: true,
        createdAt: now,
      },
    },
    { upsert: true }
  );
  console.log(`${vorhanden ? "aktualisiert" : "angelegt"}: ${LIGA.name} (${LIGA.season})`);
}

await mongoose.disconnect();
