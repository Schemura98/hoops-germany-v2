import { chromium } from "@playwright/test";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const out = {};

// 1) Site-wide horizontal-overflow + console/network sweep at 375px (independent check)
{
  const pages = ["/", "/spieler", "/teams", "/transfermarkt", "/rangliste", "/topscorer", "/ligen",
    "/spiele", "/tryouts", "/about", "/kontakt", "/datenschutz", "/impressum", "/feedback",
    "/login", "/signup", "/reset-password", "/installieren", "/oauth-landing"];
  const results = [];
  for (const url of pages) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    const fehler = [];
    const failedReq = [];
    page.on("pageerror", (e) => fehler.push(e.message));
    page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 150)));
    page.on("response", (r) => { if (r.status() >= 400) failedReq.push(r.url() + " -> " + r.status()); });
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    results.push({ url, overflowPx: overflow, fehler, failedReq });
    await ctx.close();
  }
  out.siteSweep375 = results;
}

// 2) Tabs.js pill switcher - check it's not visually squeezed (min height / text fit) on pages that use it
{
  const results = [];
  for (const url of ["/spieler", "/teams", "/transfermarkt"]) {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const d = await page.evaluate(() => {
      const tabs = [...document.querySelectorAll('[role="tab"], button')].filter(b => b.closest('[class*="max-w-full"]'));
      const container = document.querySelector('.max-w-full');
      if (!container) return { found: false };
      const rect = container.getBoundingClientRect();
      const overflowsViewport = rect.right > window.innerWidth + 1 || rect.left < -1;
      const buttons = [...container.querySelectorAll('button, a')].map(b => {
        const r = b.getBoundingClientRect();
        return { text: b.textContent.trim().slice(0, 20), width: Math.round(r.width), height: Math.round(r.height) };
      });
      return { found: true, containerWidth: Math.round(rect.width), overflowsViewport, buttons };
    });
    results.push({ url, ...d });
    await ctx.close();
  }
  out.tabsCheck = results;
}

// 3) CountUp top-3-only on /rangliste, /topscorer
{
  const results = [];
  for (const url of ["/rangliste", "/topscorer"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const d = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return { found: false };
      const rows = [...table.querySelectorAll('tbody tr')].slice(0, 6);
      return { found: true, rowCount: rows.length, rowTexts: rows.map(r => r.textContent.trim().slice(0, 60)) };
    });
    results.push({ url, ...d });
    await ctx.close();
  }
  out.countUpTop3 = results;
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
