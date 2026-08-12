// C2: Springen die Zahlen im Panel beim Zeigen wirklich auf die Markenfarbe?
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 850 } })).newPage();
// Die Spielkarte auf /spiele traegt die Punktzahl in Monospace - dort sitzt
// das Mikro-Detail. (Erster Anlauf mass /rangliste; dessen Tabelle ist keine
// Karte mit Hover-Zustand, da konnte nichts passieren.)
await p.goto("http://localhost:3000/spiele", { waitUntil: "networkidle" });
// Der Standardreiter zeigt ANSTEHENDE Spiele - die haben keinen Punktestand
// und damit keine Monospace-Zahl. Erst auf "Ergebnisse" gibt es etwas zu messen.
await p.getByRole("button", { name: /Ergebnisse/ }).first().click();
await p.waitForTimeout(900);
const karte = p.locator('a[href^="/match/"]').filter({ has: p.locator(".font-mono") }).first();
const zahl = karte.locator(".font-mono").first();
const vorher = await zahl.evaluate((el) => getComputedStyle(el).color);
await karte.hover();
await p.waitForTimeout(400);
const nachher = await zahl.evaluate((el) => getComputedStyle(el).color);
console.log(`Zahl vor dem Zeigen: ${vorher} · danach: ${nachher} · Wechsel: ${vorher !== nachher}`);
await b.close();
