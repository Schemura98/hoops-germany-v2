import { test, expect } from "@playwright/test";

// ══ DER MOBILE EINFLUG — DIE ENTSCHEIDUNG, NICHT NUR IHR ERGEBNIS ═══════════
//
// Auflage Kai (Gate, fünfte Runde). Seine Mutationsprobe legte offen, dass die
// Suite den Kern dieser Arbeit gar nicht bewacht:
//
//   M5  Einflug als Standbild (keine Bildwechsel)   → 45/45 grün
//   M9  Einflug ersatzlos gestrichen                 → 45/45 grün
//
// Genau die Regression, die Vivien eine Runde zuvor gefunden hatte („1 von 32
// Bildern, null Wechsel"), hätte kein Test wiedergefunden. Acht von zehn
// Entscheidungen dieses Bereichs waren unbewacht; diese Datei deckt die drei
// ab, die sichtbar sind.
//
// ⚠️ ALLE DREI PRÜFUNGEN SCROLLEN NICHT. Das ist der Punkt: Ein Test, der
// scrollt, erzwingt die Neuberechnung, die der Fehler vermissen ließ – er wäre
// grün und übersähe genau den Fall. Dieselbe Lehre wie bei der Ruhelage.

// ⚠️ 360 UND 368 SIND NEU (Befund Kai, siebte Runde): Sie kamen in KEINER
// Viewport-Liste des Projekts vor – die Breiten, die den ganzen Umbau ausgelöst
// haben. Sieben von elf Mutationen seiner Matrix wirkten ausschließlich oder
// überwiegend dort, und `[375, 360]` war in der Runde davor sogar aus dem
// Resize-Test ENTFERNT worden. 360 px ist die verbreitetste Android-Breite in
// Deutschland.
const MOBIL = [
  [375, 812],
  [375, 667],
  [360, 812],
  [368, 812],
  [430, 932],
  [320, 568],
];

// Schneidet jeden Schreibvorgang am Ball mit – Zeit, y-Lage, Bildwahl,
// Deckkraft. Wird VOR dem Laden gesetzt, sonst fehlt der Anfang des Fluges.
const SPUR = `document.addEventListener("DOMContentLoaded", () => {
  window.__spur = [];
  new MutationObserver(() => {
    const e = document.querySelector(".hero-ball-sprite");
    if (!e) return;
    const m = /translate3d\\([^,]+,\\s*([-\\d.]+)px/.exec(e.style.transform);
    if (!m) return;
    window.__spur.push({
      t: Math.round(performance.now()),
      y: Number(m[1]),
      bild: e.style.backgroundPositionX,
      deck: Number(getComputedStyle(e).opacity),
    });
  }).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
});`;

async function spurAufnehmen(page, breite, hoehe) {
  await page.setViewportSize({ width: breite, height: hoehe });
  await page.addInitScript(SPUR);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000); // Einflug + Reveal, ohne zu scrollen
  const spur = await page.evaluate(() => window.__spur || []);
  // ⚠️ EINE LEERE AUFNAHME IST KEIN BESTEHEN. Beim ersten Entwurf dieser Sonde
  // lief der Beobachter, bevor es ein Dokument gab; sie zeichnete nichts auf
  // und meldete "0px Sprung". Das sah aus wie ein bestandener Test.
  expect(
    spur.length,
    `Nur ${spur.length} Schreibvorgänge am Ball aufgezeichnet – die Sonde hat ` +
      `nicht gemessen. Ein Ergebnis daraus wäre bedeutungslos, nicht grün.`,
  ).toBeGreaterThan(8);
  return spur;
}

test.describe("Hero-Einflug (mobil)", () => {
  for (const [breite, hoehe] of MOBIL) {
    test(`${breite}x${hoehe}: der Ball fliegt überhaupt ein`, async ({
      page,
    }) => {
      // Gegen M9: Einflug ersatzlos gestrichen.
      const spur = await spurAufnehmen(page, breite, hoehe);
      const weg =
        Math.max(...spur.map((s) => s.y)) - Math.min(...spur.map((s) => s.y));
      expect(
        weg,
        `Der Ball legt beim Laden nur ${weg.toFixed(1)}px zurück. Ohne Scrollen ` +
          `bewegt sich hier sonst nichts – der Einflug findet also nicht statt.`,
      ).toBeGreaterThan(50);
    });

    test(`${breite}x${hoehe}: der Einflug zeigt die Sequenz, kein Standbild`, async ({
      page,
    }) => {
      // Gegen M5: Einflug als Standbild. Es gibt 32 Bilder; ein Flug, der eines
      // davon zeigt, macht die ganze Sequenz zu 104 KB ohne Zweck.
      const spur = await spurAufnehmen(page, breite, hoehe);
      // ⚠️ HIER STAND EINMAL EINE SCHWELLE „≥ 26 VON 32 BILDERN" — Vivien hat
      // sie am 17.08.2026 selbst gestrichen, und ihre Begründung ist der
      // eigentliche Inhalt dieses Kommentars:
      //   · **Analytisch** durchläuft die Kurve per Konstruktion ALLE 32
      //     (`round(32 · eBild)` mit monoton steigendem `eBild` trifft jeden
      //     Index genau einmal). Eine Schwelle von 26 gegen einen Wert, der
      //     strukturell immer 32 ist, prüft nichts.
      //   · **Gezeigt** ist die Zahl keine Eigenschaft des Entwurfs, sondern der
      //     Hardware: 30 Hz → 14, 60 Hz → 24, 90 Hz → 30, 120 Hz → 32.
      //   · Und der Punkt, der es entscheidet: Tobias hat **26** gemessen, exakt
      //     60 Hz ergibt **24**. Die Differenz ist Frame-Jitter. Eine Kennzahl,
      //     die zwischen zwei Läufen auf derselben Maschine um zwei wandert,
      //     während die Schwelle genau auf der Kante liegt, ist kein Prüfmaß,
      //     sondern „ein Münzwurf mit Fehlerbericht" (Vivien) — genau die Klasse
      //     sporadisch roter Tests aus CLAUDE.md Methodik-Lehre (3).
      // ⚠️ HIER STAND EIN VERWEIS AUF EIN MASS, DAS ES NICHT GAB — und das ist
      // der Befund, den Kai UND Tobias in Runde sieben unabhängig gemeldet haben
      // (Kais K4-Muster eine Ebene höher: nicht eine Konstante ohne Verwendung,
      // sondern eine **Übergabe an nichts**). Der Satz lautete „das Stillstands-
      // Maß im Laufzeit-Test (≤ 80 ms)" — im Laufzeit-Test gab es keines, und
      // `Stillstand` kam im ganzen Projekt nur in diesem Kommentar vor.
      // Schwer wog das, weil dieser Verweis die BEGRÜNDUNG für die Streichung der
      // 26/32-Schwelle war: Die Begründung stimmte, der Ersatz war erfunden.
      // Das Maß steht jetzt unten in dieser Datei — und mit dem
      // BEWEGUNGSVORBEHALT, den Tobias hergeleitet hat.
      const bilder = new Set(spur.map((s) => s.bild).filter(Boolean));
      expect(
        bilder.size,
        `Der Einflug zeigt ${bilder.size} verschiedene Bilder der 32er-Sequenz. ` +
          `Genau diese Regression stand schon einmal live (Befund Vivien): ` +
          `ein fallendes Standbild.`,
      ).toBeGreaterThan(5);
    });

    test(`${breite}x${hoehe}: die Textur steht nie, während der Ball läuft`, async ({
      page,
    }) => {
      // ══ DAS STILLSTANDS-MASS, MIT BEWEGUNGSVORBEHALT ═══════════════════════
      // Gegen den Defekt, den Vivien beschrieben hat: „der Ball kriecht spürbar
      // weiter, während seine Textur eingefroren ist."
      //
      // ⚠️ WARUM DER VORBEHALT DEN UNTERSCHIED MACHT (Herleitung Tobias, siebte
      // Runde). Die nackte „größte Lücke zwischen Bildwechseln" beträgt **66 ms**
      // — Vivien hatte den Wert analytisch richtig vorhergesagt. Aber Tobias hat
      // nachgemessen, WO sie liegt:
      //     33,0 ms  Bild 29→30   Ballweg 0,40 px
      //     50,0 ms  Bild 31→0    Ballweg **0,00 px**
      //     66,9 ms  Bild  0→24   Ballweg **0,00 px**
      // Die 66 ms liegen **vollständig auf einem stillstehenden Ball** — es gibt
      // keinen Auslauf nach dem letzten Positionsschreiben (gemessen 0,0 ms).
      // Damit misst die nackte Zahl den Defekt NICHT, gegen den die Schwelle
      // geschrieben wurde.
      // Mit Vorbehalt sind es **17 ms** (eine Bildperiode bei 60 Hz) gegen eine
      // Schwelle von 80 — also 4,7-fache Reserve.
      // ⚠️ Und damit ist auch Kais Einwand beantwortet: Er hatte gewarnt, eine
      // Schwelle 17,5 % über der bindenden Stelle sei „dieselbe Falle in neuer
      // Einheit" wie die gestrichene Bildzahl. Das galt für 66 gegen 80. Für 17
      // gegen 80 gilt es nicht.
      // Praktische Folge des Vorbehalts: Die Schwelle bricht NICHT, wenn jemand
      // den Nachlauf nach der Landung verkürzt — ein Vorgang, der mit diesem
      // Defekt nichts zu tun hat.
      const spur = await spurAufnehmen(page, breite, hoehe);
      let groessteLuecke = 0;
      let bei = null;
      for (let i = 1; i < spur.length; i += 1) {
        const weg = Math.abs(spur[i].y - spur[i - 1].y);
        // Nur Intervalle, in denen sich der Ball WAHRNEHMBAR bewegt …
        if (weg < 1) continue;
        // … UND SICHTBAR IST. ⚠️ Ohne diese zweite Bedingung meldete das Maß
        // **824 ms** – ein 20-px-Sprung über 824 ms bei scheinbar stehender
        // Textur. Der lag aber VOR dem Einflug, wo der Ball mobil auf Deckkraft 0
        // steht: `apply` platziert ihn dort schon, unsichtbar.
        // Tobias hat innerhalb des Flugs gemessen, meine Sonde spannt den ganzen
        // Ladevorgang – dieselbe Kennzahl über zwei verschiedene
        // Grundgesamtheiten, der vierte Fall dieser Art in dieser Arbeit.
        // Der Defekt lautet „der Ball KRIECHT SPÜRBAR weiter" – ein unsichtbarer
        // Ball kriecht für niemanden.
        if (spur[i].deck <= 0.05 || spur[i - 1].deck <= 0.05) continue;
        if (spur[i].bild === spur[i - 1].bild) {
          const luecke = spur[i].t - spur[i - 1].t;
          if (luecke > groessteLuecke) {
            groessteLuecke = luecke;
            bei = `${spur[i - 1].t}→${spur[i].t}ms, Weg ${weg.toFixed(2)}px`;
          }
        }
      }
      expect(
        groessteLuecke,
        `Die Textur stand ${groessteLuecke}ms still, während sich der Ball ` +
          `bewegte (${bei}); erlaubt sind 80ms. Gemessen sind sonst 17ms – ein ` +
          `deutlich höherer Wert heißt, dass die Bildkurve nicht mehr zur ` +
          `Positionskurve passt.`,
      ).toBeLessThanOrEqual(80);
    });

    test(`${breite}x${hoehe}: der Ball bleibt liegen, wo er landet`, async ({
      page,
    }) => {
      // Gegen den Befund, den mein EIGENER B1-Fix erzeugt hat (Kai): Die
      // Nachvermessung rief `apply`, während der Flug noch lief – zwei Schreiber
      // auf einem Element. Der Ball landete, stand ~400ms sichtbar und sprang
      // dann ohne Animation 20px nach oben. Auf JEDEM mobilen Laden, ohne jede
      // Nutzerhandlung. Aus einer stillen Fehlplatzierung war ein sichtbarer
      // Satz geworden.
      const spur = await spurAufnehmen(page, breite, hoehe);
      const saetze = [];
      for (let i = 1; i < spur.length; i++) {
        // Eine Pause trennt den Flug von allem danach. Nur sichtbare Sprünge
        // zählen – vor dem Flug steht der Ball auf Deckkraft 0.
        if (spur[i].t - spur[i - 1].t > 100 && spur[i - 1].deck > 0.05) {
          saetze.push({
            versatz: spur[i].y - spur[i - 1].y,
            pause: spur[i].t - spur[i - 1].t,
          });
        }
      }
      const groesster = saetze.reduce(
        (m, s) => Math.max(m, Math.abs(s.versatz)),
        0,
      );
      expect(
        groesster,
        `Nach der Landung springt der Ball um ${groesster.toFixed(1)}px ` +
          `(${saetze.map((s) => `${s.versatz.toFixed(1)}px nach ${s.pause}ms`).join(", ")}). ` +
          `Ein zweiter Schreiber greift auf das Element zu, nachdem der Flug ` +
          `es abgelegt hat.`,
      ).toBeLessThanOrEqual(2);
    });
  }
});
