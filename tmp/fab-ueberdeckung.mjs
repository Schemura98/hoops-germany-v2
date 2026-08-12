// Verdeckt der schwebende Feedback-Knopf auf Formularseiten etwas Wichtiges?
// Gemessen statt vermutet: Ueberschneidung mit dem Absende-Knopf und mit
// Eingabefeldern, bei 390px und ohne zu scrollen.
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
const SEITEN = ["/kontakt", "/signup", "/login", "/team/create", "/reset-password"];
const b = await chromium.launch();
// Auch ein kurzer Bildschirm: Auf 850px Hoehe passt viel unter den Knopf, auf
// 640px (aeltere Geraete) kann derselbe Knopf ueber dem Absenden liegen.
for (const [hoehe, tag] of [[850, "390x850"], [640, "390x640"]]) {
const ctx = await b.newContext({ viewport: { width: 390, height: hoehe } });
const page = await ctx.newPage();
for (const pfad of SEITEN) {
  await page.goto(BASE + pfad, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const fab = document.querySelector('a[aria-label="Feedback geben"]');
    if (!fab) return { fab: false };
    const f = fab.getBoundingClientRect();
    const ziele = Array.from(document.querySelectorAll("button, input, textarea, select, a[href]"))
      .filter((e) => e !== fab && !fab.contains(e));
    const trifft = ziele
      .map((e) => ({ e, b: e.getBoundingClientRect() }))
      .filter(({ b }) => b.width > 0 && b.height > 0)
      .filter(({ b }) => !(b.right < f.left || b.left > f.right || b.bottom < f.top || b.top > f.bottom))
      .map(({ e }) => (e.tagName + ":" + (e.innerText || e.placeholder || e.type || "").trim().slice(0, 28)));
    return { fab: true, sichtbar: getComputedStyle(fab).opacity !== "0", ueberdeckt: trifft };
  });
  console.log(`${tag} ${pfad}: ${r.fab ? (r.ueberdeckt.length ? "ÜBERDECKT " + JSON.stringify(r.ueberdeckt) : "frei") : "kein Knopf"}`);
}
await ctx.close();
}
await b.close();
