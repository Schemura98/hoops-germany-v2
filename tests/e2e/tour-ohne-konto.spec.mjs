// Deploy-Gate 14.08.2026: Plattform-Tour OHNE Konto.
//
// Die Tour ist über den Footer-Link auch ausgeloggt erreichbar
// (`components/onboarding/TourLink.js` → Event `hg:open-tour`) und damit die
// einzige Fläche der Seite, die VOR der Registrierung erklärt. Genau dort war
// sie kaputt (Befund Lina, 14.08.2026):
//   • Sie versuchte zu speichern und meldete „Konnte gerade nicht gespeichert
//     werden" – eine Fehlermeldung über einen Versuch, den es nie gab.
//   • Die Schlussfolie sagte „Du hast schon angefangen" über „0 von 4 · 0 %".
//   • Beide Ausgänge führten in die Anmeldemaske, ein „Konto erstellen" fehlte.
//
// Diese Datei hält alle drei fest. Sie ist bewusst reiner Frontend-Test: Es
// wird nichts angelegt und nichts gespeichert – das ist ja gerade der Punkt.
import { test, expect } from "@playwright/test";

// Öffentliche Seite mit Footer. Nicht „/" – dort liegt die Scroll-Bühne.
const SEITE = "/spieler";

// ⚠️ Den Dialog NICHT über seinen Text greifen. Er trägt `aria-labelledby` auf
// den Schritt-Titel, sein zugänglicher Name wechselt also mit jedem Schritt –
// ein Locator wie `.filter({hasText: "Warum hier"})` findet ab Schritt 2 nichts
// mehr und meldet „element not found" statt des echten Befunds. Genau so beim
// ersten Lauf danebengegriffen.
function tourLocator(page) {
  return page.locator('[aria-labelledby="tour-titel"]');
}

async function tourOeffnenOhneKonto(page) {
  await page.goto(SEITE);
  // Sicherstellen, dass wirklich kein Token da ist – sonst prüft der Test den
  // eingeloggten Fall und wäre falsch grün.
  await page.evaluate(() => {
    localStorage.removeItem("playerAuthToken");
    localStorage.removeItem("teamAuthToken");
    localStorage.removeItem("adminAuthToken");
  });
  await page.reload();

  const tour = tourLocator(page);
  // Klick wiederholen, bis die Tour steht. Der Footer-Knopf feuert ein
  // Custom-Event (`hg:open-tour`) – solange React nicht hydratisiert ist,
  // hängt noch kein Listener daran und der Klick verpufft folgenlos. Einzeln
  // lief der Test deshalb grün, in der vollen Suite unter Serverlast rot.
  // Eine feste Wartezeit wäre geraten; `toPass` wartet auf die Wirkung.
  await expect(async () => {
    await page.getByRole("button", { name: "Plattform-Tour" }).click();
    await expect(tour).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });

  await expect(tour.getByText("Warum hier")).toBeVisible(); // Schritt 1 steht
  return tour;
}

// Von der aktuellen Stelle bis zur Schlussfolie. Schritt 2 ist die Wegfrage –
// dort heißt der Weiter-Knopf anders, deshalb die Fallunterscheidung.
async function bisZumSchluss(tour) {
  for (let i = 0; i < 6; i++) {
    const amEnde = await tour
      .getByText(/Jetzt fehlt nur dein Konto/i)
      .isVisible()
      .catch(() => false);
    if (amEnde) return;
    const ohneAngabe = tour.getByRole("button", { name: /Ohne Angabe weiter/i });
    const weiter = tour.getByRole("button", { name: /^Weiter/ });
    if (await ohneAngabe.isVisible().catch(() => false)) await ohneAngabe.click();
    else if (await weiter.isVisible().catch(() => false)) await weiter.click();
    else break;
  }
}

test.describe("Plattform-Tour ohne Konto", () => {
  test("meldet keinen Speicherfehler, wenn eine Position gewählt wird", async ({ page }) => {
    const tour = await tourOeffnenOhneKonto(page);

    // Schritt 1 → 2 (Wegfrage) → 3 (Position)
    await tour.getByRole("button", { name: /^Weiter/ }).click();
    await tour.getByRole("button", { name: /Ich spiele in einem Verein/i }).click();

    const position = tour.getByRole("button", { name: "Point Guard", exact: true });
    await expect(position).toBeVisible();
    await position.click();

    // Das ist der Kern: KEINE Fehlermeldung …
    await expect(tour.getByText(/Konnte gerade nicht gespeichert werden/i)).toHaveCount(0);
    // … aber auch KEINE falsche Erfolgsmeldung. „Steht in deinem Profil" über
    // einem Profil, das es nicht gibt, wäre der schlechtere Tausch: aus einer
    // sichtbaren Fehlermeldung eine unsichtbare Unwahrheit.
    await expect(tour.getByText(/Steht in deinem Profil/i)).toHaveCount(0);
    await expect(
      tour.getByText(/gespeichert wird es, sobald du ein Konto hast/i)
    ).toBeVisible();
  });

  test("Schlussfolie zeigt keinen Fortschritt und führt zur Registrierung", async ({ page }) => {
    const tour = await tourOeffnenOhneKonto(page);
    await bisZumSchluss(tour);

    // Kein „0 von 4 · 0 %" – das behauptete gegenüber jemandem, der noch gar
    // nichts tun konnte, er habe nichts geschafft.
    await expect(tour.getByText(/von 4 Startschritten/i)).toHaveCount(0);
    await expect(tour.getByText(/Du hast schon angefangen/i)).toHaveCount(0);

    await expect(tour.getByText(/Jetzt fehlt nur dein Konto/i)).toBeVisible();

    const knopf = tour.getByRole("link", { name: /Konto erstellen/i });
    await expect(knopf).toBeVisible();
    await expect(knopf).toHaveAttribute("href", "/signup");
  });

  test("der Zweitausgang führt nicht in die Anmeldemaske", async ({ page }) => {
    const tour = await tourOeffnenOhneKonto(page);
    await tour.getByRole("button", { name: /^Weiter/ }).click();
    // Weg „Ich organisiere ein Team" ist der heikle Fall: Sein reguläres Ziel
    // /team/create verlangt einen Login, der Ausgang muss ausgeloggt auf /teams
    // umbiegen.
    await tour.getByRole("button", { name: /Ich organisiere ein Team/i }).click();
    await bisZumSchluss(tour);

    const zweit = tour.getByRole("link", { name: /Erst mal umsehen/i });
    await expect(zweit).toBeVisible();
    const href = await zweit.getAttribute("href");
    expect(href).not.toBe("/player/newsfeed");
    expect(href).not.toBe("/team/create");
    expect(href).toBe("/teams");
  });
});

// Die Quittung nach dem Positions-Tipp sagt „da kommst du jederzeit oben rechts
// hin" und zeigt den Avatar daneben – aber nur, wenn die Spieler-Leiste
// tatsächlich auf dem Bildschirm steht. Erkannt wird das am Marker
// `data-profil-avatar` in components/layout/PlayerNav.js. Dieser Test hält
// beide Hälften fest: Ohne ihn könnte der Marker beim nächsten Umbau still
// verschwinden, und die Quittung fiele wortlos auf die kurze Fassung zurück –
// oder, schlimmer, jemand setzt ihn in die öffentliche Navbar, wo gar kein
// Avatar steht (Befund Tobias, 14.08.2026).
test.describe("Profil-Avatar als Bezugspunkt der Tour", () => {
  test("öffentliche Seiten tragen den Marker NICHT", async ({ page }) => {
    await page.goto(SEITE);
    await expect(page.locator("[data-profil-avatar]")).toHaveCount(0);
  });

  test("die Spieler-Leiste trägt den Marker", async ({ page, request }) => {
    const res = await request.post("/api/player/playerlogin", {
      data: { email: "sven.adler@test.de", password: "test123" },
    });
    expect(res.status()).toBe(200);
    const { token } = await res.json();
    expect(token).toBeTruthy();

    await page.goto(SEITE);
    await page.evaluate((t) => localStorage.setItem("playerAuthToken", t), token);
    await page.goto("/player/player-detail");

    const marker = page.locator("[data-profil-avatar]");
    await expect(marker).toHaveCount(1);
    await expect(marker).toHaveAttribute("href", "/player/player-detail");
  });
});

// Das Avatar-Zitat soll den Satz ergänzen, nicht neben ihm stehen. Genau das
// ging beim ersten Versuch schief: `Gespeichert` war ein Flex-Container, jedes
// Kind wurde ein eigenes Flex-Item, und auf 390 px klaffte mitten im Satz eine
// Lücke von 169 px („…jederzeit oben" endete bei x=117, „rechts hin. (MM)"
// begann bei x=285). Gemessen von Tobias — kein Test konnte das fangen, denn
// zerfallenes Layout wirft keinen Fehler. Prüfkriterium von Kai.
test.describe("Avatar-Zitat sitzt im Satz (mobil)", () => {
  test("Zitat und Satzende teilen dieselbe Zeile", async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const res = await request.post("/api/player/playerlogin", {
      data: { email: "sven.adler@test.de", password: "test123" },
    });
    expect(res.status()).toBe(200);
    const { token } = await res.json();

    await page.goto("/spieler");
    await page.evaluate((t) => localStorage.setItem("playerAuthToken", t), token);
    // Seite MIT Spieler-Leiste – nur dort zeigt die Quittung das Zitat.
    await page.goto("/player/player-detail");
    await expect(page.locator("[data-profil-avatar]")).toHaveCount(1);

    const tour = tourLocator(page);
    await expect(async () => {
      await page.getByRole("button", { name: "Plattform-Tour" }).click();
      await expect(tour).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });

    // Zu Schritt 3 (Position) durchklicken.
    await tour.getByRole("button", { name: /^Weiter/ }).click();
    await tour.getByRole("button", { name: /Ich spiele in einem Verein/i }).click();
    await tour.getByRole("button", { name: "Point Guard", exact: true }).click();

    const quittung = tour.getByText(/Steht in deinem Profil/i).first();
    await expect(quittung).toBeVisible();

    // ⚠️ Gemessen wird die Lücke ZWISCHEN dem Text davor und dem Schluss-Span,
    // nicht innerhalb des Spans. Die erste Fassung dieses Tests maß den Span
    // allein — darin saß der Avatar auch im kaputten Zustand sauber, und der
    // Test blieb grün, während der Satz sichtbar auseinanderfiel. Erst die
    // Gegenprobe (Flex-Container wiederhergestellt → Test trotzdem grün) hat
    // das aufgedeckt.
    const masse = await quittung.evaluate((absatz) => {
      const spanne = absatz.querySelector("span.whitespace-nowrap");
      if (!spanne) return null;
      // Letzte Zeile des Textes, der VOR dem Span steht.
      const bereich = document.createRange();
      bereich.setStart(absatz, 0);
      bereich.setEndBefore(spanne);
      const zeilen = [...bereich.getClientRects()].filter((r) => r.width > 0);
      const davor = zeilen[zeilen.length - 1];
      const s = spanne.getBoundingClientRect();
      return davor
        ? { davorTop: davor.top, davorRechts: davor.right, spanTop: s.top, spanLinks: s.left }
        : null;
    });

    expect(masse, "Text vor dem Span nicht gefunden").not.toBeNull();

    const gleicheZeile = Math.abs(masse.spanTop - masse.davorTop) < 8;
    const luecke = masse.spanLinks - masse.davorRechts;

    // Zwei zulässige Zustände: Der Span setzt den Satz in derselben Zeile fort
    // (dann darf die Lücke nur ein Leerzeichen breit sein), ODER er beginnt
    // eine neue Zeile (dann steht er links). Unzulässig ist genau der Fall,
    // den Tobias gemessen hat: gleiche Zeile, aber 169 px Loch dazwischen.
    const inOrdnung = gleicheZeile ? luecke < 24 : masse.spanLinks < masse.davorRechts;
    expect(
      inOrdnung,
      `Der Satz zerfällt: Span ${gleicheZeile ? "in derselben Zeile" : "in neuer Zeile"}, ` +
        `Lücke ${Math.round(luecke)} px (davorRechts=${Math.round(masse.davorRechts)}, ` +
        `spanLinks=${Math.round(masse.spanLinks)})`
    ).toBe(true);
  });
});

test.describe("Plattform-Tour – Beleg-Aussage", () => {
  test("verspricht keine doppelte Bestätigung der eigenen Zahlen", async ({ page }) => {
    const tour = await tourOeffnenOhneKonto(page);
    const text = await tour.innerText();

    // Doppelt bestätigt ist das ERGEBNIS (beidseitiges submittedBy), nicht der
    // Box-Score – den trägt ein Team-Admin allein ein. Die alten Formulierungen
    // („Zahlen, die beide Seiten bestätigen" / „muss ein Verein deinen
    // Statistiken nicht glauben") versprachen eine Prüfung, die es für die
    // eigenen Punkte nicht gibt. Siehe docs/MUSTER-ZAHLEN-DIE-LUEGEN.
    expect(text).not.toMatch(/Zahlen, die beide Seiten bestätigen/i);
    expect(text).not.toMatch(/deinen Statistiken nicht glauben/i);
    expect(text).toMatch(/Beide Teams melden das Ergebnis unabhängig voneinander/i);
  });
});
