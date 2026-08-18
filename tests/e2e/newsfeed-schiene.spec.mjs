// Die rechte Schiene im Newsfeed darf keinen Teil ihres Inhalts verstecken.
//
// BEFUND (Patrick, 18.08.2026): Sie stand als blankes `lg:sticky lg:top-24`
// ohne Höhenbegrenzung. Gemessen war sie 1088 px hoch, unter der Haftkante
// lagen aber nur 624–804 px. Ein Element, das oben festklebt und höher als das
// Fenster ist, kann seinen unteren Teil NIE zeigen – Scrollen bewegt es ja
// gerade nicht mehr. Betroffen: „Folgen" und das Ende von „Tabelle", auf
// KEINEM Desktop erreichbar. Und es gab keine Fehlermeldung: Es ging nichts
// kaputt, es fehlte nur etwas.
//
// ⚠️ ZWEI FALLEN, DIE DIESER TEST SELBST HAT (beide beim Bauen aufgetreten):
//
// (1) REIHENFOLGE. `position: sticky` heftet erst, wenn die Seite gescrollt
//     ist. Wer sofort nach dem Laden misst, misst die natürliche Lage der
//     Schiene – die ragt unten aus dem Bild, und der Test wird rot, obwohl
//     alles stimmt. Erst scrollen, dann messen.
//
// (2) LEERLAUF. Passt die Schiene zufällig ins Fenster (wenige Widgets, hohes
//     Fenster), ist der Test grün, ohne irgendetwas geprüft zu haben – genau
//     das Muster „grüner Test mit null Messframes" aus Roadmap 20f. Deshalb
//     die Schranke unten: Der Inhalt MUSS höher sein als der Platz, sonst
//     schlägt der Test mit einer Erklärung fehl statt still durchzuwinken.
import { test, expect } from "@playwright/test";

// Vier reale Desktop-Formate. 1280×720 ist der engste Fall (nur 624 px Platz),
// 1024×768 der schmalste, auf dem das Zweispalten-Layout überhaupt greift.
// ⚠️ BEIDE FÄLLE MÜSSEN VORKOMMEN (Umbau 18.08.2026).
// Seit „Basketball-News" aus der Schiene entfernt ist (378 px), passt sie auf
// normalen Fensterhöhen vollständig hinein – der alte Test konnte seinen Fall
// gar nicht mehr erzeugen und hat das über seine Ehrlichkeitsschranke auch
// gemeldet („572px Inhalt, 574px Platz. Dann prüft dieser Test NICHTS").
// Deshalb jetzt zwei Sorten Fenster: hohe, in denen alles hineinpasst, und
// flache, in denen es überläuft. Eine Prüfmatrix mit nur einer Sorte prüft nur
// eine Richtung – dieselbe Lehre wie die fehlende Höhenachse in Roadmap 20b.
const GROESSEN = [
  { breite: 1440, hoehe: 900 },
  { breite: 1280, hoehe: 800 },
  { breite: 1280, hoehe: 600 },
  { breite: 1024, hoehe: 560 },
];

test.describe("Newsfeed – die rechte Schiene versteckt nichts", () => {
  for (const { breite, hoehe } of GROESSEN) {
    test(`${breite}x${hoehe}: jeder Abschnitt der Schiene ist erreichbar`, async ({
      page,
      request,
    }) => {
      const res = await request.post("/api/player/playerlogin", {
        data: { email: "max@test.de", password: "test123" },
      });
      const j = await res.json().catch(() => ({}));
      const token = j?.data?.token || j?.token;
      expect(
        typeof token === "string" && token.length > 20,
        `Kein Token erhalten – ohne Anmeldung gibt es keinen Desktop-Newsfeed ` +
          `und dieser Test prüft nichts. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
      ).toBe(true);

      await page.setViewportSize({ width: breite, height: hoehe });
      await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), token);

      // ⚠️ DIE EXTERNE QUELLE MUSS RAUS, SONST IST DER TEST EIN MÜNZWURF.
      // Der unterste Abschnitt der Schiene („Basketball-News") hängt an einem
      // fremden RSS-Feed. Kommt der nicht, ist die Schiene ~658 statt ~1086 px
      // hoch – dann passt sie ins Fenster, der Fall existiert nicht mehr, und
      // die Ehrlichkeitsschranke unten schlägt zu Recht fehl. Genau so im
      // vollen Suite-Lauf am 18.08.2026 passiert: 230 grün, dieser eine rot,
      // ohne dass am Produkt etwas war.
      // Feste Antwort ⇒ feste Schienenhöhe ⇒ der Test misst das, was er soll.
      await page.route("**/api/news/rss", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            // ⚠️ Die Titel sind bewusst LANG. Ein erster Anlauf mit kurzen
            // Testtiteln machte den Abschnitt einzeilig, die Schiene damit
            // ~780 statt ~1086 px – und auf 1440x900 (788 px Platz) passte sie
            // dann hinein, sodass der Test dort nichts mehr prüfen konnte.
            // Echte Schlagzeilen dieses Feeds sind zweizeilig; die Testdaten
            // müssen die reale Höhe erzeugen, nicht nur reale Felder haben.
            news: Array.from({ length: 5 }, (_, i) => ({
              title:
                `DBB ${i + 1}: Nationalspieler fraglich für Supercup und ` +
                `WM-Qualifikation, Basketball – Basketball-World | News`,
              link: `https://example.invalid/${i + 1}`,
              pubDate: "Mon, 18 Aug 2026 08:00:00 GMT",
              source: "Test",
            })),
          }),
        }),
      );

      await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });

      // Auf die Schiene warten – NICHT auf einen einzelnen Abschnitt.
      // (Der frühere unterste Abschnitt „Basketball-News" hing an einem
      // externen RSS-Abruf; er ist seit dem 18.08.2026 entfernt, aber die
      // Regel bleibt richtig.)
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("main *")].some(
            (e) => getComputedStyle(e).position === "sticky",
          ),
        { timeout: 30_000 },
      );
      // ⚠️ Die Schiene WÄCHST NACH (Widgets laden). Misst man zu früh, ist sie
      // niedriger als am Ende
      // – und dann passt sie zufällig ins Fenster, der Test prüft nichts, und
      // die Schranke unten schlägt (zu Recht) fehl. Beim Bauen genau so
      // passiert, auf zwei von vier Größen.
      // Deshalb: DREI aufeinanderfolgende gleiche Messungen, nicht zwei.
      await page.waitForFunction(
        () => {
          const el = [...document.querySelectorAll("main *")].find(
            (e) => getComputedStyle(e).position === "sticky",
          );
          if (!el) return false;
          const jetzt = el.scrollHeight;
          if (jetzt <= 0) return false;
          const spur = (window.__schienenSpur = window.__schienenSpur || []);
          spur.push(jetzt);
          if (spur.length > 3) spur.shift();
          return spur.length === 3 && spur[0] === spur[1] && spur[1] === spur[2];
        },
        { timeout: 30_000, polling: 600 },
      );

      const mess = await page.evaluate(async () => {
        const schiene = () =>
          [...document.querySelectorAll("main *")].find(
            (e) => getComputedStyle(e).position === "sticky",
          );
        const warte = () =>
          new Promise((f) => requestAnimationFrame(() => requestAnimationFrame(f)));

        const haftkante = parseInt(getComputedStyle(schiene()).top) || 0;

        // Falle (1): erst scrollen, damit `sticky` überhaupt greift.
        let versuche = 0;
        while (
          versuche++ < 40 &&
          Math.round(schiene().getBoundingClientRect().top) > haftkante
        ) {
          window.scrollBy(0, 200);
          await warte();
        }

        const el = schiene();
        const vorScroll = el.getBoundingClientRect();

        // In der Schiene ans Ende – die Bewegung, die ein Mensch macht, wenn er
        // den untersten Abschnitt sehen will. Mehrfach, denn wenn zwischen zwei
        // Frames noch etwas nachlädt, ist `scrollTop` von eben schon veraltet
        // und der letzte Abschnitt steht wieder unterhalb der Kante.
        for (let i = 0; i < 5; i++) {
          el.scrollTop = el.scrollHeight;
          await warte();
          if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) break;
        }

        const r = el.getBoundingClientRect();
        const letzter = el.lastElementChild;
        const l = letzter.getBoundingClientRect();

        return {
          haftkante,
          angeheftet: Math.round(vorScroll.top) <= haftkante + 1,
          schieneUnten: Math.round(r.bottom),
          schieneOben: Math.round(r.top),
          sichtbareHoehe: Math.round(r.height),
          inhaltsHoehe: el.scrollHeight,
          fensterHoehe: window.innerHeight,
          letzterLabel: letzter.querySelector("h3")?.textContent?.trim() || "(ohne Label)",
          letzterOben: Math.round(l.top),
          letzterUnten: Math.round(l.bottom),
          anzahlAbschnitte: el.children.length,
          schieneMitteX: r.x + r.width / 2,
          radiusUnten: getComputedStyle(el).borderBottomLeftRadius,
          rahmenUnten: getComputedStyle(el).borderBottomWidth,
          rahmenFarbe: getComputedStyle(el).borderBottomColor,
          overscroll: getComputedStyle(el).overscrollBehaviorY,
        };
      });

      // ── Ehrlichkeitsschranke (Falle 2) ────────────────────────────────────
      expect(
        mess.angeheftet,
        `Die Schiene hat nie an ihrer Haftkante (${mess.haftkante}px) angedockt – ` +
          `der Test hat den geprüften Zustand gar nicht erreicht.`,
      ).toBe(true);
      expect(
        mess.anzahlAbschnitte >= 3,
        `Nur ${mess.anzahlAbschnitte} Abschnitt(e) in der Schiene – zu wenig, ` +
          `um den Fall überhaupt zu erzeugen. Der Test würde blind grün.`,
      ).toBe(true);
      // ⚠️ KEINE Schranke „Inhalt muss größer als Platz sein" mehr. Beide
      // Zustände sind jetzt gültig und werden beide geprüft – siehe unten.

      // ── Die eigentlichen Zusicherungen ────────────────────────────────────
      // ── Viviens Prüfmaß: Die Kante sagt die Wahrheit ────────────────────
      // Eine Schiene mit sichtbarer Unterkante ENDET. Solange Inhalt dahinter
      // liegt, ist das eine Falschaussage in Form einer Linie – im Sinne des
      // Codes richtig, im Sinne des Betrachters falsch (dieselbe Familie wie
      // `docs/MUSTER-ZAHLEN-DIE-LUEGEN`). Deshalb: Anschnitt genau dann, wenn
      // etwas verborgen ist. BEIDE Richtungen, denn ein fehlender Anschnitt
      // wirft keinen Fehler – er fehlt nur.
      const laeuftUeber = mess.inhaltsHoehe > mess.sichtbareHoehe + 1;
      // ⚠️ GEPRÜFT WIRD SICHTBARKEIT, NICHT BREITE (nachgezogen 18.08.2026).
      //
      // Die erste Umsetzung schaltete die Rahmen-BREITE ab (`border-b-0`) –
      // und genau daran hing eine Endlosschleife: Der 1-px-Rahmen ist Teil der
      // Höhe, die gemessen wird, also veränderte die Reaktion ihre eigene
      // Messgröße (Befund Kai B1, von Tobias mit einer Bildfolge belegt).
      // Jetzt bleibt die Breite stehen und nur die FARBE wird durchsichtig.
      //
      // Dieser Test hat den Wechsel korrekt bemerkt und ist rot geworden – die
      // Umsetzung war geändert, die Prüfung nicht. Er fragt jetzt nach dem, was
      // ein Mensch sieht: Ist unten eine Linie zu SEHEN? Damit ist er
      // gleichzeitig unabhängig davon, mit welchem Mittel sie verschwindet.
      const linieSichtbar =
        mess.rahmenUnten !== "0px" && !/rgba\(0, 0, 0, 0\)|transparent/.test(mess.rahmenFarbe);

      if (laeuftUeber) {
        expect(
          mess.radiusUnten === "0px" && !linieSichtbar,
          `Die Schiene verbirgt ${mess.inhaltsHoehe - mess.sichtbareHoehe}px Inhalt, ` +
            `zeichnet unten aber weiter einen Abschluss (Radius ${mess.radiusUnten}, ` +
            `Rahmen ${mess.rahmenUnten} in ${mess.rahmenFarbe}). Die Form behauptet ` +
            `„hier ist Schluss", während es weitergeht.`,
        ).toBe(true);
      } else {
        expect(
          mess.radiusUnten !== "0px" && linieSichtbar,
          `Es ist nichts verborgen, die Schiene ist unten trotzdem angeschnitten ` +
            `(Radius ${mess.radiusUnten}, Rahmen ${mess.rahmenUnten} in ` +
            `${mess.rahmenFarbe}). Dann behauptet der Anschnitt seinerseits etwas ` +
            `Falsches: „hier geht es weiter", obwohl alles zu sehen ist.`,
        ).toBe(true);
      }

      expect(
        mess.schieneUnten <= mess.fensterHoehe + 1,
        `Die Schiene ragt unten aus dem Fenster: Unterkante ${mess.schieneUnten}px ` +
          `bei ${mess.fensterHoehe}px Fensterhöhe. Genau ${mess.schieneUnten - mess.fensterHoehe}px ` +
          `sind dann unerreichbar, weil ein angeheftetes Element nicht mitscrollt.`,
      ).toBe(true);

      expect(
        mess.letzterOben >= mess.schieneOben - 1 &&
          mess.letzterUnten <= Math.min(mess.fensterHoehe, mess.schieneUnten) + 1,
        `Der unterste Abschnitt „${mess.letzterLabel}" ist nicht vollständig sichtbar, ` +
          `obwohl in der Schiene ganz nach unten gescrollt wurde: ` +
          `Abschnitt ${mess.letzterOben}–${mess.letzterUnten}, ` +
          `Schiene ${mess.schieneOben}–${mess.schieneUnten}, Fenster 0–${mess.fensterHoehe}.`,
      ).toBe(true);

      // ── Die Schiene darf die Seite nicht festhalten ───────────────────────
      // ⚠️ WOFÜR DIESE PRÜFUNG DA IST (Befund Tobias, Gate 18.08.2026):
      // Der erste Anlauf des Fixes setzte zusätzlich `overscroll-contain`.
      // Folge: Stand der Mauszeiger über der Schiene, ließ sich die SEITE mit
      // dem Rad überhaupt nicht mehr bewegen, sobald die Schiene an ihrem Ende
      // war – eine tote Fläche über rund einem Drittel der Bildbreite, ohne
      // jede Rückmeldung. In Chromium und WebKit reproduziert, in Firefox
      // nicht. Der Test war dabei grün, weil er nur Sichtbarkeit prüfte.
      //
      // ⚠️ WARUM HIER DIE EIGENSCHAFT GEPRÜFT WIRD UND NICHT DAS VERHALTEN –
      // ehrlich, weil es eine echte Schwäche ist:
      // Ein Test, der das Mausrad simuliert (`page.mouse.wheel`), war hier
      // NICHT stabil zu bekommen. Dieselbe Abfolge lief außerhalb der
      // Testumgebung sauber durch (Seite 400 → 1344), im Test blieb sie bei
      // 400 stehen – bei nachweislich korrektem `overscroll-behavior: auto`.
      // Ein Test, der bei gesundem Produkt rot meldet, ist schlimmer als
      // keiner: Er wird nach dem zweiten Mal ignoriert. Deshalb prüfen wir die
      // URSACHE statt der Wirkung.
      // GRENZE: Das fängt die konkrete Regression (`contain` kommt zurück),
      // aber keine andere denkbare Ursache für eine tote Scrollfläche. Wer die
      // Verhaltensprüfung stabil hinbekommt, sollte sie ergänzen.
      expect(
        mess.overscroll !== "contain" && mess.overscroll !== "none",
        `Die Schiene hat \`overscroll-behavior-y: ${mess.overscroll}\`. Damit ` +
          `hält sie das Mausrad fest: Steht der Zeiger über ihr und ist sie am ` +
          `Ende, lässt sich die Seite nicht mehr scrollen (Chromium und WebKit; ` +
          `Firefox verhält sich anders). Das war der Befund aus dem Gate vom ` +
          `18.08.2026 und ein Rückschritt gegenüber dem Stand davor. ` +
          `Der erwünschte Effekt – erst die Schiene zu Ende rollen, Seite bleibt ` +
          `stehen – tritt in allen drei Browsern auch mit "auto" ein; die ` +
          `Eigenschaft hat hier also keinen Nutzen und einen Preis. ` +
          `Begründung samt Messwerten steht im Kopf von components/feed/Schiene.js.`,
      ).toBe(true);
    });
  }

  test("die Unterkante flackert nicht", async ({ page, request }) => {
    // ⚠️ DER TEST ZUM SCHWERSTEN BEFUND DIESES GATES (Kai B1, Tobias B2).
    //
    // Die erste Umsetzung schaltete die Rahmen-BREITE ab. Der Rahmen ist 1 px
    // hoch und damit Teil der Höhe, die gemessen wird: Abschalten machte den
    // Innenbereich um genau diesen Pixel größer, die Antwort kippte, der Rahmen
    // kam zurück – und das in jedem Bild. Gemessen 120 Wechsel pro Sekunde,
    // ohne Ende, bei genau einer Fensterhöhe. Tobias hat es mit einer echten
    // Bildfolge belegt: 150 Bilder, zwei Zustände, streng abwechselnd.
    //
    // ⚠️ Der Sichtbarkeits-Test oben fängt das NICHT – er prüft den Endzustand,
    // nicht die Unruhe. Und ein Rückfall auf `border-b-0` sähe dort korrekt aus
    // (0 px ist ebenfalls unsichtbar). Deshalb dieser eigene Fall.
    //
    // ⚠️ Der Sprung muss DIREKT erfolgen. Schrittweises Verkleinern verdeckt den
    // Fehler – dann bleibt es ruhig, aber in der falschen Stellung (Tobias).
    const res = await request.post("/api/player/playerlogin", {
      data: { email: "max@test.de", password: "test123" },
    });
    const j = await res.json().catch(() => ({}));
    const token = j?.data?.token || j?.token;
    expect(typeof token === "string" && token.length > 20, "Kein Token").toBe(true);

    await page.addInitScript((t) => localStorage.setItem("playerAuthToken", t), token);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/player/newsfeed", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => [...document.querySelectorAll("main *")].some((e) => getComputedStyle(e).position === "sticky"),
      { timeout: 30_000 },
    );
    await page.waitForTimeout(3500);

    // Die kritische Höhe zur Laufzeit rechnen: Sie hängt am Inhalt und liegt
    // deshalb pro Konto woanders. Eine feste Zahl wäre morgen falsch.
    const inhalt = await page.evaluate(() => {
      const el = [...document.querySelectorAll("main *")].find(
        (e) => getComputedStyle(e).position === "sticky",
      );
      return { hoehe: el.scrollHeight, haftkante: parseInt(getComputedStyle(el).top) || 0 };
    });
    // ⚠️ Der Kipppunkt liegt bei Inhalt + Haftkante – nachgemessen, nicht
    // hergeleitet. Dort sind genau 2 px verborgen: die 1-px-Toleranz plus den
    // 1-px-Rahmen, den die alte Umsetzung wegschaltete. Ein erster Anlauf
    // rechnete „minus 2" und traf 4 px verborgenen Rest – dort flackert nichts,
    // und die Gegenprobe lief grün durch, obwohl der Fehler wieder eingebaut
    // war. Wer die Formel ändert, muss die Gegenprobe wiederholen.
    const kritisch = inhalt.hoehe + inhalt.haftkante;

    await page.setViewportSize({ width: 1280, height: kritisch });
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(400);

    const r = await page.evaluate(
      () =>
        new Promise((fertig) => {
          const el = [...document.querySelectorAll("main *")].find(
            (e) => getComputedStyle(e).position === "sticky",
          );
          let wechsel = 0,
            bilder = 0,
            vorher = el.className;
          const start = performance.now();
          const tick = () => {
            bilder++;
            if (el.className !== vorher) {
              wechsel++;
              vorher = el.className;
            }
            if (performance.now() - start < 1200) requestAnimationFrame(tick);
            else fertig({ wechsel, bilder, verborgen: el.scrollHeight - el.clientHeight });
          };
          requestAnimationFrame(tick);
        }),
    );

    // Ehrlichkeitsschranken: ohne Überlauf und ohne Bilder misst der Test nichts.
    expect(
      r.verborgen,
      `Bei der berechneten Fensterhöhe (${kritisch}px) ist nichts verborgen – ` +
        `dann kann der Kipppunkt gar nicht auftreten und dieser Test prüft nichts. ` +
        `Vermutlich ist die Schiene kürzer geworden.`,
    ).toBeGreaterThan(0);
    expect(
      r.bilder,
      `Nur ${r.bilder} Bilder gemessen – die Sonde lief nicht. Ein Ergebnis ` +
        `daraus wäre bedeutungslos, nicht grün.`,
    ).toBeGreaterThan(20);

    expect(
      r.wechsel,
      `Die Unterkante hat in 1,2 s ${r.wechsel}-mal ihren Zustand gewechselt ` +
        `(${r.bilder} Bilder, ${r.verborgen}px verborgen). Das ist die ` +
        `Endlosschleife aus dem Gate vom 18.08.2026: Die Messung verändert ihre ` +
        `eigene Stellgröße. Fast sicher wurde wieder die Rahmen-BREITE ` +
        `abgeschaltet (\`border-b-0\`) statt nur die Farbe durchsichtig zu machen.`,
    ).toBeLessThanOrEqual(1);
  });
});
