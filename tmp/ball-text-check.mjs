import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const probe = `(() => {
  const ball = document.querySelector('svg[viewBox="0 0 28 28"]');
  const text = document.querySelector('h1')?.parentElement;
  const b = ball.getBoundingClientRect(), t = text.getBoundingClientRect();
  const cy = b.top + b.height / 2;
  return { cy: Math.round(cy), textTop: Math.round(t.top), textBottom: Math.round(t.bottom),
           imText: cy >= t.top && cy <= t.bottom, op: Number(ball.style.opacity) };
})()`;
for (const w of [375, 390, 414, 430]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 932 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  let verstoesse = 0, treffer = 0;
  for (let y = 0; y <= 500; y += 20) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
    const d = await page.evaluate(probe);
    if (d.imText) { treffer++; if (d.op > 0) { verstoesse++; console.log(`  VERSTOSS ${w}px scroll ${y}: Ball auf Texthoehe (cy=${d.cy}, Text ${d.textTop}-${d.textBottom}) mit Opacity ${d.op}`); } }
  }
  console.log(`${w}px: ${treffer} Scroll-Stufen mit Ball auf Texthoehe, davon ${verstoesse} sichtbar → ${verstoesse === 0 ? "OK" : "FEHLER"}`);
  await ctx.close();
}
await browser.close();
