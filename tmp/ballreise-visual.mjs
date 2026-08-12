import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });
const browser = await chromium.launch();

async function scrollFeaturesTo(page, anteil) {
  await page.evaluate((a) => {
    const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
    if (!s) return;
    window.scrollTo(0, s.offsetTop + s.offsetHeight * a);
  }, anteil);
  await page.waitForTimeout(500);
}

for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  for (const [name, anteil] of [["a-anfang", 0.05], ["b-fluegel-links", 0.18], ["c-mitte", 0.5], ["d-fluegel-rechts", 0.72], ["e-annaeherung", 0.9], ["f-angekommen", 0.995]]) {
    await scrollFeaturesTo(page, anteil);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tmp/shots/BR2-${tag}-${name}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("fertig");
