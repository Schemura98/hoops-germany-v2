import { chromium } from "@playwright/test";
const browser = await chromium.launch();

async function testRealisticFling(label, stepPx, waitMs) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  const total = await page.evaluate(() => document.body.scrollHeight);
  let y = 0;
  while (y < total) {
    y = Math.min(total, y + stepPx);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(waitMs);
  }
  await page.waitForTimeout(1500);
  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.max-w-sm')];
    const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
    const bars = [...feed.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('clip'));
    const heart = feed.querySelector('svg');
    return { barsRawStyle: bars.map(b => b.getAttribute('style')), heartRawStyle: heart.getAttribute('style') };
  });
  console.log(`${label} (step=${stepPx}px, wait=${waitMs}ms):`, JSON.stringify(d));
  await ctx.close();
}

// Realistic-ish fast fling: small steps, short waits (~total covered in well under 1s)
await testRealisticFling("Realistische schnelle Wischgeste", 100, 8);
// Real mouse wheel burst (native wheel events, not scrollTo)
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, 150);
    await page.waitForTimeout(10);
  }
  await page.waitForTimeout(1500);
  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.max-w-sm')];
    const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
    const bars = [...feed.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('clip'));
    const heart = feed.querySelector('svg');
    return { scrollY: window.scrollY, barsRawStyle: bars.map(b => b.getAttribute('style')), heartRawStyle: heart.getAttribute('style') };
  });
  console.log("Echter Mausrad-Burst (60x wheel(0,150), 10ms):", JSON.stringify(d));
  await ctx.close();
}
// Extreme single-jump teleport reproduction (confirm bug still there for reference)
await testRealisticFling("Extremer Einzelsprung-Teleport (Referenz Bug)", 3500, 5);

await browser.close();
