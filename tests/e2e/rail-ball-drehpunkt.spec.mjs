// Der Drehpunkt des Streckenballs – wiederhergestellter Wächter (Kai K3).
//
// ⚠️ WARUM ES DIESE DATEI WIEDER GIBT.
// Am 19.08.2026 wurde `ball-sequenz.spec.mjs` mit dem Hero-Umbau gelöscht. Die
// Begründung in tests/e2e/README.md lautete: „Die Sequenz, ihre beiden
// Bilddateien und der Erzeuger sind gelöscht." Das stimmt – für DREI der vier
// Fälle jener Datei. Der vierte prüfte etwas völlig anderes, das nur zufällig
// dort einquartiert war: den Drehpunkt des Balls auf der Fortschritts-Leiste.
//
// Dieser Gegenstand LEBT: components/landing/HeroGlyphs.js (RailBallGlyph),
// eingesetzt in components/landing/FeatureProgressRail.js an zwei Stellen,
// mit aktiver Rollbewegung bis 1965°. Nach der Löschung fand
// `grep -rn transformOrigin tests/` null Treffer – der Wächter war weg, sein
// Gegenstand nicht.
//
// WAS ER BEWACHT (ursprünglich Befund Kai B1, 15.08.2026):
// `{...props}` stand HINTER `style`. Die Desktop-Aufrufstelle übergab
// `transformOrigin: "7px 7px"` – einen Wert aus der Zeit, als der Glyph 14px
// groß war – und ersetzte damit das ganze Style-Objekt. Der Ball eierte um
// einen Punkt 3px neben seiner Mitte: Taumelkreis 8,49px, also 42 % des
// Durchmessers, über 1,6 Umdrehungen. Mobil war es korrekt, weil dort kein
// `style` übergeben wurde – und genau diese Asymmetrie ist der Grund, warum es
// durchrutschte. Ein Fehler, der nur auf einer von zwei Aufrufstellen auftritt,
// sieht beim Lesen wie eine funktionierende Komponente aus.
//
// ⚠️ LEHRE FÜR DAS NÄCHSTE MAL: Eine Testdatei mit vier Fällen kann vier
// verschiedene Gegenstände bewachen. „Der Gegenstand ist weg" muss deshalb für
// JEDEN Fall einzeln gelten, nicht für den Dateinamen.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const lies = (p) => readFileSync(path.join(PROJECT_ROOT, p), "utf8");

/** Genau ein Treffer – wirft sonst, statt still etwas Falsches zu liefern. */
function genauEiner(text, regex, was) {
  const treffer = [...text.matchAll(regex)];
  if (treffer.length !== 1) {
    throw new Error(
      `${was}: ${treffer.length} Treffer für ${regex} – erwartet genau einer`,
    );
  }
  return treffer[0];
}

// Der Soll-Drehpunkt wird aus dem Quelltext GELESEN, nicht eingetragen. Sonst
// bricht der Test bei einer legitimen Größenänderung des Glyphs, und jemand
// „repariert" ihn, indem er die Zahl nachzieht – womit die Regel weg wäre.
const RAIL_BALL_PX = Number(
  genauEiner(
    lies("components/landing/HeroGlyphs.js"),
    /^export const RAIL_BALL_PX = (\d+);$/gm,
    "HeroGlyphs.js",
  )[1],
);
const SOLL = `${RAIL_BALL_PX / 2}px ${RAIL_BALL_PX / 2}px`;

// Der Streckenball ist das einzige SVG mit dieser viewBox.
const BALL = 'svg[viewBox="0 0 14 14"]';

// ⚠️ BEIDE AUFRUFSTELLEN STEHEN AUF JEDER BREITE IM SEITENGERÜST.
// Das war beim Bau dieses Tests mein eigener Irrtum, gefangen in der
// Gegenprobe: Die Fälle hießen zuerst „mobil" und „Desktop", als prüfte jeder
// Lauf seine eine Aufrufstelle. Tatsächlich liefert `querySelectorAll` auf 390
// px BEIDE Bälle – der Desktop-Ball hängt nur unter einem ausgeblendeten
// Vorfahren (`hidden xl:block`), er ist aber da. Nachgemessen auf 390 px:
// zwei Treffer, der eine mit 10px 10px, der andere (mutiert) mit 7px 7px.
//
// Der Test war damit STÄRKER als seine Beschriftung – er prüfte immer beide.
// Das ist trotzdem ein Befund am Test: Eine Beschriftung, die eine Aufteilung
// behauptet, die es nicht gibt, lässt den nächsten Leser glauben, ein Lauf auf
// einer Breite decke nur eine Stelle ab. Er würde dann beim Kürzen die falsche
// Hälfte streichen. (Dieselbe Fehlerform wie K2: Der Name sagte
// „Positionswechsel", geprüft wurden Schreibvorgänge.)
//
// Die Breiten bleiben, weil ein Breakpoint den Drehpunkt sehr wohl per CSS
// kippen könnte. Sie heißen nur nicht mehr nach Aufrufstellen.
const ANZAHL_AUFRUFSTELLEN = 2;

test.describe("Streckenball – der Drehpunkt gehört der Komponente", () => {
  for (const [breite, hoehe] of [
    [390, 844],
    [1440, 900],
  ]) {
    test(`gemessen bei ${breite}×${hoehe}: jede Aufrufstelle dreht um die Ballmitte`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForSelector(BALL, { state: "attached" });

      const gemessen = await page.evaluate(
        (sel) =>
          [...document.querySelectorAll(sel)].map((el) => ({
            origin: getComputedStyle(el).transformOrigin,
            // Der nächste ausgeblendete Vorfahr, falls es einen gibt – nur zur
            // Fehlermeldung, nicht als Bedingung.
            versteckt: !el.getClientRects().length,
          })),
        BALL,
      );

      // Ehrlichkeitsschranke (Muster CLAUDE.md Roadmap 20f), und zwar mit
      // fester Zahl: „mindestens einer" wäre grün, wenn eine der beiden
      // Aufrufstellen still verschwindet – und dann prüfte der Test die
      // verbliebene doppelt und die verlorene gar nicht.
      expect(
        gemessen.length,
        `${gemessen.length} Streckenbälle gefunden (${BALL}), erwartet ${ANZAHL_AUFRUFSTELLEN} – mobil und Desktop. Weicht die Zahl ab, ist eine Aufrufstelle entfallen oder dazugekommen; beides gehört angesehen, bevor diese Zahl nachgezogen wird.`,
      ).toBe(ANZAHL_AUFRUFSTELLEN);

      gemessen.forEach((b, i) => {
        expect(
          b.origin,
          `Ball ${i + 1} von ${gemessen.length}${b.versteckt ? " (derzeit ausgeblendet)" : ""}: Drehpunkt ist "${b.origin}", erwartet "${SOLL}". Ein Drehpunkt neben der Mitte lässt den rollenden Ball eiern – bei 3px Versatz sind das 42 % des Durchmessers Taumelkreis über 1,6 Umdrehungen.`,
        ).toBe(SOLL);
      });
    });
  }

  test("Quelltext: transformOrigin steht HINTER dem Spread", () => {
    // Die Laufzeitmessung oben sagt „der Wert stimmt heute". Diese Regel sagt
    // „der Aufrufer kommt gar nicht erst heran" – das ist die Zusicherung, die
    // den nächsten Umbau überlebt.
    expect(
      lies("components/landing/HeroGlyphs.js"),
      "transformOrigin muss nach {...style} stehen, sonst gewinnt ein Aufrufer, der ein eigenes style-Objekt übergibt",
    ).toMatch(
      /\.\.\.style,\s*transformOrigin: `\$\{RAIL_BALL_R\}px \$\{RAIL_BALL_R\}px`/,
    );
  });

  test("keine Aufrufstelle setzt einen eigenen Drehpunkt", () => {
    // ⚠️ Das ist die Hälfte, die die Laufzeitmessung NICHT abdeckt: Ein
    // Aufrufer könnte einen transformOrigin setzen, der zufällig denselben Wert
    // ergibt – heute grün, nach der nächsten Größenänderung still falsch.
    const rail = lies("components/landing/FeatureProgressRail.js");
    const treffer = [...rail.matchAll(/transformOrigin/g)];
    expect(
      treffer.length,
      `FeatureProgressRail.js nennt transformOrigin ${treffer.length}-mal. Der Drehpunkt gehört der Komponente – ein Wert von außen war Befund B1.`,
    ).toBe(0);
  });
});
