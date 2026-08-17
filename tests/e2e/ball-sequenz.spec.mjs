import { test, expect } from "@playwright/test";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

// Die Bildzahl der Hero-Ball-Sequenz hängt an DREI Stellen, die nichts
// voneinander wissen:
//   1. `BALL_SPRITE_FRAMES` in components/landing/HeroGlyphs.js
//      – steuert `backgroundSize` UND den Nenner `FRAMES - 1` der Bildwahl
//   2. beide Dateinamen in app/globals.css (`…-32x200.webp` / `.avif`)
//   3. die Datei selbst in public/images/ (echte Pixelmaße)
//
// ⚠️ WARUM DAS EINEN TEST BRAUCHT (Auflage Kai, 15.08.2026):
// Ein Nachziehen von nur einer der drei Stellen bricht die Anzeige **still**.
// Es gibt keinen Fehler, keinen 404 und keine Warnung – `backgroundSize` wird
// falsch berechnet, die Kachelgrenzen liegen mitten im Ball, und die Fläche
// zeigt zwei Ballhälften nebeneinander. Genau die Sorte Fehler, die kein Build
// und keine Typprüfung findet.
//
// Verschärfend: KEIN einziger der übrigen Tests lädt „/" – die Startseite ist
// bewusst ausgespart, damit die Scroll-Bühne nicht mitspielt (siehe
// navbar-suche.spec.mjs). Über die Ball-Choreografie sagt eine grüne Suite
// deshalb bis heute nichts aus. Dieser Test schließt genau diese Lücke, und
// zwar ohne Browser: Er liest Quelltext und Dateisystem.
//
// ⚠️ KEINE FESTEN ZEICHENFENSTER (Methodik-Lehre CLAUDE.md Roadmap 15 (5)):
// `slice(x, x+400)`, `indexOf("]")` und Verwandte brechen in beide Richtungen –
// zu kurz gibt falsches Rot, und ein fehlgeschlagenes `indexOf` liefert -1,
// wodurch `slice` stillschweigend den ganzen Rest der Datei liefert. Hier wird
// deshalb ausschließlich mit Regexen auf ganze Zeilen gearbeitet, und jede
// Hilfsfunktion WIRFT, statt etwas Falsches zurückzugeben.

const wurzel = path.resolve(process.cwd());
const lies = (p) => readFileSync(path.join(wurzel, p), "utf8");

/** Liest genau einen Treffer aus – wirft, wenn es keinen oder mehrere gibt. */
function genauEiner(text, regex, was) {
  const treffer = [...text.matchAll(regex)];
  if (treffer.length === 0)
    throw new Error(`${was}: kein Treffer für ${regex}`);
  if (treffer.length > 1) {
    throw new Error(
      `${was}: ${treffer.length} Treffer für ${regex} – erwartet genau einer`,
    );
  }
  return treffer[0];
}

test.describe("Hero-Ball-Sequenz – die drei Kopplungsstellen", () => {
  test("Konstante, CSS-Dateinamen und die echte Datei nennen dieselbe Bildzahl", () => {
    // (1) Die Konstante im Quelltext
    const glyphs = lies("components/landing/HeroGlyphs.js");
    const frames = Number(
      genauEiner(
        glyphs,
        /^export const BALL_SPRITE_FRAMES = (\d+);$/gm,
        "HeroGlyphs.js",
      )[1],
    );
    expect(frames).toBeGreaterThan(1); // sonst teilt die Bildwahl durch 0

    // (2) Beide Dateinamen in der CSS – WebP und AVIF müssen übereinstimmen
    // ⚠️ Die WebP-Datei steht ABSICHTLICH zweimal in der CSS: einmal als
    // einfache Deklaration (Browser ohne `image-set` behalten sie) und einmal
    // innerhalb von `image-set`. Eine Erwartung auf "genau zwei Nennungen" wäre
    // also falsch – der erste Entwurf dieses Tests ist genau darüber gestolpert.
    const css = lies("app/globals.css");
    const namen = [
      ...css.matchAll(/ball-basketball-(\d+)x(\d+)\.(webp|avif)/g),
    ];
    const formate = new Set(namen.map((m) => m[3]));
    expect(
      [...formate].sort(),
      "app/globals.css muss je einen WebP- und einen AVIF-Verweis tragen",
    ).toEqual(["avif", "webp"]);
    const webpAnzahl = namen.filter((m) => m[3] === "webp").length;
    expect(
      webpAnzahl,
      "WebP muss zweimal stehen: als Rückfall-Deklaration UND in image-set",
    ).toBe(2);
    for (const m of namen) {
      expect(
        Number(m[1]),
        `Dateiname ${m[0]} nennt ${m[1]} Bilder, BALL_SPRITE_FRAMES sagt ${frames}`,
      ).toBe(frames);
    }
    const kante = Number(namen[0][2]);
    expect(
      Number(namen[1][2]),
      "WebP und AVIF nennen verschiedene Kantenlängen",
    ).toBe(kante);

    // (3) Die Dateien auf der Platte – vorhanden, nicht leer, richtig breit
    for (const format of ["webp", "avif"]) {
      const datei = `public/images/ball-basketball-${frames}x${kante}.${format}`;
      let stat;
      try {
        stat = statSync(path.join(wurzel, datei));
      } catch {
        throw new Error(
          `${datei} fehlt. Erzeugen mit:\n` +
            `  node scripts/generate-ball-rotation.mjs --frames ${frames} --groesse ${kante} --muster basketball --out public/images`,
        );
      }
      expect(stat.size, `${datei} ist leer`).toBeGreaterThan(1024);
    }
  });

  test("die Vorgabewerte des Erzeugers ergeben genau das ausgelieferte Asset", () => {
    // Sonst erzeugt ein Aufruf ohne Argumente eine Datei, die niemand verwendet –
    // und der reproduzierende Aufruf steht nirgends (Befund Kai B4).
    const skript = lies("scripts/generate-ball-rotation.mjs");
    const frames = Number(
      genauEiner(
        skript,
        /^const FRAMES = Number\(arg\("frames", (\d+)\)\);$/gm,
        "Erzeuger",
      )[1],
    );
    const groesse = Number(
      genauEiner(
        skript,
        /^const GROESSE = Number\(arg\("groesse", (\d+)\)\)/gm,
        "Erzeuger",
      )[1],
    );

    // Nicht `genauEiner`: WebP steht zweimal (Rückfall + image-set, s. o.).
    // Stattdessen: ALLE Nennungen müssen dieselbe Zahl tragen, und die muss der
    // Vorgabe entsprechen.
    const css = lies("app/globals.css");
    const namen = [
      ...css.matchAll(/ball-basketball-(\d+)x(\d+)\.(?:webp|avif)/g),
    ];
    expect(
      namen.length,
      "globals.css nennt die Sequenz gar nicht",
    ).toBeGreaterThan(0);
    for (const [voll, cssFrames, cssKante] of namen) {
      expect(frames, `Vorgabe --frames passt nicht zu ${voll}`).toBe(
        Number(cssFrames),
      );
      expect(groesse, `Vorgabe --groesse passt nicht zu ${voll}`).toBe(
        Number(cssKante),
      );
    }
  });

  test("die Bildwahl teilt nie durch null und der Streifen ist prozentbasiert", () => {
    // Beides sind die Stellen, an denen eine geänderte Bildzahl still bricht.
    const stage = lies("components/landing/HeroScrollStage.js");
    expect(
      stage,
      "Die Bildwahl muss in Prozent rechnen – Pixel wären an die Anzeigegröße gebunden",
    ).toMatch(
      /backgroundPositionX\s*=\s*`\$\{\(bild\s*\/\s*\(BALL_SPRITE_FRAMES - 1\)\)\s*\*\s*100\}%`/,
    );

    const glyphs = lies("components/landing/HeroGlyphs.js");
    expect(
      glyphs,
      "backgroundSize muss aus BALL_SPRITE_FRAMES abgeleitet sein, nicht fest verdrahtet",
    ).toMatch(/backgroundSize:\s*`\$\{BALL_SPRITE_FRAMES\s*\*\s*100\}% 100%`/);
  });

  test("der Drehpunkt des Streckenballs ist nicht von außen überschreibbar", () => {
    // Befund Kai B1: `{...props}` stand hinter `style`, die Desktop-Aufrufstelle
    // übergab einen Wert aus der 14px-Zeit und der Ball eierte um einen Punkt
    // neben seiner Mitte. Der Test hält beide Hälften der Lösung fest.
    const glyphs = lies("components/landing/HeroGlyphs.js");

    // `transformOrigin` steht HINTER dem Spread – sonst gewinnt der Aufrufer.
    expect(
      glyphs,
      "transformOrigin muss nach {...style} stehen, sonst kann der Aufrufer den Drehpunkt kippen",
    ).toMatch(
      /\.\.\.style,\s*transformOrigin: `\$\{RAIL_BALL_R\}px \$\{RAIL_BALL_R\}px`/,
    );

    // Keine Aufrufstelle darf einen eigenen transformOrigin an den Ball geben.
    const rail = lies("components/landing/FeatureProgressRail.js");
    const eigene = [...rail.matchAll(/transformOrigin/g)];
    expect(
      eigene.length,
      "FeatureProgressRail darf keinen eigenen transformOrigin setzen – der gehört der Komponente",
    ).toBe(0);
  });
});
