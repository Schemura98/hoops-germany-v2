import { test, expect } from "@playwright/test";
import { ladeStartseite, warteAufRuhe } from "./helpers/landing.mjs";

// ══ DAS FELD DES HEROS LÄUFT AUS, STATT AN DER NAHT ABGESCHNITTEN ZU WERDEN ══
//
// Bewacht Roadmap 30 (e), gebaut in `54bc039`. Bis dahin endete die Seitenlinie
// des Heros HART an der Bühnenunterkante, und auf derselben Höhe begann die
// Außenlinie der Seite, nur weiter außen — Tobias' Wort: „im Vergleich der
// auffälligste Punkt der Seite". Die Abhilfe ist eine deckende Fläche über den
// letzten 7 rem der Bühne (`components/landing/HeroStage.js`, Kasten `NAHT`,
// Farbe in `app/globals.css` unter `.hero-naht`).
//
// ⚠️ WARUM ES DIESE DATEI ÜBERHAUPT GIBT: Die Abhilfe ist EIN `<div>`. Wer es
// löscht, bekommt den harten Schnitt zurück — und ohne diesen Wächter bliebe
// die Suite dabei vollständig grün. Das ist nicht vermutet, sondern gefahren:
// Mit entferntem `<div>` lief die volle Suite mit **300 grün, 5 rot, 1
// übersprungen** — also exakt dem Sollstand des unveränderten Baums. Kein
// einziger bestehender Fall bemerkt den Rückfall.
//
// ══ ⚠️ DER VORGESCHLAGENE PRÜFMASS-ENTWURF TRÄGT NICHT, UND ZWAR AN DER ═════
// ══    ENTSCHEIDENDEN STELLE ════════════════════════════════════════════════
//
// Übergeben wurde: „An der Bühnenunterkante darf kein `[data-court-path]` mit
// sichtbarer Deckkraft enden", Muster in `scripts/messungen/hero-naht.mjs`.
// Die ABSICHT ist richtig. Zwei Dinge daran sind es nicht:
//
// (1) DIE DECKKRAFT DER ZEICHNUNG IST FÜR DIESEN DEFEKT BLIND. Die Naht ist
//     eine FREMDE Ebene ÜBER dem SVG. Sie ändert an keiner Deckkraft, keinem
//     Verlaufsstopp und keinem Attribut der Zeichnung irgendetwas. Ein Test,
//     der die Deckkraft der Feldlinien liest, misst vor und nach dem Löschen
//     des `<div>` denselben Wert — er wäre grün über dem Defekt, den er
//     bewachen soll. Das Muster in `hero-naht.mjs` prüft folgerichtig auch
//     nichts dergleichen: Es zählt mit `isPointInStroke`, WELCHE Pfade an der
//     Naht liegen (Geometrie), und misst nie, ob dort noch etwas ZU SEHEN ist.
//     Gemessen werden muss deshalb am BILDPUNKT, nicht am SVG.
//
// (2) EIN ABSOLUTER KONTRASTWERT AN DER NAHT TRÄGT AUCH NICHT. Gemessen am
//     ausgelieferten Stand gegen den Stand mit entferntem `<div>`:
//         900 px  1,014 → 1,178      1440 px  1,014 → 1,342
//        1024 px  1,015 → 1,205      1600 px  1,032 → 1,424
//        1280 px  1,180 → 1,285      1920 px  1,022 → 1,720
//     Der ausgelieferte Wert auf 1280 (1,180) liegt ÜBER dem Defektwert auf
//     900 (1,178). Es gibt keine einzelne Schwelle, die beide Spalten trennt.
//     Eine Schwelle je Breite wäre eine gesetzte Zahl gegen einen Restbetrag —
//     die Fehlerklasse, die dieses Projekt inzwischen in fünfter Auflage führt
//     (CLAUDE.md, Roadmap 20b). Der Grund für die Streuung ist echt: Das Band
//     ist 112 px im BILDSCHIRMMASS lang, die Feldtiefe an der Naht liegt aber
//     je nach Fenster bei 8,29 bis 12,82 m — die Linie, die dort ausläuft, ist
//     also je nach Fenster verschieden hell, BEVOR das Band auf sie wirkt.
//
// GEMESSEN WIRD DESHALB DER ABFALL DERSELBEN LINIE ÜBER DIE LETZTEN 120 px —
// in der Währung des jeweiligen Fensters, ohne eine einzige Zahl je Breite:
//        ausgeliefert   92,7 – 97,7 %          entferntes `<div>`   6,3 – 12,7 %
// Das ist dieselbe Größe für alle Fenster und trennt um den Faktor sieben.
//
// ⚠️ 120 px IST EIN MESSABSTAND, KEIN GESTALTUNGSMASS. Der Bezugspunkt liegt
// bewusst NICHT an der Oberkante des `<div>`, sondern 120 px über der
// Bühnenunterkante — damit prüft dieser Fall die WIRKUNG und nicht das Bauteil.
// Wer das Auslaufen eines Tages mit einer Maske, einem Filter oder einem
// zweiten Verlauf baut, muss hier nichts nachziehen; nur wer es WEGNIMMT,
// bekommt Rot.
//
// ══ ZWEI SEITEN, WEIL EINE SEITE DEN NÄCHSTEN FEHLER EINLÄDT ════════════════
// P1 allein wäre mit „Band doppelt so lang" beliebig zu erfüllen — und genau
// das würde auf dem Telefon den Bogen schlucken, der dort das EINZIGE
// Feldelement der unteren Bildhälfte ist. P2 zieht die Gegenschranke ein.
//
// ⚠️ P2 GILT NUR AUF TELEFONBREITEN, UND DAS IST BELEGT, NICHT BEQUEM. Die
// naheliegende Fassung („das Ausblenden berührt den Bogen nie") ist
// nachweislich unerfüllbar: Die Luft zwischen dem tiefsten gezeichneten Punkt
// der Dreipunktlinie und der Bandoberkante fällt mit wachsender Breite monoton
// und ist im AUSGELIEFERTEN Stand längst negativ — 1440: +15,8 px · 1600:
// −28,3 · 1920: −110,6. Dort lag der Bogen vorher HART abgeschnitten; das
// Auslaufen ist an der Stelle die Abhilfe, nicht der Schaden. Eine Schranke,
// die auf breiten Fenstern per Konstruktion nicht gelten kann, ist keine.
// Auf 320/360/375/390/430 ist die Luft dagegen konstant 25,0 px.
//
// ⚠️ DER TIEFSTE PUNKT WIRD GESUCHT, NICHT GEWUSST. `hero-naht.mjs` setzt den
// Bogenscheitel als Konstante `SCHEITEL = 543.5` (viewBox). Das ist eine zweite
// Quelle der Wahrheit neben der Zeichnung: Wer den Bogen verschiebt, verschiebt
// den Prüfpunkt NICHT mit, und der Wächter misst ab da an der falschen Stelle
// — dieselbe Form wie „richtig gemessen, am falschen Gegenstand", die in dieser
// Runde schon zweimal vorkam. Hier wird der tiefste gezeichnete Punkt von
// `[data-court="drei"]` mit `isPointInStroke` GESUCHT.
//
// ══ DREI EHRLICHKEITSSCHRANKEN ══════════════════════════════════════════════
// (a) Die Naht muss im SICHTFELD liegen. Ein Screenshot ist fensterhoch; auf
//     1280×800 endet die Bühne bei y = 848, also 48 px UNTER dem Fenster. Meine
//     erste Sonde klemmte den Zugriff stumm auf die letzte Bildzeile und maß
//     47 px zu hoch — sie meldete 41,4 % Abfall, wo 95,5 % stehen (dieselbe
//     Sonde auf 1280×1000 gemessen). Es wird deshalb gescrollt UND geprüft.
// (b) Der Vergleichsgrund muss FLÄCHE sein, nicht Tinte. Genau daran ist
//     `hero-kontrast.mjs` in seiner ersten Fassung gescheitert (Griff 14 px
//     daneben, dort stand ein Buchstabe: 10,06 statt 1,63 : 1).
// (c) Über dem Band muss überhaupt etwas zu sehen sein (> 1,05 : 1). Sonst
//     gibt es nichts, dessen Verschwinden man messen könnte, und ein grüner
//     Fall wäre grün über nichts.
//
// ══ GEGENPROBEN — an der QUELLE gefahren, neu gebaut, gemessen ══════════════
// Nicht zur Laufzeit weggeschaltet, sondern im Quelltext geändert und neu
// gebaut — eine Laufzeit-Abschaltung beweist nur, dass der Browser gehorcht.
//
//   `<div data-hero-naht>` entfernt      → P1 7/7 rot · P2 5/5 rot   (12 rot)
//   `background-image: none`             → P1 7/7 rot · P2 grün
//   letzter Verlaufsstopp 1,0 → 0,74     → P1 3/7 rot · P2 grün
//   Bandhöhe h-28 → h-40 (112 → 160 px)  → P1 grün    · P2 5/5 rot
//   Bandhöhe h-28 → h-56 (112 → 224 px)  → P1 grün    · P2 5/5 rot
//   Bandklasse ungültig (Band ohne Höhe) → P1 7/7 rot · P2 grün
//
// ⚠️ DIE VERTEILUNG IST DER PUNKT, NICHT DIE SUMME. Die drei oberen Zeilen
// nimmt P1, die zwei Höhen-Zeilen nimmt P2 — keine der beiden Seiten fängt
// alles, und genau deshalb stehen beide da. Ein Wächter nur aus P1 wäre mit
// „Band doppelt so lang" zu erfüllen und hätte auf dem Telefon den Bogen
// geschluckt; einer nur aus P2 hätte das Entfernen des Verlaufs nicht bemerkt.
//
// ⚠️ P2 wird bei entferntem `<div>` MITROT, und das ist Absicht (Begründung an
// der Zusicherung selbst): Ein „nichts gefunden, also in Ordnung" wäre hier die
// vierte Auflage von „Wächter verschwindet mit seinem Bauteil".
//
// ⚠️ Und eine Gegenprobe war zuerst NICHT die, für die ich sie hielt: Der erste
// Anlauf der Höhen-Mutation schrieb durch eine Maskierung meiner Shell die
// Klasse `h-\[10.5rem\]` MIT Backslashes in die Datei. Das ist keine gültige
// Tailwind-Klasse, das Band bekam gar keine Höhe — gemessen wurde also „Band
// weg", nicht „Band länger". Die Zeile steht oben als eigener Fall, der Versuch
// wurde mit `h-40` wiederholt. Eine Mutation, die man nicht nachmisst, ist eine
// Behauptung über einen Test.

// Fenster für P1: NUR Breiten, auf denen an der Naht überhaupt eine Feldlinie
// kreuzt. Auf 320–430 kreuzt dort KEINE (die Hero-Seitenlinie liegt mobil
// außerhalb des Bildes) — sie stünden hier als grüne Fälle über nichts.
const P1_FENSTER = [
  [768, 1024],
  [900, 1000],
  [1024, 1366],
  [1280, 800],
  [1440, 900],
  [1600, 900],
  [1920, 1080],
];

// Fenster für P2: Telefonbreiten, Begründung im Kopf.
const P2_FENSTER = [
  [320, 640],
  [360, 800],
  [375, 812],
  [390, 844],
  [430, 932],
];

const MESSABSTAND = 120; // px über der Bühnenunterkante, siehe Kopf
const MIN_ABFALL = 80; // Prozent. Ausgeliefert 92,7–97,7 · Defekt 6,3–12,7
const MIN_LUFT = 8; // px. Ausgeliefert 25,0 · Band ×1,5 −31,0 · Band ×2 −87,0

// ── Kontrast an echten Bildpunkten ──────────────────────────────────────────
const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const leuchte = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const kontrast = (a, b) => {
  const l1 = Math.max(leuchte(a), leuchte(b));
  const l2 = Math.min(leuchte(a), leuchte(b));
  return (l1 + 0.05) / (l2 + 0.05);
};

// Legt den Screenshot als Bildpunkt-Nachschlagewerk in die Seite. `__px` gibt
// `null` außerhalb des Bildes zurück — bewusst NICHT geklemmt: Eine Klemmung
// liefert stumm einen falschen Bildpunkt, und genau das hat meine erste Sonde
// getan (Ehrlichkeitsschranke (a) im Kopf).
async function bildpunkteLaden(page) {
  const buf = await page.screenshot();
  await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const daten = g.getImageData(0, 0, img.width, img.height).data;
    window.__breite = img.width;
    window.__hoehe = img.height;
    window.__px = (x, y) => {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= img.width || y >= img.height) return null;
      const i = (y * img.width + x) * 4;
      return [daten[i], daten[i + 1], daten[i + 2]];
    };
  }, buf.toString("base64"));
}

// Misst an (x, y): hellster Bildpunkt der Linie gegen den dunkelsten Grund
// daneben. Der Grund wird auf BEIDEN Seiten gesucht und darf am Bildrand
// einseitig ausfallen — solange genug Stützstellen übrig bleiben.
async function messePunkt(page, x, y) {
  return await page.evaluate(
    ({ x, y }) => {
      const mitte = window.__px(x, y);
      if (!mitte) return { fehler: "Messpunkt liegt außerhalb des Bildes" };
      let hell = null;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const c = window.__px(x + dx, y + dy);
          if (!c) continue;
          const s = c[0] + c[1] + c[2];
          if (!hell || s > hell.s) hell = { c, s };
        }
      }
      const gruende = [];
      for (let dx = -14; dx <= 14; dx++) {
        if (Math.abs(dx) < 6) continue;
        const c = window.__px(x + dx, y);
        if (c) gruende.push({ c, s: c[0] + c[1] + c[2] });
      }
      if (gruende.length < 4) return { fehler: `nur ${gruende.length} Grund-Stützstellen` };
      const dunkel = gruende.reduce((a, b) => (b.s < a.s ? b : a));
      return { linie: hell.c, grund: dunkel.c };
    },
    { x: Math.round(x), y: Math.round(y) },
  );
}

// Sucht auf einer Bildzeile alle Stellen, an denen ein Feldpfad im Strich liegt.
async function kreuzungen(page, y) {
  return await page.evaluate((y) => {
    const svg = document.querySelector("svg.hero-court");
    if (!svg) return [];
    const inv = svg.getScreenCTM().inverse();
    const pt = svg.createSVGPoint();
    const pfade = [...svg.querySelectorAll("[data-court-path]")];
    const gefunden = [];
    for (let x = 2; x < window.innerWidth - 2; x++) {
      pt.x = x;
      pt.y = y;
      const q = pt.matrixTransform(inv);
      for (const e of pfade) {
        if (!e.isPointInStroke(q)) continue;
        const name = e.getAttribute("data-court") || "?";
        if (!gefunden.some((t) => t.name === name && Math.abs(t.x - x) < 8)) {
          gefunden.push({ name, x });
        }
        break;
      }
    }
    return gefunden;
  }, y);
}

// Scrollt die Bühnenunterkante ins Sichtfeld und gibt die Lage zurück.
async function nahtInsBild(page) {
  return await page.evaluate(async () => {
    const st = document.querySelector("[data-hero-stage]");
    if (!st) return null;
    const abs = st.getBoundingClientRect().bottom + window.scrollY;
    const ziel = Math.max(0, Math.ceil(abs - window.innerHeight + 40));
    window.scrollTo(0, ziel);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const r = st.getBoundingClientRect();
    return { unten: r.bottom, oben: r.top, fensterHoehe: window.innerHeight };
  });
}

// ══ P1 ══════════════════════════════════════════════════════════════════════
test.describe("Das Hero-Feld läuft an der Naht aus", () => {
  for (const [breite, hoehe] of P1_FENSTER) {
    test(`${breite}×${hoehe}: die Feldlinie verliert an der Naht ihren Kontrast`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await ladeStartseite(page);
      await warteAufRuhe(page, "[data-hero-stage]");

      const lage = await nahtInsBild(page);
      expect(lage, "Die Bühne `[data-hero-stage]` fehlt — es wurde nichts gemessen.").not.toBeNull();
      // Ehrlichkeitsschranke (a)
      expect(
        lage.unten,
        `Die Bühnenunterkante liegt bei y = ${lage.unten?.toFixed(1)} und damit nicht im ` +
          `Sichtfeld (0 … ${lage.fensterHoehe}). Ein Screenshot ist fensterhoch; jede Messung ` +
          `an dieser Kante wäre eine Messung an einer anderen Zeile.`,
      ).toBeLessThan(lage.fensterHoehe - 2);
      expect(lage.unten).toBeGreaterThan(MESSABSTAND + 10);

      const yNaht = Math.round(lage.unten) - 2;
      const yOben = Math.round(lage.unten) - MESSABSTAND;

      const anNaht = await kreuzungen(page, yNaht);
      const ueberBand = await kreuzungen(page, yOben);

      // Ehrlichkeitsschranke: kreuzt hier überhaupt etwas?
      expect(
        anNaht.length,
        `An der Naht (y = ${yNaht}) kreuzt keine einzige Feldlinie. Dieser Fall hätte nichts ` +
          `zu prüfen und wäre grün über nichts. Entweder ist die Zeichnung nicht da, oder das ` +
          `Feld ist so verschoben, dass es die Naht nicht mehr erreicht — beides gehört ` +
          `angesehen, nicht stillschweigend als „in Ordnung" gezählt.`,
      ).toBeGreaterThan(0);

      // Ein Screenshot je Fenster, nicht je Pfad.
      await bildpunkteLaden(page);

      const namen = [...new Set(anNaht.map((t) => t.name))];
      let gemessen = 0;
      const protokoll = [];

      for (const name of namen) {
        const oben = ueberBand.find((t) => t.name === name);
        const unten = anNaht.find((t) => t.name === name);
        if (!oben) continue; // Pfad läuft erst unterhalb der Bezugszeile ins Bild

        const rOben = await messePunkt(page, oben.x, yOben);
        const rUnten = await messePunkt(page, unten.x, yNaht);
        if (rOben.fehler || rUnten.fehler) {
          protokoll.push(`${name}: nicht messbar (${rOben.fehler || rUnten.fehler})`);
          continue;
        }

        // Ehrlichkeitsschranke (b): Vergleichsgrund muss Fläche sein
        const istFlaeche = (g) => g[0] < 40 && g[1] < 50 && g[2] < 70;
        expect(
          istFlaeche(rOben.grund) && istFlaeche(rUnten.grund),
          `Der Vergleichsgrund für „${name}" ist keine Fläche, sondern vermutlich Tinte ` +
            `(oben ${rOben.grund}, unten ${rUnten.grund}). Dann misst dieser Fall „Linie gegen ` +
            `Buchstabe" statt „Linie gegen Fläche" — genau der Fehlgriff, an dem ` +
            `scripts/messungen/hero-kontrast.mjs in seiner ersten Fassung gescheitert ist.`,
        ).toBe(true);

        const kOben = kontrast(rOben.linie, rOben.grund);
        const kUnten = kontrast(rUnten.linie, rUnten.grund);

        // Ehrlichkeitsschranke (c): über dem Band muss etwas zu sehen sein
        if (kOben <= 1.05) {
          protokoll.push(`${name}: über dem Band nur ${kOben.toFixed(3)} : 1 — nichts zu verlieren`);
          continue;
        }

        const abfall = (1 - (kUnten - 1) / (kOben - 1)) * 100;
        protokoll.push(
          `${name}: ${kOben.toFixed(3)} → ${kUnten.toFixed(3)} : 1 = ${abfall.toFixed(1)} % Abfall`,
        );
        gemessen += 1;

        expect(
          abfall,
          `Die Feldlinie „${name}" verliert über die letzten ${MESSABSTAND} px der Bühne nur ` +
            `${abfall.toFixed(1)} % ihres Kontrasts (${kOben.toFixed(3)} → ${kUnten.toFixed(3)} : 1). ` +
            `Sie endet damit sichtbar an der Naht, statt auszulaufen — und unmittelbar darunter ` +
            `beginnt die Außenlinie der Seite, nur weiter außen. Das ist Tobias' Befund vom ` +
            `21.08.2026 zurück (Roadmap 30 e). Ausgeliefert gemessen: 92,7–97,7 %; mit ` +
            "entferntem [data-hero-naht]: 6,3–12,7 %.",
        ).toBeGreaterThanOrEqual(MIN_ABFALL);
      }

      expect(
        gemessen,
        `Kein einziger Pfad war messbar — dieser Fall wäre grün, ohne etwas geprüft zu haben. ` +
          `Protokoll: ${protokoll.join(" | ") || "(leer)"}`,
      ).toBeGreaterThan(0);
    });
  }
});

// ══ P2 ══════════════════════════════════════════════════════════════════════
test.describe("Auf Telefonbreiten beginnt das Ausblenden unter dem Bogen", () => {
  for (const [breite, hoehe] of P2_FENSTER) {
    test(`${breite}×${hoehe}: der tiefste Punkt der Dreipunktlinie bleibt unangetastet`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await ladeStartseite(page);
      await warteAufRuhe(page, "[data-hero-stage]");

      const mass = await page.evaluate(() => {
        const st = document.querySelector("[data-hero-stage]");
        const svg = document.querySelector("svg.hero-court");
        if (!st || !svg) return null;
        const r = st.getBoundingClientRect();
        const inv = svg.getScreenCTM().inverse();
        const pt = svg.createSVGPoint();
        const drei = svg.querySelector('[data-court="drei"]');
        if (!drei) return { keinBogen: true };
        // Tiefsten GEZEICHNETEN Punkt suchen — nicht aus einer viewBox-Konstante
        // ableiten (siehe Kopf).
        let tief = null;
        for (let y = Math.round(r.bottom) - 1; y > r.top && !tief; y--) {
          for (let x = 2; x < window.innerWidth - 2; x += 2) {
            pt.x = x;
            pt.y = y;
            if (drei.isPointInStroke(pt.matrixTransform(inv))) {
              tief = { x, y };
              break;
            }
          }
        }
        const band = document.querySelector("[data-hero-naht]");
        return {
          tief,
          bandOben: band ? band.getBoundingClientRect().top : null,
          buehneUnten: r.bottom,
        };
      });

      expect(mass, "Bühne oder Zeichnung fehlen — es wurde nichts gemessen.").not.toBeNull();
      expect(mass.keinBogen, 'Die Dreipunktlinie [data-court="drei"] fehlt.').toBeFalsy();
      expect(
        mass.tief,
        "Die Dreipunktlinie ist in der Bühne nirgends gezeichnet — nichts zu schützen.",
      ).not.toBeNull();

      // ⚠️ Bewusst ROT statt still grün: P2 misst die Lage der ausblendenden
      // Ebene. Wer das Auslaufen mit einem anderen Mechanismus baut (Maske,
      // Filter), muss diesen Fall neu ausrichten — eine stille Zustimmung wäre
      // hier die vierte Auflage von „Wächter verschwindet mit seinem Bauteil".
      expect(
        mass.bandOben,
        `Es gibt keine ausblendende Ebene [data-hero-naht]. Falls das Auslaufen bewusst mit ` +
          `einem anderen Mechanismus gebaut wurde, muss dieser Fall darauf neu ausgerichtet ` +
          `werden — er darf nicht stillschweigend grün werden. P1 prüft die Wirkung und ist ` +
          `davon unabhängig.`,
      ).not.toBeNull();

      const luft = mass.bandOben - mass.tief.y;
      expect(
        luft,
        `Das Ausblenden beginnt ${(-luft).toFixed(1)} px ÜBER dem tiefsten gezeichneten Punkt ` +
          `der Dreipunktlinie (Bogen bei y = ${mass.tief.y}, Band ab y = ${mass.bandOben.toFixed(1)}). ` +
          `Auf Telefonbreiten ist der Bogen das einzige Feldelement der unteren Bildhälfte — ` +
          `wird er mit ausgeblendet, ist die untere Hälfte des Heros leer. Ausgeliefert sind es ` +
          `+25,0 px auf allen fünf Telefonbreiten; mit h-40 statt h-28 (160 statt 112 px) −23,0 px.`,
      ).toBeGreaterThanOrEqual(MIN_LUFT);
    });
  }
});
