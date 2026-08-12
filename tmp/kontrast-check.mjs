// Automatischer Kontrast-Durchlauf ueber die wichtigsten Seiten.
// Misst jeden sichtbaren Textknoten gegen den tatsaechlich dahinterliegenden
// Hintergrund (erste nicht-transparente Elternflaeche) und meldet alles unter
// WCAG AA (4,5:1 normal, 3:1 ab 18,66px bzw. 14px fett).
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const SEITEN = [
  "/", "/teams", "/spieler", "/spiele", "/ligen", "/topscorer", "/rangliste",
  "/transfermarkt", "/tryouts", "/login", "/signup", "/feedback", "/kontakt",
  "/installieren", "/impressum", "/datenschutz", "/about",
];

const MESSUNG = () => {
  const lum = (c) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const t = m[1].split(",").map((x) => parseFloat(x));
    return { rgb: [t[0], t[1], t[2]], a: t.length > 3 ? t[3] : 1 };
  };
  const mix = (fg, bg, a) => fg.map((v, i) => v * a + bg[i] * (1 - a));
  // Halbtransparente Flaechen (bg-brand-500/10 & Co.) muessen von aussen nach
  // innen uebereinandergelegt werden. Die erste Fassung nahm stattdessen die
  // innerste Farbe fuer voll deckend - dadurch meldete der Durchlauf eine
  // 10-%-Toenung als solides Orange und produzierte lauter Falschbefunde.
  const hinter = (el) => {
    const schichten = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const bgc = parse(getComputedStyle(n).backgroundColor);
      if (bgc && bgc.a > 0) {
        schichten.push(bgc);
        if (bgc.a >= 0.999) break;
      }
      n = n.parentElement;
    }
    let grund = [18, 14, 11]; // ink-950 als letzte Instanz
    for (let i = schichten.length - 1; i >= 0; i--) {
      grund = mix(schichten[i].rgb, grund, schichten[i].a);
    }
    return grund;
  };

  const treffer = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || el.closest("script,style,noscript")) continue;
    // Konturschrift ueberspringen - und NUR die. Die Kapitelziffern (A5) haben
    // transparente Fuellung und sind allein ueber den Umriss sichtbar; ein
    // Fuellfarben-Messwert waere dort immer 1:1 und trotzdem kein Verstoss
    // (dekorativ, `aria-hidden`, Zaehlung steht als sr-only-Text daneben).
    //
    // Die erste Fassung nahm dafuer JEDEN aria-hidden-Teilbaum aus. Das war zu
    // weit: aria-hidden entfernt Inhalt nur aus dem Screenreader-Baum, nicht
    // aus dem Bild - sehende Nutzer lesen ihn weiter, WCAG 1.4.3 gilt also.
    // Kai hat im selben Diff zwei Stellen gefunden, die dadurch blind wurden
    // (die "meldet 78/65"-Etiketten und die komplette mobile
    // Fortschritts-Beschriftung). Sie bestehen heute nur zufaellig.
    // Deshalb jetzt an der Signatur statt an der Rolle.
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.15) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const fg = parse(cs.color);
    if (!fg) continue;
    const strich = parseFloat(cs.webkitTextStrokeWidth || "0");
    if (fg.a === 0 && strich > 0) continue;
    const bg = hinter(el);
    const farbe = fg.a >= 0.999 ? fg.rgb : mix(fg.rgb, bg, fg.a);
    const l1 = lum(farbe), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const fett = parseInt(cs.fontWeight, 10) >= 700;
    const grenze = px >= 24 || (fett && px >= 18.66) ? 3 : 4.5;
    if (ratio < grenze) {
      treffer.push({
        text: text.slice(0, 45),
        ratio: Math.round(ratio * 100) / 100,
        grenze,
        px: Math.round(px),
        farbe: cs.color,
        grund: `rgb(${bg.map(Math.round).join(",")})`,
        pfad: el.tagName.toLowerCase() + "." + (el.className?.toString?.().slice(0, 60) || ""),
      });
    }
  }
  return treffer;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await ctx.newPage();
let gesamt = 0;
for (const pfad of SEITEN) {
  await page.goto(BASE + pfad, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const treffer = await page.evaluate(MESSUNG);
  if (treffer.length) {
    gesamt += treffer.length;
    console.log(`\n=== ${pfad} (${treffer.length})`);
    const gesehen = new Set();
    for (const t of treffer) {
      const key = t.farbe + t.grund + t.pfad;
      if (gesehen.has(key)) continue;
      gesehen.add(key);
      console.log(`  ${t.ratio} / ${t.grenze}  ${t.px}px  ${t.farbe} auf ${t.grund}  "${t.text}"  [${t.pfad}]`);
    }
  }
}
console.log("\nBefunde gesamt:", gesamt);
await browser.close();
