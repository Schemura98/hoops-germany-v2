import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
// Focus body, then press End -> browser default instant jump to bottom (no smooth scroll defined site-wide)
await page.click("body");
await page.keyboard.press("End");
await page.waitForTimeout(2000);
const d = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.max-w-sm')];
  const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
  const bars = [...feed.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('clip'));
  const heart = feed.querySelector('svg');
  return {
    scrollY: window.scrollY,
    barsRawStyle: bars.map(b => b.getAttribute('style')),
    heartRawStyle: heart.getAttribute('style'),
  };
});
console.log("Nach Taste [Ende], 2000ms gewartet:", JSON.stringify(d, null, 1));
await browser.close();
