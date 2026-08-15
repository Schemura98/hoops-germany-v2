import { test, expect } from "@playwright/test";

// ══ DER MOBILE EINFLUG — DIE ENTSCHEIDUNG, NICHT NUR IHR ERGEBNIS ═══════════
//
// Auflage Kai (Gate, fünfte Runde). Seine Mutationsprobe legte offen, dass die
// Suite den Kern dieser Arbeit gar nicht bewacht:
//
//   M5  Einflug als Standbild (keine Bildwechsel)   → 45/45 grün
//   M9  Einflug ersatzlos gestrichen                 → 45/45 grün
//
// Genau die Regression, die Vivien eine Runde zuvor gefunden hatte („1 von 32
// Bildern, null Wechsel"), hätte kein Test wiedergefunden. Acht von zehn
// Entscheidungen dieses Bereichs waren unbewacht; diese Datei deckt die drei
// ab, die sichtbar sind.
//
// ⚠️ ALLE DREI PRÜFUNGEN SCROLLEN NICHT. Das ist der Punkt: Ein Test, der
// scrollt, erzwingt die Neuberechnung, die der Fehler vermissen ließ – er wäre
// grün und übersähe genau den Fall. Dieselbe Lehre wie bei der Ruhelage.

const MOBIL = [
  [375, 812],
  [375, 667],
  [430, 932],
  [320, 568],
];

// Schneidet jeden Schreibvorgang am Ball mit – Zeit, y-Lage, Bildwahl,
// Deckkraft. Wird VOR dem Laden gesetzt, sonst fehlt der Anfang des Fluges.
const SPUR = `document.addEventListener("DOMContentLoaded", () => {
  window.__spur = [];
  new MutationObserver(() => {
    const e = document.querySelector(".hero-ball-sprite");
    if (!e) return;
    const m = /translate3d\\([^,]+,\\s*([-\\d.]+)px/.exec(e.style.transform);
    if (!m) return;
    window.__spur.push({
      t: Math.round(performance.now()),
      y: Number(m[1]),
      bild: e.style.backgroundPositionX,
      deck: Number(getComputedStyle(e).opacity),
    });
  }).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
});`;

async function spurAufnehmen(page, breite, hoehe) {
  await page.setViewportSize({ width: breite, height: hoehe });
  await page.addInitScript(SPUR);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000); // Einflug + Reveal, ohne zu scrollen
  const spur = await page.evaluate(() => window.__spur || []);
  // ⚠️ EINE LEERE AUFNAHME IST KEIN BESTEHEN. Beim ersten Entwurf dieser Sonde
  // lief der Beobachter, bevor es ein Dokument gab; sie zeichnete nichts auf
  // und meldete "0px Sprung". Das sah aus wie ein bestandener Test.
  expect(
    spur.length,
    `Nur ${spur.length} Schreibvorgänge am Ball aufgezeichnet – die Sonde hat ` +
      `nicht gemessen. Ein Ergebnis daraus wäre bedeutungslos, nicht grün.`,
  ).toBeGreaterThan(8);
  return spur;
}

test.describe("Hero-Einflug (mobil)", () => {
  for (const [breite, hoehe] of MOBIL) {
    test(`${breite}x${hoehe}: der Ball fliegt überhaupt ein`, async ({
      page,
    }) => {
      // Gegen M9: Einflug ersatzlos gestrichen.
      const spur = await spurAufnehmen(page, breite, hoehe);
      const weg =
        Math.max(...spur.map((s) => s.y)) - Math.min(...spur.map((s) => s.y));
      expect(
        weg,
        `Der Ball legt beim Laden nur ${weg.toFixed(1)}px zurück. Ohne Scrollen ` +
          `bewegt sich hier sonst nichts – der Einflug findet also nicht statt.`,
      ).toBeGreaterThan(50);
    });

    test(`${breite}x${hoehe}: der Einflug zeigt die Sequenz, kein Standbild`, async ({
      page,
    }) => {
      // Gegen M5: Einflug als Standbild. Es gibt 32 Bilder; ein Flug, der eines
      // davon zeigt, macht die ganze Sequenz zu 104 KB ohne Zweck.
      const spur = await spurAufnehmen(page, breite, hoehe);
      const bilder = new Set(spur.map((s) => s.bild).filter(Boolean));
      expect(
        bilder.size,
        `Der Einflug zeigt ${bilder.size} verschiedene Bilder der 32er-Sequenz. ` +
          `Genau diese Regression stand schon einmal live (Befund Vivien): ` +
          `ein fallendes Standbild.`,
      ).toBeGreaterThan(5);
    });

    test(`${breite}x${hoehe}: der Ball bleibt liegen, wo er landet`, async ({
      page,
    }) => {
      // Gegen den Befund, den mein EIGENER B1-Fix erzeugt hat (Kai): Die
      // Nachvermessung rief `apply`, während der Flug noch lief – zwei Schreiber
      // auf einem Element. Der Ball landete, stand ~400ms sichtbar und sprang
      // dann ohne Animation 20px nach oben. Auf JEDEM mobilen Laden, ohne jede
      // Nutzerhandlung. Aus einer stillen Fehlplatzierung war ein sichtbarer
      // Satz geworden.
      const spur = await spurAufnehmen(page, breite, hoehe);
      const saetze = [];
      for (let i = 1; i < spur.length; i++) {
        // Eine Pause trennt den Flug von allem danach. Nur sichtbare Sprünge
        // zählen – vor dem Flug steht der Ball auf Deckkraft 0.
        if (spur[i].t - spur[i - 1].t > 100 && spur[i - 1].deck > 0.05) {
          saetze.push({
            versatz: spur[i].y - spur[i - 1].y,
            pause: spur[i].t - spur[i - 1].t,
          });
        }
      }
      const groesster = saetze.reduce(
        (m, s) => Math.max(m, Math.abs(s.versatz)),
        0,
      );
      expect(
        groesster,
        `Nach der Landung springt der Ball um ${groesster.toFixed(1)}px ` +
          `(${saetze.map((s) => `${s.versatz.toFixed(1)}px nach ${s.pause}ms`).join(", ")}). ` +
          `Ein zweiter Schreiber greift auf das Element zu, nachdem der Flug ` +
          `es abgelegt hat.`,
      ).toBeLessThanOrEqual(2);
    });
  }
});
