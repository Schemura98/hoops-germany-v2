// Der mobile Newsfeed: Der Feed beginnt oben, die Wegweiser sind bedienbar.
//
// WARUM ES DIESEN TEST BRAUCHT (Übergabe Kai, Gate 18.08.2026)
// Der mobile Umbau war die größte sichtbare Änderung des Tages und hatte
// **null** Abdeckung: `newsfeed-schiene.spec.mjs` prüft 1440/1280/1024 – also
// ausschließlich Desktop. Auf dem Gerät, das laut CLAUDE.md der Hauptfall ist,
// wurden vier Akkordeons durch eine Wegweiser-Zeile ersetzt und die
// Folge-Vorschläge unter den Feed verlegt, ohne dass irgendetwas das festhält.
//
// ⚠️ Kais Satz dazu, der den Ton für diesen Test setzt: „der Kommentar
// behauptet `min-h-11` – behaupten und messen sind zweierlei." Deshalb wird
// hier die GEZEICHNETE Höhe gemessen (`getBoundingClientRect`), nicht die
// Klasse gelesen. Eine Klasse kann von einer späteren Regel überschrieben
// werden, ohne dass jemand die Klasse anfasst.
import { test, expect } from "@playwright/test";

// Reale Gerätebreiten. 360 ist die verbreitetste Android-Breite Deutschlands
// (steht so in CLAUDE.md, Roadmap 20d), 390 das iPhone-Maß.
const BREITEN = [360, 375, 390, 430];

// WCAG 2.5.8 (AA) verlangt 24×24 px. Die Wegweiser sind bewusst auf 44 gebaut –
// das ist der AAA-Wert und die Daumenempfehlung. Geprüft wird gegen 44, damit
// eine stille Rückstufung auffällt, nicht erst der Bruch der Mindestnorm.
const ZIEL_MIN = 44;

async function anmelden(request) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email: "max@test.de", password: "test123" },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token – ohne Anmeldung gibt es keinen Newsfeed und dieser Test prüft ` +
      `nichts. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

test.describe("Newsfeed mobil", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: Wegweiser statt Kästen, Feed beginnt oben`, async ({
      page,
      request,
    }) => {
      const token = await anmelden(request);
      await page.setViewportSize({ width: breite, height: 844 });
      await page.addInitScript((t) => {
        localStorage.setItem("playerAuthToken", t);
        // Die Willkommens-Tour startet sonst automatisch und legt sich über
        // die ganze Seite. Ihr Wächter ist genau dieser Schlüssel – so bleibt
        // die Datenbank unberührt.
        sessionStorage.setItem("hg_welcome_token", t);
      }, token);
      // Der Nachrichten-Abschnitt hängt an einem fremden RSS-Abruf. Er steht
      // mobil zwar nicht mehr auf der Seite, kann aber die Ladezeit prägen –
      // feste Antwort, damit der Test nicht am Wetter hängt.
      await page.route("**/api/news/rss", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, news: [] }),
        }),
      );

      await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });

      const wegweiser = page.locator('nav[aria-label="Weitere Bereiche"] a');
      await wegweiser.first().waitFor({ state: "visible", timeout: 30_000 });

      // ── Einschwingen abwarten, DANN messen (Mess-Race, 27.08.2026) ──────
      // Der Wegweiser ist sichtbar, BEVOR die Anzeigetafel fertig geladen
      // hat: Im Ladezustand rendert sie ein nacktes `div` mit
      // `aria-hidden="true"` und Skeleton-Pulsen — OHNE ihren
      // Erkennungs-Marker `section[aria-label="Deine Anzeigetafel"]`
      // (components/feed/Anzeigetafel.js, Skeleton-Zweig). Wer in diesem
      // Moment den Vorbau scannt, sieht einen „unbekannten" ~188-px-Block
      // mit leerem Text und wird rot — obwohl das Produkt heil ist. Das ist
      // die Fehlerklasse „die Messung kommt zu früh" (Nachrichten-Karten-
      // Lehre vom 20.08.2026: auf das Element warten reicht nicht, es muss
      // zur RUHE gekommen sein).
      //
      // Gewartet wird deshalb auf die EIGENSCHAFT „kein Skeleton-Block mehr
      // im Inhalt", nicht auf die Anzeigetafel-Sektion selbst: Ob die
      // Sektion überhaupt erscheint, hängt an der Datenlage (kein Team /
      // keine Spiele → sie fehlt zu Recht), und eine Zusicherung über die
      // Datenbank ist genau der Fehler, den diese Datei zweimal beerdigt
      // hat. Ein Skeleton dagegen löst sich IMMER auf: `matchesLoading`
      // endet garantiert im `finally` (app/player/newsfeed/page.js).
      // Race-frei ist die Absenz-Prüfung, weil der Skeleton-Zweig im SELBEN
      // React-Commit entsteht wie der Wegweiser — ist der Wegweiser
      // sichtbar, ist das Skeleton entweder da (noch am Laden) oder schon
      // aufgelöst; es kann nicht erst danach auftauchen.
      //
      // ⚠️ Ehrlichkeitsschranke: KEIN stilles Ewig-Warten. Läuft die Zeit
      // ab, wird der Fall ROT mit Befund — ein Skeleton, das sich nie
      // auflöst, wäre ein echter Produktfehler (hängendes matchesLoading),
      // kein Messproblem.
      const eingeschwungen = await page
        .waitForFunction(
          () => {
            const inhalt = document.querySelector("main");
            if (!inhalt) return false;
            return ![...inhalt.querySelectorAll('[aria-hidden="true"]')].some(
              (e) =>
                e.matches(".animate-pulse") || e.querySelector(".animate-pulse"),
            );
          },
          null,
          { timeout: 20_000 },
        )
        .then(() => true)
        .catch(() => false);
      expect(
        eingeschwungen,
        `Nach 20 s steht immer noch ein Skeleton-Ladeblock (aria-hidden + ` +
          `animate-pulse) im Inhalt. Entweder löst sich ein Ladezustand nie ` +
          `auf (echter Produktfehler: hängendes Laden, z. B. my-matches ohne ` +
          `Antwort) — oder es gibt einen NEUEN dauerhaften Skeleton-Block, ` +
          `den dieser Test kennen müsste. Gemessen wird erst nach dem ` +
          `Einschwingen; ohne Einschwingen wird nicht gemessen, sondern ` +
          `gemeldet.`,
      ).toBe(true);

      // ── Ehrlichkeitsschranke ────────────────────────────────────────────
      // Unter 1024 px darf die Desktop-Schiene gar nicht existieren. Steht sie
      // doch da, misst der Test eine andere Seite als gemeint.
      const schiene = await page.evaluate(
        () =>
          [...document.querySelectorAll("main *")].filter(
            (e) => getComputedStyle(e).position === "sticky",
          ).length,
      );
      expect(
        schiene,
        `Bei ${breite}px steht ein haftendes Element im Inhalt – das ist die ` +
          `Desktop-Schiene. Der mobile Zweig wurde also gar nicht gerendert, ` +
          `und alles Weitere wäre eine Aussage über den Desktop.`,
      ).toBe(0);

      const mess = await page.evaluate(() => {
        const q = (sel) => [...document.querySelectorAll(sel)];
        const nav = document.querySelector('nav[aria-label="Weitere Bereiche"]');
        const ziele = q('nav[aria-label="Weitere Bereiche"] a').map((a) => {
          const r = a.getBoundingClientRect();
          return {
            text: a.textContent.trim(),
            href: a.getAttribute("href"),
            hoehe: Math.round(r.height),
            breite: Math.round(r.width),
          };
        });
        // Der Feed-Umschalter markiert den Beginn der Beitragsliste.
        const umschalter = q("button, a").find((e) => e.textContent.trim() === "Für dich");
        const grenze = umschalter
          ? umschalter.getBoundingClientRect().top + window.scrollY
          : null;

        // ── Die Blöcke oberhalb des Feeds einsammeln ───────────────────────
        // Gesucht ist die OBERSTE Schicht: jedes Element, das vollständig über
        // der Grenze liegt und dessen Elternteil das nicht tut. Damit ist die
        // Messung unabhängig davon, wie tief jemand einen neuen Block einhängt
        // – ein Block als Geschwister des Kopfes und ein Block drei Ebenen
        // tiefer erscheinen beide genau einmal.
        const bloecke = [];
        const hauptteil = document.querySelector("main");
        const laufe = (el) => {
          for (const k of el.children) {
            const b = k.getBoundingClientRect();
            if (b.height === 0) continue;
            const oben = b.top + window.scrollY;
            const unten = b.bottom + window.scrollY;
            if (unten <= grenze + 1) bloecke.push(k); // ganz drüber
            else if (oben < grenze) laufe(k); // enthält die Grenze
            // ganz drunter: gehört zum Feed, nicht zum Vorbau
          }
        };
        if (grenze !== null && hauptteil) laufe(hauptteil);

        // Jeder bekannte Block wird an einer EIGENSCHAFT erkannt, nicht an
        // einer CSS-Klasse: Klassen ändert eine Gestaltungsrunde, die Rolle
        // eines Blocks nicht.
        const erkenne = (e) => {
          const t = (e.textContent || "").replace(/\s+/g, " ").trim();
          if (e.tagName === "HEADER" && e.querySelector("h1")) return "Kopf";
          if (e.matches('section[aria-label="Deine Anzeigetafel"]')) return "Anzeigetafel";
          if (e.matches('nav[aria-label="Weitere Bereiche"]')) return "Wegweiser";
          if (e.querySelector('[aria-label="Ausblenden"]')) return "Onboarding-Streifen";
          if (e.querySelector("textarea") || /Was gibt.?s Neues/.test(t)) return "Composer";
          return null;
        };

        const tafel = document.querySelector('section[aria-label="Deine Anzeigetafel"]');
        return {
          ziele,
          navHoehe: nav ? Math.round(nav.getBoundingClientRect().height) : null,
          umschalterY: grenze === null ? null : Math.round(grenze),
          quer: document.documentElement.scrollWidth > window.innerWidth,
          fensterBreite: window.innerWidth,
          vorbau: bloecke.map((e) => ({
            art: erkenne(e),
            tag: e.tagName,
            hoehe: Math.round(e.getBoundingClientRect().height),
            text: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60),
          })),
          tafelHoehe: tafel ? Math.round(tafel.getBoundingClientRect().height) : 0,
          tafelRegister: tafel ? tafel.querySelectorAll("a").length : 0,
        };
      });

      // ── Die Zusicherungen ───────────────────────────────────────────────
      expect(
        mess.ziele.length,
        `Keine Wegweiser gefunden – die mobile Neuordnung vom 18.08.2026 ist weg.`,
      ).toBeGreaterThanOrEqual(3);

      for (const z of mess.ziele) {
        expect(
          z.hoehe,
          `Wegweiser „${z.text}" ist nur ${z.hoehe}px hoch (gemessen, nicht aus ` +
            `der Klasse gelesen). Vorher standen hier 20-px-Aufklapppfeile oben ` +
            `rechts – genau dort, wo ein Daumen nicht hinkommt. Das war der Grund ` +
            `für den Umbau.`,
        ).toBeGreaterThanOrEqual(ZIEL_MIN);
        expect(
          z.href,
          `Wegweiser „${z.text}" hat kein Ziel.`,
        ).toBeTruthy();
      }

      expect(
        mess.quer,
        `Die Seite scrollt bei ${breite}px seitlich (Dokument ` +
          `${mess.fensterBreite}px breit). Die Wegweiser-Zeile darf in sich ` +
          `scrollen, die Seite nicht.`,
      ).toBe(false);

      // Der Feed muss oben beginnen – das war der ganze Zweck des Umbaus.
      expect(
        mess.umschalterY,
        `Der Feed-Umschalter („Für dich") wurde nicht gefunden.`,
      ).not.toBeNull();

      // ═══════════════════════════════════════════════════════════════════
      // ⚠️ DIE PIXELSCHWELLE IST ERSATZLOS ENTFALLEN — und der Grund ist
      // gemessen, nicht abgewogen (Befund Tobias + Gegenprobe Kai,
      // Roadmap 38a, 22.08.2026).
      // ═══════════════════════════════════════════════════════════════════
      // Hier stand `toBeLessThan(650)`, begründet mit „Ist-Wert ~554 px".
      // Beide Zahlen waren richtig gemessen und beide beschreiben einen
      // DATENSTAND, nicht das Produkt:
      //
      //   Anzeigetafel mit 3 Registern → Feed beginnt bei 650 px
      //   Anzeigetafel mit 2 Registern → 554 px   ← daher die 554
      //   Anzeigetafel mit 0 Registern → 414 px
      //
      // Die Anzeigetafel stapelt mobil ein Register je vorhandener Aussage
      // (nächstes Spiel · letztes Ergebnis · deine Zahlen). Wie viele davon
      // stehen, hängt daran, ob ein Spiel angesetzt ist — also an der
      // Datenbank. Gemessen ist die Schwankung **236 px**.
      //
      // ⚠️ DAS IST MEHR, ALS DER BEWACHTE DEFEKT KOSTET (die vier Kästen:
      // ~192 px). Damit kann es keine Schwelle geben, die beides trennt.
      // Gegenprobe gefahren (`/api/player/my-matches` im Browser
      // abgefangen, Datenbank unberührt, vier Kästen nachgestellt):
      //
      //   ausgeliefert, KEIN Defekt, 3 Register → 650 px → wäre ROT
      //   Defekt vorhanden,          0 Register → 622 px → wäre GRÜN
      //
      // Der gute Wert liegt ÜBER dem schlechten. Dieselbe Form wie bei der
      // Hero-Naht (CLAUDE.md, 22.08.2026: ausgeliefert 1,180 gegen Defekt
      // 1,178) — es ist die sechste Auflage von „gesetzte Zahl gegen
      // Restbetrag". Gemessen wird deshalb nicht mehr die LAGE des Feeds,
      // sondern das, was die Lage erzeugt: WELCHE Blöcke über ihm stehen.
      //
      // Ein gewachsener Block wird dadurch nicht mehr rot — das ist keine
      // Lücke, sondern die Abgrenzung: Ein Nutzer mit angesetztem Spiel
      // sieht mehr Kopf als einer ohne, und das ist richtiges Verhalten.
      // Ein NEUER Block wird rot, egal wie hoch er ist und egal wie tief
      // jemand ihn einhängt.
      const BEKANNT = [
        "Kopf",
        "Anzeigetafel",
        "Onboarding-Streifen",
        "Wegweiser",
        "Composer",
      ];
      const unbekannt = mess.vorbau.filter((b) => !BEKANNT.includes(b.art));
      expect(
        unbekannt.map((b) => `<${b.tag}> ${b.hoehe}px „${b.text}"`),
        `Oberhalb des Feeds steht ein Block, den dieser Test nicht kennt. ` +
          `Vor dem 18.08.2026 stand hier ein Block aus vier Akkordeon-Kästen, ` +
          `der den ersten Beitrag auf y≈888 gedrückt hat – auf dem Gerät, das ` +
          `der Hauptfall ist. Bekannt und erlaubt sind: ${BEKANNT.join(" · ")}. ` +
          `Ist ein Block dazugekommen, gehört er in diese Liste – und zwar ` +
          `bewusst, mit einem Satz dazu, warum der Feed dafür nach unten rückt.`,
      ).toEqual([]);

      // Gegenrichtung. Ohne sie wäre eine Seite, auf der oberhalb des Feeds
      // GAR NICHTS mehr steht, vollständig grün – der Test hätte dann null
      // unbekannte Blöcke gefunden, weil er null Blöcke gesehen hat.
      const arten = mess.vorbau.map((b) => b.art);
      for (const pflicht of ["Kopf", "Wegweiser", "Composer"]) {
        expect(
          arten,
          `Der Block „${pflicht}" steht nicht mehr über dem Feed. Gesehen: ` +
            `${arten.join(", ") || "nichts"}. Entweder ist er weg, oder er ist ` +
            `unter den Feed gerutscht – beides ist eine Aussage über die Seite, ` +
            `keine Kleinigkeit.`,
        ).toContain(pflicht);
      }
      // Anzeigetafel und Onboarding-Streifen stehen bewusst NICHT in dieser
      // Liste: Beide dürfen datenabhängig fehlen (kein Spiel angesetzt bzw.
      // Checkliste erledigt). Sie hier zu fordern wäre genau der Fehler, den
      // die Pixelschwelle gemacht hat – eine Zusicherung über die Datenbank
      // statt über das Produkt.

      // ── Die eine Höhe, die trotzdem gemessen gehört ─────────────────────
      // Der strukturelle Test oben sagt „kein NEUER Block". Er sagt nichts
      // darüber, ob ein bekannter Block ins Unermessliche wächst. Für den
      // größten und einzigen datengetriebenen Block wird das nachgehalten –
      // und zwar in SEINER Währung, nicht in Seitenkoordinaten: Ein Register
      // ist eine Zeile, also skaliert die Höhe mit der Zahl der Register.
      // Gemessen 22.08.2026: 212 px bei 3 Registern (70,7 je Register),
      // 116 px bei 2 (58,0). Die Grenze 110 ist großzügig, greift aber, wenn
      // sich ein Register verdoppelt. Sie hängt an keiner Datenlage: mit
      // weniger Registern sinkt der Sollwert mit.
      if (mess.tafelRegister > 0) {
        expect(
          mess.tafelHoehe,
          `Die Anzeigetafel ist ${mess.tafelHoehe}px hoch bei ` +
            `${mess.tafelRegister} Registern (${Math.round(
              mess.tafelHoehe / mess.tafelRegister,
            )}px je Register, gemessen waren 58–71). Der Feed rutscht damit ` +
            `nach unten, ohne dass ein neuer Block dazugekommen wäre – der ` +
            `strukturelle Test oben kann das nicht sehen.`,
        ).toBeLessThanOrEqual(110 * mess.tafelRegister);
      }
    });
  }

  test("die alten Akkordeon-Kästen sind nicht zurück", async ({ page, request }) => {
    // ⚠️ Eigener Testfall, weil er etwas anderes prüft als die Messungen oben:
    // Dort geht es um Maße, hier um die Bauform. Vier gleichförmige
    // Aufklapp-Kästen VOR dem Feed waren am 15.08. die Hauptbegründung für den
    // Desktop-Umbau – mobil sind sie erst am 18.08. verschwunden. Wer sie
    // zurückbaut, tut das nicht aus Versehen, aber er soll es merken.
    const token = await anmelden(request);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((t) => {
      localStorage.setItem("playerAuthToken", t);
      sessionStorage.setItem("hg_welcome_token", t);
    }, token);
    await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
    await page.locator('nav[aria-label="Weitere Bereiche"] a').first().waitFor({ timeout: 30_000 });

    const vorDemFeed = await page.evaluate(() => {
      const umschalter = [...document.querySelectorAll("button, a")].find(
        (e) => e.textContent.trim() === "Für dich",
      );
      if (!umschalter) return null;
      const grenze = umschalter.getBoundingClientRect().top + window.scrollY;
      // Aufklappbares erkennt man an der Zustandsangabe für Vorleseprogramme –
      // nicht am Aussehen. Das hält auch, wenn jemand die Optik ändert.
      //
      // ⚠️ NUR innerhalb von `main` suchen. Die Navigationsleiste trägt
      // ebenfalls `aria-expanded` (Menü, Glocke, Suche) – ein Suchlauf über das
      // ganze Dokument meldet drei Treffer ohne Text und wäre falsch rot.
      // Beim Bauen genau so passiert.
      // ⚠️ ZWEI Bauformen, nicht eine. `aria-expanded` tragen nur selbstgebaute
      // Aufklapper (Button + Zustand); ein natives `<details>` hat den Zustand
      // implizit und KEIN Attribut. Der erste Anlauf dieses Tests prüfte nur
      // das Attribut – eine Gegenprobe mit `<details>` lief glatt durch, der
      // Test wäre also gegen die halbe Fehlerklasse blind gewesen.
      const inhalt = document.querySelector("main");
      if (!inhalt) return null;
      return [...inhalt.querySelectorAll("[aria-expanded], details")]
        .filter((e) => e.getBoundingClientRect().top + window.scrollY < grenze)
        .map((e) => e.textContent.trim().slice(0, 30));
    });
    expect(vorDemFeed, "Feed-Umschalter nicht gefunden").not.toBeNull();
    expect(
      vorDemFeed,
      `Vor dem Feed stehen wieder aufklappbare Kästen. Genau die wurden am ` +
        `18.08.2026 entfernt: vier gleichförmige Blöcke, die den ersten Beitrag ` +
        `auf y≈888 gedrückt haben – auf dem Gerät, das der Hauptfall ist.`,
    ).toEqual([]);
  });

  test("Klickziele der Beitragsleiste: größer, ohne die Karte zu strecken", async ({
    page,
    request,
  }) => {
    // ⚠️ Der zweite Teil ist die eigentliche Zusage (Entwurf Vivien, 18.08.2026).
    //
    // Die Knöpfe maßen 29x20 px – unter dem Mindestmaß 24x24 (WCAG 2.5.8 AA).
    // Der Vorschlag vergrößert das ZIEL per Innenabstand und zieht das LAYOUT
    // mit einem gleich großen negativen Außenabstand zurück: Ziel wächst,
    // Kartenhöhe bleibt. Genau diese Zusage („155 → 155") kann später still
    // gebrochen werden – deshalb steht sie hier.
    //
    // ⚠️ Und der Abstand wird mitgemessen, nicht nur die Größe. Beim Bauen war
    // er kurzzeitig **−4 px**: Die Knöpfe ziehen sich je 8 px nach außen, bei
    // einem zu kleinen `gap` überlappen die Ziele und ein Tippen am Rand trifft
    // den falschen Knopf. Bei einem Like geht dann eine Benachrichtigung an
    // einen fremden Menschen raus. Größe allein ist also keine gute Nachricht.
    const token = await anmelden(request);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((t) => {
      localStorage.setItem("playerAuthToken", t);
      sessionStorage.setItem("hg_welcome_token", t);
    }, token);
    await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.body.innerText.includes("Für dich"),
      null,
      { timeout: 30_000 },
    );
    // Auf einen Beitrag mit Aktionsleiste warten – nicht auf eine feste Zeit.
    await page.waitForSelector("main button[aria-pressed]", { timeout: 30_000 });

    // ⚠️ ALLE Aktionsleisten, nicht die erste (Roadmap 38c, 22.08.2026).
    // Bis zum 22.08. griff dieser Fall `querySelector` — also den ersten
    // Beitrag, den das Ranking gerade nach oben spült. Welche Bauform das ist,
    // entscheidet damit die Datenbank, und die beiden Bauformen messen sich
    // unterschiedlich (gemessen: Aktionsleiste 24px im Wort-Beitrag, 33px im
    // Ereignis-Beitrag — beide heil). Ein Fall, der eine von zwei Bauformen
    // per Zufall auswählt, ist genau die Datenabhängigkeit, um die es in
    // dieser Runde geht. Jetzt wird jede Karte im Bild einzeln beurteilt.
    const karten = await page.evaluate(() => {
      const r = (el) => el.getBoundingClientRect();
      const zahl = (s) => parseFloat(s) || 0;
      return [...document.querySelectorAll("main button[aria-pressed]")].map((like) => {
        const zeile = like.parentElement;
        const kommentar = zeile.querySelector("button[aria-expanded]");
        const masse = (el) => {
          const cs = getComputedStyle(el);
          return {
            h: Math.round(r(el).height),
            w: Math.round(r(el).width),
            // Der Kniff in seinen eigenen Größen: Innenabstand macht das Ziel
            // groß, ein gleich großer NEGATIVER Außenabstand zieht das Layout
            // zurück. `getComputedStyle` liest, was der Browser am Ende
            // wirklich anwendet – nicht, was eine Klasse behauptet.
            pt: zahl(cs.paddingTop), pb: zahl(cs.paddingBottom),
            mt: zahl(cs.marginTop), mb: zahl(cs.marginBottom),
          };
        };
        return {
          like: masse(like),
          kommentar: kommentar ? masse(kommentar) : null,
          abstand: kommentar ? Math.round(r(kommentar).left - r(like).right) : null,
          zeileH: Math.round(r(zeile).height),
          vorleseLike: like.textContent.replace(/\s+/g, " ").trim(),
          vorleseKommentar: kommentar?.textContent.replace(/\s+/g, " ").trim() || "",
        };
      });
    });

    expect(
      karten.length,
      `Keine einzige Aktionsleiste im Feed – dann prüft dieser Fall nichts.`,
    ).toBeGreaterThan(0);

    // Die Aussagen, die für JEDE Karte gelten müssen, an der ERSTEN Karte
    // ausgewertet und danach für alle wiederholt. `m` bleibt als Name stehen,
    // damit die Meldungen unten unverändert lesbar sind.
    const m = karten[0];
    expect(m.kommentar, "Kein Kommentar-Knopf in der Aktionsleiste gefunden").not.toBeNull();

    // 24 ist die Norm (AA). Geprüft wird gegen 30, damit eine stille
    // Rückstufung auffällt, nicht erst der Bruch der Mindestnorm.
    // Über ALLE Karten, nicht nur die erste – der Rest der Schleife ebenso.
    for (const [i, k] of karten.entries()) {
      const wo = `Karte ${i + 1} von ${karten.length} („${k.vorleseLike.slice(0, 24)}")`;
      expect(k.kommentar, `${wo}: kein Kommentar-Knopf in der Aktionsleiste`).not.toBeNull();

      for (const [name, z] of [["Like", k.like], ["Kommentar", k.kommentar]]) {
        expect(
          z.h,
          `${wo}: ${name}-Knopf ist ${z.h}px hoch. Vor dem 18.08.2026 waren es ` +
            `20px – unter dem WCAG-Mindestmaß von 24. Wurde der Innenabstand ` +
            `entfernt?`,
        ).toBeGreaterThanOrEqual(30);
        expect(z.w, `${wo}: ${name}-Knopf ist nur ${z.w}px breit.`).toBeGreaterThanOrEqual(24);
      }

      expect(
        k.abstand,
        `${wo}: Die beiden Klickziele überlappen sich (${k.abstand}px). Ein ` +
          `Tippen am Rand trifft dann den falschen Knopf – und ein Like ` +
          `verschickt eine Benachrichtigung an einen echten Menschen. Ursache ` +
          `ist fast immer ein zu kleines \`gap\` in der Aktionsleiste: die ` +
          `Knöpfe ziehen sich je 6px nach außen, es braucht also genug \`gap\`.`,
      ).toBeGreaterThan(0);
    }

    // ═════════════════════════════════════════════════════════════════════
    // DIE ZUSAGE: das Ziel wächst, das Layout bleibt stehen.
    //
    // ⚠️ HIER STAND EINE ZAHL, DIE VON DEN DATEN ABHING — mein eigener Fehler
    // aus dem Gate vom 18.08.2026, aufgefallen am 22.08.2026 nach einem
    // frischen `node scripts/seed-demo.mjs` (Roadmap 38, Anstoß Tobias).
    //
    // Sie hieß `karteH <= 160` und sollte heißen „die Karte wird nicht
    // gestreckt". Gemessen (390px, alle Karten im Bild, mit und ohne den
    // negativen Außenabstand):
    //
    //   Kartenhöhe ausgeliefert:  146px (kurzer Text) … 170px (langer Text)
    //   Kartenhöhe im Defekt:     158px              … 182px
    //
    // Die Schwankung ALLEIN DURCH DEN BEITRAGSTEXT ist 24px, der Defekt kostet
    // 12. Eine defekte Karte mit kurzem Text (158) wäre GRÜN gewesen, eine
    // heile mit langem Text (170) ROT — der gute Wert liegt über dem
    // schlechten. Dieselbe Form wie die entfallene Pixelschwelle weiter oben
    // in dieser Datei und wie die Hero-Naht in CLAUDE.md.
    //
    // ⚠️ UND MEIN ERSTER ERSATZ WAR AUCH FALSCH — er ist nur nicht in die
    // Übergabe gekommen, weil die Messung ihn vorher erwischt hat. Er lautete
    // „die Aktionsleiste ist niedriger als der Knopf darin" und stimmte für
    // den Wort-Beitrag (Zeile 24, Knopf 32). Es gibt aber ZWEI Bauformen, und
    // im Ereignis-Beitrag steht neben den Knöpfen ein höheres Element:
    //
    //                      ausgeliefert   ohne negativen Außenabstand
    //   Wort-Beitrag       Zeile 24        36
    //   Ereignis-Beitrag   Zeile 33        45
    //
    // 33 > 32 — der Ersatz wäre auf jedem Ergebnis-Beitrag falsch rot gewesen.
    // Welche Bauform ein Test sieht, entscheidet das Ranking, also die
    // Datenbank: Ich hätte eine Datenabhängigkeit durch eine andere ersetzt.
    //
    // Was in BEIDEN Bauformen gilt, ist der Kniff selbst, und er steht in
    // seinen eigenen Größen: Der Innenabstand macht das Ziel groß, ein GLEICH
    // GROSSER negativer Außenabstand zieht das Layout um genau diesen Betrag
    // zurück (gemessen: padding 6px, margin −6px, oben wie unten; die 12px
    // Unterschied in der Tabelle sind exakt diese zweimal 6). Das hängt an
    // keiner Textlänge, an keiner Bauform, an keinem Datenstand.
    //
    // Gelesen wird mit `getComputedStyle` — also das, was der Browser am Ende
    // wirklich anwendet, nicht das, was eine Klasse behauptet. Das ist
    // derselbe Anspruch wie im Kopf dieser Datei („behaupten und messen sind
    // zweierlei"): Eine Klasse kann von einer späteren Regel überschrieben
    // werden, der berechnete Wert nicht.
    //
    // Gegenprobe gefahren (Außenabstand per Stylesheet auf 0 gesetzt):
    // rot auf ALLEN Karten, in beiden Bauformen.
    for (const [i, k] of karten.entries()) {
      const wo = `Karte ${i + 1} von ${karten.length} („${k.vorleseLike.slice(0, 24)}")`;
      for (const [name, z] of [["Like", k.like], ["Kommentar", k.kommentar]]) {
        expect(
          z.pt,
          `${wo}: Der ${name}-Knopf hat oben gar keinen Innenabstand. Genau der ` +
            `macht aus einem 20px-Symbol ein tippbares Ziel.`,
        ).toBeGreaterThan(0);
        expect(
          { oben: z.mt, unten: z.mb },
          `${wo}: Der ${name}-Knopf hat einen Innenabstand von ${z.pt}/${z.pb}px ` +
            `(oben/unten), aber einen Außenabstand von ${z.mt}/${z.mb}px. Der ` +
            `Kniff dieser Leiste ist, dass beide sich aufheben: Der Innenabstand ` +
            `vergrößert das Tippziel, ein gleich großer NEGATIVER Außenabstand ` +
            `zieht das Layout zurück. Heben sie sich nicht auf, wächst jeder ` +
            `einzelne Beitrag im Feed – bei −0px um ${z.pt + z.pb}px.`,
        ).toEqual({ oben: -z.pt, unten: -z.pb });
      }
    }

    // Vorleseprogramme: die Zahl allein ist keine Information.
    expect(
      m.vorleseLike,
      `Der Like-Knopf sagt Vorleseprogrammen „${m.vorleseLike}" – die nackte ` +
        `Zahl ohne Wort. Erwartet wird eine Beschriftung IM Knopf.`,
    ).toMatch(/gefällt mir/i);
    expect(m.vorleseKommentar, `Kommentar-Knopf ohne Beschriftung.`).toMatch(/kommentar/i);
  });
});
