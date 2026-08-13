// Entfernt alle Daten, die fuer unter 16-Jaehrige gedacht sind.
// Entscheidung Patrick, 13.08.2026: "Die Website ist wirklich erst ab 16 gedacht."
//
// Betroffen: Ligen mit ageGroup U16/U14/U12/U10, die Teams darin, und
// Beispielprofile mit Alter < 16. Echte Profile sind KEINE dabei (vorher
// geprueft) - faende das Skript welche, bricht es ab.
//
//   node u16-loeschen.mjs        Probelauf
//   node u16-loeschen.mjs --weg  loeschen
import mongoose from "mongoose";

const WEG = process.argv.includes("--weg");
const JUNG = ["U16", "U14", "U12", "U10"];

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
console.log("Datenbank:", db.name, WEG ? "· LOESCHEN" : "· Probelauf", "\n");

const Leagues = db.collection("leagues");
const Teams = db.collection("teams");
const Matches = db.collection("matches");
const Players = db.collection("players");
const Posts = db.collection("posts");

// --- 1. Sicherung: keine echten Minderjaehrigen betroffen ---------------
const echtJung = await Players.countDocuments({
  age: { $lt: 16 },
  isDemo: { $ne: true },
  isInternal: { $ne: true },
});
if (echtJung > 0) {
  console.error(`ABBRUCH: ${echtJung} ECHTE Profile mit Alter < 16. Das ist kein`);
  console.error("Aufraeumen mehr, sondern ein Fall fuer Patrick und Nora.");
  await mongoose.disconnect();
  process.exit(1);
}
console.log("✓ Keine echten Profile unter 16 betroffen.\n");

// --- 2. Ligen ------------------------------------------------------------
const ligen = await Leagues.find({ ageGroup: { $in: JUNG } }).toArray();
const ligaIds = ligen.map((l) => l._id);
console.log(`Ligen (${JUNG.join("/")}): ${ligen.length}`);
for (const l of ligen) console.log(`   ${l.name} [${l.gender} ${l.ageGroup}]${l.isDemo ? " DEMO" : ""}`);

// --- 3. Teams in diesen Ligen -------------------------------------------
const teams = await Teams.find({ leagueId: { $in: ligaIds } }).toArray();
const teamIds = teams.map((t) => t._id);
const echteTeams = teams.filter((t) => !t.isDemo && !t.isInternal);
console.log(`\nTeams in diesen Ligen: ${teams.length} (davon echt: ${echteTeams.length})`);
for (const t of teams) console.log(`   ${t.teamName}${t.isDemo ? " [DEMO]" : ""}`);
if (echteTeams.length > 0) {
  console.error("\nABBRUCH: echte Teams betroffen. Erst mit Patrick klaeren.");
  await mongoose.disconnect();
  process.exit(1);
}

// --- 4. Spieler dieser Teams + Beispielprofile unter 16 ------------------
const spielerImTeam = await Players.find({ teamId: { $in: teamIds } })
  .project({ isDemo: 1, isInternal: 1, age: 1 })
  .toArray();
const jungeDemo = await Players.find({ age: { $lt: 16 }, isDemo: true })
  .project({ _id: 1 })
  .toArray();

const zuLoeschendeSpieler = [
  ...new Set([
    ...spielerImTeam.filter((p) => p.isDemo).map((p) => String(p._id)),
    ...jungeDemo.map((p) => String(p._id)),
  ]),
].map((id) => new mongoose.Types.ObjectId(id));

const echteImTeam = spielerImTeam.filter((p) => !p.isDemo && !p.isInternal);
console.log(`\nSpieler in diesen Teams: ${spielerImTeam.length} (davon echt: ${echteImTeam.length})`);
console.log(`Beispielprofile mit Alter < 16: ${jungeDemo.length}`);
console.log(`Zu loeschende Profile (Vereinigung, nur Beispieldaten): ${zuLoeschendeSpieler.length}`);
if (echteImTeam.length > 0) {
  console.error("\nABBRUCH: echte Spieler in diesen Teams. Erst mit Patrick klaeren.");
  await mongoose.disconnect();
  process.exit(1);
}

const spiele = await Matches.countDocuments({
  $or: [{ leagueId: { $in: ligaIds } }, { teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }],
});
const posts = await Posts.countDocuments({ player: { $in: zuLoeschendeSpieler } });
console.log(`Spiele dieser Ligen/Teams: ${spiele}`);
console.log(`Beitraege dieser Profile: ${posts}`);

if (!WEG) {
  console.log("\n(Probelauf - mit --weg wirklich loeschen)");
  await mongoose.disconnect();
  process.exit(0);
}

// --- 5. Loeschen ---------------------------------------------------------
const r1 = await Matches.deleteMany({
  $or: [{ leagueId: { $in: ligaIds } }, { teamA: { $in: teamIds } }, { teamB: { $in: teamIds } }],
});
const r2 = await Posts.deleteMany({ player: { $in: zuLoeschendeSpieler } });
const r3 = await Players.deleteMany({ _id: { $in: zuLoeschendeSpieler } });
const r4 = await Teams.deleteMany({ _id: { $in: teamIds } });
const r5 = await Leagues.deleteMany({ _id: { $in: ligaIds } });

// Verweise aufraeumen, damit keine Waisen bleiben.
await Players.updateMany({ teamId: { $in: teamIds } }, { $set: { teamId: null } });
await Players.updateMany(
  {},
  { $pull: { followers: { $in: zuLoeschendeSpieler }, following: { $in: zuLoeschendeSpieler } } },
);
await Teams.updateMany({}, { $pull: { followers: { $in: zuLoeschendeSpieler } } });

console.log(`\nGeloescht: ${r5.deletedCount} Ligen, ${r4.deletedCount} Teams, ${r3.deletedCount} Profile, ${r1.deletedCount} Spiele, ${r2.deletedCount} Beitraege`);

const rest = await Leagues.countDocuments({ ageGroup: { $in: JUNG } });
console.log(`Kontrolle: verbleibende ${JUNG.join("/")}-Ligen: ${rest}`);

await mongoose.disconnect();
