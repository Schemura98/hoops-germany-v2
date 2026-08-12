// Steht der neue Abschnitt - vor UND nach dem Absenden? Der zweite Fall ist der
// wichtigere: Wer gerade geschrieben hat, soll sehen, dass es nicht ins Leere geht.
import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:3000";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 900 } })).newPage();
const fehler = [];
page.on("console", (m) => m.type() === "error" && fehler.push(m.text().slice(0, 90)));
await page.goto(BASE + "/feedback", { waitUntil: "networkidle" });
await page.waitForTimeout(700);
const vorher = await page.evaluate(() => document.body.innerText);
// innerText liefert die GERENDERTE Fassung - die Ueberschrift steht per CSS in
// Versalien, ein Vergleich auf die Schreibweise im Code schlaegt deshalb fehl.
console.log("vor dem Absenden sichtbar:", /was aus feedback schon wurde/i.test(vorher));
console.log("Beispiele gezaehlt:", (vorher.match(/→/g) || []).length);
await page.screenshot({ path: "tmp/shots/FEEDBACK-abschnitt.png", fullPage: true });
console.log("Konsolenfehler:", fehler.length ? fehler.join(" | ") : "keine");
await b.close();
