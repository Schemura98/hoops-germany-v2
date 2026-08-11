import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(e.message.slice(0, 80)));
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 80)));
// Eingeloggte Hero-Variante: Token per API holen und setzen
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
const ok = await page.evaluate(async () => {
  const r = await fetch("/api/player/playerlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "max@test.de", password: "test123" }) });
  const d = await r.json();
  if (!d.token) return false;
  localStorage.setItem("playerAuthToken", d.token);
  return true;
});
console.log("Login:", ok ? "ok" : "fehlgeschlagen");
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const d = await page.evaluate(() => {
  const links = [...document.querySelectorAll("a")].filter((a) => a.closest(".max-w-4xl") && a.innerText.trim().length > 0 && a.getBoundingClientRect().height > 40);
  return links.map((a, i) => ({ i: i + 1, text: a.innerText.trim(), href: a.getAttribute("href"), rand: getComputedStyle(a).borderColor }));
});
console.log("Hero-Schaltflaechen in Reihenfolge:");
d.forEach((x) => console.log(`  ${x.i}. ${x.text.padEnd(14)} ${x.href}  ${x.rand}`));
const klick = await page.evaluate(async () => {
  const fb = [...document.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/feedback" && a.getBoundingClientRect().height > 40);
  if (!fb) return "nicht gefunden";
  const r = fb.getBoundingClientRect();
  const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return fb.contains(oben) ? "klickbar (nichts liegt darueber)" : "verdeckt durch " + oben?.tagName;
});
console.log("Feedback-Button:", klick);
await page.screenshot({ path: `${OUT}/hero-eingeloggt.png` });
console.log("Fehler:", fehler.length ? fehler : "keine");
await browser.close();
