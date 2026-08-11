import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 100)));

await page.goto("http://localhost:3000/datenschutz", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const d = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Abschnitte dieser Seite"]');
  const links = nav ? [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href")) : [];
  const ids = [...document.querySelectorAll("h2[id]")].map((h) => h.id);
  const p = document.querySelector(".bg-white p");
  // Zeichen pro Zeile grob schaetzen: Breite / mittlere Zeichenbreite
  const cs = getComputedStyle(p);
  const test = document.createElement("span");
  test.style.cssText = `font:${cs.font};visibility:hidden;white-space:nowrap;position:absolute`;
  test.textContent = "abcdefghijklmnopqrstuvwxyz";
  document.body.appendChild(test);
  const zeichenbreite = test.getBoundingClientRect().width / 26;
  test.remove();
  return { menuLinks: links.length, ersteLinks: links.slice(0, 3), ids: ids.length, alleIdsVorhanden: links.every((h) => document.querySelector(h)),
           zeichenProZeile: Math.round(p.getBoundingClientRect().width / zeichenbreite) };
});
console.log("datenschutz:", JSON.stringify(d));
await page.screenshot({ path: `${OUT}/datenschutz.png` });

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto("http://localhost:3000/impressum", { waitUntil: "networkidle" });
const imp = await page.evaluate(() => {
  const p = document.querySelector(".bg-white p");
  const cs = getComputedStyle(p);
  const test = document.createElement("span");
  test.style.cssText = `font:${cs.font};visibility:hidden;white-space:nowrap;position:absolute`;
  test.textContent = "abcdefghijklmnopqrstuvwxyz";
  document.body.appendChild(test);
  const zb = test.getBoundingClientRect().width / 26;
  test.remove();
  return { menu: !!document.querySelector('nav[aria-label="Abschnitte dieser Seite"]'), zeichenProZeile: Math.round(p.getBoundingClientRect().width / zb) };
});
console.log("impressum (1280px):", JSON.stringify(imp));

await page.goto("http://localhost:3000/oauth-landing", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const oa = await page.evaluate(() => ({
  logo: !!document.querySelector('img[alt="Hoops Germany"]'),
  alert: document.querySelector('[role="alert"]')?.textContent?.trim() || null,
  button: [...document.querySelectorAll("a")].some((a) => a.textContent.includes("Zurück zur Anmeldung")),
}));
console.log("oauth-landing:", JSON.stringify(oa));
await page.screenshot({ path: `${OUT}/oauth-landing.png` });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
