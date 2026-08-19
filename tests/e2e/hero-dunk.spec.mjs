import { test, expect } from "@playwright/test";

// ══ DIE VIER PRÜFMASSE DER HERO-ZEICHNUNG „DER ABSCHLUSS" ═══════════════════
//
// Spezifikation: docs/HERO-DUNK-KONZEPT-2026-08-19.md, Abschnitt 9.
// Diese Datei ersetzt sieben gelöschte Ball-Tests (Begründung je Datei in
// tests/e2e/README.md, Abschnitt „Entfallene Tests").
//
// ⚠️ WARUM ES WENIGE UND NICHT VIELE PRÜFMASSE SIND (Schule aus Roadmap 20b/20d):
// Die Ball-Prüfmaße hingen an Wortlauten, Breiten und Fensterhöhen und brachen
// beim ersten Textwechsel. Die vier hier hängen an Farbwerten, an einer
// Zeitdauer und an der Geometrie der Zeichnung – nicht am Inhalt der Seite.
// Eine Textänderung im Hero macht keinen davon rot.

// Reale Geräte, zwei Achsen. Die Höhenachse ist Pflicht, nicht Kür: Vier
// Gate-Runden lang wurden nur BREITEN geprüft, während der Ausfall an der
// FENSTERHÖHE hing (CLAUDE.md Roadmap 20b).
const VIEWPORTS = [
  [320, 568, "hoch"],
  [360, 800, "hoch"], // verbreitetste Android-Breite Deutschlands
  [375, 667, "hoch"],
  [375, 812, "hoch"],
  [430, 932, "hoch"],
  [768, 1024, "hoch"], // iPad hochkant – der Fall, den ein 768er-Breakpoint zerstört
  [1024, 768, "quer"],
  [1280, 800, "quer"],
  [1440, 900, "quer"],
];

const NAVBAR = 64;

// Scrollposition, an der die Zeichnung fertig ist und der Abschluss auslöst.
// Abgeleitet aus dem Controller (t = (64 − rect.top)/(H·0,45), td = t/0,75),
// NICHT festgeschrieben: Eine gemerkte Zahl wäre bei der ersten Änderung an
// der Bannerhöhe oder an PROGRESS_SPAN falsch – und zwar rot, ohne Defekt.
const AUSLOESER = `(() => {
  const st = document.querySelector("[data-hero-stage]");
  if (!st) throw new Error("[data-hero-stage] fehlt – rendert der Hero?");
  const r = st.getBoundingClientRect();
  return Math.ceil(r.top + window.scrollY - 64 + 0.75 * 0.45 * r.height) + 2;
})()`;

/** Die Fassung, die auf diesem Viewport tatsächlich angezeigt wird. */
const SICHTBARE_FASSUNG = `(() => {
  const alle = [...document.querySelectorAll(".hero-dunk")];
  const sichtbar = alle.filter((s) => getComputedStyle(s).display !== "none");
  return { gesamt: alle.length, sichtbar: sichtbar.length,
           klasse: sichtbar[0]?.classList.contains("hero-dunk-quer") ? "quer" : "hoch" };
})()`;

// ── WCAG-Rechnung (dieselbe Formel wie im Konzept) ──────────────────────────
const lin = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const K = (a, b) => {
  const l1 = Math.max(L(a), L(b));
  const l2 = Math.min(L(a), L(b));
  return (l1 + 0.05) / (l2 + 0.05);
};
const rgb = (s) => {
  const m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(s);
  if (!m) throw new Error(`Farbe nicht lesbar: ${s}`);
  return [+m[1], +m[2], +m[3]];
};

test.describe("Hero-Zeichnung – P1: Kontrastfenster", () => {
  // ⚠️ WAS DIESER TEST MISST UND WAS NICHT — ehrlich benannt, weil ein Prüfmaß,
  // das mehr verspricht als es prüft, schlimmer ist als keines:
  // Er liest die TATSÄCHLICH ANGEWANDTEN Stilwerte (Strichfarbe,
  // `stroke-opacity`, Deckkraft des SVG, Hintergrundfarbe der Bühne, Textfarben)
  // und rechnet daraus den Kontrast. Er tastet KEINEN Rasterpunkt ab – dafür
  // bräuchte die Suite einen PNG-Dekoder, den sie nicht hat.
  //
  // ⚠️ UND ER FRAGT, WELCHE LINIE WELCHEN TEXT WIRKLICH BERÜHRT — statt jede
  // Farbe gegen jede Ebene zu rechnen. Das ist eine Korrektur an mir selbst,
  // und sie ging in beide Richtungen:
  //   · Die erste Fassung prüfte nur `paper-50` und war grün, während die
  //     Kleinzeile unter der Taste über der stärksten Linie auf **2,79 : 1**
  //     lag. Zu wenig geprüft.
  //   · Die zweite Fassung prüfte jede Textfarbe gegen jede Ebene und meldete
  //     „Community" (`brand-400`) mit 3,63 : 1 — **ein Fall, den es nicht
  //     gibt**: Gemessen berührt auf keinem der neun Viewports eine Linie
  //     dieses Wort. Zu viel geprüft, und ein Fehlalarm hätte den Farbakzent
  //     der Überschrift gekostet. Genau das Muster „Barrierefreiheit gewonnen,
  //     Wirkung verloren" aus CLAUDE.md, nur in klein.
  // Gefragt wird deshalb per `isPointInStroke()` — exakt, nicht über
  // Hüllkörper: Die Hüllbox des Zugs ist 738 × 446 px groß und überlappte
  // dadurch Wörter, an denen die Kurve gar nicht vorbeikommt.
  //
  // ⚠️ DER PREIS, UND ER GEHÖRT BENANNT: Dieser Fall ist LAYOUT-ABHÄNGIG. Ein
  // Textwechsel im Hero kann ihn rot machen. Das ist gewollt — dann kreuzt
  // tatsächlich eine Linie ein Wort, das sie vorher nicht kreuzte, und genau
  // das soll auffallen.
  for (const [breite, hoehe] of VIEWPORTS) {
    test(`${breite}x${hoehe}: keine Linie senkt einen Text unter 4,5:1`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForSelector(".hero-dunk", { state: "attached" });
      // Im fertigen Zustand messen: Da hat die Zeichnung ihre größte Ausdehnung.
      const ziel = await page.evaluate(AUSLOESER);
      await page.evaluate((y) => window.scrollTo(0, y), ziel);
      await page.waitForTimeout(700);

      const mess = await page.evaluate(() => {
        const st = document.querySelector("[data-hero-stage]");
        const grund = getComputedStyle(st).backgroundColor;
        const svg = [...document.querySelectorAll(".hero-dunk")].find(
          (s) => getComputedStyle(s).display !== "none",
        );
        const svgOp = parseFloat(getComputedStyle(svg).opacity);
        const ctm = svg.getScreenCTM().inverse();
        const pt = svg.createSVGPoint();
        const linien = [...svg.querySelectorAll("path, ellipse")]
          .filter((e) => getComputedStyle(e).stroke !== "none")
          .map((e) => ({
            el: e,
            farbe: getComputedStyle(e).stroke,
            alpha: svgOp * parseFloat(getComputedStyle(e).strokeOpacity || "1"),
          }));
        const block = st.querySelector(".relative.z-10") || st;
        const lauf = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
        const treffer = [];
        const alleEbenen = new Set();
        for (const l of linien) alleEbenen.add(l.alpha.toFixed(3));
        for (let k = lauf.nextNode(); k; k = lauf.nextNode()) {
          if (!k.nodeValue || !k.nodeValue.trim()) continue;
          const el = k.parentElement;
          // Text auf einer gefüllten Fläche (Taste) liegt VOR der Zeichnung.
          let aufFlaeche = false;
          for (let e = el; e && e !== st; e = e.parentElement) {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && bg !== "transparent" && !/,\s*0\s*\)$/.test(bg)) {
              aufFlaeche = true;
              break;
            }
          }
          if (aufFlaeche) continue;
          const farbe = getComputedStyle(el).color;
          const bereich = document.createRange();
          bereich.selectNodeContents(k);
          const gefunden = new Map();
          for (const r of bereich.getClientRects()) {
            for (let x = r.left; x <= r.right; x += 3) {
              for (let y = r.top; y <= r.bottom; y += 3) {
                pt.x = x;
                pt.y = y;
                const u = pt.matrixTransform(ctm);
                for (const l of linien) {
                  const key = l.alpha.toFixed(3);
                  if (gefunden.has(key)) continue;
                  if (l.el.isPointInStroke(u))
                    gefunden.set(key, { alpha: l.alpha, farbe: l.farbe });
                }
              }
            }
          }
          for (const [, l] of gefunden) {
            treffer.push({
              text: k.nodeValue.trim().slice(0, 26),
              textFarbe: farbe,
              linienFarbe: l.farbe,
              alpha: l.alpha,
            });
          }
        }
        return { grund, treffer, ebenen: [...alleEbenen].sort() };
      });

      const grund = rgb(mess.grund);

      // ⚠️ EHRLICHKEITSSCHRANKE. Ohne sie wäre „kein Text unter 4,5:1" auch
      // dann grün, wenn die Zeichnung gar nicht gerendert hat oder gar keinen
      // Text mehr berührt — ein Ergebnis über nichts. Die Zeichnung SOLL hinter
      // dem Inhalt liegen; berührt sie nirgends Text, stimmt etwas nicht.
      expect(
        mess.treffer.length,
        `Keine einzige Linie berührt freistehenden Text (${mess.ebenen.length} Ebenen gefunden) – die Messung ist leer, nicht grün`,
      ).toBeGreaterThan(0);

      // eslint-disable-next-line no-console
      console.log(
        `P1 ${breite}x${hoehe}`,
        mess.treffer.map((t) => {
          const linie = rgb(t.linienFarbe);
          const misch = grund.map((n, i) => n + (linie[i] - n) * t.alpha);
          return `„${t.text}" über ${t.alpha.toFixed(3)} = ${K(rgb(t.textFarbe), misch).toFixed(2)}:1`;
        }),
      );

      for (const t of mess.treffer) {
        const linie = rgb(t.linienFarbe);
        const misch = grund.map((n, i) => n + (linie[i] - n) * t.alpha);
        const k = K(rgb(t.textFarbe), misch);
        expect(
          k,
          `„${t.text}" (${t.textFarbe}) wird von einer Linie mit wirksamer Deckkraft ${t.alpha.toFixed(3)} gekreuzt: ${k.toFixed(2)}:1 – AA verlangt 4,5:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }

      // Und die Zeichnung selbst muss als Zeichnung lesbar sein: Die stärkste
      // Ebene erreicht die 3:1, die WCAG für bedeutungstragende Grafik
      // verlangt — obwohl sie `aria-hidden` und damit formal dekorativ ist.
      const staerkste = Math.max(...mess.ebenen.map(Number));
      const kStaerkste = K(
        grund.map((n, i) => n + (rgb("rgb(240,122,39)")[i] - n) * staerkste),
        grund,
      );
      expect(
        kStaerkste,
        `stärkste Linie nur ${kStaerkste.toFixed(2)}:1 gegen den Grund`,
      ).toBeGreaterThanOrEqual(3.0);
    });
  }
});

// ⚠️ P1 GILT AUCH FÜR DEN ABSCHLUSS-BLOCK, und das ist nicht Fleiß, sondern
// ein Befund: Dort steht seit dem 19.08.2026 dieselbe Geometrie als ruhendes
// Bild (`KorbRuhe`, Nachfolgerin der 191-KB-Bildsequenz). Mit der Deckkraft des
// Heros kreuzte ihr Ring ab 768 px den Fließtext „Werde Teil der
// Community-Plattform…" – gemessen **2,68 : 1**.
// Der Hero-Test allein hätte das nie gesehen: Er prüft eine andere Fläche.
// Eine Regel, die nur dort gilt, wo man sie geschrieben hat, ist keine Regel.
test.describe("Abschluss-Block – dieselbe Kontrastregel", () => {
  for (const [breite, hoehe] of VIEWPORTS) {
    test(`${breite}x${hoehe}: der ruhende Korb senkt keinen Text unter 4,5:1`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      const ueberschrift = page.getByText("Bereit loszulegen?");
      await ueberschrift.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);

      const mess = await page.evaluate(() => {
        const sec = [...document.querySelectorAll("section")].find((s) =>
          s.textContent.includes("Bereit loszulegen"),
        );
        if (!sec) throw new Error("Abschluss-Block nicht gefunden");
        const svg = sec.querySelector("svg");
        if (!svg) throw new Error("Kein ruhender Korb im Abschluss-Block");
        const grund = getComputedStyle(sec).backgroundColor;
        const svgOp = parseFloat(getComputedStyle(svg).opacity);
        const ctm = svg.getScreenCTM().inverse();
        const pt = svg.createSVGPoint();
        const linien = [...svg.querySelectorAll("path, ellipse")]
          .filter((e) => getComputedStyle(e).stroke !== "none")
          .map((e) => ({
            el: e,
            farbe: getComputedStyle(e).stroke,
            alpha: svgOp * parseFloat(getComputedStyle(e).strokeOpacity || "1"),
          }));
        const lauf = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
        const treffer = [];
        for (let k = lauf.nextNode(); k; k = lauf.nextNode()) {
          if (!k.nodeValue || !k.nodeValue.trim()) continue;
          const el = k.parentElement;
          let aufFlaeche = false;
          for (let e = el; e && e !== sec; e = e.parentElement) {
            const bg = getComputedStyle(e).backgroundColor;
            if (bg && bg !== "transparent" && !/,\s*0\s*\)$/.test(bg)) {
              aufFlaeche = true;
              break;
            }
          }
          if (aufFlaeche) continue;
          const farbe = getComputedStyle(el).color;
          const bereich = document.createRange();
          bereich.selectNodeContents(k);
          const gefunden = new Map();
          for (const r of bereich.getClientRects()) {
            for (let x = r.left; x <= r.right; x += 3) {
              for (let y = r.top; y <= r.bottom; y += 3) {
                pt.x = x;
                pt.y = y;
                const u = pt.matrixTransform(ctm);
                for (const l of linien) {
                  const key = l.alpha.toFixed(3);
                  if (gefunden.has(key)) continue;
                  if (l.el.isPointInStroke(u))
                    gefunden.set(key, { alpha: l.alpha, farbe: l.farbe });
                }
              }
            }
          }
          for (const [, l] of gefunden)
            treffer.push({
              text: k.nodeValue.trim().slice(0, 26),
              textFarbe: farbe,
              linienFarbe: l.farbe,
              alpha: l.alpha,
            });
        }
        return { grund, treffer };
      });

      const grund = rgb(mess.grund);
      expect(
        mess.treffer.length,
        "Der ruhende Korb berührt keinen Text – die Messung ist leer, nicht grün",
      ).toBeGreaterThan(0);
      for (const t of mess.treffer) {
        const linie = rgb(t.linienFarbe);
        const misch = grund.map((n, i) => n + (linie[i] - n) * t.alpha);
        const k = K(rgb(t.textFarbe), misch);
        expect(
          k,
          `„${t.text}" (${t.textFarbe}) über einer Linie mit wirksamer Deckkraft ${t.alpha.toFixed(3)}: ${k.toFixed(2)}:1 – AA verlangt 4,5:1`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe("Hero-Zeichnung – P2: der Korb ist im Bild, wenn der Ball fällt", () => {
  // ⚠️ DAS IST ROADMAP 20 (d) ALS BEDINGUNG VORHER STATT ALS BEFUND NACHHER.
  // Dort steht über die alte Ballreise: „Die Landung ist auf KEINEM Viewport
  // sichtbar … Die Pointe der einen Reise durch die Seite hat noch nie jemand
  // gesehen." Es gab keinen Test, der das gefragt hätte.
  for (const [breite, hoehe] of VIEWPORTS) {
    test(`${breite}x${hoehe}: Ring mindestens 24 px unter der Navigationsleiste`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
      // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
      // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
      // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
      // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
      await page.waitForSelector(".hero-dunk", { state: "attached" });

      const ziel = await page.evaluate(AUSLOESER);
      await page.evaluate((y) => window.scrollTo(0, y), ziel);
      await page.waitForTimeout(700); // Abschluss (420 ms) sicher durch

      const mass = await page.evaluate((navbarVorgabe) => {
        const svg = [...document.querySelectorAll(".hero-dunk")].find(
          (s) => getComputedStyle(s).display !== "none",
        );
        const ring = svg.querySelector("[data-dunk-ring]");
        const ball = svg.querySelector("[data-dunk-ball]");
        const nav = document.querySelector("nav");
        const unterkante = nav
          ? Math.max(0, nav.getBoundingClientRect().bottom)
          : navbarVorgabe;
        const r = ring.getBoundingClientRect();
        const b = ball.getBoundingClientRect();
        return {
          unterkante,
          ringOben: r.top,
          ringUnten: r.bottom,
          ballOben: b.top,
          ballUnten: b.bottom,
          fensterhoehe: window.innerHeight,
        };
      }, NAVBAR);

      expect(
        mass.ringOben - mass.unterkante,
        `Ring beginnt ${(mass.ringOben - mass.unterkante).toFixed(1)} px unter der Navigationsleiste`,
      ).toBeGreaterThanOrEqual(24);
      expect(
        mass.fensterhoehe - mass.ringUnten,
        "Ring wird unten vom Fensterrand geschnitten",
      ).toBeGreaterThanOrEqual(0);
      // Und der Ball, der durchgeht, muss dabei ebenfalls zu sehen sein –
      // ein Abschluss außerhalb des Bildes ist genau der Fehler von vorher.
      expect(
        mass.ballOben - mass.unterkante,
        "Ball liegt bei der Landung hinter der Navigationsleiste",
      ).toBeGreaterThanOrEqual(0);
      expect(
        mass.fensterhoehe - mass.ballUnten,
        "Ball liegt bei der Landung unter dem Fensterrand",
      ).toBeGreaterThanOrEqual(0);
    });
  }
});

test.describe("Hero-Zeichnung – P3: der Abschluss hängt an der Zeit, nicht am Scroll", () => {
  test("nach der Auslösung ändert Scrollen die Ballposition nicht mehr", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
    // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
    // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
    // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
    // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
    await page.waitForSelector(".hero-dunk", { state: "attached" });

    const ziel = await page.evaluate(AUSLOESER);
    await page.evaluate((y) => window.scrollTo(0, y), ziel);
    await page.waitForTimeout(800);

    const lies = () =>
      page.evaluate(() =>
        [...document.querySelectorAll("[data-dunk-ball]")]
          .map((g) => g.getAttribute("transform"))
          .join("|"),
      );

    const ruhe = await lies();
    expect(ruhe, "Ball trägt nach dem Abschluss keine Verschiebung").toContain(
      "translate",
    );

    // 4-px-Schritte vor und zurück über die Schwelle hinweg.
    // ⚠️ TOLERANZ 0. Es ist eine Zustandsmaschine, kein Interpolationswert –
    // jede Abweichung wäre der Beweis, dass doch gescrubbt wird.
    for (const d of [-4, -8, -12, -8, -4, 0, 4, 8, 12]) {
      await page.evaluate((y) => window.scrollTo(0, y), ziel + d);
      await page.waitForTimeout(60);
      expect(
        await lies(),
        `Ballposition hat sich bei Scrollversatz ${d} px geändert – der Abschluss wird gescrubbt`,
      ).toBe(ruhe);
    }
  });

  test("der Abschluss läuft 380–460 ms und wird dabei wirklich gemessen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
    // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
    // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
    // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
    // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
    await page.waitForSelector(".hero-dunk", { state: "attached" });

    // Beobachter VOR dem Auslösen setzen, sonst fehlt der Anfang.
    await page.evaluate(() => {
      window.__spur = [];
      const g = document.querySelector("[data-dunk-ball]");
      new MutationObserver(() => {
        window.__spur.push({
          t: performance.now(),
          v: g.getAttribute("transform"),
        });
      }).observe(g, { attributes: true, attributeFilter: ["transform"] });
    });

    const ziel = await page.evaluate(AUSLOESER);
    await page.evaluate((y) => window.scrollTo(0, y), ziel);
    await page.waitForTimeout(900);

    const spur = await page.evaluate(() => window.__spur);

    // ⚠️ EHRLICHKEITSSCHRANKE (Muster aus CLAUDE.md Roadmap 20f).
    // Ohne sie wäre „nicht scrubbar" ein grünes Ergebnis mit null Messframes –
    // genau der Fall, den Kai in der neunten Runde gefangen hat. Und er ist
    // hier real erreichbar: In einer ausgeblendeten Browser-Vorschaufläche
    // laufen keine rAF-Bilder, die Bewegung fände schlicht nicht statt.
    expect(
      spur.length,
      `Nur ${spur.length} Positionswechsel beobachtet – die Sonde hat nicht gemessen, das Ergebnis ist keines`,
    ).toBeGreaterThanOrEqual(8);

    const dauer = spur[spur.length - 1].t - spur[0].t;
    expect(
      dauer,
      `Abschluss dauerte ${dauer.toFixed(0)} ms (erwartet 380–460)`,
    ).toBeGreaterThan(380);
    expect(dauer).toBeLessThan(460);
  });
});

test.describe("Hero-Zeichnung – P4: der Umschalter ist das Seitenverhältnis", () => {
  // ⚠️ EIN BREITEN-BREAKPOINT BEI 768 WÄRE DER TEUERSTE FEHLER DIESER DATEI:
  // Er schickte das iPad hochkant (768×1024, Bühnenverhältnis 0,800) in die
  // Querformat-Fassung, und dort wären 46 % der Zeichnung weggeschnitten.
  // Deshalb steht 768×1024 in der Liste, und zwar auf der HOCH-Seite.
  for (const [breite, hoehe, erwartet] of VIEWPORTS) {
    test(`${breite}x${hoehe}: genau die ${erwartet === "hoch" ? "Hochformat" : "Querformat"}-Fassung wird gezeigt`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
      // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
      // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
      // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
      // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
      await page.waitForSelector(".hero-dunk", { state: "attached" });

      const f = await page.evaluate(SICHTBARE_FASSUNG);
      expect(f.gesamt, "beide Fassungen müssen im Markup stehen").toBe(2);
      expect(
        f.sichtbar,
        "es darf immer genau eine Fassung angezeigt werden",
      ).toBe(1);
      expect(
        f.klasse,
        `${breite}x${hoehe} zeigt die ${f.klasse}-Fassung, erwartet ${erwartet}`,
      ).toBe(erwartet);
    });
  }

  test("die tragenden Elemente werden auf keinem Viewport angeschnitten", async ({
    page,
  }) => {
    for (const [breite, hoehe] of VIEWPORTS) {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
      // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
      // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
      // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
      // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
      await page.waitForSelector(".hero-dunk", { state: "attached" });

      const mass = await page.evaluate(() => {
        const st = document
          .querySelector("[data-hero-stage]")
          .getBoundingClientRect();
        const svg = [...document.querySelectorAll(".hero-dunk")].find(
          (s) => getComputedStyle(s).display !== "none",
        );
        const raus = {};
        for (const name of ["ring", "netz", "ball"]) {
          const el = svg.querySelector(`[data-dunk-${name}]`);
          const r = el.getBoundingClientRect();
          raus[name] = {
            links: r.left - st.left,
            rechts: st.right - r.right,
            oben: r.top - st.top,
            unten: st.bottom - r.bottom,
          };
        }
        return raus;
      });

      for (const [name, r] of Object.entries(mass)) {
        for (const [seite, wert] of Object.entries(r)) {
          expect(
            wert,
            `${breite}x${hoehe}: ${name} ragt ${(-wert).toFixed(1)} px über die Bühne hinaus (${seite})`,
          ).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

test.describe("Hero-Zeichnung – der stille Punktlinien-Geist", () => {
  // ⚠️ DER TEUERSTE FUND DIESES UMBAUS, UND ER WAR UNSICHTBAR IM CODE.
  // `pathLength="1"` + `stroke-dasharray="1"` ist der bewährte Weg, einen Pfad
  // per `stroke-dashoffset` zu zeichnen. **Zusammen mit
  // `vector-effect: non-scaling-stroke` gilt die Normierung nicht** – der
  // Browser rechnet das Muster im Gerätemaß, und aus „1" wird 1 px an, 1 px
  // aus: eine feine Punktlinie über den ganzen Pfad, unabhängig vom Versatz.
  //
  // Die Folge sieht fast richtig aus: Jede noch nicht gezeichnete Linie steht
  // als halbheller Geist im Bild. Kein Konsolenfehler, kein kaputtes Layout.
  // Gefunden wurde es nur, weil im ersten Bild zwei Diagonalen standen, wo per
  // Konstruktion nichts stehen durfte.
  //
  // ⚠️ WARUM DIESER TEST DIE LÄNGE PRÜFT UND NICHT „IST DIE LINIE UNSICHTBAR":
  // Eine Sichtbarkeitsprüfung müsste Rasterpunkte abtasten. Der Zustand, der
  // den Defekt AUSMACHT, ist dagegen exakt benennbar: `stroke-dasharray` muss
  // die echte Pfadlänge tragen, nie den normierten Wert 1.
  test("jede Zeichenlinie trägt ihre echte Länge als Strichmuster", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
    // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
    // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
    // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
    // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
    await page.waitForSelector(".hero-dunk", { state: "attached" });
    await page.waitForTimeout(300);

    const pfade = await page.evaluate(() =>
      [...document.querySelectorAll("[data-dunk-path]")].map((el) => ({
        d: (el.getAttribute("d") || "").slice(0, 18),
        dash: el.style.strokeDasharray,
        laenge: el.getTotalLength(),
        ve: getComputedStyle(el).vectorEffect,
      })),
    );

    expect(pfade.length, "keine Zeichenlinien gefunden").toBeGreaterThan(3);
    for (const p of pfade) {
      expect(
        p.dash,
        `${p.d}: strokeDasharray ist "${p.dash}" – der Controller hat die Länge nicht gesetzt`,
      ).not.toBe("");
      const teile = p.dash.split(/[,\s]+/).map(parseFloat);
      expect(
        Math.abs(teile[0] - p.laenge),
        `${p.d}: Strichmuster ${teile[0]} weicht von der Pfadlänge ${p.laenge.toFixed(1)} ab`,
      ).toBeLessThan(0.5);
      // ⚠️ DIE LÜCKE MUSS LÄNGER SEIN ALS DER PFAD. Grenzen „gezeichnet" und
      // „nicht gezeichnet" exakt aneinander, lässt der kleinste Rundungsrest
      // einen Strichsplitter stehen – und `stroke-linecap: round` macht daraus
      // einen vollen Punkt in Strichbreite. Genau so stand ein orangefarbener
      // Punkt über der Taste, wo noch nichts gezeichnet sein durfte.
      expect(
        teile[1],
        `${p.d}: Strichmuster hat keine zweite Zahl ("${p.dash}") – ohne Spielraum erzeugt Rundungsstaub einen sichtbaren Punkt`,
      ).toBeGreaterThan(p.laenge);
      const wert = teile[0];
      // Der Wert 1 ist genau der Zustand, in dem der Geist entsteht.
      expect(
        wert,
        `${p.d}: Strichmuster steht auf 1 – das ist der normierte Wert, und mit non-scaling-stroke wird daraus eine Punktlinie`,
      ).toBeGreaterThan(2);
    }
  });

  // ⚠️ DER TEST, DER DEN ZWEITEN ANLAUF GEFANGEN HÄTTE — und der erste tat es
  // NICHT. Er verglich das Strichmuster mit `getTotalLength()`, beides in
  // BENUTZEREINHEITEN, und war grün, während auf 1280 px sichtbar 19 % jeder
  // Linie fehlten: Unter `vector-effect: non-scaling-stroke` gilt das Muster im
  // GERÄTEMASS, und bei Maßstab 1,231 deckt ein Muster von 704,6 einen Pfad von
  // 867 Geräteeinheiten eben nicht ab.
  // **Richtig gemessen, in der falschen Einheit** — dieselbe Fehlerklasse wie
  // „Bühne statt Sichtfeld" aus CLAUDE.md Roadmap 20b.
  // Dieser Fall fragt deshalb nicht nach Zahlen, sondern nach dem ERGEBNIS:
  // Ist die fertig gezeichnete Linie so groß wie ihre Geometrie? Ein Stück, das
  // das Strichmuster wegnimmt, verkleinert das gezeichnete Rechteck.
  test("die fertige Zeichnung ist auf jedem Maßstab vollständig", async ({
    page,
  }) => {
    for (const [breite, hoehe] of VIEWPORTS) {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForSelector(".hero-dunk", { state: "attached" });
      const ziel = await page.evaluate(AUSLOESER);
      await page.evaluate((y) => window.scrollTo(0, y), ziel);
      await page.waitForTimeout(700);

      const pfade = await page.evaluate(() => {
        const svg = [...document.querySelectorAll(".hero-dunk")].find(
          (s) => getComputedStyle(s).display !== "none",
        );
        return [...svg.querySelectorAll("[data-dunk-path]")].map((el) => {
          const bb = el.getBBox(); // reine Geometrie, ohne Strich
          const m = el.getScreenCTM(); // enthält `slice`-Maßstab und Verschiebung
          const r = el.getBoundingClientRect(); // gezeichnet, inkl. Strich
          return {
            d: (el.getAttribute("d") || "").slice(0, 16),
            ve: getComputedStyle(el).vectorEffect,
            sollBreite: bb.width * m.a,
            sollHoehe: bb.height * m.d,
            istBreite: r.width,
            istHoehe: r.height,
          };
        });
      });

      expect(pfade.length, "keine Zeichenlinien gefunden").toBeGreaterThan(3);
      for (const p of pfade) {
        // ⚠️ Die Regel, nicht nur ihr Symptom: Unter `non-scaling-stroke`
        // stimmt die Muster-Arithmetik nur bei Maßstab 1.
        expect(
          p.ve,
          `${breite}x${hoehe} ${p.d}: vector-effect ist "${p.ve}" – unter non-scaling-stroke gilt das Strichmuster im Gerätemaß, die Rechnung stimmt dann nur zufällig`,
        ).toBe("none");
        // Der Strich addiert immer etwas dazu und zieht nie ab; ein „ist"
        // unterhalb des „soll" heißt: Ein Stück der Linie wird nicht gezeichnet.
        expect(
          p.istBreite + 1.5,
          `${breite}x${hoehe} ${p.d}: gezeichnet ${p.istBreite.toFixed(1)} px breit, Geometrie verlangt ${p.sollBreite.toFixed(1)} – die Linie ist unvollständig`,
        ).toBeGreaterThanOrEqual(p.sollBreite);
        expect(
          p.istHoehe + 1.5,
          `${breite}x${hoehe} ${p.d}: gezeichnet ${p.istHoehe.toFixed(1)} px hoch, Geometrie verlangt ${p.sollHoehe.toFixed(1)} – die Linie ist unvollständig`,
        ).toBeGreaterThanOrEqual(p.sollHoehe);
      }
    }
  });

  test("bei reduzierter Bewegung steht das Standbild ohne Strichmuster", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 360, height: 800 },
    });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    // ⚠️ `state: "attached"`, NICHT sichtbar. Der Vorgabewert wartet auf
    // SICHTBARKEIT und nimmt dabei den ersten Treffer – und das ist im
    // Querformat die per `display:none` ausgeblendete Hochformat-Fassung.
    // Der Test lief dadurch in seinen Zeitablauf, ohne dass am Produkt etwas
    // fehlte. Eigener Fehlgriff, gefangen im ersten Lauf.
    await page.waitForSelector(".hero-dunk", { state: "attached" });
    await page.waitForTimeout(300);

    const zustand = await page.evaluate(() => {
      const pfade = [...document.querySelectorAll("[data-dunk-path]")].map(
        (el) => getComputedStyle(el).strokeDasharray,
      );
      const ball = document
        .querySelector("[data-dunk-ball]")
        .getAttribute("transform");
      return { pfade, ball };
    });

    expect(zustand.pfade.length).toBeGreaterThan(3);
    for (const d of zustand.pfade) {
      // ⚠️ „none" heißt durchgezogen. Stünde hier „1px", wäre das Standbild für
      // Nutzer mit reduzierter Bewegung eine gepunktete Zeichnung – dauerhaft,
      // und ausgerechnet für die Gruppe, die es am wenigsten einordnen kann.
      expect(
        d,
        `Standbild trägt Strichmuster "${d}" statt einer durchgezogenen Linie`,
      ).toBe("none");
    }
    // Der gewählte Ruhezustand ist der SCHEITELPUNKT: Ball über dem Ring, der
    // Abschluss findet nicht statt. Ein verschobener Ball wäre der Endzustand.
    expect(
      zustand.ball,
      "bei reduzierter Bewegung darf der Ball nicht verschoben sein",
    ).toBeNull();

    await ctx.close();
  });
});
