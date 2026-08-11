import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 100)));
for (const [name, url] of [["spieler", "/spieler"], ["teams", "/teams"], ["transfermarkt", "/transfermarkt"], ["spiele", "/spiele"]]) {
  await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const d = await page.evaluate(() => {
    const main = document.querySelector("main");
    const filter = main.querySelector("div.mb-6");
    const r = filter?.getBoundingClientRect();
    const felder = filter ? filter.querySelectorAll("select, input").length : 0;
    return {
      filterHoehe: r ? Math.round(r.height) : null,
      felder,
      ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  console.log(name.padEnd(14), JSON.stringify(d));
  await page.screenshot({ path: `${OUT}/filter-${name}.png` });
}
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
