// Große, zusammenhängende Demo-Welt für Hoops Germany ("fühlt sich an wie 1 Jahr live").
// ADDITIV + getaggt (seedTag:"world"): fasst echte/andere Daten NICHT an, sauber entfernbar.
//   node scripts/seed-world.mjs           → Welt (neu) anlegen (löscht vorher nur eigene world-Daten)
//   node scripts/seed-world.mjs --purge    → nur world-Daten entfernen
// Demo-Logins (alle PW test123): world.coach@demo.de (Köln Sharks-Admin) u.a. world<N>@demo.de
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
let uri = readEnv("MONGODB_URI");
if (!uri) { console.error("❌ MONGODB_URI fehlt in .env"); process.exit(1); }
// Optional gegen Prod seeden: node scripts/seed-world.mjs --prod
if (process.argv.includes("--prod")) uri = uri.replace("/hoopsgermany?", "/hoops_prod?");

const PURGE = process.argv.includes("--purge");
const TAG = "world";
const oid = () => new mongoose.Types.ObjectId();
const slugify = (s) => String(s).toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const rnd = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const chance = (p)=>Math.random()<p;
const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];
const pickN = (arr,n)=>{const c=[...arr];const o=[];while(o.length<n&&c.length)o.push(c.splice(Math.floor(Math.random()*c.length),1)[0]);return o;};

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
console.log("⏳ Verbunden mit", mongoose.connection.name, PURGE ? "(PURGE)" : "");
const db = mongoose.connection;
const C = {
  teams: db.collection("teams"), players: db.collection("players"), matches: db.collection("matches"),
  posts: db.collection("posts"), leagues: db.collection("leagues"), tryouts: db.collection("tryouts"),
  transferevents: db.collection("transferevents"), teamseasons: db.collection("teamseasons"),
};

// ---------- Cleanup: nur eigene (getaggte) Welt-Daten ----------
const oldTeams = (await C.teams.find({ seedTag: TAG }).project({ _id: 1 }).toArray()).map(t=>t._id);
const oldMatches = (await C.matches.find({ seedTag: TAG }).project({ _id: 1 }).toArray()).map(m=>m._id);
if (oldTeams.length) await C.leagues.updateMany({}, { $pull: { teams: { $in: oldTeams } } });
if (oldMatches.length) await C.leagues.updateMany({}, { $pull: { matches: { $in: oldMatches } } });
await C.leagues.deleteMany({ seedTag: TAG });
for (const c of Object.values(C)) await c.deleteMany({ seedTag: TAG });
console.log(`🧹 Alte world-Daten entfernt (${oldTeams.length} Teams, ${oldMatches.length} Spiele)`);
if (PURGE) { console.log("✅ Purge abgeschlossen – echte Daten unberührt."); await mongoose.disconnect(); process.exit(0); }

const pw = await bcrypt.hash("test123", 10);
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d*86400000);
const dateBetween = (minDaysAgo, maxDaysAgo) => daysAgo(rnd(minDaysAgo, maxDaysAgo) + Math.random());

// ===================== LIGEN =====================
// Eigene, getaggte Ligen (self-contained). Aktuelle Saison 2025/26 + zwei Vorsaison-Ligen
// (2024/25, abgeschlossen) für Saison-Historie/Meister/Aufstieg.
const REGIONS = { Koeln:"Bezirk Köln", Duesseldorf:"Bezirk Düsseldorf", Ruhr:"Bezirk Arnsberg", Muenster:"Bezirk Münster", OWL:"Bezirk Detmold" };
function mkLeague(name, season, level, region, finished=false) {
  return { _id: oid(), seedTag: TAG, name, season, bundesland:"Nordrhein-Westfalen", level, gender:"Herren",
    ageGroup:"Senioren", region, official:false, active:true, finished, champion:null,
    playoffMode: level==="Regionalliga"||level==="Landesliga" ? "best_of_1" : "keine",
    teams:[], matches:[], createdAt: daysAgo(330), updatedAt: now };
}
const cur = {
  regio:   mkLeague("Regionalliga West","2025/26","Regionalliga",REGIONS.Ruhr),
  ob1:     mkLeague("Oberliga 1","2025/26","Oberliga",REGIONS.Koeln),
  ob2:     mkLeague("Oberliga 2","2025/26","Oberliga",REGIONS.Muenster),
  land1:   mkLeague("Landesliga 1","2025/26","Landesliga",REGIONS.Duesseldorf),
  land2:   mkLeague("Landesliga 3","2025/26","Landesliga",REGIONS.OWL),
  bez1:    mkLeague("Bezirksliga 2","2025/26","Bezirksliga",REGIONS.Koeln),
  bez2:    mkLeague("Bezirksliga 5","2025/26","Bezirksliga",REGIONS.Ruhr),
  u18:     { ...mkLeague("U18 NRW-Liga","2025/26","Oberliga",REGIONS.Duesseldorf), ageGroup:"U18" },
};
const prev = {
  regio2024: mkLeague("Regionalliga West","2024/25","Regionalliga",REGIONS.Ruhr,true),
  land1_2024: mkLeague("Landesliga 1","2024/25","Landesliga",REGIONS.Duesseldorf,true),
};
const allLeagues = [...Object.values(cur), ...Object.values(prev)];

// ===================== TEAMS =====================
// 40 eindeutige NRW-Teams, auf die 8 aktuellen Ligen verteilt. recruitDefs = Vereinsgesuche.
const RECRUIT_NOTES = [
  ["Point Guard"], ["Center"], ["Shooting Guard"], ["Power Forward"], ["Small Forward"],
  ["Coach"], ["Manager"], ["Sportliche Leitung"], ["Point Guard","Center"], ["Shooting Guard","Small Forward"],
];
const RECRUIT_TEXT = [
  "Wir suchen Verstärkung für die Rückrunde – Training Di/Do.","Ambitioniertes Team sucht Spieler mit Erfahrung.",
  "Aufbauspieler gesucht, gerne mit Wurf.","Großgewachsene Spieler willkommen – wir wollen oben mitspielen.",
  "Suchen dringend einen Coach für die kommende Saison.","Team-Manager (Orga/Sponsoring) gesucht.",
  "Jugendtrainer gesucht – Herzblut wichtiger als Lizenz.","Physiotherapeut/in für Heimspiele gesucht.",
  "Wiedereinsteiger willkommen, lockeres aber ehrgeiziges Umfeld.","Suchen 1–2 Big Men für die Zone.",
];
const TEAM_NAMES = [
  ["Köln Sharks","Köln",cur.ob1],["Köln Crusaders","Köln",cur.bez1],["Düsseldorf Diamonds","Düsseldorf",cur.land1],
  ["Düsseldorf Ducks","Düsseldorf",cur.ob1],["Essen Eagles","Essen",cur.regio],["Essen Steelers","Essen",cur.bez2],
  ["Dortmund Drivers","Dortmund",cur.regio],["Dortmund Dribblers","Dortmund",cur.ob2],["Münster Mavericks","Münster",cur.ob2],
  ["Bochum Brawlers","Bochum",cur.land2],["Aachen Aces","Aachen",cur.ob1],["Bonn Bears","Bonn",cur.land1],
  ["Duisburg Dragons","Duisburg",cur.regio],["Wuppertal Wolves","Wuppertal",cur.land1],["Bielefeld Blazers","Bielefeld",cur.land2],
  ["Gladbach Giants","Mönchengladbach",cur.ob1],["Krefeld Kings","Krefeld",cur.bez1],["Leverkusen Lions","Leverkusen",cur.land1],
  ["Neuss Knights","Neuss",cur.bez1],["Hagen Hawks","Hagen",cur.regio],["Hamm Heat","Hamm",cur.bez2],
  ["Solingen Storm","Solingen",cur.bez1],["Herne Hammers","Herne",cur.land2],["Recklinghausen Royals","Recklinghausen",cur.bez2],
  ["Gelsenkirchen Gladiators","Gelsenkirchen",cur.land2],["Oberhausen Owls","Oberhausen",cur.bez2],["Siegen Saints","Siegen",cur.ob2],
  ["Witten Wizards","Witten",cur.bez2],["Paderborn Panthers","Paderborn",cur.land2],["Iserlohn Icebreakers","Iserlohn",cur.ob2],
  ["Lünen Lakers","Lünen",cur.bez2],["Velbert Vikings","Velbert",cur.bez1],["Rhein Rockets","Köln",cur.land1],
  ["Ruhr Riders","Bochum",cur.regio],["Bergisch Ballers","Wuppertal",cur.bez1],["Sauerland Stags","Siegen",cur.land2],
  ["Niederrhein Nets","Krefeld",cur.ob1],["Münsterland Monarchs","Münster",cur.ob2],["Emscher Energy","Gelsenkirchen",cur.bez2],
  ["Ruhrpott Raptors U18","Dortmund",cur.u18],
];
const teams = TEAM_NAMES.map(([name,region,league],i)=>{
  const recruiting = i>=1 && chance(0.92); // ~36 Vereinsgesuche (nicht ganz alle)
  const pos = recruiting ? pick(RECRUIT_NOTES) : [];
  return { _id: oid(), seedTag: TAG, teamName: name, region, bundesland:"Nordrhein-Westfalen",
    about: `${name} – Amateur-Basketball aus ${region}.`, slug: slugify(name)+"-w", logo:null, banner:null,
    followers:[], rosterSlots:[], adminPlayerId:null, approved:true, leagueId: league._id,
    recruiting, recruitingPositions: pos, recruitingNote: recruiting ? pick(RECRUIT_TEXT) : "",
    createdAt: daysAgo(rnd(200,340)), updatedAt: now };
});
const teamByName = Object.fromEntries(teams.map(t=>[t.teamName,t]));
// Teams den aktuellen Ligen zuordnen
TEAM_NAMES.forEach(([name,,league],i)=>{ league.teams.push(teams[i]._id); });
// Vorsaison-Ligen (2024/25): etablierte Teams, die es letzte Saison auch gab
const regio2024Teams = ["Essen Eagles","Dortmund Drivers","Duisburg Dragons","Hagen Hawks","Ruhr Riders"].map(n=>teamByName[n]);
const land1_2024Teams = ["Rhein Rockets","Düsseldorf Diamonds","Bonn Bears","Wuppertal Wolves","Leverkusen Lions"].map(n=>teamByName[n]);
prev.regio2024.teams = regio2024Teams.map(t=>t._id);
prev.land1_2024.teams = land1_2024Teams.map(t=>t._id);

// ===================== SPIELER =====================
const FN = ["Jan","Tim","Leon","Luca","Nico","Ben","Paul","Finn","Jonas","Noah","Elias","Moritz","Kevin","Marvin","Dennis","Sami","Aaron","Henri","Til","Mats","Jakob","David","Lukas","Felix","Maximilian","Julian","Tom","Niklas","Philipp","Florian","Marco","Daniel","Christian","Robin","Deniz","Malik","Jamal","Marcus","Kai","Ole","Bjarne","Fabian","Tobias","Simon","Erik","Hannes","Linus","Theo","Anton","Vincent","Emir","Luka","Marko","Stefan","Dragan","Nemanja","Diego","Pablo","Andrés","Mateo"];
const LN = ["Schäfer","Bauer","Krämer","Vogel","Huber","Peters","Sommer","Brandt","Engel","Arndt","Busch","Kraft","Otto","Seidel","Hahn","Albrecht","Walter","Ziegler","Kuhn","Bock","Wagner","Becker","Hoffmann","Koch","Richter","Klein","Wolf","Schröder","Neumann","Schwarz","Zimmermann","Braun","Krüger","Hofmann","Lang","Weiß","Jung","Hansen","König","Frank","Berg","Adler","Yilmaz","Demir","Petrović","Jovanović","Nowak","García","López","Martín","Costa","Mensah","Owusu","Diallo","Traoré","Keller","Roth","Beck","Sander","Voigt","Pohl"];
const NAT = ["Deutschland","Deutschland","Deutschland","Deutschland","Deutschland","USA","Serbien","Spanien","Türkei","Kroatien","Frankreich","Ghana","Litauen","Polen"];
const POS_MAIN = ["Point Guard","Shooting Guard","Small Forward","Power Forward","Center"];
const NRW_CITIES = ["Köln","Düsseldorf","Essen","Dortmund","Münster","Bochum","Aachen","Bonn","Duisburg","Wuppertal","Bielefeld","Mönchengladbach","Krefeld","Leverkusen","Neuss","Hagen","Hamm","Solingen","Herne","Gelsenkirchen","Oberhausen","Siegen","Witten","Paderborn","Iserlohn"];
const BIO = [
  "Spiele seit der Jugend Basketball – Defense first.","Wurfstark von außen, arbeite an meinem Abschluss am Ring.",
  "Aufbauspieler mit Übersicht. Teamplay über alles.","Reboundmaschine. Lasse keinen zweiten Wurf zu.",
  "Athletischer Flügel, gerne im Transitionspiel.","Kam übers Schulteam zum Verein, seitdem süchtig.",
  "Comeback nach Kreuzbandriss – hungriger denn je.","Studiere und spiele nebenbei – Basketball ist mein Ausgleich.",
  "Big Man mit weichem Wurf aus der Mitteldistanz.","Energizer von der Bank, bringe Tempo rein.",
  "Erfahrener Routinier, helfe gern den Jungen.","Linkshänder, schwer zu verteidigen am Korb.",
];
// Skill-Tiers → realistische Verteilung. Profil bestimmt Box-Scores (positionsspezifisch).
const POS_BASE = {
  "Point Guard":   { pts:[5,14], ast:[4,11], reb:[1,4] },
  "Shooting Guard":{ pts:[8,22], ast:[1,4],  reb:[1,4] },
  "Small Forward": { pts:[6,18], ast:[1,5],  reb:[2,7] },
  "Power Forward": { pts:[4,15], ast:[0,3],  reb:[4,11] },
  "Center":        { pts:[4,16], ast:[0,2],  reb:[5,14] },
};
const TIER_MULT = { star:1.35, starter:1.0, role:0.7, bench:0.42 };
const profileById = new Map();
const players = [];
let pidx = 0;
function mkPlayer(over, profile) {
  pidx++;
  const firstName = over.firstName || FN[(pidx*7) % FN.length];
  const lastName = over.lastName || LN[(pidx*13) % LN.length];
  const ageGroup = over.ageGroup || "Senioren";
  const age = over.age || (ageGroup === "U18" ? rnd(15,18) : rnd(17,36));
  const active = over.status ? over.status==="active" : chance(0.82); // ~18% "inaktiv" (pending)
  const p = {
    _id: oid(), seedTag: TAG, firstName, lastName,
    email: over.email || `world${pidx}@demo.de`,
    slug: (over.slug || slugify(`${firstName}-${lastName}`)) + `-w${pidx}`,
    password: pw, status: active ? "active" : "pending",
    teamId: over.teamId || null, position: over.position || pick(POS_MAIN),
    height: `${rnd(178,212)} cm`, weight: `${rnd(74,112)} kg`, age,
    nationality: over.nationality || pick(NAT), hometown: over.hometown || pick(NRW_CITIES),
    bundesland: "Nordrhein-Westfalen", aboutPlayer: over.aboutPlayer || pick(BIO),
    instagram: chance(0.25) ? `@${slugify(firstName+lastName)}` : "",
    followers:[], following:[], followingTeams:[], notifications:[],
    transferStatus: over.transferStatus || "nicht_verfuegbar",
    preferredLeague: over.preferredLeague || "", transferNote: over.transferNote || "",
    isTeamAdmin: !!over.isTeamAdmin, teamAdminOf: over.teamAdminOf || null, isSuperAdmin:false,
    onboardingDismissed:true, welcomeSeen:true,
    createdAt: over.createdAt || daysAgo(rnd(10,360)), updatedAt: now,
  };
  if (over.birthdate) p.birthdate = over.birthdate;
  players.push(p);
  const prof = profile || { tier: pick(["star","starter","starter","role","role","bench"]) };
  profileById.set(String(p._id), prof);
  return p;
}

const TRANSFER_REASONS = [
  { note:"Ziehe beruflich um und suche Anschluss.", lg:"Bezirksliga" },
  { note:"Studiere ab Herbst hier und suche ein Team.", lg:"Landesliga" },
  { note:"Würde mich gerne höherklassig versuchen.", lg:"Regionalliga" },
  { note:"Wiedereinstieg nach Pause – ehrgeizig, aber realistisch.", lg:"Bezirksliga" },
  { note:"Suche ein Team mit ernsthaftem Training.", lg:"Oberliga" },
  { note:"Neu in der Stadt, suche Anschluss & Hallenzeit.", lg:"Landesliga" },
];
const ROLE_SEEKERS = [
  { position:"Coach", note:"Lizenzierter Trainer (B-Lizenz) sucht neue Aufgabe." },
  { position:"Manager", note:"Erfahrener Team-Manager, Orga & Sponsoring." },
  { position:"Sportliche Leitung", note:"Möchte ein Team strukturell aufbauen." },
];

// Rosters: 4–11 Spieler je Team, erster ist Admin.
teams.forEach((team, ti) => {
  const size = team.teamName.includes("U18") ? rnd(8,11) : rnd(4,11);
  for (let i=0;i<size;i++){
    const isAdmin = i===0;
    const position = i < POS_MAIN.length ? POS_MAIN[i] : pick(POS_MAIN);
    const tier = i===0 ? pick(["star","starter"]) : i<5 ? pick(["star","starter","starter","role"]) : pick(["role","role","bench","bench"]);
    const transferable = !isAdmin && chance(0.18); // gebundene, aber transferbereite Spieler
    const r = transferable ? pick(TRANSFER_REASONS) : null;
    const isDemoCoach = ti===0 && i===0;
    mkPlayer({
      ...(isDemoCoach ? { firstName:"Chris", lastName:"Berger", email:"world.coach@demo.de", position:"Point Guard" } : { position }),
      teamId: team._id, hometown: team.region, isTeamAdmin: isAdmin, teamAdminOf: isAdmin ? team._id : null,
      ageGroup: team.teamName.includes("U18") ? "U18" : "Senioren",
      ...(r ? { transferStatus:"verfuegbar", preferredLeague:r.lg, transferNote:r.note } : {}),
    }, { tier });
  }
});

// Free Agents (Spieler suchen Verein) – bis ~85 verfügbare insgesamt
let verfuegbar = players.filter(p=>p.transferStatus==="verfuegbar").length;
const FA_TARGET = 85;
const faPlayers = [];
while (verfuegbar < FA_TARGET) {
  const useRole = chance(0.18);
  const r = useRole ? pick(ROLE_SEEKERS) : pick(TRANSFER_REASONS);
  const p = mkPlayer({
    position: useRole ? r.position : pick(POS_MAIN),
    transferStatus:"verfuegbar",
    preferredLeague: useRole ? "" : r.lg,
    transferNote: r.note,
    createdAt: daysAgo(rnd(2, 140)), // teils ältere Einträge
  }, { tier: pick(["starter","role","role","bench"]) });
  faPlayers.push(p); verfuegbar++;
}

// ===================== NARRATIVE (Geschichten) =====================
// 1) Finn Brandt – seit Jahren bei Düsseldorf Diamonds, jetzt höherklassig gesucht.
const diamonds = teamByName["Düsseldorf Diamonds"];
const finn = mkPlayer({ firstName:"Finn", lastName:"Brandt", email:"finn.brandt@demo.de", slug:"finn-brandt",
  position:"Shooting Guard", teamId: diamonds._id, hometown:"Düsseldorf", nationality:"Deutschland", age:24,
  aboutPlayer:"Seit Jahren das Gesicht der Düsseldorf Diamonds. Jetzt bereit für den nächsten Schritt.",
  transferStatus:"verfuegbar", preferredLeague:"Regionalliga",
  transferNote:"Spiele seit drei Jahren bei Düsseldorf und möchte mich höherklassig beweisen.",
  createdAt: daysAgo(330) }, { tier:"star" });
// 2) Köln Sharks suchen seit zwei Wochen einen Point Guard
const sharks = teamByName["Köln Sharks"];
sharks.recruiting = true; sharks.recruitingPositions = ["Point Guard"];
sharks.recruitingNote = "Suchen seit zwei Wochen einen Aufbauspieler für die Rückrunde. Meldet euch!";
// passender Free Agent PG
const pgMatch = mkPlayer({ firstName:"Deniz", lastName:"Aslan", email:"deniz.aslan@demo.de", slug:"deniz-aslan",
  position:"Point Guard", hometown:"Köln", transferStatus:"verfuegbar", preferredLeague:"Oberliga",
  transferNote:"Klassischer Aufbau, suche ein ambitioniertes Team im Raum Köln.", createdAt: daysAgo(18) }, { tier:"starter" });
// 3) Essen Eagles – offenes Probetraining (Tryout) – siehe unten
// 4) Rhein Rockets – Aufstieg/Meister 2024/25 (siehe Vorsaison + Posts)
// 5) Dortmund Drivers – Siegesserie (5 Siege) (siehe Spiele)

const teamPlayers = (tid)=>players.filter(p=>p.teamId&&String(p.teamId)===String(tid)&&p.position!=="Coach"&&p.position!=="Manager"&&p.position!=="Sportliche Leitung");

// ===================== FOLLOWER (im Speicher, performant) =====================
// Tier bestimmt Reichweite. Jugend wenig, Stars viel.
function targetFollowers(p){
  const prof = profileById.get(String(p._id));
  if (p.position==="Coach"||p.position==="Manager"||p.position==="Sportliche Leitung") return rnd(10,60);
  if (p.age && p.age<=18) return rnd(2,8);
  if (prof?.tier==="star") return rnd(120,260);
  if (prof?.tier==="starter") return rnd(25,90);
  if (prof?.tier==="role") return rnd(8,40);
  return rnd(2,18);
}
const followersMap = new Map(players.map(p=>[String(p._id),new Set()]));
for (const p of players) {
  const want = Math.min(targetFollowers(p), players.length-1);
  const candidates = players.filter(x=>x._id!==p._id);
  for (const f of pickN(candidates, want)) followersMap.get(String(p._id)).add(String(f._id));
}
for (const p of players) {
  const fset = followersMap.get(String(p._id));
  p.followers = [...fset].map(id=>new mongoose.Types.ObjectId(id));
  for (const fid of fset) {
    const fp = players.find(x=>String(x._id)===fid);
    if (fp) fp.following.push(p._id);
  }
}
// Team-Follower (im Speicher)
for (const t of teams) {
  const big = ["Regionalliga","Oberliga"].includes(allLeagues.find(l=>String(l._id)===String(t.leagueId))?.level);
  const want = big ? rnd(60,400) : rnd(30,180);
  const fans = pickN(players, Math.min(want, players.length));
  t.followers = fans.map(p=>p._id);
  for (const p of fans) p.followingTeams.push(t._id);
}

// ===================== SPIELE + BOX-SCORES =====================
function boxScore(team, dateRef) {
  return teamPlayers(team._id).map(p=>{
    const prof = profileById.get(String(p._id));
    const base = POS_BASE[p.position] || POS_BASE["Small Forward"];
    const m = TIER_MULT[prof?.tier||"role"];
    const dnp = prof?.tier==="bench" && chance(0.25);
    const span=(r)=>dnp?0:Math.max(0,Math.round(rnd(r[0],r[1])*m + rnd(-2,2)));
    return { _id:oid(), player:p._id, team:team._id, points:span(base.pts), assists:span(base.ast), rebounds:span(base.reb), didNotPlay:dnp };
  });
}
const REPORTS = [
  "Über vier Viertel das bessere Team – verdienter Erfolg vor lautstarker Kulisse.",
  "Erst im Schlussviertel entschieden. Eine Willensleistung der Defense.",
  "Wurfquoten lagen am Boden, am Ende zählt der Wille. Weiter geht's.",
  "Knapper Krimi bis zur Schlusssirene – Basketball, wie er sein soll.",
  "Dominanz unterm Korb und ein heißer Lauf im dritten Viertel.",
];
const allMatches = [];
function makeMatch(league, tA, tB, date, opts={}) {
  const completed = opts.completed ?? (date < now);
  if (!completed) {
    const m = { _id:oid(), seedTag:TAG, teamA:tA._id, teamB:tB._id, date, location:`${tA.region} Arena`,
      leagueId:league._id, status:"scheduled", resultStatus:"pending", stage:opts.stage||"Hauptrunde",
      ...(opts.round?{playoffRound:opts.round}:{}), playerStats:[], notifiedPendingResult:false, createdAt:daysAgo(30), updatedAt:now };
    allMatches.push(m); league.matches.push(m._id); return m;
  }
  const sA=boxScore(tA,date), sB=boxScore(tB,date);
  let pA=sA.reduce((s,x)=>s+x.points,0)+rnd(2,8), pB=sB.reduce((s,x)=>s+x.points,0)+rnd(2,8);
  if (opts.winner==="A" && pA<=pB) pA=pB+rnd(2,10);
  if (opts.winner==="B" && pB<=pA) pB=pA+rnd(2,10);
  if (pA===pB) pA+=rnd(1,5);
  const allStats=[...sA,...sB];
  const m = { _id:oid(), seedTag:TAG, teamA:tA._id, teamB:tB._id, date, location:`${tA.region} Arena`,
    leagueId:league._id, status:"completed", resultStatus:"confirmed", stage:opts.stage||"Hauptrunde",
    ...(opts.round?{playoffRound:opts.round}:{}),
    winningTeam: pA>pB?tA._id:tB._id, winningTeamPoints:Math.max(pA,pB), losingTeamPoints:Math.min(pA,pB),
    playerStats: allStats,
    teamAResult:{ownPoints:pA,opponentPoints:pB,submittedBy:null,submittedAt:date},
    teamBResult:{ownPoints:pB,opponentPoints:pA,submittedBy:null,submittedAt:date},
    notifiedPendingResult:false, createdAt:date, updatedAt:date };
  // ~45% der Spiele mit MVP/Zuschauer/Spielbericht
  if (chance(0.45)) {
    const top=[...allStats].filter(s=>!s.didNotPlay).sort((a,b)=>b.points-a.points)[0];
    if (top) m.mvp=top.player;
    m.attendance=rnd(40,520);
    if (chance(0.6)) m.report=pick(REPORTS);
  }
  allMatches.push(m); league.matches.push(m._id);
  return m;
}
// Aktuelle Saison: je Liga Round-Robin (vergangen) + 1–2 zukünftige Spiele
for (const lg of Object.values(cur)) {
  const t = lg.teams.map(id=>teams.find(x=>String(x._id)===String(id)));
  let dc = 150;
  for (let a=0;a<t.length;a++) for (let b=a+1;b<t.length;b++) {
    makeMatch(lg, t[a], t[b], dateBetween(8,150), {});
    dc-=3;
  }
  // 1–2 zukünftige Spiele
  for (let i=0;i<2 && t.length>=2;i++)
    makeMatch(lg, t[i%t.length], t[(i+2)%t.length], new Date(now.getTime()+(rnd(2,30))*86400000), { completed:false });
}
// Narrative: Dortmund Drivers – 5 Siege in Serie (in der Regionalliga)
const drivers = teamByName["Dortmund Drivers"];
const regioOthers = cur.regio.teams.map(id=>teams.find(x=>String(x._id)===String(id))).filter(t=>t._id!==drivers._id);
for (let i=0;i<5;i++) makeMatch(cur.regio, drivers, regioOthers[i%regioOthers.length], dateBetween(5, 5+i*7+5), { winner:"A" });

// Vorsaison 2024/25 (abgeschlossen) + Playoffs + Meister + TeamSeason-Freeze
function seasonWithPlayoffs(league, lgTeams, championTeam) {
  let pd=360;
  for (let a=0;a<lgTeams.length;a++) for (let b=a+1;b<lgTeams.length;b++){ makeMatch(league, lgTeams[a], lgTeams[b], daysAgo(pd), {}); pd-=6; }
  // Playoffs: Halbfinale + Finale (championTeam gewinnt)
  const others=lgTeams.filter(t=>t._id!==championTeam._id);
  makeMatch(league, championTeam, others[2], daysAgo(232), {stage:"Playoffs",round:"Halbfinale",winner:"A"});
  makeMatch(league, others[0], others[1], daysAgo(231), {stage:"Playoffs",round:"Halbfinale"});
  const fin=makeMatch(league, championTeam, others[0], daysAgo(222), {stage:"Playoffs",round:"Finale",winner:"A"});
  league.champion=fin.winningTeam;
}
seasonWithPlayoffs(prev.regio2024, regio2024Teams, teamByName["Essen Eagles"]);
seasonWithPlayoffs(prev.land1_2024, land1_2024Teams, teamByName["Rhein Rockets"]); // Aufstieg/Meister-Narrativ

// TeamSeason-Snapshots der abgeschlossenen Ligen einfrieren (Standings nur Hauptrunde)
const teamseasons=[];
function freezeLeague(league) {
  const tbl=new Map(league.teams.map(id=>[String(id),{teamId:id,games:0,wins:0,losses:0,pf:0,pa:0}]));
  for (const m of allMatches.filter(x=>String(x.leagueId)===String(league._id) && x.status==="completed" && x.stage!=="Playoffs")) {
    const a=tbl.get(String(m.teamA)), b=tbl.get(String(m.teamB)); if(!a||!b) continue;
    const aPts=m.teamAResult.ownPoints, bPts=m.teamBResult.ownPoints;
    a.games++; b.games++; a.pf+=aPts; a.pa+=bPts; b.pf+=bPts; b.pa+=aPts;
    if(aPts>bPts){a.wins++;b.losses++;}else{b.wins++;a.losses++;}
  }
  const rows=[...tbl.values()].map(s=>({...s,diff:s.pf-s.pa})).sort((x,y)=>y.wins-x.wins||y.diff-x.diff||y.pf-x.pf);
  rows.forEach((s,i)=>teamseasons.push({ _id:oid(), seedTag:TAG, teamId:s.teamId, leagueId:league._id, season:league.season,
    status:"aktiv", placement:i+1, games:s.games, wins:s.wins, losses:s.losses, pointsFor:s.pf, pointsAgainst:s.pa,
    diff:s.diff, champion: String(league.champion)===String(s.teamId), finalized:true, finalizedAt:daysAgo(220),
    createdAt:daysAgo(220), updatedAt:now }));
}
freezeLeague(prev.regio2024); freezeLeague(prev.land1_2024);

// ===================== TRYOUTS =====================
const tryouts=[];
const eagles=teamByName["Essen Eagles"];
tryouts.push({ _id:oid(), seedTag:TAG, teamId:eagles._id, date:new Date(now.getTime()+8*86400000),
  location:"Sporthalle Essen-West", positions:["Point Guard","Shooting Guard"],
  description:"Offenes Probetraining – jeder ist willkommen, bring Hallenschuhe mit!", status:"active",
  applicants: pickN(faPlayers,5).map(a=>({playerId:a._id, appliedAt:daysAgo(rnd(0,6))})), createdAt:daysAgo(7), updatedAt:now });
for (const t of pickN(teams.filter(t=>t.recruiting),6)) {
  tryouts.push({ _id:oid(), seedTag:TAG, teamId:t._id, date:new Date(now.getTime()+rnd(3,40)*86400000),
    location:`${t.region} Halle`, positions: pickN(POS_MAIN,rnd(1,3)),
    description:"Wir suchen Verstärkung – komm vorbei und zeig, was du kannst.", status: chance(0.8)?"active":"closed",
    applicants: pickN(faPlayers,rnd(0,4)).map(a=>({playerId:a._id, appliedAt:daysAgo(rnd(0,20))})),
    createdAt:daysAgo(rnd(5,60)), updatedAt:now });
}

// ===================== TRANSFER-EVENTS (+ Karriere-Stationen) =====================
const transferevents=[];
// ~30 Spieler bekommen eine 2-Stationen-Karriere: spielten 2024/25 bei einem Vorsaison-Team
const movers = pickN(players.filter(p=>p.teamId && p.status==="active"), 30);
for (const m of movers) {
  const prevTeam = pick([...regio2024Teams, ...land1_2024Teams].filter(t=>String(t._id)!==String(m.teamId)));
  if (!prevTeam) continue;
  // Box-Scores der Vorsaison ergänzen: in ein paar 2024/25-Spiele des prevTeam eintragen
  const prevLeague = regio2024Teams.includes(prevTeam) ? prev.regio2024 : prev.land1_2024;
  const prevGames = allMatches.filter(x=>String(x.leagueId)===String(prevLeague._id) && x.status==="completed" && (String(x.teamA)===String(prevTeam._id)||String(x.teamB)===String(prevTeam._id))).slice(0,4);
  const prof=profileById.get(String(m._id)); const base=POS_BASE[m.position]||POS_BASE["Small Forward"]; const mu=TIER_MULT[prof?.tier||"role"];
  for (const g of prevGames) g.playerStats.push({ _id:oid(), player:m._id, team:prevTeam._id,
    points:Math.max(0,Math.round(rnd(base.pts[0],base.pts[1])*mu)), assists:Math.max(0,Math.round(rnd(base.ast[0],base.ast[1])*mu)),
    rebounds:Math.max(0,Math.round(rnd(base.reb[0],base.reb[1])*mu)), didNotPlay:false });
  transferevents.push({ _id:oid(), seedTag:TAG, player:m._id, fromTeam:prevTeam._id, toTeam:m.teamId, type:"move", createdAt:daysAgo(rnd(150,210)), updatedAt:now });
}

// ===================== POSTS =====================
const posts=[];
const teamName=(id)=>teams.find(t=>String(t._id)===String(id))?.teamName||"unser Team";
const playerName=(p)=>`${p.firstName} ${p.lastName}`;
// a) Auto-Posts: Spielergebnisse (Sample der completed matches)
for (const m of pickN(allMatches.filter(x=>x.status==="completed" && x.stage!=="Playoffs"), 30)) {
  const a=teamName(m.teamA), b=teamName(m.teamB);
  const aPts=m.teamAResult.ownPoints, bPts=m.teamBResult.ownPoints;
  posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"match_result",
    content:`${a} ${aPts}:${bPts} ${b}`, teams:[m.teamA,m.teamB], meta:{href:`/match/${m._id}`, note:"Endergebnis"},
    likes:[], comments:[], createdAt:new Date(m.date.getTime()+7200000), updatedAt:now });
}
// b) Auto-Posts: Transfers (Sample)
for (const ev of pickN(transferevents,18)) {
  const p=players.find(x=>String(x._id)===String(ev.player));
  posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"transfer",
    content:`${playerName(p)} wechselte zu ${teamName(ev.toTeam)}.`, subjectPlayer:p._id, teams:[ev.fromTeam,ev.toTeam].filter(Boolean),
    meta:{href:`/player/view-player/${p.slug}`}, likes:[], comments:[], createdAt:new Date(ev.createdAt.getTime()+3600000), updatedAt:now });
}
// c) Auto-Posts: Recruiting + Verfügbar + Champions + Tryout
for (const t of pickN(teams.filter(t=>t.recruiting),12)) posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"recruiting",
  content:`${t.teamName} sucht Verstärkung – gesucht: ${(t.recruitingPositions||[]).join(", ")||"Spieler"}.`, teams:[t._id],
  meta:{href:`/team/team-detail/${t.slug}`, note:t.recruitingNote}, likes:[], comments:[], createdAt:daysAgo(rnd(1,40)), updatedAt:now });
for (const p of pickN(players.filter(p=>p.transferStatus==="verfuegbar"),14)) posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"transfer_available",
  content:`${playerName(p)} ist auf Vereinssuche${p.preferredLeague?` (${p.preferredLeague})`:""}.`, subjectPlayer:p._id, teams:[],
  meta:{href:`/player/view-player/${p.slug}`}, likes:[], comments:[], createdAt:daysAgo(rnd(1,90)), updatedAt:now });
for (const lg of [prev.regio2024, prev.land1_2024]) { const champ=teams.find(t=>String(t._id)===String(lg.champion));
  if (champ) posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"team_founded",
    content:`🏆 ${champ.teamName} ist Meister der ${lg.name} ${lg.season}!`, teams:[champ._id],
    meta:{href:`/ligen/${lg._id}`}, likes:[], comments:[], createdAt:daysAgo(220), updatedAt:now }); }
posts.push({ _id:oid(), seedTag:TAG, player:null, kind:"auto", autoType:"tryout",
  content:`${eagles.teamName} sucht Verstärkung – Tryout (offenes Probetraining) in Essen.`, teams:[eagles._id],
  meta:{href:`/tryouts/${tryouts[0]._id}`}, likes:[], comments:[], createdAt:daysAgo(7), updatedAt:now });

// d) Nutzer-Posts (Spieler) – viele Stile/Themen
const POST_TEMPLATES = [
  ()=>`Heimspiel am Wochenende – kommt vorbei und supportet uns! 🏀`,
  ()=>`Was für ein Spiel gestern. Bis zur letzten Sekunde gezittert. 😮‍💨`,
  ()=>`Doppel-Double heute. Die Beine brennen, aber es hat sich gelohnt. 💪`,
  ()=>`Schwere Niederlage. Müssen die Würfe treffen, sonst wird's nichts. Analyse läuft.`,
  ()=>`Comeback aus 15 Punkten Rückstand! Niemals aufgeben. 🔥`,
  ()=>`Danke an mein Team – ohne euch läuft nichts. 🙌`,
  ()=>`Harte Einheit heute. Defense, Defense, Defense.`,
  ()=>`Neue Saison, neue Ziele. Wir sind heiß. 🏀`,
  ()=>`Throwback ans Derby. Gänsehaut pur.`,
  ()=>`Wir suchen noch Spieler – meldet euch über den Transfermarkt!`,
  ()=>`Trainingslager-Vibes. Diese Truppe macht Spaß.`,
  ()=>`Schiri-Frust beiseite – am Ende zählt, was wir auf dem Court abliefern.`,
  ()=>`Wir suchen dringend eine Halle für ein Zusatztraining im Raum NRW. Tipps?`,
  ()=>`Suchen Schiedsrichter für unser Turnier nächsten Monat. Wer hat Lust?`,
  ()=>`Sponsoren-Update: Danke an unseren neuen Partner – Trikots kommen! 🙏`,
  ()=>`Jugendtraining war heute der Hammer. Die Kids brennen für den Sport. 🌟`,
  ()=>`Saisonabschluss-Grillen war legendär. Auf die nächste Runde!`,
  ()=>`Aufstieg geschafft – ich hab keine Stimme mehr. 🏆`,
  ()=>`MVP-Gefühl heute, aber das Wichtigste: der Sieg.`,
  ()=>`Frühschicht, dann Training. Basketball gibt mir die Energie zurück.`,
  ()=>`Erstes Spiel nach der Verletzung. Einfach nur dankbar, wieder dabei zu sein.`,
  ()=>`Playoffs, wir kommen. Jetzt zählt jedes Rebound.`,
];
for (let i=0;i<150;i++){
  const author=pick(players.filter(p=>p.status==="active"));
  posts.push({ _id:oid(), seedTag:TAG, player:author._id, content:pick(POST_TEMPLATES)(), image:null,
    likes:[], comments:[], createdAt:dateBetween(0,360), updatedAt:now });
}
// e) Vereins-News (Team-Posts)
const NEWS=[
  "Unser Trainer verlängert – Kontinuität auf der Bank! ✍️","Saisonstart steht: erste Heimpartie in zwei Wochen.",
  "Heimspiel am Samstag – bringt Freunde mit! 🏀","Jugendcamp in den Ferien – Anmeldung läuft.",
  "Neuer Sponsor an Bord – danke für die Unterstützung! 🙏","Wir haben eine neue Trainingshalle – mehr Hallenzeit!",
  "Weihnachtsfeier war ein voller Erfolg. 🎄","Sommerfest mit Streetball-Turnier – save the date!",
  "Probetraining für alle Interessierten – kommt vorbei.","Wir suchen ehrenamtliche Helfer fürs Heimspiel-Catering.",
];
for (const t of pickN(teams, 22)) {
  for (let k=0;k<rnd(1,3);k++) posts.push({ _id:oid(), seedTag:TAG, player:null, authorTeam:t._id, teams:[t._id], kind:"user",
    content:pick(NEWS), image:null, likes:[], comments:[], createdAt:dateBetween(0,300), updatedAt:now });
}

// f) Likes + Kommentare auf einen Teil der Posts
const COMMENTS=["Stark! 🔥","Glückwunsch!","Sehe ich genauso 💯","Da geht noch mehr 💪","Respekt!","Nächstes Mal sind wir dran 😉","Gänsehaut.","Top Leistung!"];
for (const post of posts) {
  if (chance(0.65)) {
    const likers=pickN(players, rnd(1,40));
    post.likes=likers.map(p=>p._id);
  }
  if (chance(0.3)) {
    const cs=pickN(players.filter(p=>p.status==="active"), rnd(1,4));
    post.comments=cs.map(p=>({ _id:oid(), player:p._id, text:pick(COMMENTS), likes:[], replies:[], createdAt:new Date(post.createdAt.getTime()+rnd(1,72)*3600000) }));
  }
}

// ===================== EINFÜGEN =====================
for (const t of teams) { const admin=players.find(p=>p.teamId&&String(p.teamId)===String(t._id)&&p.isTeamAdmin); if(admin) t.adminPlayerId=admin._id; }
await C.leagues.insertMany(allLeagues);
await C.teams.insertMany(teams);
await C.players.insertMany(players);
await C.matches.insertMany(allMatches);
await C.teamseasons.insertMany(teamseasons);
await C.tryouts.insertMany(tryouts);
if (transferevents.length) await C.transferevents.insertMany(transferevents);
await C.posts.insertMany(posts);

const counts = {
  leagues: allLeagues.length, teams: teams.length, players: players.length,
  recruiting: teams.filter(t=>t.recruiting).length, verfuegbar: players.filter(p=>p.transferStatus==="verfuegbar").length,
  matches: allMatches.length, completed: allMatches.filter(m=>m.status==="completed").length,
  upcoming: allMatches.filter(m=>m.status==="scheduled").length, posts: posts.length,
  autoPosts: posts.filter(p=>p.kind==="auto").length, teamPosts: posts.filter(p=>p.authorTeam).length,
  tryouts: tryouts.length, transfers: transferevents.length, teamseasons: teamseasons.length,
};
console.log("\n✅ Demo-Welt 'world' angelegt:");
console.log(`   ${counts.leagues} Ligen (8 aktuell + 2 Vorsaison-abgeschlossen mit Meister/Playoffs)`);
console.log(`   ${counts.teams} Teams (${counts.recruiting} Vereinsgesuche) · ${counts.players} Spieler (${counts.verfuegbar} transferbereit)`);
console.log(`   ${counts.matches} Spiele (${counts.completed} gespielt, ${counts.upcoming} anstehend) · ${counts.teamseasons} Saison-Snapshots`);
console.log(`   ${counts.posts} Posts (${counts.autoPosts} Auto, ${counts.teamPosts} Vereins-News) · ${counts.tryouts} Tryouts · ${counts.transfers} Transfers`);
console.log(`   Logins (PW test123): world.coach@demo.de (Köln Sharks-Admin), finn.brandt@demo.de, weitere world<N>@demo.de`);
console.log(`   Entfernen: node scripts/seed-world.mjs --purge`);
await mongoose.disconnect();
process.exit(0);
