import { test, expect } from "@playwright/test";

// ══ EINE GRÖSSENÄNDERUNG WÄHREND DES EINFLUGS ═══════════════════════════════
//
// Befund Kai (Gate, sechste Runde), behoben in `6e2fbe1`, bis dahin von KEINEM
// Test gedeckt. Der Schiedsrichter `einflugAktivRef` war dicht – `apply` schrieb
// während des Flugs nachweislich nicht mit –, aber das Ereignis wurde
// VERWORFEN statt aufgeschoben, und `schritt` friert `zielY` beim Start ein.
// Ein Resize im Flugfenster ließ den Ball deshalb auf der alten Lage liegen,
// bis irgendein Ereignis `apply` auslöste. Gemessen war das kein Randfall:
//   375→360: 165 statt 371,8   ·   430→500: 165 statt 333,9
//   600→700: 193,6 statt 519,3
//
// ⚠️ WARUM DIESER TEST SEINE REFERENZ SELBST MISST UND KEINE ZAHL FESTSCHREIBT.
// Die Soll-Lagen oben sind Messwerte eines Tages, keine Konstanten: Sie hängen
// an Zeilenumbrüchen, Schriftmetrik und Inhalt. Eine festgeschriebene 371,8
// wäre beim nächsten Textwechsel falsch – und zwar rot, ohne dass ein Defekt
// vorläge. Deshalb lädt der Test die Zielbreite ZUERST direkt und benutzt das
// Ergebnis als Referenz. Verglichen wird eine Lage mit einer Lage, nicht mit
// einer Erinnerung.
//
// ⚠️ UND WARUM DIESE BREITENPAARE. Sie sind die einzigen mit nachgewiesen
// VERSCHIEDENER Ruhelage. Meine ersten zwei Sondenfassungen waren grün, weil
// 375×812, 430×812 und 375×640 dieselbe Lage 165 ergeben – die Sonde konnte
// den Defekt gar nicht sehen. Ein grünes Ergebnis aus einer Messung ohne
// Trennschärfe ist kein Ergebnis. Wer die Paare ändert, muss die Trennschärfe
// neu belegen; der Test prüft sie deshalb selbst mit.
//
// ⚠️ UND WARUM NACH DEM RESIZE NICHT GESCROLLT WIRD. Ein Scroll löst `apply`
// aus und korrigiert die Lage – der Test wäre grün und übersähe genau den
// Fehler. Dieselbe Lehre wie bei der Ruhelage in `hero-ball-laufzeit`.

// ⚠️ KEIN FESTER ZEITWERT FÜR DEN FLUGBEGINN — DAS WAR MEIN ERSTER ENTWURF,
// UND ER WAR WERTLOS. Ich hatte 1000ms eingesetzt, gemessen am Flugfenster der
// PRODUCTION-Runtime (896–1213ms). Die Suite läuft aber gegen `next dev`, wo
// der Erstaufruf erst kompiliert: dort liegt der Flug bei **1523–2044ms**
// (nachgemessen, zwei Durchläufe). Der Resize landete also VOR dem Flug, der
// Defekt wurde nie ausgelöst — und die Positivkontrolle bestätigte es: Mit
// zurückgedrehtem Fix blieb der Test **3 von 3 grün**.
// Das ist die Konstanten-Fehlerklasse aus CLAUDE.md Roadmap 15 (5), diesmal
// über eine Umgebungsgrenze hinweg: eine Zahl, die dort gemessen wurde, wo der
// Test nicht läuft.
// Stattdessen wird auf DIESELBE Bedingung gewartet, an welcher der Code selbst
// hängt — `Reveal` steht still, denn genau dann finalisiert
// `kaestenFinalisieren` und startet den Einflug. Das gilt in beiden Umgebungen.
const NACH_FLUGSTART_MS = 150; // in den ~520ms Flug hinein, nicht davor
const NACHLAUF_MS = 2600;
const TOLERANZ_PX = 3;

// [Startbreite, Zielbreite] – beide mobil, beide unter `md`, damit der
// Ladeauftritt überhaupt stattfindet.
// ⚠️ `[430, 500]` MUSSTE WEICHEN, und der Grund ist ein Erfolg des Tests:
// Seit die mobile Ruhelage am Eyebrow-Badge VERANKERT ist (Entscheidung Vivien,
// 17.08.2026) statt gesucht zu werden, hängt sie nicht mehr am ausgefransten
// Rand der Headline — und 430 und 500 ergeben dieselbe Lage (154,3).
// Kais Trennschärfe-Prüfung hat das gemeldet, statt grün durchzulaufen:
//   „430 und 500 ergeben dieselbe Ruhelage. Dieses Paar ist für den Test blind
//    – ein grünes Ergebnis hieße hier nichts."
// Genau dafür ist sie gebaut. Ersetzt durch `[375, 640]` (149 gegen 214, also
// 65px Unterschied), gemessen am Stand nach der Verankerung.
// ⚠️ BEIDE PAARE MUSSTEN WEICHEN, UND ZWEIMAL WAR DER GRUND EIN ERFOLG DIESES
// TESTS. Seit die mobile Ruhelage am Eyebrow verankert ist und der senkrechte
// Mittenabstand aus dem Konturkanal gelöst wird (Entscheidung Vivien,
// 17.08.2026), liegen benachbarte Breiten sehr nah beieinander:
//   `[430, 500]` → identische Lage (154,3)
//   `[375, 360]` → 9 px auseinander, Schwelle ist > 10
// Beides hat die Trennschärfe-Prüfung gemeldet, statt grün durchzulaufen:
//   „Dieses Paar ist für den Test blind – ein grünes Ergebnis hieße hier nichts."
// Genau dafür ist sie gebaut, und sie hat sich zweimal bezahlt.
// Gewählt sind jetzt Paare, die einen REGIMEWECHSEL kreuzen und dadurch weit
// auseinanderliegen — gemessen am Stand nach der Verankerung:
//   `[375, 320]` → 155 gegen 123 (32 px): kreuzt in die Auffangregel, weil bei
//                  320 px die Überlappung mit dem Badge echt ist (Kanal −9,0)
//   `[375, 640]` → 155 gegen 220 (65 px)
const PAARE = [
  [375, 320],
  [375, 640],
  [600, 700],
];
const HOEHE = 812;

async function ruhelage(page, breite, resizeVon = null) {
  await page.setViewportSize({
    width: resizeVon ?? breite,
    height: HOEHE,
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  if (resizeVon) {
    // Auf den Flugbeginn warten, nicht auf eine Uhrzeit: `Reveal` steht still
    // ⇒ `kaestenFinalisieren` finalisiert ⇒ der Einflug startet.
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("h1");
        if (!h1) return false;
        const t = getComputedStyle(h1).transform;
        return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
      },
      { timeout: 15000 },
    );
    await page.waitForTimeout(NACH_FLUGSTART_MS);
    await page.setViewportSize({ width: breite, height: HOEHE });
  }
  await page.waitForTimeout(NACHLAUF_MS);
  return page.evaluate(() => {
    const b = document.querySelector(".hero-ball-sprite");
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return Math.round(r.top * 10) / 10;
  });
}

test.describe("Hero-Ball – Größenänderung während des Einflugs", () => {
  for (const [von, nach] of PAARE) {
    test(`${von}→${nach}: die Ruhelage folgt der neuen Breite`, async ({
      page,
    }) => {
      // 1. Referenz: die Zielbreite direkt geladen.
      const referenz = await ruhelage(page, nach);
      expect(referenz, ".hero-ball-sprite nicht gefunden").not.toBeNull();

      // 2. Trennschärfe belegen: Die Startbreite MUSS eine andere Lage haben,
      //    sonst kann dieser Test den Defekt grundsätzlich nicht sehen.
      const startlage = await ruhelage(page, von);
      expect(
        Math.abs(startlage - referenz),
        `${von} und ${nach} ergeben dieselbe Ruhelage (${referenz}). Dieses ` +
          `Paar ist für den Test blind – ein grünes Ergebnis hieße hier nichts. ` +
          `Ein Paar mit unterschiedlichen Lagen wählen.`,
      ).toBeGreaterThan(10);

      // 3. Der eigentliche Fall: Resize mitten im Flug, danach NICHT scrollen.
      const nachResize = await ruhelage(page, nach, von);
      expect(
        Math.abs(nachResize - referenz),
        `Nach einer Größenänderung im Flugfenster ruht der Ball auf ` +
          `${nachResize} statt auf ${referenz} (Startbreite ${von} ergibt ${startlage}). ` +
          `Der Flug friert sein Ziel beim Start ein; wird das Ereignis während ` +
          `des Flugs verworfen statt nachgeholt, bleibt der Ball auf der alten ` +
          `Lage liegen, bis irgendetwas "apply" auslöst.`,
      ).toBeLessThanOrEqual(TOLERANZ_PX);
    });
  }
});
