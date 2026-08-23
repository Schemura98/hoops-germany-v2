// Deploy-Gate 15.08.2026: „bestätigt" nur bei ZWEI echten Meldungen.
//
// Beide Gates haben unabhängig denselben blockierenden Befund gemeldet, und
// Tobias hat ihn mit echten Seed-Daten reproduziert: Der Newsfeed sagte
// „beidseitig bestätigt", `/match/[id]` zeigte für dieselbe Partie kein
// Abzeichen. Rohdaten: `resultStatus: "confirmed"`, `submittedBy` auf BEIDEN
// Seiten `null`.
//
// Zwei Wege führten dorthin:
//   1. `app/api/admin/updatematch` erfindet beide Meldungen aus EINEM
//      Admin-Formular und setzt `resultStatus: "confirmed"` – ohne
//      `submittedBy`.
//   2. `matchVerification(...).state === "final"` heißt laut Definition
//      „einseitig, ≥ 48 h ohne Gegen-Eintrag". Das als „beidseitig bestätigt"
//      zu beschriften ist eine Umkehrung – und im Amateursport der Normalfall.
//
// Dieser Test prüft die REGEL, nicht die Anzeige: Jede Fläche, die das Wort
// „bestätigt" benutzt, muss `beidseitigBelegt` aus `lib/matchScore.js`
// verwenden und darf sich NICHT allein auf `resultStatus` oder auf
// `matchVerification` stützen.
//
// ⚠️ Warum Quelltext und nicht Browser: Der Fall „Admin-Ergebnis" lässt sich
// im Browser nur herstellen, indem man auf Prod-Art Daten erzeugt. Tobias
// musste dafür die API-Antwort clientseitig fälschen. Was hier brechen kann,
// ist ohnehin eine neue Fläche mit eigener Bedingung – und genau das findet
// ein Quelltext-Test.
import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const lies = (...p) => readFileSync(join(PROJECT_ROOT, ...p), "utf8");

// Kommentare abziehen – die Warnhinweise dieser Codebasis zitieren die alten,
// falschen Bedingungen ausdrücklich. Ohne diesen Schritt prüft der Test seine
// eigene Dokumentation (dieselbe Lehre wie bei den Positions-Platzhaltern).
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((z) => !/^\s*\/\//.test(z))
    .join("\n");
}

// ⚠️ Zerlegt in ANWEISUNGEN, nicht in Zeilen (Befund im dritten Prüflauf).
//
// Die erste Fassung der beiden Prüfungen unten arbeitete zeilenweise – und
// hätte damit ausgerechnet den Regress nicht gefunden, für den sie gebaut
// wurde. Der Fehler in `autoPost.js` war ein MEHRZEILIGER Ternär:
//
//     const note =
//       match.resultStatus === "confirmed"      ← Bedingung
//         ? "Von beiden Teams bestätigt"        ← Satz, andere Zeile
//
// Bedingung und Satz stehen nie auf derselben Zeile. Der Test sah aus wie ein
// Regressionsschutz und war keiner.
//
// Ein `;`-Schnitt ist grob, fasst aber genau den Fall: Der ganze Ternär ist
// EINE Anweisung. Das ersetzt zugleich das feste `{0,200}`-Fenster der zweiten
// Prüfung – dieselbe Fehlerklasse, die in CLAUDE.md Roadmap 15 (5) steht und
// an einem Tag viermal zugeschlagen hat.
function anweisungen(inhalt) {
  return inhalt.split(";");
}

// Die Flächen, die eine Beleg-Aussage treffen.
//
// Dritte Spalte = woraus die Fläche ihre Aussage ziehen MUSS:
//   "praedikat" – sie entscheidet selbst, also `beidseitigBelegt`.
//   "belegStufe" – sie zeigt nur an, was `lib/autoPost.js` entschieden hat.
//     Diese Flächen haben gar kein Spiel-Objekt und KÖNNEN das Prädikat nicht
//     anwenden; sie dürfen aber auch nichts anderes benutzen als das eine Feld,
//     das nachweislich daraus stammt. (Neu am 18.08.2026 mit der Ergebnis-Karte.)
const FLAECHEN = [
  ["lib/autoPost.js", "Ergebnis-Beitrag im Feed (öffentlich teilbar)", "praedikat"],
  ["components/feed/Anzeigetafel.js", "Anzeigetafel auf dem Newsfeed", "praedikat"],
  ["lib/statsNotify.js", "Benachrichtigung „Deine Zahlen stehen“", "praedikat"],
  // Seit der Anzeigetafel-Runde (23.08.2026) trifft die Spiel-Detailseite ihre
  // Beleg-Aussage über das BelegLampe-Primitiv – die Seite selbst ruft das
  // Prädikat nicht mehr auf, die Lampe tut es (und NUR sie darf es; sie nimmt
  // das Match entgegen und rechnet nichts selbst nach). Der Eintrag wandert
  // deshalb von der Seite auf die Lampe; der Ergebnisse-Tab steht zusätzlich
  // drauf, weil er das Wort „Bestätigt" seit dem P6-Gate selbst rendert.
  [join("components", "ui", "BelegLampe.js"), "Beleg-Lampe (Spielseite, Teamseite, Admin)", "praedikat"],
  [join("components", "team", "tabs", "ErgebnisseTab.js"), "Ergebnisse-Tab im Admin", "praedikat"],
  [join("components", "posts", "ErgebnisInhalt.js"), "Ergebnis-Karte im Feed", "belegStufe"],
];

test.describe("Beleg-Aussage", () => {
  test("das Prädikat steht an EINER Stelle", async () => {
    const quelle = lies("lib", "matchScore.js");
    expect(quelle, "beidseitigBelegt fehlt in lib/matchScore.js").toContain(
      "export function beidseitigBelegt",
    );
    // Es muss wirklich auf BEIDE submittedBy prüfen, nicht nur auf eines.
    //
    // ⚠️ Der Block wird per KLAMMERZÄHLUNG begrenzt, nicht per `slice` bis
    // Dateiende (Befund im dritten Prüflauf). Vorher nahm er den ganzen Rest
    // der Datei: Stünde `teamAResult?.submittedBy` irgendwo weiter unten in
    // `teamScores()`, bestünden die Prüfungen auch dann, wenn
    // `beidseitigBelegt` selbst nichts mehr prüft – falsches Grün.
    // Und die Hilfsfunktion WIRFT bei Unausgeglichenheit, statt still etwas
    // Falsches zu liefern (Muster `blockAb` aus benachrichtigungs-typen).
    const block = (() => {
      const ab = quelle.indexOf("export function beidseitigBelegt");
      const auf = quelle.indexOf("{", ab);
      let tiefe = 0;
      for (let i = auf; i < quelle.length; i++) {
        if (quelle[i] === "{") tiefe++;
        else if (quelle[i] === "}") {
          tiefe--;
          if (tiefe === 0) return quelle.slice(ab, i + 1);
        }
      }
      throw new Error(
        "Unausgeglichene Klammern in beidseitigBelegt – der Test kann die " +
          "Funktion nicht abgrenzen und schweigt hier bewusst NICHT.",
      );
    })();
    expect(
      block,
      "beidseitigBelegt prüft teamAResult.submittedBy nicht",
    ).toContain("teamAResult?.submittedBy");
    expect(
      block,
      "beidseitigBelegt prüft teamBResult.submittedBy nicht",
    ).toContain("teamBResult?.submittedBy");
    expect(block, "beidseitigBelegt prüft resultStatus nicht").toContain(
      'resultStatus === "confirmed"',
    );
  });

  test("jede Fläche zieht aus dieser einen Stelle", async () => {
    const ohne = [];
    for (const [pfad, zweck, quelle] of FLAECHEN) {
      const inhalt = ohneKommentare(lies(...pfad.split(/[\\/]/)));
      const muster = quelle === "belegStufe" ? /belegStufe/ : /beidseitigBelegt/;
      if (!muster.test(inhalt)) ohne.push(`${pfad} (${zweck}) – erwartet: ${quelle}`);
    }
    expect(
      ohne,
      `Diese Flächen treffen eine Beleg-Aussage, ohne das gemeinsame Prädikat zu ` +
        `benutzen. Genau so ist die Anzeigetafel entstanden:\n${ohne.join("\n")}`,
    ).toEqual([]);
  });

  test("es gibt keine FÜNFTE Fläche, die niemand auf der Liste hat", async () => {
    // ⚠️ Der eigentlich wichtige Test – und er fehlte (Befund Kai, zweite Runde).
    //
    // `FLAECHEN` oben ist eine POSITIVLISTE. Sie prüft, ob sich die vier
    // bekannten Flächen benehmen – sie kann eine fünfte nicht finden. Und genau
    // das ist passiert: Nach der ersten Nacharbeit blieb in `Anzeigetafel.js`
    // die Farb- und Vorbehaltslogik von Register 2 auf dem alten Prädikat
    // stehen. Tobias hat es im Browser gesehen: „80:94 Niederlage" in Rot ohne
    // Vorbehalt, daneben zum SELBEN Spiel „noch nicht beidseitig bestätigt".
    //
    // Deshalb umgedreht: nicht „diese Dateien müssen", sondern „WER AUCH IMMER
    // so etwas behauptet, muss". Aus der Liste wird eine Entdeckung.
    //
    // ⚠️ GRENZE, ausdrücklich (auch von Kai benannt): Die Prüfung arbeitet je
    // DATEI, nicht je Aussage. Eine Datei, die das Prädikat einmal korrekt
    // benutzt und zwanzig Zeilen weiter eine zweite, falsche Behauptung
    // aufstellt, kommt hier durch. Gegengeprüft ist der reale Fall – eine NEUE
    // Fläche, die die Aussage trifft, ohne das Prädikat zu kennen; genau so ist
    // die Anzeigetafel entstanden. Der Fall „zwei Aussagen in einer Datei" ist
    // NICHT abgedeckt. Das steht hier als Warnung, nicht als Zusicherung –
    // „der Test deckt das ab" war an diesen Tagen die teuerste Annahme.
    // `scripts` ergänzt: Das Seed-Skript vom 18.08. trifft ebenfalls eine
    // Beleg-Aussage und lag außerhalb jeder Suchwurzel.
    const WURZELN = ["app", "components", "lib", "scripts"];
    const treffer = [];
    const durchsuchen = (verzeichnis) => {
      for (const eintrag of readdirSync(verzeichnis)) {
        const pfad = join(verzeichnis, eintrag);
        if (statSync(pfad).isDirectory()) durchsuchen(pfad);
        else if (/\.(js|jsx)$/.test(eintrag)) {
          const inhalt = ohneKommentare(readFileSync(pfad, "utf8"));
          // ⚠️ NICHT nach festen Wortlauten suchen (Befund Kai, 18.08.2026).
          //
          // Hier stand eine Liste mit drei Formulierungen. Am 18.08. entstanden
          // zwei neue Flächen mit „von beiden VEREINEN bestätigt" – Vereinen,
          // nicht Teams – und der Wächter schwieg. Ein Synonym anzuhängen hätte
          // dieselbe Falle für das nächste gestellt.
          //
          // Jetzt: ein Muster über die BEDEUTUNG. „beid…/beide… + bestätigt"
          // in einem Fenster von 40 Zeichen fängt Teams, Vereine, Seiten,
          // Mannschaften und jede Umstellung davon.
          const behauptet =
            /(beide[nr]?|beidseitig|doppelt)[^;{}]{0,40}best(ä|ae)tigt/i.test(
              inhalt,
            );
          // Drei zulaessige Nachweise – mehr nicht:
          // (1) `beidseitigBelegt` direkt: die Datei entscheidet selbst.
          // (2) `belegStufe`: die Datei ZEIGT nur, was `lib/autoPost.js`
          //     entschieden hat, und das zieht aus (1). Reine Darstellung ohne
          //     Zugriff auf das Spiel – z. B. eine Karte im Feed.
          // (3) Marker `BELEG-AUSSAGE-PRINZIP`: die Fläche spricht über das
          //     VERFAHREN, nicht über ein konkretes Spiel (Startseite, Tour).
          //     Der Marker steht im Kommentar, deshalb gegen den ROHTEXT
          //     geprüft – `ohneKommentare` hat ihn oben entfernt.
          //
          // ⚠️ Das ist bewusst KEINE Ausnahmeliste im Test. Eine solche Liste
          // wächst still; der Marker zwingt dagegen jeden, der eine neue
          // Beleg-Fläche baut, die Einordnung IN DIE DATEI zu schreiben – dort,
          // wo der nächste Leser sie braucht.
          const roh = readFileSync(pfad, "utf8");
          const nachweis =
            /beidseitigBelegt/.test(inhalt) ||
            /belegStufe/.test(inhalt) ||
            /BELEG-AUSSAGE-PRINZIP/.test(roh);
          if (behauptet && !nachweis) {
            treffer.push(pfad.replace(PROJECT_ROOT, ""));
          }
        }
      }
    };
    for (const w of WURZELN) durchsuchen(join(PROJECT_ROOT, w));
    expect(
      treffer,
      `Diese Dateien behaupten eine beidseitige Bestätigung ohne zulässigen ` +
        `Nachweis (beidseitigBelegt / belegStufe / Marker BELEG-AUSSAGE-PRINZIP):\n` +
        `${treffer.join("\n")}`,
    ).toEqual([]);
  });

  test("niemand leitet die Farbe eines Urteils aus dem Anzeige-Zustand ab", async () => {
    // Die zweite Hälfte desselben Befundes: In der Anzeigetafel WAR die Farbe
    // die Beleg-Aussage. Ein rot gefärbtes „Niederlage" ohne Vorbehalt
    // behauptet eine feststehende Tatsache – für ein vom Admin eingetragenes
    // Ergebnis genauso falsch wie das Wort.
    //
    // Verboten ist deshalb das Muster, das den Fehler trug: `confirmed` und
    // `final` als gleichwertig behandeln. `final` heißt einseitig.
    const WURZELN = ["app", "components", "lib"];
    const treffer = [];
    const durchsuchen = (verzeichnis) => {
      for (const eintrag of readdirSync(verzeichnis)) {
        const pfad = join(verzeichnis, eintrag);
        if (statSync(pfad).isDirectory()) durchsuchen(pfad);
        else if (/\.(js|jsx)$/.test(eintrag)) {
          const inhalt = ohneKommentare(readFileSync(pfad, "utf8"));
          if (
            /state\s*===\s*"confirmed"\s*\|\|\s*\S*\.?state\s*===\s*"final"/.test(
              inhalt,
            ) ||
            /state\s*===\s*"final"\s*\|\|\s*\S*\.?state\s*===\s*"confirmed"/.test(
              inhalt,
            )
          ) {
            treffer.push(pfad.replace(PROJECT_ROOT, ""));
          }
        }
      }
    };
    for (const w of WURZELN) durchsuchen(join(PROJECT_ROOT, w));
    expect(
      treffer,
      `„confirmed || final" behandelt ein EINSEITIG gemeldetes Ergebnis wie ein ` +
        `bestätigtes. Für eine Beleg-Aussage (Wort ODER Farbe) gehört ` +
        `beidseitigBelegt hierher:\n${treffer.join("\n")}`,
    ).toEqual([]);
  });

  test("keine Fläche leitet „bestätigt“ aus resultStatus allein ab", async () => {
    // Das war der Fehler in `autoPost.js`: `resultStatus === "confirmed"`
    // direkt als Bedingung für den Satz „Von beiden Teams bestätigt".
    const schuldige = [];
    for (const [pfad] of FLAECHEN) {
      const inhalt = ohneKommentare(lies(...pfad.split(/[\\/]/)));
      // Zeilen, die den Satz enthalten, dürfen nicht im selben Ausdruck
      // `resultStatus === "confirmed"` als alleinige Bedingung tragen.
      for (const a of anweisungen(inhalt)) {
        if (!/beiden Teams bestätigt|beidseitig bestätigt/.test(a)) continue;
        // Erlaubt ist, wenn dieselbe Anweisung das Prädikat benutzt – dann ist
        // `resultStatus` nur ein zusätzlicher Zweig (z. B. „Ergebnis steht
        // fest" für den Admin-Fall), keine Ableitung der Bestätigung.
        if (/beidseitigBelegt/.test(a)) continue;
        if (/resultStatus\s*===\s*"confirmed"/.test(a)) {
          schuldige.push(
            `${pfad}: ${a.trim().replace(/\s+/g, " ").slice(0, 120)}`,
          );
        }
      }
    }
    expect(schuldige, schuldige.join("\n")).toEqual([]);
  });

  test("keine Fläche behauptet „bestätigt“ beim Zustand final", async () => {
    // `final` = einseitig gemeldet, ≥ 48 h ohne Gegen-Eintrag. Die
    // Anzeigetafel prüfte `state === "confirmed" || state === "final"` und
    // machte daraus „beidseitig bestätigt".
    const schuldige = [];
    for (const [pfad] of FLAECHEN) {
      const inhalt = ohneKommentare(lies(...pfad.split(/[\\/]/)));
      // Eine ANWEISUNG, die `final` erwähnt und zugleich eine Bestätigung
      // behauptet. Vorher stand hier ein festes `{0,200}`-Fenster – dieselbe
      // Fehlerklasse wie oben, und sie bricht in beide Richtungen: zu kurz
      // gibt falsches Grün, zu lang fängt einen unbeteiligten Nachbarblock ein
      // und gibt falsches Rot.
      for (const a of anweisungen(inhalt)) {
        if (!/state\s*===\s*"final"/.test(a)) continue;
        if (/beiden Teams bestätigt|beidseitig bestätigt/.test(a)) {
          schuldige.push(`${pfad}: „final“ führt zu einer bestätigt-Aussage`);
        }
      }
    }
    expect(schuldige, schuldige.join("\n")).toEqual([]);
  });

  test("das Prädikat verhält sich in beide Richtungen richtig", async () => {
    // Gegenprobe an der Funktion selbst – ohne sie prüfen die Tests oben nur,
    // WER sie aufruft, nicht OB sie stimmt. Eine Fassung, die immer `false`
    // liefert, käme oben durch und wäre genauso kaputt.
    const { beidseitigBelegt } = await import("../../lib/matchScore.js");
    const echt = {
      resultStatus: "confirmed",
      teamAResult: { submittedBy: "a" },
      teamBResult: { submittedBy: "b" },
    };
    expect(beidseitigBelegt(echt), "zwei echte Meldungen müssen zählen").toBe(
      true,
    );
    expect(
      beidseitigBelegt({ ...echt, teamBResult: {} }),
      "eine fehlende Meldung darf nicht als bestätigt gelten",
    ).toBe(false);
    expect(
      beidseitigBelegt({
        // Genau der Admin-Fall: beide Meldungen da, aber ohne submittedBy.
        resultStatus: "confirmed",
        teamAResult: { ownPoints: 80 },
        teamBResult: { ownPoints: 94 },
      }),
      "ein vom Admin eingetragenes Ergebnis darf nicht als bestätigt gelten",
    ).toBe(false);
    expect(beidseitigBelegt({ resultStatus: "mismatch" })).toBe(false);
    expect(beidseitigBelegt(null)).toBe(false);
    expect(beidseitigBelegt(undefined)).toBe(false);
  });

  // -------------------------------------------------------------------------
  test("die drei Beleg-Stufen sagen, was sie bedeuten", async () => {
    // ⚠️ WARUM ES DIESEN TEST BRAUCHT (Befund Kai + eigene Gegenprobe, 18.08.2026)
    //
    // Die Prüfungen oben stellen sicher, dass eine Fläche aus der RICHTIGEN
    // QUELLE zieht. Sie sagen nichts darüber, ob sie die Werte richtig
    // ZUORDNET. Gegenprobe gemacht: „fest" auf „Von beiden Vereinen bestätigt"
    // umgebogen – also exakt die Falschaussage vom 15.08.2026 neu eingebaut –
    // und die Suite blieb GRÜN. Ein Wächter, der die Quelle prüft und die
    // Zuordnung nicht, deckt die gefährlichste Hälfte nicht ab.
    //
    // Der Fall ist nicht theoretisch: Auf `hoops_prod` tragen 137 von 137
    // abgeschlossenen Spielen `resultStatus: "confirmed"` OHNE beidseitiges
    // `submittedBy` – sie landen also alle auf „fest". Wäre diese Stufe als
    // beidseitige Bestätigung ausgewiesen, stünde auf der meistbesuchten Seite
    // eine Falschaussage über genau das, was das Produkt verkauft.
    const quelle = lies("components", "posts", "ErgebnisInhalt.js");

    const stufe = (name) => {
      // Den Textwert der Stufe aus dem BELEG-Wörterbuch holen. Klammern werden
      // gezählt statt ein festes Zeichenfenster zu schneiden (Fehlerklasse aus
      // CLAUDE.md Roadmap 15 (5)); die Hilfsfunktion wirft, wenn sie den Block
      // nicht findet, statt still etwas Falsches zu liefern.
      const ab = quelle.indexOf(`${name}: {`);
      if (ab === -1) throw new Error(`Stufe "${name}" fehlt in BELEG – wurde sie umbenannt?`);
      let tiefe = 0, i = quelle.indexOf("{", ab);
      const start = i;
      do {
        if (quelle[i] === "{") tiefe++;
        else if (quelle[i] === "}") tiefe--;
        i++;
      } while (tiefe > 0 && i < quelle.length);
      if (tiefe !== 0) throw new Error(`Block der Stufe "${name}" ist nicht geschlossen.`);
      return quelle.slice(start, i);
    };

    const beidseitig = stufe("beidseitig");
    const fest = stufe("fest");
    const vorlaeufig = stufe("vorlaeufig");

    // NUR die beidseitige Stufe darf von „beiden" sprechen.
    expect(
      /beiden/i.test(beidseitig),
      `Die Stufe "beidseitig" sagt nicht, dass BEIDE bestätigt haben: ${beidseitig}`,
    ).toBe(true);
    for (const [name, block] of [["fest", fest], ["vorlaeufig", vorlaeufig]]) {
      expect(
        /(beide[nr]?|beidseitig|doppelt)/i.test(block),
        `Die Stufe "${name}" behauptet eine beidseitige Bestätigung. Sie bedeutet ` +
          `aber gerade NICHT, dass beide Vereine gemeldet haben – "fest" heißt ` +
          `„ein Super-Admin hat es gesetzt", "vorlaeufig" heißt „einer fehlt noch". ` +
          `Genau diese Verwechslung hat am 15.08.2026 beide Gates blockiert.\n${block}`,
      ).toBe(false);
    }

    // Die unbekannte Stufe muss auf die VORSICHTIGE Seite fallen.
    expect(
      /BELEG\[[^\]]+\]\s*\|\|\s*BELEG\.vorlaeufig/.test(quelle),
      `Eine unbekannte Beleg-Stufe muss auf "vorlaeufig" fallen, nie auf ` +
        `"beidseitig" – im Zweifel lieber zu wenig behaupten als zu viel.`,
    ).toBe(true);

    // Und die Stufen müssen dieselben sein, die `lib/autoPost.js` vergibt.
    const erzeuger = ohneKommentare(lies("lib", "autoPost.js"));
    for (const name of ["beidseitig", "fest", "vorlaeufig"]) {
      expect(
        new RegExp(`["']${name}["']`).test(erzeuger),
        `"${name}" wird in ErgebnisInhalt.js erwartet, aber von lib/autoPost.js ` +
          `nicht mehr vergeben – die beiden Wörterbücher sind auseinandergelaufen.`,
      ).toBe(true);
    }
  });
});
