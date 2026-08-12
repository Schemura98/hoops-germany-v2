// Feuert der Uebergang an der Karte - und bleibt er nie haengen?
// Zusaetzlich: Bei reduzierter Bewegung darf er gar nicht erst starten.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const b = await chromium.launch();

for (const [reduziert, tag] of [[false, "normal            "], [true, "reduzierte Bewegung"]]) {
  const ctx = await b.newContext({
    viewport: { width: 1280, height: 850 },
    reducedMotion: reduziert ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__gefeuert = 0;
    window.__offen = 0;
    const echt = document.startViewTransition?.bind(document);
    if (!echt) return;
    document.startViewTransition = (cb) => {
      window.__gefeuert++;
      window.__offen++;
      const vt = echt(cb);
      vt.finished.catch(() => {}).then(() => window.__offen--);
      return vt;
    };
  });
  const vorher = page.url();
  await page.locator("a[data-vt]").first().click();
  await page.waitForFunction((v) => location.href !== v, vorher, { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    gefeuert: window.__gefeuert,
    offen: window.__offen,
    flagge: document.documentElement.hasAttribute("data-vt-running"),
    pfad: location.pathname,
    verlauf: history.length,
  }));
  console.log(tag, JSON.stringify(r));
  await ctx.close();
}
await b.close();
