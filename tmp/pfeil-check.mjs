// Ist der Pfeil noch da - und haengt er noch an einer Schrift?
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 900, height: 1300 }, deviceScaleFactor: 3 })).newPage();
await p.goto("file:///C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/flyer-a6.html", { waitUntil: "networkidle" });
await p.waitForTimeout(900);
const r = await p.evaluate(() => {
  const f = document.querySelector(".front-footer .flip");
  if (!f) return { fehler: "nicht gefunden" };
  const svg = f.querySelector("svg.pfeil");
  const box = svg ? svg.getBoundingClientRect() : null;
  return {
    text: f.textContent.trim(),
    vektorpfeil: !!svg,
    breite: box ? Math.round(box.width * 10) / 10 : null,
    hoehe: box ? Math.round(box.height * 10) / 10 : null,
    nochZeichen: /\u2192/.test(f.textContent),
  };
});
console.log(JSON.stringify(r));
const el = await p.$(".front-footer");
if (el) await el.screenshot({ path: "tmp/shots/PFEIL.png" });
await b.close();
