import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const info = await page.evaluate(() => {
  const matches = [...document.querySelectorAll('.sticky.top-16')];
  return matches.map(el => ({
    text: el.textContent.trim().slice(0, 60),
    computedPosition: getComputedStyle(el).position,
    computedTop: getComputedStyle(el).top,
    className: el.className,
  }));
});
console.log("Alle .sticky.top-16 Treffer:", JSON.stringify(info, null, 1));

// Scroll to a point clearly inside the section (not at its very edges) and check.
const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 100 : 0;
});
await page.evaluate((v) => window.scrollTo(0, v), featureStart + 400);
await page.waitForTimeout(300);
const d = await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const cs = getComputedStyle(wrap);
  const rect = wrap.getBoundingClientRect();
  return { position: cs.position, top: cs.top, rectTop: Math.round(rect.top), scrollY: window.scrollY };
});
console.log("Bei scrollY=" + (featureStart+400) + ":", JSON.stringify(d));
await browser.close();
