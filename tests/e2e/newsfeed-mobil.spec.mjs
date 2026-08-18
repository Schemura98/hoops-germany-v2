// Der mobile Newsfeed: Der Feed beginnt oben, die Wegweiser sind bedienbar.
//
// WARUM ES DIESEN TEST BRAUCHT (Übergabe Kai, Gate 18.08.2026)
// Der mobile Umbau war die größte sichtbare Änderung des Tages und hatte
// **null** Abdeckung: `newsfeed-schiene.spec.mjs` prüft 1440/1280/1024 – also
// ausschließlich Desktop. Auf dem Gerät, das laut CLAUDE.md der Hauptfall ist,
// wurden vier Akkordeons durch eine Wegweiser-Zeile ersetzt und die
// Folge-Vorschläge unter den Feed verlegt, ohne dass irgendetwas das festhält.
//
// ⚠️ Kais Satz dazu, der den Ton für diesen Test setzt: „der Kommentar
// behauptet `min-h-11` – behaupten und messen sind zweierlei." Deshalb wird
// hier die GEZEICHNETE Höhe gemessen (`getBoundingClientRect`), nicht die
// Klasse gelesen. Eine Klasse kann von einer späteren Regel überschrieben
// werden, ohne dass jemand die Klasse anfasst.
import { test, expect } from "@playwright/test";

// Reale Gerätebreiten. 360 ist die verbreitetste Android-Breite Deutschlands
// (steht so in CLAUDE.md, Roadmap 20d), 390 das iPhone-Maß.
const BREITEN = [360, 375, 390, 430];

// WCAG 2.5.8 (AA) verlangt 24×24 px. Die Wegweiser sind bewusst auf 44 gebaut –
// das ist der AAA-Wert und die Daumenempfehlung. Geprüft wird gegen 44, damit
// eine stille Rückstufung auffällt, nicht erst der Bruch der Mindestnorm.
const ZIEL_MIN = 44;

async function anmelden(request) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email: "max@test.de", password: "test123" },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token – ohne Anmeldung gibt es keinen Newsfeed und dieser Test prüft ` +
      `nichts. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

test.describe("Newsfeed mobil", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: Wegweiser statt Kästen, Feed beginnt oben`, async ({
      page,
      request,
    }) => {
      const token = await anmelden(request);
      await page.setViewportSize({ width: breite, height: 844 });
      await page.addInitScript((t) => {
        localStorage.setItem("playerAuthToken", t);
        // Die Willkommens-Tour startet sonst automatisch und legt sich über
        // die ganze Seite. Ihr Wächter ist genau dieser Schlüssel – so bleibt
        // die Datenbank unberührt.
        sessionStorage.setItem("hg_welcome_token", t);
      }, token);
      // Der Nachrichten-Abschnitt hängt an einem fremden RSS-Abruf. Er steht
      // mobil zwar nicht mehr auf der Seite, kann aber die Ladezeit prägen –
      // feste Antwort, damit der Test nicht am Wetter hängt.
      await page.route("**/api/news/rss", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, news: [] }),
        }),
      );

      await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });

      const wegweiser = page.locator('nav[aria-label="Weitere Bereiche"] a');
      await wegweiser.first().waitFor({ state: "visible", timeout: 30_000 });

      // ── Ehrlichkeitsschranke ────────────────────────────────────────────
      // Unter 1024 px darf die Desktop-Schiene gar nicht existieren. Steht sie
      // doch da, misst der Test eine andere Seite als gemeint.
      const schiene = await page.evaluate(
        () =>
          [...document.querySelectorAll("main *")].filter(
            (e) => getComputedStyle(e).position === "sticky",
          ).length,
      );
      expect(
        schiene,
        `Bei ${breite}px steht ein haftendes Element im Inhalt – das ist die ` +
          `Desktop-Schiene. Der mobile Zweig wurde also gar nicht gerendert, ` +
          `und alles Weitere wäre eine Aussage über den Desktop.`,
      ).toBe(0);

      const mess = await page.evaluate(() => {
        const q = (sel) => [...document.querySelectorAll(sel)];
        const nav = document.querySelector('nav[aria-label="Weitere Bereiche"]');
        const ziele = q('nav[aria-label="Weitere Bereiche"] a').map((a) => {
          const r = a.getBoundingClientRect();
          return {
            text: a.textContent.trim(),
            href: a.getAttribute("href"),
            hoehe: Math.round(r.height),
            breite: Math.round(r.width),
          };
        });
        // Der Feed-Umschalter markiert den Beginn der Beitragsliste.
        const umschalter = q("button, a").find((e) => e.textContent.trim() === "Für dich");
        return {
          ziele,
          navHoehe: nav ? Math.round(nav.getBoundingClientRect().height) : null,
          umschalterY: umschalter
            ? Math.round(umschalter.getBoundingClientRect().top + window.scrollY)
            : null,
          quer: document.documentElement.scrollWidth > window.innerWidth,
          fensterBreite: window.innerWidth,
        };
      });

      // ── Die Zusicherungen ───────────────────────────────────────────────
      expect(
        mess.ziele.length,
        `Keine Wegweiser gefunden – die mobile Neuordnung vom 18.08.2026 ist weg.`,
      ).toBeGreaterThanOrEqual(3);

      for (const z of mess.ziele) {
        expect(
          z.hoehe,
          `Wegweiser „${z.text}" ist nur ${z.hoehe}px hoch (gemessen, nicht aus ` +
            `der Klasse gelesen). Vorher standen hier 20-px-Aufklapppfeile oben ` +
            `rechts – genau dort, wo ein Daumen nicht hinkommt. Das war der Grund ` +
            `für den Umbau.`,
        ).toBeGreaterThanOrEqual(ZIEL_MIN);
        expect(
          z.href,
          `Wegweiser „${z.text}" hat kein Ziel.`,
        ).toBeTruthy();
      }

      expect(
        mess.quer,
        `Die Seite scrollt bei ${breite}px seitlich (Dokument ` +
          `${mess.fensterBreite}px breit). Die Wegweiser-Zeile darf in sich ` +
          `scrollen, die Seite nicht.`,
      ).toBe(false);

      // Der Feed muss oben beginnen – das war der ganze Zweck des Umbaus.
      // 900 px ist bewusst großzügig: Der Test soll die RÜCKKEHR der vier
      // Kästen fangen (die kosteten ~192 px), nicht jede Verschiebung um
      // zwanzig Pixel melden und dadurch bei jeder Textänderung rot werden.
      expect(
        mess.umschalterY,
        `Der Feed-Umschalter („Für dich") wurde nicht gefunden.`,
      ).not.toBeNull();
      expect(
        mess.umschalterY,
        `Der Feed beginnt erst bei y=${mess.umschalterY}px. Vor dem Umbau vom ` +
          `18.08.2026 waren es ~888px, weil vier Akkordeon-Kästen davor standen. ` +
          `Sind sie zurück?`,
      ).toBeLessThan(900);
    });
  }

  test("die alten Akkordeon-Kästen sind nicht zurück", async ({ page, request }) => {
    // ⚠️ Eigener Testfall, weil er etwas anderes prüft als die Messungen oben:
    // Dort geht es um Maße, hier um die Bauform. Vier gleichförmige
    // Aufklapp-Kästen VOR dem Feed waren am 15.08. die Hauptbegründung für den
    // Desktop-Umbau – mobil sind sie erst am 18.08. verschwunden. Wer sie
    // zurückbaut, tut das nicht aus Versehen, aber er soll es merken.
    const token = await anmelden(request);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((t) => {
      localStorage.setItem("playerAuthToken", t);
      sessionStorage.setItem("hg_welcome_token", t);
    }, token);
    await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
    await page.locator('nav[aria-label="Weitere Bereiche"] a').first().waitFor({ timeout: 30_000 });

    const vorDemFeed = await page.evaluate(() => {
      const umschalter = [...document.querySelectorAll("button, a")].find(
        (e) => e.textContent.trim() === "Für dich",
      );
      if (!umschalter) return null;
      const grenze = umschalter.getBoundingClientRect().top + window.scrollY;
      // Aufklappbares erkennt man an der Zustandsangabe für Vorleseprogramme –
      // nicht am Aussehen. Das hält auch, wenn jemand die Optik ändert.
      //
      // ⚠️ NUR innerhalb von `main` suchen. Die Navigationsleiste trägt
      // ebenfalls `aria-expanded` (Menü, Glocke, Suche) – ein Suchlauf über das
      // ganze Dokument meldet drei Treffer ohne Text und wäre falsch rot.
      // Beim Bauen genau so passiert.
      // ⚠️ ZWEI Bauformen, nicht eine. `aria-expanded` tragen nur selbstgebaute
      // Aufklapper (Button + Zustand); ein natives `<details>` hat den Zustand
      // implizit und KEIN Attribut. Der erste Anlauf dieses Tests prüfte nur
      // das Attribut – eine Gegenprobe mit `<details>` lief glatt durch, der
      // Test wäre also gegen die halbe Fehlerklasse blind gewesen.
      const inhalt = document.querySelector("main");
      if (!inhalt) return null;
      return [...inhalt.querySelectorAll("[aria-expanded], details")]
        .filter((e) => e.getBoundingClientRect().top + window.scrollY < grenze)
        .map((e) => e.textContent.trim().slice(0, 30));
    });
    expect(vorDemFeed, "Feed-Umschalter nicht gefunden").not.toBeNull();
    expect(
      vorDemFeed,
      `Vor dem Feed stehen wieder aufklappbare Kästen. Genau die wurden am ` +
        `18.08.2026 entfernt: vier gleichförmige Blöcke, die den ersten Beitrag ` +
        `auf y≈888 gedrückt haben – auf dem Gerät, das der Hauptfall ist.`,
    ).toEqual([]);
  });
});
