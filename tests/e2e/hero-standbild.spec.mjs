import { test, expect } from "@playwright/test";

// ══ DER HERO ALS STANDBILD ══════════════════════════════════════════════════
//
// Ersetzt `hero-dunk.spec.mjs` und `hero-erstes-bild.spec.mjs` (beide am
// 20.08.2026 entfallen). Deren Gegenstand — scroll-gesteuerte Choreografie,
// fallender Ball, zwei Fassungen je Seitenverhältnis — existiert nicht mehr.
// Was ÜBERNOMMEN ist, sind die zwei Zusicherungen, die den Gegenstand
// überlebt haben: der Kontrastfall und das rohe Server-Blatt.
//
// ⚠️ DIE ERSTE PRÜFUNG IST DIE WICHTIGE, UND SIE IST NEU.
// Patrick hat am 20.08.2026 den ganzen Hero zurückgenommen. Sein erster Satz
// war nicht „die Animation ruckelt", sondern dass es nicht gut aussieht — und
// der schwerste Einzelbefund war: zwischen Navigationsleiste und Überschrift
// lagen rund 215 px LEERE Fläche, während Überschrift und Taste ins untere
// Drittel gedrückt waren.
//
// **Keiner der damals grünen Tests konnte das sehen.** Sie haben Kontraste auf
// zwei Nachkommastellen, Ballpositionen, Deckkräfte und neun Viewports
// gemessen — aber keiner hat gefragt, ob das erste Bild oben etwas ZEIGT.
// Es wurde gemessen statt angesehen. Diese Datei schließt genau diese Lücke,
// und sie tut es so, dass die Regel eine Umgestaltung überlebt: Sie schreibt
// nicht vor, WAS oben steht, sondern nur, dass dort nicht nichts ist.

const BASIS = "/";

// Reale Geräte, absichtlich mit HÖHENACHSE. Ein Prüffeld aus reinen Breiten
// hat in diesem Projekt schon vier Gate-Runden gekostet (CLAUDE.md Roadmap
// 20b: „Breiten geprüft, der Ausfall hing an der Fensterhöhe").
const FENSTER = [
  [360, 640], // kleines Android, kurzes Fenster
  [360, 740], // verbreitetste Android-Breite Deutschlands
  [390, 844], // iPhone
  [430, 932], // iPhone Max
  [768, 1024], // iPad hochkant
  [1024, 768], // iPad quer — Querformat mit wenig Höhe
  [1440, 900], // Notebook
];

// Wo das klebende Seitengerüst aufhört. GEMESSEN, nicht aus Konstanten
// geschlossen: Über der Bühne stehen Testphase-Band UND Navigationsleiste,
// und genau diese Summe falsch anzunehmen war die Ursache des Befunds
// (die alte Bühne zog 64 px ab, wo 109 abzuziehen waren).
async function messen(page) {
  return page.evaluate(() => {
    const buehne = document.querySelector("[data-hero-stage]");
    if (!buehne) throw new Error("Keine Hero-Bühne gefunden");
    const nav =
      document.querySelector("nav") || document.querySelector("header");
    if (!nav) throw new Error("Kein Seitengerüst gefunden");
    const chromeUnten = nav.getBoundingClientRect().bottom;

    const h1 = buehne.querySelector("h1");
    const korb = buehne.querySelector("[data-court-korb]");
    const linien = [...buehne.querySelectorAll("[data-court-path]")];
    if (!h1 || !korb || linien.length === 0) {
      throw new Error("Hero unvollständig – dieser Test misst dann nichts");
    }

    // ⚠️ ZWEI VERSCHIEDENE GRÖSSEN, UND SIE AUSEINANDERZUHALTEN IST DER GANZE
    // PUNKT DIESER DATEI (Befund Kai H2, 20.08.2026).
    //
    //   `zeichnungOben` = oberste Kante der ZEICHNUNG (Feldlinien + Ring).
    //   `erstesInhalt`  = oberste Kante des ersten Elements mit eigenem TEXT
    //                     im Inhaltsblock.
    //
    // Bis zum 20.08. warf P1 beides in einen Topf („die oberste Tinte") und
    // nahm davon das Minimum. Da die Grundlinie per Konstruktion bei
    // viewBox-y = 44 liegt, war dieses Minimum IMMER die Zeichnung — gemessen
    // 34–53 px unter dem Seitengerüst, auf jedem der sieben Fenster. Die
    // Überschrift konnte beliebig tief rutschen, ohne die Zahl zu bewegen.
    const zeichnungOben = Math.min(
      ...[...linien, korb]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0)
        .map((r) => r.top),
    );

    // Erstes SICHTBARES Element mit EIGENEM Text. „Eigener" Text heißt: ein
    // direktes Text-Kind. Ohne diese Einschränkung meldet der umschließende
    // Container die Oberkante des Blocks statt die des ersten Zeichens — und
    // der Block beginnt oberhalb seiner ersten Zeile.
    const block = buehne.querySelector("[data-hero-inhalt]");
    if (!block) {
      throw new Error(
        "Kein [data-hero-inhalt] gefunden – ohne diesen Griff misst P1 wieder " +
          "die Zeichnung statt den Inhalt (genau der Befund H2)",
      );
    }
    let erstesInhalt = null;
    for (const el of block.querySelectorAll("*")) {
      const eigen = [...el.childNodes]
        .filter((k) => k.nodeType === 3)
        .map((k) => k.textContent.trim())
        .join("");
      if (!eigen) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (!erstesInhalt || r.top < erstesInhalt.top) {
        erstesInhalt = {
          top: r.top,
          text: eigen.slice(0, 40),
          tag: el.tagName,
        };
      }
    }

    const kb = korb.getBoundingClientRect();
    return {
      chromeUnten,
      sichtbar: window.innerHeight - chromeUnten,
      zeichnungOben,
      erstesInhalt,
      h1Oben: h1.getBoundingClientRect().top,
      h1Text: (h1.textContent || "").trim().slice(0, 60),
      korb: { top: kb.top, bottom: kb.bottom, left: kb.left, right: kb.right },
      fensterBreite: window.innerWidth,
      dokumentBreite: document.documentElement.scrollWidth,
    };
  });
}

// Ehrlichkeitsschranken, die JEDER Fall dieser Datei braucht — ausgelagert,
// damit der eingeloggte Zweig sie nicht „vergessen" kann.
function schrankenPruefen(expect, m) {
  // Ist die Bühne gar nicht im Bild, misst der Fall nichts und wäre trotzdem
  // grün. (Fehlerklasse Kai/Tobias, CLAUDE.md Roadmap 20f/20h: „ein grüner
  // Test mit null Messframes".)
  expect(
    m.sichtbar,
    "Unter dem Seitengerüst ist nichts sichtbar – hier wird nichts gemessen",
  ).toBeGreaterThan(200);

  expect(
    m.erstesInhalt,
    "Im Hero steht kein Element mit eigenem Text – dieser Fall misst nichts",
  ).not.toBeNull();
}

// ⚠️ DIE ZWEI SCHRANKEN AM ANKER GEHÖREN ZUSAMMEN — und sie stehen bewusst in
// ZWEI Prüfblöcken, weil sie zwei verschiedene Fragen beantworten:
//   · P1 ist die OBERE Schranke: Rutscht der Inhalt vom Ring weg nach unten?
//     Das ist Patricks Befund vom 20.08.2026.
//   · P2 ist die UNTERE Schranke: Rückt der Inhalt in den Ring hinein?
//     Das ist der einzige Kontrastfall dieser Zeichnung.
// Gemessen am gebauten Stand liegt der Abstand auf allen sieben Fenstern
// konstant bei 24,1 px (ausgeloggt) bzw. 27,0 px (eingeloggt).
const ANKER_MIN = 16;
const ANKER_MAX = 48;

test.describe("Hero-Standbild – P1: der Inhalt hängt am Ring, nicht am Zufall", () => {
  // ⚠️ DIESER BLOCK WAR BIS ZUM 20.08.2026 BLIND FÜR SEINEN EIGENEN GEGENSTAND
  // (Befund Kai H2). Er maß den Abstand zur obersten „Tinte" — und in dieser
  // Menge lagen die FELDLINIEN. Deren Lage ist gesetzt (Grundlinie bei
  // viewBox-y = 44), sie sitzen per Konstruktion dicht unter der Leiste.
  // Gemessen 4,0–6,6 % gegen eine Schwelle von 12 %: Eine Überschrift 260 px
  // tiefer ergab 66 % leere Fläche und der Test blieb GRÜN.
  //
  // ⚠️ UND DIE NAHELIEGENDE KORREKTUR WÄRE DIE FALSCHE GEWESEN. Sie lautet:
  // dieselbe Rechnung, nur gegen den Inhalt statt gegen die Zeichnung, also
  // „höchstens X % der sichtbaren Höhe liegen über der Überschrift". Diese Zahl
  // ist KEIN Prüfmaß, und das ist am gebauten Stand gemessen, nicht behauptet:
  //
  //     360×640 → 30,4 %    390×844 → 22,0 %    430×932 → 19,6 %
  //
  // Dreimal dasselbe Seitenlayout, dreimal ein anderer Wert. Der Zähler ist
  // eine GESETZTE Größe (Korblage × Maßstab + 1,5 rem), der Nenner ist die
  // Fensterhöhe — sie haben nichts miteinander zu tun. Wer so misst, bekommt
  // eine Kennzahl, die sich bewegt, ohne dass sich etwas geändert hat, und
  // muss die Schwelle am kürzesten Fenster ausrichten, wo sie dem
  // beanstandeten Zustand (40,6 %) auf zehn Punkte nahekommt.
  // Das ist wörtlich die Fehlerklasse aus CLAUDE.md Roadmap 20b — „eine
  // Stellschraube und einen Restbetrag als dieselbe Größe behandeln".
  //
  // DESHALB WIRD IN DER WÄHRUNG GEMESSEN, IN DER DER ABSTAND GESETZT IST:
  // gegen den RING. `HeroStage.js` rechnet den oberen Innenabstand des
  // Inhaltsblocks ausdrücklich als „Korbunterkante + 1,5 rem" — der Abstand
  // ist dort keine Messgröße mehr, sondern gesetzt. Genau darauf prüft P1.
  // Er überlebt jede Fensterhöhe, jede Breite und beide Anmeldezustände.

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: der Inhalt beginnt höchstens ${ANKER_MAX} px unter dem Ring`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);
      schrankenPruefen(expect, m);

      const anker = m.erstesInhalt.top - m.korb.bottom;
      expect(
        anker,
        `Zwischen der Ringunterkante (y=${m.korb.bottom.toFixed(0)}) und dem ` +
          `ersten Inhalt („${m.erstesInhalt.text}", y=${m.erstesInhalt.top.toFixed(0)}) ` +
          `liegen ${anker.toFixed(0)} px. Der Inhalt hat sich vom Ring gelöst — ` +
          `Überschrift und Taste rutschen nach unten, oben bleibt Fläche übrig. ` +
          `Genau das war Patricks Befund vom 20.08.2026 (damals 215 px).`,
      ).toBeLessThanOrEqual(ANKER_MAX);
    });
  }
});

test.describe("Hero-Standbild – P1b: die Zeichnung selbst beginnt oben", () => {
  // Die zweite Hälfte von P1 — und sie ist NICHT überflüssig neben dem Anker.
  // Der Anker prüft den Abstand ZWISCHEN Ring und Inhalt; er bliebe grün, wenn
  // Zeichnung UND Inhalt gemeinsam nach unten wanderten (etwa durch einen
  // Innenabstand an der Bühne). Diese Prüfung fängt genau den Fall.
  //
  // Hier ist das Verhältnis zur sichtbaren Höhe zulässig, und zwar aus einem
  // Grund, der bei P1 nicht galt: Gefragt ist „wie viel vom ERSTEN BILD ist
  // nichts" — Zähler und Nenner beschreiben dieselbe Sache. Gemessen 4,0–6,6 %.
  const MAX_LEER = 0.12;

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: höchstens ${MAX_LEER * 100} % leerer Rand über der Zeichnung`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);
      schrankenPruefen(expect, m);

      const leer = m.zeichnungOben - m.chromeUnten;
      const anteil = leer / m.sichtbar;
      expect(
        anteil,
        `Über der obersten Linie der Zeichnung liegen ${leer.toFixed(0)} px ` +
          `(${(anteil * 100).toFixed(1)} % der sichtbaren Höhe) leere Fläche. ` +
          `Die ganze Bühne ist nach unten gerutscht.`,
      ).toBeLessThan(MAX_LEER);
    });
  }
});

test.describe("Hero-Standbild – P2: der Korb berührt keinen Buchstaben", () => {
  // ⚠️ DER EINZIGE KONTRASTFALL, DEN DIESE ZEICHNUNG NOCH KENNT.
  // Gerechnet gegen die tatsächlich gebauten Farben:
  //   · weißer Text (#F5F7FA) auf der Korb-Farbe (#F07A27) → 2,60 : 1 → AA gerissen
  //   · weißer Text auf einer Feldlinie (#3A4E7A)          → 7,67 : 1 → unbedenklich
  //   · Kleinzeile (#E6EAF2) auf einer Feldlinie           → 6,83 : 1 → unbedenklich
  // Deshalb prüft dieser Block GEOMETRIE statt Kontrast: Die kühlen Linien
  // dürfen jede Zeile kreuzen, der orange Korb darf es nicht. Das ist der
  // ganze Ersatz für die Abdunkelungs-Mechanik des Vorgängers.
  //
  // ⚠️ GEMESSEN WIRD GEGEN DAS ERSTE INHALTSELEMENT, NICHT GEGEN DAS `h1` —
  // und das ist Tobias' Befund M1 vom 20.08.2026. Ausgeloggt sind beide
  // dasselbe; EINGELOGGT steht über der Überschrift eine Eyebrow-Zeile, und
  // die liegt 3 px höher. Ein Test gegen das `h1` misst dort also einen zu
  // GROSSEN Abstand — er wäre großzügig genau in dem Zustand, in dem der
  // Defekt (Tobias' B1, Ring hinter dem Willkommens-Schild) tatsächlich auftrat.
  //
  // ⚠️ ALLE DREI ZAHLEN OBEN WAREN LEICHT FALSCH und sind am 20.08.2026
  // nachgerechnet worden (Befund Kai M2): 2,59 → 2,60 · 7,52 → 7,67 ·
  // 6,72 → 6,83. Keine davon kehrt eine Aussage um, und genau das ist der
  // Grund, sie zu korrigieren: Eine Kennzahl, die ungefähr stimmt, wird beim
  // nächsten Mal nicht nachgerechnet, sondern zitiert.

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: mindestens ${ANKER_MIN} px zwischen Korb und Inhalt`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);
      schrankenPruefen(expect, m);

      const abstand = m.erstesInhalt.top - m.korb.bottom;
      expect(
        abstand,
        `Der Korb endet bei y=${m.korb.bottom.toFixed(0)}, der erste Inhalt ` +
          `(„${m.erstesInhalt.text}") beginnt bei y=${m.erstesInhalt.top.toFixed(0)} – ` +
          `Abstand ${abstand.toFixed(0)} px. ` +
          `Bei Überlappung steht weißer Text auf #F07A27 (2,60 : 1).`,
      ).toBeGreaterThanOrEqual(ANKER_MIN);
    });
  }
});

test.describe("Hero-Standbild – P3: Rahmenbedingungen", () => {
  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe}: Korb vollständig im Bild, kein Querscrollen`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });
      const m = await messen(page);

      // Der Korb ist das eine bedeutungstragende Zeichen. Die LINIEN dürfen
      // angeschnitten werden – das ist bei einer Spielfeld-Markierung der
      // Normalfall und ausdrücklich gewollt. Der Korb darf es nicht: Ein
      // halber Ring am Bildrand war einer der drei Befunde vom 20.08.
      expect(
        m.korb.top,
        "Korb ragt hinter das Seitengerüst",
      ).toBeGreaterThanOrEqual(m.chromeUnten - 1);
      expect(m.korb.left, "Korb links angeschnitten").toBeGreaterThanOrEqual(0);
      expect(m.korb.right, "Korb rechts angeschnitten").toBeLessThanOrEqual(
        m.fensterBreite,
      );

      expect(
        m.dokumentBreite,
        "Die Seite scrollt waagerecht – die Zeichnung ragt aus dem Dokument",
      ).toBeLessThanOrEqual(m.fensterBreite + 1);
    });
  }
});

test.describe("Hero-Standbild – P4: der Grundzustand ist die fertige Zeichnung", () => {
  // ⚠️ ÜBERNOMMEN AUS `hero-erstes-bild.spec.mjs`, weil der Befund dahinter
  // (Kai K1, `d841c4b`) nicht am Motiv hing, sondern am Vorgehen: Der Server
  // lieferte einen Zustand aus, den das JavaScript danach zurücknahm.
  // Die neue Fassung kann das per Konstruktion nicht mehr — die gesamte
  // Animation steht in einer `prefers-reduced-motion: no-preference`-Klammer,
  // das ausgelieferte Blatt trägt also KEIN Strichmuster. Genau das wird hier
  // nachgehalten, denn „kann nicht passieren" gilt nur, solange es jemand prüft.

  test("das rohe Server-Blatt enthält die Zeichnung und kein Versteck", async ({
    request,
  }) => {
    const r = await request.get(BASIS);
    expect(r.ok(), "Startseite nicht erreichbar").toBeTruthy();
    const html = await r.text();
    expect(
      html.length,
      "Die Startseite liefert fast nichts – dieser Test misst dann nichts",
    ).toBeGreaterThan(20000);

    expect(html, "Die Zeichnung fehlt im ausgelieferten Blatt").toContain(
      "data-court-korb",
    );
    expect(
      (html.match(/data-court-path/g) || []).length,
      "Zu wenige Feldlinien im ausgelieferten Blatt",
    ).toBeGreaterThanOrEqual(5);

    // `stroke-dasharray` gehört ausschließlich ins Stylesheet. Steht es am
    // Element, ist die Zeichnung beim Ausliefern versteckt – und wer kein CSS
    // bekommt, sieht sie nie.
    //
    // ⚠️ GEPRÜFT WIRD JE ELEMENT, NICHT IM GANZEN BLATT — und das ist eine
    // Korrektur am Test, nicht am Code. Der erste Anlauf suchte die
    // Zeichenkette im gesamten HTML und wurde rot: Der Treffer stand in
    // `data-spur="desktop"` aus der Feature-Strecke, einem Element, das mit
    // dem Hero nichts zu tun hat. Ein Test, der über seinen Gegenstand
    // hinausgreift, meldet fremde Befunde als eigene — hier harmlos, weil er
    // rot wurde; bei umgekehrtem Vorzeichen wäre er still falsch grün.
    const courtTags =
      html.match(/<(?:path|circle)\b[^>]*data-court-[^>]*>/g) || [];
    expect(
      courtTags.length,
      "Keine Zeichnungs-Elemente im Blatt – dieser Test misst dann nichts",
    ).toBeGreaterThanOrEqual(6);
    for (const tag of courtTags) {
      expect(
        /stroke-?[dD]asharray/.test(tag),
        `Ein Zeichnungs-Element kommt mit Strichmuster beim Nutzer an: ${tag.slice(0, 120)}`,
      ).toBeFalsy();
    }
  });

  test("bei reduzierter Bewegung steht die Zeichnung sofort und vollständig", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASIS, { waitUntil: "domcontentloaded" });

    const zustand = await page.evaluate(() => {
      const els = [
        ...document.querySelectorAll("[data-court-path], [data-court-korb]"),
      ];
      return els.map((el) => {
        const cs = getComputedStyle(el);
        return {
          dash: cs.strokeDasharray,
          name: cs.animationName,
          deckkraft: cs.opacity,
        };
      });
    });

    expect(zustand.length, "Keine Zeichnung gefunden").toBeGreaterThanOrEqual(
      6,
    );
    for (const z of zustand) {
      expect(
        z.name,
        "Bei reduzierter Bewegung läuft trotzdem eine Animation",
      ).toBe("none");
      expect(
        z.dash === "none" || z.dash === "",
        `Strichmuster ${z.dash} versteckt die Zeichnung bei reduzierter Bewegung`,
      ).toBeTruthy();
      expect(Number(z.deckkraft)).toBe(1);
    }
  });
});

test.describe("Hero-Standbild – P5: derselbe Hero, angemeldet (Tobias M1)", () => {
  // ⚠️ WARUM DIESER BLOCK EXISTIERT — und er ist der teuerste Teil dieser Datei.
  // P1 bis P4 laufen alle AUSGELOGGT. Tobias' Blocker B1 vom 20.08.2026 (der
  // Ring lag hinter dem Willkommens-Schild, auf 9 von 11 Fenstern, bis
  // −44,8 px) trat AUSSCHLIESSLICH eingeloggt auf — er lag deshalb in keinem
  // einzigen Test und wäre durch eine grüne Suite marschiert.
  //
  // Das ist wortgleich das Muster aus CLAUDE.md Roadmap 20f: Dort war
  // `hero-auth-tausch.spec.mjs` die einzige Stelle, an der ein Defekt sichtbar
  // gewesen wäre, und die Viewport-Liste lag komplett unter 768 px — also
  // genau außerhalb des Bereichs, in dem der Defekt lebte. Ein Prüffeld, das
  // einen ganzen Zustand auslässt, ist nicht „etwas weniger gründlich",
  // sondern für diesen Zustand blind.
  //
  // ⚠️ UND GEMESSEN WIRD GEGEN DAS ERSTE INHALTSELEMENT, NICHT GEGEN DAS `h1`.
  // Eingeloggt steht über der Überschrift eine Eyebrow-Zeile; ein Test gegen
  // das `h1` misst dort einen zu GROSSEN Abstand und ist ausgerechnet in dem
  // Zustand großzügig, in dem der Defekt auftrat.

  async function anmelden(page, request) {
    const res = await request.post("/api/player/playerlogin", {
      data: { email: "max@test.de", password: "test123" },
    });
    const j = await res.json().catch(() => ({}));
    const token = j?.data?.token || j?.token;
    expect(
      typeof token === "string" && token.length > 20,
      `Keine Anmeldung möglich – ohne Token rendert der ausgeloggte Hero und ` +
        `dieser Block prüft NICHTS. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
    ).toBe(true);

    const info = await request.post("/api/player/getmyinfo", {
      data: { token },
    });
    const ij = await info.json().catch(() => ({}));
    const vorname = ij?.data?.player?.firstName || ij?.player?.firstName || "";
    expect(
      vorname.length,
      "Kein Vorname aus getmyinfo – ohne ihn greift die Ehrlichkeitsschranke nicht",
    ).toBeGreaterThan(0);

    await page.addInitScript(
      (t) => localStorage.setItem("playerAuthToken", t),
      token,
    );
    return vorname;
  }

  for (const [breite, hoehe] of FENSTER) {
    test(`${breite}×${hoehe} angemeldet: Ring und Inhalt halten ihren Abstand`, async ({
      page,
      request,
    }) => {
      const vorname = await anmelden(page, request);
      await page.setViewportSize({ width: breite, height: hoehe });
      await page.goto(BASIS, { waitUntil: "networkidle" });

      // ══ EHRLICHKEITSSCHRANKE: HAT DER ZWEIG WIRKLICH GETAUSCHT? ══════════
      // Ohne sie wäre dieser Block der teuerste Selbstbetrug der Datei: Der
      // Hero entscheidet erst NACH der Anmeldeprüfung, welchen Zweig er
      // rendert. Löst sie nicht auf — abgelaufener Token, geänderter
      // Speicherschlüssel, fehlgeschlagene API —, dann steht hier der
      // AUSGELOGGTE Hero, alle sieben Fälle sind grün, und geprüft ist
      // wieder nichts.
      //
      // Der Nachweis hängt bewusst NICHT am Wortlaut („Willkommen zurück"):
      // CLAUDE.md hält fest, dass Nele über diese Zeile noch nicht entschieden
      // hat. Er hängt an der PERSONALISIERUNG — das ist die Eigenschaft, die
      // den eingeloggten Zweig überhaupt zu einem eigenen macht.
      const h1 = page.locator("[data-hero-stage] h1");
      await expect(
        h1,
        `Die Überschrift im Hero nennt den Vornamen „${vorname}" nicht. Entweder ` +
          `hat der Anmelde-Zweig nicht getauscht (dann misst dieser Fall den ` +
          `AUSGELOGGTEN Hero und ist grün über nichts), oder der eingeloggte ` +
          `Hero ist nicht mehr personalisiert – dann gehört diese Schranke ` +
          `angepasst, und zwar von Hand.`,
      ).toContainText(vorname, { timeout: 15_000 });

      const m = await messen(page);
      schrankenPruefen(expect, m);

      // Zweite Schranke: Der gemessene Inhalt muss AUS dem eingeloggten Zweig
      // stammen. Ausgeloggt beginnt der Hero mit dem `h1`; eingeloggt liegt
      // darüber die Eyebrow-Zeile. Sind beide identisch, misst der Fall zwar
      // etwas, aber nicht den Zustand, für den er gebaut wurde.
      expect(
        m.h1Text,
        "Die gemessene Überschrift ist nicht die personalisierte",
      ).toContain(vorname);

      const abstand = m.erstesInhalt.top - m.korb.bottom;

      // Untere Schranke — Tobias' B1 in seiner reinen Form. Gemessen lag er
      // hier bei −41,7 px (360–430) und −44,8 px (320).
      expect(
        abstand,
        `ANGEMELDET: Der Ring endet bei y=${m.korb.bottom.toFixed(0)}, der erste ` +
          `Inhalt („${m.erstesInhalt.text}") beginnt bei ` +
          `y=${m.erstesInhalt.top.toFixed(0)} – Abstand ${abstand.toFixed(0)} px. ` +
          `Bei Überlappung steht Text auf #F07A27 (2,60 : 1). Das ist Tobias' ` +
          `Blocker B1 vom 20.08.2026, und er trat NUR angemeldet auf.`,
      ).toBeGreaterThanOrEqual(ANKER_MIN);

      // Obere Schranke — dieselbe Regel wie P1, damit die Komposition auch
      // angemeldet am Ring hängt und nicht am Inhaltsumfang. Genau daran ist
      // die Vorfassung gescheitert: Die Zeichnung wuchs mit dem Inhalt.
      expect(
        abstand,
        `ANGEMELDET: Zwischen Ring und erstem Inhalt liegen ` +
          `${abstand.toFixed(0)} px. Die Komposition hängt wieder am ` +
          `Inhaltsumfang statt am Ring.`,
      ).toBeLessThanOrEqual(ANKER_MAX);

      // Der Ring bleibt im Bild — angemeldet wie abgemeldet.
      expect(
        m.korb.top,
        "ANGEMELDET: Ring ragt hinter das Seitengerüst",
      ).toBeGreaterThanOrEqual(m.chromeUnten - 1);
      expect(
        m.korb.left,
        "ANGEMELDET: Ring links angeschnitten",
      ).toBeGreaterThanOrEqual(0);
      expect(
        m.korb.right,
        "ANGEMELDET: Ring rechts angeschnitten",
      ).toBeLessThanOrEqual(m.fensterBreite);
    });
  }
});
