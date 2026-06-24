// Einmal-Migration: alte Positions-Kürzel (PG/SG/SF/PF/C) → ausgeschrieben.
// Betrifft players.position, teams.rosterSlots[].position, tryouts.positions[].
// IDEMPOTENT (nur Kürzel werden ersetzt; ausgeschriebene/Rollen bleiben unberührt).
// Sicher auf Dev + Prod. Die App zeigt Altdaten ohnehin via positionLabel korrekt –
// diese Migration macht die gespeicherten Werte zusätzlich kanonisch.
//
// Aufruf:  node scripts/migrate-positions.mjs   ·   --dry für Vorschau
import { readFileSync } from "fs";
import mongoose from "mongoose";

function readEnv(key) {
  try {
    const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
    }
  } catch {}
  return "";
}

const uri = readEnv("MONGODB_URI");
if (!uri) {
  console.error("❌ MONGODB_URI fehlt in .env");
  process.exit(1);
}
const DRY = process.argv.includes("--dry");

const MAP = {
  PG: "Point Guard",
  SG: "Shooting Guard",
  SF: "Small Forward",
  PF: "Power Forward",
  C: "Center",
};

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log("⏳ Verbunden mit", mongoose.connection.name, DRY ? "(DRY-RUN)" : "");
const Players = mongoose.connection.collection("players");
const Teams = mongoose.connection.collection("teams");
const Tryouts = mongoose.connection.collection("tryouts");

let players = 0,
  slots = 0,
  tryouts = 0;

for (const [abbr, full] of Object.entries(MAP)) {
  // Spieler
  const pc = await Players.countDocuments({ position: abbr });
  if (pc && !DRY) await Players.updateMany({ position: abbr }, { $set: { position: full } });
  players += pc;

  // Roster-Slots (Array-Element)
  const sc = await Teams.countDocuments({ "rosterSlots.position": abbr });
  if (sc && !DRY)
    await Teams.updateMany(
      { "rosterSlots.position": abbr },
      { $set: { "rosterSlots.$[e].position": full } },
      { arrayFilters: [{ "e.position": abbr }] }
    );
  slots += sc;

  // Tryout-Positionen (String-Array)
  const tc = await Tryouts.countDocuments({ positions: abbr });
  if (tc && !DRY)
    await Tryouts.updateMany(
      { positions: abbr },
      { $set: { "positions.$[e]": full } },
      { arrayFilters: [{ e: abbr }] }
    );
  tryouts += tc;

  console.log(`  ${abbr} → ${full}: ${pc} Spieler, ${sc} Team(s) m. Slot, ${tc} Tryout(s)`);
}

console.log(
  `✅ ${DRY ? "(DRY) " : ""}Fertig: ${players} Spieler-Positionen, ${slots} Team-Slot-Treffer, ${tryouts} Tryout-Treffer kanonisiert.`
);
await mongoose.disconnect();
process.exit(0);
