import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const client = await ctx.newCDPSession(page);
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
// Rapid wheel burst under 4x CPU throttle, minimal/no waits (worst case for main-thread congestion)
for (let i = 0; i < 80; i++) {
  await page.mouse.wheel(0, 200);
}
await page.waitForTimeout(2500);
const d = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.max-w-sm')];
  const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
  const bars = [...feed.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('clip'));
  const heart = feed.querySelector('svg');
  const table = cards.find(c => c.textContent.includes('Köln Comets'));
  const tableRows = [...table.querySelectorAll('div')].filter(d => d.getAttribute('style')?.includes('translateY'));
  return {
    scrollY: window.scrollY,
    barsRawStyle: bars.map(b => b.getAttribute('style')),
    heartRawStyle: heart.getAttribute('style'),
    tableRowStyles: tableRows.map(r => r.getAttribute('style')),
  };
});
console.log("4x CPU-Drosselung + 80x Mausrad(0,200) ohne Wartezeit:", JSON.stringify(d, null, 1));
await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
await browser.close();
