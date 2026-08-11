import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const w of [375, 430]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const d = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  console.log(`${w}px: scrollWidth ${d.scrollW} / clientWidth ${d.clientW} → ${d.scrollW <= d.clientW ? "kein Ueberlauf" : "UEBERLAUF " + (d.scrollW - d.clientW) + "px"}`);
  await ctx.close();
}
await browser.close();
