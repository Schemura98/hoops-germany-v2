import { test, expect } from "@playwright/test";

// ══ WÄCHTER FÜR DEN DRIBBELWEG UND DEN PASS (21.08.2026) ════════════════════
//
// Ersetzt `rail-ankunft`, `rail-diagnose`, `rail-ball-drehpunkt` und
// `korb-emblem` — sie bewachten die Punkte-Leiste am rechten Rand samt
// Korb-Endmarke in Schrägansicht, und beides gibt es nicht mehr.
//
// ⚠️ WAS HIER BEWACHT WIRD, IST NICHT „SIEHT GUT AUS", SONDERN DIE EINE REGEL,
// an der der Vorgänger-Apparat hing (CLAUDE.md Roadmap 20–20h):
//     Der Ball berührt Inhalt nie, weil er nie in dessen Spalte ist.
// Bricht diese Regel, kommt der Ausweich-Apparat zurück. Deshalb wird die
// Berührungsfreiheit über MEHRERE Scrollpositionen und Breiten gemessen und
// nicht an einer Stelle behauptet.

const KANAL_BREITEN = [768, 900, 1024, 1280, 1440, 1920];

async function ladeStartseite(page, { angemeldet = false } = {}) {
  if (angemeldet) {
    await page.addInitScript(() =>
      localStorage.setItem("playerAuthToken", "wachhund.wachhund.wachhund"),
    );
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-feature-zeile]");
}

test.describe("Dribbelweg", () => {
  for (const breite of KANAL_BREITEN) {
    test(`Ball berührt auf ${breite} px keinen Inhalt`, async ({ page }) => {
      await page.setViewportSize({ width: breite, height: 900 });
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
      expect(
        gemessen,
        `Der Ball war an keiner der ${SCHRITTE + 1} Positionen sichtbar. ` +
          `Der Test hat nichts gemessen.`,
      ).toBeGreaterThan(6);
    });
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

test.describe("Pass am Abschluss", () => {
  // ⚠️ DIE BEDINGUNG AUS ROADMAP 20 (d): Die Landung muss auf JEDEM Fenster im
  // Bild sein. Beim Vorgänger stand sie hinter der Navigationsleiste und hat
  // nie jemand gesehen. Geprüft wird deshalb mit FENSTERHÖHEN als eigener
  // Achse — dieselbe Achse, an der schon zweimal etwas hing (Roadmap 20b/20f).
  const FENSTER = [
    { w: 360, h: 640 },
    { w: 390, h: 844 },
    { w: 768, h: 812 },
    { w: 768, h: 1024 },
    { w: 1280, h: 720 },
    { w: 1440, h: 900 },
  ];

  for (const f of FENSTER) {
    for (const angemeldet of [false, true]) {
      test(`${f.w}x${f.h} ${angemeldet ? "angemeldet" : "ausgeloggt"}: Ball kommt sichtbar an und liegt neben der Taste`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: f.w, height: f.h });
        await ladeStartseite(page, { angemeldet });
        await page.waitForSelector("[data-pass-ziel]");
        await page.waitForTimeout(300);

        // An das Ende des Passes fahren: Ziel-Oberkante auf 58 % der
        // Fensterhöhe — genau die Marke, gegen die `BallPass` fährt.
        await page.evaluate(() => {
          const z = document.querySelector("[data-pass-ziel]");
          window.scrollBy(0, z.getBoundingClientRect().top - 0.58 * window.innerHeight);
        });
        await page.waitForTimeout(400);

        const m = await page.evaluate(() => {
          const g = document.querySelector("[data-pass-ball]");
          const z = document.querySelector("[data-pass-ziel]");
          const gb = g.getBoundingClientRect();
          const zb = z.getBoundingClientRect();
          const luecke =
            gb.right <= zb.left
              ? zb.left - gb.right
              : gb.left >= zb.right
                ? gb.left - zb.right
                : gb.bottom <= zb.top
                  ? zb.top - gb.bottom
                  : gb.top >= zb.bottom
                    ? gb.top - zb.bottom
                    : -1;
          return {
            deckkraft: Number(getComputedStyle(g).opacity),
            imBild:
              gb.top >= 64 &&
              gb.bottom <= window.innerHeight &&
              gb.left >= 0 &&
              gb.right <= window.innerWidth,
            luecke: Math.round(luecke),
            zielHref: z.getAttribute("href"),
          };
        });

        expect(m.deckkraft, "Der Ball ist am Ende des Passes nicht sichtbar.").toBeGreaterThan(0.9);
        expect(
          m.imBild,
          "Der Ball steht bei der Ankunft nicht vollständig im freien Bild " +
            "(oberhalb 64 px liegt die haftende Navigationsleiste) — genau der " +
            "Zustand aus Roadmap 20 (d).",
        ).toBe(true);
        // Kein Verschwinden IN der Taste, aber auch kein Abstellen irgendwo:
        // Kontur zu Kontur, ein einziger Wert für alle Fenster.
        expect(
          m.luecke,
          "Der Ball überlappt die Taste oder liegt zu weit weg.",
        ).toBeGreaterThanOrEqual(8);
        expect(m.luecke).toBeLessThanOrEqual(30);
        expect(m.zielHref).toBe(angemeldet ? "/feedback" : "/signup");
      });
    }
  }

  test("der Abschluss-Block existiert auch für Angemeldete", async ({ page }) => {
    // ⚠️ Er fiel bis zum 21.08.2026 komplett weg (`if (loggedIn) return null`).
    // Mit der Ballreise ist das kein Sparen mehr, sondern ein Ziel, das fehlt.
    await page.setViewportSize({ width: 1280, height: 900 });
    await ladeStartseite(page, { angemeldet: true });
    // ⚠️ Auf den Abschnitt einschränken. „Feedback" steht auch im haftenden
    // Chrome und im Footer – ohne Einschränkung trifft die Suche drei Elemente
    // und bricht ab, ohne etwas über den Abschluss-Block zu sagen.
    const block = page.locator("[data-passfeld]");
    await expect(block.getByRole("heading", { name: "Was fehlt?" })).toBeVisible();
    await expect(block.locator("[data-pass-ziel]")).toHaveText(/Feedback geben/);
  });
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
