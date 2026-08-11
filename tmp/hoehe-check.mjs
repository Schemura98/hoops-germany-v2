import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [name, notifs] of [["mit Signal", [{ type: "join_request", read: false }]], ["ohne Signal", []]]) {
  for (const w of [375, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 812 } });
    const page = await ctx.newPage();
    await page.route("**/api/player/getnotifications", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, notifications: notifs, unreadCount: notifs.length }) }));
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const r = await fetch("/api/player/playerlogin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "max@test.de", password: "test123" }) });
      const d = await r.json(); if (d.token) localStorage.setItem("playerAuthToken", d.token);
    });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1600);
    const d = await page.evaluate(() => {
      const block = document.querySelector(".max-w-4xl");
      const zeile = [...block.querySelectorAll("div")].find((el) => el.className.includes("min-h-[46px]"));
      const btn = [...block.querySelectorAll("a")].find((a) => a.getAttribute("href") === "/home");
      return { zeilenhoehe: Math.round(zeile?.getBoundingClientRect().height), buttonOben: Math.round(btn?.getBoundingClientRect().top) };
    });
    console.log(`${name.padEnd(12)} ${w}px: Zeilenhoehe ${d.zeilenhoehe}px, "Zum Feed" bei y=${d.buttonOben}`);
    await ctx.close();
  }
}
await browser.close();
