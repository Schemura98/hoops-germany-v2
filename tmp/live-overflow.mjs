import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("https://hoopsgermany.de/transfermarkt", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const d = await page.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const treffer = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > w + 0.5 && r.width > 0 && r.height > 0) {
      treffer.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 60), text: (el.innerText || "").slice(0, 30).replace(/\n/g, " "), right: Math.round(r.right), w: Math.round(r.width) });
    }
  });
  return { docW: w, anzahl: treffer.length, treffer: treffer.slice(0, 6) };
});
console.log(JSON.stringify(d, null, 1));
await browser.close();
