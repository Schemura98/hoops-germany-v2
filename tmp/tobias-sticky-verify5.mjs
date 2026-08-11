import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const d = await page.evaluate(() => {
  const cs = (el) => el ? { overflow: getComputedStyle(el).overflow, overflowX: getComputedStyle(el).overflowX, overflowY: getComputedStyle(el).overflowY, transform: getComputedStyle(el).transform, willChange: getComputedStyle(el).willChange, filter: getComputedStyle(el).filter, contain: getComputedStyle(el).contain } : null;
  return { html: cs(document.documentElement), body: cs(document.body) };
});
console.log(JSON.stringify(d, null, 1));

// Definitive test: create a brand-new, minimal sticky element directly in body to see baseline behavior
const baseline = await page.evaluate(async () => {
  const testEl = document.createElement('div');
  testEl.id = '__stickytest';
  testEl.style.cssText = 'position:sticky; top:10px; height:20px; background:red; z-index:99999;';
  testEl.textContent = 'TEST';
  const container = document.createElement('div');
  container.style.cssText = 'height:2000px;';
  container.appendChild(testEl);
  document.body.appendChild(container);
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 50));
  const r1 = testEl.getBoundingClientRect().top;
  window.scrollTo(0, 500);
  await new Promise(r => setTimeout(r, 100));
  const r2 = testEl.getBoundingClientRect().top;
  container.remove();
  return { atScroll0: Math.round(r1), atScroll500: Math.round(r2), sticksIfEqualOrClose: Math.abs(r2 - 10) < 3 };
});
console.log("Baseline-Sticky-Test (frisches Element in body):", JSON.stringify(baseline));
await browser.close();
