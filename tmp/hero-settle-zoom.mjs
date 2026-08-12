import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const h = await page.evaluate(() => window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * 0.42));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tmp/shots/HERO-SETTLE-${tag}.png` });
  await ctx.close();
}
await browser.close();
console.log("fertig");
