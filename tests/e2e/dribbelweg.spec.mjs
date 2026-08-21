import { test, expect } from "@playwright/test";
import { ladeStartseite, warteAufRuhe, ballKontur } from "./helpers/landing.mjs";

// ══ WÄCHTER FÜR DEN DRIBBELWEG UND DEN PASS (21.08.2026) ════════════════════
//
// Ersetzt `rail-ankunft`, `rail-diagnose` und `korb-emblem` — sie bewachten die
// Punkte-Leiste am rechten Rand samt Korb-Endmarke in Schrägansicht, und beides
// gibt es nicht mehr. (Der Drehpunkt-Wächter ist NICHT hier eingewandert,
// sondern hat mit `ball-drehpunkt.spec.mjs` eine eigene Datei bekommen — er ist
// dreimal untergegangen, weil er bei einem fremden Bauteil einquartiert war.)
//
// ⚠️ WAS HIER BEWACHT WIRD, IST NICHT „SIEHT GUT AUS", SONDERN DIE EINE REGEL,
// an der der Vorgänger-Apparat hing (CLAUDE.md Roadmap 20–20h):
//     Der Ball berührt Inhalt nie, weil er nie in dessen Spalte ist.
// Bricht diese Regel, kommt der Ausweich-Apparat zurück. Deshalb wird die
// Berührungsfreiheit über MEHRERE Scrollpositionen und Breiten gemessen und
// nicht an einer Stelle behauptet.
//
// ⚠️ UND SEIT DEM 21.08.2026 GILT DAS AUCH FÜR DEN PASS. Bis dahin sah dieser
// Test vom Pass genau EINEN Scrollpunkt an — die Ruhelage am Ende. Der FLUG,
// um den es bei Kais Befund B1 ging, wurde nie angesehen. Die Lücke war im
// Quelltext von `BallPass.js` sogar wörtlich aufgeschrieben („Wer hier eine
// Fallhöhe einbaut, holt Kais Befund B1 zurück — und zwar ohne dass ein Test
// rot wird"). Eine Zusicherung, die als Kommentar dasteht statt als Wächter,
// ist eine Notiz, keine Zusicherung.

const KANAL_BREITEN = [768, 900, 1024, 1280, 1440, 1920];
// ⚠️ ZWEI HÖHEN, NICHT EINE. Der Kanal-Test lief auf sechs Breiten und genau
// EINER Fensterhöhe (900) — dieselbe einachsige Matrix, an der dieses Projekt
// schon dreimal hing (CLAUDE.md Roadmap 20b, 20f, und der Pass-Blocker vom
// 21.08.). Das Ein-/Ausblenden an den Streckenenden rechnet mit einem festen
// 90-px-Band gegen die Lesehöhe, und die Lesehöhe IST die halbe Fensterhöhe:
// auf einem kurzen Fenster ist dieses Band ein viel größerer Anteil.
const KANAL_HOEHEN = [640, 900];

test.describe("Dribbelweg", () => {
  for (const breite of KANAL_BREITEN) {
    for (const hoehe of KANAL_HOEHEN) {
      test(`Ball berührt auf ${breite}x${hoehe} keinen Inhalt`, async ({ page }) => {
        await page.setViewportSize({ width: breite, height: hoehe });
        await ladeStartseite(page);
        await page.waitForTimeout(400);

        const strecke = await page.evaluate(() => {
          const z = document.querySelectorAll("[data-feature-zeile]");
          const erste = z[0].getBoundingClientRect();
          const letzte = z[z.length - 1].getBoundingClientRect();
          return {
            von: erste.top + window.scrollY - window.innerHeight / 2,
            bis: letzte.bottom + window.scrollY - window.innerHeight / 2,
          };
        });

        // 14 Messpunkte über die ganze Strecke. Eine einzelne Stelle würde genau
        // die Fehlerform verfehlen, um die es geht: Der Ball läuft die meiste
        // Zeit frei und trifft nur in einem Abschnitt auf etwas.
        const SCHRITTE = 14;
        let gemessen = 0;
        for (let i = 0; i <= SCHRITTE; i += 1) {
          const y = strecke.von + ((strecke.bis - strecke.von) * i) / SCHRITTE;
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await page.waitForTimeout(90);

          const befund = await page.evaluate(() => {
            const ball = document.querySelector("[data-dribbelweg-ball]");
            if (!ball) return { aus: true };
            const b = ball.getBoundingClientRect();
            if (b.width === 0 || Number(getComputedStyle(ball).opacity) < 0.05) {
              return { aus: true };
            }
            // Gezeichnete Flächen: Textzeilen (echte Range-Kästen, nicht die
            // Flex-Spalte) und alles mit sichtbarem Hintergrund oder Rahmen.
            const treffer = [];
            const pruefe = (r, was) => {
              if (r.width === 0 || r.height === 0) return;
              const ueber =
                b.right > r.left &&
                b.left < r.right &&
                b.bottom > r.top &&
                b.top < r.bottom;
              if (ueber) treffer.push(was);
            };
            for (const zeile of document.querySelectorAll("[data-feature-zeile]")) {
              const lauf = document.createTreeWalker(zeile, NodeFilter.SHOW_TEXT);
              let n;
              while ((n = lauf.nextNode())) {
                if (!n.nodeValue.trim()) continue;
                const p = n.parentElement;
                if (!p) continue;
                const cs = getComputedStyle(p);
                if (cs.visibility === "hidden" || cs.display === "none") continue;
                const pr = p.getBoundingClientRect();
                if (pr.width <= 1 && pr.height <= 1) continue; // sr-only
                const rg = document.createRange();
                rg.selectNodeContents(n);
                for (const r of rg.getClientRects()) {
                  pruefe(r, `Text „${n.nodeValue.trim().slice(0, 24)}"`);
                }
              }
              for (const el of zeile.querySelectorAll("*")) {
                const cs = getComputedStyle(el);
                if (cs.display === "none" || cs.visibility === "hidden") continue;
                const hatFlaeche =
                  (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") ||
                  (cs.borderTopWidth !== "0px" && cs.borderTopStyle !== "none");
                if (!hatFlaeche) continue;
                const r = el.getBoundingClientRect();
                if (r.width <= 2 || r.height <= 2) continue;
                pruefe(r, `Fläche ${el.className?.toString?.().slice(0, 30)}`);
              }
            }
            return { aus: false, treffer };
          });

          if (befund.aus) continue;
          gemessen += 1;
          expect(
            befund.treffer,
            `Der Ball überlappt Inhalt bei scrollY ${Math.round(y)} — ` +
              `damit ist die Kanal-Regel gebrochen und der Ausweich-Apparat ` +
              `wieder fällig.`,
          ).toEqual([]);
        }

        // ⚠️ EHRLICHKEITSSCHRANKE. Ohne sie wäre dieser Test auch dann grün,
        // wenn der Ball auf KEINER Position gezeichnet wird — ein grüner Test
        // mit null Messframes, exakt das Muster aus CLAUDE.md Roadmap 20f.
        //
        // ⚠️ SIE STAND BIS ZUM 21.08.2026 AUF „MEHR ALS 6" (Befund Kai B7) und
        // deckte damit knapp die Hälfte ab. Gesund gemessen sind es **14 von 15**
        // — auf allen sechs Breiten und auf allen drei geprüften Höhen (640, 900,
        // 1200), ohne eine einzige Abweichung. Eine Schranke bei 6 fängt den
        // Totalausfall und schweigt bei einem Ausfall auf halber Strecke: Der
        // Ball könnte ab der Mitte der Seite verschwinden, und dieser Test bliebe
        // grün. 12 lässt Luft für zwei Randpunkte und für den Fall, dass ein
        // künftiges Layout die Strecke etwas verschiebt — mehr nicht.
        expect(
          gemessen,
          `Der Ball war nur an ${gemessen} von ${SCHRITTE + 1} Positionen sichtbar ` +
            `(gesund sind 14). Entweder wird er auf halber Strecke nicht mehr ` +
            `gezeichnet, oder der Test misst die falsche Strecke — in beiden Fällen ` +
            `sagen die grünen Berührungsprüfungen darüber nichts aus.`,
        ).toBeGreaterThanOrEqual(12);
      });
    }
  }

  test("unter 768 px wird kein Weg gezeichnet (kein Kanal, also nichts erfinden)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await ladeStartseite(page);
    await page.waitForTimeout(400);
    const d = await page.evaluate(
      () => document.querySelector("[data-dribbelweg-spur]")?.getAttribute("d") ?? null,
    );
    // Gezeichnet werden darf er nie — die SVG-Ebene ist unter `md` auf
    // `display:none`, und `vermessen()` findet dort ohnehin keinen Kanal.
    const sichtbar = await page.evaluate(() => {
      const svg = document.querySelector("[data-dribbelweg-spur]")?.ownerSVGElement;
      return svg ? getComputedStyle(svg).display !== "none" : false;
    });
    expect(sichtbar, "Der Mittelkanal existiert mobil nicht — er darf dort auch nicht gezeichnet werden.").toBe(false);
    expect(typeof d === "string").toBe(true);
  });
});

// ══ DER PASS: FENSTER FÜR BEIDE FOLGENDEN BLÖCKE ════════════════════════════
//
// ⚠️ DIE HÖHENACHSE IST DER GRUND, WARUM DIESE LISTE SO AUSSIEHT. Der Pass wird
// nur fertig, solange `0,42 · Fensterhöhe ≤ restUnten` gilt — bei gemessenen
// ~385 px Rest also bis rund **917 px Fensterhöhe**. Darüber endet die Seite
// mitten im Flug. Die Liste hörte bis zum 21.08.2026 bei 1024 px Höhe auf und
// enthielt damit den Ausfallbereich fast nicht; sichtbar wird er ab rund
// 1050 px. Auf dem iPad Pro 12,9" (1024×1366) ÜBERLAPPTE der Ball die Taste um
// 16,8 px — genau das Bild, das `BallPass.js` ausschließen will.
//
// 1024×1366 ist deshalb kein „noch eine Breite", sondern der einzige Eintrag,
// der die Abhilfe überhaupt prüft. 1440×1200 steht daneben, damit nicht die
// gesamte Prüfung an einem einzigen Gerät hängt.
const PASS_FENSTER = [
  { w: 360, h: 640 },
  { w: 390, h: 844 },
  { w: 768, h: 812 },
  { w: 768, h: 1024 },
  { w: 1024, h: 1366 }, // iPad Pro 12,9" — hier fiel der Pass aus
  { w: 1280, h: 720 },
  { w: 1440, h: 900 },
  { w: 1440, h: 1200 }, // zweites hohes Fenster, damit es nicht an einem hängt
];

test.describe("Pass am Abschluss", () => {
  // ⚠️ DIE BEDINGUNG AUS ROADMAP 20 (d): Die Landung muss auf JEDEM Fenster im
  // Bild sein. Beim Vorgänger stand sie hinter der Navigationsleiste und hat
  // nie jemand gesehen. Geprüft wird deshalb mit FENSTERHÖHEN als eigener
  // Achse — dieselbe Achse, an der schon dreimal etwas hing.
  for (const f of PASS_FENSTER) {
    for (const angemeldet of [false, true]) {
      test(`${f.w}x${f.h} ${angemeldet ? "angemeldet" : "ausgeloggt"}: Ball kommt sichtbar an und liegt neben der Taste`, async ({
        page,
        request,
      }) => {
        await page.setViewportSize({ width: f.w, height: f.h });
        await ladeStartseite(page, { angemeldet, request });
        await page.waitForSelector("[data-pass-ziel]");
        await warteAufRuhe(page, "[data-passfeld]");

        // ══ ⚠️ AN DAS ENDE DES PASSES, NICHT AN DAS ENDE DER SEITE ═══════════
        //
        // Mein erster Anlauf fuhr hier stur `scrollTo(0, scrollHeight)` — „was
        // ein Nutzer tut, ist bis unten scrollen". Das war falsch, und der Test
        // hat es selbst gemeldet: **360×640 ausgeloggt rot**, Ball nicht im
        // freien Bild.
        //
        // Der Grund ist kein Defekt, sondern eine Verwechslung von zwei Enden.
        // Der Ball liegt nach der Ankunft im Koordinatensystem des ABSCHNITTS
        // und scrollt mit ihm weiter. Auf einem kurzen Fenster ist der Pass bei
        // 58 % der Höhe längst fertig, und darunter liegen noch Fußzeile und
        // Rest des Blocks: Wer dann weiterscrollt, schiebt Taste UND Ball unter
        // die haftende Leiste — gemessen stand die Taste am Seitenende bei
        // y = 59, also oberhalb der 64 px hohen Navigationsleiste. Der Ball lag
        // korrekt neben ihr, beide waren nur nicht mehr im Bild.
        //
        // Richtig ist deshalb die Marke, gegen die `BallPass` FÄHRT: Ziel-
        // Oberkante auf 58 % der Fensterhöhe. Ist die nicht erreichbar (hohe
        // Fenster), klemmt der Browser von selbst am Seitenende — und genau
        // dort muss der Pass dann fertig sein. Eine Zeile, beide Fälle.
        // ⚠️ UND ZWAR NACHFAHREND, NICHT IN EINEM ZUG. Ein einzelnes
        // `scrollBy` landet gemessen **19–20 px daneben**: Die `<Reveal>`-Blöcke
        // stehen vor ihrer Einblendung tiefer, der Browser rechnet den Sprung
        // aus DIESER Lage, und danach rücken sie hoch. Dieselbe fremde
        // Einblendung wie beim Flug-Wächter weiter unten, nur an einer anderen
        // Stelle. Also: fahren, warten bis es steht, nachmessen, korrigieren —
        // höchstens viermal, danach ist entweder die Marke erreicht oder die
        // Seite zu Ende.
        for (let versuch = 0; versuch < 4; versuch += 1) {
          const rest = await page.evaluate(() => {
            const z = document.querySelector("[data-pass-ziel]");
            const d = z.getBoundingClientRect().top - 0.58 * window.innerHeight;
            window.scrollBy(0, d);
            return d;
          });
          await warteAufRuhe(page, "[data-passfeld]");
          if (Math.abs(rest) <= 2) break;
        }

        // ⚠️ EHRLICHKEITSSCHRANKE AUF DEN MESSORT. Ohne sie könnte der Bildlauf
        // irgendwo stehen bleiben und dieser Fall nennte eine Zwischenlage
        // „Ankunft". Gültig ist genau eines von beidem: Die 58-%-Marke ist
        // erreicht, ODER die Seite ist zu Ende (dann ist DAS das Ende des
        // Passes).
        const ort = await page.evaluate(() => {
          const z = document.querySelector("[data-pass-ziel]").getBoundingClientRect();
          return {
            markeErreicht: Math.abs(z.top - 0.58 * window.innerHeight) <= 2,
            amSeitenende:
              window.scrollY >=
              document.documentElement.scrollHeight - window.innerHeight - 2,
          };
        });
        expect(
          ort.markeErreicht || ort.amSeitenende,
          "Weder die 58-%-Marke noch das Seitenende erreicht — dieser Fall misst " +
            "eine beliebige Zwischenlage und nennt sie Ankunft.",
        ).toBe(true);

        const k = await ballKontur(page, "[data-pass-ball]");
        expect(k, "Der Pass-Ball ist nicht im Seitengerüst.").not.toBeNull();

        const m = await page.evaluate(
          ({ cx, cy, r }) => {
            const z = document.querySelector("[data-pass-ziel]").getBoundingClientRect();
            const dx = Math.max(z.left - cx, 0, cx - z.right);
            const dy = Math.max(z.top - cy, 0, cy - z.bottom);
            return {
              luecke: Math.hypot(dx, dy) - r,
              imBild:
                cy - r >= 64 &&
                cy + r <= window.innerHeight &&
                cx - r >= 0 &&
                cx + r <= window.innerWidth,
              zielHref: document.querySelector("[data-pass-ziel]").getAttribute("href"),
            };
          },
          { cx: k.cx, cy: k.cy, r: k.r },
        );

        expect(k.deck, "Der Ball ist am Ende des Passes nicht sichtbar.").toBeGreaterThan(0.9);
        expect(
          m.imBild,
          "Der Ball steht bei der Ankunft nicht vollständig im freien Bild " +
            "(oberhalb 64 px liegt die haftende Navigationsleiste) — genau der " +
            "Zustand aus Roadmap 20 (d).",
        ).toBe(true);
        // ⚠️ KONTUR, NICHT HÜLLBOX. Hier stand die Rechteck-Lücke aus
        // `getBoundingClientRect()` des GEDREHTEN `<g>` — die schwankt mit dem
        // Drehwinkel um bis zu 3,7 px und meldet immer zu WENIG Luft. Mit der
        // Kontur (Mitte über `getScreenCTM()`, Radius 9 mal Maßstab) ist der
        // Wert eindeutig: gebaut sind `ABSTAND` 14 px zum Kasten, gezeichnet
        // also 15 px zur Kontur. Gemessen 14,9–15,3 auf allen acht Fenstern und
        // in beiden Anmeldezuständen — sowohl bei der Ruhelage NEBEN der Taste
        // als auch bei der ÜBER ihr.
        // Das Band ist bewusst eng: Es ist ein entschiedener Wert, kein
        // Toleranzbereich. Wer ihn ändert, soll hier vorbeikommen.
        expect(
          Math.round(m.luecke * 10) / 10,
          `Kontur-Abstand zur Taste ${m.luecke.toFixed(1)} px. Negativ heißt: Der Ball ` +
            `verschwindet in der Taste (auf hohen Fenstern der Ausfall vom 21.08.2026). ` +
            `Zu groß heißt: Er kommt nicht an, sondern wird irgendwo abgestellt.`,
        ).toBeGreaterThanOrEqual(10);
        expect(Math.round(m.luecke * 10) / 10).toBeLessThanOrEqual(22);
        expect(m.zielHref).toBe(angemeldet ? "/feedback" : "/signup");
      });
    }
  }

  test("der Abschluss-Block existiert auch für Angemeldete", async ({ page, request }) => {
    // ⚠️ Er fiel bis zum 21.08.2026 komplett weg (`if (loggedIn) return null`).
    // Mit der Ballreise ist das kein Sparen mehr, sondern ein Ziel, das fehlt.
    await page.setViewportSize({ width: 1280, height: 900 });
    await ladeStartseite(page, { angemeldet: true, request });
    // ⚠️ Auf den Abschnitt einschränken. „Feedback" steht auch im haftenden
    // Chrome und im Footer – ohne Einschränkung trifft die Suche drei Elemente
    // und bricht ab, ohne etwas über den Abschluss-Block zu sagen.
    const block = page.locator("[data-passfeld]");
    await expect(block.getByRole("heading", { name: "Was fehlt?" })).toBeVisible();
    await expect(block.locator("[data-pass-ziel]")).toHaveText(/Feedback geben/);
  });
});

// ══ DER FLUG DES PASSES ═════════════════════════════════════════════════════
//
// ⚠️ DAS IST DER WÄCHTER, DER BIS ZUM 21.08.2026 GEFEHLT HAT (Befund M1).
// Der Block darüber prüft die Ruhelage — EINEN Scrollpunkt. Kais Befund B1 war
// aber kein Befund über die Ruhelage: Bis zum Umbau startete der Ball 190 px
// ÜBER der Taste und mittig auf ihr und flog dabei durch Überschrift und
// Absatz — 18–23 % des Fluges auf Desktop-Breiten, 43–48 % mobil. Am ENDE lag
// er trotzdem sauber neben der Taste. Ein Wächter auf der Ruhelage hätte diesen
// Befund nie gesehen.
//
// Die Abhilfe war, den Anflug WAAGERECHT in das Band der Ruhelage zu legen
// (`startY === ruheY`). Genau diese eine Zeile wird hier bewacht: Wer eine
// Fallhöhe zurückbaut, bekommt Rot.
//
// ══ ⚠️ WARUM NACH JEDEM SCHRITT AUF RUHE GEWARTET WIRD ═════════════════════
//
// Die Absätze im Abschluss-Block sind `<Reveal>`-Elemente. Während ihrer
// Einblendung stehen sie per `transform` 6–18 px tiefer als ihr Layoutkasten —
// also im Band des Balls. Ohne Warten meldet dieser Test auf jeder mobilen
// Breite eine Berührung, die es 200 ms später nicht mehr gibt (Messwerte und
// Einordnung stehen im Kopf von `BallPass.js`).
//
// ⚠️ Das ist KEIN Wegschauen. Die vorübergehende Berührung ist ein eigener,
// gemessener und bewusst offener Punkt; sie ist eine Aussage über eine fremde
// Einblendung, nicht über die Bahn des Balls. Dieser Test bewacht die BAHN. Ein
// Test, der beides in einer Zahl vermischt, kann keines von beidem melden.
const FLUG_FENSTER = [
  { w: 360, h: 640 }, // Ruhelage ÜBER der Taste (mobil)
  { w: 390, h: 844 },
  { w: 768, h: 1024 }, // Umschaltpunkt zwischen beiden Ruhelagen
  { w: 1024, h: 1366 }, // hohes Fenster: verkürzter Flug
  { w: 1280, h: 800 }, // Ruhelage NEBEN der Taste (Desktop)
];

test.describe("Pass — Berührungsfreiheit über den ganzen Flug", () => {
  for (const f of FLUG_FENSTER) {
    for (const angemeldet of [false, true]) {
      test(`${f.w}x${f.h} ${angemeldet ? "angemeldet" : "ausgeloggt"}: der Ball kreuzt auf dem ganzen Weg keinen Inhalt`, async ({
        page,
        request,
      }) => {
        await page.setViewportSize({ width: f.w, height: f.h });
        await ladeStartseite(page, { angemeldet, request });
        await page.waitForSelector("[data-pass-ziel]");
        await warteAufRuhe(page, "[data-passfeld]");

        // Von „Ziel-Oberkante am unteren Bildrand" bis ans Seitenende — der
        // gesamte Bereich, in dem der Pass gefahren wird.
        const start = await page.evaluate(
          () =>
            document.querySelector("[data-pass-ziel]").getBoundingClientRect().top +
            window.scrollY -
            window.innerHeight,
        );
        const maxScroll = await page.evaluate(
          () => document.documentElement.scrollHeight - window.innerHeight,
        );

        const SCHRITTE = 18;
        let gemessen = 0;
        for (let i = 0; i <= SCHRITTE; i += 1) {
          const y = Math.min(maxScroll, start + ((maxScroll - start) * i) / SCHRITTE);
          await page.evaluate((y) => window.scrollTo(0, y), y);
          await warteAufRuhe(page, "[data-passfeld]");

          const k = await ballKontur(page, "[data-pass-ball]");
          if (!k || k.deck < 0.05) continue; // vor dem Bildrand: nichts zu sehen
          gemessen += 1;

          const treffer = await page.evaluate(
            ({ cx, cy, r }) => {
              const feld = document.querySelector("[data-passfeld]");
              const out = [];
              const pruefe = (rect, was) => {
                if (rect.width === 0 || rect.height === 0) return;
                const dx = Math.max(rect.left - cx, 0, cx - rect.right);
                const dy = Math.max(rect.top - cy, 0, cy - rect.bottom);
                const d = Math.hypot(dx, dy) - r;
                if (d < 0) out.push(`${was} (${d.toFixed(1)} px)`);
              };
              // Textzeilen als echte Range-Kästen — nicht die Elementbox, die
              // bei zentriertem Text bis an den Rand reicht und dort Luft ist.
              const lauf = document.createTreeWalker(feld, NodeFilter.SHOW_TEXT);
              let n;
              while ((n = lauf.nextNode())) {
                if (!n.nodeValue.trim()) continue;
                const el = n.parentElement;
                if (!el) continue;
                const cs = getComputedStyle(el);
                if (cs.visibility === "hidden" || cs.display === "none") continue;
                const rg = document.createRange();
                rg.selectNodeContents(n);
                for (const rect of rg.getClientRects()) {
                  pruefe(rect, `Text „${n.nodeValue.trim().slice(0, 22)}"`);
                }
              }
              // Gefüllte Flächen (die Tasten) — dort ist die Kontur die Box.
              for (const el of feld.querySelectorAll("*")) {
                const cs = getComputedStyle(el);
                if (cs.display === "none" || cs.visibility === "hidden") continue;
                const flaeche =
                  (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") ||
                  (cs.borderTopWidth !== "0px" && cs.borderTopStyle !== "none");
                if (!flaeche) continue;
                const rect = el.getBoundingClientRect();
                if (rect.width <= 2 || rect.height <= 2) continue;
                pruefe(rect, `Fläche ${String(el.className).slice(0, 28)}`);
              }
              return out;
            },
            { cx: k.cx, cy: k.cy, r: k.r },
          );

          expect(
            treffer,
            `Der Ball kreuzt bei scrollY ${Math.round(y)} gezeichneten Inhalt. ` +
              `Der Pass fliegt WAAGERECHT im freien Band der Ruhelage — wer eine ` +
              `Fallhöhe einbaut (\`startY\` ≠ \`ruheY\` in BallPass.js), holt Kais ` +
              `Befund B1 zurück und mit ihm den Ausweich-Apparat aus Roadmap 20–20h.`,
          ).toEqual([]);
        }

        // ⚠️ EHRLICHKEITSSCHRANKE. Vor dem Bildrand ist der Ball unsichtbar und
        // wird übersprungen — ohne diese Zeile wäre ein Ball, der GAR NICHT
        // erscheint, ein grüner Test über null Messpunkte.
        // Gesund gemessen (25 Punkte): 14–21 sichtbar, je nach Fensterhöhe.
        // Auf 19 Punkte umgerechnet sind das 10–16; die Schranke steht bei 9.
        expect(
          gemessen,
          `Der Ball war an ${gemessen} von ${SCHRITTE + 1} Positionen sichtbar. ` +
            `Zu wenig, um über den Flug etwas auszusagen — dieser Test hat nichts gemessen.`,
        ).toBeGreaterThanOrEqual(9);
      });
    }
  }
});

test.describe("Aussenlinie", () => {
  test("läuft über alle Abschnitte und unterbricht symmetrisch", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await ladeStartseite(page);
    await page.waitForTimeout(400);

    const anzahl = await page.locator("[data-aussenlinie]").count();
    expect(
      anzahl,
      "Die Aussenlinie wird je Abschnitt gezeichnet (die Abschnitte haben " +
        "eigene Hintergründe). Fehlt einer, hat die Linie ein Loch.",
    ).toBeGreaterThanOrEqual(4);

    const m = await page.evaluate(() => {
      const wrap = document.querySelector("[data-aussenlinie]");
      const kinder = [...wrap.querySelectorAll("[data-feld-senkrecht]")];
      const a = kinder[0].getBoundingClientRect();
      const b = kinder[1].getBoundingClientRect();
      return {
        links: Math.round(a.left),
        rechtsAbstand: Math.round(window.innerWidth - b.right),
        verlauf: getComputedStyle(kinder[0]).backgroundImage,
        grundlinien: document.querySelectorAll("[data-feld-grundlinie]").length,
      };
    });
    // Gleicher Abstand links wie rechts — eine unsymmetrische Aussenlinie
    // liest sich als Fehler, nicht als Feld.
    expect(m.links).toBe(m.rechtsAbstand);
    // Die Unterbrechung entsteht als harte Kante im Farbverlauf.
    // ⚠️ Der berechnete Stil schreibt Transparenz als `rgba(0, 0, 0, 0)`, nicht
    // als „transparent" – die naheliegende Erwartung war rot, obwohl die
    // Unterbrechung da war. Ein Test, der die Schreibweise des Browsers rät,
    // meldet einen Defekt am eigenen Text.
    expect(m.verlauf).toMatch(/rgba\(0, 0, 0, 0\)/);
    expect(m.grundlinien, "Das Feld schliesst am Seitenende mit der Grundlinie.").toBe(1);
  });
});

// ══ REDUZIERTE BEWEGUNG: DAS STANDBILD MUSS DEM LAYOUT FOLGEN ═══════════════
//
// ⚠️ Befund Kai B10, behoben am 21.08.2026 — hier ist der Wächter dazu.
//
// Ohne Bewegung zeichnen beide Bauteile ein STANDBILD: der Dribbelweg den
// ganzen Weg mit dem Ball an dessen Ende, der Pass den Ball an der Taste. Beide
// hörten dafür nur auf `resize` des FENSTERS. Das ist genau der Zustand, in dem
// es am meisten wehtut: Weil ohne Bewegung kein Scroll-Zuhörer läuft, gibt es
// keinen zweiten Anlass, jemals neu zu messen — eine einmal falsch berechnete
// Zeichnung bleibt für die ganze Sitzung falsch.
//
// Der Auslöser ist Alltag, kein Sonderfall: Bilder der Feature-Karten, spät
// ladende Schriften, der Nachrichten-Block, der seine Meldungen holt. Der
// normale Zweig hat für genau das seit jeher einen `ResizeObserver`; der
// ruhige hatte ihn nicht.
//
// Gemessen ohne Abhilfe: Weg endet 56 px zu früh, Pass-Ball liegt 120 px neben
// der Taste — beides dauerhaft.
//
// ══ ⚠️ UND EIN BEFUND AM TEST SELBST, GEFUNDEN DURCH DIE GEGENPROBE ════════
//
// Dieser Block stand zuerst mit `test.use({ reducedMotion: "reduce" })` im
// `describe` da und war **grün — auch mit zurückgedrehter Abhilfe**. Gemessen:
// `matchMedia("(prefers-reduced-motion: reduce)").matches` war im Browser
// **false**. Die Einstellung kam nicht an (Playwright 1.62.1), die Tests liefen
// im NORMALEN Zweig — und der hat den Beobachter seit jeher. Sie prüften also
// eine Eigenschaft, die dort ohnehin gilt, und hätten den Rückbau nie gemeldet.
//
// Das ist die Fehlerform aus CLAUDE.md, wörtlich: „Eine Gegenprobe, die
// durchläuft, ist ein Befund am Test, nicht am Code." Gefunden hat es nicht das
// Lesen, sondern die Mutationsmatrix.
//
// Zwei Konsequenzen, und die zweite ist die wichtigere:
//   1. Der Kontext wird selbst geöffnet (`browser.newContext`) — dort wirkt die
//      Einstellung nachweislich.
//   2. ⚠️ ES WIRD IM BROWSER NACHGEWIESEN, DASS DER ZWEIG AUCH WIRKLICH DER
//      RUHIGE IST. Ohne diesen Nachweis ist jede Zusicherung dieses Blocks
//      eine Aussage über einen Zustand, in dem der Test gar nicht war.
async function ruhigeSeite(browser, w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-feature-zeile]");
  const ruhig = await page.evaluate(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  expect(
    ruhig,
    "Der Browser meldet KEINE reduzierte Bewegung. Dieser Fall läuft dann im " +
      "normalen Zweig — und der hat den Beobachter ohnehin. Alles, was danach " +
      "kommt, wäre grün über den falschen Zustand.",
  ).toBe(true);
  return { ctx, page };
}

test.describe("Reduzierte Bewegung", () => {
  test("der gezeichnete Weg zieht nach, wenn sich der Inhalt nachträglich umbaut", async ({
    browser,
  }) => {
    const { ctx, page } = await ruhigeSeite(browser, 1280, 900);
    await page.waitForTimeout(600);

    const vorher = await page.evaluate(() => ({
      d: document.querySelector("[data-dribbelweg-spur]")?.getAttribute("d") || "",
      letzte: document.querySelectorAll("[data-feature-zeile]")[5]?.offsetTop ?? -1,
    }));
    expect(vorher.d.length, "Es wurde gar kein Weg gezeichnet — nichts zu prüfen.").toBeGreaterThan(50);

    // Ein Nachlade-Vorgang, wie ihn ein spät eintreffendes Bild auslöst.
    await page.evaluate(() => {
      const zeile = document.querySelectorAll("[data-feature-zeile]")[1];
      const platz = document.createElement("div");
      platz.style.height = "300px";
      zeile.appendChild(platz);
    });
    await page.waitForTimeout(700);

    const nachher = await page.evaluate(() => ({
      d: document.querySelector("[data-dribbelweg-spur]")?.getAttribute("d") || "",
      letzte: document.querySelectorAll("[data-feature-zeile]")[5]?.offsetTop ?? -1,
    }));

    // ⚠️ EHRLICHKEITSSCHRANKE: Hat sich das Layout überhaupt bewegt? Ohne diese
    // Zeile wäre der Test grün, sobald die Einfügung wirkungslos bleibt — und
    // er hätte über den Beobachter nichts ausgesagt.
    expect(
      nachher.letzte,
      "Die letzte Feature-Zeile hat sich nicht bewegt — der Umbau ist nicht " +
        "eingetreten, und dieser Test hat nichts gemessen.",
    ).toBeGreaterThan(vorher.letzte);

    expect(
      nachher.d,
      "Der gezeichnete Weg ist unverändert, obwohl die Stationen gewandert sind. " +
        "Bei reduzierter Bewegung läuft kein Scroll-Zuhörer — der Weg bleibt damit " +
        "für die ganze Sitzung falsch (Befund Kai B10).",
    ).not.toBe(vorher.d);
    await ctx.close();
  });

  test("der Pass-Ball zieht nach, wenn sich der Abschluss-Block nachträglich umbaut", async ({
    browser,
  }) => {
    const { ctx, page } = await ruhigeSeite(browser, 1280, 900);
    await page.waitForSelector("[data-pass-ziel]");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);

    const vorher = await page.evaluate(() => ({
      t: document.querySelector("[data-pass-ball]").getAttribute("transform"),
      zielY: document.querySelector("[data-pass-ziel]").getBoundingClientRect().top,
    }));

    await page.evaluate(() => {
      const h = document.querySelector("[data-passfeld] h2");
      const platz = document.createElement("div");
      platz.style.height = "120px";
      h.parentElement.insertBefore(platz, h);
    });
    await page.waitForTimeout(700);

    const nachher = await page.evaluate(() => ({
      t: document.querySelector("[data-pass-ball]").getAttribute("transform"),
      zielY: document.querySelector("[data-pass-ziel]").getBoundingClientRect().top,
    }));

    expect(
      Math.abs(nachher.zielY - vorher.zielY),
      "Die Taste hat sich nicht bewegt — der Umbau ist nicht eingetreten, und " +
        "dieser Test hat nichts gemessen.",
    ).toBeGreaterThan(50);

    expect(
      nachher.t,
      "Der Ball liegt unverändert, obwohl die Taste gewandert ist — er steht " +
        "damit dauerhaft daneben (Befund Kai B10).",
    ).not.toBe(vorher.t);
    await ctx.close();
  });
});
