import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const baseline = await page.evaluate(async () => {
  const testEl = document.createElement('div');
  testEl.id = '__stickytest';
  testEl.style.cssText = 'position:sticky; top:10px; height:20px; background:red; z-index:99999;';
  testEl.textContent = 'TEST';
  const container = document.createElement('div');
  container.style.cssText = 'height:2000px;';
  container.appendChild(testEl);
  document.body.appendChild(container);
  const docTop = container.getBoundingClientRect().top + window.scrollY;
  const results = [];
  // Scroll to just past docTop (so container top is at viewport top), then continue scrolling further.
  for (const offset of [0, 50, 200, 500, 1000, 1900, 1990]) {
    window.scrollTo(0, docTop + offset);
    await new Promise(r => setTimeout(r, 60));
    results.push({ scrollOffsetIntoContainer: offset, stickyTop: Math.round(testEl.getBoundingClientRect().top) });
  }
  container.remove();
  return { docTop: Math.round(docTop), results };
});
console.log("Sauberer Baseline-Sticky-Test:", JSON.stringify(baseline, null, 1));
await browser.close();
