import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
const r = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.max-w-sm')];
  const match = cards.find(c => c.textContent.includes('Sporthalle Nord'));
  if (!match) return { found: false, allCardTexts: cards.map(c => c.textContent.slice(0,40)) };
  const ps = [...match.querySelectorAll('p')].map(p => ({text: p.textContent, cls: p.className}));
  return { found: true, ps, fullText: match.textContent };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
