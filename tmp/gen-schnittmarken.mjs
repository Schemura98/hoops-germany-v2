// Erzeugt Schnittmarken-Fassungen von Flyer und Visitenkarte aus den AKTUELLEN
// HTML-Quellen (unveraendert, keine Datei auf der Platte wird angefasst -
// alle Aenderungen passieren nur im geladenen DOM vor dem Druck). Muster
// analog druck-ansicht.mjs, aber statt Screenshot -> page.pdf() mit
// zusaetzlichem Rand + Schnittmarken an der Endformat-Linie, sauber
// AUSSERHALB des Beschnitts (Standard-Konvention: Abstand zwischen
// Beschnittkante und Marke, damit keine Marke die Druckflaeche beruehrt).
import { chromium } from "playwright";

const BASE = "C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/";
const OUTER = 8;  // mm zusaetzlicher Rand rundum fuer die Marken
const GAP = 2;    // mm Abstand zwischen Beschnittkante (Dokumentrand) und Marke
const MARK = 4;   // mm Laenge der Marke
const HAIR = 0.15; // mm Strichstaerke

const jobs = [
  { html: "flyer-a6.html", sel: ".sheet", trimW: 105, trimH: 148, bleed: 3,
    out: "Hoops_Germany_Flyer_A6_Schnittmarken.pdf", label: "Hoops Germany – Flyer A6",
    sides: ["Vorderseite", "R\u00fcckseite"] },
  { html: "visitenkarte.html", sel: ".card", trimW: 85, trimH: 55, bleed: 3,
    out: "Hoops_Germany_Visitenkarte_Schnittmarken.pdf", label: "Hoops Germany – Visitenkarte",
    sides: ["Vorderseite", "R\u00fcckseite"] },
];

const browser = await chromium.launch();
for (const job of jobs) {
  const docW = job.trimW + 2 * job.bleed;
  const docH = job.trimH + 2 * job.bleed;
  const pageW = docW + 2 * OUTER;
  const pageH = docH + 2 * OUTER;

  const page = await browser.newPage();
  await page.goto("file:///" + BASE + job.html, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(400);

  await page.evaluate((cfg) => {
    const { sel, OUTER, GAP, MARK, HAIR, docW, docH, bleed, pageW, pageH, trimW, trimH, label, sides } = cfg;
    const mm = (v) => v + "mm";
    const sheets = Array.from(document.querySelectorAll(sel));
    const wraps = [];

    sheets.forEach((sheet, idx) => {
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.style.width = mm(pageW);
      wrap.style.height = mm(pageH);
      wrap.style.background = "#ffffff";
      wrap.style.pageBreakAfter = "always";

      sheet.parentNode.insertBefore(wrap, sheet);
      sheet.style.position = "absolute";
      sheet.style.left = mm(OUTER);
      sheet.style.top = mm(OUTER);
      sheet.style.pageBreakAfter = "auto";
      wrap.appendChild(sheet);
      wraps.push(wrap);

      const trimL = OUTER + bleed, trimR = OUTER + docW - bleed;
      const trimT = OUTER + bleed, trimB = OUTER + docH - bleed;

      const mkV = (x, y1, y2) => {
        const d = document.createElement("div");
        d.style.position = "absolute";
        d.style.left = mm(x - HAIR / 2);
        d.style.top = mm(Math.min(y1, y2));
        d.style.width = mm(HAIR);
        d.style.height = mm(Math.abs(y2 - y1));
        d.style.background = "#000000";
        wrap.appendChild(d);
      };
      const mkH = (y, x1, x2) => {
        const d = document.createElement("div");
        d.style.position = "absolute";
        d.style.top = mm(y - HAIR / 2);
        d.style.left = mm(Math.min(x1, x2));
        d.style.height = mm(HAIR);
        d.style.width = mm(Math.abs(x2 - x1));
        d.style.background = "#000000";
        wrap.appendChild(d);
      };

      // vier Ecken, je ein waagrechtes + ein senkrechtes Maerkchen,
      // beide vollstaendig im OUTER-Rand, GAP mm Luft zur Beschnittkante
      mkV(trimL, OUTER - GAP - MARK, OUTER - GAP);
      mkH(trimT, OUTER - GAP - MARK, OUTER - GAP);
      mkV(trimR, OUTER - GAP - MARK, OUTER - GAP);
      mkH(trimT, OUTER + docW + GAP, OUTER + docW + GAP + MARK);
      mkV(trimL, OUTER + docH + GAP, OUTER + docH + GAP + MARK);
      mkH(trimB, OUTER - GAP - MARK, OUTER - GAP);
      mkV(trimR, OUTER + docH + GAP, OUTER + docH + GAP + MARK);
      mkH(trimB, OUTER + docW + GAP, OUTER + docW + GAP + MARK);

      // Info-Zeile unten im Rand (reine Produktionsangabe, nicht Teil des Designs)
      const info = document.createElement("div");
      info.style.position = "absolute";
      info.style.left = "0";
      info.style.width = mm(pageW);
      info.style.top = mm(pageH - OUTER / 2 - 1.4);
      info.style.textAlign = "center";
      // Dieselbe Schrift wie das Dokument statt Arial: Sonst schleppt das
      // Schnittmarken-PDF eine zusaetzliche Systemschrift ein (nachgemessen
      // mit tmp/schriften-pruefen.mjs). Die Zeile liegt zwar im Wegschnitt,
      // aber die Preflight-Pruefung einer Druckerei sieht die Schrift trotzdem
      // und meldet sie - das kostet Rueckfragen, nicht Papier.
      info.style.fontFamily = getComputedStyle(document.body).fontFamily;
      info.style.fontSize = "6px";
      info.style.color = "#999999";
      info.textContent = `${label} \u2014 ${sides[idx] || ""} \u2014 Endformat ${trimW}\u00d7${trimH} mm + ${bleed} mm Beschnitt`;
      wrap.appendChild(info);
    });

    if (wraps.length) wraps[wraps.length - 1].style.pageBreakAfter = "auto";
  }, { sel: job.sel, OUTER, GAP, MARK, HAIR, docW, docH, bleed: job.bleed, pageW, pageH, trimW: job.trimW, trimH: job.trimH, label: job.label, sides: job.sides });

  await page.addStyleTag({ content: `@page { size: ${pageW}mm ${pageH}mm; margin: 0; } html, body { background:#ffffff; }` });

  await page.pdf({
    path: BASE + job.out,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log("erzeugt:", job.out, `(Seite ${pageW}x${pageH}mm, Dokument/Beschnitt ${docW}x${docH}mm, Endformat ${job.trimW}x${job.trimH}mm)`);
  await page.close();
}
await browser.close();
