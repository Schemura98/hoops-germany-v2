// Aufnahmen der Stufe-B-Momente: Anzeigetafel beim bestätigten Ergebnis,
// Karriere-Werte im Profil, eigene Zeile in der Liga-Tabelle.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 850 } });
const page = await ctx.newPage();

// Ein ABGESCHLOSSENES Spiel suchen - der erste Versuch nahm einfach den letzten
// Link auf /spiele und landete auf einer geplanten Partie ohne Punktestand.
await page.goto(BASE + "/spiele", { waitUntil: "networkidle" });
const matchHref = await page.evaluate(async () => {
  const r = await fetch("/api/matches/public");
  const d = await r.json();
  const liste = d.matches || d.data?.matches || [];
  const fertig = liste.find((m) => m.status === "completed");
  return fertig ? `/match/${fertig._id}` : null;
});
console.log("Spiel:", matchHref);
if (matchHref) {
  await page.goto(BASE + matchHref, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "tmp/shots/B-match.png" });
}

// Anmelden, damit die eigene Zeile und das eigene Profil greifen
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "max@test.de");
await page.fill('input[type="password"]', "test123");
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);

await page.goto(BASE + "/player/player-detail", { waitUntil: "networkidle" });
await page.waitForTimeout(1600);
await page.screenshot({ path: "tmp/shots/B-profil.png", fullPage: false });

await page.goto(BASE + "/ligen", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const ligaHref = await page.evaluate(() => {
  const a = document.querySelector('a[href^="/ligen/"]');
  return a ? a.getAttribute("href") : null;
});
console.log("Liga:", ligaHref);
if (ligaHref) {
  await page.goto(BASE + ligaHref, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "tmp/shots/B-tabelle.png" });
}
await browser.close();
console.log("fertig");
