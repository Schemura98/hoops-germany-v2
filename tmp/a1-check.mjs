// A1 (überbreite Überschrift, LandingFeatures.js): prüft, dass der Überstand
// aus der tatsächlichen Textbreite entsteht (clamp+nowrap), nicht aus einem
// wortspezifisch getunten Wert - Patricks Nachtrag 12.08.2026. Zwei Proben:
// Original-Text UND ein kuenstlich doppelt so langer Ersatztext (simuliert
// "Deutschland" statt "NRW"-artige spaetere Aenderungen). Ausserdem: kein
// horizontaler Scroll auf Body-Ebene trotz Full-Bleed-Technik.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
fs.mkdirSync("tmp/shots", { recursive: true });
const browser = await chromium.launch();

for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"], [1920, "breit"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 120)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  const messen = () =>
    page.evaluate(() => {
      const h2 = Array.from(document.querySelectorAll("h2")).find((h) =>
        h.textContent.includes("Eine Saison")
      );
      if (!h2) return { fehler: "h2 nicht gefunden" };
      const r = h2.getBoundingClientRect();
      return {
        textWidth: Math.round(r.width),
        fenster: window.innerWidth,
        ueberstandLinks: Math.round(-r.left),
        ueberstandRechts: Math.round(r.right - window.innerWidth),
        bodyScrollWidth: document.body.scrollWidth,
        hatHorizontalenScroll: document.body.scrollWidth > window.innerWidth + 1,
      };
    });

  const original = await messen();
  // Zweite Messung NACH echtem Sichtbarwerden (Reveal-Animation abgeschlossen):
  // Reveal schreibt beim Erreichen von `inView` selbst `translate-x-0` in
  // dieselbe Klassenkaskade - eine Messung nur VOR dem Scrollen haette den
  // ersten, falschen Versuch (asymmetrischer Ueberstand nach dem Einblenden)
  // nicht gefunden. Beide Werte muessen uebereinstimmen.
  await page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll("h2")).find((h) => h.textContent.includes("Eine Saison"));
    h2?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(900);
  const nachReveal = await messen();
  const stimmtUeberein =
    original.ueberstandLinks === nachReveal.ueberstandLinks &&
    original.ueberstandRechts === nachReveal.ueberstandRechts;
  console.log(
    `${tag} Ueberstand VOR/NACH Reveal-Animation stimmt ueberein:`,
    stimmtUeberein,
    stimmtUeberein ? "" : `(vor: ${JSON.stringify(original)}, nach: ${JSON.stringify(nachReveal)})`
  );

  // Simulation eines doppelt so langen Textes (z.B. spaetere deutschlandweite
  // Variante) - rein clientseitig, ohne den echten Text zu aendern.
  const doppelt = await page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll("h2")).find((h) =>
      h.textContent.includes("Eine Saison")
    );
    if (!h2) return { fehler: "h2 nicht gefunden" };
    const vorher = h2.textContent;
    h2.textContent = vorher + " " + vorher; // exakt doppelt so lang
    const r = h2.getBoundingClientRect();
    const ergebnis = {
      textWidth: Math.round(r.width),
      fenster: window.innerWidth,
      ueberstandLinks: Math.round(-r.left),
      ueberstandRechts: Math.round(r.right - window.innerWidth),
      bodyScrollWidth: document.body.scrollWidth,
      hatHorizontalenScroll: document.body.scrollWidth > window.innerWidth + 1,
    };
    h2.textContent = vorher; // zurücksetzen
    return ergebnis;
  });

  console.log(`${tag} Original:`, JSON.stringify(original));
  console.log(`${tag} doppelt lang:`, JSON.stringify(doppelt));
  console.log(`${tag} Konsolenfehler:`, fehler.length ? fehler.join(" | ") : "keine");

  await page.evaluate(() => {
    const h2 = Array.from(document.querySelectorAll("h2")).find((h) => h.textContent.includes("Eine Saison"));
    h2?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tmp/shots/A1-${tag}.png` });
  await ctx.close();
}
await browser.close();
console.log("fertig");
