import { chromium } from "@playwright/test";
const browser = await chromium.launch();

for (const zoomPct of [100, 150, 200, 300]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate((z) => { document.documentElement.style.fontSize = z + "%"; }, zoomPct);
  await page.waitForTimeout(80);
  // Scroll card to the very edge of the threshold so it JUST triggers, then immediately capture
  // the pre-swap transient offset (row height vs hardcoded 36px TABLE_ROW_SHIFT).
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    c?.scrollIntoView({ block: "center" });
  });
  // Capture IMMEDIATELY (before 550ms transition completes) to see the transient hardcoded-offset state.
  await page.waitForTimeout(30);
  const d = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    const rows = [...c.querySelectorAll('div[style*="translateY"]')];
    const rects = rows.map(r => r.getBoundingClientRect());
    const overlaps = [];
    for (let i = 0; i < rects.length - 1; i++) {
      if (rects[i].bottom > rects[i+1].top + 0.5) overlaps.push({ pair: `row${i}-row${i+1}`, gap: Math.round(rects[i+1].top - rects[i].bottom) });
    }
    return {
      rowHeightsPx: rects.map(r => Math.round(r.height)),
      rowTopsPx: rects.map(r => Math.round(r.top)),
      inlineStyles: rows.map(r => r.getAttribute('style')),
      overlaps,
    };
  });
  console.log(`fontSize ${zoomPct}% @30ms nach Trigger:`, JSON.stringify(d));
  await ctx.close();
}
await browser.close();
