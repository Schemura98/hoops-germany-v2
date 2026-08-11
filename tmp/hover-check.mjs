import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const r = await fetch("/api/player/playerlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "max@test.de", password: "test123" }) });
  const d = await r.json(); if (d.token) localStorage.setItem("playerAuthToken", d.token);
});
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const sel = 'a[href="/feedback"]';
const vor = await page.evaluate((s) => {
  const a = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().height > 40);
  const i = a.querySelector("svg");
  return { flaeche: getComputedStyle(a).backgroundColor, icon: getComputedStyle(i).color };
}, sel);
await page.hover(`${sel} >> nth=1`).catch(() => page.hover(sel));
await page.waitForTimeout(400);
const nach = await page.evaluate((s) => {
  const a = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().height > 40);
  const i = a.querySelector("svg");
  return { flaeche: getComputedStyle(a).backgroundColor, icon: getComputedStyle(i).color };
}, sel);
console.log("ohne Hover:", JSON.stringify(vor));
console.log("mit  Hover:", JSON.stringify(nach), nach.flaeche === nach.icon ? "→ ICON UNSICHTBAR" : "→ Icon sichtbar");
await browser.close();
