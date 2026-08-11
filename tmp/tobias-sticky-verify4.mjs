import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const d = await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const containingBlock = wrap.parentElement; // the aria-hidden wrapRef div
  const section = wrap.closest('section');
  return {
    wrapHeight: Math.round(wrap.getBoundingClientRect().height),
    containingBlockTag: containingBlock.tagName,
    containingBlockAriaHidden: containingBlock.getAttribute('aria-hidden'),
    containingBlockHeight: Math.round(containingBlock.getBoundingClientRect().height),
    sectionHeight: Math.round(section.getBoundingClientRect().height),
  };
});
console.log("Containing-Block-Diagnose:", JSON.stringify(d, null, 1));

// Confirmatory experiment: give the containing block explicit height = section height, retest stickiness
await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const containingBlock = wrap.parentElement;
  const section = wrap.closest('section');
  containingBlock.style.height = section.getBoundingClientRect().height + 'px';
  containingBlock.style.position = 'relative';
});
const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 200 : 0;
});
const results = [];
for (let y = featureStart; y < featureStart + 1500; y += 300) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
  const top = await page.evaluate(() => document.querySelector('.sticky.top-16')?.getBoundingClientRect().top);
  results.push({ y, wrapTop: Math.round(top) });
}
console.log("NACH Test-Fix (containing block = section height):", JSON.stringify(results));
await browser.close();
