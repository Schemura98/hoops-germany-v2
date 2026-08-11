import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
for (const [label, vp, reduced] of [["mobil", { width: 375, height: 812 }, "no-preference"], ["desktop", { width: 1440, height: 900 }, "no-preference"], ["reduced", { width: 375, height: 812 }, "reduce"]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, reducedMotion: reduced });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 90)));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const werte = [];
  const section = await page.evaluate(() => {
    const s = [...document.querySelectorAll("section")].find((x) => x.textContent.includes("Spielzüge"));
    return { top: Math.round(s.getBoundingClientRect().top + window.scrollY), h: Math.round(s.getBoundingClientRect().height) };
  });
  for (const anteil of [0, 0.2, 0.5, 0.8, 1]) {
    await page.evaluate(({ y }) => window.scrollTo(0, y), { y: Math.round(section.top + section.h * anteil - 100) });
    await page.waitForTimeout(250);
    werte.push(await page.evaluate(() => {
      const balken = document.querySelector(".origin-left.bg-brand-500");
      const label = document.querySelector("p.tracking-widest.text-gray-500");
      const punkte = [...document.querySelectorAll("span.h-2.w-2.rounded-full")].map((d) => d.style.backgroundColor === "rgb(249, 115, 22)" ? 1 : 0);
      return { balken: balken ? getComputedStyle(balken).transform : null, label: label?.textContent?.trim(), aktivePunkte: punkte.reduce((a, b) => a + b, 0) };
    }));
  }
  console.log(`\n=== ${label} ===`);
  werte.forEach((w, i) => console.log(` ${[0, 20, 50, 80, 100][i]}%:`, JSON.stringify(w)));
  const ueberlauf = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(" Ueberlauf:", ueberlauf, "· Fehler:", fehler.length ? fehler : "keine");
  await page.screenshot({ path: `${OUT}/rail-${label}.png` });
  await ctx.close();
}
await browser.close();
