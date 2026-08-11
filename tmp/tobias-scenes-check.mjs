import { chromium } from "@playwright/test";
const BASE = "http://localhost:3000";

const probeAll = `(() => {
  const cards = [...document.querySelectorAll('.max-w-sm')];
  const find = (needle) => cards.find(c => c.textContent.includes(needle));
  const opac = (el) => el ? Number(getComputedStyle(el).opacity).toFixed(2) : null;
  const transform = (el) => el ? getComputedStyle(el).transform : null;

  const roster = find('Spieler im Kader');
  const rosterRows = roster ? [...roster.querySelectorAll('div[style*="translateY"]')] : [];

  const match = find('Sporthalle Nord');
  const matchScore = match ? [...match.querySelectorAll('p')].find(p => /\d\s*:\s*\d/.test(p.textContent)) : null;
  const matchPill = match ? [...match.querySelectorAll('span')].find(s => s.textContent.trim() === 'Bestätigt') : null;
  const matchTags = match ? [...match.querySelectorAll('span')].filter(s => s.textContent.trim() === 'eingereicht') : [];

  const table = find('Köln Comets');
  const tableRows = table ? [...table.querySelectorAll('div[style*="translateY"]')] : [];
  const rheinRow = tableRows.find(r => r.textContent.includes('Rhein Hawks'));
  const testRow = tableRows.find(r => r.textContent.includes('Test Baskets'));

  const scouting = find('Bewerbungen');
  const scoutAvatars = scouting ? [...scouting.querySelectorAll('span[style*="scale"]')] : [];

  const feed = find('vor 2 Std');
  const feedBars = feed ? [...feed.querySelectorAll('div[style*="clip-path"]')] : [];
  const feedHeart = feed ? feed.querySelector('svg') : null;
  const feedSpans = feed ? [...feed.querySelectorAll('span.flex')] : [];

  const profile = find('Point Guard');

  return {
    roster: roster ? {
      countText: [...roster.querySelectorAll('p')].map(p => p.textContent.trim()).join(' | '),
      rowsOpacity: rosterRows.map(opac),
      rowsTransform: rosterRows.map(transform),
      rowCount: rosterRows.length,
    } : null,
    match: match ? {
      score: matchScore ? matchScore.textContent.trim() : null,
      scoreOpacity: opac(matchScore),
      pillOpacity: opac(matchPill),
      tagsOpacity: matchTags.map(opac),
      tagCount: matchTags.length,
    } : null,
    table: table ? {
      rowCount: tableRows.length,
      rheinTransform: transform(rheinRow),
      testTransform: transform(testRow),
      rheinHighlighted: rheinRow ? rheinRow.className.includes('bg-brand-50') : null,
      rheinPosText: rheinRow ? rheinRow.querySelector('span')?.textContent.trim() : null,
    } : null,
    scouting: scouting ? {
      avatarCount: scoutAvatars.length,
      avatarsOpacity: scoutAvatars.map(opac),
      applicationsText: [...scouting.querySelectorAll('span')].map(s => s.textContent.trim()).find(t => /\d+\s*Bewerbungen/.test(t)),
    } : null,
    feed: feed ? {
      barCount: feedBars.length,
      barsClip: feedBars.map(b => getComputedStyle(b).clipPath),
      heartTransform: transform(feedHeart),
      spanTexts: feedSpans.map(s => s.textContent.trim()),
      spanOpacities: feedSpans.map(opac),
    } : null,
    profileFound: !!profile,
  };
})()`;

async function run(viewport, reducedMotion) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, reducedMotion: reducedMotion || "no-preference" });
  const page = await ctx.newPage();
  const fehler = [];
  const failedReq = [];
  page.on("pageerror", (e) => fehler.push(e.message));
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 200)));
  page.on("response", (r) => { if (r.status() >= 400) failedReq.push(r.url() + " -> " + r.status()); });
  await page.goto(BASE, { waitUntil: "networkidle" });
  return { browser, ctx, page, fehler, failedReq };
}

const results = {};

// A) Normal scroll
{
  const { browser, page, fehler, failedReq } = await run({ width: 375, height: 812 });
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += 120) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(180);
  }
  await page.evaluate((v) => window.scrollTo(0, v), total);
  await page.waitForTimeout(1500);
  results.normalScroll_mobile375 = { data: await page.evaluate(probeAll), fehler, failedReq };
  await browser.close();
}

// B) Fast scroll-through
{
  const { browser, page, fehler, failedReq } = await run({ width: 375, height: 812 });
  const total = await page.evaluate(() => document.body.scrollHeight);
  const steps = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1].map((f) => Math.round(total * f));
  for (const y of steps) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(40);
  }
  results.fastScroll_immediate = { data: await page.evaluate(probeAll) };
  await page.waitForTimeout(1500);
  results.fastScroll_settled = { data: await page.evaluate(probeAll), fehler, failedReq };
  await browser.close();
}

// C) Scroll down, up, down again
{
  const { browser, page, fehler, failedReq } = await run({ width: 375, height: 812 });
  const total = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate((v) => window.scrollTo(0, v), total);
  await page.waitForTimeout(1500);
  results.scrollBack_down1 = await page.evaluate(probeAll);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  results.scrollBack_top = await page.evaluate(probeAll);
  await page.evaluate((v) => window.scrollTo(0, v), total);
  await page.waitForTimeout(300);
  results.scrollBack_down2 = { data: await page.evaluate(probeAll), fehler, failedReq };
  await browser.close();
}

// D) reduced-motion, NO scroll at all
{
  const { browser, page, fehler, failedReq } = await run({ width: 375, height: 812 }, "reduce");
  await page.waitForTimeout(300);
  results.reducedMotion_noScroll = { data: await page.evaluate(probeAll), fehler, failedReq };
  await browser.close();
}

// E) Desktop normal scroll
{
  const { browser, page, fehler, failedReq } = await run({ width: 1440, height: 900 });
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += 150) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1500);
  results.normalScroll_desktop1440 = { data: await page.evaluate(probeAll), fehler, failedReq };
  await browser.close();
}

console.log(JSON.stringify(results, null, 1));
