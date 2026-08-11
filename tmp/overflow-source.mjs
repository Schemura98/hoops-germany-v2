import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/transfermarkt", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const d = await page.evaluate(() => {
  const docW = document.documentElement.clientWidth;
  const schuldige = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > docW + 0.5 && r.width > 0) {
      schuldige.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 70), right: Math.round(r.right), w: Math.round(r.width) });
    }
  });
  return { docW, anzahl: schuldige.length, ersten: schuldige.slice(0, 5) };
});
console.log(JSON.stringify(d, null, 1));
await browser.close();
