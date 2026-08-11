import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const warn = [];
page.on("console", (m) => /same key/.test(m.text()) && warn.push(m.text().slice(0, 60)));
await page.goto("https://hoopsgermany.de/admin/login", { waitUntil: "networkidle" });
const ok = await page.evaluate(async () => {
  const r = await fetch("/api/admin/adminlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "admin", password: "geheim1234" }) });
  const d = await r.json(); if (d.token) { localStorage.setItem("adminAuthToken", d.token); return true; } return false;
});
console.log("Login live:", ok);
await page.goto("https://hoopsgermany.de/admin/analytics", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
console.log("Key-Warnungen auf der LIVE-Seite (ohne meine Aenderung):", warn.length ? warn : "keine");
await browser.close();
