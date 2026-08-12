// Wo genau liegen Knopf und Absenden zueinander? Zahlen statt Vermutung.
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 640 } })).newPage();
await p.goto("http://localhost:3000/signup", { waitUntil: "networkidle" });
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(() => {
  const fab = document.querySelector('a[aria-label="Feedback geben"]').getBoundingClientRect();
  const btn = Array.from(document.querySelectorAll("button")).find((b) => /Konto erstellen/.test(b.innerText)).getBoundingClientRect();
  return {
    fab: { top: Math.round(fab.top), left: Math.round(fab.left), rechts: Math.round(fab.right), unten: Math.round(fab.bottom) },
    knopf: { top: Math.round(btn.top), links: Math.round(btn.left), rechts: Math.round(btn.right), unten: Math.round(btn.bottom) },
    seitenhoehe: document.documentElement.scrollHeight,
    fenster: window.innerHeight,
    scrollbar: document.documentElement.scrollHeight > window.innerHeight,
  };
}), null, 1));
await b.close();
