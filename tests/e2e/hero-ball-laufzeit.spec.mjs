import { test, expect } from "@playwright/test";

// ══ WARUM ES DIESE DATEI GIBT ═══════════════════════════════════════════════
//
// Zwei Gate-Runden hintereinander kamen dieselben zwei Regressionen zurück,
// obwohl die Suite beide Male vollständig grün war. Der Grund ist strukturell
// und wurde von Kai und Tobias unabhängig genannt:
//
//   **Kein einziger Test lud „/".**
//
// Die Startseite war bewusst ausgespart, damit die Scroll-Bühne nicht
// mitspielt (siehe navbar-suche.spec.mjs). Die Folge: Über die gesamte
// Ball-Choreografie sagte eine grüne Suite nichts aus. `ball-sequenz.spec.mjs`
// schließt einen Teil davon, prüft aber nur Quelltext und Dateisystem – keine
// einzige Laufzeitaussage.
//
// Die zwei Zusicherungen hier stammen wörtlich von Tobias (Browser-Gate,
// 15.08.2026) und sind genau die, die seine beiden hohen Befunde beim
// Vergrößern des Balls sofort rot gezeigt hätten:
//
//   A) Der Ball muss am Ruhepunkt VOLLSTÄNDIG SICHTBAR sein. Befund A war ein
//      CLIPPING-Problem: Die Bühne ist `overflow-hidden`, und der Ball ragte
//      mit Radius 52 über die rechte Kante hinaus – am Ruhepunkt waren noch
//      3 % zu sehen. Eine Geometrieprüfung ohne den Beschnitt findet das NICHT.
//
//   B) Über jeder Schaltfläche in der Bühne muss die Balldeckkraft ≤
//      TEXT_DIM_FLOOR bleiben. Befund B war eine Kontrastregression: Der Ball
//      lief bei VOLLER Deckkraft über „Teams entdecken", Kontrast 1,67:1 statt
//      4,5:1. Diese Zusicherung schützt zusätzlich die eingeloggte Variante,
//      die den Bezugsrahmen erneut ändert.
//
// ⚠️ MEHRERE FENSTERBREITEN SIND PFLICHT, NICHT KÜR. Befund A trat NUR unter
// 640px auf, Befund B NUR ab 768px. Ein Test auf einer Breite hätte je einen
// von beiden übersehen – und das Vorzeichen des Übergabe-Fehlers hängt sogar
// an der Fensterhöhe. Das ist die Roadmap-15-(7)-Falle in Reinform: eine
// Gegenprobe, die nur eine Lage trifft, ist grün ohne Fix.

// ⚠️ ZWEI ACHSEN, NICHT EINE (Befund Vivien, fünfte Runde). Vier Gate-Runden
// lang haben wir nur BREITEN geprüft – der Ausfall hing an der FENSTERHÖHE.
// Die Bühne ist `calc(100vh - 4rem)` und wächst mit dem Fenster; mit ihr der
// Scrollweg bis zur Ankunft. Deshalb konnten zwei Messungen derselben Breite
// beide stimmen und sich widersprechen: 768x812 grün, 768x1024 rot.
// Jede Zeile hier ist ein reales Gerät, nicht eine runde Zahl.
const VIEWPORTS = [
  [320, 568], // kleinstes Telefon – außerhalb des Zielbereichs, s. unten
  [375, 812], // iPhone, lang
  [375, 667], // iPhone, kurz
  [430, 932], // großes Telefon
  [768, 1024], // iPad hochkant – DER Fall, der vier Runden lang unentdeckt blieb
  [1024, 768], // iPad quer
  [1280, 800], // Notebook
  [1440, 900], // Notebook, groß
  [1440, 1200], // hoher Desktop – dieselbe Klasse wie iPad hochkant
];

// Der Zielbereich beginnt bei 375 (Entscheidung Vivien). Bei 320 gilt nur
// „überhaupt sichtbar"; die 150px-Schwelle war dort eine geratene runde Zahl
// und wäre den Abstand zur Eyebrow nicht wert.
const ZIELBEREICH_AB = 375;
const FENSTER_MIN = 150;

// Muss mit TEXT_DIM_FLOOR in components/landing/HeroScrollStage.js
// übereinstimmen. Kleine Toleranz, weil die Deckkraft als String mit drei
// Nachkommastellen geschrieben wird.
const DIM_FLOOR = 0.2;
const TOLERANZ = 0.02;

// ⚠️ MUSS ASYNCHRON SEIN, mit einer echten Bildpause je Schritt.
// Der erste Entwurf scrollte und las im selben synchronen Block – dazwischen
// läuft kein `requestAnimationFrame`, der Controller kommt also nie zum Zug.
// Ergebnis: alle Deckkraft-Werte 0, alle zwölf Fälle rot, ohne dass am Produkt
// irgendetwas kaputt war. Dieselbe Klasse wie die rAF-Falle in CLAUDE.md
// (ausgeblendete Vorschaufläche = eingefrorene Messung): Wer Scroll-Effekte
// misst, muss dem Browser Zeit zum Zeichnen geben.
/** Tastet die Hero-Strecke ab und liefert je Schritt Ball- und Schaltflächenlage.
 *  ⚠️ Als ECHTE FUNKTION, nicht als String: `page.evaluate("...", arg)` wertet
 *  einen String nur als Ausdruck aus und IGNORIERT das Argument – zurück kam
 *  die Funktion selbst, also `undefined`. Erneut alle zwölf Fälle rot, ohne
 *  dass am Produkt etwas fehlte. */
const abtasten = async (schritt) => {
  // ⚠️ INNERHALB der Funktion, nicht im Modul: `page.evaluate` serialisiert nur
  // den Funktionsrumpf – Closure-Variablen aus dem Node-Modul existieren im
  // Browser nicht. Ein Verweis darauf wirft dort und faerbt ALLE Faelle rot,
  // ohne dass am Produkt etwas fehlt.
  const NAVBAR = 64; // h-16 der stickyen Navbar
  const bild = () =>
    new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));
  const ergebnis = [];
  const ball = document.querySelector(".hero-ball-sprite");
  const buehne = ball && ball.parentElement;
  if (!ball || !buehne) return null;
  for (let y = 0; y <= 900; y += schritt) {
    window.scrollTo(0, y);
    await bild();
    const b = ball.getBoundingClientRect();
    const s = buehne.getBoundingClientRect();
    const deck = Number(ball.style.opacity || 0);
    // Sichtbarer Anteil NACH dem Beschnitt durch die overflow-hidden-Bühne.
    const breiteDrin = Math.max(
      0,
      Math.min(b.right, s.right) - Math.max(b.left, s.left),
    );
    const hoeheDrin = Math.max(
      0,
      Math.min(b.bottom, s.bottom) - Math.max(b.top, s.top),
    );
    const anteil =
      b.width && b.height ? (breiteDrin * hoeheDrin) / (b.width * b.height) : 0;
    // Schaltflächen INNERHALB der Bühne – nur die kann der Ball verdecken.
    const tasten = [...buehne.querySelectorAll("a")]
      .map((a) => ({
        text: (a.textContent || "").trim().slice(0, 30),
        r: a.getBoundingClientRect(),
      }))
      .filter(
        (t) =>
          t.r.width > 0 && t.r.top >= s.top - 1 && t.r.bottom <= s.bottom + 1,
      )
      .map((t) => ({
        text: t.text,
        ueberlappt:
          Math.max(
            0,
            Math.min(b.right, t.r.right) - Math.max(b.left, t.r.left),
          ) > 0 &&
          Math.max(
            0,
            Math.min(b.bottom, t.r.bottom) - Math.max(b.top, t.r.top),
          ) > 0,
      }));
    // ⚠️ SICHTBARE FLÄCHE IM SICHTFELD, nicht in der Bühne (Befund Tobias,
    // dritte Runde). Die alte Rechnung schnitt den Ball nur gegen die
    // `overflow-hidden`-Bühne – ein Ball mit Deckkraft 1,00 mitten in einer
    // längst hochgescrollten Bühne war damit „sichtbar". Genau so blieb
    // unbemerkt, dass er auf 375/390/430 über den GESAMTEN Scrollweg 0 px²
    // im Bild hatte, in 176 gemessenen Positionen je Breite.
    // Die Navbar zählt dabei mit: Sie ist sticky und deckt die obersten 64px.
    const sichtL = Math.max(
      0,
      Math.min(b.right, window.innerWidth) - Math.max(b.left, 0),
    );
    const sichtH = Math.max(
      0,
      Math.min(b.bottom, window.innerHeight) - Math.max(b.top, NAVBAR),
    );
    const sichtbareFlaeche = sichtL * sichtH * deck;
    ergebnis.push({
      y,
      deck,
      anteil,
      sichtbareFlaeche,
      imRahmen: Math.round(b.top - s.top),
      tasten,
    });
  }
  return ergebnis;
};

test.describe("Hero-Ball – Laufzeit auf /", () => {
  for (const [breite, hoehe] of VIEWPORTS) {
    test(`${breite}x${hoehe}: der Ball ist überhaupt irgendwann zu sehen`, async ({
      page,
    }) => {
      // ⚠️ DIE ZUSICHERUNG, DIE ZWEI RUNDEN GEFEHLT HAT (Vorschlag Tobias).
      // Alle bisherigen Prüfungen waren am Ruhepunkt richtig UND aussagelos:
      // 20 % Anschnitt, keine Überlappung, Deckkraft 1,00 – für einen
      // Gegenstand, der auf drei von sieben Breiten nie im Bild war. Genau die
      // Klasse aus docs/MUSTER-ZAHLEN-DIE-LUEGEN: im Sinne des Codes wahr, im
      // Sinne des Lesers falsch.
      // Diese hier ist absichtlich die schwächste denkbare Aussage – und
      // trotzdem die einzige, die den Ausfall gefunden hätte.
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const proben = await page.evaluate(abtasten, 12);
      expect(proben).not.toBeNull();

      const beste = Math.max(...proben.map((p) => p.sichtbareFlaeche));
      expect(
        beste,
        `Der Ball hat auf ${breite}px an KEINER Scrollposition sichtbare Fläche ` +
          `im Sichtfeld (unterhalb der Navbar). Er mag technisch in der Bühne ` +
          `liegen, korrekt angeschnitten und voll deckend – gesehen wird er nie.`,
      ).toBeGreaterThan(0);

      // Und nicht nur ein Aufblitzen: mindestens ein Viertel des Balls muss
      // einmal gleichzeitig sichtbar und deckend sein.
      const ballFlaeche = 104 * 104; // mobil; ab md ist er größer, also strenger
      expect(
        beste,
        `Der Ball ist auf ${breite}px zwar nicht ganz unsichtbar, aber nie ` +
          `nennenswert im Bild (beste Sichtbarkeit ${Math.round(beste)} px²).`,
      ).toBeGreaterThan(ballFlaeche * 0.25);
    });

    test(`${breite}x${hoehe}: der Ball ist am Ruhepunkt zu genau 20 % angeschnitten`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const proben = await page.evaluate(abtasten, 12);
      expect(
        proben,
        ".hero-ball-sprite nicht gefunden – rendert der Hero-Ball?",
      ).not.toBeNull();

      const sichtbar = proben.filter((p) => p.deck > 0.02);
      expect(
        sichtbar.length,
        "der Ball war auf der ganzen Strecke unsichtbar",
      ).toBeGreaterThan(5);

      // ⚠️ DAS VERSPRECHEN HAT SICH AM 15.08.2026 GEÄNDERT (Entscheidung Vivien).
      // Bis dahin sicherte dieser Test zu, dass der Ball am Ruhepunkt
      // VOLLSTÄNDIG sichtbar ist. Jetzt ist er dort ABSICHTLICH zu 20 %
      // angeschnitten: Ein Kreis, der vollständig im Rahmen liegt, liest sich
      // als Grafik – einer, den der Rahmen schneidet, als Körper, der zufällig
      // gerade da ist. Der Rahmen wird zum Fenster.
      // Ein grüner Test auf ein Versprechen, das nicht mehr gilt, wäre
      // schlimmer als kein Test, deshalb prüft er jetzt den Anschnitt selbst.
      //
      // Der Ruhepunkt ist die Lage RELATIV ZUR BÜHNE, die sich nicht mehr
      // ändert. Die Bildschirmlage taugt dafür nicht – sie wandert beim
      // Scrollen ohnehin, und genau daran ist meine erste Messung gescheitert.
      const tiefste = Math.max(...sichtbar.map((p) => p.imRahmen));
      // ⚠️ Das ERSTE Erreichen, nicht alle Proben mit diesem Wert. Beim
      // Ausrollen (ab xl) ändert sich nur x, die senkrechte Lage bleibt auf
      // dem Maximum – ein `filter` liefert deshalb auch alle Ausroll-Punkte,
      // und dort ist der Ball naturgemäß stärker angeschnitten (gemessen 28 %
      // statt 20 %). Der Ruhepunkt ist der Moment der Ankunft.
      const amRuhepunkt = [sichtbar.find((p) => p.imRahmen === tiefste)];

      for (const p of amRuhepunkt) {
        const anschnitt = (1 - p.anteil) * 100;
        expect(
          anschnitt,
          `scrollY ${p.y}: ${anschnitt.toFixed(1)} % des Balls sind abgeschnitten, ` +
            `erwartet sind 20 % ± 2 %. Zu wenig = er liest sich als Grafik statt als Körper; ` +
            `zu viel = er verschwindet (vorher waren es 97 %).`,
        ).toBeGreaterThan(18);
        expect(anschnitt).toBeLessThan(22);
      }
    });

    test(`${breite}x${hoehe}: über keiner Schaltfläche läuft der Ball heller als der Bodenwert`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      const proben = await page.evaluate(abtasten, 12);
      expect(proben).not.toBeNull();

      const verstoesse = proben
        .filter(
          (p) =>
            p.deck > DIM_FLOOR + TOLERANZ && p.tasten.some((t) => t.ueberlappt),
        )
        .map((p) => ({
          y: p.y,
          deck: p.deck,
          tasten: p.tasten.filter((t) => t.ueberlappt).map((t) => t.text),
        }));

      expect(
        verstoesse,
        `Der Ball verdeckt Schaltflächen mit mehr als ${DIM_FLOOR} Deckkraft. ` +
          `Genau so entstand die Kontrastregression (1,67:1 statt 4,5:1): ` +
          `Der Abdunkelungs-Bezug (inhaltRef) muss ALLE Flächen umfassen, über die der Ball zieht.\n` +
          JSON.stringify(verstoesse.slice(0, 5), null, 2),
      ).toEqual([]);
    });
  }
});
