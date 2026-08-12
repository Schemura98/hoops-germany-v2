import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const h2 = Array.from(document.querySelectorAll("h2")).find((h) => h.textContent.includes("Eine Saison"));
  h2?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(1000);
const rect = await page.evaluate(() => {
  const h2 = Array.from(document.querySelectorAll("h2")).find((h) => h.textContent.includes("Eine Saison"));
  const r = h2.getBoundingClientRect();
  return { left: r.left, right: r.right, width: r.width, fenster: window.innerWidth, fontFamily: getComputedStyle(h2).fontFamily, fontSize: getComputedStyle(h2).fontSize };
});
console.log(JSON.stringify(rect));
await page.screenshot({ path: "tmp/shots/A1-VERIFY2.png" });
await browser.close();
