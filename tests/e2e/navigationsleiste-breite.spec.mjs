// ═══════════════════════════════════════════════════════════════════════════
// DIE NAVIGATIONSLEISTE PASST IN IHREN EIGENEN KASTEN
// ═══════════════════════════════════════════════════════════════════════════
//
// WAS HIER BEWACHT WIRD — und warum der naheliegende Test nicht gereicht hätte
// ---------------------------------------------------------------------------
// Gemeldet wurde am 20.08.2026 ein seitlicher Überlauf bei 1024 px (Tobias).
// Das war aber nur das ENDE einer Rutschbahn, nicht ihr Anfang (Befund Vivien):
//
//   Die Leiste sitzt in `max-w-6xl` (1152) mit `px-6` (2×24). Mehr als 1104 px
//   Inhaltsbreite gibt es also auf KEINEM Bildschirm — auch nicht auf einem
//   1600er. Das Budget ist eine Konstante, keine Funktion der Fensterbreite.
//   Angemeldet brauchte die Leiste 1214,6 px, war also IMMER UND ÜBERALL um
//   110,6 px zu voll. Die Wortmarke war das einzige nachgiebige Element und
//   hat den Überhang still geschluckt: 39,2 px breit auf einem 1600-px-Monitor.
//   Sie ist zugleich der einzige Weg zurück zur Startseite.
//
// ⚠️ DARAUS FOLGT DIE BAUFORM DIESER DATEI: Ein Test, der nur den Querlauf
// prüft, hätte den Zustand „Wortmarke auf 39 px gequetscht" auf KEINER Breite
// gefangen — bei 1600 px lief nichts über, es war nur alles falsch. Der
// Überlauf-Wächter (Abschnitt 1) ist deshalb der schwächere von beiden; der
// eigentliche ist der Wortmarken-Wächter (Abschnitt 2).
//
// Viviens Satz dazu, der die Bauform begründet:
//   „Ein Überlauf ist messbar, ein Schrumpfen war es nicht."
// `shrink-0` macht aus dem leisen Versagen ein lautes — und ein lautes Versagen
// ist das, was ein Test überhaupt sehen kann.
//
// DIE DREI FALLEN, IN DIE MEINE EIGENEN SONDEN VORHER GELAUFEN SIND
// ---------------------------------------------------------------------------
// (1) ZU FRÜH GEMESSEN. Fünf Sonden meldeten „kein Befund", weil sie nach
//     `networkidle` maßen. Die angemeldeten Punkte der Leiste entstehen aber
//     erst, wenn `getmyinfo` aufgelöst hat — vorher misst man die AUSGELOGGTE
//     Leiste und die passt mühelos. Deshalb `zurRuhe()`: warten, bis die
//     Geometrie über mehrere Bilder hinweg STILLSTEHT, nicht bis das Netz ruhig
//     ist.
// (2) KEINE EHRLICHKEITSSCHRANKE. Ein Test, der die ausgeloggte Leiste misst,
//     ist grün und misst nichts. `gateAngemeldet()` prüft deshalb ZWEISEITIG:
//     der angemeldete Punkt muss da sein UND der ausgeloggte weg. Eine Hälfte
//     allein trägt nicht — „Feed" fehlt auch, wenn die Seite gar nicht geladen
//     hat.
// (3) ZUSTAND AUS EINEM FRÜHEREN LAUF. Nicht neu laden, sondern die Breite
//     ändern: Die Umschaltung ist reines CSS. Das spart nicht nur Zeit, es
//     hält auch den Anmeldezustand über alle Breiten hinweg identisch.
//
// Konto: `max@test.de` — Team-Admin auf der Dev-DB. NICHT beliebig austauschbar:
// Ein Spieler ohne Team hat weder „Team-Admin" noch „Mein Team" und ist damit
// 95 px schmaler; er passt auch im kaputten Zustand. Nachgemessen am gebauten
// Stand (20.08.2026, Ersatzschrift, /transfermarkt):
//     Team-Admin        1075,7 px   ← breitester anmeldbarer Fall
//     Spieler mit Team  1065,3 px
//     Spieler ohne Team   980,8 px
// Budget 1104 px.
//
import { test, expect } from "@playwright/test";

const KONTO = { email: "max@test.de", password: "test123" };

// Das kritische Band. Die Obergrenze ist NICHT 1024: Auf /transfermarkt ist der
// aktive Punkt `font-semibold` und damit fetter — Viviens Gegenprobe zeigte den
// Defekt bis 1094 px. Deshalb reicht das Band bis an den Umschaltpunkt heran
// und über ihn hinaus.
const BAND = [1024, 1056, 1088, 1094, 1120, 1151, 1152, 1280, 1440, 1600];

// Schmale Breiten für den Wortmarken-Wächter. Dort ist die Leiste zusammen-
// geklappt, die Wortmarke muss trotzdem ihre volle Breite haben.
const SCHMAL = [320, 360, 375, 390, 430, 640, 768];

// Mehr als eine Seite, weil die Breite der Leiste von der Seite abhängt: Der
// AKTIVE Punkt trägt `font-semibold`. /transfermarkt ist der längste davon und
// damit der ungünstigste Fall.
const SEITEN = ["/transfermarkt", "/spieler", "/ligen", "/spiele"];

const UMSCHALTPUNKT_AN = 1152; // `leiste` in tailwind.config.js
const UMSCHALTPUNKT_AUS = 1024; // `lg`

// Die Wortmarke darf gegenüber ihrem eigenen Seitenverhältnis nicht
// zusammengedrückt sein. Gemessen liegt das Verhältnis bei 0,999; im kaputten
// Zustand bei 0,26. Die Schwelle 0,98 liegt weit von beiden entfernt.
const STAUCHUNG_MIN = 0.98;
const WORTMARKE_MIN_PX = 90; // gemessen 122,7 (mobil) / 149,9 (Desktop)

// So viele aufeinanderfolgende Bilder muss die Geometrie unverändert bleiben,
// damit sie als „eingeschwungen" gilt.
// ⚠️ Diese Zahl ist zugleich die Untergrenze der Ehrlichkeitsschranke unten —
// beide MÜSSEN gekoppelt bleiben. Beim ersten Anlauf waren sie es nicht: Die
// Schranke verlangte mehr als 20 Messungen, während die Schleife nach 12
// ruhigen Bildern zurückkehrt und deshalb nie mehr als ~13 erreichen KANN.
// Ergebnis: acht rote Tests über eine Leiste, die völlig in Ordnung war.
// Eine Schranke, die der eigene Erfolgsfall nicht erfüllen kann, prüft nichts —
// sie meldet nur sich selbst.
const RUHIG_NOETIG = 12;

// ---------------------------------------------------------------------------
// Anmelden. Wie in den übrigen Dateien: erst gleiche Herkunft, dann Token.
// ---------------------------------------------------------------------------
async function anmelden(page, request) {
  const res = await request.post("/api/player/playerlogin", { data: KONTO });
  expect(res.status(), `Login ${KONTO.email} auf der Dev-DB`).toBe(200);
  const { token } = await res.json();
  expect(token, "Login lieferte keinen Token").toBeTruthy();
  await page.goto("/spieler");
  await page.evaluate((t) => localStorage.setItem("playerAuthToken", t), token);
  return token;
}

// ---------------------------------------------------------------------------
// EINGESCHWUNGEN MESSEN — nicht „Netz ruhig", sondern „Leiste steht still".
// ---------------------------------------------------------------------------
// ⚠️ Die Funktion WIRFT, wenn die Leiste nicht zur Ruhe kommt, statt still
// weiterzumachen. Eine Sonde, die nicht gemessen hat, darf nicht als grünes
// Ergebnis durchgehen — das ist die Fehlerform aus Roadmap 20f („grüner Test
// mit null Messframes").
async function zurRuhe(page, wo = "") {
  const ergebnis = await page.evaluate(async (noetig) => {
    await document.fonts?.ready;
    const abbild = () => {
      const nav = document.querySelector("nav");
      const logo = document.querySelector('nav a[href="/"] img');
      if (!nav || !logo) return null;
      const n = nav.getBoundingClientRect();
      const l = logo.getBoundingClientRect();
      return [
        n.width.toFixed(2), n.height.toFixed(2),
        l.width.toFixed(2), l.height.toFixed(2),
        document.documentElement.scrollWidth,
      ].join("|");
    };
    let letzte = null, ruhig = 0, messungen = 0;
    for (let i = 0; i < 300; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const jetzt = abbild();
      if (jetzt === null) { ruhig = 0; letzte = null; continue; }
      messungen++;
      if (jetzt === letzte) { if (++ruhig >= noetig) return { messungen, frames: i + 1, ruhe: true }; }
      else ruhig = 0;
      letzte = jetzt;
    }
    return { messungen, frames: 300, ruhe: false };
  }, RUHIG_NOETIG);

  // Ehrlichkeitsschranke: hat die Sonde überhaupt etwas gesehen?
  // Der Ausfall „Leiste nie im Dokument" wird schon von `ruhe` gefangen (ohne
  // Element bleibt `ruhig` auf 0). Diese Zeile ist die Rückversicherung für den
  // Fall, dass jemand `abbild()` später so ändert, dass es einen konstanten
  // Wert liefert — dann stünde `ruhe` auf true, ohne dass je etwas gemessen
  // wurde. Genau die Fehlerform aus Roadmap 20f: grüner Test, null Messframes.
  expect(
    ergebnis.messungen,
    `${wo}: Die Sonde meldet Ruhe nach nur ${ergebnis.messungen} echten ` +
      `Messungen (nötig sind ${RUHIG_NOETIG}). Sie hat die Leiste nicht ` +
      `gesehen — das ist ein Ausfall, kein Messwert.`,
  ).toBeGreaterThanOrEqual(RUHIG_NOETIG);
  expect(
    ergebnis.ruhe,
    `${wo}: Die Leiste ist in 300 Bildern nicht zur Ruhe gekommen. Solange sie ` +
      `sich bewegt, misst jede Zahl einen Zwischenstand.`,
  ).toBe(true);
  return ergebnis;
}

// ---------------------------------------------------------------------------
// EHRLICHKEITSSCHRANKE: hat der Anmeldezweig wirklich getauscht?
// ---------------------------------------------------------------------------
// Zweiseitig, und das ist der Punkt. „Feed ist da" allein wäre auch dann
// erfüllt, wenn … nein, es wäre eben NICHT erfüllt, sondern schlicht falsch —
// und eine fehlende Bedingung sieht wie ein bestandener Test aus. Deshalb muss
// zusätzlich der ausgeloggte Punkt WEG sein. Geprüft wird die Anwesenheit im
// Dokument, nicht die Sichtbarkeit: Unterhalb des Umschaltpunkts steht die
// waagerechte Leiste auf `display:none`, ihre Punkte sind aber da.
async function gateAngemeldet(page, wo) {
  const lage = await page.evaluate(() => ({
    feed: !!document.querySelector('nav a[href="/player/newsfeed"]'),
    registrieren: !!document.querySelector('nav a[href="/signup"]'),
    avatar: !!document.querySelector("nav [data-profil-avatar]"),
  }));
  // ⚠️ Bewusst NUR „Feed" als Nachweis des Anmeldezweigs, NICHT der Avatar.
  // Diese Schranke soll genau eine Frage beantworten: Steht die angemeldete
  // Leiste? Ob sie dabei einen Avatar trägt, ist eine andere Aussage und wird
  // in Abschnitt 4 geprüft. Eine erste Fassung verlangte beides — mit der
  // Folge, dass die Gegenprobe gegen den Stand VOR dem Umbau (dort gibt es
  // keinen Avatar) mit „Zweig hat nicht getauscht" abbrach, obwohl er sehr
  // wohl getauscht hatte. Eine Schranke, die aus dem falschen Grund auslöst,
  // schickt den nächsten Menschen in die falsche Richtung.
  expect(
    lage.feed,
    `${wo}: Der angemeldete Zweig hat NICHT getauscht (Feed=${lage.feed}). ` +
      `Dieser Test misst gerade die ausgeloggte Leiste — die passt mühelos ` +
      `und beweist nichts.`,
  ).toBe(true);
  expect(
    lage.registrieren,
    `${wo}: Neben den angemeldeten Punkten steht noch „Registrieren" — die ` +
      `Leiste zeigt beide Zustände gleichzeitig.`,
  ).toBe(false);
}

async function gateAusgeloggt(page, wo) {
  const lage = await page.evaluate(() => ({
    feed: !!document.querySelector('nav a[href="/player/newsfeed"]'),
    registrieren: !!document.querySelector('nav a[href="/signup"]'),
  }));
  expect(
    lage.registrieren && !lage.feed,
    `${wo}: Der ausgeloggte Zweig steht nicht (Registrieren=${lage.registrieren}, ` +
      `Feed=${lage.feed}).`,
  ).toBe(true);
}

// ---------------------------------------------------------------------------
// Überlauf messen — und bei Befund SAGEN, wer überläuft.
// ---------------------------------------------------------------------------
// Ein rotes „353 > 320" schickt den nächsten Menschen auf die Suche. Diese
// Sonde nennt das äußerste schuldige Element gleich mit, inklusive der Frage,
// ob es überhaupt in der Navigationsleiste sitzt.
async function ueberlauf(page) {
  return await page.evaluate(() => {
    const W = window.innerWidth;
    const dok = document.documentElement.scrollWidth;
    const schuldige = [];
    if (dok > W) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right <= W + 0.5) continue;
        const elternAuchRaus =
          el.parentElement && el.parentElement.getBoundingClientRect().right > W + 0.5;
        if (elternAuchRaus) continue; // nur den äußersten je Zweig
        schuldige.push(
          `<${el.tagName.toLowerCase()}> bis x=${r.right.toFixed(1)}` +
            `${el.closest("nav") ? " (IN DER LEISTE)" : " (nicht in der Leiste)"}` +
            ` "${(el.textContent || "").trim().slice(0, 30)}"`,
        );
        if (schuldige.length >= 4) break;
      }
    }
    // ⚠️ ZWEITE, WICHTIGERE ZAHL: Passt die Leiste in ihre EIGENE Reihe?
    // Das Dokument allein genügt nicht. Auf /ligen liegt der Seiteninhalt in
    // einem `overflow-x-hidden`-Rahmen; der KLEMMT den Überlauf der Leiste ab,
    // statt ihn zu zeigen. Gemessen im kaputten Zustand (1024px, angemeldet):
    // die Leiste braucht 1059,2px, ihre Reihe ist 1024px breit — 63px
    // Navigation werden abgeschnitten, ohne Bildlauf erreichbar. Das Dokument
    // meldete dabei brav 1024 = kein Überlauf.
    // Der geklemmte Zustand ist der SCHLIMMERE von beiden (Inhalt weg statt
    // Inhalt verschoben) und war für die Dokumentmessung unsichtbar.
    const reihe = document.querySelector("nav > div");
    const leiste = reihe
      ? { noetig: reihe.scrollWidth, hat: reihe.clientWidth }
      : null;
    return { fenster: W, dokument: dok, ueber: dok - W, schuldige, leiste };
  });
}

async function wortmarke(page) {
  return await page.evaluate(() => {
    const img = document.querySelector('nav a[href="/"] img');
    if (!img) return null;
    const r = img.getBoundingClientRect();
    // Das Seitenverhältnis der Datei ist die einzige breitenunabhängige
    // Bezugsgröße. Es überlebt eine Änderung der Höhenklasse (`h-9 sm:h-11`)
    // und sogar einen Austausch der Datei — im Gegensatz zu einer fest
    // eingetragenen Pixelzahl, die beim nächsten Logo still falsch würde.
    const verhaeltnis = img.naturalWidth / img.naturalHeight;
    const erwartet = r.height * verhaeltnis;
    return {
      breite: +r.width.toFixed(1),
      hoehe: +r.height.toFixed(1),
      erwartet: +erwartet.toFixed(1),
      anteil: erwartet > 0 ? +(r.width / erwartet).toFixed(4) : 0,
    };
  });
}

async function schalterLage(page) {
  return await page.evaluate(() => {
    const sichtbar = (el) => !!el && el.getBoundingClientRect().width > 0;
    // Die waagerechte Leiste: ihr erster öffentlicher Punkt.
    const zeile = [...document.querySelectorAll('nav a[href="/ligen"]')].some(
      (el) => sichtbar(el) && !el.closest("#mobil-menue"),
    );
    const burger = sichtbar(
      document.querySelector('nav button[aria-controls="mobil-menue"]'),
    );
    return { zeile, burger };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// 1) Der Überlauf-Wächter (der schwächere — siehe Kopf der Datei)
// ═══════════════════════════════════════════════════════════════════════════
test.describe("Angemeldet läuft keine Seite seitlich über", () => {
  for (const seite of SEITEN) {
    test(`${seite} bleibt auf allen Breiten des Bands im Fenster`, async ({
      page,
      request,
    }) => {
      await anmelden(page, request);
      await page.goto(seite);

      const protokoll = [];
      for (const breite of BAND) {
        await page.setViewportSize({ width: breite, height: 900 });
        await zurRuhe(page, `${seite} @ ${breite}px`);
        await gateAngemeldet(page, `${seite} @ ${breite}px`);

        const u = await ueberlauf(page);
        protokoll.push(`${breite}px → Dokument ${u.dokument}px (${u.ueber >= 0 ? "+" : ""}${u.ueber})`);

        // Zuerst die Leiste gegen ihren eigenen Kasten — sie ist die Ursache,
        // das Dokument nur eine der beiden möglichen Wirkungen.
        expect(
          u.leiste,
          `${seite} bei ${breite}px: Die Navigationsreihe wurde nicht gefunden.`,
        ).not.toBeNull();
        expect(
          u.leiste.noetig - u.leiste.hat,
          `${seite} bei ${breite}px: Die Leiste braucht ${u.leiste.noetig}px, ` +
            `ihre Reihe ist aber nur ${u.leiste.hat}px breit — ` +
            `${u.leiste.noetig - u.leiste.hat}px Navigation passen nicht hinein.\n` +
            `  Das Budget der Reihe ist eine KONSTANTE (max-w-6xl 1152 minus ` +
            `2×24 Polsterung = 1104px) und wächst auch auf einem 1600er nicht ` +
            `mit. Entweder die Leiste wird schmaler oder sie klappt früher zu.\n` +
            `  ⚠️ Ob man das SIEHT, hängt an der Seite: Wo ein Rahmen ` +
            `\`overflow-x-hidden\` trägt (z. B. /ligen), wird der Überhang ` +
            `abgeschnitten statt geschoben — dann meldet das Dokument nichts ` +
            `und die Navigation ist trotzdem weg.\n` +
            `  Protokoll: ${protokoll.join(" | ")}`,
        ).toBeLessThanOrEqual(1); // 1px Toleranz: scrollWidth/clientWidth runden

        expect(
          u.ueber,
          `${seite} bei ${breite}px: Das Dokument ist ${u.dokument}px breit, das ` +
            `Fenster ${u.fenster}px — ${u.ueber}px laufen seitlich heraus.\n` +
            `  Äußerste Verursacher: ${u.schuldige.join(" · ") || "(keiner gefunden)"}\n` +
            `  Protokoll: ${protokoll.join(" | ")}`,
        ).toBeLessThanOrEqual(0);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 2) DER WÄCHTER, DER WIRKLICH GEFEHLT HAT
// ═══════════════════════════════════════════════════════════════════════════
// Er hätte den Befund auf JEDEM Monitor gefangen, nicht nur im Querlauf-Band.
// Genau das ist sein Daseinsgrund: Zwischen 1152 und 1600 px lief nie etwas
// über — und trotzdem war die Wortmarke dort auf ein Viertel gestaucht.
test.describe("Die Wortmarke gibt nicht nach", () => {
  test("angemeldet: volle Breite auf jeder Desktop-Breite", async ({
    page,
    request,
  }) => {
    await anmelden(page, request);
    await page.goto("/transfermarkt");

    const protokoll = [];
    for (const breite of BAND) {
      await page.setViewportSize({ width: breite, height: 900 });
      await zurRuhe(page, `Wortmarke @ ${breite}px`);
      await gateAngemeldet(page, `Wortmarke @ ${breite}px`);

      const w = await wortmarke(page);
      expect(w, `Bei ${breite}px steht gar keine Wortmarke in der Leiste.`).not.toBeNull();
      protokoll.push(`${breite}→${w.breite}px (${w.anteil})`);

      expect(
        w.anteil,
        `Bei ${breite}px ist die Wortmarke ${w.breite}px breit, ihrem eigenen ` +
          `Seitenverhältnis nach müssten es ${w.erwartet}px sein (Anteil ` +
          `${w.anteil}). Sie wird zusammengedrückt — genau der Befund vom ` +
          `20.08.2026, bei dem auf einem 1600-px-Monitor 39,2px übrig blieben ` +
          `und NICHTS überlief.\n  Protokoll: ${protokoll.join(" | ")}`,
      ).toBeGreaterThanOrEqual(STAUCHUNG_MIN);

      // Zweites Netz: Das Verhältnis allein bliebe erfüllt, wenn jemand die
      // Höhe auf 4px setzt — dann stimmt die Form und die Marke ist trotzdem
      // unlesbar.
      expect(
        w.breite,
        `Bei ${breite}px ist die Wortmarke nur ${w.breite}px breit ` +
          `(Höhe ${w.hoehe}px). Als Rückweg zur Startseite ist sie damit ` +
          `unbrauchbar, auch wenn ihr Seitenverhältnis stimmt.`,
      ).toBeGreaterThanOrEqual(WORTMARKE_MIN_PX);
    }
  });

  test("auch schmal und auch ausgeloggt", async ({ page }) => {
    await page.goto("/transfermarkt");
    for (const breite of [...SCHMAL, ...BAND]) {
      await page.setViewportSize({ width: breite, height: 900 });
      await zurRuhe(page, `Wortmarke ausgeloggt @ ${breite}px`);
      await gateAusgeloggt(page, `Wortmarke ausgeloggt @ ${breite}px`);

      const w = await wortmarke(page);
      expect(w, `Bei ${breite}px steht gar keine Wortmarke in der Leiste.`).not.toBeNull();
      expect(
        w.anteil,
        `Ausgeloggt bei ${breite}px: Wortmarke ${w.breite}px statt ${w.erwartet}px ` +
          `(Anteil ${w.anteil}).`,
      ).toBeGreaterThanOrEqual(STAUCHUNG_MIN);
      expect(w.breite).toBeGreaterThanOrEqual(WORTMARKE_MIN_PX);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3) Der Umschaltpunkt ist scharf
// ═══════════════════════════════════════════════════════════════════════════
// Kein Zustand mit beidem (Leiste UND Hamburger) und keiner mit keinem. Der
// zweite Fall ist der gefährlichere: Eine Leiste ohne jeden Zugang zur
// Navigation sieht aufgeräumt aus.
test.describe("Der Umschaltpunkt ist scharf", () => {
  test(`angemeldet: ${UMSCHALTPUNKT_AN - 1}px Klappmenü, ${UMSCHALTPUNKT_AN}px Zeile`, async ({
    page,
    request,
  }) => {
    await anmelden(page, request);
    await page.goto("/transfermarkt");

    for (const [breite, erwartet] of [
      [UMSCHALTPUNKT_AN - 1, "burger"],
      [UMSCHALTPUNKT_AN, "zeile"],
    ]) {
      await page.setViewportSize({ width: breite, height: 900 });
      await zurRuhe(page, `Umschaltpunkt @ ${breite}px`);
      await gateAngemeldet(page, `Umschaltpunkt @ ${breite}px`);

      const l = await schalterLage(page);
      expect(
        l.zeile && l.burger,
        `Bei ${breite}px stehen waagerechte Leiste UND Klappmenü-Knopf ` +
          `gleichzeitig — die Navigation ist doppelt.`,
      ).toBe(false);
      expect(
        !l.zeile && !l.burger,
        `Bei ${breite}px steht WEDER die waagerechte Leiste NOCH der ` +
          `Klappmenü-Knopf. Es gibt dann keinen Zugang zur Navigation.`,
      ).toBe(false);
      expect(
        erwartet === "zeile" ? l.zeile : l.burger,
        `Bei ${breite}px wird „${erwartet}" erwartet, gefunden: ` +
          `Zeile=${l.zeile}, Klappmenü=${l.burger}. Der Umschaltpunkt für die ` +
          `ANGEMELDETE Leiste ist ${UMSCHALTPUNKT_AN}px („leiste" in ` +
          `tailwind.config.js) — er ist gegen ein Breitenbudget von 1104px ` +
          `gerechnet, nicht gegriffen.`,
      ).toBe(true);
    }
  });

  test(`ausgeloggt: ${UMSCHALTPUNKT_AUS - 1}px Klappmenü, ${UMSCHALTPUNKT_AUS}px Zeile`, async ({
    page,
  }) => {
    await page.goto("/transfermarkt");
    for (const [breite, erwartet] of [
      [UMSCHALTPUNKT_AUS - 1, "burger"],
      [UMSCHALTPUNKT_AUS, "zeile"],
    ]) {
      await page.setViewportSize({ width: breite, height: 900 });
      await zurRuhe(page, `Umschaltpunkt ausgeloggt @ ${breite}px`);
      await gateAusgeloggt(page, `Umschaltpunkt ausgeloggt @ ${breite}px`);

      const l = await schalterLage(page);
      expect(l.zeile && l.burger, `Bei ${breite}px ausgeloggt: beides gleichzeitig.`).toBe(false);
      expect(!l.zeile && !l.burger, `Bei ${breite}px ausgeloggt: keins von beiden.`).toBe(false);
      expect(
        erwartet === "zeile" ? l.zeile : l.burger,
        `Ausgeloggt bei ${breite}px wird „${erwartet}" erwartet, gefunden: ` +
          `Zeile=${l.zeile}, Klappmenü=${l.burger}. Der ausgeloggte Zustand ` +
          `schaltet weiterhin bei ${UMSCHALTPUNKT_AUS}px („lg") — er ist mit ` +
          `~830px Inhalt schmal genug dafür.`,
      ).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4) DER PROFIL-AVATAR DER LEISTE
// ═══════════════════════════════════════════════════════════════════════════
// Die Nav-Seite einer Zusage, die zwei Dateien weit reicht.
//
// `components/onboarding/TourSteps.js` entscheidet am Marker
// `data-profil-avatar`, ob die Tour sagen darf: „da kommst du jederzeit oben
// rechts hin" (samt Avatar-Zitat) oder nur „Steht in deinem Profil."
// Hier wird die HÄLFTE geprüft, die der Leiste gehört: Wenn sie einen Avatar
// zeigt, muss er der Profil-Weg sein und tatsächlich oben RECHTS stehen.
// Die andere Hälfte — dass die Tour nur behauptet, was zu sehen ist — steht in
// `tests/e2e/tour-ohne-konto.spec.mjs`.
//
// ⚠️ Bewusst KEIN Satz der Form „wo der Marker im Dokument steht, ist er auch
// sichtbar". Ein erster Anlauf hat genau das gefordert und war rot — zu Recht
// rot, aber am falschen Gegenstand: Er hätte Vivien vorgeschrieben, dass die
// Navbar unter 640px einen Avatar zeigen MUSS. Das ist eine
// Gestaltungsentscheidung, und sie hat sie bewusst anders getroffen (auf 360px
// blieben sonst 9px bis zur Überlaufkante). Der Wächter hätte damit etwas
// anderes erzwungen, als in seiner Überschrift stand — dieselbe Fehlerform,
// gegen die der Commit davor angetreten ist.
test.describe("Der Profil-Avatar der Leiste", () => {
  test("steht, wo er sichtbar ist, oben rechts und führt ins Profil", async ({
    page,
    request,
  }) => {
    await anmelden(page, request);
    await page.goto("/spieler");

    let sichtbarGesehen = 0;
    for (const breite of [360, 390, 430, 639, 640, 1024, 1152, 1600]) {
      await page.setViewportSize({ width: breite, height: 900 });
      await zurRuhe(page, `Avatar @ ${breite}px`);
      await gateAngemeldet(page, `Avatar @ ${breite}px`);

      const a = await page.evaluate(() => {
        const el = document.querySelector("nav [data-profil-avatar]");
        if (!el) return { da: false };
        const r = el.getBoundingClientRect();
        return {
          da: true,
          sichtbar: r.width > 0 && r.height > 0,
          ziel: el.getAttribute("href"),
          linkeKante: +r.left.toFixed(1),
          fenster: window.innerWidth,
        };
      });

      expect(
        a.da,
        `Bei ${breite}px trägt die angemeldete Leiste gar keinen ` +
          `Profil-Avatar — der Marker für die Tour fehlt damit ganz.`,
      ).toBe(true);

      if (!a.sichtbar) continue; // unter 640px bewusst ausgeblendet (Vivien)
      sichtbarGesehen++;

      expect(
        a.ziel,
        `Bei ${breite}px führt der Avatar nach "${a.ziel}" statt ins Profil.`,
      ).toBe("/player/player-detail");
      expect(
        a.linkeKante > a.fenster / 2,
        `Bei ${breite}px steht der Avatar bei x=${a.linkeKante} und damit in ` +
          `der LINKEN Hälfte (Fenster ${a.fenster}px). Die Tour sagt „oben ` +
          `rechts" — das wäre dann falsch.`,
      ).toBe(true);
    }

    // Ehrlichkeitsschranke: Hätte die Schleife den Avatar auf KEINER Breite
    // sichtbar gesehen, wären alle Prüfungen übersprungen worden und der Test
    // grün, ohne je etwas geprüft zu haben.
    expect(
      sichtbarGesehen,
      `Der Avatar war auf KEINER der geprüften Breiten sichtbar — dieser Test ` +
        `hat nichts gemessen.`,
    ).toBeGreaterThanOrEqual(4);
  });
});
