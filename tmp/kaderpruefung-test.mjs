// Prueft die neue Kaderpruefung in /api/team/match-stats/save.
//
// Wichtigster Fall ist NICHT die Abwehr, sondern der Normalfall: Eine
// Sicherheitspruefung, die legitime Speicherungen ablehnt, ist schlimmer als
// die Luecke, die sie schliesst.
//
// Aufruf: node tmp/kaderpruefung-test.mjs   (Dev-Server auf 3000 noetig)
const BASIS = "http://localhost:3000";

async function post(pfad, daten) {
  const r = await fetch(BASIS + pfad, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(daten),
  });
  let j = null;
  try {
    j = await r.json();
  } catch {
    /* leere Antwort */
  }
  return { status: r.status, body: j };
}

const zeile = (name, erwartet, ist, ok) =>
  console.log(`${ok ? "  ok  " : "  FEHL"} ${name.padEnd(52)} erwartet ${erwartet}, war ${ist}`);

let fehler = 0;
function pruefe(name, erwartet, ist) {
  const ok = erwartet === ist;
  if (!ok) fehler++;
  zeile(name, erwartet, ist, ok);
}

// 1. Anmelden als Team-Admin von „Test Baskets".
const login = await post("/api/player/playerlogin", {
  email: "max@test.de",
  password: "test123",
});
const token = login.body?.token || login.body?.data?.token;
if (!token) {
  console.error("Login fehlgeschlagen:", login.status, login.body);
  process.exit(1);
}

// 2. Eigenes Team und ein beendetes Spiel finden.
const info = await post("/api/team/fetchinfo", { token });
const team = info.body?.team || info.body?.data?.team;
const spiele = await post("/api/team/matches/list", { token });
const liste = spiele.body?.matches || spiele.body?.data?.matches || [];
const spiel = liste.find((m) => m.status === "completed");
if (!team || !spiel) {
  console.error("Kein Team oder kein beendetes Spiel gefunden.");
  process.exit(1);
}
console.log(`Team: ${team.teamName} · Spiel: ${spiel._id}\n`);

// 3. Bestehenden Box-Score dieses Teams sichern, um am Ende zurueckzustellen.
const detail = await fetch(`${BASIS}/api/match/${spiel._id}`).then((r) => r.json());
const alleStats = detail?.match?.playerStats || detail?.playerStats || [];
const eigene = alleStats.filter((s) => String(s.team) === String(team._id));
const originalStats = eigene.map((s) => ({
  playerId: s.player?._id || s.player || null,
  playerName: s.playerName,
  rosterSlotId: s.rosterSlotId,
  points: s.points,
  assists: s.assists,
  rebounds: s.rebounds,
  didNotPlay: s.didNotPlay,
}));
console.log(`Bestehende eigene Einträge: ${originalStats.length}`);

// 4. NORMALFALL: unveraendert zurueckschreiben. Muss durchgehen.
const normal = await post("/api/team/match-stats/save", {
  token,
  matchId: spiel._id,
  stats: originalStats,
});
pruefe("Normalfall: eigener Kader speichert", 200, normal.status);

// 5. ANGRIFF: fremde playerId aus der oeffentlichen Spielerliste.
const alle = await post("/api/player/fetchall", {});
const spieler = alle.body?.players || alle.body?.data?.players || [];
const fremder = spieler.find(
  (p) => String(p.teamId?._id || p.teamId || "") !== String(team._id),
);
if (!fremder) {
  console.log("  (kein teamfremder Spieler in der Dev-DB — Angriffsfall übersprungen)");
} else {
  const angriff = await post("/api/team/match-stats/save", {
    token,
    matchId: spiel._id,
    stats: [{ playerId: fremder._id, points: 99, assists: 9, rebounds: 9 }],
  });
  pruefe(`Angriff: fremder Spieler (${fremder.firstName})`, 403, angriff.status);
}

// 6. ANGRIFF: fremde rosterSlotId.
const angriffSlot = await post("/api/team/match-stats/save", {
  token,
  matchId: spiel._id,
  stats: [{ rosterSlotId: "64b7f1c2e4b0a1a1a1a1a1a1", playerName: "Fremd", points: 50 }],
});
pruefe("Angriff: fremder Kaderplatz", 403, angriffSlot.status);

// 7. Zustand wiederherstellen.
const zurueck = await post("/api/team/match-stats/save", {
  token,
  matchId: spiel._id,
  stats: originalStats,
});
pruefe("Wiederherstellung des Ausgangszustands", 200, zurueck.status);

console.log(fehler === 0 ? "\nAlles wie erwartet." : `\n${fehler} Abweichung(en).`);
process.exit(fehler === 0 ? 0 : 1);
