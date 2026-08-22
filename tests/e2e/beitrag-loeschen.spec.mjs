// Löschen von Beiträgen, Kommentaren und Antworten (Roadmap 37).
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM ES DIESEN WÄCHTER BRAUCHT
// ═══════════════════════════════════════════════════════════════════════════
// Das hier ist die ERSTE löschende Funktion, die ein normaler Nutzer auslösen
// kann. Alles bisher Destruktive lag hinter dem Super-Admin-Panel. Ein Fehler
// in einer Anzeige ist ärgerlich; ein Fehler hier ist unumkehrbar — es gibt
// kein Lösch-Kennzeichen und keinen Papierkorb, das ist bewusst so entschieden
// (Begründung im Kopf von `app/api/posts/deletepost/route.js`).
//
// Die Route trägt DREI gesetzte Sperren. Jede einzelne ist die Art Zusage, die
// grün aussieht, solange niemand sie prüft:
//   1. Ereignis-Beiträge (`kind === "auto"`) sind für NIEMANDEN löschbar,
//      auch nicht für ihren Verfasser. Sie sind die Anzeige einer belegten
//      Tatsache — die gesamte Positionierung der Plattform hängt daran.
//   2. Gelöscht werden darf nur, was mir gehört. Ausdrücklich NICHT: fremde
//      Kommentare unter meinem eigenen Beitrag (das wäre Moderation).
//   3. Ohne Anmeldung geht gar nichts.
//
// ⚠️ JEDE dieser drei Sperren wurde beim Bau dieses Wächters mindestens einmal
// durch eine Gegenprobe ROT gesehen. Ein grüner Test, der nicht rot werden
// kann, sichert nichts. Das Protokoll steht in
// `docs/GATE-KAI-ROADMAP-37-2026-08-22.md`.
//
// ⚠️ JEDER FALL BEKOMMT EIGENE, FRISCHE DATEN. Das ist keine Umständlichkeit:
// Beim ersten Messlauf hat eine Einschleusungs-Probe die Testdaten des
// nächsten Falls mitgelöscht, und drei Fälle meldeten danach „404 nicht
// gefunden" statt der Berechtigungsantwort, die sie prüfen sollten. Ein
// löschender Test, der sich Daten mit einem anderen teilt, misst beim zweiten
// Fall etwas anderes als beim ersten.
//
// ⚠️ HARTE GRENZE: `requireDevDbUri()` bricht ab, sobald die Verbindung nicht
// auf die Dev-DB `hoopsgermany` zeigt. Dieser Test LEGT DATEN AN UND LÖSCHT
// SIE — er darf niemals gegen `hoops_prod` oder `test` laufen.
import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import { requireDevDbUri } from "./helpers/env.mjs";

const MARKE = "kai-r37-waechter";
const MAX = "max@test.de";
const SVEN = "sven.adler@test.de";

let db, posts, players, maxId, svenId, maxTeam, fremdTeam;

test.beforeAll(async () => {
  await mongoose.connect(requireDevDbUri());
  db = mongoose.connection.db;
  // Zweiter Riegel, unabhängig vom Helfer: Wer die Prüfung im Helfer eines
  // Tages lockert, soll hier trotzdem anstoßen.
  expect(
    db.databaseName,
    "Dieser Test schreibt und löscht. Er läuft NUR gegen die Dev-DB.",
  ).toBe("hoopsgermany");
  posts = db.collection("posts");
  players = db.collection("players");

  const max = await players.findOne({ email: MAX }, { projection: { teamAdminOf: 1 } });
  const sven = await players.findOne({ email: SVEN }, { projection: { teamAdminOf: 1 } });
  expect(max, `Testkonto ${MAX} fehlt in der Dev-DB (node scripts/seed-demo.mjs)`).toBeTruthy();
  expect(sven, `Testkonto ${SVEN} fehlt in der Dev-DB (node scripts/seed-demo.mjs)`).toBeTruthy();
  maxId = max._id;
  svenId = sven._id;
  maxTeam = max.teamAdminOf;
  expect(
    maxTeam,
    `${MAX} muss Team-Admin sein, sonst kann der Vereins-Zweig der Route nicht ` +
      `geprüft werden und die Hälfte der Berechtigungslogik bleibt ungemessen.`,
  ).toBeTruthy();
  expect(
    sven.teamAdminOf,
    `${SVEN} darf KEIN Team-Admin sein — sonst prüft der Gegenfall nichts.`,
  ).toBeFalsy();
  fremdTeam = new mongoose.Types.ObjectId();

  // Reste eines abgebrochenen Vorlaufs wegräumen. Ein Test, der seinen
  // Ausgangszustand nicht herstellt, ist beim zweiten Lauf rot.
  await posts.deleteMany({ kaiMarke: MARKE });
});

// ⚠️ NACH JEDEM FALL AUFRÄUMEN, NICHT ERST AM ENDE (Befund Tobias,
// Roadmap 38b, 22.08.2026). Der Kopf dieser Datei sagt seit dem ersten Tag
// „JEDER FALL BEKOMMT EIGENE, FRISCHE DATEN" — umgesetzt war davon nur die
// eine Hälfte: Jeder Fall LEGT eigene an, weggeräumt wurde erst in `afterAll`.
//
// Gemessen liegen dadurch zum Zeitpunkt des letzten Falls **16** erfundene
// Beiträge im Bestand, 11 davon von max, alle Sekunden alt. Der „Für dich"-Feed
// rankt mit `base / (Alter + 2)^1.5` — sekundenfrische Beiträge verdrängen also
// alles andere, und Beiträge MIT Kommentaren (base 7 statt 1) ganz besonders.
// Ergebnis auf Seite 1 (10 Einträge), am 22.08.2026 gemessen:
//
//   ohne die Rückstände (= Einzellauf):  6 fremde Beiträge
//   mit den Rückständen (= Dateilauf):   0 fremde Beiträge → der letzte Fall
//                                        findet keinen fremden Autor und
//                                        erklärt sich für wertlos
//
// Der Fall war also allein grün und in der Datei rot, bei identischer
// Datenbank. Ein löschender Test, der seine Kulissen stehen lässt, misst nicht
// nur beim zweiten Lauf etwas anderes — er verändert die Seite, die ein
// SPÄTERER Fall betrachtet. Dieselbe Familie wie „eine Messung darf ihren
// eigenen Gegenstand nicht mitmessen", nur über Fallgrenzen hinweg.
test.afterEach(async () => {
  if (posts) await posts.deleteMany({ kaiMarke: MARKE });
});

test.afterAll(async () => {
  if (posts) await posts.deleteMany({ kaiMarke: MARKE });
  await mongoose.disconnect();
});

const oid = () => new mongoose.Types.ObjectId();

// Legt EINEN Beitrag an und gibt seine ID als Zeichenkette zurück.
async function beitrag(felder) {
  const _id = oid();
  await posts.insertOne({
    _id, kaiMarke: MARKE, createdAt: new Date(), likes: [], comments: [], ...felder,
  });
  return String(_id);
}

// Beitrag von max, darunter EIN Kommentar von sven mit ZWEI Antworten
// (eine von max, eine von sven). Diese eine Form deckt alle Kommentar-Fälle ab.
async function beitragMitKommentar() {
  const pId = oid(), kId = oid(), rMax = oid(), rSven = oid();
  await posts.insertOne({
    _id: pId, kaiMarke: MARKE, createdAt: new Date(), likes: [],
    player: maxId, kind: "user", content: "Träger",
    comments: [{
      _id: kId, player: svenId, text: "svens Kommentar", likes: [], createdAt: new Date(),
      replies: [
        { _id: rMax, player: maxId, text: "max Antwort", likes: [], createdAt: new Date() },
        { _id: rSven, player: svenId, text: "sven Antwort", likes: [], createdAt: new Date() },
      ],
    }],
  });
  return { pId: String(pId), kId: String(kId), rMax: String(rMax), rSven: String(rSven) };
}

async function lebt(id) {
  return !!(await posts.findOne({ _id: new mongoose.Types.ObjectId(id) }));
}

// Zustand eines Trägers: wie viele Kommentare, wie viele Antworten am ersten.
async function zustand(id) {
  const d = await posts.findOne({ _id: new mongoose.Types.ObjectId(id) });
  if (!d) return { weg: true };
  return { weg: false, kommentare: d.comments.length, antworten: d.comments[0]?.replies?.length ?? null };
}

async function anmelden(request, email) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email, password: "test123" },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Keine Anmeldung für ${email} — ohne Token prüft dieser Test nichts. ` +
      `Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

// Ein Aufruf. Gibt { status, message } zurück, nie einen Wurf.
async function ruf(request, pfad, daten) {
  const res = await request.post(pfad, { data: daten, failOnStatusCode: false });
  const j = await res.json().catch(() => ({}));
  return { status: res.status(), message: j?.message || "" };
}

// ═══════════════════════════════════════════════════════════════════════════
// SPERRE 1 — Ereignis-Beiträge sind unlöschbar
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Sperre 1: Ergebnisse und Transfers lassen sich nicht löschen", () => {
  test("eigener Ereignis-Beitrag: abgewiesen und noch da", async ({ request }) => {
    const token = await anmelden(request, MAX);
    const id = await beitrag({
      player: maxId, kind: "auto", autoType: "match_result", content: "Endergebnis",
    });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(r.status, `Ein Ergebnis-Beitrag muss 403 geben, gab ${r.status}: ${r.message}`).toBe(403);
    // ⚠️ Die zweite Zusicherung ist die wichtigere. Ein Statuscode ist eine
    // AUSSAGE über das Löschen, kein Beleg dafür, dass nichts gelöscht wurde.
    expect(await lebt(id), "403 gemeldet, Beitrag aber trotzdem weg").toBe(true);
  });

  test("Ereignis-Beitrag des eigenen Vereins: abgewiesen und noch da", async ({ request }) => {
    const token = await anmelden(request, MAX);
    const id = await beitrag({
      player: null, authorTeam: maxTeam, kind: "auto", autoType: "transfer", content: "Transfer",
    });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(
      r.status,
      `Der Vereins-Zweig darf die Ereignis-Sperre nicht aushebeln — ein ` +
        `Team-Admin könnte sonst jedes Ergebnis seines Vereins verschwinden lassen.`,
    ).toBe(403);
    expect(await lebt(id)).toBe(true);
  });

  test("die Sperre verbietet nicht ALLES: ein normaler eigener Beitrag geht weg", async ({ request }) => {
    // Gegenrichtung. Ohne diesen Fall wäre eine Route, die pauschal 403 gibt,
    // vollständig grün — und die Funktion gäbe es faktisch nicht.
    const token = await anmelden(request, MAX);
    const id = await beitrag({ player: maxId, kind: "user", content: "normal" });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(r.status, `Eigener normaler Beitrag muss löschbar sein, gab ${r.status}`).toBe(200);
    expect(await lebt(id), "200 gemeldet, Beitrag aber noch da").toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SPERRE 2 — nur was mir gehört
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Sperre 2: nur eigene Beiträge", () => {
  test("fremder Beitrag: abgewiesen und noch da", async ({ request }) => {
    const token = await anmelden(request, SVEN);
    const id = await beitrag({ player: maxId, kind: "user", content: "gehört max" });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(r.status).toBe(403);
    expect(await lebt(id), "Ein fremder Beitrag wurde gelöscht").toBe(true);
  });

  test("ohne Anmeldung: 401 und noch da", async ({ request }) => {
    const id = await beitrag({ player: maxId, kind: "user", content: "gehört max" });
    const r = await ruf(request, "/api/posts/deletepost", { postId: id });
    expect(r.status).toBe(401);
    expect(await lebt(id)).toBe(true);
  });

  test("Müll-Token: 401 und noch da", async ({ request }) => {
    const id = await beitrag({ player: maxId, kind: "user", content: "gehört max" });
    const r = await ruf(request, "/api/posts/deletepost", { token: "abc.def.ghi", postId: id });
    expect(r.status).toBe(401);
    expect(await lebt(id)).toBe(true);
  });

  test("Beitrag eines FREMDEN Vereins: abgewiesen und noch da", async ({ request }) => {
    const token = await anmelden(request, MAX);
    const id = await beitrag({ player: null, authorTeam: fremdTeam, kind: "user", content: "fremder Verein" });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(r.status).toBe(403);
    expect(await lebt(id)).toBe(true);
  });

  test("Beitrag des EIGENEN Vereins: der Team-Admin darf, ein anderer nicht", async ({ request }) => {
    // Beide Richtungen in einem Fall, mit je EIGENEM Beitrag — sonst löscht
    // die erste Hälfte den Gegenstand der zweiten.
    const svenToken = await anmelden(request, SVEN);
    const fuerSven = await beitrag({ player: null, authorTeam: maxTeam, kind: "user", content: "Verein" });
    const a = await ruf(request, "/api/posts/deletepost", { token: svenToken, postId: fuerSven });
    expect(a.status, "Wer nicht Admin dieses Vereins ist, darf nicht").toBe(403);
    expect(await lebt(fuerSven)).toBe(true);

    const maxToken = await anmelden(request, MAX);
    const fuerMax = await beitrag({ player: null, authorTeam: maxTeam, kind: "user", content: "Verein" });
    const b = await ruf(request, "/api/posts/deletepost", { token: maxToken, postId: fuerMax });
    expect(b.status, "Der Admin des Vereins muss dürfen").toBe(200);
    expect(await lebt(fuerMax)).toBe(false);
  });

  test('Beitrag ohne Autor: der "null gleich null"-Fall greift NICHT', async ({ request }) => {
    // Die Route prüft `post.authorTeam && player.teamAdminOf && String(a)===String(b)`.
    // Ohne die beiden Wahrheitsprüfungen davor würde `String(undefined)` auf
    // beiden Seiten "undefined" ergeben und jeder herrenlose Beitrag wäre für
    // jeden Nutzer ohne Verein löschbar. Gemessen statt geglaubt.
    const token = await anmelden(request, SVEN); // sven hat kein teamAdminOf
    const id = await beitrag({ player: null, authorTeam: null, kind: "user", content: "herrenlos" });
    const r = await ruf(request, "/api/posts/deletepost", { token, postId: id });
    expect(
      r.status,
      `Ein Beitrag ohne Autor wurde für einen Nutzer ohne Verein löschbar — ` +
        `das ist der "null === null"-Vergleich.`,
    ).toBe(403);
    expect(await lebt(id)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SPERRE 3 — fremde Kommentare bleiben stehen
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Sperre 3: fremde Kommentare und Antworten", () => {
  test("fremder Kommentar unter dem EIGENEN Beitrag: bleibt stehen", async ({ request }) => {
    // Der Kernfall der Entscheidung „aufräumen, nicht moderieren": max ist
    // Verfasser des Beitrags und hat trotzdem keinen Zugriff auf svens Kommentar.
    const token = await anmelden(request, MAX);
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", { token, postId: f.pId, commentId: f.kId });
    expect(r.status, "Der Verfasser eines Beitrags darf fremde Kommentare nicht löschen").toBe(403);
    expect(await zustand(f.pId)).toMatchObject({ kommentare: 1, antworten: 2 });
  });

  test("fremde Antwort unter dem eigenen Beitrag: bleibt stehen", async ({ request }) => {
    const token = await anmelden(request, MAX);
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", {
      token, postId: f.pId, commentId: f.kId, replyId: f.rSven,
    });
    expect(r.status).toBe(403);
    expect(await zustand(f.pId)).toMatchObject({ kommentare: 1, antworten: 2 });
  });

  test("ohne Anmeldung: 401, nichts verschwindet", async ({ request }) => {
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", { postId: f.pId, commentId: f.kId });
    expect(r.status).toBe(401);
    expect(await zustand(f.pId)).toMatchObject({ kommentare: 1, antworten: 2 });
  });

  test("EIGENE Antwort unter fremdem Kommentar: geht, und NUR sie", async ({ request }) => {
    // Gegenrichtung zu Sperre 3 und zugleich die feinste Zusicherung der Route:
    // Der Zugriff hängt an der Antwort, nicht am Kommentar darüber.
    const token = await anmelden(request, MAX);
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", {
      token, postId: f.pId, commentId: f.kId, replyId: f.rMax,
    });
    expect(r.status).toBe(200);
    const z = await zustand(f.pId);
    expect(z.kommentare, "Der fremde Kommentar darüber wurde mitgenommen").toBe(1);
    expect(z.antworten, "Es sollte genau EINE Antwort verschwinden").toBe(1);
  });

  test("eigener Kommentar: geht weg und nimmt die Antworten mit", async ({ request }) => {
    // Dokumentierte Entscheidung (Antworten sind IN den Kommentar eingebettet).
    // Sie steht hier, damit ein späterer Umbau auf verwaiste Antworten auffällt.
    const token = await anmelden(request, SVEN);
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", { token, postId: f.pId, commentId: f.kId });
    expect(r.status).toBe(200);
    const z = await zustand(f.pId);
    expect(z.weg, "Der ganze BEITRAG ist verschwunden, gelöscht war nur ein Kommentar").toBe(false);
    expect(z.kommentare).toBe(0);
  });

  test('"replyId" mit leerem Wert löscht NICHT den ganzen Kommentar', async ({ request }) => {
    // ⚠️ GEGENSTAND DIESES FALLS: Die Route unterscheidet über `if (body.replyId)`,
    // also über den WAHRHEITSWERT. Ein Aufrufer, der `replyId: antwort?._id`
    // schickt und dabei `undefined`/`null` erwischt, fällt stillschweigend in
    // den Kommentar-Zweig — aus „meine Antwort löschen" wird „mein Kommentar
    // mit allen Antworten löschen", quittiert mit 200 und dem falschen Text.
    // Die Oberfläche schickt heute immer eine echte ID, der Weg ist also nicht
    // erreichbar. Dieser Fall hält fest, dass er es bleibt.
    const token = await anmelden(request, SVEN); // svens EIGENER Kommentar
    const f = await beitragMitKommentar();
    const r = await ruf(request, "/api/posts/deletecomment", {
      token, postId: f.pId, commentId: f.kId, replyId: null,
    });
    const z = await zustand(f.pId);
    expect(
      z.kommentare,
      `Mit leerem "replyId" verschwand der ganze Kommentar samt Antworten ` +
        `(Antwort der Route: ${r.status} ${r.message}). Erwartet wird eine ` +
        `Abweisung oder das Löschen NUR der Antwort — nie eine stille Ausweitung.`,
    ).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EINSCHLEUSUNG — Abfrage-Operatoren statt einer ID
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Einschleusung: Operatoren statt einer ID", () => {
  // `body.postId` geht ungeprüft in `Post.findById`. Mongoose wandelt einen
  // Teil dieser Werte in eine GÜLTIGE Abfrage um — `{$ne: null}` etwa trifft
  // einen beliebigen Beitrag statt zu werfen. Dass nichts passiert, hängt
  // allein an der Berechtigungsprüfung auf dem GEFUNDENEN Dokument. Dieser
  // Fall hält fest, dass diese letzte Instanz hält.
  const NUTZLASTEN = [
    ["$ne null", { $ne: null }],
    ["$gt leer", { $gt: "" }],
    ["$exists", { $exists: true }],
    ["$where", { $where: "1==1" }],
    ["$regex", { $regex: ".*" }],
    ["Array", ["aaaaaaaaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbbbbbbbb"]],
    ["$in", { $in: ["aaaaaaaaaaaaaaaaaaaaaaaa"] }],
    ["true", true],
    ["rohes Objekt", { a: 1 }],
  ];

  test("deletepost: keine Nutzlast löscht irgendetwas", async ({ request }) => {
    const token = await anmelden(request, SVEN);
    // Ein eigener Beitrag von sven muss im Bestand liegen — sonst könnte eine
    // Nutzlast, die „einen beliebigen Beitrag" trifft, gar nichts Löschbares
    // finden und der Fall wäre grün, ohne geprüft zu haben.
    const koeder = await beitrag({ player: svenId, kind: "user", content: "Köder für die Einschleusung" });
    const vorher = await posts.countDocuments({});
    const antworten = [];
    for (const [name, wert] of NUTZLASTEN) {
      const r = await ruf(request, "/api/posts/deletepost", { token, postId: wert });
      antworten.push(`${name}=${r.status}`);
      expect(r.status, `Nutzlast "${name}" wurde AUSGEFÜHRT (${r.status})`).not.toBe(200);
    }
    expect(
      await posts.countDocuments({}),
      `Der Bestand hat sich geändert. Antworten: ${antworten.join(", ")}`,
    ).toBe(vorher);
    expect(await lebt(koeder), "Der eigene Beitrag von sven wurde miterwischt").toBe(true);
  });

  test("deletecomment: keine Nutzlast trifft einen fremden Kommentar", async ({ request }) => {
    const token = await anmelden(request, SVEN);
    const f = await beitragMitKommentar();
    for (const [name, wert] of NUTZLASTEN) {
      const r = await ruf(request, "/api/posts/deletecomment", {
        token, postId: f.pId, commentId: wert,
      });
      expect(r.status, `commentId-Nutzlast "${name}" wurde ausgeführt`).not.toBe(200);
    }
    for (const [name, wert] of NUTZLASTEN) {
      const r = await ruf(request, "/api/posts/deletecomment", {
        token, postId: f.pId, commentId: f.kId, replyId: wert,
      });
      expect(r.status, `replyId-Nutzlast "${name}" wurde ausgeführt`).not.toBe(200);
    }
    expect(await zustand(f.pId)).toMatchObject({ kommentare: 1, antworten: 2 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DIE OBERFLÄCHE — eine Aussage über ALLE Karten, nicht über eine
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Oberfläche: der Löschknopf steht nur an den eigenen Beiträgen", () => {
  test("kein fremder und kein Ereignis-Beitrag trägt einen Löschknopf", async ({ page, request }) => {
    // ⚠️ WARUM DIESER FALL ANDERS GEBAUT IST ALS DIE NAHELIEGENDE FASSUNG:
    // „Der Knopf erscheint nur beim eigenen Beitrag" ist eine Aussage über
    // JEDE Karte im Bild, nicht über eine. Ein Test, der die erste Karte
    // greift und dort das Richtige findet, ist über die neunte blind — und
    // genau dort sitzt der Fehler, weil die Bedingung pro Karte neu ausgewertet
    // wird. Deshalb wird die VOLLSTÄNDIGE Liste eingesammelt und jede Karte
    // einzeln beurteilt.
    const token = await anmelden(request, MAX);

    const eigene = [];
    const fremde = [];
    const ereignisse = [];
    for (let i = 0; i < 3; i++) {
      const t = `${MARKE}-eigen-${i}`;
      eigene.push(t);
      await beitrag({ player: maxId, kind: "user", content: t });
    }
    // ⚠️ Der Verfasser der FREMDEN Beiträge darf nicht frei gewählt werden.
    // Der Feed ist ein „Für dich"-Feed — Beiträge eines Menschen, dem max
    // nicht folgt, erscheinen dort gar nicht erst. Mit sven als Verfasser war
    // dieser Fall im ersten Lauf rot, und zwar zu Recht: Er hätte sonst „null
    // fremde Löschknöpfe" gemeldet, weil er null fremde Karten gesehen hat.
    // Der Verfasser wird deshalb aus dem TATSÄCHLICHEN Feed genommen.
    // Derselbe Endpunkt und dieselbe Nutzlast wie in `PostFeed.js` (Zweig
    // "discover" = "Für dich"). Wer hier einen anderen Weg nimmt, misst einen
    // anderen Feed als den, der auf dem Bildschirm steht.
    // ⚠️ `limit: 50` STATT DER ERSTEN SEITE (Befund Tobias, Roadmap 38b).
    // Hier stand nur `offset: 0`, also die ersten ZEHN gerankten Beiträge.
    // Das ist eine Auswahl, keine Bestandsaufnahme: Gesucht ist irgendein
    // fremder Autor, dem der Feed überhaupt Platz gibt — ob er auf Rang 3 oder
    // Rang 34 steht, ist für diese Frage gleichgültig. An der Beschränkung auf
    // Seite 1 hing der Fall aber davon ab, wie viele frische eigene Beiträge
    // gerade oben liegen, und ist deshalb in der Datei rot gewesen und allein
    // grün. 50 ist das Maximum, das die Route zulässt (`MAX_LIMIT`).
    const feed = await request.post("/api/posts/feed", {
      data: { token, offset: 0, limit: 50 },
      failOnStatusCode: false,
    });
    const feedJson = await feed.json().catch(() => ({}));
    const liste = feedJson?.posts || [];
    const fremderAutor = liste
      .map((p) => p?.player?._id || p?.player)
      .find((id) => id && String(id) !== String(maxId));
    expect(
      fremderAutor,
      `Im Feed von ${MAX} steht unter ${liste.length} gerankten Beiträgen kein ` +
        `einziger mit einem fremden Autor. Dann kann dieser Fall die Aussage ` +
        `"kein FREMDER Beitrag trägt einen Löschknopf" nicht prüfen — er wäre ` +
        `grün, ohne etwas gesehen zu haben.\n` +
        `⚠️ Diese Meldung nannte bis zum 22.08.2026 „Abhilfe: node ` +
        `scripts/seed-demo.mjs". Das war eine falsche Fährte und hat Zeit ` +
        `gekostet: Der Bestand hatte, was gebraucht wird, und die Route lieferte ` +
        `es auch — verdrängt haben die fremden Beiträge die RÜCKSTÄNDE der ` +
        `vorangehenden Fälle dieser Datei (siehe "afterEach" oben). Erst also ` +
        `nachsehen, wie viele Beiträge mit "kaiMarke" gerade im Bestand liegen; ` +
        `neu zu seeden hilft nur, wenn max@test.de tatsächlich allein auf der ` +
        `Plattform ist.`,
    ).toBeTruthy();
    for (let i = 0; i < 3; i++) {
      const t = `${MARKE}-fremd-${i}`;
      fremde.push(t);
      await beitrag({
        player: new mongoose.Types.ObjectId(String(fremderAutor)),
        kind: "user",
        content: t,
      });
    }
    for (let i = 0; i < 2; i++) {
      const t = `${MARKE}-ereignis-${i}`;
      ereignisse.push(t);
      await beitrag({ player: maxId, kind: "auto", autoType: "match_result", content: t });
    }

    await page.addInitScript((t) => {
      localStorage.setItem("playerAuthToken", t);
      sessionStorage.setItem("hg_welcome_token", t);
    }, token);
    await page.route("**/api/news/rss", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, news: [] }) }),
    );
    await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
    await page.getByText(eigene[0], { exact: false }).first().waitFor({ timeout: 30_000 });

    // ⚠️ Der „Für dich"-Feed liefert 10 Beiträge je Seite und ist GERANKT, nicht
    // chronologisch. Ein frisch angelegter fremder Beitrag steht deshalb nicht
    // zwangsläufig auf Seite 1 — im ersten Lauf fehlten genau die drei fremden.
    // Es wird nachgeladen, bis alle Marker im Bild sind, mit Deckel. Der Deckel
    // führt NICHT zu einem grünen Fall: Fehlt danach etwas, schlägt die
    // Ehrlichkeitsschranke unten zu.
    const alleMarker = [...eigene, ...fremde, ...ereignisse];
    for (let runde = 0; runde < 8; runde++) {
      const fehlen = await page.evaluate(
        (m) => m.filter((t) => !(document.body.textContent || "").includes(t)),
        alleMarker,
      );
      if (fehlen.length === 0) break;
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(700);
    }

    const befund = await page.evaluate((marke) => {
      // Der Löschknopf trägt für Vorleseprogramme "<was> löschen" als
      // sr-only-Text. Das ist sein einziger stabiler Griff — die Karte selbst
      // hat KEINE Kennung (Befund im Gate-Bericht).
      const knoepfe = [...document.querySelectorAll("button")].filter((b) =>
        /Beitrag löschen/i.test(b.textContent || ""),
      );
      // Von jedem Knopf zur Karte hochlaufen: die Karte ist der oberste
      // Vorfahr, der noch genau EINEN der Marker-Texte enthält.
      const karteVon = (el) => {
        let k = el, treffer = null;
        while (k && k !== document.body) {
          const t = k.textContent || "";
          const n = (t.match(new RegExp(marke + "-[a-z]+-\\d", "g")) || []).length;
          if (n === 1) treffer = k;
          if (n > 1) break;
          k = k.parentElement;
        }
        return treffer;
      };
      const mitKnopf = [];
      for (const b of knoepfe) {
        const k = karteVon(b);
        const m = (k?.textContent || "").match(new RegExp(marke + "-[a-z]+-\\d"));
        if (m) mitKnopf.push(m[0]);
      }
      const sichtbar = (document.body.textContent || "").match(
        new RegExp(marke + "-[a-z]+-\\d", "g"),
      ) || [];
      return { mitKnopf, sichtbar: [...new Set(sichtbar)], knopfZahl: knoepfe.length };
    }, MARKE);

    // ⚠️ EHRLICHKEITSSCHRANKE. Ohne sie wäre dieser Fall grün, wenn der Feed
    // die Beiträge gar nicht anzeigt — er hätte dann null fremde Knöpfe
    // gefunden, weil er null Karten gesehen hat.
    const fehlend = [...eigene, ...fremde, ...ereignisse].filter((t) => !befund.sichtbar.includes(t));
    expect(
      fehlend,
      `Nicht alle Testbeiträge stehen im Feed. Ohne sie prüft dieser Fall ` +
        `nichts. Gesehen: ${befund.sichtbar.join(", ") || "keine"}`,
    ).toEqual([]);

    for (const t of fremde) {
      expect(befund.mitKnopf, `Fremder Beitrag "${t}" trägt einen Löschknopf`).not.toContain(t);
    }
    for (const t of ereignisse) {
      expect(
        befund.mitKnopf,
        `Ereignis-Beitrag "${t}" trägt einen Löschknopf. Die Route weist ihn ` +
          `zwar ab — aber ein Knopf, der nichts tut, ist eine falsche Zusage.`,
      ).not.toContain(t);
    }
    for (const t of eigene) {
      expect(
        befund.mitKnopf,
        `Eigener Beitrag "${t}" hat KEINEN Löschknopf. Ohne diese Richtung ` +
          `wäre eine Oberfläche ohne jeden Knopf vollständig grün.`,
      ).toContain(t);
    }
  });
});
