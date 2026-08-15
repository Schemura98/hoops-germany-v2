// Erzeugt eine Bildsequenz "rotierender Basketball" als Sprite-Streifen.
// Auftrag Patrick, 15.08.2026 ("Qualität geht vor Quantität, Zeit ist da").
//
// ══ WARUM DIESES SKRIPT UND NICHT BLENDER ODER EIN FOTO ══════════════════
//
// Der Streckenball auf der Startseite drehte sich bisher per CSS `rotate()`.
// Das ist eine FLÄCHENDREHUNG: Der Ball dreht sich wie ein Rad um seinen
// Mittelpunkt, die Nähte laufen im Kreis. Ein echter Ball rotiert um eine
// Achse IM RAUM – seine Nähte wandern über die Kugel, verschwinden am Rand
// und tauchen gegenüber wieder auf. Bei 20px trägt die Täuschung, ab etwa
// 40px kippt sie sichtbar (Befund beim Bau am 15.08.2026).
//
// Naheliegend wäre ein fotorealistischer Ball. Zwei Gründe dagegen, beide
// nicht ästhetisch:
//   1. Die Designsprache verbietet Verläufe, Schatten und Glow (Spezifikation
//      docs/VISUELLE-RICHTUNG-2026-08-12.md). Ein Fotoball bräche sie an
//      genau der Stelle, die am meisten gesehen wird.
//   2. Der Defekt ist nicht fehlender Realismus, sondern fehlende
//      Kugelbewegung. Fotorealismus löst ein Problem, das wir nicht haben,
//      und schafft eines, das wir hatten.
//
// Deshalb: echte 3D-Geometrie, flach gefärbt. Die Nähte sind Großkreise auf
// einer Kugel, werden im Raum gedreht, orthografisch projiziert und NUR auf
// der vorderen Halbkugel gezeichnet (z >= 0). Das ergibt exakt die Bewegung,
// die fehlt – ohne ein einziges Pixel Fotomaterial und ohne die Farbregeln
// zu verletzen.
//
// ══ ABHÄNGIGKEIT ═════════════════════════════════════════════════════════
// `sharp` liegt bewusst NICHT im Projekt – dieses Skript läuft nur bei der
// Erzeugung der Bilder auf dem Entwicklungsrechner, nie im Browser, nie im
// Build. Es kommt aus dem Werkzeug-Ordner (Muster wie
// scripts/generate-swish-sequence.js).
//
// Aufruf:  node scripts/generate-ball-rotation.mjs [--frames 32] [--groesse 200]
//                                                 [--muster basketball] [--out tmp]
// Die Vorgabewerte erzeugen GENAU das ausgelieferte Asset (Befund Kai B4:
// vorher standen sie auf 48x160 und erzeugten damit eine Datei, die nirgends
// verwendet wird - der reproduzierende Aufruf stand nirgends).

import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const WERKZEUGE =
  process.env.HOOPS_SHARP_PFAD ||
  path.join(os.homedir(), "Projekte", "Hoops-Marketing", "_werkzeuge");

let sharp;
try {
  sharp = createRequire(path.join(WERKZEUGE, "package.json"))("sharp");
} catch (e) {
  console.error(
    `sharp nicht gefunden.\n` +
      `Erwartet im Werkzeug-Ordner: ${WERKZEUGE}\n` +
      `Dort einmalig "npm install" ausfuehren, oder HOOPS_SHARP_PFAD setzen.\n` +
      `Grund: ${e.message}`
  );
  process.exit(1);
}

// ── Parameter ────────────────────────────────────────────────────────────
const arg = (name, vorgabe) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : vorgabe;
};
const FRAMES = Number(arg("frames", 32));
const GROESSE = Number(arg("groesse", 200)); // Kantenlänge eines Einzelbildes
const OUT = arg("out", "tmp");
const MUSTER = arg("muster", "basketball"); // basketball | wasserball

// Farben exakt aus tailwind.config.js – nicht geschätzt.
const ORANGE = "#F07A27"; // brand-500
const NAHT = "#0B1220"; // navy-950
const NAHT_DECK = 0.42;

// ── Geometrie ────────────────────────────────────────────────────────────
// Die Nähte eines 8-Panel-Balls: zwei senkrecht zueinander stehende
// Großkreise (das "Kreuz") und zwei seitliche Bögen. Alle vier sind
// Großkreise – sie unterscheiden sich nur durch die Lage ihrer Ebene, also
// durch ihren Normalenvektor.
// Jede Naht: { n: Normale der Ebene, d: Abstand der Ebene vom Mittelpunkt }.
// d = 0 ergibt einen Großkreis, |d| > 0 einen kleineren Kreis weiter außen.
//
// ⚠️ WARUM DER ABSTAND ENTSCHEIDEND IST (Befund beim ersten Rendern):
// Vier Großkreise laufen zwangsläufig alle durch DIESELBEN zwei Pole. Beim
// Drehen entsteht daraus ein Windrad-Muster – erkennbar als Wasserball, nicht
// als Basketball. Ein echter Ball hat zwei Großkreise ("das Kreuz") und zwei
// Nähte, die daneben liegen und die Pole NICHT berühren. Genau das leistet d.
const NAEHTE = {
  // Der erste Versuch: vier Großkreise. Bleibt als Vergleich dokumentiert.
  wasserball: [
    { n: [1, 0, 0], d: 0 },
    { n: [0, 1, 0], d: 0 },
    { n: [Math.SQRT1_2, 0, Math.SQRT1_2], d: 0 },
    { n: [-Math.SQRT1_2, 0, Math.SQRT1_2], d: 0 },
  ],
  // Basketball: zwei Großkreise über Kreuz, dazu zwei versetzte Nähte, die
  // an den Polen vorbeilaufen.
  basketball: [
    { n: [1, 0, 0], d: 0 },
    { n: [0, 1, 0], d: 0 },
    { n: [0, 0, 1], d: 0.52 },
    { n: [0, 0, 1], d: -0.52 },
  ],
};

// Zwei orthonormale Vektoren, die die Ebene zum Normalenvektor aufspannen.
function ebeneZu(n) {
  const hilf = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const kreuz = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const norm = (v) => {
    const l = Math.hypot(...v);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const u = norm(kreuz(n, hilf));
  return [u, norm(kreuz(n, u))];
}

// Drehung um eine geneigte Achse. Die Neigung ist der Grund, warum der Ball
// nicht wie ein Globus wirkt: Eine rein senkrechte Achse liest sich als
// Drehung um den Mittelpunkt, also wieder als Rad.
const ACHSE = (() => {
  const v = [0.34, 1, 0.18];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

// Rodrigues-Formel: dreht Punkt p um die Einheitsachse k um den Winkel w.
function drehen(p, k, w) {
  const c = Math.cos(w);
  const s = Math.sin(w);
  const kp = k[0] * p[0] + k[1] * p[1] + k[2] * p[2];
  return [
    p[0] * c + (k[1] * p[2] - k[2] * p[1]) * s + k[0] * kp * (1 - c),
    p[1] * c + (k[2] * p[0] - k[0] * p[2]) * s + k[1] * kp * (1 - c),
    p[2] * c + (k[0] * p[1] - k[1] * p[0]) * s + k[2] * kp * (1 - c),
  ];
}

// Ein Einzelbild als SVG. `winkel` in Bogenmaß.
function frameSvg(winkel) {
  const R = GROESSE / 2;
  const r = R * 0.94; // etwas Luft, damit die Kontur nicht anschneidet
  const M = R;
  const SCHRITTE = 220;

  let pfade = "";
  for (const { n, d } of NAEHTE[MUSTER]) {
    const [u, v] = ebeneZu(n);
    // Kreis im Abstand d von der Mitte: Sein Radius schrumpft nach Pythagoras,
    // und sein Mittelpunkt wandert um d entlang der Normalen aus der Kugelmitte.
    const kr = Math.sqrt(Math.max(0, 1 - d * d));
    // Sichtbare Teilstücke sammeln: Sobald z unter 0 fällt, ist die Naht
    // hinter der Kugel und der Pfad muss abreissen – genau das erzeugt den
    // Eindruck einer Kugel statt einer Scheibe.
    let stueck = [];
    const stuecke = [];
    for (let i = 0; i <= SCHRITTE; i++) {
      const t = (i / SCHRITTE) * Math.PI * 2;
      const p0 = [
        (u[0] * Math.cos(t) + v[0] * Math.sin(t)) * kr + n[0] * d,
        (u[1] * Math.cos(t) + v[1] * Math.sin(t)) * kr + n[1] * d,
        (u[2] * Math.cos(t) + v[2] * Math.sin(t)) * kr + n[2] * d,
      ];
      const p = drehen(p0, ACHSE, winkel);
      if (p[2] >= 0) {
        stueck.push(`${(M + p[0] * r).toFixed(2)} ${(M - p[1] * r).toFixed(2)}`);
      } else if (stueck.length) {
        stuecke.push(stueck);
        stueck = [];
      }
    }
    if (stueck.length) stuecke.push(stueck);
    for (const s of stuecke) {
      if (s.length < 2) continue;
      pfade += `<path d="M${s.join(" L")}" fill="none" stroke="${NAHT}" stroke-opacity="${NAHT_DECK}" stroke-width="${(
        GROESSE * 0.028
      ).toFixed(2)}" stroke-linecap="round"/>`;
    }
  }

  // ══ PLASTIZITÄT (Freigabe Patrick, 15.08.2026: "Verläufe, Schatten und Glow,
  //    wenn es gut eingesetzt wird") ══════════════════════════════════════
  //
  // Ohne Schattierung ist eine Kugel eine Scheibe – die Nähte allein tragen
  // die Räumlichkeit nicht. Hier sind drei Mittel im Einsatz, jedes mit
  // genau einer Aufgabe, keines als Dekoration:
  //
  //   1. Körperverlauf: Licht von oben links, zum Terminator hin abfallend.
  //      Das ist die Hauptinformation "das ist eine Kugel".
  //   2. Kantenabdunklung: der äußerste Rand läuft dunkler aus. Ohne sie
  //      wirkt der Ball wie eine beleuchtete Scheibe, weil die Silhouette
  //      genauso hell bleibt wie die Mitte.
  //   3. Aufhellung unten rechts (Bouncelight): schwach, aber sie trennt die
  //      Kugel vom dunklen Grund. Ohne sie klebt die Schattenseite auf navy.
  //
  // Bewusst NICHT dabei: ein Glanzpunkt/Specular. Er würde eine Lichtquelle
  // und eine Materialoberfläche behaupten, die es hier nicht gibt – und er
  // ist das erste, was bei kleinen Größen zu einem weißen Fleck verklumpt.
  const lichtId = `bl${Math.round(winkel * 1000)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${GROESSE}" height="${GROESSE}" viewBox="0 0 ${GROESSE} ${GROESSE}">
<defs>
  <radialGradient id="koerper${lichtId}" cx="34%" cy="28%" r="82%">
    <stop offset="0%" stop-color="#FFB070"/>
    <stop offset="42%" stop-color="${ORANGE}"/>
    <stop offset="100%" stop-color="#8F3D0A"/>
  </radialGradient>
  <radialGradient id="kante${lichtId}" cx="50%" cy="50%" r="50%">
    <stop offset="82%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
  </radialGradient>
  <radialGradient id="bounce${lichtId}" cx="72%" cy="82%" r="40%">
    <stop offset="0%" stop-color="#FF9A4D" stop-opacity="0.30"/>
    <stop offset="100%" stop-color="#FF9A4D" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="kugel${lichtId}"><circle cx="${M}" cy="${M}" r="${r}"/></clipPath>
</defs>
<circle cx="${M}" cy="${M}" r="${r}" fill="url(#koerper${lichtId})"/>
<g clip-path="url(#kugel${lichtId})">${pfade}</g>
<circle cx="${M}" cy="${M}" r="${r}" fill="url(#bounce${lichtId})"/>
<circle cx="${M}" cy="${M}" r="${r}" fill="url(#kante${lichtId})"/>
</svg>`;
}

// ── Erzeugen ─────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true });

const bilder = [];
for (let f = 0; f < FRAMES; f++) {
  const winkel = (f / FRAMES) * Math.PI * 2;
  const svg = frameSvg(winkel);
  bilder.push(await sharp(Buffer.from(svg)).png().toBuffer());
}

// Sprite-STREIFEN statt Einzeldateien: ein Netzwerkabruf statt FRAMES viele,
// und die Anzeige wechselt allein über background-position – kein Nachladen
// mitten in der Bewegung, kein Flackern beim ersten Durchlauf.
const streifen = await sharp({
  create: {
    width: GROESSE * FRAMES,
    height: GROESSE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(bilder.map((input, i) => ({ input, left: GROESSE * i, top: 0 })))
  .png()
  .toBuffer();

const basis = path.join(OUT, `ball-${MUSTER}-${FRAMES}x${GROESSE}`);
writeFileSync(`${basis}.png`, streifen);
await sharp(streifen).webp({ quality: 90 }).toFile(`${basis}.webp`);
await sharp(streifen).avif({ quality: 62 }).toFile(`${basis}.avif`);

// Einzelbilder zur Sichtprüfung – nicht für den Einsatz gedacht.
for (const i of [0, Math.floor(FRAMES / 4), Math.floor(FRAMES / 2)]) {
  writeFileSync(path.join(OUT, `ball-frame-${i}.svg`), frameSvg((i / FRAMES) * Math.PI * 2));
}

// ⚠️ Größen kommen aus dem DATEISYSTEM, nicht aus einer erneuten Kodierung
// (Befund Kai B5, 15.08.2026). Die erste Fassung maß mit
// `sharp(datei).toBuffer()` – das re-encodiert ohne Formatangabe mit sharps
// Standardqualität 80, während die Datei mit 90 geschrieben wurde. Gemeldet
// wurde also die Größe einer Datei, die es gar nicht gibt. Ausgerechnet ein
// Skript, dessen Zahlen anschließend als Begründung in Kommentare wandern.
const kb = (datei) => (statSync(datei).size / 1024).toFixed(1);

console.log(`Frames:   ${FRAMES} à ${GROESSE}px  (Muster: ${MUSTER})`);
console.log(`Streifen: ${basis}.png / .webp / .avif`);
console.log(`PNG:      ${kb(`${basis}.png`)} KB`);
console.log(`WebP:     ${kb(`${basis}.webp`)} KB`);
console.log(`AVIF:     ${kb(`${basis}.avif`)} KB`);
console.log(`Einzelbilder zur Sichtpruefung: ${OUT}/ball-frame-*.svg`);
console.log(
  `\nAusgeliefert wird derzeit: public/images/ball-basketball-32x200.{webp,avif}\n` +
    `Reproduzierbar mit:  node scripts/generate-ball-rotation.mjs --frames 32 --groesse 200 --muster basketball --out public/images\n` +
    `⚠️ Bei geaenderter Bildzahl MUESSEN mitgezogen werden: BALL_SPRITE_FRAMES in\n` +
    `   components/landing/HeroGlyphs.js UND beide Dateinamen in app/globals.css.\n` +
    `   tests/e2e/ball-sequenz.spec.mjs prueft genau diese Kopplung.`
);
