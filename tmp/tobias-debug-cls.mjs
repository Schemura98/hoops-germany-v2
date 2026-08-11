import { chromium } from "@playwright/test";
const browser = await chromium.launch();

// 1) Roster row order/labels check
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Spieler im Kader'));
    c?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1200);
  const rows = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Spieler im Kader'));
    return [...c.querySelectorAll('div[style*="translateY"]')].map(r => r.textContent.trim());
  });
  console.log("Roster-Zeilen Reihenfolge:", JSON.stringify(rows));
  await ctx.close();
}

// 2) Layout-shift measurement during table swap (should be ~0, transform-only)
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__cls = 0;
    window.__clsEntries = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) { window.__cls += entry.value; window.__clsEntries.push(entry.value); }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    c?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1500);
  const cls = await page.evaluate(() => ({ total: window.__cls, entries: window.__clsEntries }));
  console.log("Layout-Shift waehrend Tabellen-Swap:", JSON.stringify(cls));
  await ctx.close();
}

// 3) Table at large font-size (accessibility text zoom simulation) - check row overflow/overlap
for (const zoomPct of [150, 200]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate((z) => { document.documentElement.style.fontSize = z + "%"; }, zoomPct);
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    c?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1200);
  const d = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    const rows = [...c.querySelectorAll('div[style*="translateY"]')];
    return rows.map(r => {
      const rect = r.getBoundingClientRect();
      return { text: r.textContent.trim(), boxHeight: Math.round(rect.height), scrollH: r.scrollHeight, clientH: r.clientHeight, clipped: r.scrollHeight > r.clientHeight };
    });
  });
  console.log(`Tabellenzeilen bei fontSize ${zoomPct}%:`, JSON.stringify(d));
  // also check for overlap between consecutive rows
  const overlapCheck = await page.evaluate(() => {
    const c = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln Comets'));
    const rows = [...c.querySelectorAll('div[style*="translateY"]')];
    const rects = rows.map(r => r.getBoundingClientRect());
    let overlaps = [];
    for (let i = 0; i < rects.length - 1; i++) {
      if (rects[i].bottom > rects[i+1].top) overlaps.push(`row${i}-row${i+1}`);
    }
    return overlaps;
  });
  console.log(`  Ueberlappungen bei ${zoomPct}%:`, JSON.stringify(overlapCheck));
  await ctx.close();
}

await browser.close();
