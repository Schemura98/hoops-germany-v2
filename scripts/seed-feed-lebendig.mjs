// Lebendiger Feed für die Testphase: erzeugt die EREIGNISSE, die der Newsfeed
// seit dem 18.08.2026 eigens darstellen kann – bestätigte Ergebnisse mit
// Box-Score und Vereinswechsel. Ohne solches Material zeigt der neue Feed vor
// allem, dass nichts passiert ist (siehe Gestaltungsvorschlag, Abschnitt
// „Was das nicht leistet").
//
//   node scripts/seed-feed-lebendig.mjs          → anlegen/aktualisieren
//   node scripts/seed-feed-lebendig.mjs --dry    → nur zeigen, nichts schreiben
//   node scripts/seed-feed-lebendig.mjs --purge  → nur die getaggten Daten löschen
//
// ADDITIV, getaggt (`seedTag: "feed-lebendig"`), idempotent, purgebar.
//
// ⚠️ ZUSTIMMUNGSZAHLEN BEWUSST KLEIN (Roadmap 2, § 5 UWG).
// `seed-world` hat auf Prod 4.073 Likes erzeugt, höchster Einzelwert 40 – der
// echte Bestand trägt 16 Likes bei 15 Beiträgen. Ein Leser liest „40" als
// vierzig Menschen; gegenüber Sponsoren ist das eine Angabe über Reichweite,
// nicht über Inhalte, und der Testphase-Banner federt sie NICHT ab.
// Hier deshalb 0–5 Likes, deterministisch aus dem Index abgeleitet.
//
// ⚠️ DIESES SKRIPT SCHREIBT SPIELE UND BOX-SCORES, nicht nur Beiträge.
// Es ist damit eingriffstiefer als `seed-showcase-posts`. Auf `hoops_prod`
// nur nach ausdrücklicher Freigabe – der Standard-Lauf geht gegen die DB aus
// `.env` (lokal: `hoopsgermany`). Die DB wird vor dem Schreiben angezeigt.
import { readFileSync } from "fs";
import mongoose from "mongoose";
// Die EINE Quelle fuer jede Aussage mit dem Wort „bestaetigt". Bewusst das
// echte Produkt-Praedikat importiert statt die Regel hier nachzubauen: Eine
// zweite Umsetzung derselben Regel laeuft irgendwann auseinander, und die
// Testdaten waeren dann genau dort falsch, wo sie geprueft werden sollen.
import { beidseitigBelegt } from "../lib/matchScore.js";

function readEnv(key) {
  const txt = readFileSync(new URL("../.env", import.meta.url), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (t.slice(0, i).trim() === key) return t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return "";
}

const PURGE = process.argv.includes("--purge");
const DRY = process.argv.includes("--dry");
const TAG = "feed-lebendig";

// Deterministisch statt zufällig: Zwei Läufe erzeugen denselben Bestand, und
// ein Test kann die Zahlen kennen. `Math.random()` hätte hier keinen Nutzen
// und würde die Idempotenz kaputt machen.
const likesFuer = (i) => [0, 3, 1, 5, 2, 4, 0, 2][i % 8];

// Spielpaarungen mit Endstand. Realistische Amateur-Ergebnisse, keine
// Kantersiege – die Tafel soll knappe Spiele zeigen können.
const SPIELE = [
  { heim: 0, gast: 1, hp: 78, gp: 71, tageZurueck: 2, beidseitig: true },
  { heim: 2, gast: 0, hp: 64, gp: 69, tageZurueck: 5, beidseitig: true },
  { heim: 1, gast: 3, hp: 91, gp: 88, tageZurueck: 9, beidseitig: true },
  { heim: 3, gast: 2, hp: 55, gp: 72, tageZurueck: 13, beidseitig: false },
  // ⚠️ DER HÄUFIGSTE ZUSTAND DER LIVE-SEITE – und er fehlte hier (Befund Kai,
  // Gate 18.08.2026). Auf `hoops_prod` tragen 137 von 137 abgeschlossenen
  // Spielen `resultStatus: "confirmed"` OHNE beidseitiges `submittedBy`: ein
  // Super-Admin hat das Ergebnis gesetzt. Im Feed ist das die Stufe „fest"
  // („Ergebnis steht fest"), NICHT „von beiden bestätigt".
  // Ohne dieses Datum konnte niemand – weder ich noch ein Browser-Gate – sehen,
  // wie die häufigste Stufe überhaupt aussieht.
  { heim: 0, gast: 3, hp: 83, gp: 79, tageZurueck: 17, adminGesetzt: true },
];

// Box-Score-Zeilen je Spiel: [punkte, assists, rebounds] pro Spieler-Index.
// Bewusst gemischt – ein Aufbauspieler mit vielen Assists und wenig Punkten
// ist der Fall, für den die Hauptzahl-Regel in `lib/eigeneZahlen.js` da ist.
const STATS = [
  [[14, 5, 2], [8, 11, 3], [21, 2, 7], [6, 3, 9], [11, 4, 4]],
  [[9, 7, 5], [17, 3, 2], [4, 9, 11], [13, 2, 6], [7, 6, 3]],
  [[22, 4, 3], [5, 12, 2], [16, 3, 8], [10, 5, 5], [3, 2, 12]],
  [[6, 2, 4], [12, 6, 3], [8, 4, 9], [15, 3, 2], [9, 8, 5]],
];

const uri = readEnv("MONGODB_URI");
if (!uri) { console.error("❌ MONGODB_URI fehlt"); process.exit(1); }

await mongoose.connect(uri);
const db = mongoose.connection.db;
console.log(`Datenbank: ${db.databaseName}`);

// ⚠️ POSITIVER RIEGEL, nicht negativer (Befund Kai, Gate 18.08.2026).
//
// Hier stand `if (databaseName === "test") abbrechen`. Das ist die
// Produktiv-DB der ALTEN Seite – die der AKTUELLEN heißt `hoops_prod` und
// wäre ungehindert durchgelaufen. Ein Riegel, der die falsche Tür zuhält.
//
// Die Reichweite ist größer als bei den bestehenden Seed-Skripten: Dieses hier
// schreibt SPIELE mit `leagueId` und BOX-SCORES. Beide werden von öffentlichen
// Flächen unabhängig vom Feed eingesammelt – `computeStandings` für die
// Liga-Tabelle, und die Topscorer-Liste filtert nur auf `status: "completed"`.
// Ein Fehlgriff erfände also Tabellenstände und Bestenlisten, nicht bloß
// Feed-Kosmetik.
//
// Deshalb: nur die Dev-DB ist erlaubt. Alles andere braucht ein ausdrückliches
// `--ich-weiss-was-ich-tue` UND steht dann noch im Protokoll. Laut CLAUDE.md
// ist `seed-demo.mjs` irgendwann tatsächlich gegen `hoops_prod` gelaufen und
// „protokolliert ist das nirgends" – der Weg ist real begangen worden.
const ERLAUBTE_DB = "hoopsgermany";
const FREIGABE = process.argv.includes("--ich-weiss-was-ich-tue");
if (db.databaseName !== ERLAUBTE_DB && !FREIGABE) {
  console.error(
    `❌ Abbruch: Dieses Skript ist für die Dev-DB "${ERLAUBTE_DB}" gedacht, ` +
      `verbunden ist aber "${db.databaseName}".\n` +
      `   Es schreibt Spiele und Box-Scores – die landen in Liga-Tabelle und ` +
      `Topscorer-Liste, nicht nur im Feed.\n` +
      `   Wenn das wirklich gewollt ist: --ich-weiss-was-ich-tue anhängen.`
  );
  process.exit(1);
}
if (FREIGABE && db.databaseName !== ERLAUBTE_DB) {
  console.warn(`⚠️  Schreibe auf "${db.databaseName}" – ausdrücklich freigegeben.`);
}

const Teams = db.collection("teams");
const Players = db.collection("players");
const Matches = db.collection("matches");
const Posts = db.collection("posts");

if (PURGE) {
  const p = await Posts.deleteMany({ seedTag: TAG });
  const m = await Matches.deleteMany({ seedTag: TAG });
  console.log(`🧹 Entfernt: ${p.deletedCount} Beiträge, ${m.deletedCount} Spiele.`);
  await mongoose.disconnect();
  process.exit(0);
}

// Vier Teams mit Kader suchen – ohne echte Teams hat das Skript nichts zu tun.
const teams = await Teams.find({}).limit(4).toArray();
if (teams.length < 4) {
  console.error(`❌ Nur ${teams.length} Teams gefunden, 4 nötig. Erst 'node scripts/seed-demo.mjs' laufen lassen.`);
  process.exit(1);
}
console.log(`Teams: ${teams.map((t) => t.teamName).join(", ")}`);

const kader = new Map();
for (const t of teams) {
  const sp = await Players.find({ teamId: t._id }).limit(5).toArray();
  kader.set(String(t._id), sp);
}

let neueSpiele = 0, neueBeitraege = 0;

for (let i = 0; i < SPIELE.length; i++) {
  const s = SPIELE[i];
  const heim = teams[s.heim], gast = teams[s.gast];
  const datum = new Date(Date.now() - s.tageZurueck * 864e5);
  // Idempotenz-Schlüssel: dieselbe Paarung am selben Tag wird nicht doppelt angelegt.
  const key = `${TAG}:${heim._id}:${gast._id}:${s.tageZurueck}`;

  const heimSpieler = kader.get(String(heim._id)) || [];
  const gastSpieler = kader.get(String(gast._id)) || [];
  const playerStats = [];
  // ⚠️ Beide Zeilen mit `% STATS.length` – und die Länge wird an DEM Feld
  // gemessen, aus dem auch gelesen wird (Befund Kai 6c, Gate 18.08.2026).
  // Vorher stand `STATS[i][...]` ohne Modulo und `[k % STATS[i].length]` für
  // die Gastzeile, die aus `STATS[i+1]` liest. Kai hatte es als latent
  // gemeldet („bricht still, sobald eine Zeile abweicht"). Beim Ergänzen des
  // fünften Spiels ist es sofort hart gebrochen – `STATS[4]` gibt es nicht.
  // Aus latent wurde akut, bevor der Befund abgearbeitet war.
  const zeile = (n) => STATS[n % STATS.length];
  heimSpieler.forEach((p, k) => {
    const feld = zeile(i);
    const w = feld[k % feld.length];
    playerStats.push({ player: p._id, team: heim._id, points: w[0], assists: w[1], rebounds: w[2], didNotPlay: false });
  });
  gastSpieler.forEach((p, k) => {
    const feld = zeile(i + 1);
    const w = feld[k % feld.length];
    playerStats.push({ player: p._id, team: gast._id, points: w[0], assists: w[1], rebounds: w[2], didNotPlay: false });
  });

  const heimGewinnt = s.hp > s.gp;
  const doc = {
    teamA: heim._id, teamB: gast._id,
    date: datum, location: `${heim.region || "Halle"} · Sporthalle`,
    leagueId: heim.leagueId || null,
    status: "completed",
    winningTeam: heimGewinnt ? heim._id : gast._id,
    winningTeamPoints: Math.max(s.hp, s.gp),
    losingTeamPoints: Math.min(s.hp, s.gp),
    playerStats,
    // ⚠️ `submittedBy` auf BEIDEN Seiten ist der Unterschied zwischen
    // „bestätigt" und „ein Admin hat es eingetragen". `beidseitigBelegt()`
    // prüft genau das – ohne diese Felder wäre die Beleg-Zeile im Feed eine
    // Falschaussage (auf Prod tragen 137 von 137 Spielen genau diesen Mangel).
    teamAResult: { ownPoints: s.hp, opponentPoints: s.gp, submittedAt: datum,
      ...(s.beidseitig && heimSpieler[0] ? { submittedBy: heimSpieler[0]._id } : {}) },
    teamBResult: { ownPoints: s.gp, opponentPoints: s.hp, submittedAt: datum,
      ...(s.beidseitig && gastSpieler[0] ? { submittedBy: gastSpieler[0]._id } : {}) },
    // `adminGesetzt` = bestätigt, aber ohne beidseitigen Absender (s. o.).
    resultStatus: s.beidseitig || s.adminGesetzt ? "confirmed" : "pending",
    seedTag: TAG, seedKey: key,
  };

  if (DRY) {
    console.log(`  [dry] ${heim.teamName} ${s.hp}:${s.gp} ${gast.teamName} · ${s.beidseitig ? "beidseitig bestätigt" : "vorläufig"} · ${playerStats.length} Box-Score-Zeilen`);
    continue;
  }

  const r = await Matches.findOneAndUpdate(
    { seedKey: key }, { $set: doc }, { upsert: true, returnDocument: "after" }
  );
  const match = r.value || (await Matches.findOne({ seedKey: key }));
  if (!match) continue;
  neueSpiele++;

  // Der Feed-Beitrag – exakt in der Form, die `lib/autoPost.js` erzeugt.
  // ⚠️ Wer dort `meta` ändert, muss es HIER mitziehen; sonst sehen die
  // Testdaten anders aus als echte Ereignisse, und genau das würde beim
  // Prüfen des Designs niemandem auffallen.
  // ⚠️ DIE STUFE WIRD AUS DEM ERZEUGTEN SPIEL ABGELEITET, nicht aus der
  // Absicht (Befund Kai, Gate 18.08.2026).
  //
  // Vorher hing der NACHWEIS an einer Zusatzbedingung (`s.beidseitig &&
  // heimSpieler[0]`), die BEHAUPTUNG aber nur an `s.beidseitig`. Fehlt einem
  // Team der Kader, entstünde ein Spiel ohne beidseitigen Absender – und der
  // Beitrag trüge trotzdem das grüne Siegel. Im Feed „bestätigt", auf
  // `/match/[id]` kein Abzeichen: exakt der Widerspruch, den Tobias am
  // 15.08.2026 gefunden hat.
  // Jetzt kann es per Konstruktion nicht auseinanderlaufen – dieselbe Regel
  // wie im Produkt: Was „bestätigt" heißen darf, entscheidet der Datensatz.
  const beidseitigEcht = beidseitigBelegt(doc);
  const belegStufe = beidseitigEcht
    ? "beidseitig"
    : doc.resultStatus === "confirmed"
    ? "fest"
    : "vorlaeufig";
  const note =
    belegStufe === "beidseitig"
      ? "Von beiden Teams bestätigt"
      : belegStufe === "fest"
      ? "Ergebnis steht fest"
      : "Vorläufig – noch nicht vom Gegner bestätigt";
  if (s.beidseitig && !beidseitigEcht) {
    console.warn(`  ⚠️  ${heim.teamName} vs ${gast.teamName}: beidseitig gewollt, aber ein Kader ist leer – Beitrag wird als vorläufig ausgewiesen.`);
  }

  await Posts.updateOne(
    { eventKey: `result:${match._id}` },
    {
      $set: {
        kind: "auto", autoType: "match_result",
        content: `${heim.teamName} ${s.hp}:${s.gp} ${gast.teamName}`,
        teams: [heim._id, gast._id],
        meta: {
          href: `/match/${match._id}`, note,
          matchId: String(match._id),
          heim: heim.teamName, gast: gast.teamName,
          heimPunkte: s.hp, gastPunkte: s.gp,
          belegStufe,
        },
        seedTag: TAG,
      },
      $setOnInsert: { likes: [], comments: [], createdAt: datum },
    },
    { upsert: true }
  );
  neueBeitraege++;
}

// Ein Vereinswechsel, damit auch diese Form im Feed vorkommt.
if (!DRY) {
  const wechsler = (kader.get(String(teams[1]._id)) || [])[1];
  if (wechsler) {
    const key = `${TAG}:transfer:${wechsler._id}`;
    await Posts.updateOne(
      { eventKey: key },
      {
        $set: {
          kind: "auto", autoType: "transfer",
          content: `${wechsler.firstName} ${wechsler.lastName} wechselt zu ${teams[0].teamName}.`,
          subjectPlayer: wechsler._id,
          teams: [teams[1]._id, teams[0]._id],
          meta: { href: wechsler.slug ? `/player/view-player/${wechsler.slug}` : null },
          seedTag: TAG,
        },
        $setOnInsert: { likes: [], comments: [], createdAt: new Date(Date.now() - 3 * 864e5) },
      },
      { upsert: true }
    );
    neueBeitraege++;
  }
}

// Zustimmungszahlen: klein und deterministisch (s. Kopf).
if (!DRY) {
  const alle = await Posts.find({ seedTag: TAG }).toArray();
  const geber = await Players.find({}).limit(6).toArray();
  for (let i = 0; i < alle.length; i++) {
    const n = likesFuer(i);
    await Posts.updateOne({ _id: alle[i]._id }, { $set: { likes: geber.slice(0, n).map((p) => p._id) } });
  }
  const summe = alle.reduce((a, _, i) => a + likesFuer(i), 0);
  console.log(`Zustimmungen gesetzt: ${summe} auf ${alle.length} Beiträge (höchster Einzelwert ${Math.max(...alle.map((_, i) => likesFuer(i)))}).`);
}

console.log(DRY ? "— Vorschau, nichts geschrieben." : `✅ ${neueSpiele} Spiele, ${neueBeitraege} Beiträge (Tag: ${TAG}).`);
await mongoose.disconnect();
