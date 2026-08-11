import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const d = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll("h2")].map((h) => h.textContent.trim());
  const eyebrows = [...document.querySelectorAll("p.uppercase.tracking-widest")].map((p) => p.textContent.trim());
  const txt = document.body.innerText;
  return {
    h2,
    eyebrows,
    doppelBestaetigung: txt.includes("Beide Teams tragen ihr Ergebnis unabhängig ein"),
    keinEchtzeit: !txt.includes("in Echtzeit"),
    ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
});
console.log(JSON.stringify(d, null, 1));
await page.evaluate(() => document.querySelector("h2")?.scrollIntoView());
await page.waitForTimeout(600);
await page.screenshot({ path: process.argv[2] + "/landing-copy.png" });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
