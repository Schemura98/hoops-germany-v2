import { test, expect } from "@playwright/test";

// ══ DAS ZIEL DER BALLREISE MUSS GEZEICHNET WERDEN ═══════════════════════════
//
// Vorschlag Tobias (Browser-Gate, vierte Runde), nachdem er eine Regression
// gefunden hatte, die ich am selben Tag eingebaut und er selbst eine Runde
// zuvor fälschlich als „behoben" bestätigt hatte:
//
// `HoopEmblem` trug `opacity-0` in seiner eigenen Klasse. Solange die Aufrufer-
// Klasse sie ERSETZTE, fiel das weg. Seit dem Umbau auf ZUSAMMENFÜHREN blieb es
// stehen – und die Deckkraft steuert der umschließende `span`, an dem die Ref
// hängt. Wrapper 1 × SVG 0 = 0: Das Korb-Emblem wurde auf keinem Viewport mehr
// gezeichnet, die Ballreise endete an nichts, und der Farbblitz lag im selben
// unsichtbaren SVG.
//
// ⚠️ WARUM DIESER TEST DIE GERENDERTE DECKKRAFT PRÜFT UND NICHT DIE GESETZTE:
// Tobias hatte in Runde 3 die Position und die WRAPPER-Deckkraft gemessen und
// daraus „behoben" geschlossen. Beides war richtig – und das Emblem trotzdem
// unsichtbar. `getComputedStyle` am SVG selbst ist die einzige Aussage, die
// nicht zwischen Wrapper und Glyph verrutschen kann.
// Genau die Klasse aus docs/MUSTER-ZAHLEN-DIE-LUEGEN, diesmal in einer
// Gate-Bestätigung.

const VIEWPORTS = [
  [375, 812], // mobil: Emblem über der rechten Balkenspitze
  [1440, 900], // Desktop: Emblem am Fuß der senkrechten Leiste
];

test.describe("Korb-Emblem – das Ziel der Ballreise", () => {
  for (const [breite, hoehe] of VIEWPORTS) {
    test(`${breite}x${hoehe}: das Emblem ist am Ende der Strecke wirklich sichtbar`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const ergebnis = await page.evaluate(async () => {
        const bild = () =>
          new Promise((f) =>
            requestAnimationFrame(() => requestAnimationFrame(f)),
          );
        const hoehe = document.body.scrollHeight;
        let beste = null;
        // Die Ankunft liegt am Ende der Feature-Sektion; großzügig abtasten.
        for (let anteil = 0.5; anteil <= 0.95; anteil += 0.02) {
          window.scrollTo(0, Math.round(hoehe * anteil));
          await bild();
          // ⚠️ Nicht `find`, sondern das erste mit echter Größe: Es gibt ZWEI
          // Embleme im DOM (mobile Leiste und Desktop-Leiste), und je nach
          // Breite ist eines per `display:none` auf 0x0. Ein `find` griff
          // zuverlässig das falsche und übersprang dann den ganzen Durchlauf.
          const emblem = [...document.querySelectorAll("svg")]
            .filter((s) => s.getAttribute("viewBox") === "0 0 20 14")
            .find((s) => {
              const r = s.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            });
          if (!emblem) continue;
          // ⚠️ Die GERENDERTE Deckkraft des SVG, nicht die des Wrappers.
          const eigene = Number(getComputedStyle(emblem).opacity);
          // Und die tatsächlich wirksame: Ein Wrapper auf 0 macht auch ein
          // SVG auf 1 unsichtbar. Beide Richtungen zählen.
          let wirksam = eigene;
          let el = emblem.parentElement;
          while (el && el !== document.body) {
            wirksam *= Number(getComputedStyle(el).opacity);
            el = el.parentElement;
          }
          if (!beste || wirksam > beste.wirksam) {
            beste = { eigene, wirksam, y: Math.round(window.scrollY) };
          }
        }
        return beste;
      });

      expect(ergebnis, "Kein Korb-Emblem im DOM gefunden").not.toBeNull();
      expect(
        ergebnis.eigene,
        `Das Emblem-SVG selbst steht auf Deckkraft ${ergebnis.eigene}. Ein ` +
          `\`opacity-0\` an der Komponente macht jede Wrapper-Steuerung wirkungslos.`,
      ).toBeGreaterThan(0.9);
      expect(
        ergebnis.wirksam,
        `Wirksame Deckkraft am Ende der Strecke: ${ergebnis.wirksam.toFixed(2)} ` +
          `(bei scrollY ${ergebnis.y}). Der Ball reist auf ein Ziel zu, das nicht ` +
          `gezeichnet wird.`,
      ).toBeGreaterThan(0.5);
    });
  }
});
