// Prueft, dass ein beanspruchter Kaderplatz beim Verlassen des Teams
// freigegeben wird - und dass sonst nichts kaputtgeht.
//
// Der wichtigere Teil ist wieder der Normalfall: Ein Fix, der Plaetze freigibt,
// die bleiben sollten, waere schlimmer als die Verwaisung.
//
// Aufruf: node tmp/slotfreigabe-test.mjs   (Dev-Server auf 3000 noetig)
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
  console.log(`${ok ? "  ok  " : "  FEHL"} ${name.padEnd(50)} erwartet ${erwartet}, war ${ist}`);
}

await mongoose.connect(readEnv("MONGODB_URI"));
const db = mongoose.connection;
if (db.name !== "hoopsgermany") {
  console.error("ABBRUCH: nicht die Dev-DB.");
  process.exit(1);
}
const Teams = db.collection("teams");
const Players = db.collection("players");

const login = await post("/api/player/playerlogin", {
  email: "max@test.de",
  password: "test123",
});
const token = login.body?.token;
const info = await post("/api/team/fetchinfo", { token });
const teamId = info.body?.team?._id;

// Ein Mitglied des Teams, das NICHT der Admin ist.
const mitglied = await Players.findOne({
  teamId: new mongoose.Types.ObjectId(teamId),
  isTeamAdmin: { $ne: true },
});
if (!mitglied) {
  console.error("Kein entfernbares Mitglied gefunden.");
  process.exit(1);
}
console.log(`Team ${teamId} · Mitglied ${mitglied.firstName} ${mitglied.lastName}\n`);

// Ausgangszustand sichern.
const teamVorher = await Teams.findOne({ _id: new mongoose.Types.ObjectId(teamId) });
const slotsVorher = JSON.parse(JSON.stringify(teamVorher.rosterSlots || []));

// Einen beanspruchten Kaderplatz herstellen.
await Teams.updateOne(
  { _id: new mongoose.Types.ObjectId(teamId) },
  {
    $push: {
      rosterSlots: {
        _id: new mongoose.Types.ObjectId(),
        name: "Prüfplatz",
        position: "PG",
        claimedBy: mitglied._id,
        claimToken: "pruef-token-123",
        status: "confirmed",
      },
    },
  },
);
// Zweiter Platz eines ANDEREN Spielers - der muss unberührt bleiben.
const anderer = await Players.findOne({
  teamId: new mongoose.Types.ObjectId(teamId),
  _id: { $ne: mitglied._id },
});
await Teams.updateOne(
  { _id: new mongoose.Types.ObjectId(teamId) },
  {
    $push: {
      rosterSlots: {
        _id: new mongoose.Types.ObjectId(),
        name: "Prüfplatz zwei",
        position: "SG",
        claimedBy: anderer?._id || null,
        status: "confirmed",
      },
    },
  },
);

const zaehle = async () => {
  const t = await Teams.findOne({ _id: new mongoose.Types.ObjectId(teamId) });
  return {
    meiner: (t.rosterSlots || []).filter(
      (s) => String(s.claimedBy || "") === String(mitglied._id),
    ).length,
    fremder: (t.rosterSlots || []).filter(
      (s) => anderer && String(s.claimedBy || "") === String(anderer._id),
    ).length,
  };
};

const vor = await zaehle();
pruefe("Vorbereitung: Platz des Mitglieds vorhanden", 1, vor.meiner);
pruefe("Vorbereitung: Platz des anderen vorhanden", 1, vor.fremder);

// Entfernen über die echte Route.
const weg = await post("/api/team/remove-member", { token, playerId: String(mitglied._id) });
pruefe("remove-member antwortet", 200, weg.status);

const nach = await zaehle();
pruefe("Platz des Entfernten ist freigegeben", 0, nach.meiner);
pruefe("Platz des anderen ist UNBERÜHRT", 1, nach.fremder);

// Kais Fund: Bleibt der claimToken stehen, ist der alte Einladungslink wieder
// gueltig - der Entfernte koennte sich ohne Genehmigung selbst zurueckholen.
const tNach = await Teams.findOne({ _id: new mongoose.Types.ObjectId(teamId) });
const restToken = (tNach.rosterSlots || []).filter((s) => s.claimToken === "pruef-token-123").length;
pruefe("claimToken ist mit geloescht (kein Wieder-Beitritt)", 0, restToken);

// Zustand vollständig wiederherstellen.
await Teams.updateOne(
  { _id: new mongoose.Types.ObjectId(teamId) },
  { $set: { rosterSlots: slotsVorher } },
);
await Players.updateOne(
  { _id: mitglied._id },
  { $set: { teamId: new mongoose.Types.ObjectId(teamId) } },
);
const wieder = await Players.findOne({ _id: mitglied._id });
pruefe("Wiederherstellung: Mitglied wieder im Team", teamId, String(wieder.teamId));

await mongoose.disconnect();
console.log(fehler === 0 ? "\nAlles wie erwartet." : `\n${fehler} Abweichung(en).`);
process.exit(fehler === 0 ? 0 : 1);
