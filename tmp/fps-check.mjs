// Bildrate der neuen Scroll-Effekte unter 4x-CPU-Drosselung.
//
// Ronjas Leitplanke: >= 50 fps bei 4x-Drosselung. Das ist keine neu erfundene
// Zahl - der Maßstab steht bereits als offener Punkt in CLAUDE.md (Roadmap #11).
//
// Gemessen wird über requestAnimationFrame IM SEITENKONTEXT, während ein
// Scroll-Verlauf abgespielt wird - nicht über Screenshots (die sind
// Momentaufnahmen und können über Ruckeln nichts sagen, genau Tobias' Vorbehalt).
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();

for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  // Gegenprobe, ob die Drosselung ueberhaupt greift: dieselbe Rechenschleife
  // ungedrosselt und gedrosselt messen. Ohne diese Probe koennte ein
  // fehlgeschlagener CDP-Aufruf als "laeuft fluessig" durchgehen.
  const last = () => page.evaluate(() => {
    const t = performance.now();
    let x = 0;
    for (let i = 0; i < 4e6; i++) x += Math.sqrt(i);
    return +(performance.now() - t).toFixed(1);
  });
  const ohne = await last();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const mit = await last();
  console.log(`  Drosselprobe ${tag}: ${ohne}ms ohne / ${mit}ms mit -> Faktor ${(mit / ohne).toFixed(1)}`);
  await page.waitForTimeout(1500); // Einblend-Animationen abklingen lassen

  const ergebnis = await page.evaluate(async () => {
    const abstaende = [];
    let vorher = performance.now();
    let laeuft = true;
    const tick = (jetzt) => {
      abstaende.push(jetzt - vorher);
      vorher = jetzt;
      if (laeuft) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Gleichmäßiger Scroll über Hero + Feature-Strecke, ~3 Sekunden
    const ziel = document.body.scrollHeight * 0.55;
    const start = performance.now();
    await new Promise((fertig) => {
      const schritt = () => {
        const p = Math.min(1, (performance.now() - start) / 3000);
        window.scrollTo(0, ziel * p);
        if (p < 1) requestAnimationFrame(schritt);
        else fertig();
      };
      requestAnimationFrame(schritt);
    });
    laeuft = false;

    const gemessen = abstaende.slice(2); // erste beiden verwerfen (Aufwärmen)
    const summe = gemessen.reduce((a, b) => a + b, 0);
    const sortiert = [...gemessen].sort((a, b) => a - b);
    return {
      bilder: gemessen.length,
      fps: Math.round((gemessen.length / summe) * 1000),
      medianMs: +sortiert[Math.floor(sortiert.length / 2)].toFixed(1),
      schlechtestesMs: +sortiert[sortiert.length - 1].toFixed(1),
      // Bilder über 32ms = weniger als 30fps in dem Moment
      hakler: gemessen.filter((d) => d > 32).length,
    };
  });

  console.log(tag, JSON.stringify(ergebnis), ergebnis.fps >= 50 ? "OK" : "UNTER GRENZE");
  await ctx.close();
}
await browser.close();
