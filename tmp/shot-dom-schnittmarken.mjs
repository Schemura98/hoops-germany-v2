import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("tmp/shots", { recursive: true });
const BASE = "C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/";
const OUTER = 8, GAP = 2, MARK = 4, HAIR = 0.15;
const MMPX = 96 / 25.4; // fuer Screenshot-Viewport, 96dpi Basis (deviceScaleFactor uebernimmt Schaerfe)

const jobs = [
  { html: "flyer-a6.html", sel: ".sheet", trimW: 105, trimH: 148, bleed: 3, name: "NEU_FLYER" },
  { html: "visitenkarte.html", sel: ".card", trimW: 85, trimH: 55, bleed: 3, name: "NEU_KARTE" },
];

const b = await chromium.launch();
for (const job of jobs) {
  const docW = job.trimW + 2*job.bleed, docH = job.trimH + 2*job.bleed;
  const pageW = docW + 2*OUTER, pageH = docH + 2*OUTER;
  const page = await b.newPage({ viewport: { width: Math.ceil(pageW*MMPX)+40, height: Math.ceil(pageH*MMPX)+40 }, deviceScaleFactor: 3 });
  await page.goto("file:///" + BASE + job.html, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(300);
  await page.evaluate((cfg) => {
    const { sel, OUTER, GAP, MARK, HAIR, docW, docH, bleed, pageW, pageH } = cfg;
    const mm = v => v + "mm";
    const sheets = Array.from(document.querySelectorAll(sel));
    document.body.style.background = "#666";
    document.body.style.display = "block";
    document.body.style.margin = "0";
    sheets.slice(0,1).forEach(sheet => { // nur Vorderseite fuer den Sichtcheck
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.style.width = mm(pageW); wrap.style.height = mm(pageH);
      wrap.style.background = "#fff";
      wrap.style.margin = "10px";
      sheet.parentNode.insertBefore(wrap, sheet);
      sheet.style.position = "absolute"; sheet.style.left = mm(OUTER); sheet.style.top = mm(OUTER);
      wrap.appendChild(sheet);
      const trimL = OUTER+bleed, trimR = OUTER+docW-bleed, trimT = OUTER+bleed, trimB = OUTER+docH-bleed;
      const mkV = (x,y1,y2) => { const d=document.createElement("div"); d.style.position="absolute"; d.style.left=mm(x-HAIR/2); d.style.top=mm(Math.min(y1,y2)); d.style.width=mm(HAIR); d.style.height=mm(Math.abs(y2-y1)); d.style.background="red"; wrap.appendChild(d); };
      const mkH = (y,x1,x2) => { const d=document.createElement("div"); d.style.position="absolute"; d.style.top=mm(y-HAIR/2); d.style.left=mm(Math.min(x1,x2)); d.style.height=mm(HAIR); d.style.width=mm(Math.abs(x2-x1)); d.style.background="red"; wrap.appendChild(d); };
      mkV(trimL, OUTER-GAP-MARK, OUTER-GAP); mkH(trimT, OUTER-GAP-MARK, OUTER-GAP);
      mkV(trimR, OUTER-GAP-MARK, OUTER-GAP); mkH(trimT, OUTER+docW+GAP, OUTER+docW+GAP+MARK);
      mkV(trimL, OUTER+docH+GAP, OUTER+docH+GAP+MARK); mkH(trimB, OUTER-GAP-MARK, OUTER-GAP);
      mkV(trimR, OUTER+docH+GAP, OUTER+docH+GAP+MARK); mkH(trimB, OUTER+docW+GAP, OUTER+docW+GAP+MARK);
      // Beschnitt-/Endformat-Linien nur zur Kontrolle sichtbar machen (duenn, blau gestrichelt)
      const guide = document.createElement("div");
      guide.style.position="absolute"; guide.style.left=mm(trimL); guide.style.top=mm(trimT);
      guide.style.width=mm(trimR-trimL); guide.style.height=mm(trimB-trimT);
      guide.style.outline = "0.3mm dashed rgba(0,120,255,0.9)";
      guide.style.pointerEvents="none";
      wrap.appendChild(guide);
    });
  }, { sel: job.sel, OUTER, GAP, MARK, HAIR, docW, docH, bleed: job.bleed, pageW, pageH });
  // Verstecke evtl. verbliebene screen-hint-Elemente / zweite Seite
  await page.evaluate(() => { document.querySelectorAll('.screen-hint').forEach(e=>e.remove()); document.querySelectorAll('.sheet,.card').forEach((el,i)=>{ if(i>0) el.closest('div')?.remove?.(); }); });
  await page.screenshot({ path: `tmp/shots/${job.name}_KONTROLLE.png`, fullPage: true });
  console.log(job.name, "Kontrollbild gespeichert");
  await page.close();
}
await b.close();
