// Vorschau + Messung der Hero-Bühne. Kein Testfall, reines Werkzeug:
// scrollt den Hero in Schritten durch, misst Ball/Emblem/CTA und legt
// Screenshots ab. Start: node scratchpad/hero-preview.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] || ".";
const BASE = "http://localhost:3000";

const probe = `(() => {
  const ball = document.querySelector('svg[viewBox="0 0 28 28"]');
  const emblem = document.querySelector('svg[viewBox="0 0 20 14"]');
  const arc = document.querySelector('svg[viewBox="0 0 400 200"]');
  const navy = document.querySelector('.bg-gradient-to-br.from-slate-950');
  const ctas = [...document.querySelectorAll('a[href="/signup"]')];
  const cta = ctas.find(a => a.getBoundingClientRect().height > 0);
  const r = el => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  return {
    scrollY: Math.round(window.scrollY),
    ball: ball ? r(ball) : null,
    ballOpacity: ball ? ball.style.opacity : null,
    emblem: emblem ? r(emblem) : null,
    emblemOpacity: emblem ? emblem.style.opacity : null,
    cta: cta ? r(cta) : null,
    navy: navy ? navy.style.opacity : null,
    arc: arc ? arc.style.opacity : null,
    innerHeight: window.innerHeight,
  };
})()`;

async function run(browser, label, viewport, steps, shots = [], reducedMotion = "no-preference") {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion });
  const page = await ctx.newPage();
  const konsole = [];
  page.on("console", (m) => m.type() === "error" && konsole.push(m.text()));
  page.on("pageerror", (e) => konsole.push("pageerror: " + e.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const zeilen = [];
  for (const y of steps) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(220); // rAF + Style-Mutation
    const data = await page.evaluate(probe);
    zeilen.push(data);
    if (shots.includes(y)) {
      await page.screenshot({ path: path.join(OUT, `hero-${label}-scroll${y}.png`) });
    }
  }
  await ctx.close();
  return { label, viewport, zeilen, konsole };
}

const browser = await chromium.launch();
const ergebnisse = [];
ergebnisse.push(await run(browser, "mobil", { width: 375, height: 812 }, [0, 60, 120, 180, 240, 300, 380], [0, 180, 300, 380]));
ergebnisse.push(await run(browser, "desktop", { width: 1440, height: 900 }, [0, 100, 200, 300, 420, 560], [0, 300, 420]));
ergebnisse.push(await run(browser, "reduced", { width: 375, height: 812 }, [0, 200], [200], "reduce"));
await browser.close();

fs.writeFileSync(path.join(OUT, "hero-messung.json"), JSON.stringify(ergebnisse, null, 1));
for (const e of ergebnisse) {
  console.log("\n=== " + e.label + " (" + e.viewport.width + "x" + e.viewport.height + ") ===");
  for (const z of e.zeilen) {
    console.log(
      `scroll ${String(z.scrollY).padStart(3)} | ball ${JSON.stringify(z.ball)} op=${z.ballOpacity} | emblem ${JSON.stringify(z.emblem)} op=${z.emblemOpacity} | cta ${JSON.stringify(z.cta)} | navy=${z.navy} arc=${z.arc}`
    );
  }
  if (e.konsole.length) console.log("KONSOLENFEHLER:", e.konsole);
}
