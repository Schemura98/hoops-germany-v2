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
