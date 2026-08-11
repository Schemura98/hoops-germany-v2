import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 70)));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 70)));
// ausgeloggt: Hero muss unveraendert sein
await page.goto("https://hoopsgermany.de/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const aus = await page.evaluate(() => {
  const b = document.querySelector(".max-w-4xl");
  return { headline: b.querySelector("h1")?.innerText.replace(/\n/g, " "), buttons: [...b.querySelectorAll("a")].map((a) => a.innerText.trim()) };
});
console.log("ausgeloggt:", JSON.stringify(aus));
const zeile = await page.evaluate(() => {
  const el = [...document.querySelectorAll("div")].find((d) => d.className.includes?.("min-h-[46px]"));
  return el ? Math.round(el.getBoundingClientRect().height) : null;
});
console.log("Hoehen-Container live vorhanden:", zeile, "px (ausgeloggt nicht sichtbar -> null erwartet)");
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
