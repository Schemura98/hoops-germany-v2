import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// Properly remove the class (not just inline shorthand) and force reflow.
await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const section = wrap?.closest('section');
  section?.classList.remove('overflow-x-hidden');
  // force reflow
  void section?.offsetHeight;
});
const csAfter = await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const section = wrap?.closest('section');
  const cs = getComputedStyle(section);
  return { overflowX: cs.overflowX, overflowY: cs.overflowY };
});
console.log("Section overflow NACH classList.remove:", JSON.stringify(csAfter));

const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 200 : 0;
});
const results = [];
for (let y = featureStart; y < featureStart + 1500; y += 250) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
  const top = await page.evaluate(() => document.querySelector('.sticky.top-16')?.getBoundingClientRect().top);
  results.push({ y, wrapTop: Math.round(top) });
}
console.log("Sticky-Test OHNE overflow-x-hidden-Klasse:", JSON.stringify(results));
await browser.close();
