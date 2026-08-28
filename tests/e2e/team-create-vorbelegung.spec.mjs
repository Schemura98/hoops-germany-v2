// Wächter für das Vor-Teststart-Paket 46f7384 (Gate Kai, 28.08.2026).
// Zwei Gegenstände, vier Zusicherungen:
//
// (1) VORBELEGUNG (app/team/create/page.js): Wer ein Profil mit Wohnort und
//     Bundesland hat, sieht auf /team/create beide Felder vorbelegt, und die
//     Liga-Auswahl ist damit auf das eigene Bundesland eingegrenzt — der
//     Gründer sieht seine Ligen statt des bundesweiten Katalogs (Befund Lina
//     M1). Sollwerte werden aus der API GELESEN, nicht fest eingetragen
//     (Regel aus eigene-zahlen.spec.mjs): Der Test vergleicht die Optionen
//     des Liga-Dropdowns mit einer eigenen Nachrechnung derselben Filterung
//     auf /api/leagues.
//     ⚠️ Ehrlichkeitsschranke: Grenzt das Bundesland im aktuellen Katalog
//     GAR NICHTS ein (alle Ligen desselben Bundeslands), erklärt sich der
//     Fall für WERTLOS STATT BESTANDEN — er könnte den Rückfall („Filter
//     wirkt nicht") per Konstruktion nicht sehen (Muster
//     feed-kachel-gleichheit.spec.mjs).
//
// (2) VORBELEGUNG ÜBERSCHREIBT NICHT: Vom Nutzer beschriebene Felder bleiben
//     stehen, auch wenn der Spieler-Datensatz DANACH neu lädt. Der reale
//     Re-Lauf-Pfad ist `hg:player-updated` (lib/useCurrentPlayer.js:78 —
//     die Tour speichert und feuert das Ereignis; WelcomeTour hängt über
//     app/layout.js auf JEDER Seite, auch dieser). Der Test tippt eigene
//     Werte, feuert das Ereignis, wartet die echte getmyinfo-Antwort ab und
//     misst dann. Ohne die `f.region ||`-Schranke in der Vorbelegung wird
//     dieser Fall rot (Mutationsmatrix, einzeln gefahren).
//
// (3) ERKLÄRTE WEITERLEITUNG (Roadmap 35): Ein Team-Admin, der /team/create
//     aufruft, landet auf /team/admin MIT ?hinweis=schon-admin, und dort
//     steht der Kasten „Du bist hier richtig" mit dem ECHTEN Teamnamen des
//     eingeloggten Admins (aus /api/team/fetchinfo gelesen, nicht
//     hartkodiert). Der X-Knopf schließt ihn.
//
// (4) OHNE PARAM KEIN KASTEN: Wer /team/admin normal aufruft, sieht nichts —
//     der Hinweis ist an den Umleitungsweg gebunden, keine Dauerfläche.
//
// ⚠️ KEINE DB-Schreibungen: Alle Vorbedingungen kommen aus dem Dev-Seed
// (ben.schulz6@test.de mit Wohnort, max@test.de als Admin „Test Baskets");
// fehlen sie, bricht der Test MIT BEFUND ab statt still grün zu sein. Grund:
// Kai- und Tobias-Gates teilen sich die Dev-DB (offener Punkt aus der
// Admin-Tour-Runde) — dieser Lauf hinterlässt bewusst keine Spuren.
import { test, expect } from "@playwright/test";

const PW = "test123";
const GRUENDER_MAIL = "ben.schulz6@test.de"; // Kader-Spieler MIT Wohnort, KEIN Admin
const ADMIN_MAIL = "max@test.de"; // Haupt-Admin „Test Baskets" (Dev-Seed)

async function anmelden(request, email) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email, password: PW },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token für ${email} – ohne Anmeldung prüft dieser Test nichts. Dev-Seed ausführen?`
  ).toBe(true);
  return token;
}

async function getMyInfo(request, token) {
  const res = await request.post("/api/player/getmyinfo", { data: { token } });
  const j = await res.json().catch(() => ({}));
  return j?.data?.player || j?.player || null;
}

// Anmeldung in den Browser legen und die Spieler-Tour stummschalten
// (hg_welcome_token = Token ⇒ WelcomeTour prüft gar nicht erst) — sie hängt
// über app/layout.js auch über /team/create und /team/admin.
async function alsSpieler(page, token) {
  await page.addInitScript((t) => {
    localStorage.setItem("playerAuthToken", t);
    sessionStorage.setItem("hg_welcome_token", t);
  }, token);
}

// Dieselbe Filterung, die die Seite rechnet (app/team/create/page.js,
// matchingLeagues) — Startzustand der Filter: level "", gender "Herren",
// ageGroup "Senioren". Wer die Seiten-Logik ändert, muss diese Nachrechnung
// mitziehen; weichen beide ab, wird der Fall rot und sagt warum.
function ligaFilter(leagues, bundesland) {
  return leagues.filter((l) => {
    if (bundesland && l.bundesland && l.bundesland !== bundesland) return false;
    if (l.gender && l.gender !== "Herren") return false;
    if (l.ageGroup && l.ageGroup !== "Senioren") return false;
    return true;
  });
}

test.describe("Team gründen: Vorbelegung & erklärte Weiterleitung", () => {
  test("V1: Wohnort + Bundesland sind vorbelegt und die Liga-Liste ist eingegrenzt", async ({
    page,
    request,
  }) => {
    const token = await anmelden(request, GRUENDER_MAIL);
    const spieler = await getMyInfo(request, token);
    // Ehrlichkeitsschranke Prüfdaten: ohne Wohnort im Profil misst der Fall
    // nichts — dann ROT mit Befund, nicht still grün.
    expect(
      Boolean(spieler?.hometown && spieler?.bundesland),
      `${GRUENDER_MAIL} hat keinen Wohnort/kein Bundesland im Profil ` +
        `(hometown="${spieler?.hometown}", bundesland="${spieler?.bundesland}") — ` +
        `die Vorbelegung ist damit nicht messbar. Dev-Seed prüfen.`
    ).toBe(true);
    expect(
      Boolean(spieler?.isTeamAdmin),
      `${GRUENDER_MAIL} ist inzwischen Team-Admin — dieser Fall braucht einen ` +
        `Nicht-Admin, sonst greift die Weiterleitung statt des Formulars.`
    ).toBe(false);

    await alsSpieler(page, token);
    await page.goto("/team/create");

    const stadtFeld = page.locator('input[placeholder="z.B. Berlin"]');
    await expect(stadtFeld).toHaveValue(spieler.hometown, { timeout: 15_000 });
    await expect(page.locator('select[name="bundesland"]')).toHaveValue(
      spieler.bundesland
    );

    // Liga-Dropdown gegen die eigene Nachrechnung derselben Filterung.
    const leaguesRes = await request.get("/api/leagues");
    const leagues = (await leaguesRes.json())?.leagues || [];
    const erwartet = ligaFilter(leagues, spieler.bundesland)
      .map((l) => String(l._id))
      .sort();
    const ohneBundesland = ligaFilter(leagues, "").length;
    // Wertlos statt bestanden: Grenzt das Bundesland nichts ein, kann dieser
    // Fall den Rückfall „Vorbelegung filtert nicht" nicht sehen.
    expect(
      erwartet.length < ohneBundesland,
      `Der Katalog enthält aktuell keine Herren-Senioren-Liga außerhalb von ` +
        `"${spieler.bundesland}" (${erwartet.length} von ${ohneBundesland}) — ` +
        `die Filter-Zusicherung wäre leer. WERTLOS STATT BESTANDEN: ` +
        `Prüfdatenlage herstellen (eine Liga eines anderen Bundeslands genügt).`
    ).toBe(true);

    // Die letzte Auswahl (Liga-Dropdown) trägt die _ids als Options-Werte.
    const optionen = await page
      .locator("select")
      .last()
      .locator("option")
      .evaluateAll((os) =>
        os.map((o) => o.value).filter((v) => v !== "")
      );
    expect(optionen.sort()).toEqual(erwartet);
  });

  test("V2: Vom Nutzer beschriebene Felder überlebt ein Neuladen des Profils", async ({
    page,
    request,
  }) => {
    const token = await anmelden(request, GRUENDER_MAIL);
    await alsSpieler(page, token);
    await page.goto("/team/create");

    const stadtFeld = page.locator('input[placeholder="z.B. Berlin"]');
    await stadtFeld.waitFor({ state: "visible", timeout: 15_000 });
    // Eigene Werte setzen — bewust ANDERE als jede denkbare Vorbelegung.
    await stadtFeld.fill("Prüfhausen");
    await page
      .locator('select[name="bundesland"]')
      .selectOption("Bayern");

    // Der reale Re-Lauf-Pfad: hg:player-updated lädt getmyinfo nach und gibt
    // der Vorbelegung ein NEUES player-Objekt. Auf die echte Antwort warten,
    // damit die Messung nicht vor dem Re-Lauf stattfindet.
    const antwort = page.waitForResponse(
      (r) => r.url().includes("/api/player/getmyinfo") && r.status() === 200,
      { timeout: 15_000 }
    );
    await page.evaluate(() => window.dispatchEvent(new Event("hg:player-updated")));
    await antwort;
    // Ein React-Renderdurchlauf Luft — dann in der Währung des Defekts messen.
    await page.waitForTimeout(250);

    await expect(stadtFeld).toHaveValue("Prüfhausen");
    await expect(page.locator('select[name="bundesland"]')).toHaveValue("Bayern");
  });

  test("V3: Admin auf /team/create → /team/admin?hinweis=schon-admin mit Kasten samt echtem Teamnamen", async ({
    page,
    request,
  }) => {
    const token = await anmelden(request, ADMIN_MAIL);
    const spieler = await getMyInfo(request, token);
    expect(
      Boolean(spieler?.isTeamAdmin && spieler?.teamAdminOf),
      `${ADMIN_MAIL} ist kein Team-Admin mehr — die Weiterleitung ist so nicht messbar.`
    ).toBe(true);
    // Den ECHTEN Teamnamen aus derselben Quelle lesen, aus der die Seite ihn
    // bezieht (useCurrentTeam → /api/team/fetchinfo) — nicht hartkodieren.
    const teamRes = await request.post("/api/team/fetchinfo", { data: { token } });
    const teamName = ((await teamRes.json())?.team || {}).teamName;
    expect(
      typeof teamName === "string" && teamName.length > 0,
      `Kein Teamname über /api/team/fetchinfo — ohne ihn wäre die ` +
        `Teamnamen-Zusicherung des Kastens nicht prüfbar.`
    ).toBe(true);

    await alsSpieler(page, token);
    await page.goto("/team/create");

    // Die Weiterleitung MUSS den erklärenden Param tragen (Roadmap 35).
    await page.waitForURL(/\/team\/admin\?/, { timeout: 20_000 });
    expect(page.url()).toContain("hinweis=schon-admin");

    const kasten = page.getByText("Du bist hier richtig");
    await expect(kasten).toBeVisible({ timeout: 15_000 });
    // Der Kasten nennt den echten Verein, nicht den Fallback „dein Team".
    await expect(
      page.locator("div").filter({ hasText: "Du bist hier richtig" }).last()
    ).toContainText(teamName);

    // Wegklickbar: X schließt, der Kasten ist weg.
    await page.getByRole("button", { name: "Hinweis schließen" }).click();
    await expect(kasten).toBeHidden();
  });

  test("V4: /team/admin ohne Param zeigt den Kasten NICHT", async ({
    page,
    request,
  }) => {
    const token = await anmelden(request, ADMIN_MAIL);
    await alsSpieler(page, token);
    await page.goto("/team/admin");

    // Erst warten, bis die Seite wirklich steht (Panel-Kopf sichtbar) —
    // eine Absenz-Prüfung gegen eine noch leere Seite wäre wertlos.
    await page
      .locator("h1")
      .first()
      .waitFor({ state: "visible", timeout: 20_000 });
    await page.waitForTimeout(500);
    await expect(page.getByText("Du bist hier richtig")).toHaveCount(0);
  });
});
