// ══ GEMEINSAME WERKZEUGE FÜR DIE STARTSEITEN-WÄCHTER ════════════════════════
//
// Vier Dinge, die mehr als eine Testdatei braucht — und jedes davon steht hier,
// weil es beim ersten Mal falsch gemacht wurde:
//
//   1. `anmelden`      – eine ECHTE Anmeldung statt eines erfundenen Tokens
//   2. `warteAufRuhe`  – warten, bis das Layout STEHT, nicht bis es DA ist
//   3. `ballKontur`    – die gezeichnete Kontur, nicht die Hüllbox
//   4. `drehVersatz`   – den Drehpunkt MESSEN, nicht im Quelltext lesen
//
// ══ ⚠️ 1. WARUM DER GEFÄLSCHTE TOKEN WEG IST (Befund B11) ══════════════════
//
// `dribbelweg.spec.mjs` hat den angemeldeten Zustand bis zum 21.08.2026 so
// hergestellt:
//     localStorage.setItem("playerAuthToken", "wachhund.wachhund.wachhund")
// Das ist ein Ausweis, den niemand ausgestellt hat. Gemessen: **7 Antworten
// mit 401** (5× `getmyinfo`, 2× `getnotifications`), und die Seite rendert
// daraufhin GEMISCHT — der Abschluss-Block zeigt die angemeldete Fassung
// (er fragt nur, ob ein Token im Speicher liegt), die Navigationsleiste zeigt
// „Anmelden · Registrieren". Eine halbe Seite, die es so bei keinem Nutzer
// gibt.
//
// Das ist nicht bloß unsauber, es verfälscht genau die Größe, an der der Pass
// hängt: Der ausgeloggte und der angemeldete Block sind VERSCHIEDEN HOCH, und
// aus der Blockhöhe folgt `restUnten` und damit die Endmarke des Passes. Ein
// halb angemeldeter Zustand misst eine Geometrie, die niemand zu sehen bekommt.
//
// ⚠️ Meine eigene erste Abhilfe war die billige: `getmyinfo` mit einer
// erfundenen Antwort beantworten. Die ist verworfen — eine erfundene Antwort
// ist eine ZWEITE Quelle der Wahrheit neben der echten Route, und sie driftet
// still, sobald jemand das Feld `team` oder `isTeamAdmin` anders befüllt.
// `hero-standbild.spec.mjs` macht es seit dem 20.08. richtig vor: sich mit
// einem echten Dev-DB-Konto anmelden. Gemessen mit echtem Token:
// **0 Fehlantworten**, Überschrift „Hey Max, …", Navigationsleiste ohne
// „Registrieren".
//
// ⚠️ Die Ehrlichkeitsschranke ist der Kern, nicht die Zugabe: Ohne sie wäre
// ein abgelaufener Token oder ein umbenannter Speicherschlüssel kein roter
// Test, sondern ein GRÜNER über dem ausgeloggten Zustand — jeder „angemeldet"
// betitelte Fall prüfte dann denselben Zustand wie sein ausgeloggter Zwilling.
import { expect } from "@playwright/test";

const TESTKONTO = { email: "max@test.de", password: "test123" };

// Meldet sich echt an und legt den Token in den Speicher. Gibt den Vornamen
// zurück — er ist der Beleg, den die Schranke unten braucht.
export async function anmelden(page, request) {
  const res = await request.post("/api/player/playerlogin", { data: TESTKONTO });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Keine Anmeldung mit ${TESTKONTO.email} möglich (Status ${res.status()}). ` +
      `Ohne Token rendert die AUSGELOGGTE Startseite, und jeder „angemeldet"-Fall ` +
      `prüft denselben Zustand wie sein ausgeloggter Zwilling. ` +
      `Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);

  const info = await request.post("/api/player/getmyinfo", { data: { token } });
  const ij = await info.json().catch(() => ({}));
  const vorname = ij?.data?.player?.firstName || ij?.player?.firstName || "";
  expect(
    vorname.length,
    "Kein Vorname aus getmyinfo — ohne ihn greift die Ehrlichkeitsschranke nicht.",
  ).toBeGreaterThan(0);

  await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), token);
  return vorname;
}

// Lädt die Startseite. Im angemeldeten Fall wird NACHGEWIESEN, dass der
// angemeldete Zweig auch wirklich gerendert hat.
export async function ladeStartseite(page, { angemeldet = false, request = null } = {}) {
  let vorname = null;
  if (angemeldet) {
    expect(
      request,
      "ladeStartseite({ angemeldet: true }) braucht die `request`-Fixture — " +
        "der angemeldete Zustand wird echt angemeldet, nicht behauptet.",
    ).toBeTruthy();
    vorname = await anmelden(page, request);
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-feature-zeile]");
  if (angemeldet) {
    // Der Hero entscheidet erst NACH der Anmeldeprüfung, welchen Zweig er
    // rendert. Der Vorname im `h1` ist der Beleg, dass er getauscht hat.
    await expect(
      page.locator("[data-hero-stage] h1"),
      `Die Hero-Überschrift nennt „${vorname}" nicht — der angemeldete Zweig ` +
        `hat nicht getauscht. Dieser Fall misst dann den AUSGELOGGTEN Zustand.`,
    ).toContainText(vorname, { timeout: 15_000 });
  }
  return vorname;
}

// ══ ⚠️ 2. WARTEN, BIS ES STEHT — NICHT, BIS ES DA IST ══════════════════════
//
// CLAUDE.md hält die Falle zweimal fest („auf das Element warten reicht nicht,
// es muss zur RUHE gekommen sein"). Hier ist sie besonders scharf: Die Absätze
// im Abschluss-Block sind `<Reveal>`-Elemente und stehen während ihrer
// Einblendung per `transform` 6–18 px TIEFER als ihr Layoutkasten — also im
// Band, in dem der Ball liegt. Wer währenddessen misst, meldet eine Berührung,
// die 200 ms später keine mehr ist.
//
// Kein fester Wartewert: Es wird abgetastet, bis sich drei Bilder lang nichts
// mehr bewegt. Eine geratene Zahl ist genau die Fehlerklasse, die dieses
// Projekt schon zweimal einen Fehlalarm gekostet hat.
export async function warteAufRuhe(page, wurzel) {
  const bewegt = await page.evaluate(async (sel) => {
    const w = document.querySelector(sel);
    if (!w) return null;
    const schnapp = () =>
      [...w.querySelectorAll("*")]
        .map((e) => {
          const r = e.getBoundingClientRect();
          return `${r.top.toFixed(1)},${r.left.toFixed(1)},${r.width.toFixed(1)}`;
        })
        .join("|");
    let vorher = schnapp();
    let stabil = 0;
    let bilder = 0;
    while (bilder < 120 && stabil < 3) {
      await new Promise((r) => requestAnimationFrame(r));
      bilder += 1;
      const jetzt = schnapp();
      stabil = jetzt === vorher ? stabil + 1 : 0;
      vorher = jetzt;
    }
    return bilder;
  }, wurzel);
  expect(bewegt, `Der Bezug „${wurzel}" existiert nicht — es wurde nichts gemessen.`).not.toBeNull();
  return bewegt;
}

// ══ ⚠️ 3. KONTUR, NICHT HÜLLBOX ════════════════════════════════════════════
//
// Der Kopfkommentar von `Dribbelweg.js` warnt ausdrücklich davor, und ich bin
// in dieser Runde trotzdem hineingelaufen: `getBoundingClientRect()` auf einem
// GEDREHTEN `<g>` liefert nicht den Ball, sondern die achsparallele Hüllbox
// seines gedrehten Kastens. Gemessen schwankt sie mit dem Drehwinkel zwischen
// 18,0 und 25,3 px, während der Ball unverändert 18 px Durchmesser hat
// (Kreis r = 9 in einem 20er-Kasten). Wer `rect.width / 2` als Radius nimmt,
// meldet je nach Winkel bis zu 3,7 px zu wenig Luft — Roadmap 20d (b) im neuen
// Kostüm.
//
// Richtig ist die Bildschirm-Matrix: Der lokale Mittelpunkt (10, 10) wird
// durch `getScreenCTM()` geschoben, der Radius mit dem Maßstab derselben
// Matrix multipliziert. Beides ist drehinvariant.
export async function ballKontur(page, sel) {
  return page.evaluate((s) => {
    const g = document.querySelector(s);
    if (!g) return null;
    const ctm = g.getScreenCTM?.();
    if (!ctm) return null;
    const p = new DOMPoint(10, 10).matrixTransform(ctm);
    const skala = Math.hypot(ctm.a, ctm.b);
    return {
      cx: p.x,
      cy: p.y,
      r: 9 * skala, // gezeichneter Radius (DribbelBall: circle r="9")
      deck: Number(getComputedStyle(g).opacity),
    };
  }, sel);
}

// ══ ⚠️ 4. DEN DREHPUNKT MESSEN, NICHT LESEN ════════════════════════════════
//
// `tests/e2e/README.md` hält fest, was der Nachfolger können MUSS: den
// Drehpunkt im Browser messen. Der Quelltext-Fall der Urfassung hätte den
// Desktop-Ausfall mit halber Wahrscheinlichkeit durchgelassen — er las eine
// Zeichenkette in EINER Datei, während der Fehler an einer von ZWEI
// Aufrufstellen saß.
//
// Das Verfahren braucht die Zeichenkette gar nicht: Wird um die Ballmitte
// gedreht, ist die Mitte drehINVARIANT. Also einmal messen wie gezeichnet,
// einmal mit entferntem `rotate(...)` derselben Transformation — und beide
// Mitten müssen zusammenfallen. Sitzt der Drehpunkt woanders, schwenkt der
// Ball um einen fremden Punkt und die Mitte wandert.
//
// ⚠️ BEIDE MESSUNGEN LIEGEN IN EINEM `evaluate` OHNE `await` DAZWISCHEN.
// Der Ball wird pro Bild neu gesetzt; jede Unterbrechung würde die zweite
// Messung gegen einen frisch geschriebenen Transform laufen lassen, und der
// Versatz wäre der Scrollbewegung zuzuschreiben statt dem Drehpunkt.
//
// Deckt beide Schreibweisen ab: SVG-Attribut `rotate(a cx cy)` (Desktop-Ball,
// Pass-Ball) und CSS `rotate(Ndeg)` mit `transform-origin` (mobiler Ball).
export async function drehVersatz(page, sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const attr = el.getAttribute("transform");
    const roh = attr ?? el.style.transform;
    if (!roh || !/rotate\(/.test(roh)) return { winkel: 0, dx: 0, dy: 0, ohneDrehung: true };
    const winkel = Number((roh.match(/rotate\(\s*(-?[\d.]+)/) || [0, 0])[1]);
    const mitte = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

    const r1 = el.getBoundingClientRect();
    const a = mitte(r1);
    const ohne = roh.replace(/\s*rotate\([^)]*\)/, "");
    if (attr !== null) el.setAttribute("transform", ohne);
    else el.style.transform = ohne;
    const r2 = el.getBoundingClientRect();
    const b = mitte(r2);
    if (attr !== null) el.setAttribute("transform", roh);
    else el.style.transform = roh;

    return {
      winkel,
      dx: a.x - b.x,
      dy: a.y - b.y,
      breiteMit: r1.width,
      breiteOhne: r2.width,
      ohneDrehung: false,
    };
  }, sel);
}
