import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const info = await page.evaluate(() => {
  const outer = document.querySelector('.pointer-events-none.absolute.inset-y-0.right-6');
  const dotStrip = outer.firstElementChild;
  const outerRect = outer.getBoundingClientRect();
  return {
    outerTop: Math.round(outerRect.top + window.scrollY),
    outerHeight: Math.round(outerRect.height),
    dotStripHeight: Math.round(dotStrip.getBoundingClientRect().height),
  };
});
console.log("Outer-Container-Diagnose:", JSON.stringify(info));

const results = [];
for (const offset of [0, 200, 500, 1000, 1500, 2000, 2500, 3000, 3300]) {
  await page.evaluate((y) => window.scrollTo(0, y), info.outerTop - 400 + offset);
  await page.waitForTimeout(150);
  const top = await page.evaluate(() => {
    const outer = document.querySelector('.pointer-events-none.absolute.inset-y-0.right-6');
    return Math.round(outer.firstElementChild.getBoundingClientRect().top);
  });
  results.push({ offsetIntoContainer: offset, dotStripTop: top });
}
console.log("Punkte-Streifen relativ zum Container:", JSON.stringify(results, null, 1));
await browser.close();
