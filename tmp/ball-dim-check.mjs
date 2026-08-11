import { chromium } from "@playwright/test";
const B = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch();
for (const w of [375, 430]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 812 } });
  const page = await ctx.newPage();
  await page.goto(B + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const werte = [];
  for (let y = 0; y <= 420; y += 60) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
    werte.push(await page.evaluate(() => {
      const ball = document.querySelector('svg[viewBox="0 0 28 28"]');
      const text = document.querySelector("h1")?.parentElement;
      const b = ball.getBoundingClientRect(), t = text.getBoundingClientRect();
      const cy = b.top + b.height / 2;
      return { op: Number(ball.style.opacity).toFixed(2), imText: cy >= t.top && cy <= t.bottom };
    }));
  }
  const imText = werte.filter((v) => v.imText);
  const sichtbarImText = imText.filter((v) => Number(v.op) > 0.05).length;
  console.log(`${w}px: ${werte.map((v) => v.op).join(" ")} · auf Texthoehe ${imText.length} Stufen, davon sichtbar ${sichtbarImText} (Bodenwert 0.2 erwartet)`);
  await ctx.close();
}
await browser.close();
