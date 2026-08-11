import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const B = "https://hoopsgermany.de";
const browser = await chromium.launch();
const alleFehler = [];

// 1) Startseite mobil: Hero-Ball, Feature-Szenen, Fortschritts-Anzeige
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on("pageerror", (e) => alleFehler.push("pageerror: " + e.message.slice(0, 80)));
page.on("console", (m) => m.type() === "error" && alleFehler.push(m.text().slice(0, 80)));
await page.goto(B + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const sec = await page.evaluate(() => {
  const s = [...document.querySelectorAll("section")].find((x) => x.textContent.includes("Spielzüge"));
  return s ? { top: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) } : null;
});
const rail = [];
for (const a of [0.1, 0.4, 0.7]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(sec.top + sec.h * a));
  await page.waitForTimeout(300);
  rail.push(await page.evaluate(() => {
    const bar = document.querySelector(".sticky.top-16.z-20");
    const label = document.querySelector("p.tracking-widest.text-gray-500");
    return { top: Math.round(bar.getBoundingClientRect().top), label: label?.textContent?.trim() };
  }));
}
console.log("Fortschritts-Anzeige live:", JSON.stringify(rail));
await page.evaluate(() => [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Sporthalle"))?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(1800);
const szene3 = await page.evaluate(() => {
  const k = [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Sporthalle"));
  const score = k.querySelector("p.font-black");
  const pill = [...k.querySelectorAll("span")].find((s) => s.textContent.trim() === "Bestätigt");
  return { score: score.textContent.trim(), scoreOp: getComputedStyle(score).opacity, pillOp: getComputedStyle(pill).opacity };
});
console.log("Ergebnis-Szene live:", JSON.stringify(szene3));
await page.screenshot({ path: `${OUT}/live-features.png` });

// 2) Tabellen + Rechtsseiten + Sweep
const sweep = [];
for (const u of ["/", "/rangliste", "/topscorer", "/ligen", "/spieler", "/teams", "/spiele", "/transfermarkt", "/tryouts", "/about", "/impressum", "/datenschutz", "/kontakt", "/feedback", "/login", "/signup", "/installieren"]) {
  const r = await page.goto(B + u, { waitUntil: "networkidle" }).catch(() => null);
  await page.waitForTimeout(500);
  const d = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  sweep.push(`${u}:${r?.status()}/${d}px`);
}
console.log("Sweep (Seite:Status/Ueberlauf):", sweep.join("  "));
const sticky = await page.goto(B + "/rangliste", { waitUntil: "networkidle" }).then(async () => {
  await page.waitForTimeout(1200);
  return page.evaluate(() => {
    const wrap = document.querySelector('[role="group"]');
    const zelle = document.querySelector("tbody tr td:nth-child(2)");
    const vor = Math.round(zelle.getBoundingClientRect().left);
    wrap.scrollLeft = 9999;
    return new Promise((res) => setTimeout(() => res({ ueberlauf: wrap.scrollWidth - wrap.clientWidth, bleibt: vor === Math.round(zelle.getBoundingClientRect().left) }), 300));
  });
});
console.log("Rangliste sticky live:", JSON.stringify(sticky));
console.log("Konsolen-/Seitenfehler gesamt:", alleFehler.length ? alleFehler : "keine");
await browser.close();
