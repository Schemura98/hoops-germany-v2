import { test, expect } from "@playwright/test";

// ══ DIE EINBLENDUNG DER HERO-ZEICHNUNG ══════════════════════════════════════
//
// Diese Datei schließt vier Lücken, die alle denselben Kern haben: Es gab eine
// Zusicherung über eine BEWEGUNG, und geprüft wurde ausschließlich der
// RUHEZUSTAND.
//
// ⚠️ WIE TEUER DAS WAR, IST BELEGT. `hero-standbild.spec.mjs` P4 prüft, dass
// im ausgelieferten Blatt KEIN Strichmuster steht und dass bei reduzierter
// Bewegung nichts läuft. Beides war grün — und trotzdem fand die Einblendung
// auf KEINEM Browser statt (Befund Kai H1, behoben in `d4f9465`): `--len` kam
// als nackte Zahl, `calc(var(--len) + 2px)` war ungültig, und eine ungültige
// Rechnung nimmt die GANZE Deklaration mit. `stroke-dasharray` fiel auf `none`,
// die Animation hatte nichts, woran sie ziehen konnte.
// Die Zusicherung stand an drei Stellen im Projekt. Geprüft hat sie keine.
//
// ══ ⚠️ ZUERST: DIE ZWEI SONDEN, DIE NICHTS GEMESSEN HABEN ═══════════════════
//
// Vivien hat bei der Reparatur zwei Sonden gebaut und beide selbst verworfen.
// Sie stehen hier, weil beide naheliegend sind und der Nächste sie sonst
// wiederholt:
//
//   (1) „ZÄHLE, WIE OFT SICH stroke-dashoffset ÄNDERT."
//       Wertlos, und zwar in der gefährlichen Richtung: Die Animation läuft
//       auch im Defekt — sie hat nur nichts, woran sie ziehen kann. Der
//       Versatz ändert sich also munter weiter.
//       ⚠️ HIER NACHGEMESSEN, am gebauten Stand gegen den nachgestellten
//       Defekt, 1,5 s auf 390×844 in Chromium:
//           Abhilfe: 55 verschiedene Werte · Defekt: 53 verschiedene Werte
//       Eine Sonde, die im Defekt praktisch dieselbe Zahl liefert wie in der
//       Abhilfe, misst den falschen Gegenstand.
//       ⚠️ UND GENAU DIESE SONDE STAND BIS ZUM 20.08.2026 ALS PRÜFMASS IN
//       `tests/e2e/README.md` — als Anleitung für den, der diesen Wächter baut.
//       Sie ist dort ersetzt.
//
//   (2) „ZÄHLE GEZEICHNETE BILDPUNKTE NACH EINER FESTEN WARTEZEIT."
//       Misst die Ladezeit des Browsers, nicht die Animation. Vivien bekam so
//       WebKit als abweichend gemeldet, obwohl dort nichts abwich.
//
// Gültig wurde erst: die ANIMATIONSZEIT SETZEN (`animation.currentTime`) statt
// auf sie zu warten. Damit ist der Messpunkt browserunabhängig.
//
// ══ WAS DIESE DATEI STATTDESSEN MISST — und warum nicht mit Bildpunkten ═════
//
// Vivien hat nach dem Setzen der Zeit gezeichnete Bildpunkte gezählt. Das ist
// gültig, aber als DAUERWÄCHTER schlecht geeignet, und das ist gemessen, nicht
// behauptet: Die Zahl hängt am Bildausschnitt und an der Kantenglättung der
// Engine. In meiner Gegenmessung (390×844, Ausschnitt 390×400 ab Oberkante der
// Zeichnung) lagen die Grundwerte bei t = 0 auf 3.637 (Chromium) / 3.381
// (WebKit) / 3.007 (Firefox) — weil in diesem Ausschnitt auch Text steht.
// Eine Schwelle darauf müsste je Engine UND je Ausschnitt geeicht werden.
// (Das ist keine Korrektur an Viviens Zahlen: Sie hat einen engeren Ausschnitt
// gemessen. Es ist ein Argument gegen das Verfahren als Dauerwächter.)
//
// Gemessen wird deshalb mit `isPointInStroke()`. Das ist die browsereigene
// Antwort auf genau die Frage „ist diese Stelle des Pfades gerade gezeichnet"
// — und sie berücksichtigt das Strichmuster. Nachgemessen bei gesetzter
// Animationszeit, 41 Proben je Pfad, 5 Pfade = 205 Proben:
//
//   Zeit       Abhilfe        Defekt (dasharray:none)
//   t =    0     0 / 205           205 / 205
//   t =  300    51 / 205           205 / 205
//   t =  700   174 / 205           205 / 205
//   t = 1400   205 / 205           205 / 205
//
// In Chromium, WebKit und Firefox auf die Probe genau identisch. Der Defekt
// ist an JEDEM der vier Zeitpunkte von der Abhilfe unterscheidbar, und die
// Zahlen brauchen keine Eichung.
//
// ⚠️ Die Suite läuft in Chromium (ein Projekt in der Config). Die Werte für
// WebKit und Firefox stammen aus einer Messung von Hand am selben Stand; sie
// sind hier Beleg, nicht Zusicherung.

const BASIS = "/";

// Die Animation: 900 ms je Pfad, gestaffelt über --delay bis 400 ms.
// Gemessen wird VOR dem Beginn, mittendrin und nach dem Ende.
const T_ANFANG = 0;
const T_MITTE = 300;
const T_ENDE = 1400;

// Wie viele Punkte je Pfad abgetastet werden. 40 Abschnitte = 41 Proben.
const PROBEN_JE_PFAD = 40;

// Drei Maßstäbe, absichtlich beide Regime: unter 1 (die Höhe treibt) und
// über 1 (die Breite treibt). Gemessen 0,778 · 0,844 · 1,200.
const MASSSTAEBE = [
  [360, 640],
  [768, 1024],
  [1440, 900],
];

/**
 * Setzt die Animationszeit ALLER Zeichenpfade und misst dann, welcher Anteil
 * der Pfade tatsächlich gezeichnet ist.
 *
 * ⚠️ `pause()` vor dem Setzen ist nicht Kosmetik: Ohne sie läuft die Animation
 * zwischen Setzen und Messen weiter, und der Messpunkt wandert. Genau die
 * Sorte Unschärfe, aus der in diesem Projekt schon zweimal ein Fehlalarm
 * geworden ist.
 */
async function beiZeit(page, zeit) {
  return page.evaluate(
    async ({ zeit, proben }) => {
      const pfade = [
        ...document.querySelectorAll(".hero-court [data-court-path]"),
      ];

      let animationen = 0;
      for (const el of pfade) {
        for (const a of el.getAnimations()) {
          a.pause();
          a.currentTime = zeit;
          animationen++;
        }
      }

      // Zwei Bilder abwarten, damit der gesetzte Zustand auch gerechnet ist.
      await new Promise((f) =>
        requestAnimationFrame(() => requestAnimationFrame(f)),
      );

      let treffer = 0;
      let gesamt = 0;
      const ohneMuster = [];
      for (const el of pfade) {
        const laenge = el.getTotalLength();
        if (getComputedStyle(el).strokeDasharray === "none")
          ohneMuster.push(el.tagName);
        for (let i = 0; i <= proben; i++) {
          gesamt++;
          if (el.isPointInStroke(el.getPointAtLength((laenge * i) / proben)))
            treffer++;
        }
      }
      return { pfade: pfade.length, animationen, treffer, gesamt, ohneMuster };
    },
    { zeit, proben: PROBEN_JE_PFAD },
  );
}

/**
 * Ehrlichkeitsschranke für JEDEN zeitgesteuerten Fall dieser Datei.
 *
 * ⚠️ Ohne sie wäre die naheliegende Bauart ein grüner Test über null
 * Messpunkte — das Muster, das CLAUDE.md Roadmap 20f/20h zweimal protokolliert
 * („Nur 7 Schreibvorgänge – die Sonde hat nicht gemessen"). Findet
 * `getAnimations()` nichts, tut das Setzen der Zeit nichts, und alle
 * folgenden Zahlen beschreiben irgendeinen Zustand, nur nicht den geprüften.
 */
function schranke(m) {
  expect(
    m.pfade,
    "Keine Zeichenpfade gefunden – dieser Fall misst nichts",
  ).toBeGreaterThanOrEqual(5);
  expect(
    m.animationen,
    "Nur " +
      m.animationen +
      " Animationen an " +
      m.pfade +
      " Pfaden gefunden. Die Animationszeit ließ sich also gar nicht setzen – " +
      "jede Zahl aus diesem Fall beschreibt einen ungesteuerten Zustand.",
  ).toBeGreaterThanOrEqual(m.pfade);
}

/** Liest Strichmuster, echte Pfadlänge und Maßstab in EINEM Schritt. */
async function musterMessen(page) {
  return page.evaluate(() => {
    const svg = document.querySelector("svg.hero-court");
    if (!svg) throw new Error("Keine Hero-Zeichnung gefunden");
    const ctm = svg.getScreenCTM();
    const massstab = Math.hypot(ctm.a, ctm.b);

    const pfade = [...svg.querySelectorAll("[data-court-path]")].map((el) => {
      const cs = getComputedStyle(el);
      const teile =
        cs.strokeDasharray === "none"
          ? []
          : cs.strokeDasharray.split(",").map((s) => parseFloat(s));
      return {
        tag: el.tagName,
        echt: el.getTotalLength(),
        strich: teile[0] ?? null,
        luecke: teile[1] ?? null,
        vectorEffect: cs.vectorEffect,
      };
    });

    const korb = svg.querySelector("[data-court-korb]");
    return {
      massstab,
      pfade,
      korbVectorEffect: korb ? getComputedStyle(korb).vectorEffect : null,
    };
  });
}

function pfadeVorhanden(m) {
  expect(
    m.pfade.length,
    "Keine Zeichenpfade gefunden – dieser Fall misst nichts",
  ).toBeGreaterThanOrEqual(5);
}

test.beforeEach(async ({ page }) => {
  // Ausdrücklich, nicht implizit: Diese Datei prüft die Bewegung. Liefe sie
  // unter „reduzierte Bewegung", prüfte sie das Gegenteil ihres Gegenstands.
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test.describe("Hero-Einblendung – E1: die Zeichnung zeichnet sich wirklich", () => {
  test("bei t = 0 ist nichts gezeichnet, am Ende alles", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASIS, { waitUntil: "networkidle" });

    const anfang = await beiZeit(page, T_ANFANG);
    schranke(anfang);

    // ⚠️ DIESE ZEILE HÄTTE H1 IM ERSTEN LAUF GEFANGEN. Im Defekt stand
    // stroke-dasharray auf none, also war zum Zeitpunkt 0 bereits ALLES
    // gezeichnet: 205 von 205 statt 0.
    expect(
      anfang.ohneMuster,
      anfang.ohneMuster.length +
        " Pfade tragen kein Strichmuster (stroke-dasharray: none). Dann gibt " +
        "es nichts zu verstecken und nichts einzublenden – die Zeichnung steht " +
        "sofort vollständig da. Genau dieser Zustand war bis d4f9465 gebaut, " +
        "und die Suite war grün.",
    ).toEqual([]);

    expect(
      anfang.treffer,
      "Zum Zeitpunkt 0 sind bereits " +
        anfang.treffer +
        " von " +
        anfang.gesamt +
        " Probepunkten gezeichnet. Die Einblendung findet nicht statt – die " +
        "Zeichnung ist von Anfang an fertig.",
    ).toBe(0);

    const ende = await beiZeit(page, T_ENDE);
    schranke(ende);
    expect(
      ende.treffer,
      "Nach dem Ende der Animation sind nur " +
        ende.treffer +
        " von " +
        ende.gesamt +
        " Probepunkten gezeichnet – die Zeichnung wird nie fertig.",
    ).toBe(ende.gesamt);
  });

  test("mittendrin ist sie halb fertig – nicht leer und nicht voll", async ({
    page,
  }) => {
    // ⚠️ WARUM DIESER FALL NICHT ÜBERFLÜSSIG IST: Anfang und Ende allein
    // ließen sich auch von einem harten Umschalter erfüllen (nichts – nichts –
    // alles). Zugesichert ist aber eine ZEICHNUNG, kein Aufblenden. Der
    // Zwischenwert ist deshalb der eigentliche Gegenstand.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASIS, { waitUntil: "networkidle" });

    const mitte = await beiZeit(page, T_MITTE);
    schranke(mitte);

    // Gemessen 51 von 205 (25 %) in allen drei Engines. Die Schranken sind
    // bewusst weit: Geprüft wird „es ist unterwegs", nicht ein Kurvenverlauf.
    // Eine enge Schwelle wäre hier ein Münzwurf mit Fehlerbericht — die
    // Fehlerklasse, wegen der in Roadmap 20d die 26-von-32-Schwelle gestrichen
    // wurde.
    expect(
      mitte.treffer,
      "Bei t = " +
        T_MITTE +
        " ms ist noch nichts gezeichnet (" +
        mitte.treffer +
        "/" +
        mitte.gesamt +
        ").",
    ).toBeGreaterThan(0);
    expect(
      mitte.treffer,
      "Bei t = " +
        T_MITTE +
        " ms ist bereits alles gezeichnet (" +
        mitte.treffer +
        "/" +
        mitte.gesamt +
        ") – es wird nicht gezeichnet, es wird umgeschaltet.",
    ).toBeLessThan(mitte.gesamt);
  });
});

// ══ E2 bis E4: die drei Wächter aus den gelöschten Dateien ══════════════════
//
// ⚠️ ALLE DREI SIND AM 20.08.2026 MIT `hero-dunk.spec.mjs` bzw.
// `hero-erstes-bild.spec.mjs` GELÖSCHT WORDEN, OBWOHL IHR GEGENSTAND LEBT
// (Befund Kai H3). Die Löschbegründung in `tests/e2e/README.md` war nach
// DATEIEN geordnet — und genau das ist die Stelle, an der ein einzelner Fall
// unter dem Namen eines anderen verschwindet. Dieselbe Lehre steht in
// derselben README schon für `ball-sequenz.spec.mjs`, eine Überschrift höher.
//
// ⚠️ E2 IST DER TEURE: Er hätte H1 im ERSTEN Lauf gefangen.

test.describe("Hero-Einblendung – E2: jede Linie trägt ihre echte Länge", () => {
  // ⚠️ DER GEGENSTAND: Das Strichmuster wird in `HeroCourt.js` ANALYTISCH
  // gerechnet (aus FIBA-Maßen), nicht vom Browser gemessen — die Datei hat
  // bewusst kein JavaScript. Stimmt eine dieser Rechnungen nicht mit der
  // tatsächlichen Pfadlänge überein, ist die Linie entweder zu früh fertig
  // (Muster zu lang, harmlos) oder es fehlt ein Stück am Ende (Muster zu
  // kurz, sichtbar als Lücke). Gemessen liegt das Verhältnis zwischen
  // 1,000 und 1,006.
  //
  // ⚠️ WAS DIESER FALL NICHT SIEHT — und das gehört hierher, weil die
  // naheliegende Erwartung eine andere ist: Er erkennt einen zurückgeholten
  // `vector-effect: non-scaling-stroke` NICHT. Nachgemessen mit je Pfad
  // gesetztem Attribut: Das Verhältnis bleibt auf allen drei Maßstäben exakt
  // 1,0000. Der Grund ist, dass `getComputedStyle` den ANGEGEBENEN px-Wert
  // zurückgibt; dass der Browser ihn danach im Gerätemaß auslegt, steht in
  // keiner Zeichenkette. Wer diesen Fall für einen Wächter gegen
  // `non-scaling-stroke` hält, hat einen, der nie rot wird.
  // Dafür sind E3 (gerenderte Vollständigkeit) und E5 (das Attribut selbst) da.
  // ⚠️ 0,999 UND NICHT 1,0 — das ist Rundungsschlupf, keine Nachgiebigkeit.
  // Der erste Anlauf stand auf 1,0 und wurde rot: Die Grundlinie meldete
  // 0,99999256. `--len` ist auf zwei Nachkommastellen gerundet, und
  // `getTotalLength()` rechnet in Gleitkomma — ein Fehlbetrag von 0,0007 %
  // ist kein fehlendes Stück Linie. Gefangen werden soll ein Verlust in der
  // Größenordnung 16,7 %, nicht das letzte Bit.
  const MIN = 0.999;
  const MAX = 1.05;

  for (const [breite, hoehe] of MASSSTAEBE) {
    test(`${breite}×${hoehe}: Strichmuster deckt jede Pfadlänge`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await musterMessen(page);
      pfadeVorhanden(m);

      for (const p of m.pfade) {
        expect(
          p.strich,
          "Ein " +
            p.tag +
            " hat gar kein Strichmuster (stroke-dasharray: none). Das ist der " +
            "Zustand aus Befund H1: Die Einblendung findet nicht statt, ohne " +
            "dass irgendetwas kaputt aussieht.",
        ).not.toBeNull();

        const verhaeltnis = p.strich / p.echt;
        expect(
          verhaeltnis,
          "Ein " +
            p.tag +
            " ist " +
            p.echt.toFixed(1) +
            " Einheiten lang, sein Strichmuster nur " +
            p.strich.toFixed(1) +
            " – es fehlen " +
            ((1 - verhaeltnis) * 100).toFixed(1) +
            " % der Linie, sichtbar als Lücke am Ende. Die Längen in " +
            "HeroCourt.js (Konstante L) sind gerechnet, nicht gemessen: Wer die " +
            "Geometrie ändert, muss sie nachrechnen.",
        ).toBeGreaterThanOrEqual(MIN);
        expect(
          verhaeltnis,
          "Ein " +
            p.tag +
            " trägt ein Strichmuster von " +
            p.strich.toFixed(1) +
            " bei einer echten Länge von " +
            p.echt.toFixed(1) +
            " – " +
            ((verhaeltnis - 1) * 100).toFixed(1) +
            " % zu lang. Im Bild harmlos, aber die gerechnete Länge stimmt " +
            "nicht mehr mit der Geometrie überein.",
        ).toBeLessThanOrEqual(MAX);
      }
    });
  }
});

test.describe("Hero-Einblendung – E3: die fertige Zeichnung ist auf jedem Maßstab vollständig", () => {
  // ⚠️ DIESER FALL HAT SEINEN MECHANISMUS EINMAL GEWECHSELT, UND DER GRUND
  // GEHÖRT AUFGESCHRIEBEN — er ist der eigentliche Ertrag dieses Wächters.
  //
  // Der erste Anlauf verglich das ANGEGEBENE Strichmuster mit der Pfadlänge
  // und begründete das mit dem Satz „die beiden Währungen sind
  // auseinandergelaufen". Der Satz war richtig, die Messung dazu nicht:
  // Nachgemessen mit je Pfad gesetztem `vector-effect: non-scaling-stroke`
  // blieb das Verhältnis auf allen drei Maßstäben exakt 1,0000. Der Test
  // hätte den Rückfall NIE gefangen und dabei behauptet, genau ihn zu
  // bewachen — eine Zusicherung ohne Deckung, dieselbe Bauart wie der
  // ursprüngliche Befund H1.
  //
  // Gemessen wird deshalb, was der Browser TATSÄCHLICH ZEICHNET: Nach dem
  // Ende der Animation muss jeder Probepunkt jedes Pfades im Strich liegen.
  //
  // ⚠️ UND JETZT DIE ACHSE, DIE DIESEN FALL ÜBERHAUPT ERST TRAGFÄHIG MACHT.
  // Gegenprobe mit zurückgeholtem Attribut, gezeichnete Probepunkte am Ende:
  //
  //     Maßstab 0,778 (360×640)   → 205/205   ← blind, kein Befund
  //     Maßstab 0,844 (768×1024)  → 205/205   ← blind, kein Befund
  //     Maßstab 1,200 (1440×900)  → 171/205   ← rot, 16,6 % fehlen
  //
  // Das ist keine Schwäche der Messung, sondern die Physik der Sache: Unter
  // Maßstab 1 wird das Muster im Gerätemaß LÄNGER als der Pfad, die Linie ist
  // also weiterhin voll gedeckt. Erst über 1 fehlt etwas.
  // FOLGE, UND SIE IST DIE LEHRE: Ein Prüffeld aus lauter Handy-Breiten wäre
  // hier per Konstruktion blind. Der Maßstab über 1 ist kein „auch noch
  // Desktop", er ist der EINZIGE Fall, in dem dieser Defekt existiert —
  // dieselbe Achsen-Lehre wie die fehlende Fensterhöhe in Roadmap 20b.
  // Wer `MASSSTAEBE` kürzt, muss den Eintrag über 1 stehen lassen.

  for (const [breite, hoehe] of MASSSTAEBE) {
    test(`${breite}×${hoehe}: am Ende ist jede Linie vollständig gezeichnet`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });

      const massstab = await page.evaluate(() => {
        const svg = document.querySelector("svg.hero-court");
        if (!svg) throw new Error("Keine Hero-Zeichnung gefunden");
        const ctm = svg.getScreenCTM();
        return Math.hypot(ctm.a, ctm.b);
      });

      // Ehrlichkeitsschranke: Ist die Zeichnung überhaupt im Bild? Ohne sie
      // wäre eine kaputte Viewport-Setzung ein dreifach grünes Ergebnis über
      // denselben Zustand.
      expect(
        massstab,
        "Maßstab 0 – die Zeichnung ist nicht im Bild, hier wird nichts gemessen",
      ).toBeGreaterThan(0.1);

      const ende = await beiZeit(page, T_ENDE);
      schranke(ende);

      expect(
        ende.treffer,
        "Bei Maßstab " +
          massstab.toFixed(3) +
          " sind nach dem Ende der Animation nur " +
          ende.treffer +
          " von " +
          ende.gesamt +
          " Probepunkten gezeichnet – es fehlen " +
          (((ende.gesamt - ende.treffer) / ende.gesamt) * 100).toFixed(1) +
          " % der Zeichnung. Das ist der Fingerabdruck von " +
          "vector-effect: non-scaling-stroke: Das Strichmuster wird im " +
          "Gerätemaß gerechnet, die Pfadlängen in viewBox-Einheiten.",
      ).toBe(ende.gesamt);
    });
  }
});

test.describe("Hero-Einblendung – E4: kein Pfad ist länger als sein Versteck", () => {
  // ⚠️ DER STILLE PUNKTLINIEN-GEIST, in CLAUDE.md Roadmap 20a als „der Befund,
  // den man sich merken muss" protokolliert. Die Lücke des Strichmusters ist
  // das VERSTECK: Solange der Versatz die Linie noch nicht hereingezogen hat,
  // muss die Lücke sie vollständig aufnehmen. Ist die Lücke kürzer als der
  // Pfad, steht ein Rest der Linie DAUERHAFT im Bild — als feine Punktlinie,
  // ohne Konsolenfehler, ohne kaputtes Layout. Es sieht fast richtig aus.
  //
  // `app/globals.css` setzt die Lücke deshalb auf den Pfad plus 2 px und
  // begründet die 2 px dort: Bei exakt gleichen Werten grenzen „gezeichnet"
  // und „nicht gezeichnet" aneinander, und der kleinste Rundungsrest lässt mit
  // runder Strichkappe einen vollen Punkt stehen.

  test("die Lücke nimmt jede Linie vollständig auf", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASIS, { waitUntil: "networkidle" });
    const m = await musterMessen(page);
    pfadeVorhanden(m);

    for (const p of m.pfade) {
      expect(
        p.luecke,
        "Ein " +
          p.tag +
          " hat kein zweiteiliges Strichmuster – ohne Lücke gibt es kein Versteck.",
      ).not.toBeNull();
      expect(
        p.luecke,
        "Bei einem " +
          p.tag +
          " ist die Lücke (" +
          p.luecke.toFixed(1) +
          ") kürzer als die Linie (" +
          p.echt.toFixed(1) +
          "). Ein Rest der Linie steht damit dauerhaft im Bild – der " +
          "Punktlinien-Geist aus Roadmap 20a.",
      ).toBeGreaterThan(p.echt);
    }
  });
});

test.describe("Hero-Einblendung – E5: non-scaling-stroke kommt nicht zurück", () => {
  // ⚠️ ÜBERGABE VIVIEN, 20.08.2026. Das Attribut stand bis dahin auf der
  // <g>-Gruppe, wo es NICHTS tut — vector-effect wird in SVG nicht vererbt.
  // Die Längenrechnung der Einblendung war also nur richtig, WEIL das Attribut
  // wirkungslos war.
  //
  // ⚠️ DAS MACHT DIESEN WÄCHTER ZU EINEM BESONDEREN FALL: Die naheliegende
  // „Aufräumarbeit" ist hier der Defekt. Wer das Attribut korrekt je Pfad
  // setzt, tut etwas, das für sich genommen richtig aussieht — und verliert
  // bei Maßstab 1,2 still 16,7 % jeder Linie. Es gibt keine Fehlermeldung und
  // keinen Konsoleneintrag; man sieht eine Lücke am Ende jedes Strichs und
  // hält sie für Gestaltung.
  //
  // Entfernt ist es seit `d4f9465` auch am RING — Entscheidung Vivien: Eine
  // Feldlinie ist Teil des gezeichneten Gegenstands, keine Kante der
  // Oberfläche. Trüge der Ring es als Einziger, wanderte sein Gewicht
  // gegenüber den Linien mit der Bildschirmgröße (2 : 1 → 1,7 : 1).
  //
  // ⚠️ GEPRÜFT WIRD DER BERECHNETE WERT, NICHT DER QUELLTEXT. Ein Quelltext-
  // Test sähe nur das Attribut im Markup und wäre blind dafür, dass die
  // Eigenschaft auch aus dem Stylesheet kommen kann.

  for (const [breite, hoehe] of MASSSTAEBE) {
    test(`${breite}×${hoehe}: kein Element der Zeichnung hält die Strichbreite fest`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await musterMessen(page);
      pfadeVorhanden(m);

      expect(
        m.korbVectorEffect,
        "Kein Ring gefunden – dieser Fall misst nur die halbe Zeichnung",
      ).not.toBeNull();

      for (const p of m.pfade) {
        expect(
          p.vectorEffect,
          "Ein " +
            p.tag +
            " trägt vector-effect: " +
            p.vectorEffect +
            ". Damit gilt das Strichmuster im Gerätemaß, die gerechneten Längen " +
            "aber in viewBox-Einheiten – bei Maßstab 1,2 fehlen 16,7 % jeder " +
            "Linie, still. Das Attribut ist am 20.08.2026 bewusst entfernt worden.",
        ).toBe("none");
      }

      expect(
        m.korbVectorEffect,
        "Der Ring trägt vector-effect: " +
          m.korbVectorEffect +
          ". Dann skaliert ein Element der Zeichnung mit und das andere nicht – " +
          "das Gewicht Ring zu Linie wandert mit der Bildschirmgröße.",
      ).toBe("none");
    });
  }
});
