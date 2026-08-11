// Nachmessen statt rechnen: Wo landen die Elemente der Taktiktafel wirklich?
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
for (const breite of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.4));
  await page.waitForTimeout(500);
  const werte = await page.evaluate(() => {
    const svg = document.querySelector("svg[viewBox='0 0 900 700']");
    if (!svg) return { fehler: "kein SVG" };
    const s = svg.getBoundingClientRect();
    const punkte = Array.from(svg.querySelectorAll("[data-play-dot]")).map((el) => {
      const r = el.getBoundingClientRect();
      return { cx: el.getAttribute("cx"), links: Math.round(r.left), oben: Math.round(r.top), breit: Math.round(r.width) };
    });
    return { svg: { l: Math.round(s.left), b: Math.round(s.width), h: Math.round(s.height) }, punkte, fenster: window.innerWidth };
  });
  console.log(breite, JSON.stringify(werte));
  await ctx.close();
}
await browser.close();
