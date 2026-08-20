// Kein Text darf über den Bildschirmrand hinausragen.
//
// ⚠️ WARUM DIESER TEST EXISTIERT — und warum er nicht „noch eine Prüfung" ist,
// sondern die Reparatur eines BLINDFLECKS (Befund Patrick, 18.08.2026):
//
// Patrick hat auf seinem eigenen Telefon fotografiert, dass die Überschrift der
// Startseite beidseitig abgeschnitten ist („E SAISON, SECHS SPIELZU"). Meine
// mobilen Tests hatten am selben Tag mehrfach „kein Querscrollen auf 360 px"
// gemeldet — und beides stimmt gleichzeitig.
//
// Der Grund ist der Kern dieser Datei:
//
//     `document.documentElement.scrollWidth > window.innerWidth` prüft, ob die
//     SEITE zu breit ist. Abgeschnittener Text macht die Seite aber NICHT
//     breiter — er wird geclippt. Die Prüfung war im Sinne des Codes richtig
//     und im Sinne des Lesers wertlos.
//
// Gemessen wurde deshalb ab jetzt die GEZEICHNETE Fläche jedes Textelements
// gegen den Bildschirmrand. Das ist die Frage, die ein Mensch stellt: „sehe ich
// den ganzen Satz?" — nicht „hat das Dokument die richtige Breite?".
//
// Das gehört zu `docs/MUSTER-ZAHLEN-DIE-LUEGEN-2026-08-13.md`: eine Messung,
// die im Sinne des Codes stimmt und im Sinne des Lesers falsch ist.
import { test, expect } from "@playwright/test";

// 360 px ist die verbreitetste Android-Breite Deutschlands (CLAUDE.md,
// Roadmap 20d), 390 das iPhone-Maß. Wer hier durchkommt, kommt überall durch.
const BREITEN = [360, 390];

const SEITEN = [
  "/",
  "/rangliste",
  "/spieler",
  "/teams",
  "/ligen",
  "/spiele",
  "/topscorer",
  "/transfermarkt",
  "/tryouts",
  "/about",
  "/impressum",
  "/datenschutz",
  "/kontakt",
  "/feedback",
  "/login",
  "/signup",
];

// ⚠️ BEKANNTE BAUSTELLEN — bewusst hier und nicht stillschweigend ausgenommen.
//
// Diese Seiten haben beim Anlegen des Tests (18.08.2026) bereits abgeschnittenen
// Text. Sie stehen NICHT in `SEITEN`, sondern hier, mit Zahl und Zuständigkeit.
// Zwei Gründe für diese Form statt einer stillen Ausnahmeliste:
//   1. Der Test wäre sonst ab Tag eins rot und würde nach zweimal ignoriert.
//   2. Eine Zahl, die hier steht, ist überprüfbar. „Ausnahme" ist es nicht.
//
// ⚠️ Der Test unten prüft die Zahl in BEIDE Richtungen: Werden es mehr, ist es
// eine Regression. Werden es weniger, ist die Liste veraltet und muss gepflegt
// werden — sonst verrottet sie zu einem Feigenblatt.
// ⚠️ LEER – und das ist das Ziel dieser Liste.
// Beim Anlegen stand hier die Startseite („Eine Saison, sechs Spielzüge",
// 510 px Zeile bei 360 px Fenster). Vivien hat sie noch am selben Tag
// entschieden, die Untergrenze der Schriftgröße ist von 3rem auf 2rem
// gesenkt – der Eintrag ist gestrichen und `/` steht wieder in `SEITEN`,
// also in der scharfen Prüfung. Genau so war es vorgesehen: Eine Baustelle
// verschwindet, sie wird nicht dauerhaft geduldet.
const BAUSTELLEN = [];

// ⚠️ `/rangliste` steht jetzt in der scharfen Prüfung – anders als in der
// ersten Fassung. Dort war sie als „88 Funde, lokal nicht auslösbar" geführt;
// beides war falsch: Die 88 sind erreichbar (wischbarer Behälter, s. o.), und
// mit der Erreichbarkeitsprüfung meldet die Seite nichts mehr. Der Test ist
// dadurch strenger geworden, nicht schwächer.

// Liest alle Textelemente, deren gezeichnete Fläche über den Rand ragt.
async function abgeschnitten(page) {
  return page.evaluate(() => {
    const funde = [];
    // `select` ergänzt (Befund Vivien): Auf /spieler wird „Alle Positionen &
    // Rollen" HART um 8 px beschnitten – `text-overflow: clip`, kein „…",
    // also ohne jeden Hinweis. Genau der Fall, für den der Test da ist.
    const auswahl = "h1,h2,h3,h4,h5,p,span,a,button,li,td,th,label,strong,em,select,option";
    for (const el of document.querySelectorAll(auswahl)) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;

      // ZWEI Arten, wie Text verschwindet – die zweite fehlte im ersten Anlauf
      // und wurde erst durch die eigene Gegenprobe sichtbar:
      //
      // (a) DER KASTEN ragt über den Rand. So verschwindet die Überschrift der
      //     Startseite: Sie ist `inline-block`, wächst also mit ihrem Text und
      //     schiebt sich beidseitig aus dem Bild.
      //
      // (b) DER INHALT quillt aus einem Kasten, der brav im Bild bleibt. So
      //     verschwindet Text in einem Absatz oder einer Tabellenzelle: Ein
      //     Block-Element bleibt so breit wie sein Container, `nowrap` oder ein
      //     langes Wort laufen trotzdem über die Kante.
      //
      // Beim Bauen habe ich (b) übersehen und die eigene Gegenprobe für
      // wirkungslos gehalten – tatsächlich war der TEST blind, nicht die
      // Gegenprobe. Wieder: eine Gegenprobe, die durchläuft, ist ein Befund am
      // Test.
      const st = getComputedStyle(el);
      const kastenRagt = b.left < -1 || b.right > window.innerWidth + 1;
      const inhaltQuillt = el.scrollWidth > el.clientWidth + 1;
      if (!kastenRagt && !inhaltQuillt) continue;

      // ⚠️ ÜBER DEN RAND RAGEN IST NICHT DASSELBE WIE VERLOREN SEIN
      // (Befund Vivien, 18.08.2026 – ein Fehlalarm in der ersten Fassung).
      //
      // Der erste Anlauf meldete 88 Funde auf `/rangliste` und ich habe sie als
      // Befund weitergegeben. Vivien hat nachgemessen: Alle 88 liegen in einem
      // waagerecht WISCHBAREN Behälter (`components/ui/ScrollTable.js`, 414 px
      // Inhalt in 326 px Fenster, mit stehender Namensspalte und Verlaufskante).
      // Der Nutzer erreicht jede Zahl – dafür wurde der Behälter gebaut.
      //
      // Der Unterschied ist ERREICHBARKEIT, und genau den konnte die Messung
      // nicht sehen: Sie verglich Kästen mit Bildschirmrändern und nannte alles
      // „abgeschnitten". Eine Prüfung, die im Sinne der Geometrie recht hat und
      // im Sinne des Lesers falsch liegt – dieselbe Familie wie der Blindfleck,
      // den dieser Test überhaupt erst schließen soll.
      //
      // Deshalb: Wer in einem scrollbaren Vorfahren sitzt, ist kein Befund.
      // Hart weggeschnitten (`overflow: hidden`/`clip`) ist er sehr wohl einer.
      let erreichbar = false;
      for (let v = el.parentElement; v && v !== document.body; v = v.parentElement) {
        const vs = getComputedStyle(v);
        const rollbar = /(auto|scroll)/.test(vs.overflowX);
        if (rollbar && v.scrollWidth > v.clientWidth + 1) {
          erreichbar = true;
          break;
        }
      }
      if (erreichbar) continue;

      // ⚠️ EINE GEWOLLTE KÜRZUNG MIT „…" IST KEIN BEFUND (Entscheidung Vivien,
      // 18.08.2026; sichtbar geworden durch Kais Gate).
      //
      // Seit die Wartelogik repariert ist, sieht dieser Test erstmals echten
      // Inhalt – und meldete sofort drei Stellen mit `truncate`
      // („Hamburg Towers Uni…", „Jonatan Baena Vi…"). Das ist NICHT der Fehler,
      // für den er gebaut wurde.
      //
      // Viviens Unterscheidung: Eine Ellipse ist kein Verlust, sondern ein
      // VERSPRECHEN – „hier steht mehr, du kommst dran". Ein harter Schnitt
      // ohne „…" sagt dem Leser nicht einmal, dass etwas fehlt. Genau das ist
      // der Unterschied, den dieser Test abbilden soll.
      //
      // ⚠️ Das Versprechen zählt nur, wenn es EINLÖSBAR ist – deshalb drei
      // Bedingungen zusammen. Und die Falle, die Vivien nachgemessen hat:
      // `text-overflow: ellipsis` ALLEIN malt kein „…". Ohne `nowrap` bricht
      // der Text um, ohne `hidden` läuft er sichtbar heraus – der berechnete
      // Wert steht trotzdem auf `ellipsis`. Wer nur darauf prüft, entschuldigt
      // genau die Fälle, die er fangen soll.
      const einzeilig = /nowrap|^pre$/.test(st.whiteSpace) || st.webkitLineClamp !== "none";
      const sichtbarGekuerzt =
        st.textOverflow === "ellipsis" && einzeilig && /hidden|clip/.test(st.overflowX);
      const einloesbar =
        !!el.closest("a") || !!el.getAttribute("title") || !!el.getAttribute("aria-label");
      if (sichtbarGekuerzt && einloesbar) continue;
      // Nur BLÄTTER melden. Sonst meldet jede Hülle um einen zu breiten Text
      // ebenfalls, und aus einem Fund werden fünf.
      if ([...el.children].some((k) => k.textContent.trim())) continue;
      // Absichtlich außerhalb geparkte Elemente sind kein Befund: Das ist die
      // übliche Bauweise für Text, den nur Vorleseprogramme hören sollen.
      if (st.position === "absolute" && (b.width <= 1 || b.height <= 1)) continue;
      if (st.clipPath === "inset(50%)") continue;
      funde.push({
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 40),
        art: kastenRagt ? "Kasten ragt raus" : "Inhalt quillt über",
        fehltLinks: Math.max(0, Math.round(-b.left)),
        fehltRechts: kastenRagt
          ? Math.max(0, Math.round(b.right - window.innerWidth))
          : el.scrollWidth - el.clientWidth,
      });
    }
    return funde;
  });
}

async function laden(page, pfad, breite) {
  // ⚠️ BEWEGUNGSREDUKTION EINSCHALTEN – sonst misst der Test Zwischenbilder.
  //
  // Die Feature-Karten der Startseite fliegen beim Sichtbarwerden seitlich ein
  // (`components/ui/Reveal.js`). Wer währenddessen misst, findet sechs
  // Überschriften mit exakt 8 px Überstand – ein perfekt gleichmäßiges Muster,
  // das kein echter Layoutfehler je hätte. Beim Bauen genau so passiert.
  //
  // Mit `reducedMotion: "reduce"` rendert Reveal ohne Bewegung, alles steht
  // sofort auf seiner Endlage. Und das ist der Zustand, um den es geht: ob ein
  // Mensch den ganzen Satz SIEHT, nicht ob ein Element unterwegs kurz übersteht.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: breite, height: 800 });
  await page.goto(pfad, { waitUntil: "domcontentloaded" });
  // Auf Inhalt warten, nicht auf eine feste Zeit – sonst misst man ein halb
  // aufgebautes Layout und meldet Fehler, die es nicht gibt (die Fehlerklasse
  // dieses Tages, fünfmal aufgetreten).
  await page.waitForSelector("main, h1", { timeout: 30_000 }).catch(() => {});
  // ⚠️ `null` ALS ZWEITES ARGUMENT IST PFLICHT (Befund Kai, Nachprüfung 18.08.2026).
  //
  // Playwright erwartet `waitForFunction(fn, arg, options)`. Stand hier – und an
  // sieben weiteren Stellen der Suite – nur `(fn, { timeout, polling })`, dann
  // landete das Objekt als ARGUMENT FÜR DIE FUNKTION und verfiel stillschweigend.
  // Keine Warnung, kein Fehler.
  //
  // Gemessen: Vorgabe 400 ms Abstand, tatsächlich 6–18 ms. „Die Höhe hat sich
  // nicht geändert" hieß damit nur „nicht innerhalb von 17 Millisekunden" –
  // dieser Test prüfte in 7 von 8 Läufen eine Seite mit 0 Einträgen und 41
  // grauen Platzhaltern. Ein Test, der nichts sieht, ist grün.
  await page.waitForFunction(
    () => {
      const h = document.body.scrollHeight;
      const vorher = window.__hoeheVorher;
      window.__hoeheVorher = h;
      return vorher === h && h > 0;
    },
    null,
        { timeout: 20_000, polling: 400 },
  ).catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════
// EHRLICHKEITSSCHRANKE — der Wächter darf nicht schweigen, wenn seine
// Datenquelle klemmt (Befund Kai, gebaut mit Vivien am 20.08.2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// Die Startseite trägt einen Abschnitt, dessen Inhalt NICHT aus diesem Projekt
// kommt: `#news` zeigt echte Schlagzeilen aus einem fremden RSS-Feed. Und
// `components/NewsWidget.js` gibt bei leerer Liste `null` zurück — der
// Abschnitt bleibt dann einfach leer.
//
// Damit hatte dieser Test dieselbe Krankheit, die er heilen soll: Ist der Feed
// langsam, leer oder nicht erreichbar, misst er sechs Karten weniger und meldet
// „alles in Ordnung". Genau so war er in Kais erstem Lauf grün — über einer
// Seite, auf der die Nachrichten 45 px über den Rand ragten.
//
// „Ich habe nichts gefunden" und „ich habe nicht nachgesehen" sind zwei
// verschiedene Aussagen. Ein Test, der sie zu einer verschmilzt, ist kein
// Wächter, sondern ein Feigenblatt.
//
// Die Schranke unterscheidet deshalb ZWEI Fälle, und das ist ihr eigentlicher
// Wert — die Fehlermeldung sagt, wer schuld ist:
//   • Feed liefert Meldungen, Seite zeigt keine → FEHLER AN DER SEITE.
//   • Feed liefert nichts                       → NICHT GEMESSEN, fremde Quelle.
// Beides ist rot. Nur das eine ist ein Auftrag an die Entwicklung.
//
// ⚠️ Ja, das koppelt diesen Lauf an eine fremde Erreichbarkeit — ohne Netz wird
// er rot. Das ist die bewusst gewählte Seite des Irrtums: ein lautes „nicht
// geprüft" kostet eine Minute Nachsehen, ein stilles „geprüft" hat 45 px
// abgeschnittenen Text bis auf die Live-Seite durchgelassen.
//
// ⚠️ Die Schranke sichert nur, dass ÜBERHAUPT gemessen wurde. Sie kann nicht
// sichern, dass die Meldungen des Tages den heiklen Fall enthalten (einen
// langen Quellennamen). Dafür gibt es `tests/e2e/nachrichten-karten.spec.mjs`
// mit festen Testdaten — der Regressionsschutz hängt dort, nicht hier.
async function nachrichtenStand(page) {
  const gezeigt = await page.locator("#news a[target=_blank]").count();
  if (gezeigt > 0) return { gezeigt, geliefert: gezeigt, lage: "gemessen" };
  // Erst jetzt die Quelle fragen — sie kostet eine Anfrage, und im Normalfall
  // ist die Antwort schon am Bildschirm zu sehen.
  const geliefert = await page.evaluate(async () => {
    try {
      const r = await fetch("/api/news/rss");
      const j = await r.json();
      return (j?.news || []).length;
    } catch {
      return -1; // Anfrage selbst gescheitert
    }
  });
  return { gezeigt, geliefert, lage: geliefert > 0 ? "seite-zeigt-nichts" : "quelle-leer" };
}

test.describe("Kein Text ragt über den Bildschirmrand", () => {
  for (const breite of BREITEN) {
    test(`${breite}px: alle öffentlichen Seiten`, async ({ page }) => {
      const kaputt = [];
      const nichtGemessen = [];
      let seitlich = 0;
      for (const pfad of SEITEN) {
        await laden(page, pfad, breite);

        if (pfad === "/") {
          const n = await nachrichtenStand(page);
          if (n.lage === "seite-zeigt-nichts") {
            nichtGemessen.push(
              `FEHLER AN DER SEITE: Der Feed hat ${n.geliefert} Meldungen geliefert, ` +
                `die Startseite zeigt aber 0 Nachrichten-Karten. Das ist kein ` +
                `Quellenproblem — hier rendert etwas nicht.`,
            );
          } else if (n.lage === "quelle-leer") {
            nichtGemessen.push(
              `NICHT GEMESSEN: Die Startseite zeigt 0 Nachrichten-Karten, weil ` +
                (n.geliefert === -1
                  ? `die Anfrage an /api/news/rss gescheitert ist (kein Netz?).`
                  : `der RSS-Feed 0 Meldungen geliefert hat.`) +
                ` Der Nachrichtenteil der Startseite wurde in diesem Lauf also ` +
                `NICHT geprüft. Das ist kein Freispruch — genau dort saß der ` +
                `Fehler vom 20.08.2026.`,
            );
          }
        }

        // Die gemessene Wahrheit statt einer Behauptung — s. Kommentar unten.
        seitlich = Math.max(
          seitlich,
          await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          ),
        );

        const funde = await abgeschnitten(page);
        for (const f of funde) {
          kaputt.push(
            `${pfad} → ${f.tag} „${f.text}" [${f.art}] (links ${f.fehltLinks}px, rechts ${f.fehltRechts}px)`,
          );
        }
      }
      // ⚠️ ECHTE FUNDE ZUERST. Fehlen die Nachrichten UND liegt anderswo ein
      // echter Fund, wäre eine vorangestellte Schranken-Meldung das Falscheste:
      // Sie verdeckte den einen Befund, an dem jemand sofort arbeiten kann.
      //
      // ⚠️ HIER STAND EINE BEHAUPTUNG, DIE FÜR DEN ERSTEN ECHTEN FUND FALSCH WAR
      // (Befund Vivien, 20.08.2026). Der Satz lautete „Die Seite scrollt dabei
      // NICHT seitlich". Für die Startseite mit den Nachrichten-Karten stimmte
      // das nicht: gemessen 426 px Dokumentbreite bei 360 px Fenster, und sie
      // ließ sich um 66 px schieben.
      //
      // Der Blindfleck lag woanders, und er ist der interessantere:
      // **Die Nachrichten kommen erst NACH dem Laden.** Direkt nach
      // `domcontentloaded` gemessen: Dokumentbreite 360 = Fensterbreite 360,
      // null Karten. Wer da prüft, sieht eine saubere Seite. Erst 6 Karten
      // später sind es 426 px. Jede Querscroll-Prüfung, die nicht auf den Feed
      // wartet, ist also nicht falsch gebaut — sie kommt zu früh.
      //
      // Konsequenz für diese Meldung: nicht behaupten, sondern MESSEN und den
      // gemessenen Wert hinschreiben. Ein Test, der über sich selbst eine feste
      // Aussage trifft, kann darin veralten wie jeder andere Text.
      expect(
        kaputt,
        `Auf ${breite}px ragt Text über den Bildschirmrand. Der Leser sieht ` +
          `den Anfang oder das Ende nicht.\n` +
          `Querscrollen in diesem Lauf: ${seitlich > 0 ? `${seitlich}px (die Seite lässt sich schieben)` : "keines"}` +
          ` — abgeschnittener Text macht die Seite nicht zwangsläufig breiter, ` +
          `deshalb wird hier die gezeichnete Fläche gemessen und nicht die ` +
          `Dokumentbreite.\n${kaputt.join("\n")}`,
      ).toEqual([]);

      expect(
        nichtGemessen,
        `Dieser Lauf ist KEIN Freispruch für die Startseite:\n${nichtGemessen.join("\n")}`,
      ).toEqual([]);
    });
  }

  test("die bekannten Baustellen sind nicht größer geworden", async ({ page }) => {
    test.skip(BAUSTELLEN.length === 0, "Keine bekannten Baustellen – nichts zu bewachen.");
    // ⚠️ BEIDE Richtungen. Eine Baustellenliste, die nur nach oben prüft, wird
    // zum Feigenblatt: Sie bliebe grün, auch wenn längst alles behoben ist, und
    // niemand merkt, dass die Zahl nichts mehr bedeutet.
    for (const { pfad, erwartet, grund } of BAUSTELLEN) {
      await laden(page, pfad, 360);
      const funde = await abgeschnitten(page);
      expect(
        funde.length,
        `${pfad}: ${funde.length} abgeschnittene Elemente statt der bekannten ` +
          `${erwartet}.\n` +
          (funde.length > erwartet
            ? `Es sind MEHR geworden – das ist eine Regression.`
            : `Es sind WENIGER geworden – gut, aber dann gehört die Zahl in ` +
              `BAUSTELLEN nachgezogen (oder der Eintrag ganz gestrichen), sonst ` +
              `bewacht sie nichts mehr.`) +
          `\nHintergrund: ${grund}`,
      ).toBe(erwartet);
    }
  });
});
