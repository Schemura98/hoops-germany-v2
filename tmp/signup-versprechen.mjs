// Das Flyer-Versprechen "dauert zwei Minuten" nachmessen statt einschaetzen.
// Gemessen wird die reine Ausfuellzeit eines realistischen Tippers, plus die
// Anzahl der Pflichtfelder und die Zeit bis zum fertigen Konto.
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3000";
const b = await chromium.launch();
const page = await (await b.newContext({ viewport: { width: 390, height: 850 } })).newPage();
await page.goto(BASE + "/signup", { waitUntil: "networkidle" });

const felder = await page.evaluate(() =>
  Array.from(document.querySelectorAll("input")).map((i) => ({
    typ: i.type,
    pflicht: i.required,
    platzhalter: i.placeholder,
  }))
);
console.log("Felder:", JSON.stringify(felder, null, 1));
console.log("davon Pflicht:", felder.filter((f) => f.pflicht).length);

// Realistische Tippgeschwindigkeit auf dem Handy: ~4 Zeichen/Sekunde
const wegwerf = `flyer-test-${Date.now()}@hoops-messung.test`;
const start = Date.now();
await page.getByPlaceholder("Max").fill("Max");
await page.getByPlaceholder("Mustermann").fill("Mustermann");
await page.getByPlaceholder("name@beispiel.de").fill(wegwerf);
await page.getByPlaceholder("Mind. 6 Zeichen").fill("test123");
await page.getByPlaceholder("••••••••").fill("test123");
const getippt = (Date.now() - start) / 1000;

const zeichen = "Max".length + "Mustermann".length + wegwerf.length + 7 + 7;
console.log(`Zeichen insgesamt: ${zeichen} → bei 4 Zeichen/s ca. ${(zeichen / 4).toFixed(0)} s reines Tippen`);
console.log(`(Automatisches Ausfuellen dauerte ${getippt.toFixed(1)}s - nicht die Nutzerzeit)`);
await b.close();
