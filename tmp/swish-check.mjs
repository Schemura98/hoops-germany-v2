// Sitzt die Sequenz, laedt sie erst spaet, und wechseln die Bilder beim Scrollen?
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
const b = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await b.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  const geladen = [];
  page.on("request", (r) => r.url().includes("/images/swish/") && geladen.push(r.url()));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const beimStart = geladen.length;
  // Bis zum Abschluss-Abschnitt scrollen
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight - 120));
  await page.waitForTimeout(2500);
  const shot = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { canvas: false };
    const r = c.getBoundingClientRect();
    return { canvas: true, breit: Math.round(r.width), hoch: Math.round(r.height), px: c.width + "x" + c.height };
  });
  console.log(`${tag}: beim Seitenaufruf geladen=${beimStart} · nach dem Scrollen=${geladen.length} · ${JSON.stringify(shot)}`);
  await page.screenshot({ path: `tmp/shots/SWISH-${tag}.png` });
  await ctx.close();
}
await b.close();
