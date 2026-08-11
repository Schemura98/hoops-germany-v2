import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const total = await page.evaluate(() => document.body.scrollHeight);
const steps = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((f) => Math.round(total * f));
for (const y of steps) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(40);
}
async function dump(label) {
  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.max-w-sm')];
    const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
    if (!feed) return { found: false };
    const bars = [...feed.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('clip'));
    const heart = feed.querySelector('svg');
    return {
      found: true,
      barsRawStyle: bars.map(b => b.getAttribute('style')),
      heartRawStyle: heart.getAttribute('style'),
      allSpanTexts: [...feed.querySelectorAll('span')].map(s => ({t: s.textContent.trim(), style: s.getAttribute('style')})),
    };
  });
  console.log(label, JSON.stringify(d, null, 1));
}
await dump("T+0ms (right after fling)");
await page.waitForTimeout(400);
await dump("T+400ms");
await page.waitForTimeout(400);
await dump("T+800ms");
await page.waitForTimeout(800);
await dump("T+1600ms");
await browser.close();
