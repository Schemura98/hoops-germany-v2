import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
const info = await page.evaluate(() => {
  const h2 = Array.from(document.querySelectorAll("h2")).find((h) => h.textContent.includes("Eine Saison"));
  const wrap = h2.parentElement;
  const section = wrap.closest("section");
  const cs = getComputedStyle(wrap);
  const csH2 = getComputedStyle(h2);
  h2.textContent = h2.textContent + " " + h2.textContent;
  return {
    wrapRect: wrap.getBoundingClientRect().toJSON ? JSON.parse(JSON.stringify(wrap.getBoundingClientRect())) : wrap.getBoundingClientRect(),
    h2Rect: h2.getBoundingClientRect(),
    sectionRect: section.getBoundingClientRect(),
    wrapPosition: cs.position, wrapLeft: cs.left, wrapWidth: cs.width, wrapTransform: cs.transform,
    h2Display: csH2.display, h2TextAlign: getComputedStyle(wrap).textAlign,
    innerWidth: window.innerWidth,
    scrollbarGap: window.innerWidth - document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
