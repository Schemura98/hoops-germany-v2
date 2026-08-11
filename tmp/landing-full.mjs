// Ganzseiten-Aufnahme der Startseite (Feature-Strecke, CTA, Footer).
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });
const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  // Durchscrollen, damit Reveal/IntersectionObserver alles eingeblendet haben
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tmp/shots/${tag}-start-voll.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log("fertig");
