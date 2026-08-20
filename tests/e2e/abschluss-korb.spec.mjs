import { test, expect } from "@playwright/test";

// ══ DER KORB IM ABSCHLUSS-BLOCK — EINE PROJEKTION, LESBARE GROESSE ══════════
//
// Anlass: Patricks Rücknahme der alten Hero-Choreografie nannte ausdrücklich
// ZWEI PERSPEKTIVEN IN EINEM BILD. Der Hero ist daraufhin auf reine Draufsicht
// umgebaut worden (`HeroCourt.js`) — der Abschluss-Block trug die
// Schrägansicht aber weiter, und auf 1440 px stehen beide im selben Bild.
// Am 20.08.2026 angeglichen (`KorbRuhe.js`).
//
// ⚠️ WARUM DIESE DATEI DREI SEHR VERSCHIEDENE DINGE PRÜFT — jedes davon ist
// eine Fehlerform, die diese Zeichnung schon einmal hatte:
//
//   (1) PROJEKTION. „Draufsicht" ist nicht direkt messbar. Messbar ist ihr
//       Gegenteil: Eine Schrägansicht braucht eine ELLIPSE, weil ein Kreis von
//       schräg oben keiner mehr ist. Die alte Fassung zeichnete ihren Ring als
//       `<ellipse rx="135" ry="33">`. Ein `<ellipse>` in diesem Block ist
//       deshalb der verlässlichste Fingerabdruck des Rückfalls.
//       ⚠️ Und die Umkehrung wird mitgeprüft: ein `<circle>` MUSS da sein.
//       Sonst wäre der Test auch dann grün, wenn jemand die Zeichnung ganz
//       entfernt — grün über nichts.
//
//   (2) GRÖSSE. Bei 56 px verschmiert das Netz aus zwölf Strängen zu einem
//       Fleck; ab rund 72 px liest es sich als Trichter. Das ist keine
//       Layout-Vorliebe, sondern die Untergrenze der Lesbarkeit — gebaut,
//       angesehen, in `KorbRuhe.js` protokolliert. Eine Zeichnung, die zu
//       klein ausgeliefert wird, ist nicht kleiner, sie ist weg.
//       Mitgeprüft: QUADRATISCH. Ein nicht-quadratischer Kasten macht aus dem
//       Kreis wieder eine Ellipse — also aus der Draufsicht wieder eine
//       Schrägansicht, diesmal über CSS statt über die Geometrie.
//
//   (3) KEINE ÜBERLAGERUNG. Das ist der eigentliche Wächter. Die alte Fassung
//       lag als `absolute` Zeichnung HINTER Überschrift und Tasten und kreuzte
//       beide — auf jeder Breite, weil Text und Zeichnung beide mittig sind.
//       Zugedeckt wurde das mit Deckkraft, und genau daher kam das schmutzige
//       Braun. Seit dem 20.08.2026 steht der Korb IM FLUSS; damit ist die
//       Fehlerklasse nicht behoben, sondern abgeschafft. Dieser Fall hält sie
//       abgeschafft.

const VIEWPORTS = [
  [360, 800, "kleinste verbreitete Android-Breite"],
  [390, 844, "iPhone"],
  [430, 932, "grosses Handy"],
  [768, 1024, "Tablet hochkant"],
  [1280, 800, "Desktop"],
  [1440, 900, "grosser Desktop"],
];

// Untergrenze der Lesbarkeit, s. (2). Bewusst als Zahl hier UND als Kommentar
// im Aufrufer — wer eine davon ändert, muss die andere finden.
const MIN_KANTE = 72;

async function zumAbschlussBlock(page) {
  // Der Block rendert erst nach der Anmeldeprüfung (`LandingCTA` gibt bis
  // dahin `null` zurück). Auf das Element warten, nicht auf eine Zeitspanne —
  // eine feste Wartezeit ist in diesem Projekt schon zweimal zum Fehlalarm
  // geworden.
  const korb = page.locator("svg[data-abschluss-korb]");
  await korb.waitFor({ state: "attached", timeout: 15_000 });
  await korb.scrollIntoViewIfNeeded();
  return korb;
}

test.describe("Abschluss-Block: der Korb ist eine Draufsicht", () => {
  for (const [breite, hoehe, wozu] of VIEWPORTS) {
    test(`${breite}x${hoehe} (${wozu}): eine Projektion, lesbare Groesse, kein Text darunter`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const korb = await zumAbschlussBlock(page);

      // ── (1) Projektion ────────────────────────────────────────────────
      const formen = await korb.evaluate((svg) => ({
        ellipsen: svg.querySelectorAll("ellipse").length,
        kreise: svg.querySelectorAll("circle").length,
        // Ein `<circle>` mit `transform: scale(x,y)` bei x≠y waere eine
        // Ellipse durch die Hintertuer. Selten, aber genau die Sorte
        // Umgehung, die ein Test sonst durchlaesst.
        verzerrteKreise: [...svg.querySelectorAll("circle")].filter((c) => {
          const t = getComputedStyle(c).transform;
          if (!t || t === "none") return false;
          const m = t.match(/matrix\(([^)]+)\)/);
          if (!m) return false;
          const [a, , , d] = m[1].split(",").map(Number);
          return Math.abs(Math.abs(a) - Math.abs(d)) > 0.02;
        }).length,
      }));

      expect(
        formen.ellipsen,
        `Der Abschluss-Korb enthaelt ${formen.ellipsen} <ellipse>. Ein Kreis ` +
          `von senkrecht oben ist ein Kreis — eine Ellipse ist der ` +
          `Fingerabdruck der Schraegansicht, die hier am 20.08.2026 ersetzt ` +
          `wurde. Damit stuenden wieder zwei Projektionen auf einer Seite.`,
      ).toBe(0);

      expect(
        formen.kreise,
        `Der Abschluss-Korb enthaelt gar keinen <circle>. Ohne diese Zeile ` +
          `waere der Test auch dann gruen, wenn die Zeichnung ganz fehlt.`,
      ).toBeGreaterThan(0);

      expect(
        formen.verzerrteKreise,
        `Ein <circle> wird ungleichmaessig skaliert und ist damit gerendert ` +
          `eine Ellipse — die Schraegansicht durch die Hintertuer.`,
      ).toBe(0);

      // ── (2) Groesse ───────────────────────────────────────────────────
      const kasten = await korb.boundingBox();
      expect(kasten, "Der Abschluss-Korb hat keine Ausdehnung").not.toBeNull();

      expect(
        Math.min(kasten.width, kasten.height),
        `Der Korb misst ${kasten.width.toFixed(1)}x${kasten.height.toFixed(1)} px. ` +
          `Unter ${MIN_KANTE} px verschmiert das Netz aus zwoelf Straengen zu ` +
          `einem Fleck (gebaut, angesehen, in KorbRuhe.js protokolliert).`,
      ).toBeGreaterThanOrEqual(MIN_KANTE);

      expect(
        Math.abs(kasten.width - kasten.height),
        `Der Korb ist ${kasten.width.toFixed(1)}x${kasten.height.toFixed(1)} px, ` +
          `also nicht quadratisch. Ein nicht-quadratischer Kasten zieht den ` +
          `Kreis zur Ellipse — die Schraegansicht zurueck, ueber CSS statt ` +
          `ueber die Geometrie.`,
      ).toBeLessThanOrEqual(1);

      // ── (3) Keine Ueberlagerung ───────────────────────────────────────
      const treffer = await page.evaluate((markeSel) => {
        const svg = document.querySelector(markeSel);
        const block = svg.closest("section");
        const m = svg.getBoundingClientRect();
        const kollisionen = [];
        // Jedes Element mit EIGENEM Text (keine Container, sonst meldet der
        // umschliessende <div> jede Marke als Treffer).
        for (const el of block.querySelectorAll("h2, p, a, span")) {
          const eigenerText = [...el.childNodes]
            .filter((k) => k.nodeType === 3)
            .map((k) => k.textContent.trim())
            .join("");
          if (!eigenerText) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const ueber =
            r.left < m.right &&
            r.right > m.left &&
            r.top < m.bottom &&
            r.bottom > m.top;
          if (ueber) kollisionen.push(eigenerText.slice(0, 40));
        }
        return kollisionen;
      }, "svg[data-abschluss-korb]");

      expect(
        treffer,
        `Der Korb ueberlagert Text: ${treffer.join(" · ")}. Genau das war die ` +
          `alte Fassung — eine Hintergrund-Zeichnung hinter einem MITTIGEN ` +
          `Textblock kann dem Text auf keiner Breite ausweichen, und Deckkraft ` +
          `ist keine Loesung dafuer, sondern der Weg ins Braun.`,
      ).toEqual([]);
    });
  }
});
