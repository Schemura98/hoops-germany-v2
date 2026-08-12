import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 850 } })).newPage();
for (const pfad of ["/", "/teams", "/spiele", "/ligen", "/signup", "/kontakt"]) {
  await p.goto("http://localhost:3000" + pfad, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const da = await p.evaluate(() => !!document.querySelector('a[aria-label="Feedback geben"]'));
  console.log(`${pfad}: Knopf ${da ? "vorhanden" : "ausgeblendet"}`);
}
await b.close();
