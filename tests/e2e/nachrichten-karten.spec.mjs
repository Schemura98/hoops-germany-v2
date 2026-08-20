// Die Nachrichten-Karten der Startseite bleiben im Bild — mit FESTEN Testdaten.
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM ES DIESE DATEI GIBT, OBWOHL `kein-abgeschnittener-text.spec.mjs`
// DENSELBEN FEHLER GEFUNDEN HAT
// ═══════════════════════════════════════════════════════════════════════════
//
// Gefunden hat ihn dort der Zufall. Der Fehler tritt nur auf, wenn eine der
// sechs Meldungen des Tages aus einer Quelle mit LANGEM Namen stammt — am
// 20.08.2026 war das „GT/ET Göttinger Tageblatt - Eichsfelder Tageblatt".
// Wer dieselbe Prüfung eine Woche später fährt, bekommt sechs andere Quellen
// und mit etwas Pech ein grünes Ergebnis über unverändert kaputtem Code.
//
// Das ist eine zweite, leisere Blindheit: nicht „der Test hat nichts gesehen",
// sondern „der Test hat zufällig den harmlosen Fall gesehen". Ein
// Regressionsschutz, dessen Auslösung davon abhängt, was ein fremder Verlag
// heute veröffentlicht, ist kein Schutz.
//
// Deshalb hier: Der Feed wird abgefangen und durch feste Meldungen ersetzt.
// Damit ist der heikle Fall in JEDEM Lauf enthalten, und der Lauf braucht
// weder Netz noch Glück.
//
// ═══════════════════════════════════════════════════════════════════════════
// WAS GEPRÜFT WIRD — und warum es zwei verschiedene Fragen sind
// ═══════════════════════════════════════════════════════════════════════════
//
// (1) GEOMETRIE: Keine Karte ragt über den Bildschirmrand.
//     Das ist der Fehler vom 20.08.2026: eine Spalte, die sich nach ihrem
//     Inhalt statt nach dem Bildschirm bemisst (Begründung ausführlich in
//     `components/NewsWidget.js` über `KARTEN_GITTER`).
//
// (2) ABSICHT: Der Quellenname gibt nach, das Datum nicht.
//     Die Karte hat eine Rangordnung — ein Datum, das halb dasteht, ist
//     wertlos, ein gekürzter Quellenname bleibt lesbar. Geometrie allein
//     würde auch ein Layout durchwinken, in dem das Datum verstümmelt ist und
//     der Quellenname vollständig. Beide Zusicherungen gehören geprüft, sonst
//     ist die halbe Gestaltungsentscheidung ungedeckt.
//
// ⚠️ (2) prüft ausdrücklich, dass die Kürzung WIRKLICH GREIFT — nicht, dass
// die Klasse `truncate` im Markup steht. Genau daran lag der Fehler: `truncate`
// stand die ganze Zeit da und konnte nie wirken, weil niemand der Karte eine
// Breite vorgab. Behaupten und messen sind zweierlei (Kai, 18.08.2026).
import { test, expect } from "@playwright/test";

// 360 px ist die verbreitetste Android-Breite Deutschlands, 390 das
// iPhone-Maß — dieselbe Begründung wie in `kein-abgeschnittener-text.spec.mjs`.
const BREITEN = [360, 390];

// ⚠️ Die lange Quelle ist KEIN ausgedachter Extremfall, sondern der Datensatz,
// der den Fehler live auf hoopsgermany.de ausgelöst hat. Gemessen: schmalste
// mögliche Breite 266,6 px in einer 280-px-Spalte, zusammen mit dem Datum
// (78 px) und dem Innenabstand ergab das eine 386,2 px breite Karte.
const LANGE_QUELLE = "GT/ET Göttinger Tageblatt - Eichsfelder Tageblatt";

const TESTMELDUNGEN = [
  {
    title: "WM-Härtetest in der S-Arena: Deutsche Basketball-Damen fordern Spanien",
    link: "https://example.invalid/1",
    pubDate: "Tue, 18 Aug 2026 09:00:00 GMT",
    source: LANGE_QUELLE,
  },
  {
    title: "DBB-Team vor kniffliger WM-Qualifikation",
    link: "https://example.invalid/2",
    pubDate: "Wed, 19 Aug 2026 09:00:00 GMT",
    source: "sportschau.de",
  },
  {
    // Ein einzelnes sehr langes Wort ohne Trennmöglichkeit — die zweite Art,
    // wie ein Kasten sich gegen das Schrumpfen wehrt. Der Titel darf umbrechen,
    // dieses Wort kann es nicht.
    title: "Vereinsvorstandssitzungsprotokoll: Basketballbundesligamannschaft bestätigt",
    link: "https://example.invalid/3",
    pubDate: "Thu, 20 Aug 2026 09:00:00 GMT",
    source: "Westdeutsche Allgemeine Zeitung Sportredaktion",
  },
  {
    title: "Basketball-WM in Berlin findet ohne Satou Sabally statt",
    link: "https://example.invalid/4",
    pubDate: "Thu, 20 Aug 2026 11:00:00 GMT",
    source: "DW.com",
  },
];

async function seiteMitTestmeldungen(page, breite) {
  // Bewegungsreduktion: sonst wird während des Einblendens gemessen (die
  // Karten sitzen in `components/ui/Reveal.js`), und ein Element unterwegs
  // steht woanders als ein Element an seinem Platz.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: breite, height: 800 });

  let abgefangen = 0;
  await page.route("**/api/news/rss", async (route) => {
    abgefangen += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, news: TESTMELDUNGEN }),
    });
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#news a[target=_blank]", { timeout: 30_000 }).catch(() => {});

  // ⚠️ EHRLICHKEITSSCHRANKE. Ohne sie wäre dieser Test grün, sobald die Karten
  // gar nicht erscheinen — und „keine Karte ragt heraus" ist über null Karten
  // trivial wahr. Dieselbe Falle, gegen die die ganze Datei gebaut ist.
  const karten = await page.locator("#news a[target=_blank]").count();
  expect(
    abgefangen,
    "Die Testdaten wurden nie abgerufen — dieser Lauf hat NICHT die " +
      "vorbereiteten Meldungen geprüft, sondern irgendetwas anderes.",
  ).toBeGreaterThan(0);
  expect(
    karten,
    `Es stehen ${karten} Nachrichten-Karten auf der Seite statt der ` +
      `${TESTMELDUNGEN.length} vorbereiteten. Ohne Karten misst dieser Test ` +
      `nichts und wäre trotzdem grün — deshalb bricht er hier ab.`,
  ).toBe(TESTMELDUNGEN.length);
}

test.describe("Nachrichten-Karten der Startseite", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: keine Karte ragt über den Bildschirmrand`, async ({ page }) => {
      await seiteMitTestmeldungen(page, breite);

      const funde = await page.evaluate(() => {
        const raus = [];
        for (const karte of document.querySelectorAll("#news a[target=_blank]")) {
          // Gemessen wird der Grid-Eintrag (die Einblend-Hülle) UND die Karte
          // selbst — der Überstand entstand an der Spalte, sichtbar wurde er an
          // der Karte.
          for (const el of [karte.parentElement, karte]) {
            const b = el.getBoundingClientRect();
            if (b.right > window.innerWidth + 1 || b.left < -1) {
              raus.push({
                was: el === karte ? "Karte" : "Grid-Eintrag",
                links: Math.round(b.left),
                rechts: Math.round(b.right),
                breite: Math.round(b.width),
                text: karte.textContent.trim().slice(0, 40),
              });
            }
          }
        }
        return {
          raus,
          fenster: window.innerWidth,
          spalten: getComputedStyle(document.querySelector("#news .grid")).gridTemplateColumns,
        };
      });

      expect(
        funde.raus,
        `Bei ${funde.fenster}px Fensterbreite ragen Nachrichten-Karten über den ` +
          `Rand. Die Spalte misst „${funde.spalten}" — steht dort ein größerer ` +
          `Wert als die Fensterbreite, bemisst sich die Spalte nach ihrem INHALT ` +
          `statt nach dem Bildschirm (fehlendes \`grid-cols-1\`, s. ` +
          `components/NewsWidget.js).\n` +
          JSON.stringify(funde.raus, null, 1),
      ).toEqual([]);
    });

    test(`${breite}px: der Quellenname gibt nach, das Datum bleibt ganz`, async ({ page }) => {
      await seiteMitTestmeldungen(page, breite);

      const zeile = await page.evaluate((langeQuelle) => {
        for (const karte of document.querySelectorAll("#news a[target=_blank]")) {
          const quelle = karte.querySelector("span.truncate");
          if (!quelle || quelle.textContent.trim() !== langeQuelle) continue;
          // Das Datum ist die zweite Spanne der Fußzeile.
          const datum = quelle.parentElement.querySelector("span:last-of-type");
          const q = quelle.getBoundingClientRect();
          const d = datum.getBoundingClientRect();
          return {
            gefunden: true,
            quelleGekuerzt: quelle.scrollWidth > quelle.clientWidth,
            quelleSichtbar: Math.round(q.width),
            quelleGanz: quelle.scrollWidth,
            quelleEllipse: getComputedStyle(quelle).textOverflow,
            datumGekuerzt: datum.scrollWidth > datum.clientWidth + 1,
            datumText: datum.textContent.trim(),
            datumBreite: Math.round(d.width),
            luecke: Math.round((d.left - q.right) * 100) / 100,
            fenster: window.innerWidth,
          };
        }
        return { gefunden: false };
      }, LANGE_QUELLE);

      expect(
        zeile.gefunden,
        `Die Karte mit der langen Quelle „${LANGE_QUELLE}" steht nicht auf der ` +
          `Seite. Ohne sie prüft dieser Test den heiklen Fall nicht.`,
      ).toBe(true);

      // (a) Der Quellenname MUSS nachgeben — und zwar sichtbar mit „…".
      expect(
        zeile.quelleGekuerzt && zeile.quelleEllipse === "ellipsis",
        `Der lange Quellenname wird nicht gekürzt: ${zeile.quelleSichtbar}px ` +
          `sichtbar von ${zeile.quelleGanz}px, text-overflow „${zeile.quelleEllipse}". ` +
          `Steht er vollständig da, hat sich die Karte NICHT auf die Spalte ` +
          `eingelassen — dann ragt sie entweder heraus, oder das Datum wurde ` +
          `verdrängt. Die Klasse \`truncate\` allein beweist nichts: Sie stand ` +
          `auch am 20.08.2026 im Markup und konnte nie greifen.`,
      ).toBe(true);

      // (b) Das Datum darf NIE nachgeben. Ein halbes Datum ist keine Information.
      expect(
        zeile.datumGekuerzt,
        `Das Datum „${zeile.datumText}" ist auf ${zeile.datumBreite}px beschnitten. ` +
          `In der Fußzeile gilt eine Rangordnung: Der Quellenname darf kürzen, ` +
          `das Datum nicht (\`flex-shrink-0\`).`,
      ).toBe(false);

      // (c) Kürzungspunkte und Datum dürfen sich nicht berühren.
      //
      // ⚠️ Das ist keine Geschmacksfrage, sondern dieselbe Regel, die für den
      // Ball auf der Startseite gilt: „kein Kontakt, keine geteilte Kante"
      // (CLAUDE.md, Roadmap 20b). Ein Quellenname, der nachgibt, gibt bis auf
      // den letzten Pixel nach — ohne eigene Lücke stehen „…" und Datum auf
      // EINER Kante (gemessen 0,00 px vor der Abhilfe, auf allen vier Breiten),
      // und die drei Punkte lesen sich als Teil des Datums.
      expect(
        zeile.luecke,
        `Zwischen dem gekürzten Quellennamen und dem Datum liegen ` +
          `${zeile.luecke}px. Bei 0 teilen sich „…" und Datum eine Kante — dann ` +
          `sagt die Ellipse nicht mehr „hier steht mehr", sondern klebt am ` +
          `Datum. Das Trennmaß kommt aus \`gap-3\` an der Fußzeile in ` +
          `components/NewsWidget.js.`,
      ).toBeGreaterThanOrEqual(8);
    });
  }
});
