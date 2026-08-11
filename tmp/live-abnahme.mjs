import { chromium } from "@playwright/test";
const B = "https://hoopsgermany.de";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 70)));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 70)));
await page.goto(B + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const abfolge = await page.evaluate(() =>
  [...document.querySelectorAll("section, div")]
    .filter((el) => el.parentElement?.className?.includes?.("min-h-screen"))
    .map((el) => `${(el.innerText || "").split("\n")[0].slice(0, 22)} [${getComputedStyle(el).backgroundColor}]`)
);
console.log("Sektionsabfolge live:");
abfolge.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));
const news = await page.evaluate(() => {
  const k = [...document.querySelectorAll("a[target=_blank]")].filter((a) => a.closest(".grid"));
  return { anzahl: k.length, erste: k[0]?.innerText.split("\n")[0].slice(0, 50) };
});
console.log("News-Karten:", JSON.stringify(news));
const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log("waagerechter Ueberlauf:", ueberlauf + "px · Fehler:", fehler.length ? fehler : "keine");
await page.screenshot({ path: process.argv[2] + "/live-news-position.png" });
await browser.close();
