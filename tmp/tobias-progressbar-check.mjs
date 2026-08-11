import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const total = await page.evaluate(() => document.body.scrollHeight);
const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 500 : 0;
});
console.log("total:", total, "featureStart approx:", featureStart);
const samples = [];
for (let y = Math.max(0, featureStart); y < featureStart + 3200; y += 300) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(200);
  const d = await page.evaluate(() => {
    // Precise selector: the sticky wrap div containing the label <p>
    const wraps = [...document.querySelectorAll('.sticky.top-16')];
    const wrap = wraps[0];
    if (!wrap) return { found: false };
    const label = wrap.querySelector('p');
    const rect = wrap.getBoundingClientRect();
    // Check overlap with the nearest feature card below it
    const cards = [...document.querySelectorAll('.max-w-sm')];
    const firstBelow = cards.find(c => c.getBoundingClientRect().top >= rect.top);
    const overlapsCard = firstBelow ? (rect.bottom > firstBelow.getBoundingClientRect().top) : false;
    return {
      found: true,
      labelText: label?.textContent.trim(),
      wrapTop: Math.round(rect.top),
      wrapBottom: Math.round(rect.bottom),
      wrapHeight: Math.round(rect.height),
      overlapsCard,
    };
  });
  samples.push({ y, ...d });
}
console.log(JSON.stringify(samples, null, 1));
await browser.close();
