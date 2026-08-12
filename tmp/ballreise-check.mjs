// A10 "Ballreise" (docs/SPIELFELD-STRECKE-2026-08-12.md): Ball-Marker auf der
// Fortschritts-Leiste, Ankunft am Korb-Emblem, Einfrieren nach der Ankunft,
// Hero-Aufsetzer ohne Ausblenden, prefers-reduced-motion-Ruhezustand.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });

const browser = await chromium.launch();

async function scrollFeaturesTo(page, anteil) {
  await page.evaluate((a) => {
    const s = Array.from(document.querySelectorAll("section")).find((x) =>
      x.textContent.includes("Eine Saison")
    );
    if (!s) return;
    window.scrollTo(0, s.offsetTop + s.offsetHeight * a);
  }, anteil);
  await page.waitForTimeout(500);
}

for (const [breite, tag] of [
  [390, "mobil"],
  [1280, "desktop"],
]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 850 } });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 140)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  // Hero: Ball soll bei ca. 60% der Fallstrecke sichtbar UND nicht ausgeblendet sein
  // (frueher fiel die Deckkraft am Ende gegen 0 - jetzt bleibt sie bei 1).
  const heroMitte = await page.evaluate(() => {
    window.scrollTo(0, Math.round(window.innerHeight * 0.4));
    return null;
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tmp/shots/BALLREISE-${tag}-hero.png` });
  const heroBall = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll("svg"));
    const ball = svgs.find((s) => s.getAttribute("width") === "28");
    if (!ball) return null;
    return { opacity: getComputedStyle(ball).opacity, transform: ball.style.transform };
  });
  console.log(`${tag} Hero-Ball bei 40%:`, JSON.stringify(heroBall));

  // Start der Feature-Strecke (t~0): Marker soll am Anfang stehen, Ziel noch unsichtbar.
  await scrollFeaturesTo(page, 0.02);
  const start = await page.evaluate(() => {
    const mob = document.querySelector('[title="Ziel: Nachspielzeit"]');
    return mob ? getComputedStyle(mob).opacity : null;
  });
  console.log(`${tag} Ziel-Opazitaet am Streckenanfang:`, start);
  await page.screenshot({ path: `tmp/shots/BALLREISE-${tag}-start.png` });

  // Mitte der Strecke (Szene 2/5 - Fluegel-Momente bei Desktop)
  await scrollFeaturesTo(page, 0.3);
  await page.screenshot({ path: `tmp/shots/BALLREISE-${tag}-mitte.png` });

  // Ende der Strecke: Ball soll am Korb angekommen sein, Ziel voll sichtbar.
  await scrollFeaturesTo(page, 0.98);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `tmp/shots/BALLREISE-${tag}-ziel.png` });
  const ziel = await page.evaluate(() => {
    const alle = Array.from(document.querySelectorAll('[title="Ziel: Nachspielzeit"]'));
    return alle.map((el) => getComputedStyle(el).opacity);
  });
  console.log(`${tag} Ziel-Opazitaeten am Streckenende:`, JSON.stringify(ziel));

  // Zurueckscrollen: Ball darf NICHT zurueckspringen (Konzept: "kein Zurueckspringen").
  const vorher = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll("svg[width='14']"));
    return svgs.map((s) => s.style.transform);
  });
  await scrollFeaturesTo(page, 0.1);
  await page.waitForTimeout(400);
  const nachher = await page.evaluate(() => {
    const svgs = Array.from(document.querySelectorAll("svg[width='14']"));
    return svgs.map((s) => s.style.transform);
  });
  const eingefroren = JSON.stringify(vorher) === JSON.stringify(nachher);
  console.log(`${tag} Ball bleibt nach Ankunft eingefroren beim Zurueckscrollen:`, eingefroren);

  console.log(`${tag} Konsolenfehler:`, fehler.length ? fehler.join(" | ") : "keine");
  await ctx.close();
}

// Reduced motion: Ball muss von Anfang an regungslos AM ZIEL stehen.
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 850 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 140)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await scrollFeaturesTo(page, 0.02); // ganz am ANFANG der Strecke
  await page.waitForTimeout(300);
  const zustand = await page.evaluate(() => {
    const ziel = document.querySelector('[title="Ziel: Nachspielzeit"]');
    const ball = document.querySelector("svg[width='14']");
    return {
      zielOpazitaet: ziel ? getComputedStyle(ziel).opacity : null,
      ballOpazitaet: ball ? getComputedStyle(ball).opacity : null,
      ballTransform: ball ? ball.style.transform : null,
    };
  });
  console.log("reduced-motion (am Streckenanfang, Ball soll schon am Ziel stehen):", JSON.stringify(zustand));
  await page.screenshot({ path: `tmp/shots/BALLREISE-reduced-motion.png` });
  console.log("reduced-motion Konsolenfehler:", fehler.length ? fehler.join(" | ") : "keine");
  await ctx.close();
}

await browser.close();
console.log("fertig");
