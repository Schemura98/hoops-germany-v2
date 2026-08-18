import { test, expect } from "@playwright/test";

// Prüft das ROHE Server-Blatt von /signup – nicht die Seite im Browser.
//
// ⚠️ WARUM DIESER UNTERSCHIED DER GANZE PUNKT IST (Roadmap 22, behoben 19.08.2026):
// Im Browser sah /signup immer richtig aus. Ausgeliefert wurde monatelang eine
// LEERE Seite: 0 Eingabefelder, 0 <main>, 0 Verweise auf Datenschutz und
// Impressum. Ursache war ein Adresszeilen-Haken (`useSearchParams`), der beim
// Vorrendern die umschließende Suspense-Grenze auf ihren Ersatzinhalt fallen
// ließ – und der war leer. Jeder Test, der den Browser fragt, wäre grün
// geblieben. Deshalb wird hier die Antwort des Servers gelesen, bevor
// JavaScript sie anfassen kann.
//
// Nele hat am 19.08.2026 entschieden, den Hero auf EINE Aktion zu reduzieren.
// Damit ist /signup der einzige Ausgang der Startseite: Klemmt diese Seite,
// klemmt die Startseite. Vorher war es ein Schönheitsfehler, jetzt nicht mehr.

async function serverHtml(request, pfad) {
  const r = await request.get(pfad);
  expect(r.ok(), `${pfad} nicht erreichbar`).toBeTruthy();
  const html = await r.text();
  // Ehrlichkeitsschranke: eine kurze Antwort misst nichts.
  expect(html.length, `${pfad} liefert fast nichts – Test misst nichts`).toBeGreaterThan(2000);
  return html;
}

test.describe("/signup ohne JavaScript", () => {
  test("das ausgelieferte Blatt trägt Formular, Hauptbereich und Rechtsverweise", async ({ request }) => {
    const html = await serverHtml(request, "/signup");

    const felder = (html.match(/<input/g) || []).length;
    expect(
      felder,
      "Das ausgelieferte HTML trägt kein Eingabefeld – die Seite kommt leer an " +
        "und wird erst im Browser gezeichnet"
    ).toBeGreaterThanOrEqual(4);

    expect(/<main[\s>]/.test(html), "Keine <main>-Landmarke im ausgelieferten HTML").toBeTruthy();

    // ⚠️ Der Punkt für Nora: Sie hat die Rechtsverweise am 13.08.2026 für
    // genau diese Seite verlangt (Art. 13 DSGVO, § 5 DDG). Eingebaut waren
    // sie – im ausgelieferten Blatt standen sie nie.
    expect(html, "Kein Datenschutz-Verweis im ausgelieferten HTML").toContain("/datenschutz");
    expect(html, "Kein Impressum-Verweis im ausgelieferten HTML").toContain("/impressum");

    // Die Mindestalter-Selbstauskunft ist serverseitig erzwungen; sie muss
    // auch lesbar sein, bevor jemand das Formular ausfüllt.
    expect(html.toLowerCase()).toContain("16");
  });

  test("/login bleibt unverändert vollständig", async ({ request }) => {
    // Gegenprobe aus dem Befund: /login hat dieselbe fallback-lose Grenze,
    // nutzt aber keinen Adresszeilen-Haken und war deshalb nie betroffen.
    // Bricht dieser Fall, liegt es an etwas anderem als an /signup.
    const html = await serverHtml(request, "/login");
    expect((html.match(/<input/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(/<main[\s>]/.test(html)).toBeTruthy();
  });
});
