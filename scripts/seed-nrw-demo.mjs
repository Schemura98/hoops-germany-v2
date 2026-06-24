// NRW-Demo-Environment für die Testphase. ADDITIV + getaggt (seedTag:"nrw-demo"):
// fasst echte Tester-Daten NICHT an und ist sauber wieder entfernbar.
//   node scripts/seed-nrw-demo.mjs           → Demo-Daten (neu) anlegen (löscht vorher nur eigene)
//   node scripts/seed-nrw-demo.mjs --purge    → nur Demo-Daten entfernen (nach der Testphase)
// Demo-Team-Admin-Login (für die Anfragen/Bewerber-Sicht):  demo.coach@nrw-demo.de / test123
import { readFileSync } from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
if (!uri) { console.error("❌ MONGODB_URI fehlt in .env"); process.exit(1); }

const PURGE = process.argv.includes("--purge");
const TAG = "nrw-demo";
const oid = () => new mongoose.Types.ObjectId();
const slugify = (s) => String(s).toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log("⏳ Verbunden mit", mongoose.connection.name, PURGE ? "(PURGE)" : "");
const db = mongoose.connection;
const Teams = db.collection("teams");
const Players = db.collection("players");
const Matches = db.collection("matches");
const Posts = db.collection("posts");
const Leagues = db.collection("leagues");
const Tryouts = db.collection("tryouts");
const TransferEvents = db.collection("transferevents");

// ---------- Cleanup: nur eigene (getaggte) Demo-Daten ----------
const demoTeams = await Teams.find({ seedTag: TAG }).project({ _id: 1 }).toArray();
const demoTeamIds = demoTeams.map((t) => t._id);
const demoMatches = await Matches.find({ seedTag: TAG }).project({ _id: 1 }).toArray();
const demoMatchIds = demoMatches.map((m) => m._id);
if (demoTeamIds.length)
  await Leagues.updateMany({}, { $pull: { teams: { $in: demoTeamIds } } });
if (demoMatchIds.length)
  await Leagues.updateMany({}, { $pull: { matches: { $in: demoMatchIds } } });
for (const c of [Teams, Players, Matches, Posts, Tryouts, TransferEvents])
  await c.deleteMany({ seedTag: TAG });
console.log(`🧹 Alte Demo-Daten entfernt (${demoTeamIds.length} Teams, ${demoMatchIds.length} Spiele …)`);

if (PURGE) {
  console.log("✅ Purge abgeschlossen – nur Demo-Daten (seedTag) entfernt, echte Daten unberührt.");
  await mongoose.disconnect();
  process.exit(0);
}

const pw = await bcrypt.hash("test123", 10);
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

// ---------- Ziel-Ligen aus dem echten NRW-Katalog ----------
const findLeague = (name) =>
  Leagues.findOne({ name, gender: "Herren", season: "2025/26", official: true, bundesland: "Nordrhein-Westfalen" });
const oberliga = await findLeague("Oberliga 1");
const landesliga = await findLeague("Landesliga 2");
const bezirksliga = await findLeague("Bezirksliga 1");
if (!oberliga) { console.error("❌ NRW-Liga 'Oberliga 1' nicht gefunden – erst seed-nrw-leagues laufen lassen."); await mongoose.disconnect(); process.exit(1); }

// ---------- Teams (fiktiv, NRW-Städte) ----------
const teamDefs = [
  { name: "Köln Comets",        region: "Köln",        league: oberliga,    recruiting: ["Point Guard", "Coach"], note: "Suchen einen Aufbauspieler + Co-Trainer für die Rückrunde. Training Di/Do." },
  { name: "Düsseldorf Dribblers", region: "Düsseldorf", league: oberliga },
  { name: "Essen Energy",       region: "Essen",       league: oberliga },
  { name: "Dortmund Dunkers",   region: "Dortmund",    league: oberliga },
  { name: "Münster Magic",      region: "Münster",     league: landesliga,  recruiting: ["Center", "Power Forward"], note: "Großgewachsene Spieler willkommen – wir wollen aufsteigen." },
  { name: "Bochum Bisons",      region: "Bochum",      league: bezirksliga, recruiting: ["Shooting Guard", "Manager"], note: "Junges Team sucht Verstärkung und Orga-Talent." },
];
const teams = teamDefs.map((t) => ({
  _id: oid(), seedTag: TAG,
  teamName: t.name, region: t.region, bundesland: "Nordrhein-Westfalen",
  about: `${t.name} – Amateur-Basketball aus ${t.region}. (Demo-Team der Testphase)`,
  slug: slugify(t.name), logo: null, banner: null,
  followers: [], rosterSlots: [],
  leagueId: t.league?._id || null,
  recruiting: !!t.recruiting,
  recruitingPositions: t.recruiting || [],
  recruitingNote: t.note || "",
  createdAt: now, updatedAt: now,
}));
await Teams.insertMany(teams);

// ---------- Spieler ----------
const POS = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"];
const NAT = ["Deutschland","Deutschland","Deutschland","USA","Serbien","Spanien"];
const FN = ["Jan","Tim","Leon","Luca","Nico","Ben","Paul","Finn","Jonas","Noah","Elias","Moritz","Kevin","Marvin","Dennis","Sami","Aaron","Henri","Til","Mats"];
const LN = ["Schäfer","Bauer","Krämer","Vogel","Huber","Peters","Sommer","Brandt","Engel","Arndt","Busch","Kraft","Otto","Seidel","Hahn","Albrecht","Walter","Ziegler","Kuhn","Bock"];
const NRW_CITIES = ["Köln","Düsseldorf","Essen","Dortmund","Münster","Bochum","Aachen","Bonn","Duisburg","Wuppertal","Bielefeld","Mönchengladbach"];

const players = [];
let idx = 0;
const mkPlayer = (over) => {
  idx++;
  const firstName = over.firstName || FN[idx % FN.length];
  const lastName = over.lastName || LN[idx % LN.length];
  const base = {
    _id: oid(), seedTag: TAG, firstName, lastName,
    email: over.email || `demo${idx}@nrw-demo.de`,
    slug: slugify(`${firstName}-${lastName}-d${idx}`),
    password: pw, status: "active",
    teamId: null, position: pick(POS),
    height: `${rnd(180,208)} cm`, weight: `${rnd(78,108)} kg`, age: rnd(18,33),
    nationality: pick(NAT), hometown: "Köln", bundesland: "Nordrhein-Westfalen",
    aboutPlayer: "Demo-Profil der Testphase – leidenschaftlicher Basketballer.",
    followers: [], following: [], followingTeams: [], notifications: [],
    transferStatus: "nicht_verfuegbar", isTeamAdmin: false, teamAdminOf: null, isSuperAdmin: false,
    createdAt: now, updatedAt: now,
  };
  const p = { ...base, ...over };
  players.push(p);
  return p;
};

// Team-Spieler: 4 je Team, erster ist Admin. Köln Comets-Admin ist der Demo-Coach.
teams.forEach((team, ti) => {
  for (let i = 0; i < 4; i++) {
    const isAdmin = i === 0;
    const isDemoCoach = ti === 0 && i === 0;
    mkPlayer({
      ...(isDemoCoach ? { firstName: "Chris", lastName: "Trainer", email: "demo.coach@nrw-demo.de", position: "Coach" } : { position: POS[i % POS.length] }),
      teamId: team._id,
      hometown: team.region,
      isTeamAdmin: isAdmin,
      teamAdminOf: isAdmin ? team._id : null,
      // ein paar Team-Spieler zusätzlich transferbereit (zeigt: auch gebundene Spieler im Markt)
      ...(ti < 4 && i === 3 ? { transferStatus: "verfuegbar", preferredLeague: "Regionalliga", transferNote: "Würde mich gerne höherklassig versuchen." } : {}),
    });
  }
});

// Free Agents (Transfermarkt: "Spieler suchen Verein"), inkl. Coach + Manager
const faDefs = [
  { firstName: "Deniz", lastName: "Yilmaz", position: "Point Guard", city: "Köln", note: "Schneller Aufbau, sucht ambitioniertes Team." },
  { firstName: "Robin", lastName: "Faber", position: "Shooting Guard", city: "Düsseldorf", note: "Wurfstark von außen." },
  { firstName: "Malte", lastName: "Görres", position: "Center", city: "Essen", note: "Reboundmaschine, defensivstark." },
  { firstName: "Aaron", lastName: "Beck", position: "Small Forward", city: "Dortmund", note: "Flexibler Flügel, gerne Umkreis Ruhrgebiet." },
  { firstName: "Tobias", lastName: "Reuter", position: "Coach", city: "Münster", note: "Lizenzierter Trainer sucht neue Aufgabe." },
  { firstName: "Sarah", lastName: "Wand", position: "Manager", city: "Bonn", note: "Erfahrene Team-Managerin, Orga & Sponsoring." },
];
const freeAgents = faDefs.map((f) =>
  mkPlayer({
    firstName: f.firstName, lastName: f.lastName, position: f.position,
    email: `${slugify(f.firstName + "-" + f.lastName)}@nrw-demo.de`,
    hometown: f.city, transferStatus: "verfuegbar",
    preferredLeague: pick(["Regionalliga", "Oberliga", "Landesliga", "Bezirksliga"]),
    transferNote: f.note,
  })
);
await Players.insertMany(players);

// Team-Admins setzen
for (const team of teams) {
  const admin = players.find((p) => p.teamId && p.teamId.equals(team._id) && p.isTeamAdmin);
  if (admin) await Teams.updateOne({ _id: team._id }, { $set: { adminPlayerId: admin._id } });
}
// Teams in ihre Liga aufnehmen
for (const team of teams)
  if (team.leagueId) await Leagues.updateOne({ _id: team.leagueId }, { $addToSet: { teams: team._id } });

// ---------- Beitrittsanfragen an Köln Comets (+ Notification an Demo-Coach) ----------
const koeln = teams[0];
const demoCoach = players.find((p) => p.email === "demo.coach@nrw-demo.de");
const requesters = freeAgents.slice(0, 3);
for (const r of requesters) {
  await Players.updateOne({ _id: r._id }, { $set: { teamJoinRequest: koeln._id } });
  await Players.updateOne(
    { _id: demoCoach._id },
    { $push: { notifications: { _id: oid(), type: "join_request", fromPlayerId: r._id, teamId: koeln._id, teamName: koeln.teamName, teamSlug: koeln.slug, message: `${r.firstName} ${r.lastName} möchte ${koeln.teamName} beitreten.`, read: false, createdAt: daysAgo(rnd(0, 5)) } } }
  );
}

// ---------- Tryout (Köln Comets) mit Bewerbern ----------
const tryoutApplicants = freeAgents.slice(2, 6); // teils Überschneidung ok
await Tryouts.insertOne({
  _id: oid(), seedTag: TAG, teamId: koeln._id,
  date: new Date(now.getTime() + 9 * 86400000), location: "Sporthalle Köln-Mitte",
  positions: ["Point Guard", "Shooting Guard"],
  description: "Offenes Probetraining – bring Hallenschuhe mit. Wir freuen uns auf euch!",
  status: "active",
  applicants: tryoutApplicants.map((a) => ({ playerId: a._id, appliedAt: daysAgo(rnd(0, 4)) })),
  createdAt: now, updatedAt: now,
});

// ---------- Spiele: Round-Robin der 4 Oberliga-Teams (+ Box-Scores) ----------
const obTeams = teams.slice(0, 4);
const playersByTeam = (tid) => players.filter((p) => p.teamId && p.teamId.equals(tid) && p.position !== "Coach" && p.position !== "Manager");
const matchDocs = [];
let dc = 35;
for (let a = 0; a < obTeams.length; a++)
  for (let b = a + 1; b < obTeams.length; b++) {
    const tA = obTeams[a], tB = obTeams[b], date = daysAgo(dc); dc -= 4;
    const mk = (team) => playersByTeam(team._id).map((p) => ({ _id: oid(), player: p._id, team: team._id, points: rnd(2, 26), assists: rnd(0, 8), rebounds: rnd(1, 11), didNotPlay: false }));
    const sA = mk(tA), sB = mk(tB);
    const sum = (x) => x.reduce((s, y) => s + y.points, 0);
    let pA = sum(sA), pB = sum(sB); if (pA === pB) pA += 3;
    matchDocs.push({
      _id: oid(), seedTag: TAG, teamA: tA._id, teamB: tB._id, date, location: `${tA.region} Arena`,
      leagueId: oberliga._id, status: "completed", resultStatus: "confirmed", stage: "Hauptrunde",
      winningTeam: pA > pB ? tA._id : tB._id, winningTeamPoints: Math.max(pA, pB), losingTeamPoints: Math.min(pA, pB),
      playerStats: [...sA, ...sB],
      teamAResult: { ownPoints: pA, opponentPoints: pB, submittedBy: null, submittedAt: date },
      teamBResult: { ownPoints: pB, opponentPoints: pA, submittedBy: null, submittedAt: date },
      notifiedPendingResult: false, createdAt: date, updatedAt: date,
    });
  }
// 2 anstehende Spiele
for (let i = 0; i < 2; i++)
  matchDocs.push({
    _id: oid(), seedTag: TAG, teamA: obTeams[i]._id, teamB: obTeams[(i + 2) % 4]._id,
    date: new Date(now.getTime() + (i + 4) * 86400000), location: `${obTeams[i].region} Arena`,
    leagueId: oberliga._id, status: "scheduled", resultStatus: "pending", stage: "Hauptrunde",
    playerStats: [], notifiedPendingResult: false, createdAt: now, updatedAt: now,
  });
await Matches.insertMany(matchDocs);
await Leagues.updateOne({ _id: oberliga._id }, { $addToSet: { matches: { $each: matchDocs.map((m) => m._id) } } });

// ---------- Follower-Beziehungen ----------
for (const p of players) {
  const others = players.filter((x) => !x._id.equals(p._id));
  const n = rnd(1, 5); const chosen = new Set();
  while (chosen.size < n && chosen.size < others.length) chosen.add(pick(others)._id.toString());
  for (const id of chosen) {
    await Players.updateOne({ _id: p._id }, { $addToSet: { following: new mongoose.Types.ObjectId(id) } });
    await Players.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $addToSet: { followers: p._id } });
  }
}
// ein paar Team-Follower
for (const t of teams) {
  for (const p of players.filter(() => Math.random() < 0.25)) {
    await Teams.updateOne({ _id: t._id }, { $addToSet: { followers: p._id } });
    await Players.updateOne({ _id: p._id }, { $addToSet: { followingTeams: t._id } });
  }
}

// ---------- Transfer-Events ----------
const tev = [];
for (const r of requesters)
  tev.push({ _id: oid(), seedTag: TAG, player: r._id, fromTeam: null, toTeam: koeln._id, type: "join_request", createdAt: daysAgo(rnd(0, 5)), updatedAt: now });
await TransferEvents.insertMany(tev);

// ---------- Posts ----------
const texts = [
  "Wichtiger Heimsieg am Wochenende! Danke an alle, die da waren 🏀🔥",
  "Probetraining am nächsten Mittwoch – kommt vorbei!",
  "Harte Einheit heute, aber es lohnt sich. 💪",
  "Wir suchen Verstärkung – meldet euch über den Transfermarkt!",
  "Was für ein Comeback im letzten Viertel. Unfassbar.",
  "Neue Saison in der NRW-Liga, neue Ziele.",
  "Defense gewinnt Spiele – daran arbeiten wir.",
  "Throwback ans Derby. Bald geht's wieder los!",
];
const postDocs = texts.map((content) => {
  const author = pick(players);
  const likers = new Set(); const lc = rnd(0, 9);
  while (likers.size < lc) likers.add(pick(players)._id.toString());
  return {
    _id: oid(), seedTag: TAG, player: author._id, content, image: null,
    likes: [...likers].map((id) => new mongoose.Types.ObjectId(id)),
    comments: [], createdAt: daysAgo(rnd(0, 20)), updatedAt: now,
  };
});
await Posts.insertMany(postDocs);

const transferCount = players.filter((p) => p.transferStatus === "verfuegbar").length;
console.log(`\n✅ NRW-Demo angelegt:`);
console.log(`   ${teams.length} Teams (3 suchend), ${players.length} Spieler (${transferCount} transferbereit, inkl. Coach/Manager)`);
console.log(`   ${matchDocs.length} Spiele (Oberliga 1), 1 Tryout + ${tryoutApplicants.length} Bewerber, ${requesters.length} Beitrittsanfragen, ${postDocs.length} Posts`);
console.log(`   👉 Team-Admin-Sicht (Anfragen/Bewerber): demo.coach@nrw-demo.de / test123 (Köln Comets)`);
console.log(`   Entfernen: node scripts/seed-nrw-demo.mjs --purge`);
await mongoose.disconnect();
process.exit(0);
