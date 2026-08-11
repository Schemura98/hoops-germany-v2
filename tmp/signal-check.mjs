import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 70)));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 70)));
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
const info = await page.evaluate(async () => {
  const r = await fetch("/api/player/playerlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "max@test.de", password: "test123" }) });
  const d = await r.json();
  if (!d.token) return { login: false };
  localStorage.setItem("playerAuthToken", d.token);
  const n = await (await fetch("/api/player/getnotifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: d.token }) })).json();
  const offen = (n.notifications || []).filter((x) => !x.read);
  const typen = {};
  offen.forEach((x) => { typen[x.type] = (typen[x.type] || 0) + 1; });
  return { login: true, ungelesen: offen.length, typen };
});
console.log("Datenlage Testkonto:", JSON.stringify(info));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
const hero = await page.evaluate(() => {
  const block = document.querySelector(".max-w-4xl");
  const signal = [...block.querySelectorAll("a")].find((a) => a.className.includes("rounded-full"));
  const p = [...block.querySelectorAll("p")].find((x) => x.textContent.includes("Was möchtest du"));
  return {
    signalText: signal?.innerText.trim() || null,
    signalZiel: signal?.getAttribute("href") || null,
    generischeZeile: p ? p.textContent.trim() : null,
  };
});
console.log("Hero zeigt:", JSON.stringify(hero));
await page.screenshot({ path: `${OUT}/hero-signal.png` });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
