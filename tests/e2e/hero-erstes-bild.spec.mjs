import { test, expect } from "@playwright/test";

// ══ DAS ERSTE BILD DER STARTSEITE ═══════════════════════════════════════════
//
// Prüft das ROHE Server-Blatt von „/" – nicht die Seite im Browser. Das Muster
// stammt aus `signup-ohne-js.spec.mjs` und ist hier aus demselben Grund richtig:
// Im Browser sah der Hero immer gut aus. Ausgeliefert wurde etwas anderes.
//
// ⚠️ DER BEFUND, DEN DIESE DATEI BEWACHT (Kai K1, 19.08.2026):
// Der Server lieferte die FERTIGE Zeichnung aus – ganzer Zug, Ball, Ring auf
// Abschluss-Stärke. Sobald das JavaScript geladen war, verschwand alles bis auf
// Ring und Netz und wurde beim Scrollen ein zweites Mal gezeichnet.
// Die Pointe wurde gezeigt, zurückgenommen und dann erzählt.
// Ursache war ein React-Zustand, der beim ersten Render noch nicht wissen
// konnte, ob jemand reduzierte Bewegung eingestellt hat – beim Server-Rendern
// kann er es grundsätzlich nicht. Er hat geraten, und zwar zugunsten des
// Standbilds.
//
// ⚠️ WARUM KEIN BROWSER-TEST DAS GEFANGEN HÄTTE: Nach der Hydration war der
// Zustand korrekt. Jeder Test, der die Seite im Browser fragt, war grün – und
// zwar zu Recht, er hat nur die falsche Sache gefragt. Deshalb wird hier die
// Antwort des Servers gelesen, bevor JavaScript sie anfassen kann.

const VERSTECKT = 4000; // s. HeroDunk.js – Strichmuster länger als jeder Pfad

async function serverHtml(request) {
  const r = await request.get("/");
  expect(r.ok(), "Startseite nicht erreichbar").toBeTruthy();
  const html = await r.text();
  // Ehrlichkeitsschranke: eine kurze Antwort misst nichts.
  expect(
    html.length,
    "Die Startseite liefert fast nichts – dieser Test misst dann nichts",
  ).toBeGreaterThan(20000);
  return html;
}

test.describe("Erstes Bild – was der Server ausliefert", () => {
  test("keine Zeichenlinie kommt fertig gezeichnet beim Nutzer an", async ({
    request,
  }) => {
    const html = await serverHtml(request);

    const pfade = html.match(/<path[^>]*data-dunk-path[^>]*>/g) || [];
    // Zwei Fassungen (Hoch/Quer) mal zwei Zeichenlinien (Zug, Ball).
    expect(
      pfade.length,
      "Keine Zeichenlinien im ausgelieferten HTML – der Test misst nichts",
    ).toBe(4);

    for (const p of pfade) {
      const muster = /stroke-dasharray="([^"]+)"/.exec(p)?.[1];
      const versatz = /stroke-dashoffset="([^"]+)"/.exec(p)?.[1];
      // ⚠️ GENAU DIESE ZWEI WERTE STANDEN IM BEFUND: `none` und `0` heißen
      // „fertig gezeichnet". Sie sind der Endzustand, nicht der Anfang.
      expect(
        muster,
        `Eine Zeichenlinie wird mit Strichmuster "${muster}" ausgeliefert – ` +
          `"none" hieße: fertig gezeichnet, bevor jemand gescrollt hat`,
      ).toBe(String(VERSTECKT));
      expect(
        versatz,
        `Eine Zeichenlinie wird mit Versatz "${versatz}" ausgeliefert – ` +
          `0 hieße: die Linie steht vollständig im ersten Bild`,
      ).toBe(String(VERSTECKT));
    }
  });

  test("der Ring kommt in Ruhestärke, nicht in Abschluss-Stärke", async ({
    request,
  }) => {
    const html = await serverHtml(request);
    const ringe = html.match(/<ellipse[^>]*data-dunk-ring[^>]*>/g) || [];
    expect(ringe.length, "Kein Ring im ausgelieferten HTML").toBe(2);
    for (const r of ringe) {
      const o = parseFloat(/stroke-opacity="([^"]+)"/.exec(r)?.[1]);
      // Die Hebung auf 1,0 ist das ERGEBNIS des Scrollens (bzw. bei reduzierter
      // Bewegung die Media-Query). Wer sie ausliefert, verschenkt sie.
      expect(
        o,
        `Der Ring kommt mit Deckkraft ${o} beim Nutzer an – 1,0 ist die ` +
          `Abschluss-Stärke und damit das Ende der Geschichte`,
      ).toBeLessThan(1);
      expect(o, "Der Ring fehlt praktisch ganz").toBeGreaterThan(0.5);
    }
  });

  test("die Szene steht im ausgelieferten Blatt – Feld, Ring und Netz", async ({
    request,
  }) => {
    const html = await serverHtml(request);
    // ⚠️ DIE GEGENPROBE ZUM ERSTEN FALL, und sie ist der wichtigere Teil:
    // „Nichts wird ausgeliefert" wäre genauso falsch wie „alles". Der Hero soll
    // ohne JavaScript eine SZENE zeigen (Feld, Ring, Netz) und nur die
    // BEWEGUNG (Zug, Ball) dem Scrollen überlassen. Ohne diesen Fall könnte
    // jemand die Zeichnung komplett abschalten und der erste Test bliebe grün.
    expect(
      (html.match(/data-dunk-ring/g) || []).length,
      "Kein Ring im ersten Bild",
    ).toBe(2);
    expect(
      (html.match(/data-dunk-netz/g) || []).length,
      "Kein Netz im ersten Bild",
    ).toBe(2);
    // Die zwei Feldlinien tragen bewusst KEIN data-Attribut – sie sind nichts,
    // was der Controller anfasst. Erkennbar an ihrer Geometrie.
    for (const d of ["M-20 556 L520 556", "M-40 506 L1080 506"]) {
      expect(
        html,
        `Die Grundlinie "${d}" fehlt im ausgelieferten Blatt – ohne Feld ist ` +
          `das erste Bild ein schwebender Ring`,
      ).toContain(d);
    }
  });
});

test.describe("Erstes Bild – das Standbild gehört der Media-Query", () => {
  test("kein Pfad ist länger als sein Versteck", async ({ page }) => {
    // ⚠️ WARUM DAS EIN EIGENER FALL IST: Der ausgelieferte Ruhezustand
    // versteckt jede Linie, indem er ein Strichmuster von 4000 Einheiten mit
    // einem Versatz von 4000 kombiniert – der Pfad liegt dann vollständig in
    // der LÜCKE. Das gilt nur, solange er kürzer als 4000 Einheiten ist.
    // Wer die Zeichnung eines Tages vergrößert, bekommt sonst eine Linie, die
    // im ersten Bild teilweise sichtbar ist – ohne Fehlermeldung, und auf dem
    // Gerät des Entwicklers vermutlich unauffällig.
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForSelector(".hero-dunk", { state: "attached" });
    const laengen = await page.evaluate(() =>
      [...document.querySelectorAll("[data-dunk-path]")].map((el) =>
        el.getTotalLength(),
      ),
    );
    expect(laengen.length, "Keine Zeichenlinien gefunden").toBe(4);
    for (const l of laengen) {
      expect(
        l,
        `Ein Pfad ist ${l.toFixed(0)} Einheiten lang – das Versteck (${VERSTECKT}) ` +
          `deckt ihn nicht mehr vollständig ab`,
      ).toBeLessThan(VERSTECKT);
    }
  });

  test("bei reduzierter Bewegung steht das Standbild schon im ersten Bild", async ({
    browser,
  }) => {
    // Der Punkt dieses Falls ist das WOHER, nicht das OB. Dass das Standbild
    // steht, prüft `hero-dunk.spec.mjs` bereits. Hier wird geprüft, dass es aus
    // dem STYLESHEET kommt und nicht aus einer JavaScript-Zuweisung — nur dann
    // gilt es auch für jemanden, dessen JavaScript noch lädt oder ausbleibt.
    //
    // ⚠️ Ehrlich benannt, damit niemand mehr hineinliest, als dasteht: Der Test
    // läuft MIT JavaScript. Er beweist nicht, dass die Seite ohne JavaScript
    // funktioniert – er beweist, dass an dieser Stelle keines nötig ist. Der
    // fehlende Inline-Stil ist der Beleg dafür.
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 375, height: 812 },
    });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForSelector(".hero-dunk", { state: "attached" });

    const zustand = await page.evaluate(() => {
      const svg = [...document.querySelectorAll(".hero-dunk")].find(
        (s) => getComputedStyle(s).display !== "none",
      );
      const pfade = [...svg.querySelectorAll("[data-dunk-path]")];
      return {
        muster: pfade.map((el) => getComputedStyle(el).strokeDasharray),
        inline: pfade.map((el) => el.style.strokeDasharray),
        ring: getComputedStyle(svg.querySelector("[data-dunk-ring]"))
          .strokeOpacity,
        ringInline: svg.querySelector("[data-dunk-ring]").style.strokeOpacity,
      };
    });

    expect(zustand.muster.length, "Keine Zeichenlinien gefunden").toBe(2);
    for (const m of zustand.muster) {
      expect(
        m,
        `Standbild trägt Strichmuster "${m}" statt einer durchgezogenen Linie`,
      ).toBe("none");
    }
    for (const i of zustand.inline) {
      expect(
        i,
        `Das Standbild wird per JavaScript gesetzt ("${i}") statt per ` +
          `Stylesheet – dann gilt es erst, wenn das JavaScript gelaufen ist`,
      ).toBe("");
    }
    expect(
      parseFloat(zustand.ring),
      "Der Ring steht im Standbild nicht auf Abschluss-Stärke",
    ).toBeCloseTo(1, 2);
    expect(
      zustand.ringInline,
      "Die Ring-Deckkraft des Standbilds kommt aus JavaScript statt aus dem Stylesheet",
    ).toBe("");

    await ctx.close();
  });
});
