import { test, expect } from "@playwright/test";

// ══ DER EINE TEST, DER DIE VERANKERUNG WIRKLICH BEWACHT ═════════════════════
//
// Auflage Kai (siebte Runde). Seine Mutationsmatrix legte offen, dass **13 von
// 14** Umkehrungen dieses Mechanismus stumm bleiben — darunter die Verankerung
// selbst (M1: zurück auf `imStreifen`, Ball landet bei 360 px wieder im
// Textblock), `MIN_KONTURKANAL`, der Bereich [12, 24], `rho` aus
// `getComputedStyle`, und die Auffangregel.
//
// Drei Gründe erklärten die leere Matrix, und dieser Test schließt alle drei:
//
//   1. **360 und 368 px kamen in KEINER Viewport-Liste vor** — die Breiten, die
//      den ganzen Umbau ausgelöst haben. `[375, 360]` wurde sogar entfernt.
//      Sieben der elf Mutationen wirken ausschließlich oder überwiegend dort.
//   2. **„wirksam sichtbar" ist auch bei kaputter Lage 80 %.** Das Maß trennt
//      „Ball im Bild" von „Ball nicht im Bild" — nicht „an der richtigen Stelle"
//      von „im Textblock".
//   3. **Kein Test misst die Beziehung, die Vivien spezifiziert hat.** Sie hat
//      den KONTURKANAL zur Vorgabe gemacht; geprüft wurde nirgends ein Kanal.
//
// ⚠️ WARUM KONTUR UND NICHT HÜLLKÖRPER: Der Kanal zwischen einem Kreis und einem
// gerundeten Rechteck, die diagonal versetzt sind, verläuft **diagonal**. Sein
// Maß ist weder der waagerechte noch der senkrechte Hüllkörper-Abstand. Bei
// 360 px meldet der Hüllkörper 2,65 px, während 9,7 px Luft sind — eine
// achsenweise Prüfung würde also Kollision melden, wo keine ist. Genau diesen
// Fehler habe ich gebaut und Vivien hat ihn korrigiert.

// Breiten mit Absicht: 360/368 sind die Auslöser, 356 liegt an der Regimegrenze
// zur Auffangregel, 320 darunter, der Rest deckt den Zielbereich ab.
const BREITEN = [320, 356, 360, 364, 368, 375, 390, 412, 430, 480, 640, 760];
// Höhenachse mit, weil vier Runden lang nur Breiten geprüft wurden und der
// Ausfall an der FENSTERHÖHE hing (Roadmap 20b).
const HOEHEN = [568, 812, 932];

const MIN_KONTURKANAL = 10; // spiegelt die Konstante in HeroScrollStage.js
const ZIELBEREICH_AB = 360; // darunter gilt nur „überhaupt sichtbar"

test.describe("Hero-Ball – Konturkanal zum Eyebrow", () => {
  for (const hoehe of HOEHEN) {
    for (const breite of BREITEN) {
      test(`${breite}x${hoehe}: Ball über dem Eyebrow, Kanal ≥ ${MIN_KONTURKANAL}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: breite, height: hoehe });
        const fehler = [];
        page.on("pageerror", (e) => fehler.push(e.message.split("\n")[0]));
        await page.goto("/", { waitUntil: "networkidle" });
        // Auf das Ende der Reveal-Übergänge warten, dann den Einflug abwarten.
        await page
          .waitForFunction(
            () => {
              const h = document.querySelector("h1");
              if (!h) return false;
              const t = getComputedStyle(h).transform;
              return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
            },
            null,
        { timeout: 5000 },
          )
          .catch(() => {});
        await page.waitForTimeout(900);

        const m = await page.evaluate(() => {
          const ball = document.querySelector(".hero-ball-sprite");
          const eb = document.querySelector("[data-hero-eyebrow]");
          const h1 = document.querySelector("h1");
          if (!ball || !eb || !h1) {
            return {
              fehlt: [!ball && "Ball", !eb && "Eyebrow", !h1 && "h1"].filter(
                Boolean,
              ),
            };
          }
          const rb = ball.getBoundingClientRect();
          const re = eb.getBoundingClientRect();
          const rh = h1.getBoundingClientRect();
          const R = rb.width / 2;
          const cx = rb.left + R;
          const cy = rb.top + R;
          // ⚠️ Der Eckenradius wird GEMESSEN, nicht aus dem Tailwind-Mapping
          // geschlossen — dieselbe Auflage, die Vivien der Komponente gegeben hat.
          const rho =
            parseFloat(getComputedStyle(eb).borderTopRightRadius) || 0;
          const qx = Math.min(Math.max(cx, re.left + rho), re.right - rho);
          const qy = Math.min(Math.max(cy, re.top + rho), re.bottom - rho);
          return {
            kanal: Math.hypot(cx - qx, cy - qy) - rho - R,
            // Die Ballmitte muss OBERHALB der Eyebrow-Oberkante liegen – das ist
            // die Komposition „oben rechts vom Eyebrow", und sie unterscheidet
            // die Verankerung von jeder gesuchten Lage.
            ueberEyebrow: cy < re.top,
            imTextblock: rb.top < rh.bottom && rb.bottom > rh.top,
            dMitte: re.top - cy,
          };
        });

        expect(fehler, `Die Seite hat geworfen: ${fehler.join(" | ")}`).toEqual(
          [],
        );
        expect(
          m.fehlt,
          `Nicht gefunden: ${(m.fehlt || []).join(", ")}. Bei leerer Seite ist ` +
            `das die Folge eines Laufzeitfehlers, nicht ein fehlendes Element.`,
        ).toBeUndefined();

        // ⚠️ DAS IST DIE ZUSICHERUNG, DIE M1 FÄNGT: Dreht man die Verankerung
        // zurück auf `imStreifen`, landet der Ball bei 360 px im Textblock und
        // seine Mitte liegt UNTER der Eyebrow-Oberkante.
        expect(
          m.imTextblock,
          `Der Ball überschneidet das h1-Band (Mittenabstand ${Math.round(m.dMitte)}px). ` +
            `Genau dieser Zustand stand bis zum 17.08.2026 auf 360/368/440/480/560/640px live.`,
        ).toBe(false);
        expect(
          m.ueberEyebrow,
          `Die Ballmitte liegt nicht oberhalb der Eyebrow-Oberkante ` +
            `(Abstand ${Math.round(m.dMitte)}px, negativ = darunter).`,
        ).toBe(true);

        if (breite >= ZIELBEREICH_AB) {
          expect(
            m.kanal,
            `Konturkanal zum Eyebrow ${m.kanal.toFixed(2)}px, gefordert ` +
              `${MIN_KONTURKANAL}px. ⚠️ Gemessen wird der kürzeste Abstand der ` +
              `KONTUREN inkl. Eckenradius – nicht der Hüllkörper-Abstand, der bei ` +
              `360px 2,65px meldet, wo 9,7px Luft sind.`,
          ).toBeGreaterThanOrEqual(MIN_KONTURKANAL);
        } else {
          // Unterhalb des Zielbereichs greift die Auffangregel: Der Ball wird
          // ganz über das Badge gehoben. Verlangt wird dort nur Nichtberührung.
          expect(
            m.kanal,
            `Unterhalb des Zielbereichs (${ZIELBEREICH_AB}px) gilt nur ` +
              `Nichtberührung, gemessen ${m.kanal.toFixed(2)}px.`,
          ).toBeGreaterThan(0);
        }
      });
    }
  }
});
