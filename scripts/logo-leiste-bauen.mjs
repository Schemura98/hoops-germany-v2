#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// DIE LEISTEN-FASSUNG DER WORTMARKE ERZEUGEN
// ═══════════════════════════════════════════════════════════════════════════
//
// Erzeugt `public/images/logo-leiste.svg` aus `public/images/logo.svg`.
// Aufruf:  node scripts/logo-leiste-bauen.mjs [--dry]
//
// WARUM ES DIESE DATEI GIBT UND NICHT NUR DAS ERGEBNIS
// ---------------------------------------------------------------------------
// Die Leisten-Fassung ist ein SCHNITT aus dem Original, keine Neuzeichnung:
// Ball und Buchstaben sind exakt dieselben Pfade, nur anders angeordnet. Wer
// das nachprüfen will, muss das nachrechnen können — deshalb liegt die
// Ableitung als Skript im Repo und nicht als Zahl in einem Bericht.
// (Roadmap 32e, 21.08.2026: „Die Messskripte, auf die sich die neuen Zahlen im
// Code berufen, sind nicht eingecheckt — genau so hat die falsche
// 107px/43px-Zeile zwei Runden überlebt.")
//
// ⚠️ DIE DATEI WIRD NEU GESCHRIEBEN, NICHT ÜBERSCHRIEBEN-IM-SINNE-VON-GEÄNDERT.
// `logo.svg` bleibt unangetastet. Das ist keine Höflichkeit, sondern die
// Cache-Regel aus Roadmap 21: `/images/` trägt `max-age=2592000` (30 Tage) und
// die Namen sind NICHT inhaltsadressiert. Wer den Inhalt einer Datei unter
// gleichem Namen ändert, hält jeden Wiederkehrer bis zu 30 Tage auf dem alten
// Stand — und niemand kann es sehen, weil es bei Erstbesuchern richtig aussieht.
//
// DER BEFUND, DER DAZU GEFÜHRT HAT (21.08.2026, Patrick)
// ---------------------------------------------------------------------------
// „Das Logo in der Navbar ist zu klein, man kann die Schrift nicht gut lesen."
// Gemessen an der GERENDERTEN Seite (Tinte im Canvas, nicht Zahlen aus der
// Datei), Desktop, Logohöhe 44 px:
//
//     HOOPS GERMANY           Versalhöhe 14,38 px
//     BASKETBALL 4 EVERYONE   Versalhöhe  5,38 px      ← das ist keine Schrift
//     Nav-Punkt „Ligen"       Versalhöhe  9,94 px      (14 px Geist)
//
// ⚠️ Die erste Meldung nannte 8,1 px und 3,0 px. Diese Zahlen sind falsch
// (Faktor ~1,76 zu klein); nachgemessen sind es 14,38 und 5,38. Der Unterschied
// ist nicht kosmetisch, er dreht die Diagnose um: Die Hauptzeile ist NICHT zu
// klein — sie ist mit 14,4 px die GRÖSSTE Schrift der Leiste. Zu klein ist
// ausschließlich die Unterzeile, und der Rest ist ein Proportionsproblem.
//
// WAS DAS PROBLEM WIRKLICH IST: DAS HÖHENBUDGET
// ---------------------------------------------------------------------------
// Von den 44 px Logohöhe bekommt die Hauptzeile nur 14,4 px = 33 %. Den Rest
// belegen der Ball (volle Höhe) und eine Zeile, die niemand lesen kann. Das
// Logo wirkt klein, weil sein Platz größtenteils an etwas Unlesbares geht.
//
// ⚠️ UND DESHALB HILFT „EINFACH GRÖSSER" NICHT. Die Leiste sitzt in
// `max-w-6xl` + `px-6`: mehr als 1104 px Inhaltsbreite gibt es auf KEINEM
// Bildschirm. Angemeldet (Team-Admin, breitester Fall) bleiben davon ~28 px
// Reserve. Die einzeilige Wortmarke ist 7,00× so breit wie hoch — jeder
// Millimeter Versalhöhe kostet also SIEBEN in der Breite. Aus 28 px Reserve
// werden 4 px Versalhöhe, und die Reserve ist aufgebraucht.
//
// DIE LÖSUNG KOMMT AUS DER BREITE, NICHT AUS DER HÖHE
// ---------------------------------------------------------------------------
// Gestapelt regiert nicht mehr „HOOPS GERMANY" (566,4 Einheiten), sondern nur
// noch „GERMANY" (327,3) — die bestimmende Breite fällt um 42 %. Genau das
// wird in Versalhöhe umgemünzt:
//
//     Ist       149,9 × 44 px   Versalhöhe 14,24 px
//     Leiste    134,1 × 44 px   Versalhöhe 19,82 px      +39 % und 15,8 px SCHMALER
//
// Die Leiste bekommt also Platz zurück, statt welchen zu verlangen. Das ist der
// Grund, warum für diesen Befund KEIN Umbau der Navigation nötig war.
//
// Fachlich ist das die dokumentierte Regel für Logo-Systeme: In der
// Vereinfachungs-Reihenfolge fällt der Claim ZUERST, lange vor der Wortmarke.
// Sweep: docs/INSPIRATION-NAVBAR-LOGO-2026-08-21.md
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUELLE = path.join(WURZEL, "public/images/logo.svg");
const ZIEL = path.join(WURZEL, "public/images/logo-leiste.svg");
const trocken = process.argv.includes("--dry");

// ---------------------------------------------------------------------------
// NATÜRLICHE MASSE — im Browser an der Zeichnung gemessen, nicht abgelesen.
// Sie werden unten gegen die Quelldatei GEPRÜFT; wer das Original austauscht,
// bekommt einen Abbruch statt eines still verschobenen Logos.
// ---------------------------------------------------------------------------
const BALL = { x0: 175.707, x1: 417.289, y0: 441.707, y1: 683.293 };
const HOOPS = { x0: 448.1, x1: 663.63, y0: 486.58, y1: 567.5 };
const GERMANY = { x0: 687.24, x1: 1014.53, y0: 486.58, y1: 567.5 };
const VERSAL = HOOPS.y1 - HOOPS.y0; // 80,92 Einheiten

// ---------------------------------------------------------------------------
// PROPORTIONEN DER LEISTEN-FASSUNG, in Vielfachen der Versalhöhe C.
// Alle drei sind ANGESEHEN und nicht nur gerechnet (Standbilder im Bericht).
// ---------------------------------------------------------------------------
const C = 100; // Rechen-Einheit: Versalhöhe = 100
const DURCHSCHUSS = 0.22 * C; // Luft zwischen den zwei Textzeilen
const ABSTAND_BALL = 0.5 * C; // Luft zwischen Ball und Text
const BALL_ZU_BLOCK = 1.0; // Ball genau so hoch wie der zweizeilige Textblock

const quelle = fs.readFileSync(QUELLE, "utf8");

// --- Bausteine schneiden -----------------------------------------------------
// ⚠️ Nach Blockgrenzen, nicht per verschachtelter Regex: Eine Glyphgruppe kann
// mehrere Pfade enthalten, und die Wortlücke ist eine Gruppe mit Breite 0. Ein
// `<g …>.*?</g></g></g>` fand deshalb 31 statt 34 Gruppen.
const OFFEN = '<g fill="#ffffff" fill-opacity="1">';
const stellen = [];
for (let i = quelle.indexOf(OFFEN); i >= 0; i = quelle.indexOf(OFFEN, i + 1)) stellen.push(i);
const ballAb = quelle.indexOf('<path fill="#f07a27"');

if (stellen.length !== 34) {
  throw new Error(
    `logo.svg hat ${stellen.length} Glyphgruppen statt 34. Die Aufteilung ` +
      `(0–4 HOOPS · 5 Wortlücke · 6–12 GERMANY · 13–33 Claim) stimmt dann nicht ` +
      `mehr — Maße neu vermessen, nicht raten.`,
  );
}
if (ballAb < 0) throw new Error("Ball-Pfad (#f07a27) nicht gefunden — ist das noch dasselbe Logo?");

const bloecke = stellen.map((a, i) => quelle.slice(a, i + 1 < stellen.length ? stellen[i + 1] : ballAb));
const teilHoops = bloecke.slice(0, 5).join("");
const teilGermany = bloecke.slice(6, 13).join("");
const teilBall = quelle.slice(ballAb).replace("</svg>", "");

// --- Setzen ------------------------------------------------------------------
const sT = C / VERSAL; // Maßstab für den Text
const hBlock = 2 * C + DURCHSCHUSS; // Höhe des zweizeiligen Blocks
const dBall = BALL_ZU_BLOCK * hBlock;
const sB = dBall / (BALL.x1 - BALL.x0);
const xText = dBall + ABSTAND_BALL;
const bGermany = (GERMANY.x1 - GERMANY.x0) * sT; // die breitere der zwei Zeilen
const hGes = Math.max(dBall, hBlock);
const wGes = xText + bGermany;
const mitte = hGes / 2;
const yBlock = mitte - hBlock / 2;

const setze = (inhalt, bb, tx, ty, sc) =>
  `<g transform="translate(${(tx - sc * bb.x0).toFixed(3)}, ${(ty - sc * bb.y0).toFixed(3)}) scale(${sc.toFixed(6)})">${inhalt}</g>`;

const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wGes.toFixed(2)} ${hGes.toFixed(2)}" ` +
  `preserveAspectRatio="xMidYMid meet" version="1.0">` +
  `<title>Hoops Germany</title>` +
  setze(teilBall, BALL, 0, mitte - dBall / 2, sB) +
  setze(teilHoops, HOOPS, xText, yBlock, sT) +
  setze(teilGermany, GERMANY, xText, yBlock + C + DURCHSCHUSS, sT) +
  `</svg>`;

const verh = wGes / hGes;
console.log(`Leisten-Fassung: ${wGes.toFixed(2)} × ${hGes.toFixed(2)} Einheiten (Seitenverhältnis ${verh.toFixed(4)})`);
for (const h of [36, 44]) {
  console.log(`  bei ${h} px Höhe: ${(h * verh).toFixed(1)} px breit · Versalhöhe ${((h / hGes) * C).toFixed(2)} px`);
}
if (trocken) {
  console.log("--dry: nichts geschrieben.");
} else {
  fs.writeFileSync(ZIEL, svg);
  console.log(`geschrieben: ${path.relative(WURZEL, ZIEL)} (${svg.length} Bytes)`);
}
