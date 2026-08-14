// Deploy-Gate 14.08.2026: Such-Overlay der öffentlichen Navbar.
//
// Deckt die drei Gate-Kleinigkeiten vom 13.08. ab, die hier nachgezogen wurden:
//   1. Escape schließt die Suche (vorher führte genau EIN Weg heraus: das ×).
//   2. Klick auf den abgedunkelten Grund schließt – aber ein Klick INS Feld
//      darf es nicht. Das ist die eigentliche Falle: Ohne die Prüfung
//      `e.target === e.currentTarget` blubbert jeder Klick ins Suchfeld nach
//      oben durch und schließt den Dialog mitten im Tippen. Ein Test, der nur
//      „Hintergrundklick schließt" prüft, wäre bei genau dieser Regression grün.
//   3. Trefferflächen der Chrome-Symbole ≥ 24 px (WCAG 2.5.8).
// Dazu die Regression zu Ronjas R8: Ligen sind mitdurchsucht UND der
// Platzhalter sagt es auch – der Text nannte sie einen Tag lang nicht.
//
// Läuft AUSSCHLIESSLICH gegen die Dev-DB `hoopsgermany` (Guard in global-setup).
// Voraussetzung: Seed-Daten via `node scripts/seed-demo.mjs`.
import { test, expect } from "@playwright/test";

// Öffentliche Seite mit Navbar – bewusst nicht „/", damit die Scroll-Bühne der
// Startseite (HeroScrollStage) nicht mitspielt.
const SEITE = "/spieler";

// ⚠️ Das Suchfeld IMMER über den Dialog greifen, nie über die Seite. `/spieler`
// hat ein eigenes Filterfeld („Name, Team oder Stadt suchen…"), ein
// seitenweiter Platzhalter-Locator trifft also zwei Felder und bricht mit
// „strict mode violation" – beim ersten Lauf genau so passiert.
function suchfeld(dialog) {
  return dialog.getByPlaceholder(/suchen/i);
}

async function sucheOeffnen(page) {
  await page.goto(SEITE);
  await page.getByLabel("Suche öffnen").click();
  const dialog = page.getByRole("dialog", { name: "Suche" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("Such-Overlay – Auswege", () => {
  test("Escape schließt die Suche", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("Escape verwirft auch den eingetippten Suchbegriff", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    await suchfeld(dialog).fill("Max");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.getByLabel("Suche öffnen").click();
    // Beim erneuten Öffnen darf der alte Begriff nicht wieder dastehen.
    await expect(suchfeld(dialog)).toHaveValue("");
  });

  test("Klick auf den abgedunkelten Grund schließt", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    // UNTERHALB des Dialogs klicken, nicht oben: Die sticky Navbar liegt in
    // der oberen Leiste über dem Grund, ein Klick auf (12,12) landet auf ihr
    // und schließt nichts – beim ersten Lauf genau so danebengegriffen.
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    await page.mouse.click(viewport.width / 2, box.y + box.height + 60);
    await expect(dialog).toBeHidden();
  });

  test("Klick INS Suchfeld schließt NICHT", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    const feld = suchfeld(dialog);
    await feld.click();
    await feld.pressSequentially("Ma");
    await expect(dialog).toBeVisible();
    await expect(feld).toHaveValue("Ma");
  });

  test("das × schließt weiterhin", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    await page.getByLabel("Suche schließen").click();
    await expect(dialog).toBeHidden();
  });

  // Das Overlay sagt `aria-modal="true"` zu – für einen Screenreader ist die
  // Seite dahinter damit inert. Diese beiden Tests halten fest, dass die Zusage
  // auch eingelöst wird (Befund A5 von Kai, 14.08.2026).
  test("Tab bleibt im Dialog – auch mit Trefferliste und rückwärts", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    // ⚠️ Erst tippen (Befund A2 von Kai): Bei leerem Suchbegriff hat das Panel
    // genau zwei fokussierbare Elemente, und die Falle wird kaum gefordert.
    // Der interessante Fall ist die gefüllte Trefferliste – dort werden die
    // Ziele bei jedem Tastendruck neu abgefragt.
    await suchfeld(dialog).fill("a");
    await expect(dialog.getByRole("link").first()).toBeVisible({ timeout: 15_000 });

    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    let drin = await dialog.evaluate((box) => box.contains(document.activeElement));
    expect(drin, "der Fokus ist beim Vorwärtstabben aus dem Dialog gewandert").toBe(true);

    // Rückwärts war bislang komplett ungeprüft – der `e.shiftKey`-Zweig lief nie.
    for (let i = 0; i < 12; i++) await page.keyboard.press("Shift+Tab");
    drin = await dialog.evaluate((box) => box.contains(document.activeElement));
    expect(drin, "der Fokus ist beim Rückwärtstabben aus dem Dialog gewandert").toBe(true);
  });

  test("Klick auf eine tote Stelle im Panel wirft den Fokus nicht hinaus", async ({ page }) => {
    // Befund A3 von Kai: Ohne `tabIndex={-1}` am Panel landet ein Klick auf
    // eine nicht fokussierbare Stelle (Lupensymbol, Leerraum, „Keine
    // Ergebnisse") auf `<body>`. Dann greift keine der Kantenprüfungen mehr,
    // und der nächste Tab läuft hinter das Overlay – derselbe Ausgang wie ohne
    // Falle, nur mit der Maus betreten.
    const dialog = await sucheOeffnen(page);
    const box = await dialog.boundingBox();
    // Knapp unter den Kopf des Panels, wo weder Feld noch Knopf liegen.
    await page.mouse.click(box.x + 12, box.y + box.height - 8);
    await page.keyboard.press("Tab");
    const drin = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(drin, "nach einem Klick ins Leere führt Tab aus dem Dialog heraus").toBe(true);
  });

  test("nach dem Schließen kehrt der Fokus auf den Öffner zurück", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // Ohne Rückgabe landet der Fokus auf <body>: Wer die Suche mit der Tastatur
    // öffnet und schließt, müsste sich von ganz oben neu durchtabben.
    const label = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    expect(label).toBe("Suche öffnen");
  });
});

test.describe("Such-Overlay – Ligen (Ronjas R8)", () => {
  test("der Platzhalter nennt Ligen, nicht nur Spieler und Team", async ({ page }) => {
    const dialog = await sucheOeffnen(page);
    const text = await suchfeld(dialog).getAttribute("placeholder");
    expect(text.toLowerCase()).toContain("liga");
  });

  test("eine echte Liga ist über die Suche auffindbar", async ({ page, request }) => {
    // Ligennamen nicht hart verdrahten: Die Seed-Daten dürfen sich ändern,
    // ohne dass dieser Test dabei falsch grün oder falsch rot wird.
    const res = await request.get("/api/leagues");
    const body = await res.json();
    const ligen = body.leagues || body || [];
    test.skip(ligen.length === 0, "Keine Ligen in der Dev-DB – seed-demo.mjs läuft?");

    const liga = ligen[0];
    const dialog = await sucheOeffnen(page);
    await suchfeld(dialog).fill(liga.name.slice(0, 6));

    // Der Treffer muss auf die Liga-Seite zeigen – dass irgendein Eintrag
    // erscheint, genügt nicht: Spieler und Teams landen in derselben Liste.
    const treffer = dialog.locator(`a[href="/ligen/${liga._id}"]`);
    await expect(treffer.first()).toBeVisible();
  });
});

test.describe("Nachfiltern, sobald die Daten da sind", () => {
  // Der einzige echte Funktionsfehler, den dieser Umbau behoben hat – und er
  // hatte zunächst keinen Test (Befund A7 von Kai). Die Suche lädt Spieler,
  // Teams und Ligen erst beim Öffnen. Wer sofort lostippt, tat das gegen ein
  // leeres `searchData`; die Eingabe wurde verworfen und nichts filterte nach,
  // also stand „Keine Ergebnisse" über etwas, das es gibt. Ohne diesen Test
  // kann der Effekt bei der nächsten Navbar-Überarbeitung still verschwinden –
  // er trägt ein `eslint-disable` und sieht nach Aufräum-Kandidat aus.
  test("Eingabe VOR dem Laden der Daten geht nicht verloren", async ({ page }) => {
    // Die drei Abrufe künstlich verzögern, damit das Rennen sicher entsteht.
    for (const muster of ["**/api/player/fetchall", "**/api/team/fetchteams", "**/api/leagues"]) {
      await page.route(muster, async (route) => {
        await new Promise((r) => setTimeout(r, 1500));
        await route.continue();
      });
    }

    await page.goto(SEITE);
    await page.getByLabel("Suche öffnen").click();
    const dialog = page.getByRole("dialog", { name: "Suche" });
    await expect(dialog).toBeVisible();

    // Sofort tippen – die Daten sind garantiert noch unterwegs.
    await suchfeld(dialog).fill("Max");
    await expect(dialog.getByText("Lädt…")).toBeVisible();

    // Ohne den Nachfilter-Effekt bliebe es bei „Keine Ergebnisse", ohne dass
    // der Nutzer je erfährt, dass es Treffer gäbe.
    await expect(dialog.getByRole("link").first()).toBeVisible({ timeout: 15_000 });
    await expect(dialog.getByText("Keine Ergebnisse")).toHaveCount(0);
  });
});

test.describe("Trefferflächen der Chrome-Symbole (WCAG 2.5.8)", () => {
  // 24 px ist das Mindestmaß der Richtlinie. Gemeldet wurden 20×20 px.
  const MINDEST = 24;

  // ⚠️ ALLE Icon-Knöpfe der Leiste prüfen, nicht eine Auswahl. Die erste
  // Fassung dieses Tests nannte Lupe und Feedback beim Namen – der Hamburger
  // blieb dadurch bei 20×20 px und rutschte an 34 grünen Tests vorbei, obwohl
  // er der einzige Zugang zur mobilen Navigation ist (gefunden von Tobias am
  // Gerät, nicht hier). Eine Namensliste prüft, woran man gedacht hat; diese
  // Fassung prüft, was da ist.
  test("jeder Icon-Knopf der öffentlichen Leiste ist groß genug (mobil)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SEITE);

    const leiste = page.locator("nav").first();
    const ziele = leiste.locator("a[aria-label], button[aria-label]");
    const anzahl = await ziele.count();
    expect(anzahl, "keine beschrifteten Icon-Ziele gefunden").toBeGreaterThan(0);

    const zuKlein = [];
    for (let i = 0; i < anzahl; i++) {
      const ziel = ziele.nth(i);
      if (!(await ziel.isVisible())) continue;
      const label = await ziel.getAttribute("aria-label");
      const box = await ziel.boundingBox();
      if (!box) continue;
      if (Math.round(box.width) < MINDEST || Math.round(box.height) < MINDEST) {
        zuKlein.push(`${label}: ${Math.round(box.width)}×${Math.round(box.height)}`);
      }
    }
    expect(zuKlein, `zu kleine Trefferflächen: ${zuKlein.join(", ")}`).toEqual([]);
  });

  for (const label of ["Suche öffnen", "Feedback geben"]) {
    test(`„${label}" misst mindestens ${MINDEST}×${MINDEST} px`, async ({ page }) => {
      await page.goto(SEITE);
      const box = await page.getByLabel(label).first().boundingBox();
      expect(box, `${label} nicht gefunden`).not.toBeNull();
      expect.soft(Math.round(box.width)).toBeGreaterThanOrEqual(MINDEST);
      expect(Math.round(box.height)).toBeGreaterThanOrEqual(MINDEST);
    });
  }

  test("das × im offenen Overlay misst mindestens 24×24 px", async ({ page }) => {
    await sucheOeffnen(page);
    const box = await page.getByLabel("Suche schließen").boundingBox();
    expect(box).not.toBeNull();
    expect.soft(Math.round(box.width)).toBeGreaterThanOrEqual(MINDEST);
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(MINDEST);
  });
});
