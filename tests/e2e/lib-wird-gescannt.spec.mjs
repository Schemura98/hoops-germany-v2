// Eine Klasse, die es nur in `lib/` gibt, kommt im gebauten Stylesheet an.
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM ES DIESEN WÄCHTER GIBT (Roadmap 36, Gate Kai, 22.08.2026)
// ═══════════════════════════════════════════════════════════════════════════
// `lib/ui.js` setzt die Klassenketten für den größten Teil aller Formularfelder
// der Plattform (`inputClass` & Co.). Bis zum 22.08.2026 stand `lib/` NICHT in
// den `content`-Globs von `tailwind.config.js` – Tailwind hat die Datei also
// nie gelesen. Eine dort gesetzte Klasse erzeugte keine Regel; die Änderung
// wirkte trotzdem, aber nur, weil sieben andere Dateien unter
// `components/`/`app/` zufällig dieselbe Klasse noch einmal von Hand
// hinschrieben. Wer diese sieben aufräumt, nimmt der Plattform still eine
// Eigenschaft weg – und nichts sieht kaputt aus.
//
// ⚠️ WARUM DIESER TEST NICHT DAS GEBAUTE STYLESHEET MISST, UND DAS IST DER
// KERN DER SACHE. Nachgemessen (Tailwind zweimal über `app/globals.css`
// laufen lassen, einmal mit und einmal ohne die `lib/`-Zeile): Die beiden
// Stylesheets sind **bitgleich, 85 850 Bytes, kein einziger Unterschied**.
// Die Glob-Zeile erzeugt heute NULL zusätzliche Regeln, weil es zur Zeit keine
// einzige Klasse gibt, die es nur in `lib/` gäbe.
// **Folge: Jeder Test, der das ausgelieferte CSS abfragt, ist für das
// Entfernen der Zeile per Konstruktion blind** – nicht aus Nachlässigkeit,
// sondern weil es nichts zu sehen gibt. Das gilt insbesondere für die
// naheliegende Fassung „haben die Klassen aus `inputClass` eine Regel?": Die
// wäre heute grün und bliebe es auch ohne die Zeile, weil jede dieser Klassen
// zusätzlich unter `components/`/`app/` steht.
//
// ⚠️ EBENSO VERWORFEN: eine Textsuche nach „lib" in `tailwind.config.js`.
// Sie bliebe grün bei einem kaputten Glob (`./lib/*.js` erwischt keine
// Unterordner) und bei einem Tippfehler in der Endung – sie prüft die DATEI
// statt der EIGENSCHAFT.
//
// ⚠️ UND VERWORFEN: eine „Kanarienvogel"-Klasse, die nur zu Testzwecken im
// Produktivcode steht. Sie wäre ehrlich, aber sie lebt davon, dass niemand sie
// als komischen Rest wegräumt – ein Wächter, dessen Bestand von der Disziplin
// eines Fremden abhängt.
//
// ── WIE ES STATTDESSEN GEMESSEN WIRD ──────────────────────────────────────
// Gemessen wird die EIGENSCHAFT, mit dem echten Werkzeug:
//   · Es wird ein Probebaum AUSSERHALB des Projekts angelegt, der ein
//     `lib/`-Verzeichnis mit drei Sondendateien enthält.
//   · Darüber läuft das echte `tailwindcss` mit der **echten, unveränderten**
//     `tailwind.config.js` des Projekts – nichts wird umgeschrieben, keine
//     Quelldatei angefasst, kein Next-Build angestoßen (Laufzeit ~60 ms).
//   · Tailwind löst relative `content`-Globs gegen das Arbeitsverzeichnis auf
//     (nachgemessen). Damit greift die echte Glob-Zeile auf den Probebaum.
// Wer `"./lib/**/*.{js,mjs}"` entfernt, findet die Sonden nicht mehr, es
// entsteht keine Regel, und dieser Test wird rot. Genau das ist das
// Abnahmekriterium.
//
// ⚠️ DER NAME NENNT DIE EIGENSCHAFT, NICHT DIE DATEI – Lehre aus
// `ball-drehpunkt.spec.mjs`. Bewacht wird „`lib/` wird gescannt", nicht die
// Existenz einer bestimmten Zeile in einer bestimmten Konfigurationsdatei.
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const require = createRequire(import.meta.url);

// Willkürliche Längenwerte statt Farb- oder Abstands-Token: `mt-[137px]` hängt
// an KEINEM Theme-Wert. Wer die Palette umbaut, bricht diesen Test nicht – er
// misst die Reichweite der Konfiguration, nicht ihren Inhalt.
const SONDEN = {
  // Die Kernzusage: eine .js-Datei unmittelbar in `lib/`.
  oben: { klasse: "mt-[137px]", datei: "lib/sonde-oben.js" },
  // Die `**`-Zusage: eine .js-Datei in einem Unterordner von `lib/`.
  // ⚠️ `lib/` hat heute KEINE Unterordner – ein Rückbau auf `./lib/*.js` wäre
  // deshalb am Produkt unsichtbar und bliebe ohne diese Sonde unbemerkt, bis
  // jemand den ersten Unterordner anlegt.
  tief: { klasse: "mt-[139px]", datei: "lib/unterordner/sonde-tief.js" },
  // Die Endungs-Zusage: der Glob nennt ausdrücklich auch `mjs`.
  mjs: { klasse: "mt-[141px]", datei: "lib/sonde.mjs" },
};
// Diese Klasse wird NIRGENDS abgelegt. Taucht sie trotzdem im Ergebnis auf,
// misst der Test nicht die Sonden, sondern irgendetwas anderes (Safelist,
// fremde Quelle) – dann ist er wertlos, nicht bestanden.
const NEGATIVKONTROLLE = "mt-[143px]";

const regelDa = (css, klasse) =>
  css.includes(klasse.replace("[", "\\[").replace("]", "\\]"));

function tailwindUeberProbebaum() {
  const bin = path.join(PROJECT_ROOT, "node_modules", ".bin", "tailwindcss");
  if (!fs.existsSync(bin)) {
    throw new Error(
      `Das Tailwind-Werkzeug liegt nicht unter ${bin}. Ohne den echten ` +
        `Generator prüft dieser Test nichts – Befund am Test, nicht am Produkt.`,
    );
  }
  const konfig = path.join(PROJECT_ROOT, "tailwind.config.js");
  const cfg = require(konfig);
  // Ehrlichkeitsschranke: Auf eine Konfigurationsform, die dieser Test nicht
  // versteht, darf er nicht stillschweigend grün antworten.
  if (!Array.isArray(cfg?.content) || cfg.content.length === 0) {
    throw new Error(
      `\`content\` in tailwind.config.js ist kein nicht-leeres Array, sondern ` +
        `${JSON.stringify(cfg?.content)?.slice(0, 120)}. Diese Form kennt der ` +
        `Test nicht – er könnte hier nur raten. Befund am Test.`,
    );
  }

  const baum = fs.mkdtempSync(path.join(os.tmpdir(), "hg-libglob-"));
  try {
    for (const s of Object.values(SONDEN)) {
      const ziel = path.join(baum, s.datei);
      fs.mkdirSync(path.dirname(ziel), { recursive: true });
      fs.writeFileSync(ziel, `export const sonde = "${s.klasse}";\n`);
    }
    fs.writeFileSync(path.join(baum, "eingabe.css"), "@tailwind utilities;\n");
    // ⚠️ Der Probebaum liegt im System-Temp, NICHT im Projekt. Ein Test, der
    // in den Quellbaum schreibt, verändert seinen eigenen Ausgangszustand und
    // stört parallele Läufe – dieselbe Fehlerform, die in CLAUDE.md mehrfach
    // protokolliert ist.
    execFileSync(bin, ["-c", konfig, "-i", "eingabe.css", "-o", "ausgabe.css"], {
      cwd: baum,
      stdio: "pipe",
    });
    return {
      css: fs.readFileSync(path.join(baum, "ausgabe.css"), "utf8"),
      globs: cfg.content,
    };
  } finally {
    fs.rmSync(baum, { recursive: true, force: true });
  }
}

test.describe("Tailwind liest lib/", () => {
  test("eine Klasse, die es nur in lib/ gibt, erreicht das Stylesheet", () => {
    const { css, globs } = tailwindUeberProbebaum();

    // ── Ehrlichkeitsschranke: misst der Test überhaupt die Sonden? ────────
    expect(
      regelDa(css, NEGATIVKONTROLLE),
      `Die Negativkontrolle \`${NEGATIVKONTROLLE}\` steht in KEINER Datei des ` +
        `Probebaums und hat trotzdem eine Regel erzeugt. Dann misst dieser ` +
        `Test nicht, ob \`lib/\` gescannt wird, sondern irgendetwas anderes ` +
        `(eine Safelist, eine fremde Quelle). Befund am TEST, nicht am Produkt.`,
    ).toBe(false);

    // ── Die eigentliche Zusicherung ──────────────────────────────────────
    expect(
      regelDa(css, SONDEN.oben.klasse),
      `Eine Klasse in \`${SONDEN.oben.datei}\` erzeugt KEINE Regel – Tailwind ` +
        `liest \`lib/\` nicht.\n` +
        `Gefundene content-Globs: ${JSON.stringify(globs)}\n\n` +
        `Das ist Roadmap 36 in der Rückrichtung. Folge im Alltag: Wer in ` +
        `\`lib/ui.js\` eine Klasse setzt, die sonst nirgends steht, ändert ` +
        `nichts – die Regel entsteht nie, und es sieht nichts kaputt aus. ` +
        `Genau daran ist am 22.08.2026 eine Gegenprobe stillschweigend grün ` +
        `durchgelaufen. Abhilfe: \`"./lib/**/*.{js,mjs}"\` gehört in ` +
        `\`content\` in \`tailwind.config.js\`.`,
    ).toBe(true);
  });

  test("die Zusage des Globs gilt in der Tiefe und für beide Endungen", () => {
    const { css, globs } = tailwindUeberProbebaum();

    // ⚠️ Reihenfolge ist Absicht: Erst die Tiefe, dann die Endung. Ein
    // Testfall bricht bei der ersten fehlschlagenden Zusicherung ab – wer die
    // Gegenproben fährt, muss sie deshalb EINZELN fahren, sonst hält er einen
    // Lauf mit „1 failed" für den Beleg beider.
    expect(
      regelDa(css, SONDEN.tief.klasse),
      `Eine Klasse in \`${SONDEN.tief.datei}\` erzeugt keine Regel: Der Glob ` +
        `greift nur flach, nicht in Unterordner (typisch \`./lib/*.js\` statt ` +
        `\`./lib/**/*.js\`).\n` +
        `Gefundene content-Globs: ${JSON.stringify(globs)}\n\n` +
        `⚠️ Am Produkt wäre das HEUTE unsichtbar – \`lib/\` hat derzeit keine ` +
        `Unterordner. Der Schaden entstünde erst beim ersten, und dann sähe ` +
        `niemand einen Zusammenhang zur Konfiguration.`,
    ).toBe(true);

    expect(
      regelDa(css, SONDEN.mjs.klasse),
      `Eine Klasse in \`${SONDEN.mjs.datei}\` erzeugt keine Regel: Die Endung ` +
        `\`.mjs\` wird nicht mitgelesen (typisch ein Tippfehler in der ` +
        `Klammer, etwa \`{js,msj}\`).\n` +
        `Gefundene content-Globs: ${JSON.stringify(globs)}\n\n` +
        `Der Glob nennt \`mjs\` ausdrücklich. Wird die Endung bewusst ` +
        `gestrichen, ist das eine Entscheidung – dann gehört sie hier ` +
        `mitgeändert, statt dass der Test sie stillschweigend mitträgt.`,
    ).toBe(true);
  });
});
