// Deploy-Gate 15.08.2026: EIN Platzhalter für „keine Position hinterlegt".
//
// Vorher standen vier verschiedene Strings an neun Stellen und
// widersprachen sich (Befund Vivien, ausgeweitet von Nele):
//   `—`                öffentliche Vereinsseite (2x), /topscorer, /ligen/[id]
//   „Position offen"   Team-Admin-Panel (2x), Transfermarkt, Anfragen, Tryouts
//   (gar nichts)       /spieler, zweite Liste im Transfermarkt
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
//
// ⚠️ Die erste Fassung dieses Tests war an sechs Stellen zu schwach (Befund
// Kai) und hat genau deshalb zwei echte Fundstellen durchgelassen. Was sich
// geändert hat, steht jeweils am betroffenen Prüfschritt.
import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

// ⚠️ `lib` gehört dazu. Es fehlte, und `lib/` ist genau der Ort, an dem
// serverseitig Anzeigetexte entstehen (z. B. die Nachrichten in
// `lib/notify*.js`) – eine Fundstelle dort wäre unsichtbar geblieben.
const WURZELN = ["app", "components", "lib"].map((v) => join(PROJECT_ROOT, v));

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

// Kommentare entfernen, bevor irgendetwas gesucht wird.
//
// ⚠️ Ohne das prüft der Test seine eigene Dokumentation. Beide Richtungen
// gehen schief: Ein Kommentar, der den alten Wortlaut ZITIERT (und genau das
// tun die Warnhinweise in dieser Codebasis), schlägt fälschlich an – und ein
// Kommentar, der `POSITION_FEHLT` nur ERWÄHNT, macht die Positiv-Gegenprobe
// unten fälschlich grün. In `app/spieler/page.js` ist der Name heute
// ausschließlich in einem Kommentar; ohne diesen Schritt hätte der Test die
// Datei als versorgt gemeldet, obwohl dort bewusst nichts gerendert wird.
//
// Bewusst konservativ: Blockkommentare ganz, Zeilenkommentare nur, wenn `//`
// die Zeile eröffnet. Ein `//` mitten in der Zeile bleibt stehen, weil es dort
// auch `https://` sein kann – lieber ein Rest Kommentar als ein zerschnittener
// String.
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((z) => !/^\s*\/\//.test(z))
    .join("\n");
}

// Die Anzeigeflächen, die den Platzhalter WIRKLICH rendern müssen.
//
// ⚠️ Ohne diese Liste prüft der Test nur, dass niemand einen EIGENEN Text
// schreibt – nicht, dass überhaupt einer steht. Wer `|| POSITION_FEHLT`
// ersatzlos löscht, wäre grün durchgekommen. Genau so ist die Fundstelle in
// `transfermarkt` (zweite Liste, `filter(Boolean).join()`) entstanden: kein
// eigener Text, aber auch keine Anzeige.
const PFLICHTFLAECHEN = [
  join("app", "ligen", "[id]", "page.js"),
  join("app", "topscorer", "page.js"),
  join("app", "transfermarkt", "page.js"),
  join("app", "team", "team-detail", "[slug]", "page.js"),
  join("components", "team", "tabs", "KaderTab.js"),
  join("components", "team", "tabs", "AnfragenTab.js"),
  join("components", "team", "tabs", "TryoutsTab.js"),
];

test.describe("Positions-Platzhalter", () => {
  test("der alte Text „Position offen“ kommt nirgends mehr vor", async () => {
    // Auch hier nach Kommentar-Abzug: Die Begründung in `lib/constants.js`
    // zitiert den alten Wortlaut absichtlich.
    const schuldige = dateienSammeln().filter((p) =>
      /["'`]Position offen["'`]/.test(ohneKommentare(readFileSync(p, "utf8")))
    );
    expect(
      schuldige.map((p) => p.replace(PROJECT_ROOT, "")),
      `„Position offen" behauptet eine ausgeschriebene Stelle. Für eine Person ` +
        `ohne hinterlegte Position POSITION_FEHLT aus lib/constants.js nutzen.`
    ).toEqual([]);
  });

  test("keine Fläche erfindet einen eigenen Platzhalter", async () => {
    const quelle = readFileSync(join(PROJECT_ROOT, "lib", "constants.js"), "utf8");
    expect(quelle, "POSITION_FEHLT fehlt in lib/constants.js").toContain(
      "export const POSITION_FEHLT"
    );

    // ⚠️ KEINE Ausnahmeliste mehr.
    //
    // Die erste Fassung nahm `app/topscorer`, `app/ligen` und `app/rangliste`
    // aus, weil der Gedankenstrich dort „Tabellensprache in einer Spalte mit
    // Kopfzeile" sei. Kai und Tobias haben unabhängig voneinander nachgemessen,
    // dass das nicht stimmt: Die Position steht dort als Unterzeile unter dem
    // Namen, zeichengleich mit `/transfermarkt`. Es gab keine Kopfzeile, auf
    // die sich der Strich hätte beziehen können.
    //
    // Zwei Lehren, beide teuer bezahlt: Eine Ausnahmeliste ist der bequemste
    // Weg zu Grün, und sie überlebt ihre Begründung. Und sie griff pro
    // VERZEICHNIS – eine neue Seite unter `app/ligen/` wäre ungeprüft
    // geblieben, ohne dass jemand eine Entscheidung getroffen hätte.

    // ⚠️ Der Regex der ersten Fassung war `positionLabel\([^)]*\)\s*\|\|\s*"[^"]+"`.
    // Er fand nur die eine Schreibweise, die ich zufällig selbst benutzt hatte.
    // Nicht gefunden hätte er: einfache Anführungszeichen, Template-Literale,
    // einen Ternär (`? "…" : "…"`), einen geschachtelten Aufruf
    // (`positionLabel(f(x))` – `[^)]*` bricht an der ersten Klammer ab) und den
    // optionalen Aufruf `positionLabel?.(…)`.
    //
    // Deshalb jetzt zweistufig: erst die Aufrufstelle robust finden (mit
    // Klammerzählung statt Zeichenfenster), dann das Folgezeichen prüfen.
    const eigenerText = [];
    for (const pfad of dateienSammeln()) {
      const inhalt = ohneKommentare(readFileSync(pfad, "utf8"));
      const aufruf = /positionLabel\??\.?\(/g;
      let m;
      while ((m = aufruf.exec(inhalt))) {
        // Klammerzählung ab der öffnenden Klammer – findet das echte Ende auch
        // bei geschachtelten Aufrufen.
        let tiefe = 1;
        let i = m.index + m[0].length;
        for (; i < inhalt.length && tiefe > 0; i++) {
          if (inhalt[i] === "(") tiefe++;
          else if (inhalt[i] === ")") tiefe--;
        }
        if (tiefe !== 0) {
          throw new Error(
            `Unausgeglichene Klammern nach positionLabel( in ${pfad.replace(
              PROJECT_ROOT,
              ""
            )} – der Test kann die Stelle nicht beurteilen und schweigt hier ` +
              `bewusst NICHT. (Ein stiller Rückfall ist genau die Fehlerklasse, ` +
              `die an einem Tag viermal zugeschlagen hat.)`
          );
        }
        // Was direkt danach kommt: `|| <etwas>` oder `? <etwas> :`.
        const rest = inhalt.slice(i, i + 120);
        // `|| ""` ist erlaubt – der leere Rückfall ist KEIN Platzhalter, sondern
        // ein Datenwert: In `app/api/player/search` hält er ein API-Feld leer,
        // in `WelcomeTour` belegt er ein Formularfeld vor. Dort wäre ein Satz
        // wie „Position nicht angegeben" sogar falsch, weil er GESPEICHERT
        // würde. Ein erster Versuch dieses Tests hat sie angeschlagen.
        const literal = rest.match(/^\s*(?:\|\||\?)\s*(["'`])(.*?)\1/);
        if (literal && literal[2].trim() !== "") {
          eigenerText.push(
            `${pfad.replace(PROJECT_ROOT, "")}: positionLabel(…) ${literal[0].trim()}`
          );
        }
      }
    }
    expect(
      eigenerText,
      `Diese Stellen setzen einen eigenen Platzhalter statt POSITION_FEHLT – ` +
        `genau so sind die neun Fundstellen auseinandergelaufen:\n${eigenerText.join("\n")}`
    ).toEqual([]);
  });

  test("die Anzeigeflächen zeigen den Platzhalter auch wirklich", async () => {
    // Gegenprobe zur Regel oben: nicht nur „kein eigener Text", sondern
    // „überhaupt ein Text". Siehe Kommentar an PFLICHTFLAECHEN.
    // ⚠️ Die `import`-Zeile zählt NICHT.
    //
    // Die erste Fassung dieser Gegenprobe fragte nur `inhalt.includes(…)` – und
    // blieb bei der Selbstprüfung grün, als ich versuchsweise BEIDE Anzeigen in
    // `KaderTab.js` entfernte. Der Import stand ja noch da. Eine Gegenprobe,
    // die die Einfuhr statt der Verwendung misst, prüft gar nichts.
    const ohneImport = (quelle) =>
      quelle
        .split("\n")
        .filter((z) => !/^\s*import\b/.test(z))
        .join("\n");

    const ohne = PFLICHTFLAECHEN.filter((rel) => {
      const inhalt = ohneImport(
        ohneKommentare(readFileSync(join(PROJECT_ROOT, rel), "utf8"))
      );
      return !inhalt.includes("POSITION_FEHLT");
    });
    expect(
      ohne,
      `Diese Flächen zeigen eine Person ohne Position, rendern dafür aber ` +
        `keinen Platzhalter mehr. Ersatzloses Löschen ist kein Fix: Ein Leerfeld ` +
        `ist für einen Fremden nicht von einem Ladefehler zu unterscheiden.`
    ).toEqual([]);

    // ⚠️ `app/spieler/page.js` steht bewusst NICHT in der Pflichtliste.
    // Dort ist die Position ein CHIP in `brand-500`, keine Unterzeile – ein
    // Abzeichen „Position nicht angegeben" verbrauchte den EINEN Akzent für
    // eine Nicht-Information (Begründung Vivien). Ein fehlendes Abzeichen ist
    // nicht mehrdeutig; ein Gedankenstrich in einer Unterzeile war es.
    // Der Test hält die Entscheidung fest, damit sie nicht als Versehen
    // durchgeht – Tobias hat sie zu Recht als offene Flanke gemeldet.
    const spieler = ohneKommentare(
      readFileSync(join(PROJECT_ROOT, "app", "spieler", "page.js"), "utf8")
    );
    expect(
      spieler.includes("POSITION_FEHLT"),
      "Wenn /spieler den Platzhalter jetzt doch rendert, ist die Begründung im " +
        "Kommentar dort und in lib/constants.js überholt – beide mitziehen."
    ).toBe(false);
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
