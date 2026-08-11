import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 100)));

// Liga-Detailseite ueber die API finden
await page.goto("http://localhost:3000/ligen", { waitUntil: "networkidle" });
const ligaHref = await page.evaluate(() => document.querySelector('a[href^="/ligen/"]')?.getAttribute("href") || null);

for (const [name, url] of [["rangliste", "/rangliste"], ["topscorer", "/topscorer"], ["liga", ligaHref]]) {
  if (!url) { console.log(name, "→ keine URL gefunden"); continue; }
  await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const d = await page.evaluate(() => {
    const wrap = document.querySelector('[role="group"]');
    if (!wrap) return { keinScrollTable: true };
    const zelle = document.querySelector("tbody tr td:nth-child(2)");
    const vorX = Math.round(zelle.getBoundingClientRect().left);
    const fadesVor = [...document.querySelectorAll('.pointer-events-none.absolute')].map((f) => f.style.opacity);
    wrap.scrollLeft = 9999;
    return new Promise((res) => setTimeout(() => {
      const nachX = Math.round(zelle.getBoundingClientRect().left);
      const letzte = document.querySelector("tbody tr td:last-child");
      res({
        ueberlauf: wrap.scrollWidth - wrap.clientWidth,
        namensspalteBleibt: vorX === nachX,
        letzteSpalteSichtbar: letzte.getBoundingClientRect().right <= wrap.getBoundingClientRect().right + 1,
        fadesVor, fadesNach: [...document.querySelectorAll('.pointer-events-none.absolute')].map((f) => f.style.opacity),
      });
    }, 350));
  });
  console.log(name.padEnd(10), JSON.stringify(d));
  await page.screenshot({ path: `${OUT}/tabelle-${name}.png` });
}
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
