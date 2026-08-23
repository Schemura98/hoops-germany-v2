// Wächter für die Team-Admin-Tour „Der Spielberichtsbogen" (Gate Kai,
// 23.08.2026, Stand 1110fdf). Sechs Zusicherungen:
//
// (1) AUTO-START NUR IM RICHTIGEN ZUSTAND: /team/admin öffnet die Tour genau
//     dann von selbst, wenn `adminTourSeen` NICHT gesetzt ist UND `welcomeSeen`
//     gesetzt ist (Vorrang-Regel: die Spieler-Tour geht vor, zwei gestapelte
//     Dialoge wären ein neuer Fall für lib/scrollSperre.js). Alle drei
//     Zustände werden geprüft — offen, „schon gesehen", Vorrang.
//
// (2) ERREICHBARKEIT IN DER WÄHRUNG DES BEHOBENEN FEHLERS: Bei offener Tour
//     liegt der Weiter-Knopf VOLLSTÄNDIG im Fenster, und
//     `document.elementFromPoint` in seiner Mitte liefert genau ihn — auf
//     360×800 UND auf Desktop. Hintergrund: Die erste Fassung hing unter dem
//     animate-page-in-Wrapper von PageTransition; dessen Transform machte den
//     Vorfahren zum Bezugsrahmen für `position: fixed`, der Dialog verankerte
//     am DOKUMENT statt am Fenster, und auf 360×800 stand der Weiter-Knopf
//     227 px unter dem Bildschirmrand. Behoben per createPortal(document.body)
//     in components/onboarding/AdminTour.js. Wer das Portal entfernt, macht
//     diesen Fall rot (Mutationsmatrix, einzeln gefahren).
//
// (3) RECHTE-FILTERUNG: Ein Co-Admin, dessen Rechte nur „kader" erlauben,
//     bekommt 3 statt 6 Schritte, KEINE Tryouts-Fußzeile und die Schlussfolie
//     OHNE „Ergebnis melden"-Versprechen (Befund Lina M2, Entscheidung Nele).
//     Der Co-Admin-Zustand wird über eine Antwort-Umschrift von
//     /api/team/fetchinfo hergestellt (adminPlayerId ≠ ich + adminPermissions
//     nur „kader") — die Dev-DB hat keinen solchen Co-Admin, und einen zu
//     seeden hieße Sollwerte seeden (Regel aus Roadmap 38).
//
// (4) PERSISTENZ-RUNDLAUF: „Überspringen" ruft die echte Route
//     /api/player/mark-admin-tour-seen, das Feld steht danach in der DB, und
//     ein Neuladen startet die Tour nicht mehr.
//
// ⚠️ ZUSTANDS-DISZIPLIN: Die Fälle stellen `welcomeSeen`/`adminTourSeen` von
// max@test.de je Fall selbst her (direkte Dev-DB-Schreibung, Schutz über
// requireDevDbUri) und stellen in afterAll den VORGEFUNDENEN Stand wieder her
// — die Dev-DB steht bewusst auf adminTourSeen=false, damit Tobias den
// Auto-Start im Browser sieht; dieser Lauf darf das nicht dauerhaft kippen.
import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import { requireDevDbUri } from "./helpers/env.mjs";

const PW = "test123";
const ADMIN_MAIL = "max@test.de"; // Haupt-Admin „Test Baskets" (Dev-Seed)

let ursprünglich = null; // { welcomeSeen, adminTourSeen } wie vorgefunden

async function anmelden(request) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email: ADMIN_MAIL, password: PW },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  const player = j?.data?.player || j?.player || null;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token für ${ADMIN_MAIL} – ohne Anmeldung prüft dieser Test nichts.`
  ).toBe(true);
  return { token, player };
}

// Anmeldung in den Browser legen und die SPIELER-Tour stummschalten
// (hg_welcome_token = Token ⇒ WelcomeTour prüft gar nicht erst) — sonst läge
// im Vorrang-Fall die Spieler-Tour über der Messung.
async function alsAdmin(page, token) {
  await page.addInitScript((t) => {
    localStorage.setItem("playerAuthToken", t);
    sessionStorage.setItem("hg_welcome_token", t);
  }, token);
}

function spieler() {
  return mongoose.connection.collection("players");
}

async function flagsSetzen(werte) {
  const r = await spieler().updateOne({ email: ADMIN_MAIL }, { $set: werte });
  expect(r.matchedCount, `${ADMIN_MAIL} nicht in der Dev-DB`).toBe(1);
}

const DIALOG = '#admin-tour-titel';

test.describe("Team-Admin-Tour: Auto-Start, Erreichbarkeit, Rechte, Persistenz", () => {
  test.beforeAll(async () => {
    await mongoose.connect(requireDevDbUri());
    const doc = await spieler().findOne(
      { email: ADMIN_MAIL },
      { projection: { welcomeSeen: 1, adminTourSeen: 1 } }
    );
    expect(doc, `${ADMIN_MAIL} fehlt in der Dev-DB — Seed ausführen`).toBeTruthy();
    ursprünglich = {
      welcomeSeen: !!doc.welcomeSeen,
      adminTourSeen: !!doc.adminTourSeen,
    };
  });

  test.afterAll(async () => {
    if (ursprünglich) await flagsSetzen(ursprünglich);
    await mongoose.disconnect();
  });

  test("Auto-Start: welcomeSeen=true + adminTourSeen=false ⇒ Tour offen, 6 Schritte", async ({
    page,
    request,
  }) => {
    await flagsSetzen({ welcomeSeen: true, adminTourSeen: false });
    const { token } = await anmelden(request);
    await alsAdmin(page, token);

    await page.goto("/team/admin");
    await expect(page.locator(DIALOG)).toBeVisible({ timeout: 20_000 });
    // Voll-Admin: alle sechs Schritte — die Rechte-Filterung darf den
    // Haupt-Admin nie treffen.
    await expect(page.getByText("Schritt 1 von 6")).toBeVisible();
  });

  test("Kein Auto-Start: adminTourSeen=true ⇒ Panel ohne Tour", async ({ page, request }) => {
    await flagsSetzen({ welcomeSeen: true, adminTourSeen: true });
    const { token } = await anmelden(request);
    await alsAdmin(page, token);

    await page.goto("/team/admin");
    // Ehrlichkeitsschranke: erst sicherstellen, dass das Panel WIRKLICH
    // geladen ist (der Wiederaufruf-Link existiert nur im ready-Zustand) —
    // sonst wäre „kein Dialog" auch auf einer weißen Fehlerseite wahr.
    await expect(
      page.getByRole("button", { name: /Kurz erklärt/ })
    ).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600); // dem Auto-Start-Effekt Zeit zum Irren
    await expect(page.locator(DIALOG)).toHaveCount(0);

    // Gegenkontrolle im selben Lauf: Der Wiederaufruf-Link öffnet sie doch —
    // beweist, dass „kein Dialog" oben vom Flag kam, nicht von einer Tour,
    // die gar nicht mehr öffnen kann.
    await page.getByRole("button", { name: /Kurz erklärt/ }).click();
    await expect(page.locator(DIALOG)).toBeVisible();
  });

  test("Vorrang: welcomeSeen=false ⇒ Admin-Tour startet NICHT", async ({ page, request }) => {
    await flagsSetzen({ welcomeSeen: false, adminTourSeen: false });
    const { token } = await anmelden(request);
    await alsAdmin(page, token); // hg_welcome_token hält auch die Spieler-Tour zu

    await page.goto("/team/admin");
    await expect(
      page.getByRole("button", { name: /Kurz erklärt/ })
    ).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);
    await expect(page.locator(DIALOG)).toHaveCount(0);
  });

  for (const fenster of [
    { name: "360×800 (mobil)", breite: 360, hoehe: 800 },
    { name: "1280×800 (Desktop)", breite: 1280, hoehe: 800 },
  ]) {
    test(`Erreichbarkeit ${fenster.name}: Weiter-Knopf im Fenster und trifft per elementFromPoint`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width: fenster.breite, height: fenster.hoehe });
      await flagsSetzen({ welcomeSeen: true, adminTourSeen: false });
      const { token } = await anmelden(request);
      await alsAdmin(page, token);

      await page.goto("/team/admin");
      await expect(page.locator(DIALOG)).toBeVisible({ timeout: 20_000 });
      // Auftritts-Animation (300 ms) ausklingen lassen, sonst misst die
      // Box eine Zwischenlage.
      await page.waitForTimeout(450);

      const weiter = page.getByRole("button", { name: "Weiter", exact: true });
      await expect(weiter).toBeVisible();
      const box = await weiter.boundingBox();
      expect(box, "Weiter-Knopf hat keine Box").toBeTruthy();

      // (a) Vollständig im Fenster — die Währung des behobenen Fehlers: Die
      // fixed-am-Dokument-Fassung schob den Knopf auf 360×800 um 227 px
      // unter den unteren Rand.
      expect(box.y, "Knopf beginnt über dem Fenster").toBeGreaterThanOrEqual(0);
      expect(
        box.y + box.height,
        `Knopf endet bei ${Math.round(box.y + box.height)} — unterhalb des ${fenster.hoehe}px-Fensters`
      ).toBeLessThanOrEqual(fenster.hoehe);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(fenster.breite);

      // (b) elementFromPoint in der Knopfmitte liefert genau ihn — nicht die
      // Elementbox messen und glauben, sondern fragen, was ein Tipp träfe.
      const trifft = await weiter.evaluate((btn, pt) => {
        const el = document.elementFromPoint(pt.x, pt.y);
        return !!el && (el === btn || btn.contains(el));
      }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      expect(trifft, "Ein Tipp in die Knopfmitte träfe NICHT den Weiter-Knopf").toBe(true);

      // (c) Das Overlay ist am FENSTER verankert, nicht am Dokument. ⚠️ Ohne
      // diese Messung wäre der Fall auf mobil für genau die Mutation blind,
      // die er bewachen soll: Ohne Portal (fixed unter dem transformierten
      // animate-page-in-Wrapper) landet der Knopf auf 360×800 im hier
      // vermessenen Zustand ZUFÄLLIG im Fenster (784,5 px, in beiden
      // Scroll-Lagen nachgemessen) — nur auf Desktop kippt (a) sichtbar
      // (931 px). Die Verankerung selbst unterscheidet die beiden Bauarten
      // auf JEDER Fenstergröße: viewport-groß und bei 0/0 nur mit Portal.
      const overlay = await page
        .locator('div[role="dialog"][aria-labelledby="admin-tour-titel"]')
        .boundingBox();
      expect(overlay, "Dialog-Container hat keine Box").toBeTruthy();
      expect(Math.abs(overlay.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(overlay.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(overlay.width - fenster.breite)).toBeLessThanOrEqual(2);
      expect(Math.abs(overlay.height - fenster.hoehe)).toBeLessThanOrEqual(2);
    });
  }

  test("Rechte-Filterung: Co-Admin nur mit kader-Recht ⇒ 3 Schritte, keine Tryouts-Zeile, Schluss ohne Ergebnis-Versprechen", async ({
    page,
    request,
  }) => {
    await flagsSetzen({ welcomeSeen: true, adminTourSeen: false });
    const { token, player } = await anmelden(request);
    const meineId = String(player?._id || player?.id || "");
    expect(meineId.length > 5, "Login lieferte keine Spieler-Id").toBe(true);
    await alsAdmin(page, token);

    // Co-Admin-Zustand über die Team-Antwort herstellen: nicht Haupt-Admin,
    // Teilrechte nur „kader". Reine Antwort-Umschrift, keine DB-Änderung.
    await page.route("**/api/team/fetchinfo", async (route) => {
      const res = await route.fetch();
      const json = await res.json().catch(() => null);
      const t = json?.team || json?.data?.team;
      if (t) {
        t.adminPlayerId = "000000000000000000000000";
        t.adminPermissions = [{ player: meineId, perms: ["kader"] }];
      }
      await route.fulfill({ response: res, json });
    });

    await page.goto("/team/admin");
    await expect(page.locator(DIALOG)).toBeVisible({ timeout: 20_000 });

    // Nur ueberblick + team + schluss überleben die Filterung.
    await expect(page.getByText("Schritt 1 von 3")).toBeVisible();

    const weiter = page.getByRole("button", { name: "Weiter", exact: true });
    await weiter.click();
    await expect(page.locator(DIALOG)).toHaveText(/Einladen ohne Zettelwirtschaft/);
    // Tryouts-Fußzeile darf ohne Tryouts-Reiter nicht erscheinen
    // (fusszeileTab, sonst kommt Befund M2 durch die Hintertür zurück).
    await expect(page.getByText(/Probetraining/)).toHaveCount(0);
    // „Zeig mir das" gehört zum (gefilterten) Ergebnis-Schritt — nirgends da.
    await expect(page.getByRole("button", { name: /Zeig mir das/ })).toHaveCount(0);

    await weiter.click();
    await expect(page.locator(DIALOG)).toHaveText(/Mehr ist es nicht/);
    // Schlussfolie in der Fassung OHNE Ergebnisse-Reiter.
    await expect(page.getByText(/Was bei dir ansteht, sagt dir die Leiste/)).toBeVisible();
    await expect(page.getByText(/Ergebnis melden, wenn eins ansteht/)).toHaveCount(0);
  });

  test("Persistenz: Überspringen ruft mark-admin-tour-seen, DB kippt, kein zweiter Auto-Start", async ({
    page,
    request,
  }) => {
    await flagsSetzen({ welcomeSeen: true, adminTourSeen: false });
    const { token } = await anmelden(request);
    await alsAdmin(page, token);

    await page.goto("/team/admin");
    await expect(page.locator(DIALOG)).toBeVisible({ timeout: 20_000 });

    const antwort = page.waitForResponse(
      (r) => r.url().includes("/api/player/mark-admin-tour-seen"),
      { timeout: 15_000 }
    );
    await page.getByRole("button", { name: "Überspringen" }).click();
    expect((await antwort).status(), "mark-admin-tour-seen antwortete nicht 200").toBe(200);

    // In der Datenbank angekommen — nicht nur im Netzwerkprotokoll.
    await expect
      .poll(
        async () => {
          const doc = await spieler().findOne(
            { email: ADMIN_MAIL },
            { projection: { adminTourSeen: 1 } }
          );
          return !!doc?.adminTourSeen;
        },
        { timeout: 10_000 }
      )
      .toBe(true);

    // Und der Rundlauf: Neuladen startet die Tour nicht mehr.
    await page.reload();
    await expect(
      page.getByRole("button", { name: /Kurz erklärt/ })
    ).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(600);
    await expect(page.locator(DIALOG)).toHaveCount(0);
  });
});
