// Alle Beiträge im Feed tragen DIESELBE Kachelgeometrie – der Rang trägt sich
// über die Fläche.
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM ES DIESEN WÄCHTER GIBT (Gate Kai, 22.08.2026)
// ═══════════════════════════════════════════════════════════════════════════
// Am 22.08.2026 wurde die Kachelgeometrie JEDES Beitrags geändert: Wort-
// Beiträge hatten `border-b … pb-5` (kein Kasten, nur eine Trennlinie),
// Ereignis-Beiträge `bg-navy-800 rounded-md border … p-4`. Patricks Befund am
// echten Bild: „mir gefällt nicht, dass manche Posts runde Kacheln haben und
// manche nicht."
//
// ⚠️ DIE SUITE WAR ÜBER DEN GESAMTEN UMBAU HINWEG BLIND – belegt, nicht
// vermutet. Zwei vollständige Läufe gegen die ausgelieferte Fassung, einmal
// mit und einmal ohne den Umbau, beide **312 grün / 5 rot / 1 übersprungen**,
// und die Liste der roten Fälle war per `diff` identisch (die fünf sind die
// vorbestehenden aus Roadmap 26). Kein einziger Test unterschied die beiden
// Zustände.
//
// ⚠️ UND EIN TEST HÄTTE ES BEINAHE GESEHEN – das ist der eigentliche Befund.
// `newsfeed-mobil.spec.mjs:304` misst die Beitragshöhe gegen eine Obergrenze
// von 160 px (gemessen 155) und trägt im Kommentar sogar wörtlich die Zahl,
// um die es geht: „wächst jeder Beitrag um 12px". Er greift trotzdem nicht,
// weil er über `querySelector` nur den ERSTEN Beitrag nimmt. Ist der ein
// Ereignis-Beitrag, ist dessen Geometrie unverändert – der Wächter misst dann
// ein Exemplar, das vom Defekt gar nicht betroffen sein muss.
// **Die richtige Größe, am falschen Gegenstand** – dieselbe Fehlerform wie in
// Roadmap 27 (dort hingen Ober- und Untergrenze desselben Abstands an zwei
// verschiedenen Elementen). Deshalb misst DIESER Test grundsätzlich ALLE
// Beitragswurzeln und nie nur eine.
//
// ⚠️ DER NAME NENNT DIE EIGENSCHAFT, NICHT DAS BAUTEIL – Lehre aus
// `ball-drehpunkt.spec.mjs`. Alle drei früheren stillen Löschungen von
// Wächtern waren damit begründet, dass das BAUTEIL im Dateinamen verschwunden
// war. „PostCard" kommt hier nirgends vor: Bewacht wird die Gleichheit der
// Kacheln, nicht die Existenz einer Komponente.
//
// ⚠️ GEMESSEN WIRD DIE GEZEICHNETE FASSUNG, NICHT DER KLASSENNAME.
// `getComputedStyle` statt `className.includes(...)`. Ein Klassennamen-Test
// wäre für die halbe Fehlerfamilie blind: Die Schwester-Auslassung im selben
// Umbau bestand darin, dass an drei Eingabefeldern GAR KEINE Flächenklasse
// stand – da gibt es keinen Namen zu lesen, nur eine gezeichnete Farbe.
import { test, expect } from "@playwright/test";

const FENSTER = [
  { breite: 390, hoehe: 844, name: "mobil" },
  { breite: 1440, hoehe: 1000, name: "Desktop" },
];

async function anmelden(request) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email: "max@test.de", password: "test123" },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token – ohne Anmeldung gibt es keinen Feed, und dieser Test prüft ` +
      `dann nichts. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

async function feedOeffnen(page, token, breite, hoehe) {
  await page.setViewportSize({ width: breite, height: hoehe });
  await page.addInitScript((t) => {
    localStorage.setItem("playerAuthToken", t);
    // Sonst startet die Willkommens-Tour und legt sich über die Seite.
    sessionStorage.setItem("hg_welcome_token", t);
  }, token);
  // Der Nachrichtenfeed ist eine fremde Quelle. Ein Wächter, dessen Auslösung
  // davon abhängt, was ein Verlag heute veröffentlicht, ist keiner
  // (Lehre aus `nachrichten-karten.spec.mjs`).
  await page.route("**/api/news/rss", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, news: [] }),
    }),
  );
  await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("main button[aria-pressed]", { timeout: 30_000 });
}

// ── Die Beitragswurzeln finden ────────────────────────────────────────────
// Strukturell, nicht über eine Markierung: Jeder Beitrag hat genau eine
// Aktionsleiste, sie enthält den Like-Knopf, ihr Elternelement ist die Kachel.
// Dasselbe Muster benutzt `newsfeed-mobil.spec.mjs` seit dem 18.08.2026.
//
// ⚠️ Bewusst KEIN eigenes `data-`-Attribut: Ein Wächter, der an einer eigens
// für ihn gesetzten Markierung hängt, stirbt mit ihr – und dann sieht nichts
// kaputt aus.
//
// ⚠️ ABER `aria-pressed` HÄNGT NICHT NUR AN BEITRÄGEN: `TourSteps.js` benutzt
// es ebenfalls. Der Tour-Start ist oben abgeschaltet, doch sich darauf zu
// verlassen hieße, die Aussagekraft dieses Tests an eine fremde Komponente zu
// hängen. Deshalb wird zusätzlich nach dem gemeinsamen Elternelement
// gruppiert: Die Beitragsliste ist der Container mit den meisten Treffern,
// alles andere fällt heraus – und WIE VIEL herausfiel, wird mitgemeldet,
// damit die Aussonderung nicht still passiert.
async function kachelnMessen(page) {
  return page.evaluate(() => {
    const knoepfe = [...document.querySelectorAll("main button[aria-pressed]")];
    const nachListe = new Map();
    for (const b of knoepfe) {
      const wurzel = b.parentElement?.parentElement;
      const liste = wurzel?.parentElement;
      if (!wurzel || !liste) continue;
      if (!nachListe.has(liste)) nachListe.set(liste, []);
      nachListe.get(liste).push(wurzel);
    }
    let wurzeln = [];
    for (const [, w] of nachListe) if (w.length > wurzeln.length) wurzeln = w;

    return {
      knoepfeGesamt: knoepfe.length,
      verworfen: knoepfe.length - wurzeln.length,
      kacheln: wurzeln.map((w, i) => {
        const s = getComputedStyle(w);
        return {
          i,
          flaeche: s.backgroundColor,
          radius: [
            s.borderTopLeftRadius, s.borderTopRightRadius,
            s.borderBottomRightRadius, s.borderBottomLeftRadius,
          ].join(" "),
          rahmen: [
            s.borderTopWidth, s.borderRightWidth,
            s.borderBottomWidth, s.borderLeftWidth,
          ].join(" "),
          polster: [
            s.paddingTop, s.paddingRight,
            s.paddingBottom, s.paddingLeft,
          ].join(" "),
          text: w.textContent.replace(/\s+/g, " ").trim().slice(0, 44),
        };
      }),
    };
  });
}

test.describe("Beitragskacheln im Feed", () => {
  for (const f of FENSTER) {
    test(`${f.breite}px (${f.name}): jeder Beitrag trägt dieselbe Kachelgeometrie`, async ({
      page,
      request,
    }) => {
      const token = await anmelden(request);
      await feedOeffnen(page, token, f.breite, f.hoehe);
      const m = await kachelnMessen(page);

      // ── Ehrlichkeitsschranke 1: gibt es genug zu vergleichen? ───────────
      // Ein Gleichheitstest über EINEN Beitrag ist trivial grün. Er muss
      // scheitern, nicht schweigen.
      expect(
        m.kacheln.length,
        `Nur ${m.kacheln.length} Beitrag/Beiträge im Feed gefunden ` +
          `(${m.knoepfeGesamt} Like-Knöpfe insgesamt). Eine Aussage über die ` +
          `GLEICHHEIT von Kacheln braucht mindestens zwei – sonst ist dieser ` +
          `Test grün, ohne etwas gemessen zu haben.`,
      ).toBeGreaterThanOrEqual(2);

      // ── Ehrlichkeitsschranke 2: sind beide RÄNGE vertreten? ─────────────
      // Der Befund betraf ausschließlich den Unterschied ZWISCHEN Ereignis-
      // und Wort-Beiträgen. Ein Feed aus lauter Ereignissen würde die
      // Rückkehr des Defekts per Konstruktion nicht sehen – dann ist der
      // Test wertlos, nicht bestanden.
      const flaechen = [...new Set(m.kacheln.map((b) => b.flaeche))];
      expect(
        flaechen.length,
        `Alle ${m.kacheln.length} Beiträge haben dieselbe Fläche ` +
          `(${flaechen[0]}). Dann liegen entweder nur Ereignisse oder nur ` +
          `Worte im Feed, und dieser Test misst den Unterschied nicht, um den ` +
          `es geht. Prüfdaten reparieren (\`scripts/seed-demo.mjs\`), nicht ` +
          `die Schranke senken.`,
      ).toBeGreaterThanOrEqual(2);

      // ── Die eigentliche Zusicherung ─────────────────────────────────────
      const zeige = (feld) =>
        m.kacheln.map((b) => `  [${b.i}] ${b[feld]}   („${b.text}…")`).join("\n");

      for (const [feld, was] of [
        ["radius", "Eckenrundung"],
        ["rahmen", "Rahmenbreite"],
        ["polster", "Innenabstand"],
      ]) {
        const werte = [...new Set(m.kacheln.map((b) => b[feld]))];
        expect(
          werte.length,
          `Die Beiträge im Feed haben unterschiedliche ${was}:\n${zeige(feld)}\n\n` +
            `Genau das war Patricks Befund vom 22.08.2026 („manche Posts haben ` +
            `runde Kacheln und manche nicht"). Der Rangunterschied zwischen ` +
            `Ereignis und Wort gehört in die FLÄCHE (navy-800 gegen den ` +
            `durchscheinenden navy-950-Grund), nicht in die Geometrie.`,
        ).toBe(1);
      }

      // Und es muss eine Kachel bleiben: kein Radius = kein Kasten. Ohne
      // diese Zeile wäre „alle gleich" auch dann erfüllt, wenn man allen
      // Beiträgen den Kasten wegnimmt.
      expect(
        m.kacheln[0].radius,
        `Die Beiträge haben keine Eckenrundung (${m.kacheln[0].radius}). Sie ` +
          `sind zwar alle gleich, aber es ist keine Kachel mehr.`,
      ).not.toBe("0px 0px 0px 0px");

      // Aussonderung sichtbar machen – nicht als Fehler, aber als Zahl im
      // Protokoll, damit ein wachsender Rest auffällt.
      expect(
        m.verworfen,
        `${m.verworfen} von ${m.knoepfeGesamt} Like-Knöpfen lagen außerhalb ` +
          `der Beitragsliste. Ein oder zwei sind erklärbar (Tour); wird die ` +
          `Zahl größer, stimmt die Wurzel-Auswahl nicht mehr.`,
      ).toBeLessThanOrEqual(2);
    });
  }

  test("der Rangunterschied lebt weiter – als Fläche, nicht als Form", async ({
    page,
    request,
  }) => {
    // ⚠️ Eigener Fall, weil er die GEGENRICHTUNG absichert (Vorschlag Tobias,
    // 22.08.2026). Die Gleichheit oben ließe sich auch dadurch herstellen,
    // dass man den Rang ganz abschafft – der ganze Unterschied hängt seit dem
    // Umbau an EINER Klasse (`bg-navy-800` im `isAuto`-Zweig). Fällt sie weg,
    // sind alle Kacheln identisch, nichts sieht kaputt aus, und ohne diesen
    // Fall wird nichts rot. Dann wäre Viviens Entscheidung vom 15.08.
    // („ein bestätigtes 80:94 und ‚Game Day!' dürfen nicht dasselbe Gewicht
    // haben") still zurückgenommen.
    const token = await anmelden(request);
    await feedOeffnen(page, token, 1440, 1000);
    const m = await kachelnMessen(page);

    const zaehl = {};
    for (const b of m.kacheln) zaehl[b.flaeche] = (zaehl[b.flaeche] || 0) + 1;
    const flaechen = Object.keys(zaehl);

    expect(
      flaechen.length,
      `Im Feed gibt es ${flaechen.length} Flächenstufe(n) statt zwei: ` +
        `${JSON.stringify(zaehl)}. Erwartet sind genau zwei – das beleuchtete ` +
        `Segment (Ereignis) und das unbeleuchtete (Wort). Bei EINER ist der ` +
        `Rangunterschied weg; bei DREI ist eine Stufe dazugekommen, die die ` +
        `visuelle Richtung nicht kennt (navy-900 ist die Rolle der ` +
        `Navigationsleiste).`,
    ).toBe(2);

    // „Zwei verschiedene Flächen" allein wäre auch mit zwei falschen Werten
    // erfüllt. navy-800 = #182543 = rgb(24, 37, 67) ist die Panel-Stufe.
    expect(
      flaechen,
      `Keine der beiden Flächen ist navy-800 (rgb(24, 37, 67)), die ` +
        `Panel-Stufe der visuellen Richtung. Gemessen: ${JSON.stringify(zaehl)}`,
    ).toContain("rgb(24, 37, 67)");
  });
});
