import { test, expect } from "@playwright/test";

// ══ DIE MOBILE RUHEPUNKT-DIAGNOSE — BEIDE RICHTUNGEN ════════════════════════
//
// Bewacht die Breakpoint-Schranke aus `75f2c3a` (`mobileLeisteSichtbar`).
// Vorgeschichte in zwei Schritten, und beide gehören zum Prüfmaß:
//
//   1. Der Rückfall des mobilen Ruhepunkts meldete sich nach 30 vergeblichen
//      Bildern per `console.error` — richtig gedacht, aber ohne Schranke. Weil
//      `goalMobileRef` in `xl:hidden` liegt und ab 1280 Breite 0 hat, feuerte
//      die Meldung auf JEDEM Desktop-Besuch: gemessen 13/12/10 auf
//      1280/1440/1920, mit einer Aussage („Der Ball wird neben dem Korb
//      abgelegt"), die dort falsch war — der Desktop-Zweig platziert korrekt.
//   2. Die Schranke behob das. Und erzeugte damit das eigentliche Prüfproblem.
//
// ⚠️ WARUM DIESER TEST SABOTIERT, STATT NUR AUF EINE SAUBERE KONSOLE ZU SEHEN.
// Das ist der ganze Punkt. Eine reine Sauberkeitsprüfung („keine Rail-Fehler")
// wäre grün — bei einer richtigen Schranke, bei einer zu weiten Schranke, die
// den mobilen Fall miterschlägt, UND bei einer Diagnose, die man ersatzlos
// gelöscht hat. Drei sehr verschiedene Zustände, ein Messwert.
// Patricks Satz dazu, der in docs/MUSTER-ZAHLEN-DIE-LUEGEN gehört:
//
//   Eine Diagnose, die überall schweigt, ist von einer richtigen nicht zu
//   unterscheiden — man muss sie zum Sprechen bringen.
//
// Deshalb zwingt der Test das mobile Emblem auf Größe 0 und verlangt, dass die
// Meldung dann kommt — aber nur dort, wo der mobile Zweig überhaupt läuft.
//
// ⚠️ DIE SCHRANKE IST DIE ANZEIGE, NICHT EINE BREITE. Der Code fragt
// `trackRect.width > 0`, nicht `innerWidth < 1280`. Der Test tut dasselbe: Er
// liest die gemessene Balkenbreite und leitet die Erwartung daraus ab, statt
// 1280 ein zweites Mal festzuschreiben. Sonst müsste bei einem Breakpoint-
// Wechsel an zwei Stellen nachgezogen werden — und die zweite vergisst man.

const VIEWPORTS = [
  [375, 812, "mobiler Balken"],
  [768, 1024, "Tablet"],
  [1024, 768, "knapp unter xl"],
  [1280, 800, "genau xl"],
  [1440, 900, "Desktop"],
];

// ⚠️ DER FILTER MUSS DAS PRÄFIX TREFFEN, NICHT DEN KOMPONENTENNAMEN.
// Mein erster Entwurf zählte jede Konsolenzeile mit „FeatureProgressRail" – und
// wurde dadurch bei 1280 und 1440 rot, wo er grün sein musste. Der Grund war
// nicht das Produkt, sondern der Test: React meldet im Dev-Modus
//   Warning: Prop `%s` did not match. Server: … Client: … at svg at HoopEmblem …
// also eine HYDRATION-Warnung, deren Komponentenstack den Namen enthält. Sie
// entstand durch die Sabotage selbst.
// Zwei Konsequenzen, beide hier umgesetzt: exakt auf das Meldungs-Präfix
// filtern, und die Sabotage ERST NACH der Hydration anwenden – dann gibt es
// die Warnung gar nicht.
const DIAGNOSE_PRAEFIX = "[FeatureProgressRail] Das mobile Korb-Emblem";

// Zwingt NUR das mobile Korb-Emblem auf Größe 0 – das im `xl:hidden`-Balken.
// Wirkt auch auf später eingefügte Knoten.
const SABOTAGE = () => {
  const wirken = () => {
    const ziele = [
      ...document.querySelectorAll('[title="Ziel: Nachspielzeit"]'),
    ].filter((e) => e.closest(".xl\\:hidden"));
    for (const e of ziele) {
      e.style.width = "0px";
      e.style.height = "0px";
      e.style.overflow = "hidden";
      for (const s of e.querySelectorAll("svg")) {
        s.style.width = "0px";
        s.style.height = "0px";
      }
    }
    return ziele.length;
  };
  window.__sabotiert = wirken();
  new MutationObserver(() => {
    window.__sabotiert = wirken();
  }).observe(document.body, { childList: true, subtree: true });
};

async function bisZurAnkunftScrollen(page) {
  await page.evaluate(async () => {
    const bild = () =>
      new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));
    const H = document.body.scrollHeight;
    for (let a = 0.35; a <= 1.0001; a += 0.02) {
      window.scrollTo(0, Math.round(H * a));
      await bild();
    }
  });
  await page.waitForTimeout(1500); // 30 Rückfall-Bilder + Ankunfts-Animation
}

async function messen(page, breite, hoehe, sabotieren) {
  await page.setViewportSize({ width: breite, height: hoehe });
  const fehler = [];
  page.on("console", (m) => {
    if (m.type() === "error") fehler.push(m.text());
  });
  await page.goto("/", { waitUntil: "load" });
  // Nach der Hydration sabotieren, nicht davor – sonst erzeugt der Test selbst
  // eine React-Hydration-Warnung (s. Kommentar an DIAGNOSE_PRAEFIX). Die
  // Ankunft liegt ohnehin erst am Ende der Feature-Strecke.
  if (sabotieren) await page.evaluate(SABOTAGE);
  await bisZurAnkunftScrollen(page);
  const zustand = await page.evaluate(() => {
    const emblem = document.querySelector(
      '.xl\\:hidden [title="Ziel: Nachspielzeit"]',
    );
    const balken = emblem?.parentElement;
    return {
      gefunden: !!emblem,
      emblemBreite: emblem
        ? Math.round(emblem.getBoundingClientRect().width)
        : -1,
      balkenBreite: balken
        ? Math.round(balken.getBoundingClientRect().width)
        : -1,
      sabotiert: window.__sabotiert ?? 0,
    };
  });
  return {
    ...zustand,
    railFehler: fehler.filter((f) => f.includes(DIAGNOSE_PRAEFIX)).length,
    // Zur Diagnose der Diagnose: alles, was nur den Komponentennamen trägt.
    rahmenRauschen: fehler.filter(
      (f) => f.includes("FeatureProgressRail") && !f.includes(DIAGNOSE_PRAEFIX),
    ).length,
  };
}

test.describe("Mobile Ruhepunkt-Diagnose", () => {
  for (const [breite, hoehe, wie] of VIEWPORTS) {
    test(`${breite}x${hoehe} (${wie}): im Normalfall schweigt sie`, async ({
      page,
    }) => {
      const m = await messen(page, breite, hoehe, false);

      // Eine Messung, die das Emblem nicht findet, ist bedeutungslos – nicht grün.
      expect(
        m.gefunden,
        "Das mobile Korb-Emblem wurde im DOM nicht gefunden. Der Selektor " +
          "passt nicht mehr; dieser Test misst dann nichts.",
      ).toBe(true);

      expect(
        m.railFehler,
        `${m.railFehler} Rail-Fehlermeldung(en) im Normalbetrieb ` +
          `(Balken ${m.balkenBreite}px, Emblem ${m.emblemBreite}px). Vor der ` +
          `Schranke waren es 13/12/10 auf 1280/1440/1920 – eine Diagnose, die ` +
          `einen Defekt behauptet, den es nicht gibt.`,
      ).toBe(0);
    });

    test(`${breite}x${hoehe} (${wie}): sabotiert spricht sie – aber nur in ihrem Zweig`, async ({
      page,
    }) => {
      const m = await messen(page, breite, hoehe, true);

      expect(m.gefunden, "Mobiles Korb-Emblem nicht gefunden").toBe(true);
      // Die Sabotage muss nachweislich gewirkt haben, sonst prüft der Test den
      // Normalfall ein zweites Mal und meldet ihn als Erfolg.
      expect(
        m.sabotiert,
        "Die Sabotage hat kein Element erwischt – der Selektor greift nicht " +
          "mehr. Ein grünes Ergebnis hieße hier nichts.",
      ).toBeGreaterThan(0);
      expect(
        m.emblemBreite,
        `Das Emblem ist trotz Sabotage ${m.emblemBreite}px breit.`,
      ).toBe(0);

      // Die Erwartung folgt der ANZEIGE, nicht der Fensterbreite – genau wie
      // die Schranke im Code (`trackRect.width > 0`).
      if (m.balkenBreite > 0) {
        expect(
          m.railFehler,
          `Der mobile Balken ist ${m.balkenBreite}px breit, sein Emblem hat ` +
            `Größe 0 – und die Diagnose schweigt. Entweder ist sie abgeschaltet, ` +
            `oder die Schranke erschlägt den mobilen Fall mit. Beides sieht im ` +
            `Normalbetrieb aus wie eine saubere Konsole.`,
        ).toBeGreaterThan(0);
      } else {
        expect(
          m.railFehler,
          `Der mobile Balken ist ausgeblendet (Breite ${m.balkenBreite}px), ` +
            `hier platziert der Desktop-Zweig – trotzdem kommen ` +
            `${m.railFehler} Meldung(en) über den mobilen Ruhepunkt.`,
        ).toBe(0);
      }
    });
  }
});
