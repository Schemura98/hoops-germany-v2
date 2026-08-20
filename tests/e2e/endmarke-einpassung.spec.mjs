import { test, expect } from "@playwright/test";

// ══ DER HAFTENDE STRECKEN-STREIFEN BLEIBT UNTER DER NAVIGATION ══════════════
//
// ⚠️ DIESE DATEI HAT AM 21.08.2026 IHREN GEGENSTAND GEWECHSELT, NICHT IHREN
// ZWECK. Sie bewachte bis dahin die Korb-Endmarke am Ende der mobilen
// Fortschritts-Leiste (Kais Befund N4: Sie ragte in die Navigationsleiste, es
// waren gemessen nur 4 px Platz). Die Endmarke ist mit dem Umbau auf den
// Dribbelweg entfallen — sie war der DRITTE Korb der Seite und stand in
// Schrägansicht, während Hero und Abschluss den Korb von oben zeigen.
//
// Der Defekt, den sie bewachte, ist damit aber NICHT verschwunden: Der
// haftende Streifen selbst kann weiter in die Navigationsleiste ragen, wenn
// jemand ihm eine Zeile, mehr Innenabstand oder eine größere Schrift gibt.
// Deshalb misst die Datei jetzt den Streifen. Sie ersatzlos zu löschen hätte
// eine bewachte Kante wieder unbewacht gemacht.
//
// ⚠️ UND WARUM SIE IM HAFTENDEN ZUSTAND MISST (unverändert der Kern):
// Ungescrollt steht der Streifen irgendwo mitten im Dokument und hat beliebig
// viel Luft nach oben — dort ist JEDE Größe unauffällig. Der Defekt existiert
// nur, WENN er haftet. Ein Test ohne Scrollen ist auf genau den einen Zustand
// blind, den er prüfen soll.

const MOBIL = [
  [360, 800, "kleinste verbreitete Android-Breite"],
  [375, 812, "iPhone"],
  [390, 844, "iPhone"],
  [430, 932, "grosses Handy"],
  [640, 900, "knapp unter md — immer noch der Streifen"],
];

async function streifenImHaftzustand(page) {
  return page.evaluate(async () => {
    const bild = () =>
      new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));
    const streifen = document.querySelector("[data-strecke-streifen]");
    if (!streifen) return { gefunden: false };
    const r0 = streifen.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0) return { gefunden: false, ausgeblendet: true };

    const sektion = streifen.closest("section");
    const sr = sektion.getBoundingClientRect();
    // ⚠️ AUF EINEN GANZZAHLIGEN WERT SCROLLEN. Mit einem gebrochenen Ziel
    // steht die haftende Leiste nicht bei 0, sondern bei 1,38 px — gemessen,
    // nicht vermutet. Die Schranke „top <= 1" war damit ein Münzwurf, und der
    // Test meldete „die Leiste haftet nicht", während sie einwandfrei haftete.
    // Dieselbe Klasse wie „feste Zahl gegen einen Restbetrag" (CLAUDE.md 20b).
    window.scrollTo(0, Math.round(sr.top + window.scrollY + sr.height * 0.45));
    await bild();
    await bild();

    const m = streifen.getBoundingClientRect();
    const nav = document.querySelector("nav, header");
    const nr = nav ? nav.getBoundingClientRect() : null;
    return {
      gefunden: true,
      oben: Number(m.top.toFixed(1)),
      hoehe: Number(m.height.toFixed(1)),
      navUnten: nr ? Number(nr.bottom.toFixed(1)) : null,
      // 2 px Toleranz: Auch bei ganzzahligem Scroll bleibt die Rundung auf
      // Geräte-Pixel als Rest.
      navHaftet: nr ? nr.top <= 2 && nr.bottom > 0 : false,
    };
  });
}

test.describe("Haftender Strecken-Streifen: Einpassung", () => {
  for (const [breite, hoehe, wozu] of MOBIL) {
    test(`${breite}x${hoehe} (${wozu}): der Streifen bleibt unter der Navigation`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForSelector("[data-strecke-streifen]");

      const m = await streifenImHaftzustand(page);

      // Ehrlichkeitsschranke: Ohne sie wäre der Fall grün, wenn der Streifen
      // gar nicht gezeichnet wird — grüner Test über null Messpunkte.
      expect(m.gefunden, "Kein sichtbarer Strecken-Streifen gemessen.").toBe(true);
      expect(m.hoehe, "Der Streifen hat Höhe 0.").toBeGreaterThan(0);
      expect(
        m.navHaftet,
        "Die Navigationsleiste haftet nicht oben — dieser Fall misst nicht den " +
          "Zustand, in dem der Defekt überhaupt auftreten kann.",
      ).toBe(true);
      expect(
        m.oben,
        `Der Streifen beginnt bei y=${m.oben}, die Navigationsleiste endet bei ` +
          `y=${m.navUnten} — er ragt darunter.`,
      ).toBeGreaterThanOrEqual(m.navUnten - 2);
    });
  }

  test("ab md gibt es den Streifen nicht mehr — dort läuft der Weg im Mittelkanal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-feature-zeile]");
    const sichtbar = await page.evaluate(() => {
      const s = document.querySelector("[data-strecke-streifen]");
      return s ? getComputedStyle(s).display !== "none" : false;
    });
    // Zwei Fortschrittsanzeigen nebeneinander wären schlechter als eine.
    expect(sichtbar).toBe(false);
  });
});
