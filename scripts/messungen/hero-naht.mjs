// ══ DER SCHNITT HERO ↔ SEITE ════════════════════════════════════════════════
//
// Angelegt 21.08.2026 auf Tobias' Befund („im Vergleich der auffaelligste Punkt
// der Seite"): Die Seitenlinie des Heros endete hart an der Buehnenunterkante,
// und auf DERSELBEN Hoehe begann die Aussenlinie der Seite, nur weiter aussen.
//
// Das Skript beantwortet drei Fragen und wird gebraucht, sobald jemand eine der
// drei Hoehen-Leitern in `HeroStage.js` anfasst:
//
//   1. Wo liegt die Naht — in viewBox-Koordinaten UND in Feldtiefe?
//      ⚠️ Das ist die Zahl, an der die frueher notierte Begruendung gescheitert
//      ist. In CLAUDE.md stand „auf 1440 bei y ≈ 533" — das ist die Unterkante
//      des ZEICHNUNGSKASTENS. Weil das SVG `overflow: visible` traegt, zeichnet
//      es darueber hinaus bis zur BUEHNE, und die ist hoeher, weil ihr Inhalt
//      sie treibt. Gemessen: y = 649,8.
//   2. Was wird an der Naht geschnitten (und ist es jetzt unsichtbar)?
//   3. Was macht das Ausblenden mit dem BOGENSCHEITEL (viewBox y = 543,5)?
//      ⚠️ DIE SCHRANKE IST NICHT „das Ausblenden beruehrt den Scheitel nie" —
//      diese Fassung stand hier zuerst und ist nachweislich unerfuellbar. Der
//      Abstand Scheitel → Naht faellt mit wachsender Breite monoton (auf 1440
//      noch 127,6 px, auf 1600 nur noch 84,0 px, ab ~1700 negativ): Es gibt
//      keine Ausblendlaenge, die ihn auf JEDER Breite freihaelt, weil der
//      Scheitel irgendwann selbst an der Naht liegt. Dort war er vorher hart
//      abgeschnitten — ein Auslaufen ist an dieser Stelle keine Einbusse,
//      sondern die Abhilfe.
//      DIE SCHRANKE, DIE WIRKLICH GILT, IST DIE MOBILE: Auf Telefonbreiten ist
//      der Bogen das EINZIGE Feldelement der unteren Bildhaelfte. Dort muss das
//      Ausblenden vollstaendig unter ihm beginnen. Gemessen 25,3 px Abstand,
//      und die ersten 33,6 px des Bandes decken ohnehin unter 8 % — bis zur
//      ersten messbaren Verdunkelung sind es also rund 59 px.
//      Deshalb prueft dieses Skript nur Breiten <= 430 px hart und meldet fuer
//      die uebrigen den gemessenen Kontrast am Scheitel als Beobachtung.
//
// Aufruf (Server muss laufen, ausgelieferte Fassung):
//   node scripts/messungen/hero-naht.mjs
import { chromium } from "@playwright/test";

const BASIS = process.env.MESS_BASIS || "http://localhost:3000";
const SCHEITEL = 543.5; // viewBox-y des Bogenscheitels: (1,575 + 6,75) m * 60 + 44
const FENSTER = [[320,640],[360,800],[375,812],[390,844],[430,932],[640,900],[768,1024],[820,1180],[900,1000],[1024,1366],[1100,900],[1280,800],[1440,900],[1600,900],[1920,1080],[2560,1440]];

const browser = await chromium.launch();
const c0 = await browser.newContext();
const rr = await c0.request.post(`${BASIS}/api/player/playerlogin`, { data: { email: "max@test.de", password: "test123" } });
const jj = await rr.json().catch(() => ({}));
const TOK = jj?.data?.token || jj?.token;
await c0.close();
if (!TOK) console.log("KEIN TOKEN – nur der ausgeloggte Zustand wird geprueft (siehe README).");

let verletzt = 0;
for (const zu of ["aus", "an"]) {
  if (zu === "an" && !TOK) continue;
  console.log(`\n=== ${zu === "an" ? "ANGEMELDET" : "AUSGELOGGT"} ===`);
  for (const [B, H] of FENSTER) {
    const ctx = await browser.newContext({ viewport: { width: B, height: H } });
    const page = await ctx.newPage();
    if (zu === "an") await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), TOK);
    await page.goto(BASIS, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const r = await page.evaluate((scheitel) => {
      const stage = document.querySelector("[data-hero-stage]").getBoundingClientRect();
      const naht = document.querySelector("[data-hero-naht]").getBoundingClientRect();
      const svg = document.querySelector("svg.hero-court");
      const ctm = svg.getScreenCTM();
      const inv = ctm.inverse();
      const pt = svg.createSVGPoint();
      pt.x = 0; pt.y = stage.bottom;
      const nahtVb = pt.matrixTransform(inv).y;
      pt.x = 600; pt.y = scheitel;
      const scheitelY = pt.matrixTransform(ctm).y;
      // Was liegt unmittelbar ueber der Naht?
      const pfade = [...svg.querySelectorAll("[data-court-path]")];
      const treffer = [];
      for (let x = 0; x < innerWidth; x += 1) {
        pt.x = x; pt.y = stage.bottom - 0.6;
        const q = pt.matrixTransform(inv);
        for (const e of pfade) if (e.isPointInStroke(q)) {
          const name = e.getAttribute("data-court");
          if (!treffer.some((t) => t.name === name && Math.abs(t.x - x) < 6)) treffer.push({ name, x });
        }
      }
      // x der Hero-Seitenlinie (-7,50 m) und der Aussenlinie des naechsten Abschnitts
      pt.x = 150; pt.y = 0;
      const seitenX = pt.matrixTransform(ctm).x;
      const al = document.querySelector("[data-aussenlinie] [data-feld-senkrecht]");
      const alX = al ? al.getBoundingClientRect().left : null;
      return { nahtVb, tiefe: (nahtVb - 44) / 60, scheitelY, nahtOben: naht.top, buehneUnten: stage.bottom, treffer, seitenX, alX };
    }, SCHEITEL);

    const luft = r.nahtOben - r.scheitelY;
    const sichtbar = r.scheitelY < r.buehneUnten; // Scheitel ueberhaupt im Bild?
    // Hart geprueft wird nur die mobile Schranke — Begruendung im Kopf.
    const schlecht = B <= 430 && sichtbar && luft <= 0;
    if (schlecht) verletzt++;
    const versatz = r.alX != null ? (r.seitenX - r.alX).toFixed(0) : "–";
    console.log(
      `${String(B).padStart(4)}x${String(H).padEnd(4)} | Naht y ${r.nahtVb.toFixed(1).padStart(6)} = ${r.tiefe.toFixed(2).padStart(5)} m | ` +
      `an der Naht: ${(r.treffer.map((t) => t.name).filter((v, i, a) => a.indexOf(v) === i).join("+") || "nichts").padEnd(12)} | ` +
      `Versatz zur Aussenlinie ${String(versatz).padStart(5)} px | Scheitel ${sichtbar ? "im Bild " : "unter Naht"}, Abstand zur Naht ${sichtbar ? (luft + 112).toFixed(1).padStart(6) : "     –"} px, Luft vor dem Band ${luft.toFixed(1).padStart(7)} px${schlecht ? "   <<< MOBILE SCHRANKE VERLETZT" : ""}`
    );
    await ctx.close();
  }
}
console.log(`\nMobile Schranke verletzt in ${verletzt} Faellen (Sollwert 0).`);
await browser.close();
