// Jede Seite ist sie selbst – keine ist versehentlich eine Kopie einer anderen.
//
// ⚠️ WARUM ES DIESEN TEST GIBT (Befund Tobias, Gate 18.08.2026, blockierend)
//
// Am 18.08.2026 wurde `app/kontakt/page.js` versehentlich mit dem Inhalt von
// `app/about/page.js` überschrieben. Folge: Wer im Footer auf „Kontakt"
// klickte, landete auf einer Seite mit der Überschrift „Über uns" – ohne
// Formular, ohne Absenden-Knopf, mit einem Verweis „Kontakt", der auf sich
// selbst zeigte. Das Kontaktformular der Live-Seite war ersatzlos weg.
//
// ⚠️ DAS EIGENTLICHE PROBLEM IST NICHT DER FEHLGRIFF, SONDERN WAS NICHT PASSIERTE:
// Der Build lief durch. Alle 253 Tests blieben grün. Der Diff wurde von einem
// Prüfer gelesen, ohne dass die Datei auffiel. Gefunden hat es erst jemand,
// der die Seite im BROWSER aufgerufen hat.
//
// Eine Seite, die durch eine andere ersetzt wird, ist syntaktisch fehlerfrei.
// Sie ist nur die falsche Seite. Genau dafür ist dieser Test da.
//
// Hergang, für spätere Leser: Ein Sicherungsbefehl lautete
// `cp app/about/page.js /tmp/AB.bak 2>/dev/null || cp app/kontakt/page.js …`
// – als Absicherung gedacht, falls die eine Datei fehlt. Der ERSTE Befehl
// gelang, also lag `about` in der Sicherung; das Zurückspielen schrieb sie
// über `kontakt`. Ein `||`-Ausweichpfad, der nie hätte greifen sollen.
import { test, expect } from "@playwright/test";

// Was der Footer verspricht → was die Seite halten muss.
// Die Beschriftung stammt aus `components/layout/Footer.js`.
const VERSPRECHEN = [
  { pfad: "/kontakt", ueberschrift: /kontakt/i, braucht: "formular" },
  { pfad: "/about", ueberschrift: /über uns/i },
  { pfad: "/impressum", ueberschrift: /impressum/i },
  { pfad: "/datenschutz", ueberschrift: /datenschutz/i },
  { pfad: "/feedback", ueberschrift: /feedback/i },
  { pfad: "/tryouts", ueberschrift: /tryout/i },
  { pfad: "/installieren", ueberschrift: /installier|app/i },
];

test.describe("Seiten-Identität", () => {
  test("jede Seite trägt die Überschrift, die ihr Weg verspricht", async ({ page }) => {
    const falsch = [];
    for (const { pfad, ueberschrift } of VERSPRECHEN) {
      await page.goto(pfad, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("h1", { timeout: 20_000 }).catch(() => {});
      const h1 = await page.evaluate(() => document.querySelector("h1")?.textContent?.trim() || "");
      if (!ueberschrift.test(h1)) {
        falsch.push(`${pfad} → „${h1}" (erwartet: ${ueberschrift})`);
      }
    }
    expect(
      falsch,
      `Diese Seiten tragen eine Überschrift, die nicht zu ihrer Adresse passt. ` +
        `Fast immer heißt das: Die Datei wurde mit einer anderen überschrieben.\n` +
        `${falsch.join("\n")}`,
    ).toEqual([]);
  });

  test("keine zwei Seiten sind identisch", async ({ page }) => {
    // Zwei Seiten mit demselben Seitentitel sind das verlässlichste Zeichen für
    // eine versehentliche Kopie – zuverlässiger als ein Textvergleich, weil der
    // Titel aus den `metadata` der Datei kommt und beim Kopieren mitwandert.
    const titel = new Map();
    for (const { pfad } of VERSPRECHEN) {
      await page.goto(pfad, { waitUntil: "domcontentloaded" });
      const t = await page.title();
      if (!titel.has(t)) titel.set(t, []);
      titel.get(t).push(pfad);
    }
    // ⚠️ Der STANDARDTITEL zählt nicht als Kopie.
    // Vier Seiten (/kontakt, /feedback, /tryouts, /installieren) setzen keine
    // eigenen `metadata` und erben deshalb den Titel aus `app/layout.js`. Das
    // ist ein eigener, kleiner Befund (schlecht für Suchtreffer und
    // Browser-Tabs) – aber es ist KEINE versehentliche Kopie, und dieser Test
    // darf nicht an etwas scheitern, das er gar nicht meint.
    //
    // Der Fall, um den es geht, sieht anders aus: Beim Fehlgriff vom
    // 18.08.2026 trugen /kontakt und /about beide „Über uns – Hoops Germany" –
    // also einen SPEZIFISCHEN Titel doppelt. Genau das fängt die Regel unten.
    const STANDARDTITEL = "Hoops Germany – Amateur-Basketball Community";
    const doppelt = [...titel.entries()].filter(
      ([t, pfade]) => pfade.length > 1 && t !== STANDARDTITEL,
    );
    expect(
      doppelt.map(([t, pfade]) => `„${t}" auf ${pfade.join(" und ")}`),
      `Zwei Adressen liefern denselben Seitentitel. Beim Fehlgriff vom ` +
        `18.08.2026 trugen /kontakt und /about beide „Über uns – Hoops Germany".`,
    ).toEqual([]);
  });

  test("die Kontaktseite hat ein Kontaktformular", async ({ page }) => {
    // ⚠️ Die Überschrift allein genügt nicht: Sie ließe sich ändern, während
    // das Formular fehlt. Geprüft wird, was die Seite LEISTET.
    await page.goto("/kontakt", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("form, input, textarea", { timeout: 20_000 }).catch(() => {});
    const m = await page.evaluate(() => ({
      eingaben: document.querySelectorAll("input, textarea").length,
      absenden: [...document.querySelectorAll("button, input[type=submit]")].filter((b) =>
        /senden|abschicken|absenden/i.test(b.textContent + " " + (b.value || "")),
      ).length,
    }));
    expect(
      m.eingaben,
      `Die Kontaktseite hat ${m.eingaben} Eingabefelder. Ohne Felder ist sie ` +
        `keine Kontaktseite – genau der Zustand vom 18.08.2026.`,
    ).toBeGreaterThanOrEqual(2);
    expect(
      m.absenden,
      `Die Kontaktseite hat keinen Absenden-Knopf.`,
    ).toBeGreaterThanOrEqual(1);
  });
});
