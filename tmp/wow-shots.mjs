// Aufnahmen der Wow-Ebene: Hero an drei Scroll-Punkten (damit man sieht, dass
// sich der Spielzug zeichnet) plus die Feature-Strecke mit dem Fokus-Sprung.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });

const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // Splitflap durchlaufen lassen

  const hoehe = await page.evaluate(() => window.innerHeight);
  for (const [name, anteil] of [["a", 0], ["b", 0.35], ["c", 0.7]]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(hoehe * anteil));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `tmp/shots/WOW-${tag}-hero-${name}.png` });
  }

  // Feature-Strecke: bis zur dritten Szene scrollen
  await page.evaluate(() => {
    const s = document.querySelectorAll("section");
    const ziel = Array.from(s).find((x) => x.textContent.includes("Eine Saison"));
    if (ziel) window.scrollTo(0, ziel.offsetTop + window.innerHeight * 1.4);
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `tmp/shots/WOW-${tag}-fokus.png` });
  await ctx.close();
}
await browser.close();
console.log("fertig");
