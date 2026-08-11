import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const browser = await chromium.launch();
// Faelle ueber abgefangene Antworten pruefen - keine Schreibaktion auf irgendeiner DB
const faelle = [
  { name: "2 Beitrittsanfragen", notifs: [{ type: "join_request", read: false }, { type: "join_request", read: false }, { type: "follow", read: false }] },
  { name: "1 offenes Ergebnis", notifs: [{ type: "pending_result", read: false }, { type: "follow", read: false }] },
  { name: "nur Sonstiges", notifs: [{ type: "follow", read: false }, { type: "follow", read: false }] },
  { name: "alles gelesen", notifs: [{ type: "join_request", read: true }] },
];
for (const f of faelle) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route("**/api/player/getnotifications", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, notifications: f.notifs, unreadCount: f.notifs.filter((n) => !n.read).length }) })
  );
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const r = await fetch("/api/player/playerlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "max@test.de", password: "test123" }) });
    const d = await r.json(); if (d.token) localStorage.setItem("playerAuthToken", d.token);
  });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  const d = await page.evaluate(() => {
    const block = document.querySelector(".max-w-4xl");
    const a = [...block.querySelectorAll("a")].find((x) => x.className.includes("rounded-full") && x.className.includes("border-white/30"));
    const p = [...block.querySelectorAll("p")].find((x) => x.textContent.includes("Was möchtest du"));
    return { signal: a ? `${a.innerText.trim()} -> ${a.getAttribute("href")}` : null, generisch: !!p };
  });
  console.log(`${f.name.padEnd(20)} ${d.signal ? d.signal : "(kein Signal)"}${d.generisch ? "  [generische Zeile sichtbar]" : ""}`);
  if (f.name.startsWith("2 ")) await page.screenshot({ path: `${OUT}/hero-signal-anfragen.png` });
  await ctx.close();
}
await browser.close();
