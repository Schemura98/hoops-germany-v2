// „Vorher“-Aufnahmen von der Live-Seite (dort steht noch der alte Stand),
// damit der Vergleich echte Bilder zeigt statt einer Beschreibung.
import { chromium } from "playwright";
import fs from "node:fs";

fs.mkdirSync("tmp/shots", { recursive: true });
const SEITEN = [["start", "/"], ["teams", "/teams"], ["topscorer", "/topscorer"]];
const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, pfad] of SEITEN) {
    await page.goto("https://hoopsgermany.de" + pfad, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `tmp/shots/VORHER-${tag}-${name}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("fertig");
