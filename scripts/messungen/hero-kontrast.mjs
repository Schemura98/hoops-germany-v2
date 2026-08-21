// ══ IST DIE FELDLINIE DORT, WO SIE TEXT KREUZT, EIN STRICH ODER EIN TONWERT? ══
//
// Angelegt 21.08.2026 auf Tobias' Befund, die Dreipunktlinie laufe „mit
// Deckkraft 0,85" durch den Hero-Text. Die Deckkraft stimmt und beantwortet die
// Frage nicht: Leise wird die ferne Gruppe ueber die FARBE (Verlauf #5E79B8 →
// #2C3A66), nicht ueber die Deckkraft (konstant 0,85).
//
// ⚠️ DESHALB WIRD HIER NICHT GERECHNET, SONDERN AN ECHTEN BILDPUNKTEN GEMESSEN.
// Eine ausgerechnete Komposition unterschlaegt die Kantenglaettung — der Strich
// ist 1,1 Einheiten breit und damit auf schmalen Fenstern SCHMALER ALS EIN
// BILDPUNKT; was der Mensch sieht, ist noch schwaecher als die Rechnung sagt.
// Weg: Screenshot → Canvas → getImageData.
//
// ⚠️ UND DER GRUND WIRD NICHT BLIND DANEBEN ABGEGRIFFEN. Die erste Fassung nahm
// den Punkt 14 px versetzt — dort steht ueber einer Textzeile oft ein
// BUCHSTABE, und dann meldet das Werkzeug „Linie gegen paper-50" statt „Linie
// gegen Flaeche": aus 1,63 : 1 wurde 10,06 : 1. Gemessen wird deshalb der
// DUNKELSTE Punkt im Band ± 12 px quer zur Linie.
//
// Aufruf (Server muss laufen, ausgelieferte Fassung):
//   node scripts/messungen/hero-kontrast.mjs
import { chromium } from "@playwright/test";

const BASIS = process.env.MESS_BASIS || "http://localhost:3000";
const FENSTER = [[768,1024],[900,1000],[1024,1366],[1100,900],[1280,800],[1440,900],[1920,1080]];

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const K = (a, b) => { const l1 = Math.max(L(a), L(b)), l2 = Math.min(L(a), L(b)); return (l1 + 0.05) / (l2 + 0.05); };

const browser = await chromium.launch();
for (const [B, H] of FENSTER) {
  const ctx = await browser.newContext({ viewport: { width: B, height: H } });
  const page = await ctx.newPage();
  await page.goto(BASIS, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);

  const punkte = await page.evaluate(() => {
    const inhalt = document.querySelector("[data-hero-inhalt]");
    const svg = document.querySelector("svg.hero-court");
    const inv = svg.getScreenCTM().inverse();
    const pt = svg.createSVGPoint();
    const drei = svg.querySelector('[data-court="drei"]');
    const out = [];
    // (a) Kreuzungen mit ZEILENKAESTEN der Textknoten (nicht mit Elementkaesten)
    const kaesten = [];
    const lauf = document.createTreeWalker(inhalt, NodeFilter.SHOW_TEXT);
    let k;
    while ((k = lauf.nextNode())) {
      if (!k.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(k);
      for (const bx of rg.getClientRects()) if (bx.width > 0 && bx.height > 0) kaesten.push({ t: k.textContent.trim().slice(0, 18), bx });
    }
    for (const { t, bx } of kaesten) {
      let fertig = false;
      for (let x = Math.floor(bx.left); x <= Math.ceil(bx.right) && !fertig; x++)
        for (let y = Math.floor(bx.top); y <= Math.ceil(bx.bottom) && !fertig; y++) {
          pt.x = x; pt.y = y;
          const q = pt.matrixTransform(inv);
          if (drei.isPointInStroke(q)) { out.push({ wo: `ueber "${t}"`, x, y, tiefe: (q.y - 44) / 60 }); fertig = true; }
        }
    }
    // (b) Vergleichsstelle: dieselbe Linie ueber freier Flaeche
    const frei = (x, y) => !kaesten.some(({ bx }) => x > bx.left - 30 && x < bx.right + 30 && y > bx.top - 30 && y < bx.bottom + 30);
    const st = document.querySelector("[data-hero-stage]").getBoundingClientRect();
    let gefunden = false;
    for (let y = Math.floor(st.top) + 40; y < st.bottom - 10 && !gefunden; y += 3)
      for (let x = 4; x < innerWidth - 4 && !gefunden; x++) {
        if (!frei(x, y)) continue;
        pt.x = x; pt.y = y;
        const q = pt.matrixTransform(inv);
        // ⚠️ Tiefe >= 1 m: Bei 0 m faellt die Dreipunktlinie mit der GRUNDLINIE
        // zusammen. Dort misst das Werkzeug zweimal dieselbe Linie und meldet
        // 1,00 : 1 — ein Artefakt, kein Befund.
        if (drei.isPointInStroke(q) && (q.y - 44) / 60 >= 1) { out.push({ wo: "ueber freier Flaeche", x, y, tiefe: (q.y - 44) / 60 }); gefunden = true; }
      }
    return out;
  });

  const buf = await page.screenshot();
  await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const d = c.getContext("2d").getImageData(0, 0, img.width, img.height).data;
    window.__px = (x, y) => { const i = (y * img.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  }, buf.toString("base64"));

  if (!punkte.length) console.log(`${B}x${H}: Dreipunktlinie kreuzt keine Textzeile`);
  for (const pk of punkte) {
    const r = await page.evaluate(({ x, y }) => {
      let hell = null;
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        const c = window.__px(x + dx, y + dy); const s = c[0] + c[1] + c[2];
        if (!hell || s > hell.s) hell = { c, s };
      }
      let dunkel = null;
      for (let dx = -12; dx <= 12; dx++) {
        if (Math.abs(dx) < 6) continue;
        const c = window.__px(x + dx, y); const s = c[0] + c[1] + c[2];
        if (!dunkel || s < dunkel.s) dunkel = { c, s };
      }
      return { linie: hell.c, grund: dunkel.c };
    }, pk);
    console.log(
      `${String(B).padStart(4)}x${String(H).padEnd(4)} ${pk.wo.padEnd(30)} @ ${pk.tiefe.toFixed(2).padStart(5)} m | ` +
      `Linie:Flaeche ${K(r.linie, r.grund).toFixed(2)} : 1 | paper-50 ueber Linie ${K([245, 247, 250], r.linie).toFixed(2)} : 1`
    );
  }
  await ctx.close();
}
await browser.close();
