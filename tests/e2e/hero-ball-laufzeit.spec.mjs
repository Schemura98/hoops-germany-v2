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
// ⚠️ 360, NICHT 375 (Korrektur Vivien, 17.08.2026): „Ich habe den Zielbereich
// bei 375 beginnen lassen, weil das die kleinste iPhone-Breite ist. Das war eine
// Apple-Brille." 360 px ist die verbreitetste Android-Breite in Deutschland —
// und genau dort stand der auffälligste Fehler (der Ball parkte im Textblock).
// Wer 375 wieder einträgt, nimmt die häufigste Zielbreite aus der Prüfung heraus.
const ZIELBEREICH_AB = 360;
// ⚠️ EIGENE Konstante für den Node-Geltungsbereich. Die `NAVBAR` im Prüfskript
// liegt INNERHALB von `page.evaluate` – ein Verweis darauf von hier aus wirft im
// Node-Kontext, und der Kommentar dort warnt ausdrücklich davor. Ich war beim
// Bauen dieser Prüfung genau dabei, ihn zu machen.
const NAVBAR_PX = 64;
// Spiegelt `MD_BREAKPOINT` in components/landing/HeroScrollStage.js. Unterhalb
// steht der Ball verankert still, ab hier fällt er scroll-gesteuert.
const MD_BREAKPOINT = 768;
// `FENSTER_MIN` ist am 17.08.2026 entfallen – die Begründung steht unten an der
// Prüfung. Absichtlich KEINE Konstante mit neuem Wert: Eine Zahl, die dreimal
// nachgibt, hat noch nie gemessen, was sie messen sollte.

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
      ballBreite: b.width,
      // Nur die Geometrie, OHNE Deckkraft – Kai K1: „sichtbar" und „sichtbar
      // und nicht weggedimmt" sind zwei Kennzahlen, und sie wurden verwechselt.
      sichtbareFlaecheGeometrisch: sichtL * sichtH,
      imRahmen: Math.round(b.top - s.top),
      mitteImRahmen: b.top - s.top + b.height / 2,
      buehnenHoehe: s.height,
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
      // ⚠️ GEMESSEN, NICHT VERDRAHTET (Befund Kai K3, vierte Runde). Hier stand
      // `104 * 104` – die mobile Ballgröße VOR `efceed1`, das sie auf 88
      // gesenkt hat. Der Schwellwert forderte damit mobil 34,9 % statt des
      // versprochenen Viertels, und ab `md` (176px) nur 8,7 %. Der Kommentar
      // daneben behauptete zusätzlich „ab md strenger" – es war das Gegenteil.
      // Eine Schwelle, die sich als Anteil ausgibt und keiner ist, gehört in
      // docs/MUSTER-ZAHLEN-DIE-LUEGEN.
      const ballFlaeche = proben[0].ballBreite * proben[0].ballBreite;
      expect(
        beste,
        `Der Ball ist auf ${breite}px zwar nicht ganz unsichtbar, aber nie ` +
          `nennenswert im Bild (beste Sichtbarkeit ${Math.round(beste)} px²).`,
      ).toBeGreaterThan(ballFlaeche * 0.25);

      // ⚠️ DAS SCHEIN-FENSTER IST HIER ENTFALLEN (Entscheidung Vivien,
      // 17.08.2026). Hier stand „der Ball muss über mindestens 150 px Scrollweg
      // zu sehen sein — ein Aufblitzen ist kein Auftritt". Nach der Verankerung
      // der mobilen Ruhelage am Eyebrow fiel der Wert bei 375 px auf 144 px.
      // ⚠️ ER WURDE NICHT GESENKT, sondern gestrichen — die 150 hatte Vivien
      // selbst als „gegriffene runde Zahl" bezeichnet und hätte hier zum DRITTEN
      // Mal nachgegeben. Ihre Begründung:
      //   · Das Fenster war ein Ersatzmaß für „erscheint der Ball überhaupt" —
      //     richtig, solange die Ruhelage ein SUCHERGEBNIS war. Seit sie relativ
      //     zu einem Element liegt, das auf jeder Breite im ersten Bild steht,
      //     ist die Sichtbarkeit per Konstruktion zugesichert; sie über den
      //     Scrollweg nachzuprüfen heißt, hinter einer Garantie zu messen.
      //   · Mobil ist der Auftritt des Balls nicht der Scrollweg, sondern die
      //     Ruhe davor. Der Scrollweg ist sein ABGANG, und ein Abgang braucht
      //     keine Mindestdauer.
      //   · Scroll-Pixel sind kein Wahrnehmungsmaß: 144 px sind bei langsamem
      //     Lesescrollen Sekunden, bei einem Wisch 50 ms.
      // Ersatz ist Viviens Maß (1) — wirksame Sichtbarkeit der Ruhelage ≥ 55 %.
      // ⚠️ Es steht im NÄCHSTEN Test, nicht hier: Diese Abtastung nimmt ihre
      // erste Probe sofort beim Laden, also bevor der mobile Einflug fertig ist
      // (der Ball steht dort noch auf Deckkraft 0), und am Desktop liegt er bei
      // scrollY 0 absichtlich über dem Bild. Hier gemessen ergab das 0 % auf
      // JEDEM Viewport — ein Maß am falschen Ort, nicht ein Produktfehler.
      // ⚠️ WER DIE 150 WIEDER EINTRÄGT, MUSS ZUERST DIESEN ABSATZ WIDERLEGEN.
    });

    test(`${breite}x${hoehe}: die Ruhelage ändert sich beim ersten Scrollen nicht`, async ({
      page,
    }) => {
      // ⚠️ DER TEST, DER B1 GEFUNDEN HÄTTE (Vorschlag Tobias, fünfte Runde).
      // Die Kästen wurden gegen ein Layout gemessen, in dem `Reveal` die
      // Headline noch 20px nach unten versetzt hatte. Die mobile Ruhelage saß
      // dadurch 20px zu tief – der Ball ÜBERLAPPTE die erste Zeile um 10px –
      // und sprang beim ersten Scrollereignis nach oben, sobald der Neubau die
      // echten Kästen sah.
      // ⚠️ EIN TEST, DER VORHER SCROLLT, IST GRÜN UND ÜBERSIEHT GENAU DAS:
      // Das Scrollen erzwingt die Neuberechnung, die der Fehler vermissen ließ.
      // Deshalb wird hier zuerst der geladene Zustand gemessen – und erst
      // danach gescrollt.
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });

      // Auf das Ereignis warten, nicht auf eine Zeitspanne: `Reveal` staffelt
      // seine Verzögerungen, und die ändern sich mit dem Inhalt.
      await page
        .waitForFunction(
          () => {
            const h1 = document.querySelector("h1");
            if (!h1) return false;
            const t = getComputedStyle(h1).transform;
            return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
          },
          { timeout: 5000 },
        )
        .catch(() => {});
      await page.waitForTimeout(900); // Einflug abwarten

      const lage = () =>
        page.evaluate(() => {
          const ball = document.querySelector(".hero-ball-sprite");
          if (!ball) return null;
          const r = ball.getBoundingClientRect();
          return { oben: r.top, unten: r.bottom };
        });

      const geladen = await lage();
      expect(geladen, ".hero-ball-sprite nicht gefunden").not.toBeNull();

      // ══ VIVIENS MASS (1): DIE RUHELAGE IST WIRKSAM SICHTBAR ════════════════
      // Ersatz für das gestrichene Scroll-Fenster (s. voriger Test). Kennzahl
      // aus Roadmap 20b (a): Geometrie im Sichtfeld ABZÜGLICH NAVBAR, mal
      // Deckkraft. Vivien: „Ein voll deckender Ball hinter der Navbar und ein
      // weggedimmter Ball im Bild sind beide ‚nicht gesehen'."
      // ⚠️ NUR MOBIL. Am Desktop fällt der Ball scroll-gesteuert und steht bei
      // scrollY 0 bewusst über dem Bild — dort wäre 0 % richtig, nicht falsch.
      if (breite < MD_BREAKPOINT) {
        const wirksam = await page.evaluate((navbar) => {
          const el = document.querySelector(".hero-ball-sprite");
          if (!el) return null;
          const b = el.getBoundingClientRect();
          const deck = Number(getComputedStyle(el).opacity);
          const sichtL = Math.max(
            0,
            Math.min(b.right, window.innerWidth) - Math.max(b.left, 0),
          );
          const sichtH = Math.max(
            0,
            Math.min(b.bottom, window.innerHeight) - Math.max(b.top, navbar),
          );
          // Schon die WIRKSAME Größe – nicht noch einmal mit `deck` multiplizieren.
          return (sichtL * sichtH * deck) / (b.width * b.width);
        }, NAVBAR_PX);
        expect(
          wirksam,
          `Auf ${breite}x${hoehe} ist der Ball in der Ruhelage nur zu ` +
            `${Math.round((wirksam ?? 0) * 100)} % wirksam sichtbar; gefordert ` +
            `sind 55 %. Vivien hat 80 % gemessen, es ist also Reserve da – ein ` +
            `Wert darunter heißt, dass die Verankerung nicht mehr greift.`,
        ).toBeGreaterThanOrEqual(0.55);
      }
      await page.mouse.wheel(0, 1);
      await page.waitForTimeout(350);
      const nachScroll = await lage();

      // 1px Rad = höchstens 1px Versatz. Alles darüber ist eine Korrektur, die
      // vor dem Scrollen hätte stattfinden müssen.
      const sprung = Math.abs(nachScroll.oben - geladen.oben);
      expect(
        sprung,
        `Die Ruhelage springt beim ersten Scrollen um ${Math.round(sprung)}px. ` +
          `Sie wurde gegen ein Layout gerechnet, das noch nicht fertig war – ` +
          `wahrscheinlich vor dem Ende der Reveal-Übergänge.`,
      ).toBeLessThanOrEqual(3);
    });

    test(`${breite}x${hoehe}: in der Ruhelage ist der Ball voll deckend`, async ({
      page,
    }) => {
      // ⚠️ DER WIDERSPRUCH, DEN DIESE ZEILE FÜR IMMER WEGPRÜFT (Vivien):
      // Die Lückensuche garantiert per Konstruktion, dass die Ruhelage KEINEN
      // Inhaltskasten schneidet – das ist ihr ganzer Zweck. Trotzdem dunkelte
      // die Abdunkelung dieselbe Position auf 0,40 ab, weil sie schon im
      // ANFLUG rampte. Zwei Mechanismen, die beide recht zu haben glaubten.
      // Jede Abdunkelung in der Ruhelage ist damit definitionsgemäß falsch.
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      const proben = await page.evaluate(abtasten, 12);
      expect(proben).not.toBeNull();

      const sichtbar = proben.filter((p) => p.deck > 0.02);
      expect(sichtbar.length).toBeGreaterThan(3);
      // Ruhelage = tiefste bühnenrelative Lage, ERSTES Erreichen (danach ändert
      // das Ausrollen nur noch x).
      const tiefste = Math.max(...sichtbar.map((p) => p.mitteImRahmen));
      const inRuhe = sichtbar.find((p) => p.mitteImRahmen === tiefste);
      expect(
        inRuhe.deck,
        `In der Ruhelage steht der Ball auf Deckkraft ${inRuhe.deck} statt 1,00 ` +
          `(scrollY ${inRuhe.y}). Die Lückensuche hat die Position als frei ` +
          `bestimmt – wird sie trotzdem gedimmt, widersprechen sich zwei ` +
          `Mechanismen und die Abdunkelung stammt aus einer Näherung.`,
      ).toBeGreaterThan(0.98);
    });

    test(`${breite}x${hoehe}: die Ruhelage liegt unterhalb des Scrollwegs bis zur Ankunft`, async ({
      page,
    }) => {
      // ⚠️ DIE UNGLEICHUNG, DIE VIER RUNDEN GEFEHLT HAT (Vivien):
      //     targetY >= Bühnenhöhe * PROGRESS_SPAN * BALL_SPAN + BALL_R + 8
      // Der Ball erreicht seine Ruhelage erst, NACHDEM die Seite `S_ank`
      // gescrollt ist. Liegt sie darüber, ist er bei Ankunft längst aus dem
      // Bild – und jede bühnenrelative Kennzahl meldet trotzdem grün. Genau so
      // blieb iPad hochkant vier Runden unentdeckt.
      // Mobil gilt sie nicht: Dort fällt der Ball beim Laden, es gibt keinen
      // Scrollweg bis zur Ankunft.
      if (breite < 768) return;
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto("/", { waitUntil: "networkidle" });
      const proben = await page.evaluate(abtasten, 12);
      expect(proben).not.toBeNull();
      const sichtbar = proben.filter((p) => p.deck > 0.02);
      expect(sichtbar.length).toBeGreaterThan(3);

      const ruhe = Math.max(...sichtbar.map((p) => p.mitteImRahmen));
      const sAnk = sichtbar[0].buehnenHoehe * 0.45 * 0.75; // PROGRESS_SPAN * BALL_SPAN
      const r = sichtbar[0].ballBreite / 2;
      expect(
        ruhe,
        `Ruhelage ${Math.round(ruhe)} liegt über dem Scrollweg bis zur Ankunft ` +
          `(${Math.round(sAnk + r + 8)}); der Ball wäre aus dem Bild, bevor er ankommt.`,
      ).toBeGreaterThanOrEqual(sAnk + r + 8 - 2);
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
