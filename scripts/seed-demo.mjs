// Seed-Skript: erzeugt eine realistische Demo-Welt (Teams, Spieler, Liga,
// abgeschlossene Spiele mit Box-Scores, Posts, Follower).
// Aufruf:  node scripts/seed-demo.mjs
// ACHTUNG: leert players, teams, matches, posts, leagues (admins bleiben unberührt)
// und legt sie neu an. Bekannte Test-Logins bleiben erhalten:
//   Spieler  max@test.de / test123   ·   Team  team@test.de / test123
import { readFileSync } from "fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ----- .env lesen -----
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

const oid = () => new mongoose.Types.ObjectId();
const slugify = (s) =>
  String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
console.log("⏳ Verbunden mit", mongoose.connection.name);

const db = mongoose.connection;
const Teams = db.collection("teams");
const Players = db.collection("players");
const Matches = db.collection("matches");
const Posts = db.collection("posts");
const Leagues = db.collection("leagues");

// ----- Alte Demo-Daten entfernen (admins bleiben) -----
for (const c of [Teams, Players, Matches, Posts, Leagues]) await c.deleteMany({});
// Legacy-Indizes auf teams entfernen (früherer nicht-sparser unique-Index auf email);
// Mongoose legt die aktuellen (sparse) Indizes beim nächsten App-Start neu an.
await Teams.dropIndexes().catch(() => {});
console.log("🧹 players/teams/matches/posts/leagues geleert");

const pw = await bcrypt.hash("test123", 10);
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

// ----- Teams -----
const teamDefs = [
  { name: "Test Baskets", region: "Berlin", bundesland: "Berlin", about: "Unser Verein aus der Hauptstadt – Basketball mit Herz." },
  { name: "Rhein Ballers", region: "Köln", bundesland: "Nordrhein-Westfalen", about: "Ballers vom Rhein. Schnell, jung, hungrig." },
  { name: "Munich Hoops", region: "München", bundesland: "Bayern", about: "Tradition trifft Moderne im Süden." },
  { name: "Hamburg Towers United", region: "Hamburg", bundesland: "Hamburg", about: "Vom Hafen auf das Parkett." },
];
// Spieler-geführte Teams (kein eigener Team-Login). adminPlayerId wird nach
// dem Anlegen der Spieler gesetzt.
const teams = teamDefs.map((t) => ({
  _id: oid(),
  teamName: t.name,
  region: t.region,
  bundesland: t.bundesland,
  about: t.about,
  slug: slugify(t.name),
  logo: null,
  banner: null,
  followers: [],
  rosterSlots: [],
  createdAt: now,
  updatedAt: now,
}));
await Teams.insertMany(teams);
console.log(`🏀 ${teams.length} Teams`);

// ----- Spieler -----
const POS = ["PG", "SG", "SF", "PF", "C"];
const NAT = ["Deutschland", "Deutschland", "Deutschland", "USA", "Serbien", "Frankreich", "Spanien"];
const firstNames = ["Max", "Leon", "Jonas", "Noah", "Elias", "Ben", "Paul", "Luca", "Finn", "Tim", "Jan", "Nico", "David", "Marco", "Tom", "Felix"];
const lastNames = ["Mustermann", "Schneider", "Wagner", "Becker", "Hoffmann", "Schulz", "Koch", "Richter", "Klein", "Wolf", "Neumann", "Schwarz", "Krause", "Lang", "Berg", "Frank"];

const players = [];
let nameIdx = 0;
teams.forEach((team, ti) => {
  for (let i = 0; i < 4; i++) {
    const isMax = ti === 0 && i === 0;
    const isAdmin = i === 0; // erster Spieler je Team ist Team-Admin
    const firstName = isMax ? "Max" : firstNames[nameIdx % firstNames.length];
    const lastName = isMax ? "Mustermann" : lastNames[nameIdx % lastNames.length];
    nameIdx++;
    const email = isMax ? "max@test.de" : `${slugify(firstName)}.${slugify(lastName)}${nameIdx}@test.de`;
    players.push({
      _id: oid(),
      firstName,
      lastName,
      email,
      slug: slugify(`${firstName}-${lastName}-${nameIdx}`),
      password: pw,
      status: "active",
      teamId: team._id,
      position: POS[i % POS.length],
      height: `${rnd(180, 210)} cm`,
      weight: `${rnd(78, 110)} kg`,
      age: rnd(18, 32),
      nationality: pick(NAT),
      hometown: team.region,
      bundesland: team.bundesland,
      aboutPlayer: "Leidenschaftlicher Basketballer, immer bereit für das nächste Spiel.",
      followers: [],
      following: [],
      followingTeams: [],
      notifications: [],
      transferStatus: "nicht_verfuegbar",
      isTeamAdmin: isAdmin,
      teamAdminOf: isAdmin ? team._id : null,
      isSuperAdmin: false,
      createdAt: now,
      updatedAt: now,
    });
  }
});

// 2 Free Agents (transfermarkt)
const faCities = [
  { city: "Leipzig", land: "Sachsen" },
  { city: "Stuttgart", land: "Baden-Württemberg" },
];
["Sven Adler", "Jay Carter"].forEach((full, i) => {
  const [firstName, lastName] = full.split(" ");
  const loc = faCities[i % faCities.length];
  nameIdx++;
  players.push({
    _id: oid(),
    firstName,
    lastName,
    email: `${slugify(firstName)}.${slugify(lastName)}@test.de`,
    slug: slugify(`${firstName}-${lastName}`),
    password: pw,
    status: "active",
    teamId: null,
    position: pick(POS),
    height: `${rnd(185, 205)} cm`,
    weight: `${rnd(80, 105)} kg`,
    age: rnd(19, 30),
    nationality: pick(NAT),
    hometown: loc.city,
    bundesland: loc.land,
    aboutPlayer: "Suche ein neues Team für die kommende Saison.",
    followers: [],
    following: [],
    followingTeams: [],
    notifications: [],
    transferStatus: "verfuegbar",
    preferredLeague: "Regionalliga",
    transferNote: i === 0 ? "Flexibel einsetzbar, gerne Aufbau." : "Athletischer Flügel, defensivstark.",
    isTeamAdmin: false,
    teamAdminOf: null,
    isSuperAdmin: false,
    createdAt: now,
    updatedAt: now,
  });
});
await Players.insertMany(players);
console.log(`👤 ${players.length} Spieler`);

// Team-Admin (erster Spieler je Team) als adminPlayerId eintragen
for (const team of teams) {
  const admin = players.find(
    (p) => p.teamId && p.teamId.equals(team._id) && p.isTeamAdmin
  );
  if (admin) await Teams.updateOne({ _id: team._id }, { $set: { adminPlayerId: admin._id } });
}
console.log("👑 Team-Admins gesetzt");

// ----- Super-Admins (persistent in der Dev-DB) -----
// Patrick & Jonatan als Super-Admin-Spieler + /admin-Accounts. Dev-Passwort: test123.
// (Die Produktiv-Accounts in der DB 'test' bleiben davon unberührt.)
const superAdminDefs = [
  { firstName: "Patrick", lastName: "Schemura", email: "p.schemura@gmail.com", username: "patrick" },
  { firstName: "Jonatan", lastName: "Baena Vides III", email: "jonatanbaenavides@gmail.com", username: "jonatan" },
];
const superDocs = superAdminDefs.map((s, i) => ({
  _id: oid(),
  firstName: s.firstName,
  lastName: s.lastName,
  email: s.email,
  slug: slugify(`${s.firstName}-${s.lastName}`),
  password: pw,
  status: "active",
  teamId: null,
  position: pick(POS),
  height: `${rnd(185, 200)} cm`,
  nationality: "Deutschland",
  hometown: i === 0 ? "Berlin" : "Hamburg",
  bundesland: i === 0 ? "Berlin" : "Hamburg",
  aboutPlayer: "Hoops Germany Team.",
  followers: [],
  following: [],
  followingTeams: [],
  notifications: [],
  transferStatus: "nicht_verfuegbar",
  isTeamAdmin: false,
  teamAdminOf: null,
  isSuperAdmin: true,
  createdAt: now,
  updatedAt: now,
}));
await Players.insertMany(superDocs);

const Admins = db.collection("admins");
for (const s of superAdminDefs) {
  await Admins.updateOne(
    { username: s.username },
    {
      $set: { username: s.username, email: s.email, password: pw, firstName: s.firstName, lastName: s.lastName, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
}
console.log("🛡️  Super-Admins gesetzt: Patrick & Jonatan (Spieler isSuperAdmin + /admin-Login)");

// ----- Follower-Beziehungen -----
for (const p of players) {
  const others = players.filter((x) => !x._id.equals(p._id));
  const followCount = rnd(1, 4);
  const chosen = new Set();
  while (chosen.size < followCount) chosen.add(pick(others)._id.toString());
  for (const id of chosen) {
    await Players.updateOne({ _id: p._id }, { $addToSet: { following: new mongoose.Types.ObjectId(id) } });
    await Players.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $addToSet: { followers: p._id } });
  }
}
console.log("🔗 Follower-Beziehungen gesetzt");

// ----- Liga -----
const league = {
  _id: oid(),
  name: "Regionalliga Süd",
  season: "2025/26",
  bundesland: "Bayern",
  teams: teams.map((t) => t._id),
  matches: [],
  active: true,
  createdAt: now,
  updatedAt: now,
};

// ----- Spiele (jede Paarung einmal = 6 abgeschlossene Spiele) -----
const playersByTeam = (teamId) => players.filter((p) => p.teamId && p.teamId.equals(teamId));
const matchDocs = [];
let dayCounter = 40;
for (let a = 0; a < teams.length; a++) {
  for (let b = a + 1; b < teams.length; b++) {
    const teamA = teams[a];
    const teamB = teams[b];
    const date = daysAgo(dayCounter);
    dayCounter -= 6;

    // Box-Scores erzeugen
    const mkStats = (team) =>
      playersByTeam(team._id).map((p) => ({
        _id: oid(),
        player: p._id,
        team: team._id,
        points: rnd(2, 28),
        assists: rnd(0, 9),
        rebounds: rnd(1, 12),
        didNotPlay: false,
      }));
    const statsA = mkStats(teamA);
    const statsB = mkStats(teamB);
    const sum = (arr) => arr.reduce((s, x) => s + x.points, 0);
    let ptsA = sum(statsA);
    let ptsB = sum(statsB);
    if (ptsA === ptsB) ptsA += 2; // kein Unentschieden
    const aWins = ptsA > ptsB;

    const m = {
      _id: oid(),
      teamA: teamA._id,
      teamB: teamB._id,
      date,
      location: `${teamA.region} Arena`,
      leagueId: league._id,
      status: "completed",
      resultStatus: "confirmed",
      winningTeam: aWins ? teamA._id : teamB._id,
      winningTeamPoints: Math.max(ptsA, ptsB),
      losingTeamPoints: Math.min(ptsA, ptsB),
      playerStats: [...statsA, ...statsB],
      teamAResult: { ownPoints: ptsA, opponentPoints: ptsB, submittedBy: null, submittedAt: date },
      teamBResult: { ownPoints: ptsB, opponentPoints: ptsA, submittedBy: null, submittedAt: date },
      notifiedPendingResult: false,
      createdAt: date,
      updatedAt: date,
    };
    matchDocs.push(m);
  }
}

// 2 anstehende Spiele (scheduled)
for (let i = 0; i < 2; i++) {
  const teamA = teams[i];
  const teamB = teams[(i + 2) % teams.length];
  matchDocs.push({
    _id: oid(),
    teamA: teamA._id,
    teamB: teamB._id,
    date: new Date(now.getTime() + (i + 3) * 86400000),
    location: `${teamA.region} Arena`,
    leagueId: league._id,
    status: "scheduled",
    resultStatus: "pending",
    playerStats: [],
    notifiedPendingResult: false,
    createdAt: now,
    updatedAt: now,
  });
}

await Matches.insertMany(matchDocs);
league.matches = matchDocs.map((m) => m._id);
await Leagues.insertOne(league);
console.log(`📅 ${matchDocs.length} Spiele · 1 Liga`);

// ----- Posts -----
const postTexts = [
  "Starker Sieg gestern Abend! Danke an alle Fans für die Unterstützung 🏀🔥",
  "Hartes Training heute. Die Vorbereitung läuft. 💪",
  "Was für ein Spiel! Doppel-Double und der Sieg geht an uns.",
  "Neue Saison, neue Ziele. Lass uns angreifen!",
  "Defense wins championships. Daran arbeiten wir weiter.",
  "Danke an mein Team – ohne euch läuft nichts. 🙌",
  "Game Day! Heute zählt's. Wer ist dabei?",
  "Kleiner Throwback an das letzte Auswärtsspiel.",
];
const postDocs = [];
for (let i = 0; i < postTexts.length; i++) {
  const author = pick(players);
  const likers = new Set();
  const likeCount = rnd(0, 8);
  while (likers.size < likeCount) likers.add(pick(players)._id.toString());
  const commentCount = rnd(0, 3);
  const comments = [];
  for (let c = 0; c < commentCount; c++) {
    comments.push({
      _id: oid(),
      player: pick(players)._id,
      text: pick(["Stark! 💪", "Glückwunsch!", "Sehen wir nächste Woche 🏀", "Was ein Spiel!", "Respekt 🙌"]),
      createdAt: daysAgo(rnd(0, 20)),
    });
  }
  postDocs.push({
    _id: oid(),
    player: author._id,
    content: postTexts[i],
    image: null,
    likes: [...likers].map((id) => new mongoose.Types.ObjectId(id)),
    comments,
    createdAt: daysAgo(rnd(0, 25)),
    updatedAt: now,
  });
}
await Posts.insertMany(postDocs);
console.log(`📝 ${postDocs.length} Posts`);

console.log("\n✅ Seed abgeschlossen!");
console.log("   Teams sind spieler-geführt (kein Team-Login).");
console.log("   Team-Admin Test Baskets: max@test.de / test123 (alle Spieler-Logins: test123)");
console.log("   Super-Admins (Spieler-Login, test123): p.schemura@gmail.com · jonatanbaenavides@gmail.com");
console.log("   /admin-Panel: admin/geheim1234 ODER patrick/test123 · jonatan/test123");
await mongoose.disconnect();
process.exit(0);
