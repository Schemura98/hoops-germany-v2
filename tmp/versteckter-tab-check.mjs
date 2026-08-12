// Kais Befund nachstellen: Wer waehrend des Seitenwechsels den Tab verlaesst,
// haelt die rAF-Schleife an. Haengt der Deckel daran, loest die Zusage nie auf
// und der Browser friert das alte Bild ein.
//
// Nachgestellt, indem rAF komplett stillgelegt wird - haerter als ein echter
// Tab-Wechsel, aber genau der Zustand, um den es geht.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 850 } });
const page = await ctx.newPage();

await page.goto(BASE + "/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(500);

await page.evaluate(() => {
  window.__offen = 0;
  window.__fertig = 0;
  const echt = document.startViewTransition.bind(document);
  document.startViewTransition = (cb) => {
    window.__offen++;
    // Ab jetzt laufen keine rAF-Frames mehr - wie im versteckten Tab.
    window.requestAnimationFrame = () => 0;
    const vt = echt(cb);
    vt.finished.catch(() => {}).then(() => {
      window.__offen--;
      window.__fertig++;
    });
    return vt;
  };
});

await page.locator("a[data-vt]").first().click();
// Deutlich laenger warten als die Zeitgrenze von 320ms
await page.waitForTimeout(2500);

const r = await page.evaluate(() => ({
  offeneUebergaenge: window.__offen,
  abgeschlossen: window.__fertig,
  flaggeHaengt: document.documentElement.hasAttribute("data-vt-running"),
  pfad: location.pathname,
}));
console.log(JSON.stringify(r));
const gut = r.offeneUebergaenge === 0 && r.abgeschlossen === 1 && !r.flaggeHaengt;
console.log(gut ? "OK - loest trotz stillgelegtem rAF auf" : "FEHLER - haengt");
await browser.close();
process.exit(gut ? 0 : 1);
