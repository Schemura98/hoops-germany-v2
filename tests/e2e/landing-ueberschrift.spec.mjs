// Die Überschrift „Eine Saison, sechs Spielzüge" bleibt im Bild.
//
// WARUM ES DIESEN TEST BRAUCHT (Auftrag Vivien, 18.08.2026)
// Patrick hat mit einem Foto seines Telefons gemeldet, dass der Satz
// beidseitig abgeschnitten ist – auf 360 px blieb „SAISON, SECHS SPIELZ".
//
// ⚠️ DER GRUND, WARUM EIN TEST HIER UNVERZICHTBAR IST, ist nicht der Fehler,
// sondern seine Mechanik. Viviens Messung über 15 Breiten:
//
//     Diese Zeile ist IMMER das 10,617-fache ihrer Schriftgröße breit.
//
// Der Faktor ist keine Konstante des Designs – er ist die **Textlänge**.
// Bei `9vw` ergibt er 95,5 % der Bildschirmbreite, die Zeile passt also
// rechnerisch immer. Wird der Wortlaut geändert, ändert sich der Faktor, und
// die Zeile steht wieder über – lautlos, ohne dass irgendetwas kaputtgeht.
//
// Deshalb gilt für diese eine Überschrift eine Auflage (an Nele):
// **Sie kann nicht umformuliert werden, ohne die Geometrie neu zu messen.**
// Dieser Test ist die Stelle, an der das auffällt.
import { test, expect } from "@playwright/test";

// Reale Gerätebreiten plus die Schwelle, ab der laut Messung nie etwas
// überstand (560), plus Tablet und Desktop.
const BREITEN = [320, 360, 375, 390, 412, 430, 560, 768, 1280];

// ⚠️ 320 px liegt AUSSERHALB des Zielbereichs – bestehende Entscheidung
// Viviens, festgehalten in CLAUDE.md Roadmap 20b („der Zielbereich beginnt
// bei 360"; dort auf 360 gesenkt mit ihrer Selbstkorrektur „das war eine
// Apple-Brille").
//
// Konkret hier: Die Untergrenze von 2rem greift unterhalb von 311 px und
// erzeugt dann einen Überstand von rund einem Dreiviertel-Buchstaben je Seite
// (gemessen 10 px bei 32 px Schrift). Vivien nennt das ausdrücklich die
// verträgliche Dosis: „eine Absturzsicherung, keine Gestaltung".
//
// Deshalb gilt unter 360 px nur, dass nichts GANZ verschwindet – kein
// Null-Überstand. Wer die Zahl ändert, ändert eine Produktentscheidung.
const ZIELBEREICH_AB = 360;
const TOLERANZ_UNTER_ZIELBEREICH = 0.4; // Anteil einer Schriftgröße je Seite

const TEXT = "Eine Saison, sechs Spielzüge";

test.describe("Startseite – die große Abschnitts-Überschrift", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: die Überschrift bleibt vollständig im Bild`, async ({ page }) => {
      // Ohne Bewegungsreduktion misst man Zwischenbilder der Einblendung.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: breite, height: 800 });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const ueberschrift = page.getByRole("heading", { name: TEXT });
      await ueberschrift.waitFor({ state: "attached", timeout: 30_000 });
      // In den Blick scrollen: Die Zeile blendet erst beim Sichtwerden ein.
      await ueberschrift.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);

      const m = await page.evaluate((text) => {
        const el = [...document.querySelectorAll("h1,h2,h3")].find(
          (e) => e.textContent.trim() === text,
        );
        if (!el) return null;
        const b = el.getBoundingClientRect();
        const groesse = parseFloat(getComputedStyle(el).fontSize);
        return {
          links: Math.round(b.left),
          rechts: Math.round(b.right),
          breite: Math.round(b.width),
          fenster: window.innerWidth,
          schrift: Math.round(groesse * 10) / 10,
          // Der Faktor, an dem alles hängt: Breite je Schriftgröße.
          faktor: Math.round((b.width / groesse) * 100) / 100,
        };
      }, TEXT);

      expect(m, `Überschrift „${TEXT}" nicht gefunden – wurde sie umformuliert?`).not.toBeNull();

      const fehltLinks = Math.max(0, -m.links);
      const fehltRechts = Math.max(0, m.rechts - m.fenster);

      const hinweis =
        `(Zeile ${m.breite}px bei ${m.fenster}px Fenster, Schriftgröße ` +
        `${m.schrift}px, Faktor ${m.faktor}).\n` +
        `Der Faktor ist die TEXTLÄNGE je Schriftgröße. Wurde der Wortlaut ` +
        `geändert, muss die Untergrenze in \`LandingFeatures.js\` neu gerechnet ` +
        `werden: sie darf höchstens Fensterbreite ÷ Faktor betragen.`;

      if (breite >= ZIELBEREICH_AB) {
        expect(
          fehltLinks + fehltRechts,
          `Die Überschrift ragt über den Bildschirm hinaus: links ${fehltLinks}px, ` +
            `rechts ${fehltRechts}px ${hinweis}`,
        ).toBe(0);
      } else {
        // Unter 360 px: sichtbar überstehen darf sie, verschwinden nicht.
        const grenze = m.schrift * TOLERANZ_UNTER_ZIELBEREICH;
        expect(
          Math.max(fehltLinks, fehltRechts),
          `Unter ${ZIELBEREICH_AB}px ist ein kleiner Überstand vorgesehen ` +
            `(Absturzsicherung, nicht Gestaltung) – hier fehlen aber ` +
            `${Math.max(fehltLinks, fehltRechts)}px je Seite, mehr als die ` +
            `zugelassenen ${Math.round(grenze)}px. Dann sind ganze Buchstaben weg. ` +
            hinweis,
        ).toBeLessThanOrEqual(grenze);
      }

      // Ehrlichkeitsschranke: Eine Überschrift, die nur deshalb hineinpasst,
      // weil sie winzig ist, hat den Test nicht bestanden – sie ist dann kein
      // Gestaltungselement mehr. Sie soll den Rand ausfüllen.
      expect(
        m.breite / m.fenster,
        `Die Überschrift füllt nur ${Math.round((m.breite / m.fenster) * 100)}% ` +
          `der Bildschirmbreite. Sie ist als randfüllende Zeile gedacht (gemessen ` +
          `95,5% bei 9vw); deutlich weniger heißt, dass die Untergrenze der ` +
          `Schriftgröße zu klein oder der vw-Wert zu niedrig ist.`,
      ).toBeGreaterThan(0.7);
    });
  }
});
