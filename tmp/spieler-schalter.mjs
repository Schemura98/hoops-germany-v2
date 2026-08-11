import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 70)));
await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const r = await fetch("/api/admin/adminlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "admin", password: "geheim1234" }) });
  const d = await r.json(); if (d.token) localStorage.setItem("adminAuthToken", d.token);
});
await page.goto("http://localhost:3000/admin/players", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const d = await page.evaluate(async () => {
  const btn = document.querySelector('tbody tr button[aria-pressed]');
  if (!btn) return { schalter: false };
  const zeile = btn.closest("tr");
  const name = zeile.querySelector("a")?.innerText.trim();
  btn.click();
  await new Promise((r) => setTimeout(r, 1200));
  const an = zeile.innerText.includes("intern");
  zeile.querySelector('button[aria-pressed]').click();
  await new Promise((r) => setTimeout(r, 1200));
  return { schalter: true, name, nachKlick: an, nachZuruecksetzen: zeile.innerText.includes("intern") };
});
console.log("Spielerliste:", JSON.stringify(d), "· Fehler:", fehler.length ? fehler : "keine");
await browser.close();
