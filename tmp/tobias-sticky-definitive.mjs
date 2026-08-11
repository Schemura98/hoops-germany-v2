import { chromium } from "@playwright/test";
const browser = await chromium.launch();

async function test(label, injectCss) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  if (injectCss) await page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = '.overflow-x-hidden { overflow-x: visible !important; overflow-y: visible !important; }';
    document.documentElement.appendChild(style);
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const cs = await page.evaluate(() => {
    const wrap = document.querySelector('.sticky.top-16');
    const section = wrap.closest('section');
    return { overflowX: getComputedStyle(section).overflowX, overflowY: getComputedStyle(section).overflowY };
  });
  const featureStart = await page.evaluate(() => {
    const c = document.querySelector('.max-w-sm');
    return c.getBoundingClientRect().top + window.scrollY - 100;
  });
  const results = [];
  for (const off of [0, 200, 500, 1000]) {
    await page.evaluate((y) => window.scrollTo(0, y), featureStart + off);
    await page.waitForTimeout(150);
    const top = await page.evaluate(() => document.querySelector('.sticky.top-16').getBoundingClientRect().top);
    results.push({ off, top: Math.round(top) });
  }
  console.log(label, "sectionOverflow:", JSON.stringify(cs), "results:", JSON.stringify(results));
  await ctx.close();
}

await test("OHNE Fix (Original):", false);
await test("MIT Fix (overflow-x-hidden neutralisiert VOR dem ersten Layout):", true);
await browser.close();
