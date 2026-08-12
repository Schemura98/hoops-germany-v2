// Der Seitenwechsel greift jetzt in JEDE interne Navigation ein. Das ist der
// riskanteste Eingriff der ganzen Stufe C – deshalb wird hier stumpf
// nachgewiesen, dass Navigieren weiterhin funktioniert, statt es anzunehmen.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 850 } });
const page = await ctx.newPage();
const fehler = [];
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 120)));

const hatAPI = await page
  .goto(BASE + "/", { waitUntil: "networkidle" })
  .then(() => page.evaluate(() => typeof document.startViewTransition === "function"));
console.log("startViewTransition vorhanden:", hatAPI);

let ok = 0;
let schlecht = 0;

async function klickUndPruefe(beschriftung, erwarteterPfad) {
  const vorher = new URL(page.url()).pathname;
  await page.getByRole("link", { name: beschriftung, exact: false }).first().click();
  await page.waitForFunction(
    (v) => window.location.pathname !== v,
    vorher,
    { timeout: 4000 }
  ).catch(() => {});
  const nachher = new URL(page.url()).pathname;
  const treffer = nachher.startsWith(erwarteterPfad);
  console.log(`${treffer ? "ok  " : "FEHL"} "${beschriftung}" → ${nachher}`);
  treffer ? ok++ : schlecht++;
}

// Navigation durch die Hauptbereiche
for (const [text, pfad] of [
  ["Ligen", "/ligen"],
  ["Spiele", "/spiele"],
  ["Teams", "/teams"],
  ["Spieler", "/spieler"],
  ["Transfermarkt", "/transfermarkt"],
  ["Tryouts", "/tryouts"],
  ["Topscorer", "/topscorer"],
]) {
  await klickUndPruefe(text, pfad);
  await page.waitForTimeout(200);
}

// Von einer Liste in eine Detailseite
await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const vorher = page.url();
await page.locator('a[href^="/team/team-detail/"]').first().click();
await page.waitForFunction((v) => window.location.href !== v, vorher, { timeout: 4000 }).catch(() => {});
const detail = new URL(page.url()).pathname;
console.log(`${detail.startsWith("/team/team-detail/") ? "ok  " : "FEHL"} Karte → ${detail}`);
detail.startsWith("/team/team-detail/") ? ok++ : schlecht++;

// Zurück-Schaltfläche des Browsers muss weiterhin funktionieren
await page.goBack();
await page.waitForTimeout(600);
const zurueck = new URL(page.url()).pathname;
console.log(`${zurueck === "/teams" ? "ok  " : "FEHL"} Zurück → ${zurueck}`);
zurueck === "/teams" ? ok++ : schlecht++;

// Strg-Klick darf NICHT abgefangen werden (neuer Tab)
const vorTab = ctx.pages().length;
await page.locator('a[href^="/team/team-detail/"]').first().click({ modifiers: ["ControlOrMeta"] });
await page.waitForTimeout(900);
const neuerTab = ctx.pages().length > vorTab;
console.log(`${neuerTab ? "ok  " : "FEHL"} Strg-Klick öffnet neuen Tab (${vorTab} → ${ctx.pages().length})`);
neuerTab ? ok++ : schlecht++;

console.log(`\nbestanden: ${ok} · fehlgeschlagen: ${schlecht}`);
console.log("Konsolenfehler:", fehler.length ? fehler.join(" | ") : "keine");
await browser.close();
process.exit(schlecht ? 1 : 0);
