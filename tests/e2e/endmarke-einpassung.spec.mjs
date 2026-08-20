import { test, expect } from "@playwright/test";

// ══ DIE ENDMARKE DER FORTSCHRITTS-LEISTE RAGT NICHT IN DIE NAVIGATION ═══════
//
// Anlass: Kais Befund N4 — Tobias hatte gemeldet, dass die Endmarke am Ende
// der mobilen Fortschritts-Leiste in die Navigationsleiste hineinragt. Sie
// wurde daraufhin auf 28x20 px verkleinert, und danach hat **kein einziger
// Test diese Einpassung bewacht**. Wer die Marke wieder vergroessert, holt
// Tobias' Befund zurueck — und bekommt dabei eine gruene Suite.
//
// ⚠️ WARUM DAS EINE ECHTE LUECKE WAR UND KEINE FORMSACHE: Der Platz ist
// gemessen **4 px** (20.08.2026, auf 360/375/390/430/768 identisch — die
// Leiste haftet bei `top-16`, die Navigationsleiste endet bei 65). Vier Pixel
// sind kein Spielraum, das ist ein Rundungsfehler. Jede Vergroesserung der
// Marke, jede zusaetzliche Zeile Innenabstand und jede geaenderte Navbar-Hoehe
// verbraucht ihn sofort und lautlos.
//
// ⚠️ UND WARUM DIESE DATEI IM HAFTENDEN ZUSTAND MISST. Ungescrollt steht die
// Leiste irgendwo mitten im Dokument und hat beliebig viel Luft nach oben —
// dort ist JEDE Groesse unauffaellig. Der Defekt existiert nur, WENN die
// Leiste haftet. Ein Test, der ohne Scrollen misst, ist auf genau den einen
// Zustand blind, den er pruefen soll. (Dieselbe Klasse wie die
// Sichtbarkeitssonde ohne Vorscroll, CLAUDE.md Roadmap 20f.)
//
// ⚠️ EHRLICHKEITSSCHRANKE. Es gibt ZWEI Endmarken im Baum (mobile Leiste,
// Desktop-Spalte); je nach Breite ist eine per `display:none` auf 0x0. Wer
// die falsche greift, misst ein Element ohne Ausdehnung und bekommt ein
// gruenes Ergebnis ueber null Messpunkte — das Muster, das in diesem Projekt
// schon mehrfach als „gruener Test mit null Messframes" protokolliert ist.
// Deshalb wird vorab geprueft, dass ueberhaupt etwas Sichtbares gemessen wird.

const MOBIL = [
  [360, 800, "kleinste verbreitete Android-Breite"],
  [375, 812, "iPhone"],
  [390, 844, "iPhone"],
  [430, 932, "grosses Handy"],
  [768, 1024, "Tablet hochkant"],
  [1024, 768, "knapp unter xl — immer noch der Balken"],
];

const DESKTOP = [
  [1280, 800, "genau xl — ab hier die Spalte"],
  [1440, 900, "grosser Desktop"],
];

// Ergebnis einer Messung im haftenden Zustand.
async function markeImHaftzustand(page) {
  return page.evaluate(async () => {
    const bild = () =>
      new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));

    const sichtbar = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const alle = [...document.querySelectorAll("[title='Ziel: Nachspielzeit']")];
    const marke = alle.find(sichtbar);
    if (!marke) return { gefunden: false, imBaum: alle.length };

    const sektion = marke.closest("section");
    const sr = sektion.getBoundingClientRect();
    // Mitten in die Strecke — dort haftet die Leiste sicher.
    window.scrollTo(0, sr.top + window.scrollY + sr.height * 0.45);
    await bild();
    await bild();

    const m = marke.getBoundingClientRect();
    const nav = document.querySelector("nav, header");
    const nr = nav ? nav.getBoundingClientRect() : null;
    // Haftet die Navigationsleiste ueberhaupt oben? Wenn nicht, misst dieser
    // Fall nicht das, was er zu messen glaubt.
    const navHaftet = nr ? nr.top <= 1 && nr.bottom > 0 : false;

    return {
      gefunden: true,
      imBaum: alle.length,
      markeOben: Number(m.top.toFixed(1)),
      markeUnten: Number(m.bottom.toFixed(1)),
      breite: Number(m.width.toFixed(1)),
      hoehe: Number(m.height.toFixed(1)),
      navUnten: nr ? Number(nr.bottom.toFixed(1)) : null,
      navHaftet,
      fensterHoehe: window.innerHeight,
    };
  });
}

test.describe("Endmarke der Fortschritts-Leiste: Einpassung (Kai N4)", () => {
  for (const [breite, hoehe, wozu] of MOBIL) {
    test(`${breite}x${hoehe} (${wozu}): die Marke bleibt unter der Navigation`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const m = await markeImHaftzustand(page);

      expect(
        m.gefunden,
        `Keine sichtbare Endmarke gefunden (${m.imBaum} im Baum). Ohne diese ` +
          `Schranke waere der Fall gruen — ueber null Messpunkte.`,
      ).toBe(true);
      expect(
        m.breite,
        "Die gemessene Endmarke hat Breite 0 — es wurde der ausgeblendete Zweig gegriffen.",
      ).toBeGreaterThan(0);
      expect(
        m.navHaftet,
        "Die Navigationsleiste haftet nicht oben — dieser Fall misst nicht den " +
          "Zustand, in dem der Defekt ueberhaupt auftreten kann.",
      ).toBe(true);

      expect(
        m.markeOben,
        `Die Endmarke beginnt bei y=${m.markeOben}, die Navigationsleiste endet ` +
          `bei y=${m.navUnten}. Sie ragt also ${(m.navUnten - m.markeOben).toFixed(1)} px ` +
          `darunter — Tobias' Befund ist zurueck. Verfuegbar sind hier nur ` +
          `rund 4 px; die Marke misst ${m.breite}x${m.hoehe} px.`,
      ).toBeGreaterThanOrEqual(m.navUnten);
    });
  }

  for (const [breite, hoehe, wozu] of DESKTOP) {
    test(`${breite}x${hoehe} (${wozu}): die Marke steht vollstaendig im Fenster`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const m = await markeImHaftzustand(page);

      expect(m.gefunden, "Keine sichtbare Endmarke gefunden").toBe(true);
      expect(m.breite, "Die gemessene Endmarke hat Breite 0").toBeGreaterThan(0);

      // Am Desktop haengt die Marke am Fuss einer mittig haftenden Spalte.
      // Dort ist die Navigationsleiste nicht die Grenze, sondern der
      // Fensterrand: Eine Marke, die unten heraushaengt, ist das Ziel einer
      // Reise, das niemand sieht (CLAUDE.md Roadmap 20 d, dieselbe Sache).
      expect(
        m.markeUnten,
        `Die Endmarke endet bei y=${m.markeUnten}, das Fenster ist ` +
          `${m.fensterHoehe} px hoch — sie haengt unten heraus.`,
      ).toBeLessThanOrEqual(m.fensterHoehe);
      expect(
        m.markeOben,
        `Die Endmarke beginnt bei y=${m.markeOben} und liegt damit hinter der ` +
          `Navigationsleiste (endet bei ${m.navUnten}).`,
      ).toBeGreaterThanOrEqual(m.navUnten);
    });
  }
});
