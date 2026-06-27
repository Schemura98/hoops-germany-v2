// Entfernt die generischen Demo-Ligen "Regionalliga Süd" (Bayern) + ihre Spiele aus hoops_prod.
// Roadmap #6: Fake-Bayern-Einträge aus dem offiziellen NRW-Katalog entfernen.
//
// SICHERHEIT:
//   - Default = DRY-RUN (zeigt nur, was passieren würde, schreibt NICHTS).
//   - Schreiben nur mit  --apply
//   - Zielkriterium streng: name=/Regionalliga Süd/i  UND  bundesland=Bayern
//                           UND  official != true  UND  KEIN seedTag (schützt nrw-demo).
//   - Verschont alle offiziellen Katalog-Ligen und alle seedTag-Demos.
//   - Teams/Spieler werden NICHT gelöscht (nur die Liga-Hüllen + zugehörige Spiele).
//
// Aufruf:  node scripts/purge-demo-bayern-leagues.mjs            (Dry-Run)
//          node scripts/purge-demo-bayern-leagues.mjs --apply    (löscht)
import { readFileSync } from "fs";
import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");

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
const Any = (coll) => mongoose.model(coll, new mongoose.Schema({}, { strict: false, collection: coll }));

await mongoose.connect(prodUri, { serverSelectionTimeoutMS: 10000 });
console.log("DB:", mongoose.connection.name, "·", APPLY ? "🔴 APPLY (löscht!)" : "🟢 DRY-RUN (schreibt nichts)", "\n");

const Leagues = Any("leagues");
const Matches = Any("matches");
const Teams = Any("teams");

// Streng abgegrenzte Zielmenge
const targets = await Leagues.find({
  name: /Regionalliga Süd/i,
  bundesland: "Bayern",
  official: { $ne: true },
  $or: [{ seedTag: { $exists: false } }, { seedTag: null }, { seedTag: "" }],
}).lean();

if (!targets.length) {
  console.log("✓ Keine passenden Demo-Bayern-Ligen gefunden – nichts zu tun (bereits sauber).");
  await mongoose.disconnect();
  process.exit(0);
}

let totalMatches = 0;
const leagueIds = [];
for (const l of targets) {
  const matchIds = await Matches.find({ leagueId: l._id }).select("_id teamA teamB winningTeamPoints losingTeamPoints").lean();
  totalMatches += matchIds.length;
  leagueIds.push(l._id);
  // echte (nicht-Demo) Teams in dieser Liga zur Transparenz markieren
  const tdocs = await Teams.find({ _id: { $in: l.teams || [] } }).select("teamName seedTag").lean();
  const real = tdocs.filter((t) => !t.seedTag).map((t) => t.teamName);
  console.log(`[Ziel] "${l.name}" ${l.season} (Bayern) · _id=${l._id}`);
  console.log(`   → ${matchIds.length} Spiele werden gelöscht`);
  console.log(`   → Teams in teams[] (bleiben erhalten): ${tdocs.map((t) => t.teamName).join(", ") || "–"}`);
  if (real.length) console.log(`   ⚠️ darunter echte Test-Teams (nur Liga-Bezug entfällt, Team bleibt): ${real.join(", ")}`);
}

console.log(`\nZusammenfassung: ${targets.length} Liga(en) + ${totalMatches} Spiele.`);

if (!APPLY) {
  console.log("\n🟢 DRY-RUN – nichts geändert. Zum Ausführen erneut mit  --apply  starten.");
  await mongoose.disconnect();
  process.exit(0);
}

// --- APPLY ---
// Sicherheits-Backup (JSON) der zu löschenden Dokumente in den Scratchpad
import { writeFileSync, mkdirSync } from "fs";
const matchesToDelete = await Matches.find({ leagueId: { $in: leagueIds } }).lean();
const backup = { exportedFrom: mongoose.connection.name, leagues: targets, matches: matchesToDelete };
const backupDir = "C:/Users/schem/AppData/Local/Temp/claude/C--dev-hoops-germany-v2/4f9616ed-5635-471b-8bdd-e51f6b63d878/scratchpad";
try { mkdirSync(backupDir, { recursive: true }); } catch {}
const backupPath = `${backupDir}/prod-bayern-leagues-backup.json`;
writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");
console.log(`\n💾 Backup geschrieben: ${backupPath} (${targets.length} Ligen, ${matchesToDelete.length} Spiele)`);

const mRes = await Matches.deleteMany({ leagueId: { $in: leagueIds } });
const lRes = await Leagues.deleteMany({ _id: { $in: leagueIds } });
console.log(`\n🔴 Gelöscht: ${mRes.deletedCount} Spiele, ${lRes.deletedCount} Ligen.`);

// Verifikation
const remain = await Leagues.countDocuments({ name: /Regionalliga Süd/i, bundesland: "Bayern" });
const total = await Leagues.countDocuments({});
console.log(`Verifikation: verbleibende Bayern-„Regionalliga Süd": ${remain} · Katalog gesamt jetzt: ${total}`);

await mongoose.disconnect();
console.log("\n✓ fertig");
