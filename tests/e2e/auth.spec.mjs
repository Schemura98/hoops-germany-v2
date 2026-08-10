// Auth-Kernpfad: Login (gültig/ungültig), Signup (neu/Duplikat),
// Dual-Auth-Grundfall (Spieler-Token → Team-Admin-Zugriff).
// Läuft AUSSCHLIESSLICH gegen die Dev-DB `hoopsgermany` (Guard in global-setup).
// Voraussetzung: Seed-Daten via `node scripts/seed-demo.mjs`
// (max@test.de = Team-Admin "Test Baskets", sven.adler@test.de = Free Agent).
import { test, expect } from "@playwright/test";
import { newDisposableEmail, recordCreatedEmail } from "./helpers/created-users.mjs";

const SEED_ADMIN = { email: "max@test.de", password: "test123" };
const SEED_FREE_AGENT = { email: "sven.adler@test.de", password: "test123" };

async function uiLogin(page, email, password) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

function getPlayerToken(page) {
  return page.evaluate(() => window.localStorage.getItem("playerAuthToken"));
}

test.describe("Login", () => {
  test("gültige Anmeldedaten → Newsfeed + playerAuthToken gesetzt", async ({ page }) => {
    await uiLogin(page, SEED_ADMIN.email, SEED_ADMIN.password);
    await page.waitForURL("**/player/newsfeed", { timeout: 60_000 });
    expect(await getPlayerToken(page)).toBeTruthy();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("player")));
    expect(stored?.email).toBe(SEED_ADMIN.email);
    expect(stored?.isTeamAdmin).toBe(true);
  });

  test("falsches Passwort → Fehlermeldung, kein Token, bleibt auf /login", async ({ page }) => {
    await uiLogin(page, SEED_ADMIN.email, "definitiv-falsch");
    await expect(page.getByText("Ungültige Anmeldedaten")).toBeVisible();
    expect(page.url()).toContain("/login");
    expect(await getPlayerToken(page)).toBeNull();
  });

  test("unbekannte E-Mail → gleiche generische Fehlermeldung (kein User-Enumeration-Leck)", async ({
    page,
  }) => {
    await uiLogin(page, "gibt-es-nicht@hoops-e2e.test", "irgendwas123");
    await expect(page.getByText("Ungültige Anmeldedaten")).toBeVisible();
    expect(await getPlayerToken(page)).toBeNull();
  });
});

test.describe("Signup", () => {
  test("neuer Account mit Wegwerf-Mail → eingeloggt im Newsfeed", async ({ page }) => {
    const email = recordCreatedEmail(newDisposableEmail("signup")); // Intent VOR Anlage aufzeichnen
    await page.goto("/signup");
    await page.fill('input[name="firstName"]', "Kai");
    await page.fill('input[name="lastName"]', "Testlauf");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "test1234");
    await page.fill('input[name="confirm"]', "test1234");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/player/newsfeed", { timeout: 60_000 });
    expect(await getPlayerToken(page)).toBeTruthy();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("player")));
    expect(stored?.email).toBe(email);
  });

  test("Duplikat-Mail → 409-Fehlermeldung, kein zweiter Account", async ({ page, request }) => {
    // Eigenen Wegwerf-Account per API anlegen (nicht den Seed-Bestand benutzen) …
    const email = recordCreatedEmail(newDisposableEmail("dup"));
    const create = await request.post("/api/player/playerregister", {
      data: { firstName: "Kai", lastName: "Duplikat", email, password: "test1234" },
    });
    expect(create.status()).toBe(201);

    // … und dann im UI mit derselben Mail erneut registrieren.
    await page.goto("/signup");
    await page.fill('input[name="firstName"]', "Kai");
    await page.fill('input[name="lastName"]', "Duplikat");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "test1234");
    await page.fill('input[name="confirm"]', "test1234");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Diese E-Mail-Adresse ist bereits registriert")).toBeVisible();
    expect(page.url()).toContain("/signup");
    expect(await getPlayerToken(page)).toBeNull();
  });
});

test.describe("Dual-Auth (Spieler-Token für Team-Admin-Zugriff)", () => {
  async function apiLogin(request, creds) {
    const res = await request.post("/api/player/playerlogin", { data: creds });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeTruthy();
    return body.token;
  }

  test("Team-Admin-Spieler-Token → /api/team/fetchinfo liefert sein Team", async ({ request }) => {
    const token = await apiLogin(request, SEED_ADMIN);
    const res = await request.post("/api/team/fetchinfo", {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.team?.teamName).toBe("Test Baskets");
    // Sensible Felder dürfen nie mitkommen (TEAM_PUBLIC_FIELDS).
    expect(body.team?.password).toBeUndefined();
  });

  test("Spieler OHNE Team-Admin-Rolle → 401 (kein Team-Zugriff)", async ({ request }) => {
    const token = await apiLogin(request, SEED_FREE_AGENT);
    const res = await request.post("/api/team/fetchinfo", {
      headers: { Authorization: `Bearer ${token}` },
      data: {},
    });
    expect(res.status()).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  test("ohne Token → 401 Nicht authentifiziert", async ({ request }) => {
    const res = await request.post("/api/team/fetchinfo", { data: {} });
    expect(res.status()).toBe(401);
  });
});
