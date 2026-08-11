import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("console", (m) => m.type() === "error" && fehler.push(m.text()));
page.on("pageerror", (e) => fehler.push("pageerror: " + e.message));
const bilder = [];
page.on("request", (r) => /\.(jpg|jpeg|avif|webp|png)$/i.test(new URL(r.url()).pathname) && bilder.push(new URL(r.url()).pathname.split("/").pop()));
await page.goto("https://hoopsgermany.de/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const probe = `(() => {
  const ball = document.querySelector('svg[viewBox="0 0 28 28"]');
  const emblem = document.querySelector('svg[viewBox="0 0 20 14"]');
  const cta = [...document.querySelectorAll('a[href="/signup"]')].find(a => a.getBoundingClientRect().height > 40);
  const r = el => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top)]; };
  return { ball: ball ? r(ball) : null, ballOp: ball?.style.opacity, emblemOp: emblem?.style.opacity, cta: cta ? r(cta) : null };
})()`;
for (const y of [0, 180, 300, 380]) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(250);
  const d = await page.evaluate(probe);
  console.log(`scroll ${String(y).padStart(3)} | ball ${JSON.stringify(d.ball)} op=${d.ballOp} | emblem op=${d.emblemOp} | cta ${JSON.stringify(d.cta)}`);
}
await page.screenshot({ path: process.argv[2] + "/live-hero-mobil.png" });
await page.goto("https://hoopsgermany.de/signup", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
console.log("Bildanfragen mobil auf /signup:", bilder.filter((b) => /signup|login/i.test(b)));
console.log("Konsolenfehler:", fehler.length ? fehler : "keine");
await browser.close();
