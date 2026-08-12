import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 850 } });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
async function scrollTo(a) {
  await page.evaluate((a) => {
    const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
    window.scrollTo(0, s.offsetTop + s.offsetHeight * a);
  }, a);
  await page.waitForTimeout(400);
}
for (const [name, a] of [["vor-ziel", 0.85], ["ziel", 0.97]]) {
  await scrollTo(a);
  await page.screenshot({ path: `tmp/shots/RAILZOOM-${name}.png`, clip: { x: 1180, y: 300, width: 100, height: 250 } });
}
await browser.close();
console.log("fertig");
