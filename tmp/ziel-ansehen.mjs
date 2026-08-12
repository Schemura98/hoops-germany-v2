// Die Ankunft des Balls WIRKLICH ansehen: bis kurz vor das Ende der
// Feature-Strecke scrollen (nicht darueber hinaus) und die Leiste ausschneiden.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const b = await chromium.launch();

for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await b.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  // Ans Ende der Feature-Sektion, aber noch innerhalb
  const pos = await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
    if (!s) return null;
    // Ganz ans Ende der Strecke - bei 1.05 stand die Leiste erst bei 5/6.
    const ziel = s.offsetTop + s.offsetHeight - window.innerHeight * 0.35;
    window.scrollTo(0, ziel);
    return ziel;
  });
  await page.waitForTimeout(1400);
  const box = await page.evaluate(() => {
    // mobil: der sticky Balken oben; Desktop: die Punktereihe rechts
    const kandidaten = Array.from(document.querySelectorAll("div"))
      .filter((d) => d.className && String(d.className).includes("sticky"));
    const el = kandidaten[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: Math.min(window.innerWidth, r.width + 20), height: r.height + 30 };
  });
  await page.screenshot({ path: `tmp/shots/ZIEL6-${tag}.png`, clip: box || undefined });
  console.log(tag, "Scrollposition", pos, "Ausschnitt", JSON.stringify(box));
  await ctx.close();
}
await b.close();
