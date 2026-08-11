import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 70)));
await page.goto("https://hoopsgermany.de/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const d = await page.evaluate(() => {
  const karten = [...document.querySelectorAll("a")].filter((a) => a.getAttribute("href")?.startsWith("/team/team-detail/"));
  const namen = ["Test Baskets", "Rhein Ballers", "Munich Hoops", "Hamburg Towers United"];
  const treffer = karten.filter((k) => namen.some((n) => k.innerText.includes(n)));
  return {
    gefunden: treffer.map((k) => {
      const zeilen = k.innerText.split("\n").map((z) => z.trim()).filter(Boolean);
      return `${zeilen[0]} → ${k.innerText.includes("BEISPIELDATEN") ? "gekennzeichnet" : "OHNE Kennzeichnung"}`;
    }),
    gesamtKarten: karten.length,
    mitKennzeichnung: karten.filter((k) => k.innerText.includes("BEISPIELDATEN")).length,
  };
});
console.log(JSON.stringify(d, null, 1));
// Detailseite gegenpruefen
await page.goto("https://hoopsgermany.de/team/team-detail/test-baskets", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const detail = await page.evaluate(() => ({
  titel: document.querySelector("h1")?.innerText.trim(),
  kennzeichnung: document.body.innerText.includes("BEISPIELDATEN"),
}));
console.log("Detailseite:", JSON.stringify(detail), "· Fehler:", fehler.length ? fehler : "keine");
await browser.close();
