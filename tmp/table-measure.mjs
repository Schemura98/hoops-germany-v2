import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
for (const url of ["/rangliste", "/topscorer", "/ligen"]) {
  await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const d = await page.evaluate(() => {
    const wrap = document.querySelector(".overflow-x-auto");
    const table = wrap?.querySelector("table");
    if (!table) return { keineTabelle: true, text: document.body.innerText.slice(0, 80) };
    const cols = [...table.querySelectorAll("thead th")].map((th) => Math.round(th.getBoundingClientRect().width));
    return {
      wrapBreite: Math.round(wrap.clientWidth),
      tabellenBreite: Math.round(table.scrollWidth),
      ueberlauf: Math.round(table.scrollWidth - wrap.clientWidth),
      spalten: cols,
      zeilen: table.querySelectorAll("tbody tr").length,
    };
  });
  console.log(url, JSON.stringify(d));
}
await browser.close();
