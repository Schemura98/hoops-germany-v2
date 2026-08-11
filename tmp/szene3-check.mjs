import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const B = process.argv[3] || "http://localhost:3000";
const browser = await chromium.launch();
for (const reduced of ["no-preference", "reduce"]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, reducedMotion: reduced });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message.slice(0, 80)));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 80)));
  await page.goto(B + "/", { waitUntil: "networkidle" });
  const probe = `(() => {
    const k = [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Sporthalle'));
    const o = el => el ? Number(getComputedStyle(el).opacity).toFixed(2) : null;
    const spans = [...k.querySelectorAll('span')];
    const a = spans.find(s => s.textContent.replace(/\s+/g,' ').trim() === 'meldet 78');
    const b = spans.find(s => s.textContent.replace(/\s+/g,' ').trim() === 'meldet 65');
    const score = k.querySelector('p.font-black');
    const pill = spans.find(s => s.textContent.trim() === 'Bestätigt');
    const fuss = [...k.querySelectorAll('div')].find(d => d.textContent.includes('Sporthalle'));
    const kollision = a && fuss ? Math.round(a.getBoundingClientRect().bottom - fuss.getBoundingClientRect().top) : null;
    return { a: o(a), b: o(b), score: o(score), pill: o(pill), ueberlappungMitFusszeile: kollision };
  })()`;
  await page.evaluate(() => [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Sporthalle"))?.scrollIntoView({ block: "center" }));
  const zeiten = [300, 800, 1600, 2100, 3000];
  let vorher = 0;
  for (const t of zeiten) {
    await page.waitForTimeout(t - vorher); vorher = t;
    console.log(`${reduced} @${String(t).padStart(4)}ms:`, JSON.stringify(await page.evaluate(probe)));
  }
  await page.screenshot({ path: `${OUT}/szene3-${reduced}.png` });
  console.log(`${reduced} Fehler:`, fehler.length ? fehler : "keine");
  await ctx.close();
}
await browser.close();
