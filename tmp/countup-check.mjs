import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
for (const url of ["/topscorer", "/rangliste"]) {
  await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const d = await page.evaluate(() => {
    const zellen = [...document.querySelectorAll("tbody tr")].slice(0, 5).map((tr) =>
      [...tr.querySelectorAll("td")].slice(-3).map((td) => td.innerText.trim()).join(" | ")
    );
    return { tabularNums: document.querySelectorAll("span.tabular-nums").length, ersteZeilen: zellen };
  });
  console.log(url, JSON.stringify(d, null, 1));
}
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
