import { test, expect } from "@playwright/test";

// ══ DIE ANKUNFT AUF DER FORTSCHRITTS-LEISTE — BEIDSEITS VON 1280 ════════════
//
// Befunde Tobias (Browser-Gate, sechste Runde), beide UNTER 1280px, beide an
// einem einzelnen Viewport unsichtbar, weil der Desktop-Zweig korrekt ist:
//
//   B-a  ⚠️ AM 19.08.2026 GEGENSTANDSLOS GEWORDEN, NICHT WIDERLEGT.
//        Der Befund lautete: `ringRef={goalRingRef}` steht nur am
//        DESKTOP-Emblem, das mobile bekommt nie `rail-goal-flash-ring`.
//        Es gibt keinen Farbblitz mehr – die Landung am Ende der
//        Fortschritts-Leiste ist eine STEHENDE ENDMARKE geworden, die Landung
//        als Ereignis ist an den Hero gewandert
//        (docs/HERO-DUNK-KONZEPT-2026-08-19.md, Möglichkeit B; Begründung:
//        CLAUDE.md Roadmap 20 (d) – diese Pointe war auf keinem Viewport
//        sichtbar). Der zugehörige Testfall ist deshalb entfernt.
//        ⚠️ WER DEN BLITZ ZURÜCKBAUT, HOLT DIESEN FALL AUS DEM VERLAUF ZURÜCK.
//        Sein Lehrsatz gilt unverändert und steht unten weiter: Die Ausdehnung
//        messen, nicht die Klasse.
//   B-b  `RUHE_ANTEIL = 15/28` existiert nur im Desktop-Zweig. Der mobile Ball
//        hängt unverändert an `top-1/2` des Balkens; seine Mitte liegt unter
//        der Emblem-Unterkante. Die Ebenen-Trennung läuft mobil ins Leere.
//
// ⚠️ WARUM DIESER TEST DIE AUSDEHNUNG MISST UND NICHT DIE KLASSE.
// Das ist Tobias' schärfster Punkt, und er ist der Grund, warum es diese Datei
// überhaupt geben muss: Die Klasse `rail-goal-flash-ring` WIRD auch mobil
// gesetzt – auf dem per `hidden xl:block` ausgeblendeten Desktop-Ring, dessen
// `getBoundingClientRect().width` 0 ist. Ein Test mit der naheliegenden Frage
// „ist die Klasse gesetzt?" wäre auf JEDEM Viewport grün gewesen und hätte
// genau den Defekt bestätigt, den er finden soll.
// Dieselbe Klasse wie in docs/MUSTER-ZAHLEN-DIE-LUEGEN: im Sinne des Codes
// wahr, im Sinne des Lesers falsch.
//
// ⚠️ UND WARUM BEIDE SEITEN VON 1280 GEPRÜFT WERDEN.
// `FeatureProgressRail` schaltet mit `xl:hidden` / `hidden xl:block`. Beide
// Defekte sind reine BREAKPOINT-Asymmetrien: Oberhalb stimmt alles. Eine
// Prüfmatrix mit nur einer Seite lässt beide Zweige korrekt messen und
// trotzdem den halben Bestand übersehen – die Höhenachsen-Lehre aus
// CLAUDE.md Roadmap 20b, hier auf der Breitenachse.

const RAIL_BREAKPOINT = 1280;
const VIEWPORTS = [
  [375, 812, "mobiler Balken"],
  [768, 1024, "Tablet – immer noch der Balken"],
  [1024, 768, "knapp unter xl"],
  [1280, 800, "genau xl – ab hier die Spalte"],
  [1440, 900, "Desktop-Spalte"],
];

// Vivien: der Ball ruht bei 15 von 28px Emblemhöhe, nicht auf der Mitte.
const RUHE_ANTEIL = 15 / 28;
// ⚠️ Die Toleranz stammt aus der Zeit der überschwingenden Lande-Kurve und
// bleibt unverändert stehen, obwohl es die Kurve nicht mehr gibt: Sie muss den
// Defekt fangen (mobil lag der Wert bei ~1,2, also weit außerhalb), und enger
// zu ziehen hieße, eine Schwelle ohne Anlass zu verschieben.
const TOLERANZ = 0.2;

async function zumZielScrollen(page) {
  await page.evaluate(async () => {
    const bild = () =>
      new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));
    const h = document.body.scrollHeight;
    for (let a = 0.35; a <= 1.0001; a += 0.02) {
      window.scrollTo(0, Math.round(h * a));
      await bild();
    }
  });
  // Kein Ankunfts-Übergang mehr (19.08.2026) – der Puffer bleibt trotzdem,
  // weil die Leiste ihre Lage per rAF schreibt und das Emblem als Flex-Kind
  // erst nach dem Layout seine endgültige Position hat.
  await page.waitForTimeout(600);
}

function messen() {
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const rechteck = (el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  };
  // Korb-Emblem = HoopEmblem (viewBox 0 0 20 14), Streckenball = RailBallGlyph.
  const embleme = [...document.querySelectorAll('svg[viewBox="0 0 20 14"]')];
  const baelle = [...document.querySelectorAll('svg[viewBox="0 0 14 14"]')];

  return {
    embleme: embleme.map(rechteck),
    emblemeSichtbar: embleme.filter(sichtbar).map(rechteck),
    baelleSichtbar: baelle.filter(sichtbar).map((el) => ({
      ...rechteck(el),
      deck: Number(getComputedStyle(el).opacity),
    })),
  };
}

test.describe("Ankunft auf der Fortschritts-Leiste", () => {
  for (const [breite, hoehe, wie] of VIEWPORTS) {
    const seite = breite >= RAIL_BREAKPOINT ? "Spalte" : "Balken";

    test(`${breite}x${hoehe} (${wie}): die Endmarke steht sichtbar am Ende der Strecke`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      // ⚠️ BEWUSST OHNE SCROLLEN. Seit dem 19.08.2026 ist das Korb-Emblem eine
      // STEHENDE Endmarke: Es muss von Anfang an da sein, nicht erst bei der
      // Ankunft aufdämmern. Ein Ziel, das erst erscheint, wenn man es erreicht
      // hat, ist keine Orientierung.
      // Genau deshalb prüft dieser Fall VOR dem Scrollen – ein Test, der erst
      // ans Ende fährt, wäre auch mit der alten Aufdämmerung grün gewesen.
      await page.waitForTimeout(400);
      const m = await page.evaluate(messen);

      expect(
        m.emblemeSichtbar.length,
        `Kein sichtbares Korb-Emblem gefunden (${m.embleme.length} im DOM) – ` +
          `die Endmarke steht nicht, bevor der Ball ankommt.`,
      ).toBeGreaterThan(0);
    });

    test(`${breite}x${hoehe} (${wie}): der Ball ruht im Netz, nicht daneben`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      await zumZielScrollen(page);
      const m = await page.evaluate(messen);

      expect(
        m.emblemeSichtbar.length,
        "Kein sichtbares Korb-Emblem – Messung bedeutungslos",
      ).toBeGreaterThan(0);
      const angekommen = m.baelleSichtbar.filter((b) => b.deck > 0.5);
      expect(
        angekommen.length,
        `Kein sichtbarer Streckenball am Ziel (${m.baelleSichtbar.length} ` +
          `mit Ausdehnung). Ohne Ball ist die Aussage über seine Lage leer.`,
      ).toBeGreaterThan(0);

      // Das Emblem, dem der Ball am nächsten ist – bei zwei Ebenen (netz/ring)
      // liegen beide auf demselben Rechteck.
      const ball = angekommen[0];
      const mx = ball.left + ball.width / 2;
      const my = ball.top + ball.height / 2;
      const e = m.emblemeSichtbar.reduce((best, k) => {
        const d = Math.hypot(
          mx - (k.left + k.right) / 2,
          my - (k.top + k.bottom) / 2,
        );
        return !best || d < best.d ? { ...k, d } : best;
      }, null);

      const anteil = (my - e.top) / e.height;
      expect(
        anteil,
        `Die Ballmitte liegt bei ${anteil.toFixed(2)} der Emblemhöhe ` +
          `(Ballmitte y=${my.toFixed(1)}, Emblem ${e.top.toFixed(1)}..${e.bottom.toFixed(1)}). ` +
          `Vivien: der Ball ruht bei ${RUHE_ANTEIL.toFixed(2)} – unter dem Ring, vor dem Netz. ` +
          `Ein Wert über 1 heißt: Der Ball liegt komplett UNTER dem Emblem, die ` +
          `Ebenen-Trennung läuft in diesem Zweig ins Leere. Befund Tobias B-b.`,
      ).toBeGreaterThan(RUHE_ANTEIL - TOLERANZ);
      expect(anteil).toBeLessThan(RUHE_ANTEIL + TOLERANZ);

      // Waagerecht: Der Ball darf nicht über die Emblemkante hinausragen.
      // ⚠️ BEWUSST NICHT „Überlappung > halbe Ballbreite" GEPRÜFT. Genau das
      // war mein erster Entwurf – und er landete auf einer Messerschneide:
      // Mobil ist die Überlappung EXAKT 7px bei einer Schwelle von 7px
      // (Ball 14px breit, `left-0` + `translate3d(trackW-7)`, Emblem `right-0`).
      // Ein Prüfmaß, das auf dem Gleichheitspunkt entscheidet, kippt bei jedem
      // halben Pixel Rundung in die andere Richtung – dieselbe Fehlerklasse wie
      // die festen Zeichenfenster aus CLAUDE.md Roadmap 15 (5).
      // Gemessen wird deshalb der ABSTAND der Ballmitte zur rechten Emblemkante:
      // mobil 0px (die Mitte sitzt exakt auf der Kante), am Desktop rund 20px.
      const randAbstand = e.right - (ball.left + ball.width / 2);
      expect(
        randAbstand,
        `Die Ballmitte steht ${randAbstand.toFixed(1)}px innerhalb der rechten ` +
          `Emblemkante (Ball ${ball.left.toFixed(1)}..${ball.right.toFixed(1)}, ` +
          `Emblem ${e.left.toFixed(1)}..${e.right.toFixed(1)}). Bei 0 sitzt der ` +
          `Ball auf der Kante statt im Netz – Befund Tobias B-b, zweite Hälfte.`,
      ).toBeGreaterThanOrEqual(ball.width / 2);
    });
  }
});
