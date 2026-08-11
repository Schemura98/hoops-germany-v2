import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const total = await page.evaluate(() => document.body.scrollHeight);
console.log("total scrollHeight:", total, "viewport height 812");

// Where is the Feed card BEFORE any scrolling (absolute position in document)?
const feedAbsTop = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.max-w-sm')];
  const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
  const r = feed.getBoundingClientRect();
  return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
});
console.log("Feed card absolute position:", JSON.stringify(feedAbsTop));

const steps = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((f) => Math.round(total * f));
console.log("fast-scroll jump targets:", steps);

// Now redo the fast scroll and log intersection ratio at each jump.
for (const y of steps) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(40);
  const d = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.max-w-sm')];
    const feed = cards.find(c => c.textContent.includes('vor 2 Std'));
    const r = feed.getBoundingClientRect();
    const vh = window.innerHeight;
    const visibleTop = Math.max(0, r.top);
    const visibleBottom = Math.min(vh, r.bottom);
    const visibleH = Math.max(0, visibleBottom - visibleTop);
    return { scrollY: window.scrollY, rectTop: Math.round(r.top), rectBottom: Math.round(r.bottom), ratio: (visibleH / r.height).toFixed(2) };
  });
  console.log(JSON.stringify(d));
}
await browser.close();
