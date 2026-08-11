import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const d = await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const section = wrap?.closest('section');
  const cs = section ? getComputedStyle(section) : null;
  // Walk up ancestors and report overflow on each, to find which one breaks it
  const ancestors = [];
  let el = wrap?.parentElement;
  let depth = 0;
  while (el && depth < 8) {
    const s = getComputedStyle(el);
    ancestors.push({ tag: el.tagName, cls: el.className.slice(0, 60), overflow: s.overflow, overflowX: s.overflowX, overflowY: s.overflowY, position: s.position });
    el = el.parentElement;
    depth++;
  }
  return {
    sectionClassName: section?.className,
    sectionOverflow: cs ? { overflow: cs.overflow, overflowX: cs.overflowX, overflowY: cs.overflowY } : null,
    ancestors,
  };
});
console.log(JSON.stringify(d, null, 1));

// Live experiment: temporarily remove overflow-x-hidden via inline style override and re-test stickiness
const total = await page.evaluate(() => document.body.scrollHeight);
await page.evaluate(() => {
  const wrap = document.querySelector('.sticky.top-16');
  const section = wrap?.closest('section');
  if (section) section.style.overflow = 'visible';
});
const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 200 : 0;
});
const afterFix = [];
for (let y = featureStart; y < featureStart + 1200; y += 300) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
  const top = await page.evaluate(() => document.querySelector('.sticky.top-16')?.getBoundingClientRect().top);
  afterFix.push({ y, wrapTop: Math.round(top) });
}
console.log("Nach testweisem section.style.overflow='visible':", JSON.stringify(afterFix));
await browser.close();
