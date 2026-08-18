import { test, expect } from "@playwright/test";

// Wächter für das Sponsorendokument (`/admin/sponsor-report` und der teilbare
// Link). Angelegt 19.08.2026, nachdem BEIDE Gates am selben Commit je einen
// schweren Befund darin fanden – und Kai gemessen hat, dass es für diese
// Fläche bis dahin NULL Tests gab. Beide Befunde wären hier aufgeschlagen.
//
// ⚠️ Warum das eine eigene Datei wert ist: Dieses Dokument ist das einzige,
// das das Produkt an Außenstehende verkauft. Ein falsche Zahl darin wird
// zitiert, nicht bemerkt.

const ADMIN = { username: "admin", password: "geheim1234" };

async function adminToken(request) {
  const r = await request.post("/api/admin/adminlogin", { data: ADMIN });
  const j = await r.json();
  const t = j?.data?.token || j?.token;
  expect(t, "Admin-Anmeldung hat keinen Token geliefert").toBeTruthy();
  return t;
}

// Die Regel als Funktion, wörtlich aus der ausgelieferten Datei geschnitten
// und ausgeführt. Kais Vorgehen: nicht nachbauen, was der Code tut, sondern
// den Code selbst laufen lassen – ein Nachbau prüft die eigene Annahme.
function ausgelieferteRegel(quelle, name) {
  const i = quelle.indexOf(`function ${name}`);
  expect(i, `${name} steht nicht mehr in der Datei`).toBeGreaterThan(-1);
  const ende = quelle.indexOf("\n}\n", i);
  expect(ende, `${name}: Ende nicht gefunden`).toBeGreaterThan(i);
  // eslint-disable-next-line no-new-func
  return new Function(`${quelle.slice(i, ende + 2)}; return ${name};`)();
}

test.describe("Sponsor-Report", () => {
  test("ein Rückgang ist genauso sichtbar wie ein Anstieg", async () => {
    const fs = await import("node:fs/promises");
    const quelle = await fs.readFile("components/admin/SponsorReportView.js", "utf8");
    const wachstumsText = ausgelieferteRegel(quelle, "wachstumsText");

    // ⚠️ DER FALL, DER DEN TEST NÖTIG MACHTE (Befund Kai H1): Die erste Fassung
    // gab bei jedem Wert <= 0 `null` zurück. Ein Minus war damit optisch nicht
    // von „unverändert" zu unterscheiden, und ein Abzeichen erschien NUR bei
    // guten Nachrichten. Auf Prod waren das an dem Tag −34 % und −39 %.
    for (const g of [-39, -34, -1]) {
      const r = wachstumsText(g);
      expect(r, `Rückgang ${g} % zeigt gar kein Abzeichen`).not.toBeNull();
      expect(r.gut, `Rückgang ${g} % ist als gute Nachricht gefärbt`).toBe(false);
      expect(r.text).toContain(String(g));
    }

    // Gegenrichtung – sonst wäre der Test auch grün, wenn ALLES rot würde.
    for (const g of [1, 34]) {
      const r = wachstumsText(g);
      expect(r?.gut, `Anstieg ${g} % ist nicht als Anstieg gefärbt`).toBe(true);
    }

    // Deckel in beide Richtungen: eine vierstellige Prozentzahl heißt nur
    // „vorher war fast nichts da" und wirkt wie ein Fehler.
    expect(wachstumsText(4476).text).not.toMatch(/\d{4}/);
    expect(wachstumsText(-4476).text).not.toMatch(/\d{4}/);

    // Kein Wert, keine Behauptung.
    for (const leer of [null, undefined, NaN, 0]) {
      expect(wachstumsText(leer), `${leer} erzeugt ein Abzeichen`).toBeNull();
    }
  });

  test("der Sponsorenlink liefert dieselben Felder wie die Backoffice-Ansicht", async ({ request }) => {
    // ⚠️ DER FALL (Befund Kai H2 / Tobias H-1): Die Positivliste des
    // öffentlichen Wegs ließ `newLast30` aus. Das Backoffice zeigte
    // „Spieler mit Profil 9 · davon 1 neu in 30 Tagen", der Sponsor auf seinem
    // Link nur „9" – ohne Fehler, ohne Meldung, weil die Anzeige bei einem
    // fehlenden Feld still nichts rendert. Über den Zahlen steht aber
    // „Zeitraum: letzte 7 Tage": Ohne diese Zeile liest ein Sponsor den
    // Gesamtbestand als Zahl des Zeitraums.
    const token = await adminToken(request);
    // ⚠️ Die Route ist ein POST mit Token im Rumpf, kein GET mit Kopfzeile –
    // mein erster Anlauf bekam 400 und wäre ohne die Schranke unten als
    // „Feld fehlt" durchgegangen, also ein Befund über nichts.
    const r = await request.post("/api/analytics/summary", {
      data: { token, period: 30 },
    });
    expect(r.ok(), "Analytics-Zusammenfassung nicht erreichbar").toBeTruthy();
    const antwort = await r.json();
    // ⚠️ Diese Route antwortet mit `{ success, summary }`, NICHT mit dem im
    // Projekt üblichen `{ success, data }`. Mein erster Anlauf griff auf
    // `.data` und bekam `undefined` – die Schranke unten hat es gefangen,
    // sonst wäre daraus ein grüner Test über nichts geworden.
    const s = antwort?.summary || antwort?.data || antwort;

    // Ehrlichkeitsschranke: Ohne diese Felder misst der Test nichts.
    for (const feld of ["externeTeams", "externeUsers"]) {
      expect(s?.platform?.[feld], `platform.${feld} fehlt – Test misst nichts`).toBeTruthy();
      expect(
        typeof s.platform[feld].newLast30,
        `platform.${feld}.newLast30 fehlt in der internen Antwort`
      ).toBe("number");
    }

    // ⚠️ NICHT DEN QUELLTEXT ABSUCHEN (Befund Kai, zwei Mutationen).
    // Mein erster Anlauf prüfte per Textsuche, ob `newLast30: e.newLast30` in
    // der Datei steht. Das war gleichzeitig zu streng und zu locker: Eine reine
    // Umbenennung des Parameters machte den Test rot, und wer den Helfer für
    // die beiden angezeigten Felder schlicht NICHT MEHR AUFRIEF, blieb grün –
    // also genau die Regression, gegen die dieser Test antritt.
    // Deshalb wird die Umformung selbst ausgeführt und ihr Ergebnis geprüft.
    const fsMod = await import("node:fs/promises");
    const routeQuelle = await fsMod.readFile("app/api/analytics/public-report/route.js", "utf8");
    const ab = routeQuelle.indexOf("const kpi =");
    const bis = routeQuelle.indexOf("\n}", routeQuelle.indexOf("function buildSponsorView"));
    expect(ab, "Helferblock nicht gefunden – Test misst nichts").toBeGreaterThan(-1);
    expect(bis, "buildSponsorView nicht gefunden – Test misst nichts").toBeGreaterThan(ab);
    // eslint-disable-next-line no-new-func
    const bauen = new Function(
      `${routeQuelle.slice(ab, bis + 2)}; return buildSponsorView;`
    )();

    const oeffentlich = bauen(s);
    for (const feld of ["externeTeams", "externeUsers"]) {
      expect(
        oeffentlich?.platform?.[feld]?.newLast30,
        `Der Sponsorenlink liefert bei ${feld} kein \`newLast30\` – er zeigt ` +
          "damit Bestandszahlen ohne Zeitbezug unter einer Zeitraum-Überschrift, " +
          "während das Backoffice die Zeile „davon N neu in 30 Tagen“ zeigt"
      ).toBe(s.platform[feld].newLast30);
    }
    // Und die Gegenrichtung: Was draußen bleiben soll, bleibt draußen.
    expect(
      oeffentlich?.content?.topPlayers,
      "Spielernamen sind wieder im Datenpaket des Sponsorenlinks"
    ).toBeUndefined();
  });

  test("im Dokument steht kein Klarname und kein roher Pfad", async ({ page, request }) => {
    // ⚠️ Der Report sichert oben gedruckt zu, keine personenbezogenen Daten zu
    // enthalten – und listete vier Absätze weiter fünf Spielernamen, unter
    // denen 16-/17-Jährige sein können. Auflage Tobias, behoben; dieser Test
    // hält sie geschlossen.
    const token = await adminToken(request);
    await page.addInitScript((t) => localStorage.setItem("adminAuthToken", t), token);
    await page.goto("/admin/sponsor-report");
    await page.getByRole("heading", { name: /sechs Zahlen/i }).waitFor({ timeout: 30000 });

    const txt = await page.locator("body").innerText();
    expect(txt.length, "Seite ist leer – Test misst nichts").toBeGreaterThan(200);

    // Die Namen, die die interne Schnittstelle weiterhin an den Browser gibt,
    // dürfen im Dokument nicht auftauchen.
    const sum = await request.post("/api/analytics/summary", {
      data: { token, period: 30 },
    });
    const sumJson = await sum.json();
    const namen = (((sumJson?.summary || sumJson?.data)?.content?.topPlayers) || [])
      .map((x) => x?.label)
      .filter(Boolean);
    // ⚠️ EHRLICHKEITSSCHRANKE (Befund Kai, Mutation „Namensliste leeren“):
    // Ohne sie lief dieser Fall bei leerer Liste ins Nichts und blieb grün –
    // ein Test, der seine eigene Vorbedingung nicht prüft, prüft gar nichts.
    expect(
      namen.length,
      "Keine Spielernamen in der Antwort – dieser Fall misst nichts. " +
        "Analytics-Daten fehlen oder die Struktur hat sich geändert."
    ).toBeGreaterThan(0);

    for (const n of namen) {
      expect(txt, `Klarname „${n}" steht im Sponsorendokument`).not.toContain(n);
    }

    // Rohe Adressen sind ebenfalls nichts für dieses Blatt.
    for (const pfad of ["/player/", "update-password", "/team/team-detail"]) {
      expect(txt, `Rohe Adresse „${pfad}" steht im Dokument`).not.toContain(pfad);
    }
  });
});
