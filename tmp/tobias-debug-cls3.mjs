import { chromium } from "@playwright/test";
const browser = await chromium.launch();

for (const zoomPct of [100, 150, 200]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  // Block scrolling the table into view at all -> captures the untouched "unsorted" initial state.
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate((z) => { document.documentElement.style.fontSize = z + "%"; }, zoomPct);
  await page.waitForTimeout(100);
  const d = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    const rect0 = c.getBoundingClientRect();
    // Force it into DOM without IntersectionObserver firing: use display none trick? Simpler:
    // just read it in its natural, still off-screen (not-yet-observed) position - but we need it
    // rendered. Instead: temporarily clip overflow off so it's not "in viewport" per IO, but still
    // query layout via a hidden clone technique is complex. Simplest: read current state as-is
    // (card is somewhere on the page, likely below the fold already, not yet observed).
    const rows = [...c.querySelectorAll('div[style*="translateY"]')];
    const rects = rows.map(r => r.getBoundingClientRect());
    const styles = rows.map(r => r.getAttribute('style'));
    const overlaps = [];
    for (let i = 0; i < rects.length - 1; i++) {
      if (rects[i].bottom > rects[i+1].top + 0.5) overlaps.push({ pair: `row${i}-row${i+1}`, overlapPx: Math.round(rects[i].bottom - rects[i+1].top) });
    }
    return { cardTop: Math.round(rect0.top), rowHeights: rects.map(r=>Math.round(r.height)), rowTops: rects.map(r=>Math.round(r.top)), styles, overlaps };
  });
  console.log(`UNSORTED Ausgangszustand (Karte nicht gescrollt) bei ${zoomPct}%:`, JSON.stringify(d));
  await ctx.close();
}
await browser.close();
