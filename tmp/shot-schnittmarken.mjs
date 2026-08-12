import { chromium } from "playwright";
import fs from "node:fs";
fs.mkdirSync("tmp/shots", { recursive: true });
const D = "file:///C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/Tester-Akquise/";
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1400, height: 1800 } });
await page.setViewportSize({ width: 1400, height: 1800 });
for (const [file, name] of [
  ["Hoops_Germany_Flyer_A6_Schnittmarken.pdf", "NEU_FLYER_SCHNITT"],
  ["Hoops_Germany_Visitenkarte_Schnittmarken.pdf", "NEU_KARTE_SCHNITT"],
  ["Hoops_Germany_Testerkarte_A6_Schnittmarken-ALT.pdf", "ALT_KARTE_SCHNITT"],
]) {
  await page.goto(D + file, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `tmp/shots/${name}.png` });
  console.log(name, "ok");
}
await b.close();
