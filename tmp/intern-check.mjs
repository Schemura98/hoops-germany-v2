import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 80)));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 80)));

await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
const login = await page.evaluate(async () => {
  const r = await fetch("/api/admin/adminlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "admin", password: "geheim1234" }) });
  const d = await r.json();
  if (d.token) { localStorage.setItem("adminAuthToken", d.token); return true; }
  return JSON.stringify(d).slice(0, 120);
});
console.log("Admin-Login:", login === true ? "ok" : login);

await page.goto("http://localhost:3000/admin/teams", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const vorher = await page.evaluate(() => {
  const zeilen = [...document.querySelectorAll("tbody tr")];
  const erste = zeilen[0];
  return {
    zeilen: zeilen.length,
    ersteTeam: erste?.querySelector("a")?.innerText.trim(),
    schalterVorhanden: !!erste?.querySelector('button[aria-pressed]'),
    markierung: erste?.innerText.includes("intern"),
    beispieldaten: zeilen.filter((z) => z.innerText.includes("Beispieldaten")).length,
  };
});
console.log("Teamliste:", JSON.stringify(vorher));

// Schalter umlegen (schreibt in die DEV-DB) und wieder zuruecksetzen
const test = await page.evaluate(async () => {
  const btn = document.querySelector('tbody tr button[aria-pressed]');
  const zeile = btn.closest("tr");
  const name = zeile.querySelector("a").innerText.trim();
  btn.click();
  await new Promise((r) => setTimeout(r, 1200));
  const an = zeile.innerText.includes("intern");
  zeile.querySelector('button[aria-pressed]').click();
  await new Promise((r) => setTimeout(r, 1200));
  const aus = zeile.innerText.includes("intern");
  return { name, nachKlick: an, nachZuruecksetzen: aus };
});
console.log("Schalter:", JSON.stringify(test));
await page.screenshot({ path: `${OUT}/admin-teams-intern.png` });

await page.goto("http://localhost:3000/admin/analytics", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const analytics = await page.evaluate(() => {
  const karte = [...document.querySelectorAll("div")].find((d) => d.innerText?.startsWith("Echte Beteiligung"));
  return karte ? karte.innerText.replace(/\n+/g, " | ").slice(0, 260) : "Karte nicht gefunden";
});
console.log("Analytics:", analytics);
await page.screenshot({ path: `${OUT}/admin-analytics-echt.png` });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
