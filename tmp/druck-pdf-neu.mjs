// Druck-PDFs aus den aktuellen HTML-Quellen neu erzeugen (nach dem Pfeil-Fix).
// Gleiche Maße wie bisher: Endformat + 3 mm Beschnitt umlaufend.
import { chromium } from "playwright";
const BASE = "C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/";
const jobs = [
  { html: "flyer-a6.html", w: 111, h: 154, out: "Hoops_Germany_Flyer_A6_Druck.pdf" },
  { html: "visitenkarte.html", w: 91, h: 61, out: "Hoops_Germany_Visitenkarte_Druck.pdf" },
];
const b = await chromium.launch();
for (const j of jobs) {
  const page = await (await b.newContext()).newPage();
  await page.goto("file:///" + BASE + j.html, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // Schriften laden lassen
  await page.pdf({
    path: BASE + j.out,
    width: `${j.w}mm`,
    height: `${j.h}mm`,
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  console.log("erzeugt:", j.out);
}
await b.close();
