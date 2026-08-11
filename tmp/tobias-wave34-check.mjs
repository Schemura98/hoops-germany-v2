import { chromium } from "@playwright/test";
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const out = {};

async function fresh(viewport) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 375, height: 812 } });
  const page = await ctx.newPage();
  const fehler = [];
  const failedReq = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 200)));
  page.on("response", (r) => { if (r.status() >= 400) failedReq.push(r.url() + " -> " + r.status()); });
  return { ctx, page, fehler, failedReq };
}

// 1) ScrollTable: sticky column + keyboard scroll + gradient behavior
{
  const results = {};
  for (const url of ["/rangliste", "/topscorer"]) {
    const { ctx, page, fehler, failedReq } = await fresh();
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const d = await page.evaluate(() => {
      const scrollDiv = document.querySelector('[role="group"]');
      if (!scrollDiv) return { found: false };
      const table = scrollDiv.querySelector("table");
      const before = { scrollLeft: scrollDiv.scrollLeft, tabIndex: scrollDiv.tabIndex };
      return { found: true, hasTable: !!table, scrollWidth: scrollDiv.scrollWidth, clientWidth: scrollDiv.clientWidth, before };
    });
    if (d.found) {
      // Focus + keyboard arrow scroll test
      await page.evaluate(() => document.querySelector('[role="group"]').focus());
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(150);
      const afterKey = await page.evaluate(() => document.querySelector('[role="group"]').scrollLeft);
      // Programmatic scroll to end + check sticky col + right gradient
      const stickyCheck = await page.evaluate(() => {
        const scrollDiv = document.querySelector('[role="group"]');
        scrollDiv.scrollLeft = scrollDiv.scrollWidth;
        const stickyCells = [...document.querySelectorAll('.sticky')];
        return {
          scrollLeftAfter: scrollDiv.scrollLeft,
          stickyCellCount: stickyCells.length,
          stickyCellBg: stickyCells[0] ? getComputedStyle(stickyCells[0]).backgroundColor : null,
          firstStickyText: stickyCells[0]?.textContent.trim(),
        };
      });
      await page.waitForTimeout(250);
      const gradients = await page.evaluate(() => {
        const grads = [...document.querySelectorAll('.pointer-events-none.absolute.inset-y-0')];
        return grads.map(g => getComputedStyle(g).opacity);
      });
      results[url] = { ...d, keyboardScrolled: afterKey > 0, afterKeyScrollLeft: afterKey, stickyCheck, gradientsAtRightEnd: gradients, fehler, failedReq };
    } else {
      results[url] = d;
    }
    await ctx.close();
  }
  out.scrollTable = results;
}

// 2) Jump menu on /datenschutz and /impressum
{
  const results = {};
  for (const url of ["/datenschutz", "/impressum"]) {
    const { ctx, page, fehler, failedReq } = await fresh();
    await page.goto(BASE + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const chips = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a[href^="#"]')];
      return links.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }));
    });
    const jumpResults = [];
    for (const chip of chips) {
      const id = chip.href.slice(1);
      const clicked = await page.evaluate((id) => {
        const link = document.querySelector(`a[href="#${id}"]`);
        const target = document.getElementById(id);
        if (!link || !target) return { ok: false };
        link.click();
        return { ok: true };
      }, id);
      await page.waitForTimeout(300);
      const pos = await page.evaluate((id) => {
        const target = document.getElementById(id);
        const navbar = document.querySelector('nav') || document.querySelector('header');
        const navH = navbar ? navbar.getBoundingClientRect().height : 0;
        if (!target) return { found: false };
        const r = target.getBoundingClientRect();
        return { found: true, top: Math.round(r.top), navbarHeight: Math.round(navH), underNavbar: r.top >= -2 && r.top <= navH + 40 };
      }, id);
      jumpResults.push({ id, clicked, pos });
    }
    results[url] = { chipCount: chips.length, jumpResults, fehler, failedReq };
    await ctx.close();
  }
  out.legalJumpMenu = results;
}

// 3) oauth-landing without token
{
  const { ctx, page, fehler, failedReq } = await fresh();
  await page.goto(BASE + "/oauth-landing", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const bodyText = await page.locator("body").innerText();
  const hasBackLink = await page.evaluate(() => !!document.querySelector('a[href="/login"], a[href="/"]'));
  out.oauthLandingNoToken = { bodyTextSnippet: bodyText.slice(0, 300), hasBackLink, fehler, failedReq, url: page.url() };
  await ctx.close();
}

// 4) Progress bar (mobile) presence + overlap + consistency while scrolling landing feature section
{
  const { ctx, page, fehler, failedReq } = await fresh({ width: 375, height: 812 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const total = await page.evaluate(() => document.body.scrollHeight);
  const featureStart = await page.evaluate(() => {
    const c = document.querySelector('.max-w-sm');
    return c ? c.getBoundingClientRect().top + window.scrollY - 400 : 0;
  });
  const samples = [];
  for (let y = featureStart; y < featureStart + 3000; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
    const d = await page.evaluate(() => {
      const bar = document.querySelector('[class*="progress" i], [aria-label*="Spielzug" i], [aria-label*="Fortschritt" i]');
      // fallback: look for any sticky element under navbar with a short "X / 6" label
      const label = [...document.querySelectorAll('*')].find(el => /^\d\s*\/\s*6/.test(el.textContent?.trim() || "") && el.children.length === 0);
      return {
        labelText: label ? label.textContent.trim() : null,
        labelRect: label ? (() => { const r = label.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; })() : null,
      };
    });
    samples.push({ y, ...d });
  }
  out.progressBar = { samples, fehler, failedReq };
  await ctx.close();
}

console.log(JSON.stringify(out, null, 1));
await browser.close();
