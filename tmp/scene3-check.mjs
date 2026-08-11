import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const reduced of ["no-preference", "reduce"]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: reduced });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 120)));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const probe = `(() => {
    const karte = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Sporthalle'));
    const score = karte.querySelector('p.font-black');
    const pill = [...karte.querySelectorAll('span')].find(s => s.textContent.trim() === 'Bestätigt');
    const tags = [...karte.querySelectorAll('span')].filter(s => s.textContent.trim() === 'eingereicht');
    const o = el => Number(getComputedStyle(el).opacity).toFixed(2);
    return { score: score.textContent.trim(), scoreOp: o(score), pillOp: o(pill), tagsOp: tags.map(o) };
  })()`;
  await page.evaluate(() => [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Sporthalle"))?.scrollIntoView({ block: "center" }));
  for (const ms of [200, 700, 1600]) {
    await page.waitForTimeout(ms === 200 ? 200 : 500);
    console.log(`${reduced} @${ms}ms:`, JSON.stringify(await page.evaluate(probe)));
  }
  console.log(`${reduced} Fehler:`, fehler.length ? fehler : "keine");
  await ctx.close();
}
await browser.close();
