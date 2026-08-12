// Lupe auf die Ankunft: hohe Pixeldichte, nur das rechte Ende der Leiste.
// Frage: Ist die Ankunft auf dem Handy ueberhaupt wahrnehmbar? Genau das war
// Ronjas Befund S2 an der alten Hero-Landung.
import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 4 });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
  window.scrollTo(0, s.offsetTop + s.offsetHeight - window.innerHeight * 0.35);
});
await page.waitForTimeout(1600);
await page.screenshot({ path: "tmp/shots/ZIEL-LUPE.png", clip: { x: 250, y: 58, width: 140, height: 60 } });
console.log("Lupe fertig");
await b.close();
