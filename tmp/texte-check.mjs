// Stehen die drei neuen Saetze wirklich auf der Seite - und ist der alte
// Vereins-Satz ueberall verschwunden?
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 850 } });
const page = await ctx.newPage();
let ok = 0, schlecht = 0;
const melde = (gut, t) => { console.log(`${gut ? "ok  " : "FEHL"} ${t}`); gut ? ok++ : schlecht++; };

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const start = await page.evaluate(() => document.body.innerText);
melde(start.includes("bestätigt vom Gegner, nicht nur von dir eingetragen"), "Startseite: neuer Feature-Text");
melde(!start.includes("sichtbar für Vereine und Scouts"), "Startseite: alter Vereins-Satz weg");

// "So funktioniert's" (eingeloggte Fassung) - dafuer anmelden
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "max@test.de");
await page.fill('input[type="password"]', "test123");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const eingeloggt = await page.evaluate(() => document.body.innerText);
melde(!eingeloggt.includes("so finden dich Vereine und Scouts"), "eingeloggt: alter Vereins-Satz weg");

await page.goto(BASE + "/player/player-detail", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const profil = await page.evaluate(() => document.body.innerText);
melde(profil.includes("Zählt erst, wenn beide Teams das Ergebnis eintragen"), "Profil: Herkunftssatz sichtbar");

console.log(`\nbestanden: ${ok} · fehlgeschlagen: ${schlecht}`);
await b.close();
process.exit(schlecht ? 1 : 0);
