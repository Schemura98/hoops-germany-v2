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
  // ⚠️ DIE WILLKOMMENS-TOUR STILLLEGEN (Befund Roadmap 38, 22.08.2026).
  // Diese Datei hatte KEINEN einzigen Treffer auf `hg_welcome_token` und war
  // damit als einzige Leisten-Datei ungeschützt gegen den Auto-Start der Tour.
  // Aufgefallen ist es erst nach einem frischen `node scripts/seed-demo.mjs`:
  // Der Seed setzt bei max@test.de KEIN `welcomeSeen`, die Tour startet also
  // von selbst, legt ihr Overlay über die Seite und ANIMIERT es. Playwright
  // wartet vor jedem Klick darauf, dass ein Element zur Ruhe kommt — der
  // Menü-Knopf kam nie zur Ruhe, und der Fall lief in die Zeitüberschreitung
  // („element is not stable", 120s).
  //
  // ⚠️ Und das ist der eigentliche Befund, nicht der Ausfall: Der Fall war
  // vorher GRÜN, weil frühere Läufe `welcomeSeen` auf true gesetzt hatten. Er
  // hing damit nicht an den Prüfdaten, sondern an den NEBENWIRKUNGEN früherer
  // Läufe — auf einem frisch aufgesetzten Rechner wäre er sofort rot gewesen,
  // ohne dass am Produkt etwas fehlt. Genau die Fehlerform, die CLAUDE.md seit
  // dem 14.08.2026 führt: „Erst den Zustand deterministisch machen, dann an
  // Wartezeiten denken."
  //
  // Der Schlüssel ist der Wächter der Tour selbst (`WelcomeTour.js`), die
  // Datenbank bleibt dadurch unberührt.
  await page.addInitScript((t) => {
    sessionStorage.setItem("hg_welcome_token", t);
  }, token);
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
// ⚠️ NACHTRAG 20.08.2026 (Befund R1 im Code-Review): DIESE FUNKTION HATTE IHR
// SIGNAL VERLOREN — und zwar durch den Fix, den sie bewachen sollte.
// Der Fingerabdruck bestand aus nav-Breite/Höhe, Logo-Breite/Höhe und
// `scrollWidth`. KEINER dieser fünf Werte ändert sich noch, wenn die Anmeldung
// auflöst: Die Leiste ist immer fensterbreit und 64px hoch, das Dokument bleibt
// gleich — und die Logo-Breite, die früher das Signal WAR, ist seit `shrink-0`
// per Konstruktion konstant. Genau dafür wurde `shrink-0` eingebaut.
// Folge: `zurRuhe()` meldete nach ~220ms „eingeschwungen", während `getmyinfo`
// noch lief. Danach feuerte `gateAngemeldet()` mit „Der angemeldete Zweig hat
// NICHT getauscht" — über eine völlig gesunde Leiste.
//
// Die Ironie gehört ins Protokoll: Der Fix hat das Signal beseitigt, an dem der
// Test hing. Deshalb misst der Fingerabdruck jetzt zusätzlich das, was sich
// beim Anmelden WIRKLICH ändert — die Anzahl der Bedienelemente und die
// Sichtbarkeit von Zeile und Klappmenü-Knopf.
// ⚠️ NACHTRAG 2 ZUM SELBEN BEFUND — die halbe Antwort war nicht die Antwort.
// Der Fingerabdruck oben zu erweitern reicht NICHT, und das hat der erste Lauf
// mit einem roten /transfermarkt @ 1024px sofort gezeigt. Der Grund ist
// strukturell und lohnt das Merken:
//
//   „Zwölf Bilder unverändert" heißt EINGESCHWUNGEN, nicht FERTIG.
//   Der Zustand VOR der Anmeldung steht genauso still wie der danach.
//
// Ein reicherer Fingerabdruck verhindert nur, dass die Sonde einen Wechsel
// ÜBERSIEHT, der während des Hinsehens passiert. Passiert er später — beim
// ersten Aufruf zieht `getmyinfo` die Datenbankverbindung frisch hoch —, ist
// die Leiste in diesen 200ms vollkommen ruhig, und die Sonde meldet
// wahrheitsgemäß Ruhe über den falschen Zustand.
//
// Deshalb wird jetzt zuerst auf ein ERGEBNIS gewartet und erst danach auf Ruhe.
// Das Ergebnis ist eindeutig ablesbar, seit beide Zweige hinter `checked`
// hängen: Genau EINE der beiden Marken steht dann in der Leiste — „Feed"
// (angemeldet) oder „Registrieren" (ausgeloggt). Vorher keine von beiden.
// Warten auf ein Ereignis schlägt Warten auf Stillstand, wo immer es ein
// Ereignis gibt.
async function zustandGeklaert(page, wo = "") {
  try {
    await page.waitForFunction(
      () => {
        const nav = document.querySelector("nav");
        if (!nav) return false;
        const an = !!nav.querySelector('a[href="/player/newsfeed"]');
        const aus = !!nav.querySelector('a[href="/signup"]');
        return an !== aus; // genau eine der beiden — nie beide, nie keine
      },
      null,
      { timeout: 30_000 },
    );
  } catch {
    const lage = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return {
        nav: !!nav,
        an: !!nav?.querySelector('a[href="/player/newsfeed"]'),
        aus: !!nav?.querySelector('a[href="/signup"]'),
      };
    });
    throw new Error(
      `${wo}: Der Anmeldezustand der Leiste war nach 30s nicht geklärt ` +
        `(Leiste=${lage.nav}, Feed=${lage.an}, Registrieren=${lage.aus}). ` +
        `Stehen BEIDE Marken, zeigt die Leiste zwei Zustände gleichzeitig; ` +
        `steht KEINE, wartet sie noch auf die Anmeldeauskunft. Beides ist ein ` +
        `Befund, kein Wartezeit-Problem — die Wartezeit hier hochzudrehen ` +
        `verdeckt nur, welcher der beiden Fälle vorliegt.`,
    );
  }
}

async function zurRuhe(page, wo = "") {
  await zustandGeklaert(page, wo);
  const ergebnis = await page.evaluate(async (noetig) => {
    await document.fonts?.ready;
    // Ein Messwert-OBJEKT statt einer Zeichenkette: Der Fingerabdruck wird
    // daraus abgeleitet, die Ehrlichkeitsschranke prüft die Rohwerte. Beide
    // stammen damit zwangsläufig aus derselben Messung — man kann nicht das
    // eine stillstellen und das andere plausibel lassen.
    const messen = () => {
      const nav = document.querySelector("nav");
      const logo = document.querySelector('nav a[href="/"] img');
      if (!nav || !logo) return null;
      const n = nav.getBoundingClientRect();
      const l = logo.getBoundingClientRect();
      const breite = (el) => (el ? +el.getBoundingClientRect().width.toFixed(2) : -1);
      return {
        navBreite: +n.width.toFixed(2),
        navHoehe: +n.height.toFixed(2),
        logoBreite: +l.width.toFixed(2),
        logoHoehe: +l.height.toFixed(2),
        dokument: document.documentElement.scrollWidth,
        // ── ab hier die Werte, die den ANMELDEZUSTAND abbilden ──────────────
        // Angemeldet kommen Team-Admin/Mein Team/Feed, der Avatar, das
        // Abmelde-Symbol und die Glocke dazu; ausgeloggt Anmelden und
        // Registrieren. Die Zahl ändert sich also in JEDER Richtung.
        punkte: nav.querySelectorAll("a, button").length,
        // Und die beiden Größen, um die es in dieser Datei eigentlich geht.
        // Sie sind zugleich das Signal für den dritten Zustand („unbekannt"):
        // Solange er gilt, steht im Band 1024–1151 keines von beidem.
        zeileBreite: breite(
          [...nav.querySelectorAll('a[href="/ligen"]')].find(
            (el) => !el.closest("#mobil-menue"),
          ),
        ),
        burgerBreite: breite(nav.querySelector('button[aria-controls="mobil-menue"]')),
        fenster: window.innerWidth,
      };
    };
    const abdruck = (m) => (m === null ? null : Object.values(m).join("|"));

    let letzte = null, letzteRoh = null, ruhig = 0, messungen = 0;
    for (let i = 0; i < 300; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      const roh = messen();
      const jetzt = abdruck(roh);
      if (jetzt === null) { ruhig = 0; letzte = null; continue; }
      messungen++;
      if (jetzt === letzte) {
        if (++ruhig >= noetig) {
          return { messungen, frames: i + 1, ruhe: true, roh, abdruck: jetzt };
        }
      } else ruhig = 0;
      letzte = jetzt;
      letzteRoh = roh;
    }
    return { messungen, frames: 300, ruhe: false, roh: letzteRoh, abdruck: letzte };
  }, RUHIG_NOETIG);

  // Ehrlichkeitsschranke, Teil 1: hat die Sonde überhaupt etwas gesehen?
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

  // ── Ehrlichkeitsschranke, Teil 2 (Befund R3 im Code-Review) ───────────────
  // Die Zeile darüber war per Konstruktion erfüllt, sobald `ruhe === true`:
  // Ohne Element bleibt `ruhig` auf 0, also fängt sie AUSSCHLIESSLICH den Fall
  // „Leiste nie im Dokument" — den `ruhe` ohnehin schon fängt. Ihr Kommentar
  // versprach mehr, nämlich Schutz gegen ein stillgelegtes `abbild()`. Dieses
  // Versprechen wird hier eingelöst, statt es zu streichen:
  //
  // Wer die Messung konstant macht, muss dafür `messen()` konstant machen —
  // und dann passt die gemeldete Leistenbreite nicht mehr zum Fenster, das
  // Logo hat keine Breite mehr, oder es stehen gar keine Bedienelemente in der
  // Leiste. Jede dieser drei Zeilen bricht dann laut.
  expect(ergebnis.roh, `${wo}: Die Sonde hat gar keinen Messwert geliefert.`).not.toBeNull();
  const r = ergebnis.roh;
  expect(
    r.navBreite <= r.fenster + 1 && r.navBreite >= r.fenster - 20,
    `${wo}: Die Sonde meldet eine Leistenbreite von ${r.navBreite}px bei einem ` +
      `Fenster von ${r.fenster}px. Die Leiste spannt über das ganze Fenster ` +
      `(die 20px Spielraum sind die Bildlaufleiste) — passt das nicht ` +
      `zusammen, misst die Sonde nicht die Leiste, sondern sich selbst.`,
  ).toBe(true);
  expect(
    r.logoBreite,
    `${wo}: Die Sonde meldet eine Wortmarke von ${r.logoBreite}px Breite. ` +
      `Ein konstant gestelltes \`messen()\` sieht genau so aus.`,
  ).toBeGreaterThan(0);
  expect(
    r.punkte,
    `${wo}: Die Sonde zählt ${r.punkte} Bedienelemente in der Leiste. Selbst ` +
      `die ausgeloggte, zusammengeklappte Fassung hat mehr (Wortmarke, ` +
      `Feedback, Lupe, Klappmenü-Knopf plus die Punkte im Menü).`,
  ).toBeGreaterThanOrEqual(5);
  expect(
    ergebnis.abdruck?.includes(String(r.navBreite)),
    `${wo}: Der Fingerabdruck ("${ergebnis.abdruck}") enthält die gemessene ` +
      `Leistenbreite ${r.navBreite} nicht. Dann entscheidet er nicht über ` +
      `dieselbe Sache, die hier geprüft wird — die Ruhe-Erkennung liefe ins ` +
      `Leere, ohne rot zu werden.`,
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

// ⚠️ Diese Schranke hatte dieselbe Schwäche wie `gateAngemeldet()` (Befund R1):
// „Registrieren" steht erst in der Leiste, wenn der Anmeldezustand geklärt ist —
// vorher ist der ganze Block gar nicht gerendert. Kam `zurRuhe()` zu früh
// zurück, meldete sie also „Der ausgeloggte Zweig steht nicht" über eine
// gesunde Leiste. Beide Schranken hängen an derselben Wartelogik; repariert ist
// es dort, nicht hier.
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
    const spur = []; // {breite, sichtbar} — Grundlage der Schranke unten
    const BREITEN = [360, 390, 430, 639, 640, 1024, 1152, 1600];
    for (const breite of BREITEN) {
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

      spur.push({ breite, sichtbar: !!a.sichtbar });
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

    // ── Ehrlichkeitsschranke (Befund R5 im Code-Review neu gefasst) ────────
    // Hier stand `>= 4`. Von den acht geprüften Breiten liegen GENAU VIER bei
    // 640px oder darüber — die Schranke hatte also null Reserve. Verschiebt
    // jemand den Umschaltpunkt des Avatars von `sm:` (640) auf `md:` (768),
    // bleiben drei, und der Test bricht mit „hat nichts gemessen" ab. Das ist
    // die schlimmere Sorte Rot: Es stimmt nicht, und es schickt den nächsten
    // Leser in die falsche Richtung — er sucht einen kaputten Test, während
    // in Wahrheit eine Gestaltungsentscheidung gewandert ist.
    //
    // Ersetzt durch die Eigenschaft, um die es wirklich geht, und die keine
    // Pixelzahl kennt: SICHTBARKEIT IST MONOTON IN DER BREITE. Ab irgendeiner
    // Breite erscheint der Avatar, und darüber bleibt er. Das gilt bei 640
    // genauso wie bei 768 — und es bricht sofort, wenn er auf der breitesten
    // Fassung fehlt oder zwischendurch wieder verschwindet.
    const zeigen = spur.map((s) => `${s.breite}:${s.sichtbar ? "da" : "weg"}`).join(" ");
    expect(
      sichtbarGesehen,
      `Der Avatar war auf KEINER der geprüften Breiten sichtbar — dieser Test ` +
        `hat nichts gemessen. Spur: ${zeigen}`,
    ).toBeGreaterThanOrEqual(1);

    const breiteste = spur[spur.length - 1];
    expect(
      breiteste.sichtbar,
      `Auf der breitesten geprüften Breite (${breiteste.breite}px) fehlt der ` +
        `Profil-Avatar. Wo auch immer sein Umschaltpunkt liegt — hier muss er ` +
        `stehen, sonst hat die angemeldete Leiste auf keinem Desktop einen ` +
        `sichtbaren Weg ins eigene Profil. Spur: ${zeigen}`,
    ).toBe(true);

    const ersteSichtbar = spur.findIndex((s) => s.sichtbar);
    const rueckfall = spur.slice(ersteSichtbar).find((s) => !s.sichtbar);
    expect(
      rueckfall,
      `Der Avatar ist ab ${spur[ersteSichtbar].breite}px sichtbar, bei ` +
        `${rueckfall?.breite}px aber wieder weg. Sichtbarkeit muss mit der ` +
        `Breite wachsen; ein Loch dazwischen ist immer ein Fehler, egal wo der ` +
        `Umschaltpunkt liegt. Spur: ${zeigen}`,
    ).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5) „MEIN PROFIL" UND „ABMELDEN" IM KLAPPMENÜ
// ═══════════════════════════════════════════════════════════════════════════
// Befund R2 im Code-Review vom 20.08.2026:
//   grep -rn "Abmelden\|Mein Profil" tests/e2e/  →  eine Kommentarzeile.
//   Keine einzige Prüfung.
//
// Warum das hier schwerer wiegt als anderswo: ZWISCHEN 640 UND 1151 PX IST DAS
// KLAPPMENÜ ANGEMELDET DER EINZIGE WEG ZUM ABMELDEN. Das Abmelde-Symbol der
// Leiste trägt dieselbe Umschaltklasse wie die waagerechte Zeile (`inline`) und
// ist dort auf `display:none`; der Avatar daneben führt ins Profil, nicht
// hinaus. Wer in diesem Band das Menü nicht erreicht oder die Zeile nicht
// antippen kann, kommt aus seinem Konto nicht mehr heraus.
//
// „Vorhanden" reicht deshalb nicht. Geprüft wird dreistufig:
//   (1) im Dokument,
//   (2) mit echter Fläche UND frei — an ihrem Mittelpunkt liegt kein anderes
//       Element darüber (das Menü hängt in einer Sticky-Leiste mit eigenem
//       Innenscroll; genau dort war „Feedback geben" schon einmal 4,5 px hoch
//       und untippbar),
//   (3) tatsächlich bedient — einmal wird wirklich geklickt und die Wirkung
//       nachgemessen.
//
// Fensterhöhe 667 statt 900 ist Absicht: Bei 900 passt das Menü mühelos, und
// genau deshalb hätte es die historische Fehlerform (untere Zeilen unerreichbar)
// nicht sehen können.
const KLAPP_FAELLE = [
  { breite: 390, hoehe: 667 }, // Telefon
  { breite: 1100, hoehe: 800 }, // im Band, wo es angemeldet keinen anderen Weg gibt
];

async function menuePunkt(page, art) {
  return await page.evaluate((a) => {
    const menu = document.querySelector("#mobil-menue");
    if (!menu) return { menue: false };
    const el =
      a === "profil"
        ? menu.querySelector('a[href="/player/player-detail"]')
        : [...menu.querySelectorAll("button")].find(
            (b) => (b.textContent || "").trim() === "Abmelden",
          ) || null;
    if (!el) return { menue: true, da: false };
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) {
      return { menue: true, da: true, flaeche: false, breite: +r.width.toFixed(1), hoehe: +r.height.toFixed(1) };
    }
    const oben = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      menue: true,
      da: true,
      flaeche: true,
      breite: +r.width.toFixed(1),
      hoehe: +r.height.toFixed(1),
      // ⚠️ Bewusst OHNE einen Zweig `oben.contains(el)`. Der haette einen
      // VORFAHREN der Zeile als Treffer akzeptiert — und ein Vorfahr kommt
      // genau dann zurueck, wenn die Zeile an ihrem eigenen Mittelpunkt nicht
      // getroffen wird, etwa bei `pointer-events: none`. Also ausgerechnet in
      // dem Fall, den diese Pruefung fangen soll.
      frei: !!oben && (el === oben || el.contains(oben)),
      davor: oben
        ? `<${oben.tagName.toLowerCase()}> "${(oben.textContent || "").trim().slice(0, 30)}"`
        : "(nichts)",
    };
  }, art);
}

async function menueOeffnen(page, wo) {
  const knopf = page.locator('nav button[aria-controls="mobil-menue"]');
  // Ehrlichkeitsschranke: Ohne sichtbaren Knopf gibt es nichts zu öffnen, und
  // ein Test, der das stillschweigend überspringt, meldet Grün über einen Weg,
  // den es gar nicht gibt.
  await expect(
    knopf,
    `${wo}: Der Klappmenü-Knopf ist nicht sichtbar — auf dieser Breite gibt es ` +
      `angemeldet also weder Zeile noch Menü.`,
  ).toBeVisible();
  await knopf.click();
  await expect(
    page.locator("#mobil-menue"),
    `${wo}: Nach dem Klick auf den Knopf ist kein Klappmenü aufgegangen.`,
  ).toBeVisible();
}

// ⚠️ Das Menü bleibt über einen Breitenwechsel hinweg OFFEN — es hängt an
// `mobileOpen`, nicht an der Fensterbreite. Mein erster Anlauf hat das
// übersehen und war rot mit „kein Klappmenü aufgegangen": Der zweite Durchlauf
// hat den Knopf gedrückt und damit das noch offene Menü ZUGEMACHT. Ein Test,
// der seinen eigenen Ausgangszustand stehen lässt, ist beim zweiten Durchlauf
// rot — dieselbe Fehlerform, die in CLAUDE.md unter Methodik-Lehre (6) steht.
// Das Schliessen ist zugleich eine Aussage: Der Knopf muss in beide Richtungen
// arbeiten.
async function menueSchliessen(page, wo) {
  await page.locator('nav button[aria-controls="mobil-menue"]').click();
  await expect(
    page.locator("#mobil-menue"),
    `${wo}: Ein zweiter Druck auf den Knopf hat das Menü nicht geschlossen.`,
  ).toHaveCount(0);
}

test.describe("Mein Profil und Abmelden sind im Klappmenü bedienbar", () => {
  test("beide Zeilen stehen, sind frei und lassen sich wirklich benutzen", async ({
    page,
    request,
  }) => {
    await anmelden(page, request);
    await page.goto("/transfermarkt");

    for (const { breite, hoehe } of KLAPP_FAELLE) {
      const wo = `${breite}×${hoehe}px`;
      await page.setViewportSize({ width: breite, height: hoehe });
      await zurRuhe(page, wo);
      await gateAngemeldet(page, wo);

      // Der Grund, warum dieser Test existiert — als Messung, nicht als
      // Behauptung im Kommentar: Im Band 640–1151 hat die Leiste angemeldet
      // KEIN sichtbares Abmelde-Symbol.
      if (breite >= 640 && breite < UMSCHALTPUNKT_AN) {
        const symbol = await page.evaluate(() => {
          const b = document.querySelector('nav button[aria-label="Abmelden"]');
          return b ? b.getBoundingClientRect().width : -1;
        });
        expect(
          symbol <= 0,
          `${wo}: Das Abmelde-Symbol der Leiste ist ${symbol}px breit, also ` +
            `sichtbar. Dann ist die Annahme dieses Tests überholt — er prüft ` +
            `das Klappmenü als EINZIGEN Ausgang. Bitte den Kopf-Kommentar ` +
            `dieses Abschnitts mitziehen, statt die Zeile zu streichen.`,
        ).toBe(true);
      }

      await menueOeffnen(page, wo);

      for (const [art, name] of [
        ["profil", "Mein Profil"],
        ["abmelden", "Abmelden"],
      ]) {
        // ⚠️ ERST IM MENÜ SCROLLEN, DANN TREFFEN — beim ersten Anlauf stand
        // hier nur der Treffertest, und er war bei 390×667 rot mit „auf dem
        // Mittelpunkt liegt (nichts)". Das war KEIN Befund am Produkt, sondern
        // einer an meiner Sonde: `elementFromPoint` liefert für jeden Punkt
        // ausserhalb des Fensters `null`, und „Abmelden" steht dort unterhalb
        // der Fensterkante. Das Menü hat seit dem 13.08.2026 mit gutem Grund
        // seinen EIGENEN Bildlauf (es hängt in einer Sticky-Leiste, der
        // Seiten-Scroll erreicht seine unteren Zeilen nie). Eine Zeile, die man
        // im Menü heranrollen kann, ist erreichbar.
        // Dass sie sich heranrollen LÄSST, ist selbst schon eine Aussage:
        // `scrollIntoViewIfNeeded` scheitert, wenn die Zeile in einem Kasten
        // ohne Bildlauf feststeckt — genau die Lage, in der „Feedback geben"
        // zweimal 4,5px hoch und untippbar war.
        const loc =
          art === "profil"
            ? page.locator('#mobil-menue a[href="/player/player-detail"]')
            : page.locator("#mobil-menue button").filter({ hasText: "Abmelden" });

        // ⚠️ REIHENFOLGE: erst „ist sie da und hat sie Fläche", DANN scrollen.
        // Umgekehrt gebaut war die Gegenprobe zwar rot, aber mit der falschen
        // Begründung: Eine Zeile auf `display:none` lässt sich nicht
        // heranrollen, also brach `scrollIntoViewIfNeeded` mit einem nackten
        // Zeitüberlauf ab — und wer den liest, sucht ein Wartezeit-Problem
        // statt einer verschwundenen Abmelde-Zeile. Ein Test darf nicht nur
        // beim richtigen Anlass rot werden, er muss auch den richtigen Grund
        // nennen.
        const lage = await menuePunkt(page, art);
        expect(lage.menue, `${wo}: Kein Klappmenü im Dokument.`).toBe(true);
        expect(
          lage.da,
          `${wo}: „${name}" steht angemeldet gar nicht im Klappmenü. Zwischen ` +
            `640 und ${UMSCHALTPUNKT_AN - 1}px ist das der einzige Weg dorthin.`,
        ).toBe(true);
        expect(
          lage.flaeche,
          `${wo}: „${name}" ist im Dokument, hat aber keine Fläche ` +
            `(${lage.breite}×${lage.hoehe}px). Untippbar ist so gut wie nicht da.`,
        ).toBe(true);

        await loc.scrollIntoViewIfNeeded({ timeout: 5_000 });
        const p = await menuePunkt(page, art);
        expect(
          p.frei,
          `${wo}: Auf dem Mittelpunkt von „${name}" liegt ${p.davor} — die ` +
            `Zeile ist verdeckt und der Tipp landet woanders.`,
        ).toBe(true);
      }

      await menueSchliessen(page, wo);
    }

    // ── Stufe 3: wirklich bedienen ──────────────────────────────────────────
    // Fensterbreite ist noch die des letzten Durchlaufs (1100×800) — also
    // mitten in dem Band, in dem das Menü angemeldet der einzige Ausgang ist.
    await menueOeffnen(page, "Mein-Profil-Probe");
    await page.locator('#mobil-menue a[href="/player/player-detail"]').click();
    await page.waitForURL("**/player/player-detail");
    expect(
      new URL(page.url()).pathname,
      `„Mein Profil" im Klappmenü führt nach ${page.url()} statt ins Profil.`,
    ).toBe("/player/player-detail");

    // ⚠️ Zurück auf eine ÖFFENTLICHE Seite, bevor „Abmelden" geprüft wird.
    // Mein erster Anlauf hat hier weitergemacht und war rot mit „Klappmenü-Knopf
    // nicht sichtbar" — zu Recht, aber an der falschen Leiste: Auf
    // `/player/player-detail` steht `components/layout/PlayerNav.js`, nicht die
    // Navbar dieser Datei. Es sind ZWEI Leisten mit zwei Menüs; diese Datei
    // bewacht die öffentliche.
    await page.goto("/transfermarkt");
    await zurRuhe(page, "nach Klick auf Mein Profil");
    await gateAngemeldet(page, "nach Klick auf Mein Profil");
    await menueOeffnen(page, "Abmelden-Probe");
    await page
      .locator("#mobil-menue button")
      .filter({ hasText: "Abmelden" })
      .click();
    // `logout()` setzt `window.location.href = "/"` — es ist ein echter
    // Seitenwechsel, kein Router-Sprung.
    await page.waitForURL((u) => new URL(u).pathname === "/");

    const nachher = await page.evaluate(() => ({
      token: localStorage.getItem("playerAuthToken"),
      feed: !!document.querySelector('nav a[href="/player/newsfeed"]'),
    }));
    expect(
      nachher.token,
      `Nach „Abmelden" liegt der Anmelde-Ausweis noch im Browser — der Klick ` +
        `sah nach etwas aus und hat nichts bewirkt.`,
    ).toBeNull();
    expect(
      nachher.feed,
      `Nach „Abmelden" steht immer noch der angemeldete Punkt „Feed" in der ` +
        `Leiste.`,
    ).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6) DER BLITZER-WÄCHTER
// ═══════════════════════════════════════════════════════════════════════════
// Befund B1 (Tobias, 20.08.2026), unabhängig auch im Code-Review gefunden:
// Bei 1088 px angemeldet standen nach dem Laden zuerst die sieben öffentlichen
// Punkte VOLLSTÄNDIG da — und klappten dann ins Menü zusammen.
//   ungedrosselt                       44–68 ms
//   4× langsamere CPU, ~1,6 Mbit/s   1250–1296 ms
//   Anmeldeauskunft +1,5 s künstlich      1564 ms
// Über eine Sekunde lang sieht ein angemeldeter Nutzer sieben anklickbare
// Verweise, die dann verschwinden. Wer in dieser Zeit auf „Ligen" zielt, trifft
// ins Leere.
//
// ─── DIE REGEL, DIE HIER BEWACHT WIRD ──────────────────────────────────────
//   KEIN NAVIGATIONSPUNKT, DER EINMAL SICHTBAR WAR, VERSCHWINDET WIEDER.
//
// Sie ist mit Absicht RICHTUNGSFREI formuliert, und das ist ihr ganzer Wert.
// Der naheliegende Fix für B1 wäre gewesen, überall vorsorglich die angemeldete
// Fassung zu zeigen. Damit wandert der Blitzer nur zu den AUSGELOGGTEN
// Besuchern: Bei 1088 px stünde dann erst der Klappmenü-Knopf da und wäre
// danach weg. Eine Regel, die nur „die Zeile darf nicht verschwinden" sagt,
// wäre über diesen gespiegelten Fehler grün geblieben.
//
// ─── WARUM ES DREI FÄLLE SIND ──────────────────────────────────────────────
// (A) echt angemeldet bei 1088 — der gemeldete Befund.
// (B) Token da, Auskunft sagt „kein Spieler" — der abgelaufene Ausweis. Das ist
//     der EINZIGE Weg, den ausgeloggten Zustand überhaupt verzögert zu
//     bekommen: Ohne Token fragt die Leiste gar nicht erst nach und weiß es
//     sofort. Hier fällt der gespiegelte Fehler auf.
// (C) 390 px angemeldet — dort wird nicht nur „nichts Falsches" verlangt,
//     sondern LÜCKENLOSER ZUGANG. Auf dem Telefon ist der Klappmenü-Knopf die
//     gesamte Navigation; ihn während der Wartezeit auszublenden wäre ein neuer
//     Defekt an der Stelle des alten. Dieser Fall hält genau das fest.
//
// ─── EHRLICHKEITSSCHRANKE ──────────────────────────────────────────────────
// Ein Lauf, in dem die Verzögerung NICHT gegriffen hat, ist kein bestandener
// Test — er ist ein Ausfall. Ohne Wartezeit gibt es kein Zeitfenster, in dem
// etwas blitzen KÖNNTE, und die Regel wäre erfüllt, ohne je geprüft worden zu
// sein. Drei Zeilen halten das:
//   1. Die Abfangstelle muss wirklich angesprungen sein (Zähler).
//   2. Vor dem Umschalten müssen genug Bilder aufgezeichnet sein.
//   3. Das Umschalten muss zeitlich hinter der eingebauten Wartezeit liegen.
const AUTH_VERZUG_MS = 1500;
const SPUR_MIN = 20; // so viele Bilder muss die Sonde insgesamt gesehen haben
const VOR_UMSCHALT_MIN = 5; // … davon vor dem Umschalten

// Zeichnet ab dem ersten Bild auf, was die Leiste zeigt. `addInitScript` läuft
// VOR jedem Skript der Seite — anders bekommt man die ersten Bilder nicht, und
// genau in ihnen steckt der Befund.
async function spurAufzeichnen(page) {
  await page.addInitScript(() => {
    window.__spur = [];
    window.__spurAus = false;
    const t0 = performance.now();
    const tick = () => {
      const nav = document.querySelector("nav");
      // ⚠️ Erst messen, wenn die INNERE Reihe steht — sie ist es, die `h-16`
      // traegt. Ein Bild, in dem `<nav>` schon im Dokument ist und sein
      // Innencontainer noch nicht, meldet die Hoehe des blossen Rahmens
      // (~1px). Die Hoehenpruefung unten haette daraus „die Leiste hat ihre
      // Hoehe gewechselt" gemacht, obwohl nichts gewechselt hat — ein Rot mit
      // falscher Begruendung, also genau das, wogegen diese Datei sonst
      // argumentiert.
      const reihe = nav?.querySelector(":scope > div");
      if (nav && reihe && window.__spur.length < 3000) {
        const w = (el) => (el ? el.getBoundingClientRect().width : 0);
        window.__spur.push({
          t: +(performance.now() - t0).toFixed(1),
          // Auflage Patrick: Die Leiste darf beim Umschalten nicht die Höhe
          // wechseln — sonst springt der Inhalt darunter, und aus dem Blitzer
          // wäre ein Ruckler geworden. Sie ist auf `h-16` festgenagelt; diese
          // Zeile hält fest, dass das so bleibt.
          hoehe: +reihe.getBoundingClientRect().height.toFixed(1),
          zeile:
            w(
              [...nav.querySelectorAll('a[href="/ligen"]')].find(
                (el) => !el.closest("#mobil-menue"),
              ),
            ) > 0,
          burger: w(nav.querySelector('button[aria-controls="mobil-menue"]')) > 0,
          // Zustandsmarken: „Feed" gibt es nur angemeldet, „Registrieren" nur
          // ausgeloggt — und BEIDE erst, wenn der Zustand geklärt ist. Geprüft
          // wird die Anwesenheit im Dokument, nicht die Sichtbarkeit.
          feed: !!nav.querySelector('a[href="/player/newsfeed"]'),
          reg: !!nav.querySelector('a[href="/signup"]'),
        });
      }
      if (!window.__spurAus) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Verzögert die Anmeldeauskunft. `antwort === null` heißt: echte Antwort, nur
// später. Sonst wird die Antwort ersetzt (für den abgelaufenen Ausweis).
async function authVerzoegern(page, antwort = null, ms = AUTH_VERZUG_MS) {
  const zaehler = { treffer: 0, ms };
  await page.route("**/api/player/getmyinfo", async (route) => {
    zaehler.treffer++;
    await new Promise((r) => setTimeout(r, ms));
    if (antwort === null) await route.continue();
    else
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(antwort),
      });
  });
  return zaehler;
}

async function spurLesen(page, marke) {
  await page.waitForFunction(
    (m) =>
      !!document.querySelector(
        m === "feed" ? 'nav a[href="/player/newsfeed"]' : 'nav a[href="/signup"]',
      ),
    marke,
    { timeout: 30_000 },
  );
  // Noch ein Stück weiter aufzeichnen: Ein Punkt, der ERST NACH dem Umschalten
  // verschwindet, wäre sonst außerhalb der Spur.
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.__spurAus = true;
  });
  return await page.evaluate(() => window.__spur);
}

// Findet das erste Bild, in dem ein Punkt weg ist, obwohl er vorher da war.
function verschwundenAb(spur, feld) {
  let warDa = false;
  for (const s of spur) {
    if (s[feld]) warDa = true;
    else if (warDa) return s;
  }
  return null;
}

function schranke(spur, zaehler, marke, wo) {
  expect(
    zaehler.treffer,
    `${wo}: Die Anmeldeauskunft wurde ${zaehler.treffer}× abgefangen. Ohne ` +
      `Abfangen gibt es keine Wartezeit — und ohne Wartezeit kein Zeitfenster, ` +
      `in dem überhaupt etwas blitzen könnte. Dieser Lauf hat NICHTS geprüft.`,
  ).toBeGreaterThanOrEqual(1);
  expect(
    spur.length,
    `${wo}: Die Sonde hat nur ${spur.length} Bilder aufgezeichnet. Sie hat die ` +
      `Leiste praktisch nicht gesehen.`,
  ).toBeGreaterThanOrEqual(SPUR_MIN);

  const umschaltIndex = spur.findIndex((s) => s[marke]);
  expect(
    umschaltIndex,
    `${wo}: Der Anmeldezustand war in keinem einzigen Bild geklärt ` +
      `(Marke „${marke}" nie gesetzt). Gemessen wurde dann eine Seite, die nie ` +
      `fertig geladen hat.`,
  ).toBeGreaterThanOrEqual(0);
  expect(
    umschaltIndex,
    `${wo}: Der Zustand war schon im Bild ${umschaltIndex} geklärt. Die ` +
      `künstliche Wartezeit von ${AUTH_VERZUG_MS}ms hat also nicht gegriffen — ` +
      `der Lauf ist ein Ausfall, kein Grün.`,
  ).toBeGreaterThanOrEqual(VOR_UMSCHALT_MIN);
  expect(
    spur[umschaltIndex].t,
    `${wo}: Der Zustand war nach ${spur[umschaltIndex].t}ms geklärt, die ` +
      `eingebaute Wartezeit beträgt aber ${zaehler.ms}ms. Die Abfangstelle ` +
      `hat die echte Antwort offenbar durchgelassen.`,
  ).toBeGreaterThanOrEqual(zaehler.ms * 0.5);

  // ── Auflage Patrick: konstante Leistenhöhe ────────────────────────────────
  // Tobias hat ausdrücklich bestätigt, dass der Inhalt unter der Leiste heute
  // nicht springt. Der Blitzer-Fix ändert, WAS in der Leiste steht — er darf
  // nicht ändern, WIE HOCH sie ist. Das ist keine Schönheitsfrage: Ein Sprung
  // hier verschiebt die ganze Seite, und zwar genau in dem Moment, in dem der
  // Nutzer schon etwas anvisiert hat.
  const hoehen = [...new Set(spur.map((s) => s.hoehe))];
  expect(
    hoehen,
    `${wo}: Die Leiste hat während des Ladens ihre Höhe gewechselt ` +
      `(${hoehen.join("px, ")}px). Damit springt der gesamte Inhalt darunter. ` +
      `Die Höhe ist auf \`h-16\` festgelegt und muss es bleiben — was sich ` +
      `beim Klären des Anmeldezustands ändern darf, ist der INHALT der Leiste, ` +
      `nicht ihr Platzbedarf.`,
  ).toHaveLength(1);

  return umschaltIndex;
}

function protokoll(spur, umschaltIndex) {
  const zeigen = (s) =>
    `${s.t}ms Zeile=${s.zeile ? "da" : "weg"} Klappmenü=${s.burger ? "da" : "weg"}`;
  const um = Math.max(0, umschaltIndex - 2);
  return (
    `erstes Bild: ${zeigen(spur[0])} | um das Umschalten herum: ` +
    spur.slice(um, um + 5).map(zeigen).join(" · ") +
    ` | letztes Bild: ${zeigen(spur[spur.length - 1])}`
  );
}

test.describe("Beim Laden blitzt kein Navigationspunkt auf", () => {
  test("1088px angemeldet: nichts, was da war, verschwindet wieder", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1088, height: 900 });
    await anmelden(page, request); // dieser Aufruf trägt noch keinen Token, also keine Abfrage
    await spurAufzeichnen(page);
    const zaehler = await authVerzoegern(page);
    await page.goto("/transfermarkt");

    const spur = await spurLesen(page, "feed");
    const um = schranke(spur, zaehler, "feed", "1088px angemeldet");

    for (const [feld, name] of [
      ["zeile", "die waagerechte Zeile"],
      ["burger", "der Klappmenü-Knopf"],
    ]) {
      const weg = verschwundenAb(spur, feld);
      expect(
        weg,
        `1088px angemeldet: ${name} war sichtbar und ist bei ${weg?.t}ms wieder ` +
          `verschwunden — genau der Befund B1. Solange der Anmeldezustand ` +
          `unbekannt ist, darf die Leiste nichts zeigen, was sie gleich wieder ` +
          `zurücknimmt: lieber kurz eine Lücke als kurz etwas Falsches.\n` +
          `  ${protokoll(spur, um)}`,
      ).toBeNull();
    }
  });

  test("1088px mit abgelaufenem Ausweis: der gespiegelte Blitzer bleibt aus", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1088, height: 900 });
    await anmelden(page, request);
    await spurAufzeichnen(page);
    // Token liegt im Browser, die Auskunft sagt aber „kein Spieler" — so
    // verhält sich ein abgelaufener Ausweis. Nur so lässt sich der AUSGELOGGTE
    // Zustand verzögert herstellen; ohne Token fragt die Leiste gar nicht.
    const zaehler = await authVerzoegern(page, { success: true, player: null });
    await page.goto("/transfermarkt");

    const spur = await spurLesen(page, "reg");
    const um = schranke(spur, zaehler, "reg", "1088px ausgeloggt");

    for (const [feld, name] of [
      ["zeile", "die waagerechte Zeile"],
      ["burger", "der Klappmenü-Knopf"],
    ]) {
      const weg = verschwundenAb(spur, feld);
      expect(
        weg,
        `1088px ausgeloggt: ${name} war sichtbar und ist bei ${weg?.t}ms wieder ` +
          `verschwunden. Das ist der Blitzer aus B1 in der Gegenrichtung — er ` +
          `entsteht, wenn man bei unbekanntem Zustand vorsorglich die ` +
          `ANGEMELDETE Fassung zeigt. Auf der Startseite sind ausgeloggte ` +
          `Besucher die Mehrheit.\n  ${protokoll(spur, um)}`,
      ).toBeNull();
    }
  });

  test("390px angemeldet: der Zugang zur Navigation reißt nie ab", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await anmelden(page, request);
    await spurAufzeichnen(page);
    const zaehler = await authVerzoegern(page);
    await page.goto("/transfermarkt");

    const spur = await spurLesen(page, "feed");
    const um = schranke(spur, zaehler, "feed", "390px angemeldet");

    // Hier reicht „nichts Falsches" NICHT. Unter 1024px sagen beide Zustände
    // dasselbe — der Klappmenü-Knopf gehört dorthin, egal wie die Anmeldung
    // ausgeht. Ihn während der Wartezeit auszublenden („dann blitzt eben
    // nichts") nähme einem angemeldeten Telefonnutzer auf langsamer Leitung
    // über eine Sekunde lang JEDEN Zugang zur Navigation. Diese Zeile hält
    // fest, dass die Lücke nur dort sein darf, wo es wirklich etwas zu
    // entscheiden gibt.
    const ohne = spur.filter((s) => !s.burger);
    expect(
      ohne.length,
      `390px angemeldet: In ${ohne.length} von ${spur.length} Bildern stand ` +
        `kein Klappmenü-Knopf in der Leiste (zuerst bei ${ohne[0]?.t}ms). Auf ` +
        `dieser Breite ist er die gesamte Navigation. Beide Anmeldezustände ` +
        `verlangen ihn hier — es gibt also nichts abzuwarten.\n` +
        `  ${protokoll(spur, um)}`,
    ).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7) DERSELBE FEHLER EINE EBENE TIEFER: DER KONTO-ABSCHNITT IM KLAPPMENÜ
// ═══════════════════════════════════════════════════════════════════════════
// Nicht aus dem Gate gemeldet, beim Bauen von B1 aufgefallen — und ohne diesen
// Wächter hätte der Fix dafür keine einzige Prüfung gehabt.
//
// Der Klappmenü-Knopf ist unter 1024px WÄHREND der Wartezeit bedienbar; das ist
// so gewollt (Abschnitt 6, Fall C). Damit lässt sich das Menü öffnen, bevor der
// Anmeldezustand geklärt ist — und sein unterster Abschnitt hing bis zum
// 20.08.2026 direkt an `isLoggedIn`. Ein Angemeldeter auf langsamer Leitung sah
// dort also „Konto · Anmelden · Registrieren", was sich Sekundenbruchteile
// später in „Mein Bereich · Mein Team · Feed · Mein Profil · Abmelden"
// verwandelte. Nicht nur falsch, sondern gefährlich falsch: Unter demselben
// Finger tauschen die Zeilen die Plätze. Wer „Anmelden" antippt, trifft „Mein
// Profil" — dieselbe Fehlerform wie B1, nur eine Ebene tiefer.
//
// Verlangt wird hier NICHT, dass das Menü leer ist: Die öffentlichen Gruppen
// hängen an keinem Anmeldezustand und stehen sofort. Die Lücke ist punktgenau.
test.describe("Das Klappmenü zeigt keinen Konto-Abschnitt, der gleich wechselt", () => {
  test("390px angemeldet, Menü während der Wartezeit geöffnet", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await anmelden(page, request);
    // Großzügiger als die 1500ms der übrigen Fälle: Hier muss innerhalb des
    // Fensters noch ein Klick untergebracht werden. Geht das Rennen trotzdem
    // verloren, wird der Lauf ROT (Schranke unten) und nicht still grün.
    const zaehler = await authVerzoegern(page, null, 3000);
    await page.goto("/transfermarkt");

    await page.locator('nav button[aria-controls="mobil-menue"]').click();
    await expect(page.locator("#mobil-menue")).toBeVisible();

    const lesen = () =>
      page.evaluate(() => {
        const m = document.querySelector("#mobil-menue");
        return {
          geklaert: !!document.querySelector('nav a[href="/player/newsfeed"]'),
          ligen: !!m?.querySelector('a[href="/ligen"]'),
          registrieren: !!m?.querySelector('a[href="/signup"]'),
          abmelden: [...(m?.querySelectorAll("button") || [])].some(
            (b) => (b.textContent || "").trim() === "Abmelden",
          ),
        };
      });

    const waehrend = await lesen();

    // ── Ehrlichkeitsschranke ────────────────────────────────────────────────
    expect(
      zaehler.treffer,
      `Die Anmeldeauskunft wurde nicht abgefangen — es gab keine Wartezeit und ` +
        `damit nichts zu prüfen.`,
    ).toBeGreaterThanOrEqual(1);
    expect(
      waehrend.geklaert,
      `Beim Öffnen des Menüs war der Anmeldezustand bereits geklärt. Der Klick ` +
        `kam zu spät — dieser Lauf hat den fraglichen Moment gar nicht ` +
        `erwischt und beweist nichts.`,
    ).toBe(false);
    expect(
      waehrend.ligen,
      `Während der Wartezeit steht im Klappmenü nicht einmal „Ligen". Verlangt ` +
        `ist eine punktgenaue Lücke beim Konto-Abschnitt, kein leeres Menü — ` +
        `die öffentlichen Gruppen hängen an keinem Anmeldezustand.`,
    ).toBe(true);

    // ── Die eigentliche Aussage ─────────────────────────────────────────────
    expect(
      waehrend.registrieren || waehrend.abmelden,
      `Während der Anmeldezustand noch unbekannt war, stand im Klappmenü ` +
        `bereits ein Konto-Abschnitt (Registrieren=${waehrend.registrieren}, ` +
        `Abmelden=${waehrend.abmelden}). Er wechselt gleich seinen Inhalt, und ` +
        `dabei tauschen die Zeilen unter dem Finger die Plätze.`,
    ).toBe(false);

    await page.waitForFunction(
      () => !!document.querySelector('nav a[href="/player/newsfeed"]'),
      null,
      { timeout: 30_000 },
    );
    const danach = await lesen();
    expect(
      danach.abmelden,
      `Nachdem der Anmeldezustand geklärt war, steht „Abmelden" immer noch ` +
        `nicht im Klappmenü. Aus der Lücke ist ein Loch geworden.`,
    ).toBe(true);
    expect(
      danach.registrieren,
      `Nach dem Klären steht „Registrieren" im Klappmenü, obwohl das Konto ` +
        `angemeldet ist.`,
    ).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8) EINE HÄNGENDE ANMELDEAUSKUNFT DARF DIE LEISTE NICHT EINFRIEREN
// ═══════════════════════════════════════════════════════════════════════════
// Befund aus dem Code-Review der Nacharbeit — und die unangenehme Sorte: Der
// Riegel aus Abschnitt 6 hat eine Fehlerform, die vorher FOLGENLOS war, zu
// einer folgenreichen gemacht.
//
// `getmyinfo` lief ohne Zeitlimit. Ein FEHLER war harmlos: `catch` und
// `finally` setzen `checked`, danach steht die ausgeloggte Leiste. Eine
// HÄNGENDE Verbindung erreicht das `finally` aber nie — und seit `checked`
// über die Darstellung entscheidet, heißt „nie" jetzt:
//   • zwischen 1024 und 1151px dauerhaft KEINE Navigation,
//   • der Konto-Abschnitt des Klappmenüs erscheint auf KEINER Breite jemals.
// Vorher wäre derselbe Ausfall auf eine voll bedienbare ausgeloggte Leiste
// hinausgelaufen.
//
// Behoben mit einem Zeitlimit an der Anfrage (`AUTH_TIMEOUT_MS`, 8s). Ohne
// diesen Wächter hätte die Abhilfe keine einzige Prüfung — dieselbe Lücke, die
// Tobias unter B2 an anderer Stelle gemeldet hat.
test.describe("Eine hängende Anmeldeauskunft friert die Leiste nicht ein", () => {
  test("1088px: die Leiste entscheidet sich auch ohne Antwort", async ({
    page,
    request,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1088, height: 900 });
    await anmelden(page, request);

    // Die Anfrage wird angenommen und NIE beantwortet — kein Fehler, kein
    // Abbruch, schlicht Stille. Das ist der Unterschied zu einem 500er.
    let angenommen = 0;
    await page.route("**/api/player/getmyinfo", async () => {
      angenommen++;
      // absichtlich nie fulfill/continue/abort
    });
    await page.goto("/transfermarkt");

    // ⚠️ Nicht mit einem nackten `waitForFunction` warten. Die Gegenprobe
    // (Zeitlimit entfernt) war damit zwar rot, meldete aber nur „Timeout
    // 30000ms exceeded" — und wer das liest, dreht die Wartezeit hoch, statt
    // das fehlende Zeitlimit zu suchen. Rot allein genügt nicht, der Grund
    // muss mit. Dieselbe Korrektur wie oben beim Klappmenü-Treffertest.
    const t0 = Date.now();
    try {
      await zustandGeklaert(page, "1088px, Auskunft antwortet nie");
    } catch {
      throw new Error(
        `Nach ${Date.now() - t0}ms hat sich die Leiste nicht entschieden. Die ` +
          `Anmeldeauskunft wurde angenommen und NIE beantwortet — genau der ` +
          `Fall, für den \`AUTH_TIMEOUT_MS\` da ist. Ohne Zeitlimit an der ` +
          `Anfrage erreicht der Code sein \`finally\` nie, \`checked\` bleibt ` +
          `false, und die Leiste hängt dauerhaft im Zustand „unbekannt": ` +
          `zwischen 1024 und 1151px ohne jede Navigation, das Klappmenü ohne ` +
          `Konto-Abschnitt.\n` +
          `  ⚠️ Das ist KEIN Wartezeit-Problem. Die Wartezeit hier ` +
          `hochzudrehen macht den Test grün, ohne dass sich am Produkt etwas ` +
          `ändert — der Zustand hat dann immer noch keinen Ausgang.`,
      );
    }
    const gedauert = Date.now() - t0;

    expect(
      angenommen,
      `Die Anfrage wurde ${angenommen}× angenommen — ohne Abfangen hängt hier ` +
        `gar nichts, und der Lauf prüft nichts.`,
    ).toBeGreaterThanOrEqual(1);

    // Die eigentliche Aussage: Es gibt überhaupt einen Ausgang.
    const lage = await schalterLage(page);
    expect(
      lage.zeile || lage.burger,
      `Nach ${gedauert}ms ohne Antwort steht bei 1088px weder die waagerechte ` +
        `Zeile noch der Klappmenü-Knopf. Die Leiste hängt im Zustand ` +
        `„unbekannt" fest — und dieser Zustand hat keinen Ausgang, solange die ` +
        `Anfrage kein Zeitlimit hat.`,
    ).toBe(true);
    await gateAusgeloggt(page, `1088px nach ${gedauert}ms ohne Antwort`);

    // Und das Klappmenü muss seinen Konto-Abschnitt bekommen — sonst käme
    // niemand mehr an „Anmelden" heran.
    await page.setViewportSize({ width: 390, height: 844 });
    await menueOeffnen(page, "hängende Auskunft, 390px");
    const konto = await page.evaluate(
      () => !!document.querySelector('#mobil-menue a[href="/signup"]'),
    );
    expect(
      konto,
      `Nach einer hängenden Anmeldeauskunft fehlt im Klappmenü der ` +
        `Konto-Abschnitt. Auf keiner Breite käme man dann noch zu „Anmelden".`,
    ).toBe(true);
  });
});
