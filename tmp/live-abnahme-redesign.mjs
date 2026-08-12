// Abnahme gegen die LIVE-Seite nach dem Deploy: Ist wirklich das Redesign
// ausgeliefert, laden die Schriften, gibt es Konsolenfehler?
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "https://hoopsgermany.de";
fs.mkdirSync("tmp/shots", { recursive: true });

const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 120)));
  page.on("requestfailed", (r) => fehler.push(`FEHLGESCHLAGEN ${r.url().slice(0, 90)}`));

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const befund = await page.evaluate(() => {
    const grund = getComputedStyle(document.body).backgroundColor;
    const h1 = document.querySelector("h1");
    const taktik = document.querySelector('svg[viewBox="0 0 900 700"]');
    return {
      grund,
      headlineSchrift: h1 ? getComputedStyle(h1).fontFamily.split(",")[0] : null,
      taktiktafel: !!taktik,
      linien: taktik ? taktik.querySelectorAll("[data-play-line]").length : 0,
      splitflap: !!document.querySelector(".animate-flap"),
    };
  });
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.6));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `tmp/shots/LIVE-${tag}-start.png` });

  await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tmp/shots/LIVE-${tag}-teams.png` });

  console.log(tag, JSON.stringify(befund));
  console.log(`  Fehler: ${fehler.length ? fehler.join(" | ") : "keine"}`);
  await ctx.close();
}
await browser.close();
