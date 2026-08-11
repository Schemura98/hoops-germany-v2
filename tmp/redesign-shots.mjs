// Screenshots des Redesigns gegen echtes Chromium (die Browser-Vorschauflaeche
// rendert keine Frames, wenn sie ausgeblendet ist – siehe CLAUDE.md).
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = "tmp/shots";
fs.mkdirSync(OUT, { recursive: true });

const SEITEN = [
  ["start", "/"],
  ["teams", "/teams"],
  ["ligen", "/ligen"],
  ["spieler", "/spieler"],
  ["spiele", "/spiele"],
  ["topscorer", "/topscorer"],
  ["login", "/login"],
  ["transfermarkt", "/transfermarkt"],
];

const browser = await chromium.launch();
for (const [breite, tag] of [[390, "mobil"], [1280, "desktop"]]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, pfad] of SEITEN) {
    await page.goto(BASE + pfad, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("fertig:", OUT);
