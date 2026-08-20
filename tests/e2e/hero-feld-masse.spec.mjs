import { test, expect } from "@playwright/test";

// ══ IST DAS FELD RICHTIG VERMESSEN? ═════════════════════════════════════════
//
// Angelegt am 20.08.2026. Der Anlass ist ein Fehler, der einen kompletten Build
// und ein Gate ueberlebt hat und trotzdem JEDEM Basketballspieler in einer
// halben Sekunde aufgefallen waere:
//
//   Die Dreipunkt-Geraden standen auf ± 3,30 m statt ± 6,60 m von der Mitte.
//   Der Code las „6,60 m" als ABSTAND DER BEIDEN LINIEN ZUEINANDER; die Regel
//   meint 0,90 m innerhalb der Seitenlinie eines 15 m breiten Feldes, also
//   6,60 m JE SEITE. Radius als Durchmesser gelesen — in diesem Projekt die
//   dritte Auflage derselben Fehlerklasse.
//
// ⚠️ WARUM ES NIEMAND GEMERKT HAT: Die Datei trug den Kommentar „aus echten
// FIBA-Massen gerechnet", und alle Zahlen darunter SAHEN gerechnet aus
// (`(6.6 / 2) * M`). Es gab keinen Test, der die Zeichnung je gegen das
// Regelwerk gehalten hat — geprueft wurden Abstaende zum Text, Ueberlauf und
// Kontrast, also alles ausser der Sache selbst.
//
// ══ WARUM DIESER TEST IN VERHAELTNISSEN MISST, NICHT IN PIXELN ══════════════
//
// Jede absolute Zahl haette hier eine Einheit, und die Einheit ist frei
// gewaehlt: Der Massstab (Einheiten je Meter), die viewBox, die Zeichnungshoehe
// und der Beschnitt duerfen sich jederzeit aendern — das sind
// GESTALTUNGSentscheidungen. Was sich NICHT aendern darf, ist die FORM.
//
// Ein Verhaeltnis zweier Strecken derselben Zeichnung ist von alldem
// unabhaengig. Wer den Massstab aendert, laesst diesen Test gruen; wer ein Mass
// falsch eintraegt, macht ihn rot. Genau das ist gewollt.
// (Dieselbe Ueberlegung wie in CLAUDE.md Roadmap 20b: nicht in einer Einheit
// spezifizieren, die niemand steuert.)
//
// ══ QUELLE ALLER SOLLWERTE ══════════════════════════════════════════════════
// FIBA, Official Basketball Rules 2026 (gueltig ab Juli 2026):
//   Rule 2.1    Feld 28 m × 15 m            → Seitenlinie bei ± 7,50 m
//   Rule 2.5.3  Zone: Aussenkante 2,45 m von der Mitte, Freiwurflinie 5,80 m
//   Rule 2.5.4  Dreipunkt: Gerade 0,90 m innerhalb der Seitenlinie (⇒ 6,60 m),
//               Bogen r = 6,75 m um einen Punkt 1,575 m vor der Grundlinie
//   Rule 2.5.7  Ladezone r = 1,30 m, Schenkel 0,375 m, Ende 1,20 m
//   Diagram 3   Aufstellungsmarken bei 1,75 / 2,60 / 3,00 / 3,85 / 4,70 m
// Die Werte sind gegen die Ausgabe 2024 gegengelesen und dort identisch.

const SOLL = {
  ZONE_HALB: 2.45,
  ZONE_TIEF: 5.8,
  HALB_BREIT: 7.5,
  DREI_X: 6.6,
  DREI_R: 6.75,
  KORB_TIEF: 1.575,
  KORB_D: 0.45,
  BRETT_B: 1.8,
  BRETT_TIEF: 1.2,
  LADE_R: 1.3,
  MARKEN: [1.75, 2.6, 3.0, 3.85, 4.7],
};

// 0,6 % Toleranz. Sie deckt Rundung auf zwei Nachkommastellen im Pfad-`d` ab
// und sonst nichts: Der Fehler, um dessentwillen diese Datei existiert, war
// ein Faktor 2 — er braucht keine grosszuegige Schranke, und eine grosszuegige
// Schranke wuerde den naechsten, kleineren Fehler durchlassen.
const TOL = 0.006;

function nah(expect, ist, soll, was) {
  expect(
    Math.abs(ist - soll) / soll,
    `${was}: gemessen ${ist.toFixed(4)}, erwartet ${soll.toFixed(4)} ` +
      `(Abweichung ${(((ist - soll) / soll) * 100).toFixed(2)} %). ` +
      `Die Zeichnung stimmt nicht mehr mit dem FIBA-Regelwerk ueberein.`,
  ).toBeLessThan(TOL);
}

async function felder(page) {
  return page.evaluate(() => {
    const svg = document.querySelector(".hero-court");
    if (!svg) throw new Error("Keine Hero-Zeichnung gefunden");
    const hol = (name) => {
      const el = svg.querySelector(`[data-court="${name}"]`);
      if (!el) throw new Error(`Element [data-court="${name}"] fehlt`);
      const b = el.getBBox(); // ohne Strichbreite — genau das wollen wir
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const marken = [...svg.querySelectorAll('[data-court="marke"]')].map((el) => ({
      tiefe: Number(el.getAttribute("data-court-tiefe")),
      y: el.getBBox().y,
      x: el.getBBox().x,
      w: el.getBBox().width,
    }));
    return {
      grund: hol("grund"),
      zone: hol("zone"),
      seiten: hol("seiten"),
      drei: hol("drei"),
      brett: hol("brett"),
      lade: hol("lade"),
      korb: (() => {
        const b = svg.querySelector("[data-court-korb]").getBBox();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      })(),
      marken,
    };
  });
}

test.describe("Hero-Zeichnung – die Masse stimmen mit dem FIBA-Regelwerk", () => {
  test("Grundform: Zone, Dreipunktlinie, Seitenlinien", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const f = await felder(page);

    // Alles wird an der Zonen-HALBBREITE gemessen (2,45 m) — sie ist die
    // Strecke, die in dieser Zeichnung am sichersten stimmt, weil die Zone
    // sichtbar ueber der Ueberschrift steht.
    const einheit = f.zone.w / 2; // entspricht 2,45 m

    // Ehrlichkeitsschranke: Ohne sie waeren alle Verhaeltnisse 0/0 = NaN und
    // `Math.abs(NaN) < TOL` ist false — der Test waere rot, aber aus dem
    // falschen Grund. Mit ihr steht die Ursache in der Meldung.
    expect(einheit, "Die Zone hat keine Breite – hier wird nichts gemessen").toBeGreaterThan(1);

    nah(expect, f.zone.h / einheit, SOLL.ZONE_TIEF / SOLL.ZONE_HALB, "Zonentiefe / Zonenhalbbreite");
    nah(expect, f.drei.w / 2 / einheit, SOLL.DREI_X / SOLL.ZONE_HALB, "Dreipunkt-Gerade / Zonenhalbbreite");
    nah(expect, f.seiten.w / 2 / einheit, SOLL.HALB_BREIT / SOLL.ZONE_HALB, "Seitenlinie / Zonenhalbbreite");

    // Der Bogenscheitel liegt 1,575 + 6,75 m vor der Grundlinie. Das prueft
    // Radius UND Lage des Mittelpunkts in einer Zahl — ein falscher Radius bei
    // richtiger Gerade faellt hier auf, und umgekehrt.
    nah(
      expect,
      f.drei.h / einheit,
      (SOLL.KORB_TIEF + SOLL.DREI_R) / SOLL.ZONE_HALB,
      "Bogenscheitel ab Grundlinie / Zonenhalbbreite",
    );

    // Zone und Dreipunktlinie beginnen beide AUF der Grundlinie.
    expect(Math.abs(f.zone.y - f.grund.y), "Zone startet nicht auf der Grundlinie").toBeLessThan(1);
    expect(Math.abs(f.drei.y - f.grund.y), "Dreipunktlinie startet nicht auf der Grundlinie").toBeLessThan(1);
  });

  test("Korbbereich: Ring, Brett, Ladezone", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const f = await felder(page);
    const ring = f.korb.w; // 0,45 m

    expect(ring, "Der Ring hat keine Breite – hier wird nichts gemessen").toBeGreaterThan(1);

    nah(expect, f.lade.w / ring, (2 * SOLL.LADE_R) / SOLL.KORB_D, "Ladezonen-Breite / Ringdurchmesser");
    nah(expect, f.brett.w / ring, SOLL.BRETT_B / SOLL.KORB_D, "Brettbreite / Ringdurchmesser");

    // Korbmitte 1,575 m, Brett 1,20 m vor der Grundlinie — die Staffelung
    // Grundlinie → Brett → Ring, die Patrick ausdruecklich benannt hat.
    const einheit = f.zone.w / 2;
    const korbMitte = f.korb.y + f.korb.h / 2;
    nah(expect, (korbMitte - f.grund.y) / einheit, SOLL.KORB_TIEF / SOLL.ZONE_HALB, "Korbmitte ab Grundlinie");
    nah(expect, (f.brett.y - f.grund.y) / einheit, SOLL.BRETT_TIEF / SOLL.ZONE_HALB, "Brett ab Grundlinie");

    // Das Brett liegt VOR dem Ring, der Ring VOR dem Bogenscheitel der
    // Ladezone. Reihenfolge statt Zahl — sie ueberlebt jede Massstabsaenderung.
    expect(f.brett.y, "Das Brett liegt nicht vor dem Ring").toBeLessThan(korbMitte);
    expect(korbMitte, "Der Ring liegt nicht vor der Ladezone").toBeLessThan(f.lade.y + f.lade.h);
  });

  test("Freiwurf-Aufstellung: die Marken sitzen auf ihren Massen", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const f = await felder(page);
    const einheit = f.zone.w / 2;

    // Fuenf je Seite, zehn insgesamt. Die Zahl selbst ist die Zusicherung:
    // Wer eine wegkuerzt, aendert das charakteristische Muster.
    expect(f.marken.length, "Es sind nicht zehn Aufstellungsmarken").toBe(10);

    for (const soll of SOLL.MARKEN) {
      const treffer = f.marken.filter((mk) => mk.tiefe === soll);
      expect(treffer.length, `Zur Marke ${soll} m fehlt eine Seite`).toBe(2);
      for (const mk of treffer) {
        nah(expect, (mk.y - f.grund.y) / einheit, soll / SOLL.ZONE_HALB, `Marke ${soll} m ab Grundlinie`);
      }
    }

    // Sie stehen AUSSERHALB der Zone – innen laegen sie im Spielfeld.
    const zoneLinks = f.zone.x;
    const zoneRechts = f.zone.x + f.zone.w;
    for (const mk of f.marken) {
      const mitte = mk.x + mk.w / 2;
      const draussen = mitte < zoneLinks + 0.5 || mitte > zoneRechts - 0.5;
      expect(draussen, `Eine Marke bei ${mk.tiefe} m liegt innerhalb der Zone`).toBe(true);
    }
  });
});
