import { test, expect } from "@playwright/test";
import { ladeStartseite, warteAufRuhe } from "./helpers/landing.mjs";

// ══ DAS FELDENDE AM SEITENENDE — EINE PROJEKTION, FREIE TINTE, GESETZTER ════
// ══ ABSTAND, GLEICHER RING AN BEIDEN ENDEN ══════════════════════════════════
//
// ⚠️ DIESE DATEI HAT AM 21.08.2026 IHREN GEGENSTAND GEWECHSELT, NICHT IHREN
// ZWECK — und der Wechsel ist einzeln begruendet, damit hier nicht zum vierten
// Mal ein Waechter unter dem Namen eines anderen verschwindet (tests/e2e/
// README.md, „Korrektur 21.08.2026: DIESELBE LOESCHUNG ZUM DRITTEN MAL").
//
// Bewacht wurde bis dahin `components/landing/KorbRuhe.js` ueber den Griff
// `svg[data-abschluss-korb]`. Dieses Bauteil ist ersatzlos entfallen; an seine
// Stelle ist `components/landing/AbschlussFeld.js` getreten — das um die
// Waagerechte gespiegelte Feldende (Zone, Aufstellungsmarken, Brett, Ladezone,
// Dreipunktlinie, Ring). Von den drei alten Zusicherungen:
//
//   · „eine Projektion"            → LEBT, unveraendert (Fall 1)
//   · „keine Ueberlagerung v. Text"→ LEBT, in GEAENDERTER FORM (Fall 2)
//   · „quadratisch, >= 72 px"      → ENTFAELLT MIT SEINEM GEGENSTAND
//
// Zum entfallenen Fall, weil eine stumme Loeschung in diesem Projekt die
// teuerste Aenderung ist: Die 72 px waren die Lesbarkeitsuntergrenze eines
// NETZES AUS ZWOELF STRAENGEN in einer quadratischen Marke. Das Netz gibt es
// nicht mehr — der Ring liegt jetzt in einem Feldstueck, seine Groesse ist
// nicht mehr frei waehlbar, sondern folgt dem Massstab des Feldes. Genau diese
// Frage stellt Fall 4, nur richtig: nicht „gross genug", sondern „an beiden
// Enden gleich". Wer „quadratisch, >= 72 px" hier wieder einbaut, misst eine
// Eigenschaft, die es nicht mehr gibt.
//
// ⚠️ NAMENSRAUM — NICHT ANGLEICHEN. `hero-standbild.spec.mjs` und
// `hero-einblendung.spec.mjs` zaehlen `data-court-path` bzw. `data-court-korb`
// DOKUMENTWEIT (teils im rohen Server-Blatt). Das Feldende traegt deshalb
// bewusst einen eigenen Namensraum (`data-endfeld*`). Diese Datei LIEST beide
// Namen (Fall 4 vergleicht Hero-Ring gegen End-Ring) — das ist erlaubt und
// noetig. Sie AENDERT keinen. Wer die Namen in den Komponenten angleicht,
// verfaelscht die Hero-Pruefungen still, statt sie rot zu machen.
//
// ══ DIE VIER FAELLE — jeder gegen eine Fehlerform, die es schon gab ═════════
//
// (1) PROJEKTION. „Draufsicht" ist nicht direkt messbar. Messbar ist ihr
//     Gegenteil: Eine Schraegansicht braucht eine ELLIPSE, weil ein Kreis von
//     schraeg oben keiner mehr ist. Die Urfassung zeichnete ihren Ring als
//     `<ellipse rx="135" ry="33">`. Ein `<ellipse>` im Abschluss-Block ist
//     deshalb der verlaesslichste Fingerabdruck des Rueckfalls — und zwei
//     Projektionen in einem Bild sind der Befund, mit dem Patrick am
//     19.08.2026 die ganze alte Hero-Choreografie zurueckgenommen hat.
//     ⚠️ Beide Umkehrungen werden mitgeprueft: ein `<circle>` MUSS in der
//     Zeichnung sein (sonst waere der Fall auch dann gruen, wenn jemand die
//     Zeichnung ganz entfernt — gruen ueber nichts), und kein Kreis darf
//     ungleich skaliert sein (das waere die Ellipse durch die Hintertuer).
//
// (2) KEINE SICHTBARE BERUEHRUNG DER TINTE. Das ist der alte Waechter „keine
//     Ueberlagerung von Text", und er MUSSTE seine Messweise wechseln:
//     Die alte Fassung lag als Marke IM FLUSS neben dem Text, ein Vergleich
//     der Elementkaesten war also die richtige Frage. Das Feldende ist eine
//     HINTERGRUNDEBENE — es liegt per Konstruktion hinter dem ganzen Block,
//     ein Kastenvergleich meldete hier auf jedem Fenster einen Treffer und
//     waere damit als Waechter wertlos.
//     Gemessen wird deshalb, was ein Leser sieht: beruehrt eine SICHTBARE
//     Linie die TINTE?
//       · nicht die Elementbox, sondern die ZEILENKAESTEN der Textknoten
//         (`Range.getClientRects`) — eine mittige Zeile in einem
//         randfuellenden `<p>` hat eine drei- bis viermal zu breite Box und
//         meldet sonst Fehlalarme;
//       · nicht „Kaesten schneiden sich", sondern `isPointInStroke` — die
//         browsereigene Antwort auf „liegt dieser Punkt im Strich";
//       · und die DECKKRAFT DES VERLAUFS an der Kreuzungstiefe wird
//         mitgerechnet. Eine Linie mit Deckkraft 0,000 ist nicht „fast weg",
//         sie ist weg.
//     Rechenweise uebernommen aus `scripts/messungen/tinte.mjs` (die Stufen
//     der beiden Verlaeufe stehen dort und in `AbschlussFeld.js`).
//     ⚠️ „Keine Beruehrung" gilt NICHT fuer die ganze Zeichnung, sondern fuer
//     den Nahbereich und den Ring. Das ferne Feld darf kreuzen und tut es.
//     Die Begruendung steht ausfuehrlich an `sichtbare()` weiter unten — sie
//     ist die Stelle, an der dieser Fall beim ersten Anlauf falsch war.
//
// (3) DER ABSTAND IST GESETZT, NICHT ANGEFALLEN. Der untere Innenabstand des
//     Abschluss-Blocks ist aus der Zeichnung GERECHNET (LandingCTA.js): Anker
//     ist die Tiefe, bei der das Nah-Gefaelle Deckkraft null erreicht (4,20 m),
//     plus 1,5 rem Luft. Der Abstand von der letzten Textunterkante zur
//     Oberkante der Ladezone (2,875 m) ist damit rechnerisch
//     (4,20 - 2,875) m x 60 Einheiten x Massstab + 24 px = 79,5 x Massstab + 24.
//     ⚠️ WARUM DAS GEPRUEFT GEHOERT, obwohl Fall 2 schon die Tinte bewacht:
//     Fall 2 wuerde auch dann gruen bleiben, wenn der Abstand aus einem ganz
//     anderen Grund gerade passt (eine runde `py`-Zahl, ein Restbetrag, eine
//     zufaellige Blockhoehe). Das ist die Fehlerklasse „Stellschraube gegen
//     Restbetrag" aus CLAUDE.md Roadmap 20b: Es sieht nicht kaputt aus, es ist
//     nur nicht mehr gehalten — und beim naechsten Textwechsel faellt es um.
//     ⚠️ UND DIE ZWEITE HAELFTE IST DIE WICHTIGERE: Der Abstand darf mit dem
//     FENSTER wachsen, aber NIE mit dem ANMELDEZUSTAND springen. Genau das war
//     Tobias' Blocker B1 vom 20.08. am Hero, und die drei neuen Testdateien
//     jenes Tages enthielten null `playerAuthToken` — der Blocker waere durch
//     eine gruene Suite marschiert (README.md, „Warum P5 ueberhaupt noetig
//     war"). Deshalb misst dieser Fall BEIDE Zustaende in einem Lauf und
//     vergleicht sie miteinander.
//
// (4) DER RING IST AN BEIDEN ENDEN GLEICH GROSS. Das ist die Klammer um drei
//     Leitern, die heute nichts zusammenhaelt (Roadmap 34 e): die
//     Zeichnungshoehe in `AbschlussFeld.js` (35/38/40 rem), das Nah-Gefaelle
//     ebendort und der untere Innenabstand in `LandingCTA.js`. Sie haengen an
//     derselben Groesse; eine allein zu aendern verschiebt das Ende gegen den
//     Hero, OHNE DASS IRGENDETWAS KAPUTT AUSSIEHT. Der Ring ist der eine
//     Gegenstand, der an beiden Enden vorkommt — er ist damit das Mass, an dem
//     ein Auseinanderlaufen ueberhaupt auffaellt.
//
// ══ GEGENPROBE — GEMESSEN, NICHT BEHAUPTET (21.08.2026) ════════════════════
//
// Ein gruener Test beweist nichts, solange nicht gezeigt ist, dass er rot
// werden KANN. Nachgestellter Defekt: der untere Innenabstand in
// `LandingCTA.js` zurueck vom 4,2-m-Anker auf den 2,875-m-Anker
// (`21vw/12.25rem` → `14.375vw/8.3854rem`, sm 9,104 rem, lg 9,583 rem).
// Der Abstand faellt damit von 87,9 px (mobil) bzw. 121,4 px (1440) auf
// **26,0 px** — auf JEDEM Fenster.
//
//   · Fall 3 (Abstand):  ROT auf **6 von 6** Fenstern.
//   · Fall 2 (Tinte):    ROT auf **4 von 12** Faellen — 360, 390, 430 und 768,
//                        jeweils AUSGELOGGT. Die Zonenlinie kreuzt dort
//                        „Du organisierst dein Team? Team gruenden" bei
//                        3,39–3,43 m mit **Deckkraft 0,470–0,502**.
//
// ⚠️ DIE ANDEREN ACHT FAELLE BLIEBEN GRUEN, UND DAS IST DER GRUND, WARUM
// FALL 3 NEBEN FALL 2 STEHT. Angemeldet endet der Block mit „Ein Satz reicht" —
// einer kurzen, mittigen Zeile, an der die Zonenlinien (± 2,45 m) links und
// rechts vorbeilaufen. Auf 1280/1440 gilt dasselbe fuer beide Zustaende.
// Das ist exakt die Lage, die `LandingCTA.js` fuer den Hero beschreibt:
// „Das ist Glueck, keine Konstruktion." Eine Suite, die nur die Tinte prueft,
// haette den Defekt in zwei Dritteln ihrer Faelle durchgelassen — und die
// gruenen Faelle waeren nicht die harmlosen gewesen, sondern die zufaellig
// kurz betexteten.
//
// ⚠️ Abweichung vom Protokoll, benannt statt weggerechnet: Der Deploy-Block
// von CLAUDE.md notiert fuer diese Gegenprobe „0,47–0,69 auf 20 von 20
// Fenstern". Die untere Haelfte der Spanne reproduziert sich (0,470–0,502),
// die Zahl „20 von 20" nicht — das Messwerkzeug `scripts/messungen/tinte.mjs`
// zaehlt JEDE sichtbare Beruehrung, also auch die des fernen Feldes, das hier
// bewusst kreuzen darf. Verglichen werden damit zwei verschiedene Groessen.
//
// ── Zweite Gegenprobe, an einer ANDEREN der drei Leitern ──────────────────
// Die erste Gegenprobe bewegt nur den `pb`-Ausdruck; Fall 4 (Ring) kann sie
// per Konstruktion nicht rot machen. Deshalb zusaetzlich die Hoehenleiter in
// `AbschlussFeld.js` verstellt (`h-[35rem]` → `h-[38rem]`, mobile Stufe):
//   · Fall 4 (Ring):     ROT auf 390x844 — Hero 21,00 px gegen Ende 22,80 px.
//   · Fall 3 (Abstand):  ROT auf den drei mobilen Fenstern, weil die Zeichnung
//                        mitwaechst und der `pb`-Ausdruck nicht.
//   · 1440 und 1920 bleiben gruen, und das ist richtig: Dort bestimmt die
//     BREITE den Massstab, die Hoehenleiter ist dort wirkungslos.
// Damit ist jede der vier Zusicherungen mindestens einmal rot gesehen worden.
//
// ══ WARUM ALLE FAELLE AM GESCROLLTEN, ZUR RUHE GEKOMMENEN BLOCK MESSEN ══════
//
// Die Absaetze im Abschluss-Block sind `<Reveal>`-Elemente und stehen waehrend
// ihrer Einblendung per `transform` 6–18 px TIEFER als ihr Layoutkasten — also
// mitten im Band, in dem die Zeichnung liegt. Wer waehrenddessen misst, meldet
// eine Beruehrung, die 200 ms spaeter keine mehr ist. Gewartet wird deshalb
// mit `warteAufRuhe` (tastet ab, bis sich drei Bilder lang nichts bewegt),
// NICHT mit einer geratenen Zahl — eine geratene Wartezeit hat dieses Projekt
// schon zweimal einen Fehlalarm gekostet.
//
// ⚠️ Und der angemeldete Zustand wird ECHT angemeldet (`helpers/landing.mjs`).
// Ein erfundener Token liefert eine GEMISCHT gerenderte Seite (7 Antworten mit
// 401, Abschluss-Block angemeldet, Navigationsleiste ausgeloggt) — eine halbe
// Seite, die es bei keinem Nutzer gibt. Die Begruendung steht ausfuehrlich im
// Kopf der Helper-Datei (Befund B11).

// ── Prueffeld ──────────────────────────────────────────────────────────────
// Die sechs Fenster der Vorgaengerdatei, unveraendert. Sie decken die drei
// Stufen der Zeichnungshoehe ab (35 rem bis sm, 38 rem ab sm, 40 rem ab lg)
// UND beide Seiten des Massstab-Umschalters: Bis rund 1200 px Breite bestimmt
// die HOEHE den Massstab (`slice` nimmt das Maximum), darueber die BREITE.
// Ein Prueffeld aus lauter Handy-Breiten waere fuer die zweite Haelfte blind.
const FENSTER = [
  [360, 800, "kleinste verbreitete Android-Breite"],
  [390, 844, "iPhone"],
  [430, 932, "grosses Handy"],
  [768, 1024, "Tablet hochkant — erste sm-Stufe"],
  [1280, 800, "Notebook — hier uebernimmt die Breite den Massstab"],
  [1440, 900, "grosser Desktop"],
];

const ZUSTAENDE = [
  ["ausgeloggt", false],
  ["angemeldet", true],
];

// ── Die Deckkraft der beiden Verlaeufe ─────────────────────────────────────
// Wortgleich zu `scripts/messungen/tinte.mjs` und zu den Stufen in
// `AbschlussFeld.js`. Die Tiefe ist in Metern ab der Grundlinie.
const alphaNah = (d) => {
  const st = [
    [0, 1],
    [2.0, 1],
    [2.9, 0.85],
    [3.6, 0.35],
    [4.2, 0],
    [6, 0],
  ];
  if (d <= 0) return 1;
  if (d >= 6) return 0;
  for (let i = 1; i < st.length; i++) {
    if (d <= st[i][0]) {
      const [a, pa] = st[i - 1];
      const [b, pb] = st[i];
      return pa + (pb - pa) * ((d - a) / (b - a));
    }
  }
  return 0;
};
const alphaFern = (d) => 0.85 * (d <= 7 ? 1 : Math.max(0, 1 - (d - 7) / 2));

// Ab welcher Deckkraft eine Beruehrung als SICHTBAR gilt. 0,02 ist derselbe
// Wert wie im Messwerkzeug — er trennt „rechnerisch null" (Gleitkomma-Rest an
// der Nullstelle) von „ein Leser sieht etwas". Er ist bewusst KEIN
// Gestaltungsspielraum: Der Sollwert ist 0,000, nicht 0,019.
const SICHTBAR_AB = 0.02;

// ── Die gesetzten Groessen aus LandingCTA.js / AbschlussFeld.js ────────────
const NULLSTELLE_M = 4.2; // Tiefe, bei der das Nah-Gefaelle 0 erreicht
const LADEZONE_M = 2.875; // Oberkante der Ladezone (Korbmitte 1,575 + r 1,30)
const EINHEITEN_JE_M = 60; // Massstab der viewBox
const LUFT_PX = 24; // die 1,5 rem Luft im `pb`-Ausdruck

// Toleranz gegen die gerechnete Sollgroesse.
//
// ⚠️ Der Sollwert ist eine LAYOUT-Groesse (Unterkante des Textkastens), die
// Messung eine TINTEN-Groesse (Unterkante des Zeilenkastens). Dazwischen liegt
// der halbe Durchschuss der letzten Zeile: bei 16 px Schrift und Zeilenhoehe
// 1,5 sind das rund 2,1 px, gemessen konstant auf allen sechs Fenstern
// (87,9 gegen gerechnet 85,8 · 93,2 gegen 91,1 · 110,8 gegen 108,8 · 121,4
// gegen 119,4). Die 4 px decken diesen festen Versatz plus Subpixel- und
// Schriftrundung ab — und sonst nichts.
//
// Sie ist trotzdem eng: Der Fehler, um dessentwillen dieser Fall existiert —
// Anker zurueck auf die Ladezone (2,875 m) statt auf die Nullstelle (4,20 m) —
// betraegt mobil 62 px und auf 1440 px 95 px. Das ist das Fuenfzehnfache der
// Schranke.
const TOL_ABSTAND = 4.0;

// Wie weit der Abstand zwischen den Anmeldezustaenden auseinanderliegen darf.
// Gemessen: hoechstens 0,1 px auf allen sechs Fenstern. 1 px laesst das
// Zehnfache dieser Streuung durch und faengt trotzdem jeden echten Sprung —
// Tobias' B1 war eine Verschiebung ganz anderer Groessenordnung.
const TOL_SPRUNG = 1.0;

// Die im Deploy-Block von CLAUDE.md protokollierten Absolutwerte. Sie stehen
// hier als REGRESSIONSSPERRE, nicht als Herleitung: Die Herleitung ist die
// Formel oben. Wer eine der drei Leitern anfasst, bekommt hier eine Zahl zu
// sehen, die er mit dem Protokoll vergleichen kann.
//
// ⚠️ DAS PROTOKOLL NENNT ZWEI WERTE JE FENSTER („87,9 ausgeloggt / 85,9
// angemeldet", „121,5 / 119,5"). NUR DER ERSTE REPRODUZIERT SICH — und der
// Unterschied ist ein MESSARTEFAKT, kein Layoutsprung. Nachgerechnet:
//   · ausgeloggt endet der Block mit einem `<a>` — einem INLINE-Element. Sein
//     Kasten ist so hoch wie die Buchstaben (rund 19,4 px), seine Unterkante
//     liegt einen halben Durchschuss ueber der Kastenunterkante.
//   · angemeldet endet er mit einem `<p>` — einem BLOCK-Element. Dessen
//     Kasten ist die volle Zeilenhoehe (24 px).
//   Wer die Elementkaesten misst, bekommt daraus 87,9 gegen 85,9 — also
//   scheinbar einen Sprung mit dem Anmeldezustand, wo in Wahrheit nur zwei
//   verschiedene HTML-Elemente vermessen wurden.
// Diese Datei misst die ZEILENKAESTEN (`Range.getClientRects`) und bekommt in
// BEIDEN Zustaenden denselben Wert: 87,8–87,9 px mobil, 121,4 px auf 1440.
// Deshalb steht hier EIN Sollwert je Fenster, nicht zwei — und der Unterschied
// zwischen den Zustaenden wird oben scharf gegen 1 px geprueft statt gegen 3.
const BELEGT = {
  "360x800": 87.9,
  "390x844": 87.9,
  "430x932": 87.9,
  "1440x900": 121.5,
};
// 1 px: Die Werte sind auf derselben Maschine gemessen (grosste beobachtete
// Streuung 0,1 px); mehr als Rundung der Zeilenkaesten darf nicht
// dazwischenliegen.
const TOL_BELEGT = 1.0;

// Ringdurchmesser, gemessen am gebauten Stueck (CLAUDE.md, Deploy-Block).
const RING_FENSTER = [
  [390, 844, 21.0, "mobil"],
  [1440, 900, 32.4, "grosser Desktop"],
  [1920, 1080, 43.2, "sehr breit"],
];
// 0,3 px absolut. Der Ring wird aus dem `r`-Attribut und der Bildschirm-Matrix
// gerechnet (beides exakt), nicht aus einer Huellbox — es bleibt nur die
// Rundung der Layoutbreite. Eine weichere Schranke wuerde genau den Fehler
// durchlassen, um dessentwillen der Fall existiert: eine Leiter, die um eine
// Stufe verrutscht ist (35 -> 38 rem sind mobil 8 % = 1,7 px).
const TOL_RING = 0.3;

// ═══════════════════════════════════════════════════════════════════════════
// Messung
// ═══════════════════════════════════════════════════════════════════════════

// An das Seitenende scrollen und warten, bis das Layout STEHT.
async function zumEnde(page) {
  await page.waitForSelector("[data-passfeld] [data-endfeld-svg]", { timeout: 15_000 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await warteAufRuhe(page, "[data-passfeld]");
}

// Eine einzige Messung liefert alles, was die vier Faelle brauchen. Bewusst in
// EINEM `evaluate`: Zwischen zwei Aufrufen koennte die Seite nachlayouten, und
// dann gehoerten die Zahlen zu verschiedenen Zustaenden.
async function messe(page) {
  return page.evaluate(() => {
    const sec = document.querySelector("[data-passfeld]");
    if (!sec) return { fehlt: "[data-passfeld]" };
    const svg = sec.querySelector("[data-endfeld-svg]");
    if (!svg) return { fehlt: "[data-endfeld-svg]" };

    const ctm = svg.getScreenCTM();
    if (!ctm) return { fehlt: "getScreenCTM des Feldendes" };
    const inv = ctm.inverse();
    const probe = svg.createSVGPoint();
    const skala = Math.hypot(ctm.a, ctm.b);
    const aufSchirm = (x, y) => {
      const p = svg.createSVGPoint();
      p.x = x;
      p.y = y;
      return p.matrixTransform(ctm);
    };

    // ── Formen ────────────────────────────────────────────────────────────
    // Ellipsen werden im GANZEN Block gezaehlt, nicht nur in der Zeichnung:
    // Eine Schraegansicht kaeme als eigenes Bauteil zurueck, nicht als
    // Ergaenzung im bestehenden SVG.
    // Kreise dagegen nur IN der Zeichnung — im Block liegt auch der Pass-Ball
    // (`DribbelBall`, `<circle r="9">`), und der wuerde die Bedingung
    // „mindestens ein Kreis" selbst dann erfuellen, wenn das Feldende fehlt.
    const kreise = [...svg.querySelectorAll("circle")];
    const verzerrteKreise = kreise.filter((c) => {
      const t = getComputedStyle(c).transform;
      if (!t || t === "none") return false;
      const mm = t.match(/matrix\(([^)]+)\)/);
      if (!mm) return false;
      const [a, , , d] = mm[1].split(",").map(Number);
      return Math.abs(Math.abs(a) - Math.abs(d)) > 0.02;
    }).length;

    // ── Zeilenkaesten aller Textknoten des Blocks ─────────────────────────
    const kaesten = [];
    const lauf = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    let k;
    while ((k = lauf.nextNode())) {
      if (!k.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(k);
      for (const b of rg.getClientRects()) {
        if (b.width > 0 && b.height > 0) {
          kaesten.push({
            t: k.textContent.trim().slice(0, 40),
            l: b.left,
            r: b.right,
            o: b.top,
            u: b.bottom,
          });
        }
      }
    }

    // ── Beruehrungen: Punkt fuer Punkt gegen den STRICH ───────────────────
    // Vorgefiltert ueber die Huellboxen der Pfade — sonst waeren es je
    // Zeilenkasten zehntausende Aufrufe von `isPointInStroke` fuer Pfade, die
    // meterweit entfernt liegen.
    // ⚠️ DER RING WIRD MITGEMESSEN, obwohl er kein `data-endfeld` traegt. Er
    // ist der EINZIGE Kontrastfall dieser Zeichnung (weisser Text auf #F07A27
    // ergibt 2,60 : 1 und reisst AA; auf einer Feldlinie #3A4E7A sind es
    // 7,67 : 1). Dieselbe Trennung prueft `hero-standbild.spec.mjs` P2 am
    // anderen Ende der Seite.
    const pfade = [
      ...[...svg.querySelectorAll("[data-endfeld]")].map((e) => ({
        el: e,
        art: e.getAttribute("data-endfeld"),
      })),
      ...[...svg.querySelectorAll("[data-endfeld-korb]")].map((e) => ({
        el: e,
        art: "ring",
      })),
    ].map((p) => ({ ...p, box: p.el.getBoundingClientRect() }));
    const funde = [];
    for (const kx of kaesten) {
      const nah = pfade.filter(
        (p) => p.box.left <= kx.r && p.box.right >= kx.l && p.box.top <= kx.u && p.box.bottom >= kx.o,
      );
      if (!nah.length) continue;
      let best = null;
      for (let x = kx.l; x <= kx.r; x += 1) {
        for (let y = kx.o; y <= kx.u; y += 1) {
          probe.x = x;
          probe.y = y;
          const p = probe.matrixTransform(inv);
          for (const pf of nah) {
            if (x < pf.box.left || x > pf.box.right || y < pf.box.top || y > pf.box.bottom) continue;
            if (!pf.el.isPointInStroke(p)) continue;
            // Tiefe ab der Grundlinie (viewBox-Hoehe 720, 60 Einheiten je
            // Meter) — daraus folgt die Deckkraft des Verlaufs an genau
            // dieser Stelle.
            const tiefe = (720 - p.y) / 60;
            if (!best || tiefe < best.tiefe) best = { tiefe, art: pf.art };
          }
        }
      }
      if (best) funde.push({ t: kx.t, tiefe: best.tiefe, art: best.art });
    }

    // ── Abstand: letzte Textunterkante → Oberkante der Ladezone ───────────
    // Die Textunterkante ist die tiefste Zeilenkasten-Unterkante des Blocks —
    // dieselbe Waehrung wie oben, nicht die Elementbox.
    // Die Ladezonen-Oberkante wird GEOMETRISCH genommen (`getBBox` durch die
    // Bildschirm-Matrix), also ohne Strichbreite: Der Anker ist das Mass
    // 2,875 m, und die Strichbreite ist eine Gestaltungsgroesse, die den Anker
    // nicht verschieben darf. Der strichinklusive Wert wird zur Einordnung
    // mitgeliefert.
    const textUnten = kaesten.length ? Math.max(...kaesten.map((b) => b.u)) : null;
    const lade = svg.querySelector('[data-endfeld="lade"]');
    const bb = lade ? lade.getBBox() : null;
    const ladeGeo = bb ? aufSchirm(bb.x, bb.y).y : null;
    const ladeTinte = lade ? lade.getBoundingClientRect().top : null;

    // ── Der Ring, an beiden Enden ─────────────────────────────────────────
    // Durchmesser aus dem `r`-Attribut mal dem Massstab der Bildschirm-Matrix.
    // NICHT aus `getBoundingClientRect`: Die traegt die halbe Strichbreite auf
    // beiden Seiten mit und misst damit die Gestaltung statt der Geometrie.
    const ringDm = (el) => {
      if (!el) return null;
      const c = el.getScreenCTM();
      if (!c) return null;
      return 2 * Number(el.getAttribute("r")) * Math.hypot(c.a, c.b);
    };

    return {
      ellipsenImBlock: sec.querySelectorAll("ellipse").length,
      kreiseInZeichnung: kreise.length,
      verzerrteKreise,
      textknoten: kaesten.length,
      funde,
      skala,
      abstandGeo: textUnten !== null && ladeGeo !== null ? ladeGeo - textUnten : null,
      abstandTinte: textUnten !== null && ladeTinte !== null ? ladeTinte - textUnten : null,
      ringEnde: ringDm(svg.querySelector("[data-endfeld-korb]")),
      ringHero: ringDm(document.querySelector("[data-court-korb]")),
      heroDa: !!document.querySelector(".hero-court"),
    };
  });
}

// Die sichtbaren Beruehrungen, nach Ebene getrennt.
//
// ══ ⚠️ WELCHE LINIE TEXT KREUZEN DARF — UND WELCHE NICHT ═══════════════════
//
// Diese Unterscheidung ist der Kern des Falls und war beim ersten Anlauf
// falsch. Die Zeichnung ist eine HINTERGRUNDEBENE; „nichts kreuzt Text" waere
// keine Zusicherung, sondern eine Forderung, die das Konzept selbst verletzt.
// Massgeblich ist die Regel, die `hero-standbild.spec.mjs` P2 am anderen Ende
// der Seite anwendet, gerechnet gegen die gebauten Farben:
//
//   · weisser Text auf der Ringfarbe #F07A27 → 2,60 : 1 → AA gerissen
//   · weisser Text auf einer Feldlinie #3A4E7A → 7,67 : 1 → unbedenklich
//
// Daraus folgen drei Ebenen mit drei verschiedenen Zusicherungen:
//
//   · NAHBEREICH (Zone, Brett, Ladezone, Marken) — DARF NICHT SICHTBAR
//     KREUZEN. Nicht wegen des Kontrasts, sondern weil dieser Teil VOLL
//     gezeichnet ist und der Textabstand ausdruecklich aus seiner Nullstelle
//     gerechnet wird (LandingCTA.js). Eine sichtbare Kreuzung hier heisst:
//     der Anker haelt nicht mehr. Sollwert 0,000.
//   · RING — DARF UEBERHAUPT NICHT BERUEHREN. Der einzige Kontrastfall.
//   · FERNES FELD (Dreipunktlinie) — DARF KREUZEN, und tut es auch. Gemessen
//     am gebauten Stand kreuzt der Bogen die Ueberschrift und den Absatz auf
//     1280 und 1440 px mit Deckkraft 0,39–0,85, mobil den Absatz. Das ist die
//     kuehle Linie hinter dem Text, also genau das, was der Hero an seinem
//     Ende auch tut — sie hier zu verbieten hiesse, das Konzept zu verbieten.
//     ⚠️ Deshalb wird sie GEMESSEN, aber nicht beanstandet: Wer den Wert
//     braucht, findet ihn in der Fehlermeldung, wenn eine der beiden anderen
//     Ebenen anschlaegt.
const NAHBEREICH = ["zone", "brett", "lade", "marke"];

function sichtbare(funde) {
  return funde
    .map((f) => ({
      ...f,
      // Der Ring traegt keinen Verlauf — er ist voll deckend gezeichnet.
      deckkraft: f.art === "ring" ? 1 : f.art === "drei" ? alphaFern(f.tiefe) : alphaNah(f.tiefe),
      ebene: f.art === "ring" ? "ring" : NAHBEREICH.includes(f.art) ? "nah" : "fern",
    }))
    .filter((f) => f.deckkraft > SICHTBAR_AB);
}

const listeFunde = (fs) =>
  fs
    .map(
      (f) =>
        `"${f.t}" <- ${f.art} @ ${f.tiefe.toFixed(2)} m ⇒ Deckkraft ${f.deckkraft.toFixed(3)}`,
    )
    .join(" · ");

// ═══════════════════════════════════════════════════════════════════════════
// (1) + (2) Projektion und freie Tinte — je Fenster, in BEIDEN Zustaenden
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Abschluss-Feld: eine Projektion, und kein sichtbarer Strich in der Tinte", () => {
  for (const [breite, hoehe, wozu] of FENSTER) {
    for (const [name, angemeldet] of ZUSTAENDE) {
      test(`${breite}x${hoehe} (${wozu}), ${name}: eine Projektion, freie Tinte`, async ({
        page,
        request,
      }) => {
        await page.setViewportSize({ width: breite, height: hoehe });
        await ladeStartseite(page, { angemeldet, request });
        await zumEnde(page);

        const mess = await messe(page);
        expect(
          mess.fehlt,
          `Am Seitenende fehlt "${mess.fehlt}". Ohne die Zeichnung misst dieser ` +
            `Fall nichts — und ein Test, der nichts misst, ist gruen ueber nichts.`,
        ).toBeUndefined();

        // ── (1) Projektion ────────────────────────────────────────────────
        expect(
          mess.ellipsenImBlock,
          `Der Abschluss-Block enthaelt ${mess.ellipsenImBlock} <ellipse>. Ein Kreis ` +
            `von senkrecht oben ist ein Kreis — eine Ellipse ist der Fingerabdruck ` +
            `der Schraegansicht. Damit stuenden wieder zwei Projektionen auf einer ` +
            `Seite, also genau der Befund, mit dem am 19.08.2026 die alte ` +
            `Hero-Choreografie zurueckgenommen wurde.`,
        ).toBe(0);

        expect(
          mess.kreiseInZeichnung,
          `Das Feldende (svg[data-endfeld-svg]) enthaelt gar keinen <circle>, also ` +
            `keinen Ring. Ohne diese Zeile waere der Fall auch dann gruen, wenn die ` +
            `Zeichnung ganz fehlt.`,
        ).toBeGreaterThan(0);

        expect(
          mess.verzerrteKreise,
          `${mess.verzerrteKreise} Kreis(e) im Feldende werden ungleichmaessig ` +
            `skaliert und sind damit gerendert eine Ellipse — die Schraegansicht ` +
            `durch die Hintertuer, ueber CSS statt ueber die Geometrie.`,
        ).toBe(0);

        // ── (2) Tinte ─────────────────────────────────────────────────────
        expect(
          mess.textknoten,
          `Im Abschluss-Block wurde kein einziger Zeilenkasten gefunden. Dann hat ` +
            `dieser Fall keine Tinte geprueft, sondern eine leere Liste — und waere ` +
            `gruen, weil nichts da war.`,
        ).toBeGreaterThan(0);

        const treffer = sichtbare(mess.funde);
        const nah = treffer.filter((f) => f.ebene === "nah");
        const ring = treffer.filter((f) => f.ebene === "ring");
        const fern = treffer.filter((f) => f.ebene === "fern");
        // Nur zur Einordnung im Laufprotokoll — das ferne Feld DARF kreuzen.
        console.log(
          `[abschluss ${breite}x${hoehe} ${name}] Massstab ${mess.skala.toFixed(4)} · ` +
            `Abstand ${mess.abstandGeo.toFixed(1)} px · Ring ${mess.ringEnde.toFixed(2)} px · ` +
            `nah ${nah.length} · Ring-Beruehrungen ${ring.length} · ` +
            `fern ${fern.length}${fern.length ? ` (${listeFunde(fern)})` : ""}`,
        );

        expect(
          nah.length,
          `Der Nahbereich der Zeichnung kreuzt sichtbar die Tinte: ${listeFunde(nah)}. ` +
            `Sollwert ist Deckkraft 0,000 — ueber der Nullstelle des Nah-Gefaelles ` +
            `(4,20 m) ist nichts mehr zu sehen, also kann dort auch nichts mehr etwas ` +
            `kreuzen. Ein Strich durch einen Buchstaben liest sich als Panne, nicht ` +
            `als Raum. Wer die letzte Stufe des Gefaelles verschiebt, muss den ` +
            `unteren Innenabstand in LandingCTA.js mitziehen.`,
        ).toBe(0);

        expect(
          ring.length,
          `Der Ring beruehrt die Tinte: ${listeFunde(ring)}. Er ist der EINZIGE ` +
            `Kontrastfall dieser Zeichnung — weisser Text auf #F07A27 ergibt 2,60 : 1 ` +
            `und reisst damit AA. Die kuehlen Feldlinien duerfen jede Zeile kreuzen ` +
            `(7,67 : 1), der orange Ring darf es nicht. Dieselbe Trennung bewacht ` +
            `hero-standbild.spec.mjs P2 am oberen Ende der Seite.`,
        ).toBe(0);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// (3) Der Abstand ist gesetzt — und springt nicht mit dem Anmeldezustand
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Abschluss-Feld: der Abstand zum Text ist gerechnet, nicht angefallen", () => {
  for (const [breite, hoehe, wozu] of FENSTER) {
    test(`${breite}x${hoehe} (${wozu}): Sollabstand eingehalten, kein Sprung beim Anmelden`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });

      // Ausgeloggt zuerst. `ladeStartseite` legt im angemeldeten Fall ein
      // Init-Skript an, das ab dann fuer JEDE Navigation dieser Seite gilt —
      // die Reihenfolge ist deshalb nicht beliebig.
      await ladeStartseite(page);
      await zumEnde(page);
      const aus = await messe(page);

      await ladeStartseite(page, { angemeldet: true, request });
      await zumEnde(page);
      const an = await messe(page);

      for (const [name, m] of [
        ["ausgeloggt", aus],
        ["angemeldet", an],
      ]) {
        expect(m.fehlt, `${name}: Am Seitenende fehlt "${m.fehlt}".`).toBeUndefined();
        expect(
          m.abstandGeo,
          `${name}: Der Abstand liess sich nicht messen (Textunterkante oder ` +
            `Ladezone nicht gefunden).`,
        ).not.toBeNull();
      }

      // Der Sollwert ist GERECHNET, nicht abgeschrieben: Er folgt aus den zwei
      // Tiefen und dem tatsaechlich gemessenen Massstab der Zeichnung. Damit
      // bleibt der Fall gruen, wenn jemand die Zeichnungshoehe bewusst aendert
      // (dann wandern Abstand UND Massstab gemeinsam), und wird rot, sobald
      // der Anker selbst umgehaengt wird.
      const soll = (NULLSTELLE_M - LADEZONE_M) * EINHEITEN_JE_M * aus.skala + LUFT_PX;

      for (const [name, m] of [
        ["ausgeloggt", aus],
        ["angemeldet", an],
      ]) {
        expect(
          Math.abs(m.abstandGeo - soll),
          `${name} auf ${breite}x${hoehe}: Zwischen letzter Textunterkante und ` +
            `Ladezonen-Oberkante liegen ${m.abstandGeo.toFixed(1)} px, gerechnet ` +
            `sind ${soll.toFixed(1)} px ` +
            `((${NULLSTELLE_M} − ${LADEZONE_M}) m × ${EINHEITEN_JE_M} × Massstab ` +
            `${m.skala.toFixed(4)} + ${LUFT_PX} px Luft). Abweichung ` +
            `${(m.abstandGeo - soll).toFixed(1)} px. Der Abstand haengt damit nicht ` +
            `mehr am 4,2-m-Anker — er ist angefallen statt gesetzt, und beim ` +
            `naechsten Textwechsel faellt er um. Betroffen sind drei Stellen: die ` +
            `Zeichnungshoehe in AbschlussFeld.js, das Nah-Gefaelle ebendort und der ` +
            `pb-Ausdruck in LandingCTA.js.`,
        ).toBeLessThanOrEqual(TOL_ABSTAND);
      }

      // ⚠️ Die eigentliche Zusicherung: Der Absolutwert darf mit dem Fenster
      // wachsen — der Unterschied zwischen den Anmeldezustaenden nicht.
      expect(
        Math.abs(aus.abstandGeo - an.abstandGeo),
        `Der Abstand springt mit dem Anmeldezustand: ausgeloggt ` +
          `${aus.abstandGeo.toFixed(1)} px, angemeldet ${an.abstandGeo.toFixed(1)} px ` +
          `(Unterschied ${(aus.abstandGeo - an.abstandGeo).toFixed(1)} px). Genau das ` +
          `war Tobias' Blocker B1 vom 20.08. am Hero: Die Geometrie darf an der ` +
          `Blockhoehe haengen, aber nicht daran, WER die Seite ansieht — sonst sieht ` +
          `die Haelfte der Besucher ein anderes Bild als die geprueften Screenshots.`,
      ).toBeLessThanOrEqual(TOL_SPRUNG);

      // Regressionssperre gegen das Protokoll im Deploy-Block von CLAUDE.md.
      const belegt = BELEGT[`${breite}x${hoehe}`];
      if (belegt) {
        for (const [name, m] of [
          ["ausgeloggt", aus],
          ["angemeldet", an],
        ]) {
          expect(
            Math.abs(m.abstandGeo - belegt),
            `${name} auf ${breite}x${hoehe}: gemessen ${m.abstandGeo.toFixed(1)} px, ` +
              `im Deploy-Block von CLAUDE.md protokolliert sind ${belegt} px. ` +
              `Diese Zahl ist am gebauten Stueck gemessen worden — weicht sie ab, ist ` +
              `entweder eine der drei Leitern gewandert oder das Protokoll ist ` +
              `ueberholt. Beides gehoert angesehen, nicht angepasst.`,
          ).toBeLessThanOrEqual(TOL_BELEGT);
        }
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// (4) Der Ring ist an beiden Enden der Seite gleich gross
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Abschluss-Feld: derselbe Ring an beiden Enden der Seite", () => {
  for (const [breite, hoehe, soll, wozu] of RING_FENSTER) {
    test(`${breite}x${hoehe} (${wozu}): Hero-Ring und End-Ring messen ${soll} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await ladeStartseite(page);
      await zumEnde(page);

      const mess = await messe(page);
      expect(mess.fehlt, `Am Seitenende fehlt "${mess.fehlt}".`).toBeUndefined();

      // Ehrlichkeitsschranke: Ohne den Hero-Ring vergliche dieser Fall eine
      // Zahl mit `null` und waere still gruen — dieselbe Falle wie „gruen ueber
      // nichts" in Fall 1.
      expect(
        mess.heroDa && mess.ringHero !== null,
        `Der Hero-Ring ([data-court-korb] in .hero-court) wurde nicht gefunden. ` +
          `Dann vergleicht dieser Fall nichts. ⚠️ Falls der Hero seinen Namensraum ` +
          `gewechselt hat: NICHT hier angleichen — hero-standbild.spec.mjs und ` +
          `hero-einblendung.spec.mjs zaehlen denselben Namen dokumentweit.`,
      ).toBe(true);

      expect(
        Math.abs(mess.ringEnde - mess.ringHero),
        `Der Ring ist an den beiden Enden der Seite verschieden gross: Hero ` +
          `${mess.ringHero.toFixed(2)} px, Seitenende ${mess.ringEnde.toFixed(2)} px ` +
          `(Unterschied ${(mess.ringEnde - mess.ringHero).toFixed(2)} px). Damit ist es ` +
          `nicht mehr derselbe Gegenstand an zwei Enden EINES Feldes, sondern zwei ` +
          `verschieden grosse Koerbe — und die Seite liest sich nicht mehr als ein ` +
          `Feld. Ursache ist immer eine der drei Leitern: Zeichnungshoehe in ` +
          `AbschlussFeld.js bzw. HeroStage.js, Nah-Gefaelle, pb-Ausdruck.`,
      ).toBeLessThanOrEqual(TOL_RING);

      expect(
        Math.abs(mess.ringEnde - soll),
        `Der End-Ring misst ${mess.ringEnde.toFixed(2)} px, im Deploy-Block von ` +
          `CLAUDE.md protokolliert sind ${soll} px. Die Zahl haengt an Ringradius ` +
          `(0,225 m), Massstab (60 Einheiten je Meter) und der Zeichnungshoehe — ` +
          `weicht sie ab, ist eine dieser drei Groessen gewandert.`,
      ).toBeLessThanOrEqual(TOL_RING);
    });
  }
});
