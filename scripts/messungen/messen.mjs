// Messung des gespiegelten Feldendes. Aufruf: node scripts/messungen/messen.mjs
import { chromium } from "@playwright/test";

// Host nicht fest verdrahtet — siehe scripts/messungen/README.md.
const BASIS = process.env.MESS_BASIS || "http://localhost:3000";

const FENSTER = [
  [320, 640], [360, 640], [360, 800], [375, 812], [390, 844], [430, 932],
  [768, 1024], [820, 1180], [1024, 1366], [1280, 800], [1440, 900], [1920, 1080],
];

const browser = await chromium.launch();

async function token() {
  const ctx = await browser.newContext();
  const r = await ctx.request.post(`${BASIS}/api/player/playerlogin`, {
    data: { email: "max@test.de", password: "test123" },
  });
  const j = await r.json().catch(() => ({}));
  await ctx.close();
  return j?.data?.token || j?.token || null;
}
const TOK = await token();
if (!TOK) console.log("!! KEIN TOKEN — angemeldete Faelle entfallen");

async function messen(B, H, tok) {
  const ctx = await browser.newContext({ viewport: { width: B, height: H } });
  const page = await ctx.newPage();
  if (tok) {
    await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), tok);
  }
  await page.goto(BASIS, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1200);

  const r = await page.evaluate(() => {
    const sec = document.querySelector("[data-passfeld]");
    const svg = sec.querySelector("[data-endfeld-svg]");
    const sr = sec.getBoundingClientRect();
    const lade = svg.querySelector('[data-endfeld="lade"]').getBoundingClientRect();
    const korb = svg.querySelector("[data-endfeld-korb]").getBoundingClientRect();
    const drei = svg.querySelector('[data-endfeld="drei"]').getBoundingClientRect();
    const ziel = sec.querySelector("[data-pass-ziel]").getBoundingClientRect();
    const ball = sec.querySelector("[data-pass-ball]").getBoundingClientRect();

    // Tiefstes gezeichnetes Textzeichen im Inhaltsblock
    let tiefsteText = -Infinity, wer = "";
    for (const el of sec.querySelectorAll("h2, p, a, span")) {
      const eigen = [...el.childNodes].filter((k) => k.nodeType === 3)
        .map((k) => k.textContent.trim()).join("");
      if (!eigen) continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.bottom > tiefsteText) { tiefsteText = b.bottom; wer = eigen.slice(0, 28); }
    }

    // Beruehrt eine SICHTBARE Linie des Nahbereichs Text? Gemessen als
    // Schnitt der Text-Boxen mit der gezeichneten Kontur (isPointInStroke).
    const nahPfade = [...svg.querySelectorAll('[data-endfeld="zone"],[data-endfeld="lade"],[data-endfeld="brett"],[data-endfeld="marke"]')];
    const ctm = svg.getScreenCTM().inverse();
    const pt = svg.createSVGPoint();
    const treffer = [];
    for (const el of sec.querySelectorAll("h2, p, a")) {
      const eigen = [...el.childNodes].filter((k) => k.nodeType === 3)
        .map((k) => k.textContent.trim()).join("");
      if (!eigen) continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0) continue;
      let hit = false;
      for (let x = b.left; x <= b.right && !hit; x += 2) {
        for (let y = b.top; y <= b.bottom && !hit; y += 2) {
          pt.x = x; pt.y = y;
          const p = pt.matrixTransform(ctm);
          for (const el2 of nahPfade) if (el2.isPointInStroke(p)) { hit = true; break; }
        }
      }
      if (hit) treffer.push(eigen.slice(0, 28));
    }

    return {
      abstandTextZuLadezone: lade.top - tiefsteText,
      tiefsterText: wer,
      korbUeberAbschnittsende: sr.bottom - korb.bottom,
      korbDurchmesser: korb.height,
      // Wird der Bogenscheitel abgeschnitten? drei.top < sr.top ⇒ ja
      bogenUeberstand: sr.top - drei.top,
      abschnittHoehe: sr.height,
      nahBeruehrtText: treffer,
      passLuecke: ziel.top - ball.bottom,
      ballDeckkraft: Number(getComputedStyle(sec.querySelector("[data-pass-ball]")).opacity),
      ballLinks: ziel.left - ball.right,
      seitenbreite: document.documentElement.scrollWidth,
      fensterbreite: window.innerWidth,
    };
  });
  await ctx.close();
  return r;
}

for (const zustand of TOK ? ["aus", "an"] : ["aus"]) {
  console.log(`\n===== ${zustand === "an" ? "ANGEMELDET" : "AUSGELOGGT"} =====`);
  console.log("Fenster    | Text→Lade | Korb↑Ende | Ø Korb | Bogen-Überstand | Abschn. | Text getroffen | Pass-Lücke | Deckkr | quer");
  for (const [B, H] of FENSTER) {
    const r = await messen(B, H, zustand === "an" ? TOK : null);
    const quer = r.seitenbreite > r.fensterbreite ? `JA ${r.seitenbreite}` : "nein";
    const luecke = r.passLuecke > 0 ? r.passLuecke.toFixed(1) : `${r.ballLinks.toFixed(1)}(seitl.)`;
    console.log(
      `${String(B).padStart(4)}x${String(H).padEnd(5)} | ${r.abstandTextZuLadezone.toFixed(1).padStart(9)} | ` +
      `${r.korbUeberAbschnittsende.toFixed(1).padStart(9)} | ${r.korbDurchmesser.toFixed(1).padStart(6)} | ` +
      `${r.bogenUeberstand.toFixed(1).padStart(15)} | ${r.abschnittHoehe.toFixed(0).padStart(7)} | ` +
      `${(r.nahBeruehrtText.join(",") || "—").padEnd(14)} | ${luecke.padStart(10)} | ${r.ballDeckkraft.toFixed(2)} | ${quer}`,
    );
  }
}
await browser.close();
