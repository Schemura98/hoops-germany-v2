import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
for (const fs of ["100%", "150%", "200%"]) {
  await page.evaluate((f) => { document.documentElement.style.fontSize = f; window.scrollTo(0, 0); }, fs);
  await page.waitForTimeout(500);
  const d = await page.evaluate(() => {
    const karte = [...document.querySelectorAll(".max-w-sm")].find((c) => c.textContent.includes("Köln"));
    const zeilen = [...karte.querySelectorAll("div[style*='translateY']")];
    const box = (el) => el.getBoundingClientRect();
    const hoehe = Math.round(box(zeilen[0]).height);
    // Abstand der Zeilenraster (Zeilenhoehe + Abstand) aus der dritten, unverschobenen Zeile
    const raster = Math.round(box(zeilen[2]).top - box(zeilen[1]).top);
    // Versatz, den die Choreografie gerade anwendet
    const versatz = zeilen.map((z) => {
      const m = getComputedStyle(z).transform.match(/matrix\(1, 0, 0, 1, 0, ([-\d.]+)\)/);
      return m ? Math.round(Number(m[1])) : 0;
    });
    return { zeilenhoehe: hoehe, raster, versatz, passt: Math.abs(Math.abs(versatz[0]) - raster) <= 1 };
  });
  console.log(`Zoom ${fs}: Zeilenhoehe ${d.zeilenhoehe}px · Raster ${d.raster}px · Versatz ${JSON.stringify(d.versatz)} → ${d.passt ? "PASST" : "FEHLER (Versatz != Raster)"}`);
}
await browser.close();
