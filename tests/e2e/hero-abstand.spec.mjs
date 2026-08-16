import { test, expect } from "@playwright/test";

// ══ DER BALL TEILT SICH KEINE KANTE MIT EINEM INHALTSKASTEN ═════════════════
//
// Prüfmaß Vivien (16.08.2026, zweite Fassung). Anlass war ihr eigener Befund:
// Der Hero-Ball stand auf 375 px **2,65 px** vom orangen Eyebrow-Badge –
// zwei gefüllte orange Massen im selben Höhenband, fast auf Berührung. Das
// liest sich nicht als Beziehung, sondern als Versehen.
//
// ⚠️ WARUM DAS PRÜFMASS ACHSENWEISE IST UND KEINE EINZELZAHL TRÄGT.
// Viviens erste Fassung lautete „mindestens 16 px, weder waagerecht noch
// senkrecht" – und sie hat sie selbst zurückgezogen, mit der schärfsten
// Begründung dieser ganzen Arbeit:
//
//   Der SENKRECHTE Abstand ist eine Code-Konstante (`+ 8`) – frei wählbar.
//   Der WAAGERECHTE ist ein REST: Viewport-Breite − Badge-Breite − Anschnitt.
//   Er wird nicht gesetzt, er fällt an. Eine Zahl über „beide Achsen"
//   behandelt eine Stellschraube und einen Restbetrag als dieselbe Größe.
//
// Das ist die Bühne/Sichtfeld-Verwechslung aus Roadmap 20b im neuen Kostüm –
// in einer Einheit spezifizieren, die niemand steuert.
//
// ⚠️ UND DIE KLEMMENDE ACHSE WECHSELT MIT DER BREITE. Auf 375 bindet die
// Waagerechte (10,15 px), auf 320 die Senkrechte – dort überlappt der Ball das
// Badge waagerecht um 17 px. Eine Messung, die nur eine Achse kennt, kommt auf
// beiden Breiten zu einem Wert und auf einer davon zum falschen Schluss.

const ZIELBEREICH = [
  [375, 667],
  [375, 812],
  [390, 844],
  [430, 932],
];

const MIN_ACHSE = 8; // „kein Kontakt, keine geteilte Kante"

test.describe("Hero-Ball – Abstand zu den Inhaltskästen", () => {
  for (const [breite, hoehe] of ZIELBEREICH) {
    test(`${breite}x${hoehe}: der Ball berührt keinen Inhaltskasten`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(2600); // Reveal + Einflug, ohne zu scrollen

      const befund = await page.evaluate((vw) => {
        const ball = document.querySelector(".hero-ball-sprite");
        if (!ball) return null;
        const rb = ball.getBoundingClientRect();
        const h1 = document.querySelector("h1");
        const wurzel = h1?.closest("div")?.parentElement;
        if (!wurzel) return null;

        // ⚠️ AN DER GEZEICHNETEN FLÄCHE MESSEN, NICHT AN DER TINTE. Genau hier
        // lag der ursprüngliche Fehler: Das Badge ist ein `span` und ging nur
        // über seine Textzeilen ein – die sind durch `px-4` beidseitig 16 px
        // schmaler als die orange Fläche.
        const kaesten = [];
        for (const el of wurzel.querySelectorAll("*")) {
          const bg = getComputedStyle(el).backgroundColor;
          // ⚠️ Dieselbe Korrektur wie in der Komponente (Befund Kai): Die
          // erste Fassung griff bei `rgb(r,g,b)` den BLAU-Kanal als Alpha ab.
          const a =
            /^rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)$/.exec(
              bg,
            );
          const gefuellt =
            bg && bg !== "transparent" && !(a && parseFloat(a[1]) === 0);
          if (!gefuellt && el.tagName !== "A" && el.tagName !== "BUTTON")
            continue;
          const r = el.getBoundingClientRect();
          // Kästen so breit wie der Viewport sind Grundflächen, keine Nachbarn.
          if (r.width > 0 && r.height > 0 && r.width < vw) {
            kaesten.push({
              r,
              name: `${el.tagName}.${(el.className || "").toString().slice(0, 30)}`,
              gefuellt,
            });
          }
        }

        let schlimmster = null;
        for (const k of kaesten) {
          // Lücke je Achse. Negativ = Überlappung auf dieser Achse.
          const dx = Math.max(k.r.left - rb.right, rb.left - k.r.right);
          const dy = Math.max(k.r.top - rb.bottom, rb.top - k.r.bottom);
          // Der freie Kanal ist die GRÖSSERE der beiden Lücken: Überlappen sich
          // die Kästen auf einer Achse, muss die andere den Abstand tragen.
          const kanal = Math.max(dx, dy);
          if (!schlimmster || kanal < schlimmster.kanal) {
            schlimmster = { kanal, dx, dy, name: k.name, gefuellt: k.gefuellt };
          }
        }
        return { schlimmster, anzahl: kaesten.length };
      }, breite);

      expect(befund, "Ball oder Hero-Inhalt nicht gefunden").not.toBeNull();
      expect(
        befund.anzahl,
        "Keine Inhaltskästen gefunden – die Messung wäre bedeutungslos",
      ).toBeGreaterThan(0);

      const s = befund.schlimmster;
      expect(
        s.kanal,
        `Engste Stelle: ${s.kanal.toFixed(2)}px zu ${s.name} ` +
          `(waagerecht ${s.dx.toFixed(2)}px, senkrecht ${s.dy.toFixed(2)}px). ` +
          `Zwischen Ball und Kasten muss auf mindestens EINER Achse ein ` +
          `durchgehender freier Kanal von ${MIN_ACHSE}px stehen – nebeneinander ` +
          `auf gleicher Höhe ohne Kanal war der Zustand vom 15.08. (2,65px).`,
      ).toBeGreaterThanOrEqual(MIN_ACHSE);
    });
  }
});
