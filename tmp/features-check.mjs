import { chromium } from "@playwright/test";
const OUT = process.argv[2] || ".";
const browser = await chromium.launch();

const probe = `(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
  const karten = [...document.querySelectorAll('.max-w-sm')].map((c, i) => {
    const rows = [...c.querySelectorAll('div[style*="translateY"], div[style*="opacity"]')];
    return { i, sichtbareZeilen: rows.filter(r => Number(getComputedStyle(r).opacity) > 0.9).length, gesamt: rows.length };
  });
  const score = [...document.querySelectorAll('p')].find(p => /78\s*:\s*65/.test(p.textContent));
  const bestaetigt = [...document.querySelectorAll('span')].find(s => s.textContent.trim() === 'Bestätigt');
  const tags = [...document.querySelectorAll('span')].filter(s => s.textContent.trim() === 'eingereicht');
  const tabelle = [...document.querySelectorAll('.max-w-sm')].map(c => c.textContent).find(t => t?.includes('Rhein Hawks') && t?.includes('Köln'));
  const tRows = tabelle ? [...document.querySelectorAll('.max-w-sm')].find(c => c.textContent.includes('Köln'))?.querySelectorAll('div[style*="translate"]') : [];
  return {
    scoreOpacity: score ? Number(getComputedStyle(score).opacity).toFixed(2) : null,
    bestaetigtOpacity: bestaetigt ? Number(getComputedStyle(bestaetigt).opacity).toFixed(2) : null,
    tagsSichtbar: tags.filter(t => Number(getComputedStyle(t).opacity) > 0.5).length,
    tabellenVersatz: [...(tRows || [])].map(r => getComputedStyle(r).transform),
  };
})()`;

for (const [label, vp, reduced] of [["mobil", { width: 375, height: 812 }, "no-preference"], ["reduced", { width: 375, height: 812 }, "reduce"]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, reducedMotion: reduced });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  // Zur Ergebnis-Karte scrollen (Szene 3)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Sporthalle"));
    el?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(300);
  console.log(`${label} · 300ms nach Trigger:`, JSON.stringify(await page.evaluate(probe)));
  await page.waitForTimeout(1400);
  console.log(`${label} · nach Ablauf:      `, JSON.stringify(await page.evaluate(probe)));
  await page.screenshot({ path: `${OUT}/features-${label}.png`, fullPage: false });
  // Tabelle (Szene 4)
  await page.evaluate(() => {
    const el = [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Köln"));
    el?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(900);
  console.log(`${label} · Tabelle sortiert:`, JSON.stringify(await page.evaluate(probe)));
  const cls = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  console.log(`${label} · Ueberlauf:`, cls.scrollW - cls.clientW, "px · Fehler:", fehler.length ? fehler : "keine");
  await ctx.close();
}
await browser.close();
