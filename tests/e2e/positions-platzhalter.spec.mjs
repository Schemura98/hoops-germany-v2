// Deploy-Gate 15.08.2026: EIN Platzhalter für „keine Position hinterlegt".
//
// Vorher standen vier verschiedene Strings an sieben Stellen und
// widersprachen sich (Befund Vivien, ausgeweitet von Nele):
//   `—`                auf der öffentlichen Vereinsseite (2x)
//   „Position offen"   im Team-Admin-Panel (2x), Transfermarkt, Anfragen, Tryouts
//   (gar nichts)       auf /spieler
//
// „Position offen" behauptet eine ausgeschriebene Stelle – bei einem Mitglied
// falsch, bei einem öffentlich sichtbaren Kaderplatz auch (dort stehen nur
// Plätze MIT Namen, also erwartete Mitglieder ohne Konto). Im Transfermarkt
// las es sich neben einem Spielernamen wie „spielt alles, sucht irgendwas".
//
// Dieser Test hält die Regel fest. Er liest Quelltext, weil die betroffenen
// Zustände (Mitglied ohne Position, unbestätigter Kaderplatz) im Browser
// jeweils eigene Daten bräuchten – und weil das, was brechen kann, eine neue
// Fundstelle mit eigenem Wortlaut ist.
import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const WURZELN = [join(PROJECT_ROOT, "app"), join(PROJECT_ROOT, "components")];

function dateienSammeln() {
  const treffer = [];
  const durchsuchen = (verzeichnis) => {
    for (const eintrag of readdirSync(verzeichnis)) {
      const pfad = join(verzeichnis, eintrag);
      if (statSync(pfad).isDirectory()) durchsuchen(pfad);
      else if (/\.(js|jsx)$/.test(eintrag)) treffer.push(pfad);
    }
  };
  for (const w of WURZELN) durchsuchen(w);
  return treffer;
}

test.describe("Positions-Platzhalter", () => {
  test("der alte Text „Position offen“ kommt nirgends mehr vor", async () => {
    const schuldige = dateienSammeln().filter((p) =>
      readFileSync(p, "utf8").includes('"Position offen"')
    );
    expect(
      schuldige.map((p) => p.replace(PROJECT_ROOT, "")),
      `„Position offen" behauptet eine ausgeschriebene Stelle. Für eine Person ` +
        `ohne hinterlegte Position POSITION_FEHLT aus lib/constants.js nutzen.`
    ).toEqual([]);
  });

  test("der Platzhalter steht an EINER Stelle", async () => {
    const quelle = readFileSync(join(PROJECT_ROOT, "lib", "constants.js"), "utf8");
    expect(quelle, "POSITION_FEHLT fehlt in lib/constants.js").toContain(
      "export const POSITION_FEHLT"
    );

    // Wer `positionLabel(...) ||` schreibt, braucht die Konstante – nicht einen
    // eigenen Text. Ausgenommen sind Tabellen mit Spaltenkopf: dort trägt der
    // Gedankenstrich (Nele), er ist Tabellensprache und nicht mehrdeutig.
    const TABELLEN = [join("app", "ligen"), join("app", "topscorer"), join("app", "rangliste")];
    const eigenerText = [];
    for (const pfad of dateienSammeln()) {
      if (TABELLEN.some((t) => pfad.includes(t))) continue;
      const inhalt = readFileSync(pfad, "utf8");
      // `positionLabel(x) || "sichtbarer Text"` – aber NICHT `|| ""`.
      // Der leere Rückfall ist kein Platzhalter: In `app/api/player/search`
      // hält er ein API-Feld leer, in `WelcomeTour` belegt er ein Formularfeld
      // vor. Beides sind Datenwerte, keine Anzeige – dort wäre ein Satz wie
      // „Position nicht angegeben" sogar falsch, weil er als Wert gespeichert
      // würde. Ein erster Versuch dieses Tests hat sie angeschlagen.
      const treffer = inhalt.match(/positionLabel\([^)]*\)\s*\|\|\s*"[^"]+"/g);
      if (treffer) eigenerText.push(`${pfad.replace(PROJECT_ROOT, "")}: ${treffer[0]}`);
    }
    expect(
      eigenerText,
      `Diese Stellen setzen einen eigenen Platzhalter statt POSITION_FEHLT – ` +
        `genau so sind die sieben Fundstellen auseinandergelaufen:\n${eigenerText.join("\n")}`
    ).toEqual([]);
  });

  test("der Kaderplatz-Status behauptet keine Einladung", async () => {
    // ⚠️ „eingeladen" war unbelegt: Das Slot-Schema hält NICHT fest, ob je ein
    // Link verschickt wurde. Und „Ausstehend" war unerreichbar, weil `pending`
    // nirgends gesetzt wird – `request-claim` springt direkt auf `confirmed`.
    const seite = readFileSync(
      join(PROJECT_ROOT, "app", "team", "team-detail", "[slug]", "page.js"),
      "utf8"
    );
    expect(seite).toContain("Noch nicht bestätigt");
    expect(
      /slot\.status === "pending" \? "Ausstehend" : "eingeladen"/.test(seite),
      "das alte Statuspaar ist zurück – „eingeladen“ behauptet eine Einladung, " +
        "die kein Feld belegt"
    ).toBe(false);
  });
});
