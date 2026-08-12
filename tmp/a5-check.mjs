// A5 (Kapitelmarke) im Browser ansehen - laut Uebergabe nie geprueft.
import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const b = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await b.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  const fehler = [];
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 100)));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    const s = Array.from(document.querySelectorAll("section")).find((x) => x.textContent.includes("Eine Saison"));
    if (s) window.scrollTo(0, s.offsetTop + 60);
  });
  await page.waitForTimeout(900);
  const sr = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".sr-only")).map((e) => e.textContent.trim()).filter((t) => /Schritt/.test(t))
  );
  console.log(`${tag}: sr-only-Zaehlung = ${JSON.stringify(sr.slice(0, 3))} · Konsolenfehler: ${fehler.length || "keine"}`);
  await page.screenshot({ path: `tmp/shots/A5-${tag}.png` });
  await ctx.close();
}
await b.close();
