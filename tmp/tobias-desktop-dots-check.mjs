import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const featureStart = await page.evaluate(() => {
  const c = document.querySelector('.max-w-sm');
  return c ? c.getBoundingClientRect().top + window.scrollY - 200 : 0;
});
const results = [];
for (let y = featureStart; y < featureStart + 2400; y += 400) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(150);
  const d = await page.evaluate(() => {
    const outer = document.querySelector('.pointer-events-none.absolute.inset-y-0.right-6');
    const dotStrip = outer ? outer.firstElementChild : null;
    if (!dotStrip) return { found: false };
    const r = dotStrip.getBoundingClientRect();
    const cs = getComputedStyle(dotStrip);
    const dots = [...dotStrip.querySelectorAll('span')].map(s => getComputedStyle(s).backgroundColor);
    return { found: true, position: cs.position, top: Math.round(r.top), dotColors: dots };
  });
  results.push({ y, ...d });
}
console.log("Desktop Punkte-Streifen ueber Scroll:", JSON.stringify(results, null, 1));
await browser.close();
