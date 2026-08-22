// Eingabefelder: die Fläche steht in der Palette, der Platzhalter ist lesbar.
//
// ═══════════════════════════════════════════════════════════════════════════
// WARUM ES DIESEN WÄCHTER GIBT (Gate Kai, 22.08.2026)
// ═══════════════════════════════════════════════════════════════════════════
// Zwei Befunde aus derselben Runde, beide an Eingabefeldern, beide still:
//
// (1) DIE FEHLENDE FLÄCHE. Zwölf Felder hatten GAR KEINE Flächenklasse – drei
//     im Feed (Beitrag, Kommentar, Antwort), neun weitere. Ein Feld ohne
//     eigene Fläche bekommt die des Browsers, und weil `app/globals.css`
//     `color-scheme: dark` setzt, ist das ein neutrales Dunkelgrau: am
//     laufenden Browser gemessen `rgb(59, 59, 59)`.
//     ⚠️ Dieser Wert ist kein falsch gewählter Farbton – er ist GAR KEINER.
//     In `tailwind.config.js` kommt er nicht vor. Ein Test, der Klassennamen
//     liest, kann das prinzipiell nicht finden: Es gab keine Klasse zu lesen.
//
// (2) DER UNLESBARE PLATZHALTER (Auflage Tobias). `placeholder:text-navy-500`
//     stand in `lib/ui.js`. Auf der Feldfläche navy-700 sind das **2,38 : 1**;
//     mist-400 hält dort **6,16 : 1**. (Beide Werte für diesen Test unabhängig
//     nachgerechnet, nicht aus dem Bericht übernommen.)
//
// ⚠️ WARUM ES ZWEI PRÜFUNGEN SIND UND NICHT EINE – das ist der Punkt, an dem
// dieser Test hängt. Sie sehen einander nicht:
//   · Eine reine PALETTEN-Prüfung ist für (2) blind. navy-500 steht völlig
//     legitim in der Palette; unlesbar ist nicht die Farbe, sondern die
//     Paarung aus Farbe und Grund.
//   · Eine reine KONTRAST-Prüfung ist für (1) blind. Gemessen hält mist-400
//     auf der Browser-Vorgabe rgb(59,59,59) noch **5,37 : 1** – also über AA.
//     Der graue Fleck wäre bestanden.
// Wer eine der beiden für redundant hält und streicht, öffnet genau einen der
// beiden Befunde wieder, und nichts sieht kaputt aus.
//
// ⚠️ FÜR DEN NÄCHSTEN, DER DIE GEGENPROBE FÄHRT – ES IST EINE FALLE, UND SIE
// HAT MICH ERWISCHT: Wer den Platzhalter in `lib/ui.js` auf navy-500
// zurückdreht, um zu sehen, ob dieser Test rot wird, bekommt GRÜN – und zwar
// zu Recht. `lib/` steht NICHT in den `content`-Globs von
// `tailwind.config.js` (dort stehen nur `pages/`, `components/`, `app/`).
// Die Klasse wird also gar nicht erst erzeugt; am Live-Stylesheet nachgemessen
// kommt `placeholder:text-navy-500` dort NULL mal vor. Die Mutation hat keine
// Wirkung, der Test ist zu Recht grün, und wer daraus schließt, der Wächter
// tauge nichts, irrt.
// **Die Gegenprobe muss in einer Datei stattfinden, die Tailwind einliest** –
// z. B. `components/posts/PostCard.js`. So gefahren wird sie rot, gemessen
// 2,38 : 1. (Der Zustand von `lib/` selbst ist als Roadmap 36 protokolliert.)
//
// ⚠️ DIE SOLLWERTE WERDEN GELESEN, NICHT ABGESCHRIEBEN. Die Palette kommt zur
// Laufzeit aus `tailwind.config.js`. Wer dort eine Stufe ergänzt, muss diesen
// Test nicht anfassen; wer eine Farbe von Hand hineinschreibt, die es im
// System nicht gibt, wird rot. Eine abgeschriebene Liste wäre die x-te
// Auflage von „gesetzte Zahl gegen Restbetrag" (CLAUDE.md).
//
// ⚠️ DER NAME NENNT DIE EIGENSCHAFT, NICHT DAS BAUTEIL – Lehre aus
// `ball-drehpunkt.spec.mjs`. Weder „Feed" noch ein Komponentenname steht
// darin: Bewacht wird die Lesbarkeit von Eingabefeldern, und die Liste der
// geprüften Flächen darf wachsen, ohne dass die Datei umbenannt werden muss.
import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import { PROJECT_ROOT } from "./helpers/env.mjs";

const require = createRequire(import.meta.url);

// 4.5 : 1 ist die WCAG-AA-Grenze für normalen Text – eine fremde, gesetzte
// Zahl, keine hier gewählte. Sie liegt zwischen den beiden gemessenen
// Zuständen (alt 2,38 · neu 6,16), fängt also den Rückfall und lässt den
// ausgelieferten Stand mit Abstand durch.
const AA = 4.5;

// ⚠️ NUR TEXTEINGABEN – und das ist eine Abgrenzung nach Sachlage, nicht nach
// „was sonst rot wird". Beide Befunde betreffen Felder, in die man SCHREIBT:
// Sie tragen eine Fläche, auf der Text steht, und einen Platzhalter. Eine
// Checkbox hat beides nicht – sie ist ein natives Bedienelement, das der
// Browser selbst zeichnet, und ihr `background-color` ist regulär
// durchsichtig (auf /signup gemessen: 3× `rgba(0, 0, 0, 0)`). Sie gegen eine
// Farbpalette zu halten wäre eine Aussage über den falschen Gegenstand.
// ⚠️ Die Liste ist eine POSITIVLISTE: Ein künftiger Feldtyp fällt heraus und
// muss bewusst aufgenommen werden. Andersherum (Sperrliste) würde ein neuer
// Typ still ungeprüft mitlaufen.
const TEXTEINGABEN = [
  "text", "email", "password", "search", "url", "tel",
  "number", "date", "datetime-local", "time", "month", "week",
];

// ── Die Palette aus der einen Quelle lesen ────────────────────────────────
function palette() {
  const cfg = require(path.join(PROJECT_ROOT, "tailwind.config.js"));
  const farben = cfg?.theme?.extend?.colors;
  // Ehrlichkeitsschranke: Findet der Test die Palette nicht, darf er nicht
  // gegen eine leere Menge prüfen und dabei fröhlich grün bleiben.
  if (!farben || Object.keys(farben).length === 0) {
    throw new Error(
      "In tailwind.config.js steht unter theme.extend.colors nichts. Ohne " +
        "Sollwerte prüft dieser Test nichts – das ist ein Befund am Test, " +
        "nicht am Produkt.",
    );
  }
  const alsRgb = (hex) => {
    const h = hex.replace("#", "");
    return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
  };
  const map = new Map();
  for (const [familie, stufen] of Object.entries(farben)) {
    for (const [stufe, hex] of Object.entries(stufen)) {
      if (typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex)) {
        map.set(alsRgb(hex), `${familie}-${stufe}`);
      }
    }
  }
  return map;
}

const zahlen = (s) => (s.match(/[\d.]+/g) || []).map(Number);
function leuchtdichte(rgb) {
  const [r, g, b] = zahlen(rgb).slice(0, 3).map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(a, b) {
  const x = leuchtdichte(a);
  const y = leuchtdichte(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

async function anmelden(request) {
  const res = await request.post("/api/player/playerlogin", {
    data: { email: "max@test.de", password: "test123" },
  });
  const j = await res.json().catch(() => ({}));
  const token = j?.data?.token || j?.token;
  expect(
    typeof token === "string" && token.length > 20,
    `Kein Token – ohne Anmeldung gibt es den Feed nicht, und dieser Test ` +
      `prüft dann nichts. Antwort: ${JSON.stringify(j).slice(0, 160)}`,
  ).toBe(true);
  return token;
}

// ⚠️ Zwei der drei Feed-Felder sind erst NACH einer Bedienung da: Der
// Composer startet auf `/player/newsfeed` eingeklappt (`compactComposer`), das
// Kommentarfeld erscheint erst beim Aufklappen. Ein Test, der nur misst, was
// ohne Zutun dasteht, hätte zwei der drei Auslassungen nie gesehen – und
// genau deshalb sind sie monatelang niemandem aufgefallen.
async function feedFelderOeffnen(page) {
  const composer = page.getByRole("button", { name: /Was gibt.s Neues/i }).first();
  if (await composer.isVisible().catch(() => false)) {
    await composer.click();
    await page.waitForSelector("main textarea", { timeout: 10_000 });
  }
  const kommentare = page.locator("main button[aria-expanded]").first();
  if (await kommentare.isVisible().catch(() => false)) {
    await kommentare.click();
    await page.waitForSelector("main input[placeholder]", { timeout: 10_000 }).catch(() => {});
  }
}

async function felderMessen(page) {
  return page.evaluate((erlaubt) =>
    [...document.querySelectorAll("main textarea, main input")]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        if (e.tagName.toLowerCase() === "textarea") return true;
        // `type` fehlt = <input> ohne Angabe = Text (HTML-Vorgabe).
        return erlaubt.includes((e.getAttribute("type") || "text").toLowerCase());
      })
      .map((e) => {
        const s = getComputedStyle(e);
        // Die Platzhalterfarbe steht am Pseudo-Element, nicht am Feld.
        const p = getComputedStyle(e, "::placeholder");
        return {
          tag: e.tagName.toLowerCase(),
          typ: e.getAttribute("type") || "-",
          platzhalter: (e.getAttribute("placeholder") || "").slice(0, 34),
          flaeche: s.backgroundColor,
          schrift: s.color,
          platzhalterFarbe: p.color,
        };
      }),
  TEXTEINGABEN);
}

const FLAECHEN = [
  {
    pfad: "/signup",
    warum:
      "öffentlich und zieht `inputClass` aus `lib/ui.js` – die eine Stelle, " +
      "an der die Feldklassen für den größten Teil der Plattform stehen",
    anmelden: false,
    mindestens: 4,
    oeffnen: null,
  },
  {
    pfad: "/player/newsfeed",
    warum: "hier standen drei der zwölf Felder ohne jede Flächenklasse",
    anmelden: true,
    mindestens: 2,
    oeffnen: feedFelderOeffnen,
  },
];

test.describe("Eingabefelder – Fläche und Platzhalter", () => {
  for (const fl of FLAECHEN) {
    test(`${fl.pfad}: jede Feldfläche steht in der Palette, jeder Platzhalter hält AA`, async ({
      page,
      request,
    }) => {
      const PALETTE = palette();

      if (fl.anmelden) {
        const token = await anmelden(request);
        await page.addInitScript((t) => {
          localStorage.setItem("playerAuthToken", t);
          // Sonst startet die Willkommens-Tour und legt sich über die Seite.
          sessionStorage.setItem("hg_welcome_token", t);
        }, token);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      // Der Nachrichtenfeed ist eine fremde Quelle. Ein Wächter, dessen
      // Auslösung davon abhängt, was ein Verlag heute veröffentlicht, ist
      // keiner (Lehre aus `nachrichten-karten.spec.mjs`).
      await page.route("**/api/news/rss", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, news: [] }),
        }),
      );
      await page.goto(fl.pfad, { waitUntil: "domcontentloaded" });
      if (fl.anmelden) {
        await page.waitForSelector("main button[aria-pressed]", { timeout: 30_000 });
      } else {
        await page.waitForSelector("main input", { timeout: 30_000 });
      }
      if (fl.oeffnen) await fl.oeffnen(page);

      const felder = await felderMessen(page);

      // ── Ehrlichkeitsschranke 1: gibt es überhaupt etwas zu messen? ──────
      // Findet der Test kein Feld, hat er NICHTS geprüft. Das ist kein
      // Bestehen. Genau dieser Fehler steckte laut CLAUDE.md schon einmal im
      // Klarnamen-Test des Sponsor-Reports („bei leerer Liste lief er ins
      // Nichts").
      expect(
        felder.length,
        `Auf ${fl.pfad} wurden nur ${felder.length} sichtbare Texteingaben ` +
          `gefunden, erwartet mindestens ${fl.mindestens} (${fl.warum}). ` +
          `Entweder ist das Aufklappen kaputt oder die Felder sind weg – ` +
          `beides ist ein Befund, kein grüner Lauf.`,
      ).toBeGreaterThanOrEqual(fl.mindestens);

      // ── Prüfung 1: die Fläche steht in der Palette ─────────────────────
      const fremd = felder.filter((x) => !PALETTE.has(x.flaeche));
      expect(
        fremd.map((x) => `<${x.tag} type=${x.typ}> „${x.platzhalter}" → ${x.flaeche}`),
        `Diese Eingabefelder auf ${fl.pfad} rendern eine Fläche, die es in ` +
          `der Palette (tailwind.config.js) nicht gibt. Der typische Fall ist ` +
          `NICHT ein falsch gewählter Farbton, sondern eine FEHLENDE ` +
          `Flächenklasse: Das Feld bekommt dann die Browser-Vorgabe, und die ` +
          `ist unter \`color-scheme: dark\` ein neutrales Dunkelgrau ` +
          `(rgb(59, 59, 59)) – ein warmer grauer Fleck in einer durchweg ` +
          `blauen Fläche. Erwartet wird die Eingabefeld-Stufe navy-700, so ` +
          `wie \`inputClass\` in \`lib/ui.js\` sie für jedes andere ` +
          `Formularfeld der Plattform setzt. ` +
          `(Insgesamt gemessen: ${felder.length} Felder.)`,
      ).toEqual([]);

      // ── Ehrlichkeitsschranke 2: hat die Platzhalter-Sonde gegriffen? ───
      // `getComputedStyle(el, "::placeholder")` liefert in manchen Browsern
      // schlicht die Schriftfarbe des Feldes zurück. Dann misst die Prüfung
      // unten den Text statt den Platzhalter und ist immer grün. Wenn KEIN
      // einziges Feld einen Unterschied zeigt, ist das ein Befund am TEST.
      const mitPlatzhalter = felder.filter((x) => x.platzhalter);
      expect(
        mitPlatzhalter.length,
        `Kein Feld auf ${fl.pfad} hat einen Platzhalter – dann prüft die ` +
          `Kontrastmessung unten nichts.`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        mitPlatzhalter.some((x) => x.platzhalterFarbe !== x.schrift),
        `Bei allen ${mitPlatzhalter.length} Feldern ist die gemessene ` +
          `Platzhalterfarbe identisch mit der Schriftfarbe. Sehr ` +
          `wahrscheinlich hat die Sonde \`::placeholder\` nicht gegriffen ` +
          `und misst den Text statt den Platzhalter – dann wäre diese ` +
          `Prüfung dauerhaft grün, ohne etwas zu sichern. Befund am TEST, ` +
          `nicht am Produkt.`,
      ).toBe(true);

      // ── Prüfung 2: der Platzhalter ist lesbar ──────────────────────────
      const blass = mitPlatzhalter
        .map((x) => ({ ...x, k: kontrast(x.platzhalterFarbe, x.flaeche) }))
        .filter((x) => x.k < AA);
      expect(
        blass.map(
          (x) =>
            `<${x.tag}> „${x.platzhalter}" → ${x.platzhalterFarbe} auf ` +
            `${x.flaeche} = ${x.k.toFixed(2)} : 1`,
        ),
        `Diese Platzhalter auf ${fl.pfad} unterschreiten die AA-Grenze von ` +
          `${AA} : 1 gegen ihre eigene Feldfläche. Das war Tobias' Auflage ` +
          `vom 22.08.2026: \`placeholder:text-navy-500\` ergibt auf navy-700 ` +
          `nur 2,38 : 1, mist-400 dort 6,16 : 1. ` +
          `⚠️ Die Palette allein fängt das NICHT: navy-500 ist ein völlig ` +
          `legitimer Token. Unlesbar ist nicht die Farbe, sondern die Paarung ` +
          `aus Farbe und Grund.`,
      ).toEqual([]);
    });
  }
});
