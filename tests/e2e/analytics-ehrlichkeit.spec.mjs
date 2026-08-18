// Kennzahlen des Backoffice dürfen nicht größer sein als ihre Grundgesamtheit.
//
// ⚠️ WARUM ES DIESEN TEST GIBT (18.08.2026)
// Beim Durchsehen der Auswertungsseite fiel auf: „Registrierte Nutzer 20" und
// direkt darunter „Aktive Nutzer (7 Tage) 214", beschriftet mit „Eingeloggte
// Nutzer mit Aktivität". Mehr aktive als überhaupt vorhandene Nutzer.
//
// Ursache: Die Zählung nahm jede Spieler-Kennung aus den Ereignisdaten – auch
// von **gelöschten** Konten. Die Ereignisse bleiben stehen, wenn ein Profil
// verschwindet. Gemessen: 20 Spieler vorhanden, 256 gezählt, 3 existierten.
//
// ⚠️ Diese Zahl steht im **Sponsor-Report**. Eine Kennzahl, die nur wachsen
// kann und niemandem auffällt, ist gegenüber einem Sponsor keine Kleinigkeit –
// das ist der Kern von `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`.
//
// Der Test prüft deshalb nicht einen Wert, sondern eine **Beziehung**: Keine
// Teilmenge darf größer sein als die Menge, aus der sie stammt. Solche
// Widersprüche fallen einem Menschen sofort auf und keinem Testlauf – außer
// er fragt danach.
import { test, expect } from "@playwright/test";

async function summary(request) {
  const anmeldung = await request.post("/api/admin/adminlogin", {
    data: { username: "admin", password: "geheim1234" },
  });
  const aj = await anmeldung.json().catch(() => ({}));
  const token = aj?.data?.token || aj?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Keine Admin-Anmeldung – ohne sie prüft dieser Test nichts. ` +
      `Antwort: ${JSON.stringify(aj).slice(0, 140)}`,
  ).toBe(true);

  const res = await request.post("/api/analytics/summary", {
    data: { token, period: "30d" },
  });
  const j = await res.json().catch(() => ({}));
  expect(j?.summary, `Keine Auswertung erhalten: ${JSON.stringify(j).slice(0, 140)}`).toBeTruthy();
  return j.summary;
}

test.describe("Backoffice-Kennzahlen sind in sich stimmig", () => {
  test("aktive Nutzer können nicht mehr sein als registrierte", async ({ request }) => {
    const s = await summary(request);
    const registriert = s.platform?.users?.total ?? s.platform?.users?.current;
    expect(
      typeof registriert === "number",
      `Die Zahl der registrierten Nutzer fehlt in der Auswertung – ` +
        `dann kann dieser Test nichts vergleichen. Struktur: ` +
        `${JSON.stringify(Object.keys(s.platform || {}))}`,
    ).toBe(true);

    // Ehrlichkeitsschranke: Bei null Nutzern ist jede Aussage trivial wahr.
    expect(
      registriert,
      `0 registrierte Nutzer in der Dev-DB – dann ist der Vergleich ` +
        `bedeutungslos. Erst \`node scripts/seed-demo.mjs\` laufen lassen.`,
    ).toBeGreaterThan(0);

    for (const [name, wert] of [
      ["7 Tage", s.activeUsers?.d7],
      ["30 Tage", s.activeUsers?.d30],
    ]) {
      expect(
        wert,
        `„Aktive Nutzer (${name})" = ${wert}, aber es gibt nur ${registriert} ` +
          `registrierte Nutzer. Eine Teilmenge kann nicht größer sein als ihre ` +
          `Menge. Fast sicher werden Kennungen GELÖSCHTER Konten mitgezählt – ` +
          `die Ereignisse bleiben stehen, wenn ein Profil verschwindet. ` +
          `Diese Zahl steht im Sponsor-Report.`,
      ).toBeLessThanOrEqual(registriert);
    }
  });

  test("die Sieben-Tage-Zahl liegt nicht über der Dreißig-Tage-Zahl", async ({ request }) => {
    // Zweite Beziehung, die immer gelten muss: Wer in 7 Tagen aktiv war, war es
    // auch in 30. Ein Verstoß bedeutet, dass die beiden Zahlen unterschiedlich
    // gerechnet werden – und dann stimmt mindestens eine nicht.
    const s = await summary(request);
    expect(
      s.activeUsers?.d7,
      `Aktive Nutzer 7 Tage (${s.activeUsers?.d7}) liegen über 30 Tagen ` +
        `(${s.activeUsers?.d30}). Der kürzere Zeitraum ist im längeren enthalten – ` +
        `die beiden Zahlen werden also verschieden gerechnet.`,
    ).toBeLessThanOrEqual(s.activeUsers?.d30);
  });

  test("die echte Beteiligung ist nicht größer als der Gesamtbestand", async ({ request }) => {
    // Der Abschnitt „Echte Beteiligung (ohne Beispieldaten)" zieht Testdaten ab.
    // Das Ergebnis muss zwangsläufig kleiner oder gleich dem Gesamtbestand sein.
    const s = await summary(request);
    const paare = [
      ["Externe Teams", s.platform?.externalTeams?.total, s.platform?.teams?.total],
      ["Externe Nutzer", s.platform?.externalUsers?.total, s.platform?.users?.total],
    ];
    for (const [name, extern, gesamt] of paare) {
      if (typeof extern !== "number" || typeof gesamt !== "number") continue;
      expect(
        extern,
        `„${name}" = ${extern} liegt über dem Gesamtbestand (${gesamt}). ` +
          `Die Teilmenge „ohne Beispieldaten" kann nicht größer sein als alles.`,
      ).toBeLessThanOrEqual(gesamt);
    }
  });
});
