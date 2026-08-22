// Kanal-Trichter der Kampagnen-Analytics (Gate Kai, 22.08.2026).
//
// Drei Zusicherungen, jede mit eigener Blindstelle der anderen:
//
// (1) LANDUNG GENAU EINMAL JE SITZUNG. Der Tracker sendet `src_landing` nur
//     beim ERSTEN Fang einer `?src=`-Quelle; Routenwechsel und erneute
//     `?src=`-Aufrufe derselben Sitzung zählen nicht noch einmal. Ohne das
//     zählte jeder Seitenwechsel als neuer „Scan" und die obere Trichterstufe
//     wäre um ein Vielfaches zu groß.
//     ⚠️ „Sitzung" heißt hier Tab-Sitzung (`sessionStorage`) — der Riegel
//     lebt dort. Zwei parallel geöffnete Tabs sind zwei Landungen, und ein
//     neuer Browserstart am nächsten Tag ist eine neue Landung. Beides ist
//     Absicht: Zwei Scans sind zwei Landungen.
//
// (2) DER SERVER WEIST ERFUNDENE KANÄLE AB. `/api/analytics/track` ist
//     öffentlich und unauthentifiziert (richtig so — er zählt anonyme
//     Besucher). Aber die Kanalliste des Trichters ist die VEREINIGUNG aller
//     je gesehenen `meta`-Werte: Ohne Formatprüfung könnte jeder per curl
//     beliebige „Kanäle" in die Admin-Auswertung fluten.
//
// (3) DIE AGGREGATION ZÄHLT RICHTIG — gegen handgerechnete Sollwerte an
//     synthetischen Fixtures, inkl. der zwei Eigenschaften, die man beim
//     Lesen der Pipeline leicht verliert: die VEREINIGUNG (ein Kanal mit
//     Landungen und null Registrierungen muss sichtbar sein — genau der Fall,
//     den man während einer Kampagne sehen will) und der ECHTHEITSFILTER
//     (`isInternal`-Konten zählen nicht als Kampagnenerfolg,
//     `lib/echteZahlen.mjs`).
//
// Dazu die beiden Richtungen von Roadmap 39 (Bot-Riegel an der EINEN
// geteilten Stelle `lib/analyticsClient.js`):
//     gesteuerter Browser  → GAR NICHTS geht raus, auch keine Tour-Ereignisse
//     echter Browser       → pageview, src_landing UND tour_step kommen an
// Die Browser-Fälle fangen /api/analytics/track ab und beantworten es selbst —
// sie hinterlassen KEINE Spur in der Datenbank. Nur die Server- und
// Aggregationsfälle schreiben, mit striktem Marker und Aufräumen in finally.
import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import { requireDevDbUri } from "./helpers/env.mjs";

// Öffentliche Seite mit Footer; nicht "/" (Scroll-Bühne, teuer und fragil).
const SEITE = "/spieler";
const KANAL = "e2e-kanal-waechter";

// `navigator.webdriver` auf undefined stellen = ein echter Browser, wie ihn
// ein Mensch bedient. Muss VOR jedem Seiten-Skript laufen (addInitScript).
async function alsEchterBrowser(page) {
  await page.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), "webdriver", {
      get: () => undefined,
      configurable: true,
    });
  });
}

// Fängt /api/analytics/track ab, beantwortet es selbst (keine DB-Spur) und
// sammelt die Nutzlasten. Rückgabe: das lebende Array.
async function trackAbfangen(page) {
  const gesendet = [];
  await page.route("**/api/analytics/track", async (route) => {
    try {
      gesendet.push(route.request().postDataJSON());
    } catch {
      gesendet.push({ unlesbar: true });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  return gesendet;
}

test.describe("Kanal-Landung: genau einmal je Tab-Sitzung", () => {
  test("Routenwechsel und erneutes ?src= erzeugen keine zweite Landung", async ({ page }) => {
    await alsEchterBrowser(page);
    const gesendet = await trackAbfangen(page);

    await page.goto(`${SEITE}?src=${KANAL}`);
    // Auf die Landung warten, nicht auf eine Zeitspanne.
    await expect
      .poll(() => gesendet.filter((e) => e?.eventType === "src_landing").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const landung = gesendet.find((e) => e?.eventType === "src_landing");
    expect(landung.meta, "Die Landung muss den Kanal tragen").toBe(KANAL);

    // Zweiter Aufruf MIT derselben Quelle in derselben Tab-Sitzung: die
    // Quelle ist gepuffert, es darf keine zweite Landung entstehen. Das ist
    // der härtere Fall als ein nackter Routenwechsel.
    await page.goto(`/teams?src=${KANAL}`);
    // …und ein Routenwechsel ohne src obendrauf.
    await page.goto(`/ligen`);

    // Ehrlichkeitsschranke: Die zwei Folgeaufrufe müssen als pageviews
    // ANGEKOMMEN sein — sonst wäre „nur 1 Landung" auch mit einem toten
    // Tracker wahr und dieser Test grün über einem Totalausfall.
    await expect
      .poll(() => gesendet.filter((e) => e?.eventType === "pageview").length, {
        timeout: 15_000,
      })
      .toBeGreaterThanOrEqual(3);
    expect(
      gesendet.filter((e) => e?.eventType === "src_landing").length,
      "Nach zwei weiteren Aufrufen (einer davon erneut mit ?src=) muss es " +
        "bei GENAU EINER Landung bleiben — sonst zählt jeder Routenwechsel " +
        "als neuer Scan und die obere Trichterstufe lügt nach oben."
    ).toBe(1);

    // Gegenkontrolle im selben Lauf: Neue Tab-Sitzung (Puffer weg) → wieder
    // genau eine Landung. Beweist, dass die „1" oben vom Riegel kommt und
    // nicht von einem Sender, der nach dem ersten Mal für immer schweigt.
    await page.evaluate(() => window.sessionStorage.clear());
    await page.goto(`${SEITE}?src=${KANAL}`);
    await expect
      .poll(() => gesendet.filter((e) => e?.eventType === "src_landing").length, {
        timeout: 15_000,
      })
      .toBe(2);
  });

  test("Direktlandung auf /signup?src= erzeugt die Landung ebenfalls", async ({ page }) => {
    // ⚠️ WARUM DIESER FALL EIGEN IST: Auf /signup puffern ZWEI Effekte dieselbe
    // Quelle — der Tracker (app/layout.js, VOR {children}) und die Signup-Seite
    // selbst (app/signup/page.js). Nur der Tracker sendet die Landung, und nur,
    // wenn ER die Quelle als ERSTER fängt. Das hängt heute allein daran, dass
    // <AnalyticsTracker /> im Layout VOR {children} steht (React feuert
    // Effects in Baumreihenfolge). Wer den Tracker je hinter {children}
    // verschiebt, verliert stumm jede Landung von Flyer-Links, die direkt auf
    // die Registrierung zeigen — und nichts sieht kaputt aus.
    await alsEchterBrowser(page);
    const gesendet = await trackAbfangen(page);
    await page.goto(`/signup?src=${KANAL}`);
    await expect
      .poll(() => gesendet.filter((e) => e?.eventType === "src_landing").length, {
        timeout: 15_000,
        message:
          "Direktlandung auf /signup?src= muss eine Kanal-Landung senden — " +
          "fängt die Signup-Seite die Quelle vor dem Tracker, entfällt sie stumm.",
      })
      .toBe(1);
  });
});

test.describe("Bot-Riegel an der einen geteilten Stelle (Roadmap 39)", () => {
  test("gesteuerter Browser sendet NICHTS — auch keine Tour-Ereignisse", async ({ page }) => {
    // KEIN alsEchterBrowser: Playwright trägt `navigator.webdriver = true`.
    const gesendet = await trackAbfangen(page);

    await page.goto(`${SEITE}?src=${KANAL}`);
    await page.evaluate(() => {
      localStorage.removeItem("playerAuthToken");
      localStorage.removeItem("teamAuthToken");
    });

    // Tour über den Footer öffnen — `tour_step` feuert direkt beim Öffnen
    // (WelcomeTour.js). Damit ist der trackEvent-Weg wirklich DURCHLAUFEN,
    // nicht nur der Tracker-Weg. toPass, weil der Footer-Knopf vor der
    // Hydration folgenlos verpufft (Muster aus tour-ohne-konto.spec.mjs).
    const tour = page.locator('[aria-labelledby="tour-titel"]');
    await expect(async () => {
      await page.getByRole("button", { name: "Plattform-Tour" }).click();
      await expect(tour).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });
    // Einen Schritt weiter — noch ein tour_step-Anlass.
    await tour.getByRole("button", { name: /Weiter/ }).click();

    // Erst jetzt messen: Die Tour WAR offen (Ehrlichkeitsschranke — ohne sie
    // hätte „0 gesendet" auch bei einer nie geöffneten Tour gegolten), und
    // trotzdem ist nichts rausgegangen.
    expect(
      gesendet,
      "Ein gesteuerter Browser (navigator.webdriver) darf KEIN einziges " +
        "Analytics-Ereignis senden — weder pageview noch src_landing noch " +
        "tour_step. Sonst vergiftet jeder Suite-Lauf die Dev-DB (Roadmap 26) " +
        "und Bots zählen als Besucher im Sponsor-Report."
    ).toHaveLength(0);
  });

  test("echter Browser: pageview, src_landing UND tour_step kommen an", async ({ page }) => {
    await alsEchterBrowser(page);
    const gesendet = await trackAbfangen(page);

    await page.goto(`${SEITE}?src=${KANAL}`);
    await page.evaluate(() => {
      localStorage.removeItem("playerAuthToken");
      localStorage.removeItem("teamAuthToken");
    });

    const tour = page.locator('[aria-labelledby="tour-titel"]');
    await expect(async () => {
      await page.getByRole("button", { name: "Plattform-Tour" }).click();
      await expect(tour).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });

    // Alle drei Ereignisarten müssen beobachtet sein. Das ist die
    // Gegenrichtung des Riegels: Er darf nur Bots ausfiltern, nicht die
    // Analytics für alle abschalten.
    for (const art of ["pageview", "src_landing", "tour_step"]) {
      await expect
        .poll(() => gesendet.filter((e) => e?.eventType === art).length, {
          timeout: 15_000,
          message:
            `Im echten Browser muss mindestens ein "${art}" gesendet werden — ` +
            `sonst ist der Bot-Riegel zur Totalabschaltung geworden.`,
        })
        .toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe("Server weist erfundene Kanäle ab", () => {
  // Diese Fälle schreiben ECHT in die Dev-DB (der Endpunkt soll ja gerade
  // serverseitig prüfen). Strikter Marker + Aufräumen in finally.
  const MARKER_SID = "e2e-kai-kanal-server-0001";

  test("ungültige src_landing-meta → 400, gültige kommen normalisiert an", async ({ request }) => {
    const uri = requireDevDbUri();
    await mongoose.connect(uri);
    const AE = mongoose.connection.collection("analyticsevents");
    try {
      await AE.deleteMany({ sessionId: MARKER_SID });

      const post = (meta) =>
        request.post("/api/analytics/track", {
          data: { eventType: "src_landing", path: "/e2e-kanal-waechter", sessionId: MARKER_SID, meta },
        });

      // Gültig, aber unnormalisiert: Der Server muss trimmen + kleinschreiben,
      // bevor er prüft und speichert — sonst zählt "Vereinsmail" als eigener
      // Kanal neben "vereinsmail" (zwei halbe Kanäle, wie beim QR-Kennzeichen).
      const okRes = await post("  VEREINSMAIL ");
      expect(okRes.status(), "Normalisierbare Quelle muss angenommen werden").toBe(200);

      // Ehrlichkeitsschranke: Der 200er muss WIRKLICH in der DB liegen, und
      // zwar normalisiert — sonst prüfen die 400er unten gegen einen toten
      // Endpunkt und dieser Test wäre grün ohne Aussage.
      await expect
        .poll(() => AE.countDocuments({ sessionId: MARKER_SID, meta: "vereinsmail" }), {
          timeout: 10_000,
        })
        .toBe(1);

      const boese = [
        ["Sonderzeichen", "böser!kanal"],
        ["Leerzeichen innen", "flyer test"],
        ["254 Zeichen", "a".repeat(254)],
        ["41 Zeichen (eins über der Grenze)", "a".repeat(41)],
        ["leer", ""],
        ["Einschleusung", '{"$ne":null}'],
      ];
      for (const [name, meta] of boese) {
        const res = await post(meta);
        expect(
          res.status(),
          `src_landing mit ${name} muss 400 sein — der Endpunkt ist öffentlich, ` +
            `und jeder angenommene Wert wird eine Zeile in der Admin-Kanalliste.`
        ).toBe(400);
      }
      // …und fehlendes meta ebenfalls.
      const ohneMeta = await request.post("/api/analytics/track", {
        data: { eventType: "src_landing", path: "/e2e-kanal-waechter", sessionId: MARKER_SID },
      });
      expect(ohneMeta.status(), "src_landing ohne meta muss 400 sein").toBe(400);

      // Keiner der abgewiesenen Werte darf es in die DB geschafft haben.
      const gesamt = await AE.countDocuments({ sessionId: MARKER_SID });
      expect(
        gesamt,
        "Es darf genau EIN Ereignis dieses Markers existieren (die gültige " +
          "Landung) — jedes weitere wäre ein durchgerutschter Angriffswert."
      ).toBe(1);
    } finally {
      await AE.deleteMany({ sessionId: MARKER_SID });
      await mongoose.disconnect();
    }
  });
});

test.describe("Trichter-Aggregation zählt richtig", () => {
  // Handgerechnete Sollwerte an synthetischen Fixtures. Marker-Namensraum,
  // Aufräumen vor UND nach dem Lauf (Reste eines abgebrochenen Laufs).
  const P = "e2e-kai-trichter"; // Präfix für alles, was dieser Test anlegt
  const KA = `${P}-kanal-a`;
  const KB = `${P}-kanal-b`;

  test("Landungen, Registrierungen, Teams je Kanal — inkl. Vereinigung und Echtheitsfilter", async ({ request }) => {
    test.setTimeout(120_000);
    const uri = requireDevDbUri();
    await mongoose.connect(uri);
    const AE = mongoose.connection.collection("analyticsevents");
    const PL = mongoose.connection.collection("players");
    const TM = mongoose.connection.collection("teams");
    const raeumen = async () => {
      await AE.deleteMany({ sessionId: { $regex: `^${P}` } });
      await PL.deleteMany({ email: { $regex: `^${P}` } });
      await TM.deleteMany({ slug: { $regex: `^${P}` } });
    };
    try {
      await raeumen();
      const jetzt = new Date();

      // Kanal A: 3 Landungen · 2 echte Registrierungen · 1 Team-Gründung.
      // Kanal B: 1 Landung · 0 Registrierungen · 0 Teams — der Kanal, den
      //          NUR die Vereinigung sichtbar macht.
      await AE.insertMany([
        { eventType: "src_landing", meta: KA, path: "/", sessionId: `${P}-s1`, createdAt: jetzt },
        { eventType: "src_landing", meta: KA, path: "/", sessionId: `${P}-s2`, createdAt: jetzt },
        { eventType: "src_landing", meta: KA, path: "/", sessionId: `${P}-s3`, createdAt: jetzt },
        { eventType: "src_landing", meta: KB, path: "/", sessionId: `${P}-s4`, createdAt: jetzt },
      ]);
      // ⚠️ Der native Treiber gibt `insertedIds` als OBJEKT mit Indexschlüsseln
      // zurück ({ "0": ObjectId, … }), nicht als Array — beim ersten Anlauf
      // scheiterte hier eine Array-Destrukturierung.
      const [pa1, pa2, pIntern] = Object.values(
        (await PL.insertMany([
          // zählt (echt)
          { firstName: "E2E", lastName: "TrichterA1", email: `${P}-a1@test.de`, signupSource: KA, createdAt: jetzt },
          // zählt (echt)
          { firstName: "E2E", lastName: "TrichterA2", email: `${P}-a2@test.de`, signupSource: KA, createdAt: jetzt },
          // zählt NICHT: internes Konto. Der Filter-Angleich dieser Runde
          // (NUR_ECHT statt nur isDemo) ist genau hierfür da.
          { firstName: "E2E", lastName: "TrichterIntern", email: `${P}-i1@test.de`, signupSource: KA, isInternal: true, createdAt: jetzt },
        ])).insertedIds
      );

      await TM.insertMany([
        // zählt: echtes Team, Gründer kam über Kanal A
        { teamName: `${P}-team-a`, slug: `${P}-team-a`, adminPlayerId: pa1, createdAt: jetzt },
        // zählt NICHT: Gründer ist das interne Konto
        { teamName: `${P}-team-i`, slug: `${P}-team-i`, adminPlayerId: pIntern, createdAt: jetzt },
        // zählt NICHT: nicht freigegebene Gründung (approved: false)
        { teamName: `${P}-team-u`, slug: `${P}-team-u`, adminPlayerId: pa2, approved: false, createdAt: jetzt },
      ]);

      // Auswertung als Admin holen (Muster aus analytics-ehrlichkeit.spec.mjs).
      const anmeldung = await request.post("/api/admin/adminlogin", {
        data: { username: "admin", password: "geheim1234" },
      });
      const aj = await anmeldung.json().catch(() => ({}));
      const token = aj?.data?.token || aj?.token;
      expect(typeof token === "string" && token.length > 20, "Keine Admin-Anmeldung — ohne sie prüft dieser Test nichts.").toBe(true);
      const res = await request.post("/api/analytics/summary", { data: { token, period: "7d" } });
      const j = await res.json().catch(() => ({}));
      const trichter = j?.summary?.kanalTrichter;
      expect(Array.isArray(trichter), `kanalTrichter fehlt in der Auswertung: ${JSON.stringify(Object.keys(j?.summary || {})).slice(0, 200)}`).toBe(true);

      const zeileA = trichter.find((k) => k.src === KA);
      const zeileB = trichter.find((k) => k.src === KB);

      // ⚠️ Ab hier `expect.soft`: Jede Trichterstufe ist eine EIGENE
      // Zusicherung. Mit hartem expect verdeckt der erste Fehlschlag alle
      // folgenden Prüfungen — genau die Lehre vom 22.08. („Zwei Gegenproben
      // in EINEM Lauf beweisen nur eine"), hier auf Assertions angewandt.
      expect(zeileA, "Kanal A muss im Trichter stehen").toBeTruthy();
      expect.soft(zeileA.landungen, "Kanal A: 3 eingefügte Landungen im Zeitraum").toBe(3);
      expect.soft(
        zeileA.registrierungen,
        "Kanal A: genau 2 — die zwei echten Konten. Steht hier 3, zählt das " +
          "isInternal-Konto als Kampagnenerfolg mit (Filter-Rückfall auf nur " +
          "isDemo; lib/echteZahlen.mjs verlangt NUR_ECHT)."
      ).toBe(2);
      expect.soft(
        zeileA.teams,
        "Kanal A: genau 1 Team — das echte. Steht hier 2 oder 3, zählen " +
          "interne Gründer oder nicht freigegebene Gründungen mit."
      ).toBe(1);

      expect(
        zeileB,
        "Kanal B hat NUR Landungen (0 Registrierungen, 0 Teams) und muss " +
          "trotzdem im Trichter stehen — das leistet nur die VEREINIGUNG der " +
          "Quellenlisten. Fehlt er, ist während einer Kampagne unsichtbar, " +
          "dass Leute landen und abspringen."
      ).toBeTruthy();
      expect.soft(zeileB.landungen).toBe(1);
      expect.soft(zeileB.registrierungen).toBe(0);
      expect.soft(zeileB.teams).toBe(0);
    } finally {
      await raeumen();
      await mongoose.disconnect();
    }
  });
});
