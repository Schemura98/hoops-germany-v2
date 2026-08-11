import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
await page.goto("http://localhost:3000/rangliste", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const vor = await page.evaluate(() => {
  const wrap = document.querySelector('[role="group"]');
  const cell = document.querySelector("tbody tr td:nth-child(2)");
  const fades = [...document.querySelectorAll('[aria-hidden="true"].pointer-events-none.absolute')].map((f) => f.style.opacity);
  return { ueberlauf: wrap.scrollWidth - wrap.clientWidth, teamX: Math.round(cell.getBoundingClientRect().left), fades };
});
console.log("vor dem Wischen:", JSON.stringify(vor));
await page.evaluate(() => { document.querySelector('[role="group"]').scrollLeft = 999; });
await page.waitForTimeout(400);
const nach = await page.evaluate(() => {
  const wrap = document.querySelector('[role="group"]');
  const cell = document.querySelector("tbody tr td:nth-child(2)");
  const name = cell.innerText.trim().split("\n")[0];
  const diff = document.querySelector("tbody tr td:last-child");
  const fades = [...document.querySelectorAll('[aria-hidden="true"].pointer-events-none.absolute')].map((f) => f.style.opacity);
  return { scrollLeft: Math.round(wrap.scrollLeft), teamX: Math.round(cell.getBoundingClientRect().left), name,
           diffSichtbar: diff.getBoundingClientRect().right <= wrap.getBoundingClientRect().right + 1, fades };
});
console.log("nach dem Wischen:", JSON.stringify(nach));
await page.screenshot({ path: process.argv[2] + "/rangliste-sticky.png" });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
