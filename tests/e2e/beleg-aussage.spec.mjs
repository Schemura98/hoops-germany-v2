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
import { readFileSync } from "fs";
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

// Die Flächen, die eine Beleg-Aussage treffen.
const FLAECHEN = [
  ["lib/autoPost.js", "Ergebnis-Beitrag im Feed (öffentlich teilbar)"],
  ["components/feed/Anzeigetafel.js", "Anzeigetafel auf dem Newsfeed"],
  ["lib/statsNotify.js", "Benachrichtigung „Deine Zahlen stehen“"],
  [join("app", "match", "[id]", "page.js"), "Spiel-Detailseite"],
];

test.describe("Beleg-Aussage", () => {
  test("das Prädikat steht an EINER Stelle", async () => {
    const quelle = lies("lib", "matchScore.js");
    expect(quelle, "beidseitigBelegt fehlt in lib/matchScore.js").toContain(
      "export function beidseitigBelegt"
    );
    // Es muss wirklich auf BEIDE submittedBy prüfen, nicht nur auf eines.
    const block = quelle.slice(quelle.indexOf("export function beidseitigBelegt"));
    expect(block, "beidseitigBelegt prüft teamAResult.submittedBy nicht").toContain(
      "teamAResult?.submittedBy"
    );
    expect(block, "beidseitigBelegt prüft teamBResult.submittedBy nicht").toContain(
      "teamBResult?.submittedBy"
    );
    expect(block, "beidseitigBelegt prüft resultStatus nicht").toContain(
      'resultStatus === "confirmed"'
    );
  });

  test("jede Fläche zieht aus dieser einen Stelle", async () => {
    const ohne = [];
    for (const [pfad, zweck] of FLAECHEN) {
      const inhalt = ohneKommentare(lies(...pfad.split(/[\\/]/)));
      if (!/beidseitigBelegt/.test(inhalt)) ohne.push(`${pfad} (${zweck})`);
    }
    expect(
      ohne,
      `Diese Flächen treffen eine Beleg-Aussage, ohne das gemeinsame Prädikat zu ` +
        `benutzen. Genau so ist die Anzeigetafel entstanden:\n${ohne.join("\n")}`
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
      for (const zeile of inhalt.split("\n")) {
        if (!/beiden Teams bestätigt|beidseitig bestätigt/.test(zeile)) continue;
        if (/resultStatus\s*===\s*"confirmed"/.test(zeile)) {
          schuldige.push(`${pfad}: ${zeile.trim().slice(0, 100)}`);
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
      // Ein Ausdruck, der `final` als gleichwertig zu `confirmed` behandelt,
      // darf im selben Block nicht zu einer „bestätigt"-Aussage führen.
      const treffer = inhalt.match(/state\s*===\s*"final"[\s\S]{0,200}/g) || [];
      for (const t of treffer) {
        if (/beiden Teams bestätigt|beidseitig bestätigt/.test(t)) {
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
    expect(beidseitigBelegt(echt), "zwei echte Meldungen müssen zählen").toBe(true);
    expect(
      beidseitigBelegt({ ...echt, teamBResult: {} }),
      "eine fehlende Meldung darf nicht als bestätigt gelten"
    ).toBe(false);
    expect(
      beidseitigBelegt({
        // Genau der Admin-Fall: beide Meldungen da, aber ohne submittedBy.
        resultStatus: "confirmed",
        teamAResult: { ownPoints: 80 },
        teamBResult: { ownPoints: 94 },
      }),
      "ein vom Admin eingetragenes Ergebnis darf nicht als bestätigt gelten"
    ).toBe(false);
    expect(beidseitigBelegt({ resultStatus: "mismatch" })).toBe(false);
    expect(beidseitigBelegt(null)).toBe(false);
    expect(beidseitigBelegt(undefined)).toBe(false);
  });
});
