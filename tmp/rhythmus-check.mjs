import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const d = await page.evaluate(() => {
  const abschnitte = [...document.querySelectorAll("main > *, body > div > section, body > div > div")];
  return [...document.querySelectorAll("section, div")].filter((el) => el.parentElement?.className?.includes?.("min-h-screen"))
    .map((el) => ({
      inhalt: (el.innerText || "").split("\n")[0].slice(0, 28),
      hintergrund: getComputedStyle(el).backgroundColor,
      hoehe: Math.round(el.getBoundingClientRect().height),
    }));
});
console.log(JSON.stringify(d, null, 1));
await browser.close();
