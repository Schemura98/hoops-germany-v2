// Fuehrt die vier NEU verdrahteten Teamwechsel-Wege wirklich aus und prueft,
// dass der Kaderplatz des alten Vereins freigegeben wird (claimedBy, status,
// claimToken) - und dass der frisch beanspruchte Platz des NEUEN Vereins
// stehen bleibt. Zusaetzlich End-to-End-Beleg fuer Kais claimToken-Fund:
// der alte Einladungslink ist nach der Freigabe tot (404).
//
// Additiv & umkehrbar: Ausgangszustand wird per Voll-Snapshot (replaceOne)
// wiederhergestellt; erzeugte TransferEvents und das Testteam werden geloescht.
//
// Aufruf: node tmp/slotfreigabe-vierwege-test.mjs   (Dev-Server auf 3000 noetig)
import { readFileSync } from "fs";
import mongoose from "mongoose";

const BASIS = "http://localhost:3000";

function readEnv(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const zeile of txt.split(/\r?\n/)) {
    const t = zeile.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i !== -1 && t.slice(0, i).trim() === key) return t.slice(i + 1).trim();
  }
  return "";
}

async function post(pfad, daten) {
  const r = await fetch(BASIS + pfad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(daten),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
}

let fehler = 0;
function pruefe(name, erwartet, ist) {
  const ok = String(erwartet) === String(ist);
  if (!ok) fehler++;
  console.log(`${ok ? "  ok  " : "  FEHL"} ${name.padEnd(58)} erwartet ${erwartet}, war ${ist}`);
}

await mongoose.connect(readEnv("MONGODB_URI"));
const db = mongoose.connection;
if (db.name !== "hoopsgermany") {
  console.error("ABBRUCH: nicht die Dev-DB.");
  process.exit(1);
}
const Teams = db.collection("teams");
const Players = db.collection("players");
const Transfers = db.collection("transferevents");
const start = new Date();

// ---- Akteure ----------------------------------------------------------------
// P: normales Mitglied (kein Team-Admin, kein Super-Admin) mit test123-Login.
const P = await Players.findOne({
  email: /@test\.de$/,
  teamId: { $ne: null },
  isTeamAdmin: { $ne: true },
  isSuperAdmin: { $ne: true },
  password: { $ne: null },
});
if (!P) { console.error("Kein geeigneter Testspieler."); process.exit(1); }
const teamA = await Teams.findOne({ _id: P.teamId });
const teamB = await Teams.findOne({ _id: { $ne: teamA._id }, approved: { $ne: false } });
if (!teamA || !teamB) { console.error("Teams fehlen."); process.exit(1); }
console.log(`P = ${P.firstName} ${P.lastName} (${P.email})`);
console.log(`A = ${teamA.teamName} (${teamA._id})  ->  B = ${teamB.teamName} (${teamB._id})\n`);

const login = await post("/api/player/playerlogin", { email: P.email, password: "test123" });
const pToken = login.body?.token;
if (!pToken) { console.error("Spieler-Login fehlgeschlagen."); process.exit(1); }
let adm = await post("/api/admin/adminlogin", { username: "admin", password: "geheim1234" });
if (!adm.body?.token) adm = await post("/api/admin/adminlogin", { username: "patrick", password: "test123" });
const aToken = adm.body?.token;

// ---- Voll-Snapshots ---------------------------------------------------------
const rawP = await Players.findOne({ _id: P._id });
const rawA = await Teams.findOne({ _id: teamA._id });
const rawB = await Teams.findOne({ _id: teamB._id });
// Benachrichtigungs-Snapshot aller potenziellen Empfaenger (Super-Admins,
// Admins/Co-Admins von B).
const empfaenger = await Players.find({
  $or: [
    { isSuperAdmin: true },
    { teamAdminOf: teamB._id },
    { _id: rawB.adminPlayerId || new mongoose.Types.ObjectId() },
  ],
}).project({ notifications: 1 }).toArray();

async function restore({ mitB = true } = {}) {
  await Players.replaceOne({ _id: P._id }, rawP);
  await Teams.replaceOne({ _id: teamA._id }, rawA);
  if (mitB) await Teams.replaceOne({ _id: teamB._id }, rawB);
}

const SLOT_A_TOKEN = "kai-vierwege-a-token";
async function slotInAAnlegen() {
  await Teams.updateOne(
    { _id: teamA._id },
    { $push: { rosterSlots: {
      _id: new mongoose.Types.ObjectId(),
      name: "Kai Pruefplatz A", position: "PG",
      claimedBy: P._id, claimToken: SLOT_A_TOKEN, status: "confirmed",
    } } },
  );
}
async function slotAStatus() {
  const t = await Teams.findOne({ _id: teamA._id });
  const s = (t.rosterSlots || []).find((x) => x.name === "Kai Pruefplatz A");
  return s
    ? { claimedBy: String(s.claimedBy || "null"), status: s.status, token: String(s.claimToken ?? "null") }
    : null;
}

// ---- Weg 5: respond-invite --------------------------------------------------
console.log("Weg 5: respond-invite (Direkt-Einladung angenommen)");
await slotInAAnlegen();
await Teams.updateOne({ _id: teamB._id }, { $addToSet: { invitedPlayers: P._id } });
const w5 = await post("/api/team/respond-invite", { token: pToken, teamId: String(teamB._id), accept: true });
pruefe("respond-invite antwortet", 200, w5.status);
let s = await slotAStatus();
pruefe("A-Platz: claimedBy geleert", "null", s?.claimedBy);
pruefe("A-Platz: status empty", "empty", s?.status);
pruefe("A-Platz: claimToken geloescht", "null", s?.token);
let pNach = await Players.findOne({ _id: P._id });
pruefe("P ist jetzt in B", String(teamB._id), String(pNach.teamId));
await restore();

// ---- Weg 6: request-claim ---------------------------------------------------
console.log("\nWeg 6: request-claim (Claim-Link, Direktbestaetigung)");
await slotInAAnlegen();
const SLOT_B_TOKEN = "kai-vierwege-b-token";
const slotBId = new mongoose.Types.ObjectId();
await Teams.updateOne(
  { _id: teamB._id },
  { $push: { rosterSlots: {
    _id: slotBId, name: "Kai Pruefplatz B", position: "SG",
    claimedBy: null, claimToken: SLOT_B_TOKEN, status: "empty",
  } } },
);
const w6 = await post("/api/team/roster/request-claim", { token: pToken, claimToken: SLOT_B_TOKEN });
pruefe("request-claim antwortet", 200, w6.status);
s = await slotAStatus();
pruefe("A-Platz: claimedBy geleert", "null", s?.claimedBy);
pruefe("A-Platz: status empty", "empty", s?.status);
pruefe("A-Platz: claimToken geloescht", "null", s?.token);
const bNach = await Teams.findOne({ _id: teamB._id });
const slotB = (bNach.rosterSlots || []).find((x) => String(x._id) === String(slotBId));
pruefe("B-Platz (frisch beansprucht) bleibt confirmed", "confirmed", slotB?.status);
pruefe("B-Platz gehoert P", String(P._id), String(slotB?.claimedBy));
// End-to-End-Beleg fuer den claimToken-Fund: alter A-Link ist tot.
const tot = await post("/api/team/roster/request-claim", { token: pToken, claimToken: SLOT_A_TOKEN });
pruefe("alter A-Einladungslink ist tot (404)", 404, tot.status);
await restore();

// ---- Weg 7: team/create -----------------------------------------------------
console.log("\nWeg 7: team/create (Mitglied gruendet eigenes Team)");
await slotInAAnlegen();
const neuerName = `Kai Pruefteam ${Date.now()}`;
const w7 = await post("/api/team/create", { token: pToken, teamName: neuerName });
pruefe("team/create antwortet", 201, w7.status);
const neuesTeamId = w7.body?.team?._id;
s = await slotAStatus();
pruefe("A-Platz: claimedBy geleert", "null", s?.claimedBy);
pruefe("A-Platz: status empty", "empty", s?.status);
pruefe("A-Platz: claimToken geloescht", "null", s?.token);
pNach = await Players.findOne({ _id: P._id });
pruefe("P ist Admin des neuen Teams", String(neuesTeamId), String(pNach.teamAdminOf));
if (neuesTeamId) await Teams.deleteOne({ _id: new mongoose.Types.ObjectId(neuesTeamId) });
await restore({ mitB: false });

// ---- Weg 8: admin/setteamadmin ---------------------------------------------
console.log("\nWeg 8: admin/setteamadmin (Super-Admin setzt Team-Admin)");
if (!aToken) {
  console.log("  UEBERSPRUNGEN: kein Admin-Login moeglich.");
} else {
  await slotInAAnlegen();
  const w8 = await post("/api/admin/setteamadmin", {
    token: aToken, playerId: String(P._id), teamId: String(teamB._id),
  });
  pruefe("setteamadmin antwortet", 200, w8.status);
  s = await slotAStatus();
  pruefe("A-Platz: claimedBy geleert", "null", s?.claimedBy);
  pruefe("A-Platz: status empty", "empty", s?.status);
  pruefe("A-Platz: claimToken geloescht", "null", s?.token);
  pNach = await Players.findOne({ _id: P._id });
  pruefe("P ist jetzt in B", String(teamB._id), String(pNach.teamId));
  await restore();
}

// ---- Endgueltige Wiederherstellung ------------------------------------------
for (const e of empfaenger) {
  await Players.updateOne({ _id: e._id }, { $set: { notifications: e.notifications || [] } });
}
const geloescht = await Transfers.deleteMany({ player: P._id, createdAt: { $gte: start } });
console.log(`\nAufgeraeumt: ${geloescht.deletedCount} TransferEvent(s) entfernt, Testteam geloescht.`);

// Kontrolle: Ausgangszustand
const endP = await Players.findOne({ _id: P._id });
const endA = await Teams.findOne({ _id: teamA._id });
const endB = await Teams.findOne({ _id: teamB._id });
pruefe("Ende: P wieder in A", String(teamA._id), String(endP.teamId));
pruefe("Ende: A-Slots wie zuvor", (rawA.rosterSlots || []).length, (endA.rosterSlots || []).length);
pruefe("Ende: B-Slots wie zuvor", (rawB.rosterSlots || []).length, (endB.rosterSlots || []).length);
pruefe("Ende: B-Admin unveraendert", String(rawB.adminPlayerId || "null"), String(endB.adminPlayerId || "null"));

await mongoose.disconnect();
console.log(fehler === 0 ? "\nAlles wie erwartet." : `\n${fehler} Abweichung(en).`);
process.exit(fehler === 0 ? 0 : 1);
