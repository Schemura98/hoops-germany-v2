// Warum fehlt der Herkunftssatz live? Erst klaeren, ob ueberhaupt angemeldet
// wurde und ob Spiele vorliegen - der Satz haengt am Zweig mit games > 0.
import { chromium } from "playwright";
const BASE = "https://hoopsgermany.de";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 850 } })).newPage();
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "max@test.de");
await page.fill('input[type="password"]', "test123");
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
console.log("nach Anmeldung auf:", new URL(page.url()).pathname);
const token = await page.evaluate(() => !!localStorage.getItem("playerAuthToken"));
console.log("Token gesetzt:", token);
await page.goto(BASE + "/player/player-detail", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const t = await page.evaluate(() => document.body.innerText);
console.log("Pfad:", new URL(page.url()).pathname);
console.log("Karriere-Bilanz vorhanden:", t.includes("KARRIERE-BILANZ") || t.includes("Karriere-Bilanz"));
console.log("Leerzustand:", t.includes("Noch keine Spiele erfasst"));
console.log("Herkunftssatz:", t.includes("Zählt erst, wenn beide Teams"));
await b.close();
