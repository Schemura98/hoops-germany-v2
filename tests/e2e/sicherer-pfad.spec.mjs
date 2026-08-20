// Weiterleitungsziele nach der Anmeldung – die offene Weiterleitung (Kai K4).
//
// WAS HIER BEWACHT WIRD, IN EINEM SATZ: Wer einen Link auf unsere ECHTE
// Anmeldeseite verschickt, darf nicht bestimmen können, auf welcher fremden
// Seite der Nutzer nach der gelungenen Anmeldung landet.
//
// Der Angriff braucht keine Lücke in der Anmeldung selbst. Er borgt sich
// unsere Glaubwürdigkeit: Der Nutzer prüft die Adresszeile, sie steht auf
// hoopsgermany.de, er meldet sich an, es funktioniert – und die nachgebaute
// Maske danach fragt „aus Sicherheitsgründen noch einmal" nach dem Passwort.
//
// DREI EBENEN, UND SIE PRÜFEN VERSCHIEDENE DINGE:
//   A) das Modul selbst – viele Nutzlasten, ohne Browser, ohne Anmeldung
//   B) die echte Kette im Browser – eine Handvoll Fälle durch das Formular
//   C) die EINE Quelle – dass niemand wieder eine eigene Prüfung danebenbaut
//
// Ebene C ist die, die in einem halben Jahr zählt. A und B fangen einen
// kaputten Wert; C fängt die Rückkehr der Fehlerform.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

// Das ECHTE Modul, nicht eine Abschrift. `lib/` ist ohne `"type": "module"` in
// package.json formal CommonJS; Node erkennt die `export`-Syntax und liest die
// Datei als ES-Modul neu. Das ist gewollt: Eine Kopie der Regeln in dieser
// Datei würde genau dann grün bleiben, wenn das Produkt bricht.
const { istSichererPfad, sichererPfad, STANDARD_ZIEL } = await import(
  path.join(PROJECT_ROOT, "lib", "sichererPfad.js")
);

const SEED_ADMIN = { email: "max@test.de", password: "test123" };

// ---------------------------------------------------------------------------
// A) Das Modul
// ---------------------------------------------------------------------------

// ⚠️ `"/\\evil.com"` IST DER FALL, DER DIE ALTE PRÜFUNG BESTANDEN HAT.
// In JavaScript-Quelltext geschrieben ist das ein Rückwärtsstrich, nicht zwei.
// Er besteht `startsWith("/") && !startsWith("//")` – und der Browser macht
// daraus nach WHATWG-URL `//evil.com`, also einen FREMDEN HOST.
const ABGEWIESEN = [
  ["/\\evil.com", "Rückwärtsstrich – der Weg, der die alte Prüfung bestand"],
  ["/\\/evil.com", "Rückwärtsstrich nicht an erster Stelle"],
  ["//evil.com", "protokoll-relativ"],
  ["///evil.com", "dreifacher Schrägstrich"],
  ["https://evil.com", "absolute Adresse"],
  ["http://evil.com", "absolute Adresse, unverschlüsselt"],
  ["javascript:alert(1)", "javascript-Schema"],
  ["JaVaScRiPt:alert(1)", "Schema in Mischschreibung"],
  ["\tjavascript:alert(1)", "Schema hinter einem Tabulator"],
  ["\t/\\evil.com", "Steuerzeichen davor"],
  ["\n/\\evil.com", "Zeilenumbruch davor"],
  ["\r\n/\\evil.com", "Wagenrücklauf davor"],
  [" /team/create", "Leerzeichen davor"],
  ["/team/create ", "Leerzeichen dahinter"],
  ["/%2f%2fevil.com", "kodiertes //"],
  ["/%5cevil.com", "kodierter Rückwärtsstrich"],
  ["/%252f%252fevil.com", "doppelt kodiertes //"],
  ["/%09/\\evil.com", "kodierter Tabulator"],
  ["/ev\til.com", "Tabulator MITTEN im Wert - Browser entfernen auch den"],
  ["team/create", "ohne führenden Schrägstrich"],
  ["", "leere Zeichenkette"],
  [null, "null"],
  [undefined, "undefined"],
  [{}, "gar keine Zeichenkette"],
];

// ⚠️ DIESE LISTE IST DIE ANDERE HÄLFTE DES TESTS. Eine Prüfung, die ALLES
// abweist, bestünde jeden Angriffsfall oben und wäre trotzdem falsch: Sie
// bräche Neles Weg von der Startseite (`/signup?next=/team/create&src=home-cta`
// in components/landing/LandingCTA.js seit bd99263). Der Nutzer würde sich
// registrieren und im Newsfeed landen statt bei der Vereinsgründung – ohne
// Fehlermeldung, ohne dass es jemandem auffiele.
const ERLAUBT = [
  ["/team/create", "der Weg, den LandingCTA verlinkt"],
  ["/signup?next=/team/create&src=home-cta", "derselbe Weg mit vollem Query"],
  ["/player/newsfeed", "das Standardziel selbst"],
  ["/Team/Create", "Großbuchstaben"],
  ["/ligen/nrw-oberliga-herren-2025-26", "Slug mit Ziffern und Bindestrichen"],
  ["/spieler/m%C3%BCller", "prozentkodierter Umlaut"],
  ["/match/507f1f77bcf86cd799439011#box", "Sprungmarke"],
  ["/a?q=1%262", "kodiertes Kaufmanns-Und in der Query"],
  // ⚠️ DIE FOLGENDEN VIER KAMEN ERST DURCH DEN REVIEW DAZU (20.08.2026), und
  // sie sind der Grund, warum eine ERLAUBT-Liste nicht aus dem Kopf entsteht.
  // Meine erste Fassung wies sie alle ab. Ursache war ein Denkfehler in der
  // Einheit: Ich habe `URLSearchParams.get()` behandelt, als liefere es den
  // KODIERTEN Wert. Es dekodiert aber bereits - aus `?next=%2Fspieler%3Fq%3Dmax%2520mustermann`
  // wird bei uns ein echtes Leerzeichen. Damit fiel jede Suche mit Leerzeichen
  // still auf den Newsfeed zurueck: kein Fehler, keine Meldung, nur die falsche
  // Seite. Genau das Muster aus docs/MUSTER-ZAHLEN-DIE-LUEGEN.
  ["/spieler?q=max mustermann", "Leerzeichen IN der Query (aus %20 dekodiert)"],
  ["/spieler?q=a b&ort=Köln", "Leerzeichen und Umlaut in der Query"],
  ["/x?q=100%", "rohes Prozentzeichen in der Query"],
  ["/spieler/100%rabatt", "rohes Prozentzeichen im Pfad - kaputte Kodierung ist kein Angriff"],
];

test.describe("A) sichererPfad – das Modul", () => {
  for (const [wert, was] of ABGEWIESEN) {
    test(`weist ab: ${was}`, () => {
      expect(
        istSichererPfad(wert),
        `${JSON.stringify(wert)} wurde als sicher eingestuft – ${was}`,
      ).toBe(false);
      // Abweisen heißt ZURÜCKFALLEN, nicht scheitern: Eine gelungene Anmeldung
      // darf nicht mit einer Fehlermeldung quittiert werden.
      expect(sichererPfad(wert, STANDARD_ZIEL)).toBe(STANDARD_ZIEL);
    });
  }

  for (const [wert, was] of ERLAUBT) {
    test(`lässt durch: ${was}`, () => {
      expect(
        istSichererPfad(wert),
        `${JSON.stringify(wert)} wurde abgewiesen – ${was}. Zu streng ist auch falsch.`,
      ).toBe(true);
      // Unverändert durchreichen – kein stilles Umschreiben des Ziels.
      expect(sichererPfad(wert, STANDARD_ZIEL)).toBe(wert);
    });
  }

  test("ohne Standardziel liefert ein abgewiesener Wert null", () => {
    // Die beiden Google-Stellen brauchen genau das: Sie hängen `&next=` nur an,
    // wenn ein Ziel übrig bleibt.
    expect(sichererPfad("//evil.com")).toBeNull();
    expect(sichererPfad("/team/create")).toBe("/team/create");
  });
});

// ---------------------------------------------------------------------------
// B) Die echte Kette
// ---------------------------------------------------------------------------
// Ebene A prüft eine Funktion. Hier wird geprüft, dass sie auch AUFGERUFEN
// wird – ein perfekt geprüftes Modul, das an der Weiterleitung vorbeiliegt,
// wäre der teuerste grüne Test dieser Datei.
test.describe("B) Anmeldung mit feindlichem ?next=", () => {
  const DURCH_DAS_FORMULAR = [
    "/\\evil.com",
    "//evil.com",
    "https://evil.com",
    "/%2f%2fevil.com",
  ];

  for (const nutzlast of DURCH_DAS_FORMULAR) {
    test(`Login mit next=${JSON.stringify(nutzlast)} bleibt auf unserem Host`, async ({
      page,
      baseURL,
    }) => {
      await page.goto(`/login?next=${encodeURIComponent(nutzlast)}`);
      await page.fill('input[name="email"]', SEED_ADMIN.email);
      await page.fill('input[name="password"]', SEED_ADMIN.password);
      await page.click('button[type="submit"]');

      // Auf die Weiterleitung warten – NICHT auf eine feste Zeit.
      await page.waitForURL("**/player/newsfeed", { timeout: 60_000 });

      // ⚠️ Der Vergleichswert kommt aus dem LÄUFER, nicht aus dieser Datei.
      // Hier stand bis zum 20.08.2026 fest "http://localhost:3000". Auf jedem
      // anderen Port meldete dieser Test dann „die Weiterleitung hat die Seite
      // verlassen" – ein Sicherheitsalarm über einen Angriff, den es nicht gab,
      // ausgelöst durch die eigene Testeinstellung. Isolierte Arbeitsbäume
      // laufen auf eigenen Ports (Projektregel seit dem 15.08.2026); ein fest
      // verdrahteter Host macht dort JEDE Zahl falsch.
      const unserHost = new URL(baseURL).origin;
      const url = new URL(page.url());
      expect(
        url.origin,
        `Nach der Anmeldung stand der Browser auf ${url.origin} statt auf ${unserHost} – die Weiterleitung hat die Seite verlassen`,
      ).toBe(unserHost);
      expect(url.pathname).toBe("/player/newsfeed");

      // Ehrlichkeitsschranke: Die Anmeldung muss wirklich stattgefunden haben.
      // Ohne sie wäre eine kaputte Anmeldung (die nie weiterleitet) ein grüner
      // Lauf – wir hätten dann geprüft, dass ein Formular nichts tut.
      expect(
        await page.evaluate(() =>
          window.localStorage.getItem("playerAuthToken"),
        ),
        "Kein playerAuthToken – die Anmeldung ist gar nicht gelaufen, der Fall wurde nicht geprüft",
      ).toBeTruthy();
    });
  }

  test("gutartiges next= wird befolgt – Neles Weg von der Startseite", async ({
    page,
  }) => {
    // Die Gegenrichtung: Eine zu strenge Prüfung bricht hier, nicht oben.
    await page.goto("/login?next=%2Fteam%2Fcreate");
    await page.fill('input[name="email"]', SEED_ADMIN.email);
    await page.fill('input[name="password"]', SEED_ADMIN.password);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/team/create", { timeout: 60_000 });
    expect(new URL(page.url()).pathname).toBe("/team/create");
  });

  test("die Startseite verlinkt weiterhin ein Ziel, das die Prüfung besteht", async ({
    page,
    baseURL,
  }) => {
    // Der Vorbehalt aus dem Auftrag, am gebauten Stück statt am Quelltext:
    // Was LandingCTA tatsächlich verlinkt, muss die Prüfung bestehen.
    await page.goto("/");
    const ziele = await page.evaluate(() =>
      [...document.querySelectorAll('a[href*="next="]')].map((a) =>
        a.getAttribute("href"),
      ),
    );
    expect(
      ziele.length,
      "Kein Link mit ?next= auf der Startseite gefunden – der Test prüft ins Leere",
    ).toBeGreaterThan(0);
    for (const href of ziele) {
      // Auch hier der Host aus dem Läufer. Diese Stelle war harmlos – gelesen
      // wird nur der Suchparameter, die Basis dient bloß dem Auflösen eines
      // relativen Verweises. Sie bleibt trotzdem nicht stehen: Ein zweiter
      // fester Host in derselben Datei ist die Vorlage, an der sich der
      // nächste Zusatz orientiert.
      const next = new URL(href, baseURL).searchParams.get("next");
      expect(
        istSichererPfad(next),
        `Die Startseite verlinkt ${href}, dessen next=${next} von der Prüfung abgewiesen würde – dieser Weg bräche still`,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// C) Eine Quelle statt vier
// ---------------------------------------------------------------------------
test.describe("C) die Prüfung steht an genau einer Stelle", () => {
  const AUFRUFER = [
    "app/login/page.js",
    "app/signup/page.js",
    "app/oauth-landing/page.js",
    "app/api/auth/google/route.js",
    "app/api/auth/google/callback/route.js",
  ];

  test("kein Aufrufer baut eine eigene Prüfung daneben", () => {
    // ⚠️ DAS IST DER EIGENTLICHE BEFUND VON K4. Die alte Prüfung war nicht nur
    // löchrig – sie stand DREIMAL gleichlautend da. Drei Abschriften desselben
    // Irrtums sehen aus wie Sorgfalt und sind das Gegenteil: Niemand vergleicht
    // sie, also fällt der Fehler in keiner von ihnen auf.
    for (const datei of AUFRUFER) {
      const text = readFileSync(path.join(PROJECT_ROOT, datei), "utf8");
      expect(
        text,
        `${datei} prüft das Weiterleitungsziel selbst. Diese Prüfung gehört nach lib/sichererPfad.js – eine zweite Fassung wird irgendwann von der ersten abweichen.`,
      ).not.toMatch(/startsWith\(\s*["']\/\/["']\s*\)/);
    }
  });

  test("jeder Aufrufer benutzt die gemeinsame Quelle", () => {
    // Die Gegenprobe zum Test darüber: „keine eigene Prüfung" wäre auch dann
    // erfüllt, wenn jemand die Prüfung ersatzlos ENTFERNT.
    for (const datei of AUFRUFER) {
      const text = readFileSync(path.join(PROJECT_ROOT, datei), "utf8");
      expect(
        text,
        `${datei} bindet lib/sichererPfad.js nicht ein – hier wird ein Weiterleitungsziel ungeprüft verwendet`,
      ).toMatch(/from\s+["']@\/lib\/sichererPfad["']/);
      expect(
        text,
        `${datei} importiert sichererPfad, ruft es aber nicht auf`,
      ).toMatch(/sichererPfad\(/);
    }
  });

  test("das Standardziel steht nicht mehr an fünf Stellen im Text", () => {
    // Vorher stand `"/player/newsfeed"` als Zeichenkette in den Weiterleitungen.
    // Wandert das Standardziel, muss es an EINER Stelle wandern.
    for (const datei of ["app/login/page.js", "app/signup/page.js"]) {
      const text = readFileSync(path.join(PROJECT_ROOT, datei), "utf8");
      expect(
        text,
        `${datei} nennt das Standardziel wörtlich statt STANDARD_ZIEL zu benutzen`,
      ).not.toMatch(/\|\|\s*["']\/player\/newsfeed["']/);
    }
  });
});
