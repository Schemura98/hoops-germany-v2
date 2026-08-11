import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/transfermarkt", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
// Echte Live-Situation nachstellen: ein sehr langes Wort ohne Trennstelle in eine Karte
const d = await page.evaluate(() => {
  const karte = [...document.querySelectorAll("a,div")].find((e) => /rounded-2xl/.test(e.className || "") && /break-words/.test(e.className || ""));
  if (!karte) return { keineKarte: true };
  const p = document.createElement("p");
  p.className = "text-sm text-gray-600 break-words";
  p.textContent = "Regionalligaerfahrungsuchendermannschaftsspielerohnetrennstelle" + "x".repeat(40);
  karte.appendChild(p);
  return new Promise((res) => setTimeout(() => res({
    kartenbreite: Math.round(karte.getBoundingClientRect().width),
    ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }), 300));
});
console.log("mit kuenstlich langem Wort:", JSON.stringify(d));
await browser.close();
