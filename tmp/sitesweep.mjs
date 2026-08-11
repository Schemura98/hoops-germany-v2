import { chromium } from "@playwright/test";
const SEITEN = ["/", "/spieler", "/teams", "/spiele", "/ligen", "/tryouts", "/topscorer", "/rangliste",
                "/transfermarkt", "/about", "/impressum", "/datenschutz", "/kontakt", "/feedback",
                "/login", "/signup", "/reset-password", "/installieren", "/team/create"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
const bericht = [];
for (const url of SEITEN) {
  const fehler = [];
  const netz = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("response");
  page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 90)));
  page.on("pageerror", (e) => fehler.push("pageerror: " + e.message.slice(0, 90)));
  page.on("response", (r) => r.status() >= 400 && netz.push(`${r.status()} ${new URL(r.url()).pathname}`));
  const resp = await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" }).catch(() => null);
  await page.waitForTimeout(900);
  const d = await page.evaluate(() => {
    const doc = document.documentElement;
    const zuKlein = [...document.querySelectorAll("a,button,input,select,[role=button]")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 32 && el.offsetParent !== null;
    }).length;
    return { ueberlauf: doc.scrollWidth - doc.clientWidth, kleineZiele: zuKlein, titel: document.title.slice(0, 40) };
  });
  bericht.push({ url, status: resp?.status() ?? "?", ...d, fehler: fehler.length, netz: netz.length ? netz.slice(0, 2) : [] });
}
console.table(bericht);
await browser.close();
