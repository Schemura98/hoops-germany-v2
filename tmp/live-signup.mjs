import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [label, vp] of [["mobil", { width: 375, height: 812 }], ["desktop", { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const bilder = [];
  page.on("response", async (r) => {
    const p = new URL(r.url()).pathname;
    if (/\.(jpg|jpeg|avif|webp)$/i.test(p)) bilder.push(`${decodeURIComponent(p.split("/").pop())} ${r.status()} ${Math.round((Number(r.headers()["content-length"]) || 0) / 1024)}KB`);
  });
  await page.goto("https://hoopsgermany.de/signup", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  console.log(`/signup ${label} (${vp.width}px) → Bildanfragen:`, bilder.length ? bilder : "KEINE");
  await ctx.close();
}
await browser.close();
