import { chromium } from "@playwright/test";
const browser = await chromium.launch();

for (const zoomPct of [100, 150, 200, 300]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate((z) => { document.documentElement.style.fontSize = z + "%"; }, zoomPct);
  await page.waitForTimeout(100);
  const d = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    const rows = [...c.querySelectorAll('div[style*="translateY"]')];
    let rects = rows.map((r, i) => ({ i, label: r.textContent.trim().slice(0,20), top: r.getBoundingClientRect().top, bottom: r.getBoundingClientRect().bottom }));
    rects.sort((a, b) => a.top - b.top); // sort by actual VISUAL order
    const overlaps = [];
    for (let i = 0; i < rects.length - 1; i++) {
      const gap = rects[i+1].top - rects[i].bottom;
      if (gap < 0) overlaps.push({ pair: `${rects[i].label} / ${rects[i+1].label}`, overlapPx: Math.round(-gap) });
    }
    return { visualOrderTopToBottom: rects.map(r => r.label), overlaps };
  });
  console.log(`UNSORTED (pre-trigger), fontSize ${zoomPct}%:`, JSON.stringify(d));
  await ctx.close();
}
await browser.close();
