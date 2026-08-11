// QA-Kopie des Mess-Werkzeugs (Vorlage: tmp/hero-preview.mjs).
// Start: node tmp/qa-hero-check.mjs <outdir>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] || ".";
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const probe = `(() => {
  const ball = document.querySelector('svg[viewBox="0 0 28 28"]');
  const emblem = document.querySelector('svg[viewBox="0 0 20 14"]');
  const arc = document.querySelector('svg[viewBox="0 0 400 200"]');
  const navy = document.querySelector('.bg-gradient-to-br.from-slate-950');
  const ctaSignup = [...document.querySelectorAll('a[href="/signup"]')].find(a => a.getBoundingClientRect().height > 0);
  const ctaFeed = [...document.querySelectorAll('a[href="/home"]')].find(a => a.getBoundingClientRect().height > 0);
  const cta = ctaSignup || ctaFeed;
  const r = el => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  const docEl = document.documentElement;
  return {
    scrollY: Math.round(window.scrollY),
    ball: ball ? r(ball) : null,
    ballOpacity: ball ? ball.style.opacity : null,
    emblem: emblem ? r(emblem) : null,
    emblemOpacity: emblem ? emblem.style.opacity : null,
    cta: cta ? r(cta) : null,
    ctaText: cta ? cta.textContent.trim() : null,
    navy: navy ? navy.style.opacity : null,
    arc: arc ? arc.style.opacity : null,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    scrollWidth: docEl.scrollWidth,
    hasHorizScroll: docEl.scrollWidth > window.innerWidth,
  };
})()`;

function overlaps(a, b) {
  if (!a || !b) return false;
  const [ax, ay, aw, ah] = a;
  const [bx, by, bw, bh] = b;
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

async function newLoggedContext(browser, viewport, extra = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, ...extra });
  const page = await ctx.newPage();
  const konsole = [];
  const failedReq = [];
  page.on("console", (m) => m.type() === "error" && konsole.push(m.text()));
  page.on("pageerror", (e) => konsole.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => failedReq.push(r.url() + " :: " + (r.failure()?.errorText || "")));
  page.on("response", (r) => { if (r.status() >= 400) failedReq.push(r.url() + " -> " + r.status()); });
  return { ctx, page, konsole, failedReq };
}

async function scrollSteps(page, steps, shots, label, OUTd) {
  const zeilen = [];
  for (const y of steps) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(220);
    const data = await page.evaluate(probe);
    zeilen.push(data);
    if (shots.includes(y)) {
      await page.screenshot({ path: path.join(OUTd, label + "-scroll" + y + ".png") });
    }
  }
  return zeilen;
}

const browser = await chromium.launch();
const alle = {};

// --- 1) Ausgeloggt, mobil 375x812 ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const zeilen = await scrollSteps(page, [0, 60, 120, 180, 240, 300, 380, 460], [0, 180, 300, 380, 460], "mobil375-loggedout", OUT);
  const overlapIssues = zeilen.filter((z) => z.emblem && z.cta && z.emblemOpacity !== "0" && overlaps(z.emblem, [z.cta[0] + 8, z.cta[1] + 8, z.cta[2] - 16, z.cta[3] - 16]));
  const back = await scrollSteps(page, [460, 300, 120, 0], [0], "mobil375-loggedout-back", OUT);
  await page.close();
  alle.mobil375_loggedout = { zeilen, back, konsole, failedReq, overlapIssues };
  await ctx.close();
}

// --- 2) Ausgeloggt, mobil 430x932 ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 430, height: 932 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const zeilen = await scrollSteps(page, [0, 80, 160, 260, 360, 460, 520], [0, 260, 460, 520], "mobil430-loggedout", OUT);
  await page.close();
  alle.mobil430_loggedout = { zeilen, konsole, failedReq };
  await ctx.close();
}

// --- 3) Desktop 1440x900 ausgeloggt ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const zeilen = await scrollSteps(page, [0, 100, 200, 300, 420, 560], [0, 300, 420, 560], "desktop1440-loggedout", OUT);
  await page.close();
  alle.desktop1440_loggedout = { zeilen, konsole, failedReq };
  await ctx.close();
}

// --- 4) prefers-reduced-motion, mobil ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 }, { reducedMotion: "reduce" });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const zeilen = await scrollSteps(page, [0, 200, 400], [0, 200, 400], "reduced-mobil", OUT);
  const headlineVisible = await page.locator("h1").first().isVisible();
  const headlineText = await page.locator("h1").first().textContent();
  await page.close();
  alle.reduced_motion = { zeilen, konsole, failedReq, headlineVisible, headlineText };
  await ctx.close();
}

// --- 5) Fling-Scroll ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(80);
  const afterFlingDown = await page.evaluate(probe);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  const afterFlingUp = await page.evaluate(probe);
  for (let i = 0; i < 15; i++) {
    await page.mouse.wheel(0, 120);
  }
  await page.waitForTimeout(150);
  const afterWheelBurst = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, "fling-afterWheelBurst.png") });
  await page.close();
  alle.fling = { afterFlingDown, afterFlingUp, afterWheelBurst, konsole, failedReq };
  await ctx.close();
}

// --- 6) Rotation mitten im Hero ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.waitForTimeout(200);
  const beforeRotate = await page.evaluate(probe);
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(300);
  const afterRotate = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, "rotation-landscape.png") });
  await page.close();
  alle.rotation = { beforeRotate, afterRotate, konsole, failedReq };
  await ctx.close();
}

// --- 7) Reload mitten im Hero ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 250));
  await page.waitForTimeout(200);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const afterReload = await page.evaluate(probe);
  await page.screenshot({ path: path.join(OUT, "reload-mid-hero.png") });
  await page.close();
  alle.reload_mid_hero = { afterReload, konsole, failedReq };
  await ctx.close();
}

// --- 8) Eingeloggt: echter Login ueber die UI ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', "max@test.de");
  await page.fill('input[name="password"]', "test123");
  await Promise.all([
    page.waitForURL("**/home", { timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(800);
  const loginUrl = page.url();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const zeilen = await scrollSteps(page, [0, 100, 200, 300, 400, 500, 600], [0, 200, 400, 600], "mobil375-loggedin", OUT);
  await page.close();
  alle.loggedin = { loginUrl, zeilen, konsole, failedReq };
  await ctx.close();
}

// --- 9) AuthShell Netzwerk-Check mobil vs Desktop ---
{
  const { ctx, page, konsole, failedReq } = await newLoggedContext(browser, { width: 375, height: 812 });
  const imgRequests = [];
  page.on("request", (r) => {
    if (/\.(jpe?g|avif|webp|png|gif)(\?|$)/i.test(r.url()) && !r.url().includes("logo")) imgRequests.push(r.url());
  });
  for (const route of ["/login", "/signup", "/reset-password"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
  }
  const mobileImgReqs = [...imgRequests];
  await page.close();

  const { ctx: ctxD, page: pageD, konsole: konsoleD, failedReq: failedReqD } = await newLoggedContext(browser, { width: 1440, height: 900 });
  const imgRequestsD = [];
  pageD.on("request", (r) => {
    if (/\.(jpe?g|avif|webp|png|gif)(\?|$)/i.test(r.url()) && !r.url().includes("logo")) imgRequestsD.push(r.url());
  });
  for (const route of ["/login", "/signup", "/reset-password"]) {
    await pageD.goto(BASE + route, { waitUntil: "networkidle" });
    await pageD.waitForTimeout(400);
    await pageD.screenshot({ path: path.join(OUT, "authshell-desktop" + route.replace(/\//g, "_") + ".png") });
  }
  await pageD.close();
  alle.authshell = { mobileImgReqs, desktopImgReqs: imgRequestsD, konsole, failedReq, konsoleD, failedReqD };
  await ctxD.close();
  await ctx.close();
}

// --- 10) Text-NRW-Check + horizontal scroll check auf /about ---
{
  const { ctx, page } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE + "/about", { waitUntil: "networkidle" });
  const aboutText = await page.locator("body").innerText();
  const aboutHasDeutschland = /Amateur-Basketball\s+in\s+Deutschland/.test(aboutText);
  const aboutHasNRW = /Amateur-Basketball\s+in\s+NRW/.test(aboutText);
  const hasHorizScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.close();
  alle.about_text = { aboutHasDeutschland, aboutHasNRW, hasHorizScroll };
  await ctx.close();
}

// --- 11) CPU-Drosselung 4x + Scroll-Ruckel-Messung ---
{
  const { ctx, page } = await newLoggedContext(browser, { width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const client = await ctx.newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const frameTimes = await page.evaluate(async () => {
    const times = [];
    let last = performance.now();
    function tick(ts) {
      times.push(ts - last);
      last = ts;
    }
    const raf = () => { tick(performance.now()); if (times.length < 90) requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    for (let i = 0; i < 30; i++) {
      window.scrollTo(0, i * 15);
      await new Promise((r) => setTimeout(r, 16));
    }
    await new Promise((r) => setTimeout(r, 500));
    return times;
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const over32 = frameTimes.filter((t) => t > 32).length;
  const over50 = frameTimes.filter((t) => t > 50).length;
  const max = Math.max(...frameTimes);
  await page.close();
  alle.cpu_throttle_4x = { frameCount: frameTimes.length, over32ms: over32, over50ms: over50, maxFrameMs: Math.round(max) };
  await ctx.close();
}

await browser.close();

fs.writeFileSync(path.join(OUT, "qa-hero-messung.json"), JSON.stringify(alle, null, 1));
console.log("FERTIG: " + path.join(OUT, "qa-hero-messung.json"));
