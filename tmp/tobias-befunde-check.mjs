// Gegenprobe zu Tobias' drei Punkten.
// 1) Erreicht die Sequenz beim untersten Scrollstand wirklich das letzte Bild?
// 2) Folgt der Ball beim Zurueckscrollen wieder dem Balken?
// 3) Reagieren die Navbar-Knoepfe auf einen echten Klick? (Sein Verdacht liess
//    sich mit seinem Werkzeug nicht von einer Werkzeuggrenze trennen.)
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
let ok = 0, schlecht = 0;
const melde = (gut, text) => { console.log(`${gut ? "ok  " : "FEHL"} ${text}`); gut ? ok++ : schlecht++; };

for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 90)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  // --- 1) Sequenz bis ans Seitenende ---------------------------------------
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1800);
  const seq = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { fehler: "kein Canvas" };
    // Letztes gezeichnetes Bild ueber die Helligkeit unten links schaetzen geht
    // nicht zuverlaessig - stattdessen die Formel nachrechnen wie im Bauteil.
    const wrap = c.parentElement;
    const r = wrap.getBoundingClientRect();
    const hoehe = window.innerHeight;
    const scrollY = window.scrollY;
    const obenAbsolut = r.top + scrollY;
    const start = obenAbsolut - hoehe;
    const natuerlichesEnde = obenAbsolut + r.height;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - hoehe);
    const ende = Math.min(natuerlichesEnde, maxScroll);
    const t = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, ende - start)));
    return { t: +t.toFixed(3), bild: Math.min(44, Math.floor(t * 45)), amEnde: scrollY >= maxScroll - 1 };
  });
  melde(seq.bild === 44 && seq.amEnde, `${tag}: Sequenz erreicht Bild ${seq.bild}/44 am Seitenende (t=${seq.t})`);

  // --- 2) Ball folgt beim Zurueckscrollen -----------------------------------
  const mess = async () => page.evaluate(() => {
    const balken = document.querySelector('[class*="origin-left"]');
    const ball = document.querySelector('[data-rail-ball], [class*="rail-ball"]')
      || Array.from(document.querySelectorAll("span,div")).find((e) => e.style && e.style.transform && e.style.transform.includes("translate3d") && e.closest('[class*="sticky"]'));
    if (!balken || !ball) return null;
    const bt = getComputedStyle(balken).transform;
    const skala = bt && bt !== "none" ? parseFloat(bt.split("(")[1]) : 1;
    const x = parseFloat((ball.style.transform.match(/translate3d\(([-\d.]+)px/) || [])[1] || "NaN");
    return { balkenAnteil: +skala.toFixed(3), ballX: Math.round(x), spurBreite: Math.round(balken.parentElement.getBoundingClientRect().width) };
  });
  const sektionY = await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
    return s ? s.offsetTop : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 0.6), sektionY);
  await page.waitForTimeout(900);
  const zurueck = await mess();
  if (zurueck && breite === 390) {
    const erwartet = Math.round(zurueck.spurBreite * zurueck.balkenAnteil - 7);
    const passt = Math.abs(zurueck.ballX - erwartet) <= 3;
    melde(passt, `${tag}: Ball folgt nach Rueckscroll dem Balken (Ball ${zurueck.ballX}px, erwartet ${erwartet}px bei ${Math.round(zurueck.balkenAnteil * 100)}%)`);
  }

  // --- 3) Navbar-Knoepfe mit echtem Klick ------------------------------------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  if (breite === 390) {
    await page.getByLabel("Menü öffnen").click({ timeout: 5000 });
    await page.waitForTimeout(400);
    const offen = await page.getByRole("link", { name: "Transfermarkt", exact: false }).first().isVisible();
    melde(offen, `${tag}: Hamburger-Knopf reagiert auf echten Klick`);
    if (offen) {
      await page.getByLabel("Menü schließen").click({ timeout: 5000 }).catch(async () => {
        await page.getByLabel("Menü öffnen").click({ timeout: 5000 });
      });
      await page.waitForTimeout(400);
      const zu = !(await page.getByRole("link", { name: "Transfermarkt", exact: false }).first().isVisible().catch(() => false));
      melde(zu, `${tag}: Menü schließt wieder`);
    }
  }
  await page.getByLabel("Suche öffnen").click({ timeout: 5000 });
  await page.waitForTimeout(400);
  const suchfeld = await page.getByPlaceholder("Spieler oder Team suchen…").isVisible().catch(() => false);
  melde(suchfeld, `${tag}: Such-Knopf in der klebenden Navbar reagiert`);

  console.log(`     Konsolenfehler: ${fehler.length ? fehler.join(" | ") : "keine"}`);
  await ctx.close();
}
console.log(`\nbestanden: ${ok} · fehlgeschlagen: ${schlecht}`);
await browser.close();
process.exit(schlecht ? 1 : 0);
