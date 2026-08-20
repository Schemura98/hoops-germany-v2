import { test, expect } from "@playwright/test";

// ══ DER HERO ALS STANDBILD ══════════════════════════════════════════════════
//
// Ersetzt `hero-dunk.spec.mjs` und `hero-erstes-bild.spec.mjs` (beide am
// 20.08.2026 entfallen). Deren Gegenstand — scroll-gesteuerte Choreografie,
// fallender Ball, zwei Fassungen je Seitenverhältnis — existiert nicht mehr.
// Was ÜBERNOMMEN ist, sind die zwei Zusicherungen, die den Gegenstand
// überlebt haben: der Kontrastfall und das rohe Server-Blatt.
//
// ⚠️ DIE ERSTE PRÜFUNG IST DIE WICHTIGE, UND SIE IST NEU.
// Patrick hat am 20.08.2026 den ganzen Hero zurückgenommen. Sein erster Satz
// war nicht „die Animation ruckelt", sondern dass es nicht gut aussieht — und
// der schwerste Einzelbefund war: zwischen Navigationsleiste und Überschrift
// lagen rund 215 px LEERE Fläche, während Überschrift und Taste ins untere
// Drittel gedrückt waren.
//
// **Keiner der damals grünen Tests konnte das sehen.** Sie haben Kontraste auf
// zwei Nachkommastellen, Ballpositionen, Deckkräfte und neun Viewports
// gemessen — aber keiner hat gefragt, ob das erste Bild oben etwas ZEIGT.
// Es wurde gemessen statt angesehen. Diese Datei schließt genau diese Lücke,
// und sie tut es so, dass die Regel eine Umgestaltung überlebt: Sie schreibt
// nicht vor, WAS oben steht, sondern nur, dass dort nicht nichts ist.

const BASIS = "/";

// Reale Geräte, absichtlich mit HÖHENACHSE. Ein Prüffeld aus reinen Breiten
// hat in diesem Projekt schon vier Gate-Runden gekostet (CLAUDE.md Roadmap
// 20b: „Breiten geprüft, der Ausfall hing an der Fensterhöhe").
const FENSTER = [
  [360, 640], // kleines Android, kurzes Fenster
  [360, 740], // verbreitetste Android-Breite Deutschlands
  [390, 844], // iPhone
  [430, 932], // iPhone Max
  [768, 1024], // iPad hochkant
  [1024, 768], // iPad quer — Querformat mit wenig Höhe
  [1440, 900], // Notebook
];

// Wo das klebende Seitengerüst aufhört. GEMESSEN, nicht aus Konstanten
// geschlossen: Über der Bühne stehen Testphase-Band UND Navigationsleiste,
// und genau diese Summe falsch anzunehmen war die Ursache des Befunds
// (die alte Bühne zog 64 px ab, wo 109 abzuziehen waren).
async function messen(page) {
  return page.evaluate(() => {
    const buehne = document.querySelector("[data-hero-stage]");
    if (!buehne) throw new Error("Keine Hero-Bühne gefunden");
    const nav = document.querySelector("nav") || document.querySelector("header");
    if (!nav) throw new Error("Kein Seitengerüst gefunden");
    const chromeUnten = nav.getBoundingClientRect().bottom;

    const h1 = buehne.querySelector("h1");
    const korb = buehne.querySelector("[data-court-korb]");
    const linien = [...buehne.querySelectorAll("[data-court-path]")];
    if (!h1 || !korb || linien.length === 0) {
      throw new Error("Hero unvollständig – dieser Test misst dann nichts");
    }

    // Oberste sichtbare „Tinte" der Bühne: die höchstliegende Kante von
    // Zeichnung ODER Text. Bewusst beides — die Regel lautet „oben ist etwas",
    // nicht „oben ist eine Linie".
    const tinte = [...linien, korb, h1]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height >= 0)
      .map((r) => r.top);

    const kb = korb.getBoundingClientRect();
    return {
      chromeUnten,
      sichtbar: window.innerHeight - chromeUnten,
      ersteTinte: Math.min(...tinte),
      h1Oben: h1.getBoundingClientRect().top,
      korb: { top: kb.top, bottom: kb.bottom, left: kb.left, right: kb.right },
      fensterBreite: window.innerWidth,
      dokumentBreite: document.documentElement.scrollWidth,
    };
  });
}

test.describe("Hero-Standbild – P1: das erste Bild ist oben nicht leer", () => {
  // Der Schwellenwert ist ein VERHÄLTNIS, keine Pixelzahl — sonst gilt er nur
  // für die Gerätehöhe, an der er entstanden ist. 12 % der sichtbaren Höhe ist
  // ein bewusst großzügiger Rand: gemessen liegt der Wert auf allen sieben
  // Fenstern zwischen 6 und 7 %. Der beanstandete Zustand lag bei 40 %.
  const MAX_LEER = 0.12;

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: höchstens ${MAX_LEER * 100} % leerer Rand über dem Inhalt`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);

      // Ehrlichkeitsschranke: Ist die Bühne gar nicht im Bild, misst der Test
      // nichts und wäre trotzdem grün. (Fehlerklasse Kai/Tobias, CLAUDE.md
      // Roadmap 20f/20h: „ein grüner Test mit null Messframes".)
      expect(
        m.sichtbar,
        "Unter dem Seitengerüst ist nichts sichtbar – hier wird nichts gemessen",
      ).toBeGreaterThan(200);

      const leer = m.ersteTinte - m.chromeUnten;
      const anteil = leer / m.sichtbar;
      expect(
        anteil,
        `Über dem ersten sichtbaren Element liegen ${leer.toFixed(0)} px ` +
          `(${(anteil * 100).toFixed(1)} % der sichtbaren Höhe) leere Fläche. ` +
          `Genau das war Patricks Befund vom 20.08.2026.`,
      ).toBeLessThan(MAX_LEER);
    });
  }
});

test.describe("Hero-Standbild – P2: der Korb berührt keinen Buchstaben", () => {
  // ⚠️ DER EINZIGE KONTRASTFALL, DEN DIESE ZEICHNUNG NOCH KENNT.
  // Gerechnet gegen die tatsächlich gebauten Farben:
  //   · weißer Text (#F5F7FA) auf der Korb-Farbe (#F07A27) → 2,59 : 1 → AA gerissen
  //   · weißer Text auf einer Feldlinie (#3A4E7A)          → 7,52 : 1 → unbedenklich
  //   · Kleinzeile (#E6EAF2) auf einer Feldlinie           → 6,72 : 1 → unbedenklich
  // Deshalb prüft dieser Block GEOMETRIE statt Kontrast: Die kühlen Linien
  // dürfen jede Zeile kreuzen, der orange Korb darf es nicht. Das ist der
  // ganze Ersatz für die Abdunkelungs-Mechanik des Vorgängers.
  const MIN_ABSTAND = 16;

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: mindestens ${MIN_ABSTAND} px zwischen Korb und Überschrift`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);

      const abstand = m.h1Oben - m.korb.bottom;
      expect(
        abstand,
        `Der Korb endet bei y=${m.korb.bottom.toFixed(0)}, die Überschrift ` +
          `beginnt bei y=${m.h1Oben.toFixed(0)} – Abstand ${abstand.toFixed(0)} px. ` +
          `Bei Überlappung steht weißer Text auf #F07A27 (2,59 : 1).`,
      ).toBeGreaterThanOrEqual(MIN_ABSTAND);
    });
  }
});

test.describe("Hero-Standbild – P3: Rahmenbedingungen", () => {
  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: Korb vollständig im Bild, kein Querscrollen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);

      // Der Korb ist das eine bedeutungstragende Zeichen. Die LINIEN dürfen
      // angeschnitten werden – das ist bei einer Spielfeld-Markierung der
      // Normalfall und ausdrücklich gewollt. Der Korb darf es nicht: Ein
      // halber Ring am Bildrand war einer der drei Befunde vom 20.08.
      expect(m.korb.top, "Korb ragt hinter das Seitengerüst").toBeGreaterThanOrEqual(
        m.chromeUnten - 1,
      );
      expect(m.korb.left, "Korb links angeschnitten").toBeGreaterThanOrEqual(0);
      expect(m.korb.right, "Korb rechts angeschnitten").toBeLessThanOrEqual(
        m.fensterBreite,
      );

      expect(
        m.dokumentBreite,
        "Die Seite scrollt waagerecht – die Zeichnung ragt aus dem Dokument",
      ).toBeLessThanOrEqual(m.fensterBreite + 1);
    });
  }
});

test.describe("Hero-Standbild – P4: der Grundzustand ist die fertige Zeichnung", () => {
  // ⚠️ ÜBERNOMMEN AUS `hero-erstes-bild.spec.mjs`, weil der Befund dahinter
  // (Kai K1, `d841c4b`) nicht am Motiv hing, sondern am Vorgehen: Der Server
  // lieferte einen Zustand aus, den das JavaScript danach zurücknahm.
  // Die neue Fassung kann das per Konstruktion nicht mehr — die gesamte
  // Animation steht in einer `prefers-reduced-motion: no-preference`-Klammer,
  // das ausgelieferte Blatt trägt also KEIN Strichmuster. Genau das wird hier
  // nachgehalten, denn „kann nicht passieren" gilt nur, solange es jemand prüft.

  test("das rohe Server-Blatt enthält die Zeichnung und kein Versteck", async ({
    request,
  }) => {
    const r = await request.get(BASIS);
    expect(r.ok(), "Startseite nicht erreichbar").toBeTruthy();
    const html = await r.text();
    expect(
      html.length,
      "Die Startseite liefert fast nichts – dieser Test misst dann nichts",
    ).toBeGreaterThan(20000);

    expect(html, "Die Zeichnung fehlt im ausgelieferten Blatt").toContain(
      "data-court-korb",
    );
    expect(
      (html.match(/data-court-path/g) || []).length,
      "Zu wenige Feldlinien im ausgelieferten Blatt",
    ).toBeGreaterThanOrEqual(5);

    // `stroke-dasharray` gehört ausschließlich ins Stylesheet. Steht es am
    // Element, ist die Zeichnung beim Ausliefern versteckt – und wer kein CSS
    // bekommt, sieht sie nie.
    //
    // ⚠️ GEPRÜFT WIRD JE ELEMENT, NICHT IM GANZEN BLATT — und das ist eine
    // Korrektur am Test, nicht am Code. Der erste Anlauf suchte die
    // Zeichenkette im gesamten HTML und wurde rot: Der Treffer stand in
    // `data-spur="desktop"` aus der Feature-Strecke, einem Element, das mit
    // dem Hero nichts zu tun hat. Ein Test, der über seinen Gegenstand
    // hinausgreift, meldet fremde Befunde als eigene — hier harmlos, weil er
    // rot wurde; bei umgekehrtem Vorzeichen wäre er still falsch grün.
    const courtTags = html.match(/<(?:path|circle)\b[^>]*data-court-[^>]*>/g) || [];
    expect(
      courtTags.length,
      "Keine Zeichnungs-Elemente im Blatt – dieser Test misst dann nichts",
    ).toBeGreaterThanOrEqual(6);
    for (const tag of courtTags) {
      expect(
        /stroke-?[dD]asharray/.test(tag),
        `Ein Zeichnungs-Element kommt mit Strichmuster beim Nutzer an: ${tag.slice(0, 120)}`,
      ).toBeFalsy();
    }
  });

  test("bei reduzierter Bewegung steht die Zeichnung sofort und vollständig", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASIS, { waitUntil: "domcontentloaded" });

    const zustand = await page.evaluate(() => {
      const els = [
        ...document.querySelectorAll("[data-court-path], [data-court-korb]"),
      ];
      return els.map((el) => {
        const cs = getComputedStyle(el);
        return {
          dash: cs.strokeDasharray,
          name: cs.animationName,
          deckkraft: cs.opacity,
        };
      });
    });

    expect(zustand.length, "Keine Zeichnung gefunden").toBeGreaterThanOrEqual(6);
    for (const z of zustand) {
      expect(
        z.name,
        "Bei reduzierter Bewegung läuft trotzdem eine Animation",
      ).toBe("none");
      expect(
        z.dash === "none" || z.dash === "",
        `Strichmuster ${z.dash} versteckt die Zeichnung bei reduzierter Bewegung`,
      ).toBeTruthy();
      expect(Number(z.deckkraft)).toBe(1);
    }
  });
});
