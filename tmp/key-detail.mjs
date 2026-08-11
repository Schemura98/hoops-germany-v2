import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const treffer = [];
page.on("console", async (m) => {
  if (!/same key/.test(m.text())) return;
  const args = await Promise.all(m.args().map((a) => a.jsonValue().catch(() => "?")));
  treffer.push(args.join(" | ").slice(0, 600));
});
await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const r = await fetch("/api/admin/adminlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "admin", password: "geheim1234" }) });
  const d = await r.json(); if (d.token) localStorage.setItem("adminAuthToken", d.token);
});
await page.goto("http://localhost:3000/admin/analytics", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
console.log(treffer.length ? treffer.join("\n\n---\n\n") : "keine Warnung");
await browser.close();
