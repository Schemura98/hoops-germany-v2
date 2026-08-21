// Standbilder der Startseite. Aufruf:
//   node scripts/messungen/shot.mjs <praefix> [breite] [hoehe]
import fs from "node:fs";
import { chromium } from "@playwright/test";

// Host nicht fest verdrahtet — siehe scripts/messungen/README.md.
const BASIS = process.env.MESS_BASIS || "http://localhost:3000";

const praefix = process.argv[2] || "stand";
const B = Number(process.argv[3] || 360);
const H = Number(process.argv[4] || 800);
const ORT = process.env.MESS_ORT || "tmp/messungen";
fs.mkdirSync(ORT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: B, height: H } });
await page.goto(BASIS, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// 1) Hero (oben)
await page.screenshot({ path: `${ORT}/${praefix}-${B}x${H}-1-hero.png` });

// 2) Abschluss-Block: ganz nach unten
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(1400);
await page.screenshot({ path: `${ORT}/${praefix}-${B}x${H}-2-ende.png` });

// 3) Abschluss-Block, Oberkante im Bild
const oben = await page.evaluate(() => {
  const s = document.querySelector("[data-passfeld]");
  if (!s) return null;
  const r = s.getBoundingClientRect();
  window.scrollTo(0, r.top + window.scrollY - 40);
  return true;
});
if (oben) {
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${ORT}/${praefix}-${B}x${H}-3-cta.png` });
}
await browser.close();
console.log("fertig", praefix, B, H);
