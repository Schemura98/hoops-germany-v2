// Tobias' Befund Nr. 2 gezielt: Klebt der Ball nach der Ankunft rechts fest,
// waehrend Balken und Beschriftung zurueckgehen - oder folgt er wieder?
// Selektoren ueber die tatsaechliche Struktur (tmp/ball-debug.mjs), nicht geraten.
import { chromium } from "playwright";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 850 } })).newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

const lies = () => page.evaluate(() => {
  const leiste = Array.from(document.querySelectorAll("div"))
    .find((d) => getComputedStyle(d).position === "sticky" && d.textContent.includes("/ 6 ·"));
  if (!leiste) return { fehler: "Leiste nicht gefunden" };
  const balken = Array.from(leiste.querySelectorAll("div")).find((e) => e.style.transform.startsWith("scaleX"));
  // Nicht das erste svg nehmen: In der Leiste steht auch das Korb-Emblem, und
  // dessen transform ist ein calc()-Ausdruck ohne px-Zahl - daran ist der
  // erste Anlauf gescheitert.
  const ball = Array.from(leiste.querySelectorAll("svg"))
    .find((e) => /translate3d\(-?[\d.]+px/.test(e.style.transform || ""));
  if (!balken || !ball) return { fehler: "Balken oder Ball nicht gefunden" };
  const anteil = parseFloat(balken.style.transform.match(/scaleX\(([\d.]+)\)/)[1]);
  const x = parseFloat(ball.style.transform.match(/translate3d\(([-\d.]+)px/)[1]);
  const spur = balken.parentElement.getBoundingClientRect().width;
  return { text: leiste.querySelector("p").textContent.trim(), anteil: +anteil.toFixed(3), ballX: Math.round(x), spur: Math.round(spur) };
});

const y = await page.evaluate(() => {
  const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
  return { top: s.offsetTop, hoehe: s.offsetHeight };
});
// 1) Ankunft ausloesen
await page.evaluate((s) => window.scrollTo(0, s.top + s.hoehe - window.innerHeight * 0.4), y);
await page.waitForTimeout(1500);
const nachher = await lies();
console.log("nach Ankunft:  ", JSON.stringify(nachher));
// 2) zurueck zu Szene 2
await page.evaluate((s) => window.scrollTo(0, s.top + window.innerHeight * 0.9), y);
await page.waitForTimeout(1200);
const zurueck = await lies();
console.log("zurueckgerollt:", JSON.stringify(zurueck));

const erwartet = Math.round(zurueck.spur * zurueck.anteil - 7);
const passt = Math.abs(zurueck.ballX - erwartet) <= 4;
console.log(passt
  ? `OK - Ball folgt dem Balken (${zurueck.ballX}px, Balken bei ${erwartet}px)`
  : `FEHLER - Ball bei ${zurueck.ballX}px, Balken bei ${erwartet}px`);
await b.close();
process.exit(passt ? 0 : 1);
