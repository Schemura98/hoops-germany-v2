import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [label, vp, sel] of [
  ["mobil", { width: 375, height: 812 }, ".sticky.top-16.z-20"],
  ["desktop", { width: 1440, height: 900 }, "DOTS"],
]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const sec = await page.evaluate(() => {
    const s = [...document.querySelectorAll("section")].find((x) => x.textContent.includes("Spielzüge"));
    return { top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) };
  });
  const tops = [];
  for (const anteil of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(sec.top + sec.h * anteil));
    await page.waitForTimeout(200);
    tops.push(await page.evaluate((s) => {
      const el = s === "DOTS"
        ? document.querySelector("span.h-2.w-2.rounded-full")?.parentElement
        : document.querySelector(s);
      return el ? Math.round(el.getBoundingClientRect().top) : null;
    }, sel));
  }
  const spanne = Math.max(...tops) - Math.min(...tops);
  console.log(`${label}: rect.top ueber 5 Scroll-Stufen = ${JSON.stringify(tops)} · Spanne ${spanne}px → ${spanne <= 4 ? "KLEBT" : "DRIFTET"}`);
  // Ueberlauf-Gegenprobe (overflow-x-clip muss weiterhin abschneiden)
  const u = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`   waagerechter Ueberlauf: ${u}px`);
  await ctx.close();
}
// Zoom-Gegenprobe fuer die Tabellen-Karte
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
for (const fs of ["100%", "150%", "200%"]) {
  await page.evaluate((f) => { document.documentElement.style.fontSize = f; window.scrollTo(0, 0); }, fs);
  await page.waitForTimeout(400);
  const d = await page.evaluate(() => {
    const karte = [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Köln"));
    const zeilen = [...karte.querySelectorAll("div[style*='translateY']")].map((r) => r.getBoundingClientRect());
    const ueberlapp = zeilen.length >= 2 ? Math.round(Math.max(0, zeilen[0].bottom - zeilen[1].top)) : null;
    return { zeilenhoehe: Math.round(zeilen[0]?.height || 0), ueberlappVorSortierung: ueberlapp };
  });
  console.log(`Zoom ${fs}: Zeilenhoehe ${d.zeilenhoehe}px, Ueberlappung im Ausgangszustand ${d.ueberlappVorSortierung}px`);
}
await browser.close();
