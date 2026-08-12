// Die ueberarbeiteten Drucksachen als Bild, damit Patrick sie beurteilen kann.
// Ueber die HTML-Quellen, nicht ueber die PDFs (kein PDF-Renderer vorhanden).
import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("tmp/shots", { recursive: true });
const D = "file:///C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
for (const [datei, name] of [["flyer-a6.html", "FLYER"], ["visitenkarte.html", "KARTE"]]) {
  await page.goto(D + datei, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `tmp/shots/${name}.png`, fullPage: true });
  console.log(name, "aufgenommen");
}
await b.close();
