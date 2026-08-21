import { test, expect } from "@playwright/test";
import { ladeStartseite, drehVersatz } from "./helpers/landing.mjs";

// ══ DER DREHPUNKT DER ROLLENDEN BÄLLE ═══════════════════════════════════════
//
// ⚠️ DIESER WÄCHTER IST DREIMAL GELÖSCHT WORDEN. Nicht der Gegenstand — der
// Wächter. Die Chronik steht in `tests/e2e/README.md`:
//
//   15.08.2026  Befund Kai B1: der Streckenball dreht um einen fremden Punkt.
//               Wächter als vierter Fall in `ball-sequenz.spec.mjs` einquartiert.
//   19.08.2026  `ball-sequenz.spec.mjs` gelöscht, Begründung: „die Bildsequenz
//               gibt es nicht mehr". Für DREI der vier Fälle stimmte das.
//   20.08.2026  Als `rail-ball-drehpunkt.spec.mjs` wiederhergestellt.
//   21.08.2026  Mit dem Dribbelweg-Umbau wieder gelöscht, Begründung:
//               „`RailBallGlyph` und `FeatureProgressRail.js` sind entfallen".
//               Auch das stimmte — für das GLYPH, nicht für die EIGENSCHAFT.
//
// Nach jeder dieser Löschungen fand `grep -rn transformOrigin tests/` **null**
// Treffer, und der rollende Ball rollte weiter.
//
// ⚠️ WAS DIESE DATEI DESHALB ANDERS MACHT — und warum sie einen eigenen Namen
// hat: Sie ist nach der EIGENSCHAFT benannt, nicht nach dem Bauteil. „Der Ball
// dreht sich um seine eigene Mitte" überlebt jede Umbenennung von Glyph,
// Leiste und Weg. Alle drei Löschungen waren nach demselben Muster begründet:
// Das BAUTEIL im Dateinamen war weg, die EIGENSCHAFT nicht.
//
// ══ WARUM GEMESSEN UND NICHT GELESEN ═══════════════════════════════════════
//
// Die Urfassung las den Quelltext nach `transformOrigin`. Das hätte den
// tatsächlichen Ausfall mit halber Wahrscheinlichkeit durchgelassen: Der Fehler
// saß an EINER von ZWEI Aufrufstellen, und eine Zeichenkette in einer Datei
// sagt nichts darüber, welche Stelle sie benutzt.
//
// Hier wird stattdessen eine EIGENSCHAFT geprüft, die keinen Mechanismus
// kennt: Dreht ein Körper um seine eigene Mitte, ist die Mitte drehinvariant.
// Also einmal messen wie gezeichnet, einmal mit entferntem `rotate(...)` —
// beide Mitten müssen zusammenfallen. Das gilt für den mobilen Ball
// (CSS `transform` + `transform-origin`) genauso wie für die beiden
// SVG-Bälle (`rotate(a cx cy)` im Attribut), obwohl beide den Drehpunkt völlig
// anders festlegen. Ein Wächter, zwei Mechanismen, drei Aufrufstellen.
//
// Gesund gemessen (21.08.2026): Versatz **0,00 px** an allen Messpunkten, bei
// Drehwinkeln von 188° bis 8818°. Umgeklemmter Drehpunkt (Kai, 20.08.2026):
// 6,9 → 14,5 → 27,4 → 24,3 px — mehr als ein Balldurchmesser daneben.

const GRENZE_PX = 0.5;
// Unter diesem Winkel ist eine Drehung nicht aussagekräftig: Bei nahezu 0°
// fällt die Mitte auch dann zusammen, wenn der Drehpunkt völlig falsch sitzt.
const WINKEL_MIN = 45;

async function pruefe(sel, punkte, name) {
  let gemessen = 0;
  for (const p of punkte) {
    if (!p) continue;
    expect(
      p.ohneDrehung,
      `${name}: An dieser Stelle steht gar kein rotate() in der Transformation. ` +
        `Entweder rollt der Ball nicht mehr (dann ist das ein Befund am Produkt), ` +
        `oder die Sonde greift das falsche Element — in beiden Fällen misst dieser ` +
        `Test den Drehpunkt NICHT.`,
    ).toBe(false);
    if (Math.abs(p.winkel) < WINKEL_MIN) continue;
    gemessen += 1;
    const versatz = Math.hypot(p.dx, p.dy);
    expect(
      versatz,
      `${name}: Bei ${p.winkel.toFixed(0)}° wandert die gezeichnete Ballmitte um ` +
        `${versatz.toFixed(2)} px, sobald man die Drehung entfernt (x ${p.dx.toFixed(2)}, ` +
        `y ${p.dy.toFixed(2)}). Eine Drehung um die eigene Mitte lässt die Mitte stehen — ` +
        `der Drehpunkt sitzt also woanders, und der Ball läuft neben seiner Bahn. ` +
        `Das ist Kais Befund B1 vom 15.08.2026, zum vierten Mal.`,
    ).toBeLessThanOrEqual(GRENZE_PX);
  }
  // ⚠️ EHRLICHKEITSSCHRANKE. Ohne sie wäre dieser Test grün, wenn der Ball an
  // keiner Stelle nennenswert gedreht ist — ein grüner Test mit null
  // Messpunkten (CLAUDE.md Roadmap 20f).
  expect(
    gemessen,
    `${name}: An keiner der ${punkte.length} Stellen war der Ball um mehr als ` +
      `${WINKEL_MIN}° gedreht. Bei kleinen Winkeln fällt die Mitte auch bei falschem ` +
      `Drehpunkt zusammen — dieser Test hat nichts geprüft.`,
  ).toBeGreaterThanOrEqual(3);
}

test.describe("Drehpunkt der rollenden Bälle", () => {
  test("mobiler Streckenball dreht um seine eigene Mitte", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ladeStartseite(page);
    await page.waitForSelector("[data-strecke-ball-mobil]");
    const maxS = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const punkte = [];
    for (const anteil of [0.15, 0.25, 0.35, 0.45, 0.55]) {
      await page.evaluate((y) => window.scrollTo(0, y), maxS * anteil);
      await page.waitForTimeout(150);
      punkte.push(await drehVersatz(page, "[data-strecke-ball-mobil]"));
    }
    await pruefe("[data-strecke-ball-mobil]", punkte, "Mobiler Streckenball");
  });

  test("Desktop-Dribbelball dreht um seine eigene Mitte", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await ladeStartseite(page);
    await page.waitForTimeout(400);
    const strecke = await page.evaluate(() => {
      const z = document.querySelectorAll("[data-feature-zeile]");
      return {
        von: z[0].getBoundingClientRect().top + window.scrollY - window.innerHeight / 2,
        bis:
          z[z.length - 1].getBoundingClientRect().bottom +
          window.scrollY -
          window.innerHeight / 2,
      };
    });
    const punkte = [];
    for (const a of [0.2, 0.4, 0.6, 0.8]) {
      await page.evaluate(
        (y) => window.scrollTo(0, y),
        strecke.von + (strecke.bis - strecke.von) * a,
      );
      await page.waitForTimeout(150);
      punkte.push(await drehVersatz(page, "[data-dribbelweg-ball]"));
    }
    await pruefe("[data-dribbelweg-ball]", punkte, "Desktop-Dribbelball");
  });

  test("Pass-Ball dreht um seine eigene Mitte", async ({ page }) => {
    // ⚠️ Der dritte rollende Ball, und er war bisher in KEINER Testdatei.
    // Er benutzt dieselbe `rollwinkel()`-Rechnung wie die anderen beiden —
    // also dieselbe Fehlermöglichkeit.
    await page.setViewportSize({ width: 1280, height: 800 });
    await ladeStartseite(page);
    await page.waitForSelector("[data-pass-ziel]");
    const start = await page.evaluate(
      () =>
        document.querySelector("[data-pass-ziel]").getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.9,
    );
    const maxS = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const punkte = [];
    for (let i = 1; i <= 6; i += 1) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.min(maxS, start + (maxS - start) * (i / 6)));
      await page.waitForTimeout(150);
      const p = await drehVersatz(page, "[data-pass-ball]");
      // Vor dem Bildrand steht der Ball noch bei 0° — solche Punkte zählt die
      // Schranke unten ohnehin nicht mit, sie dürfen aber nicht als „gar keine
      // Drehung vorhanden" durchfallen.
      if (p) punkte.push(p);
    }
    await pruefe("[data-pass-ball]", punkte, "Pass-Ball");
  });
});
