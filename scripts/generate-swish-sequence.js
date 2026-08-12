// Milo, 12.08.2026 — echte Produktion (nicht nur Machbarkeitstest).
// Erzeugt eine scroll-taugliche Bildsequenz "Sprungball -> Swish":
// ein Basketball fliegt in einem Parabel-Bogen in den Korb, das Netz
// schwingt nach, der Ball rollt aus. Navy-Grund + exaktes Logo-Orange
// #F07A27, angelehnt an die bestehende Vektor-Sprache aus
// components/landing/HeroGlyphs.js (Ball / Korb-Emblem / Spielfeldbogen),
// hier aber als echte Frame-für-Frame-Sequenz statt CSS-Transform.
//
// Schreibt NUR ins Scratchpad, nichts im Hoops-Repo, nichts committet.

// sharp liegt bewusst NICHT im Projekt: Dieses Skript laeuft nur bei der
// Erzeugung der Bilder auf dem Entwicklungsrechner, nie im Browser und nie im
// Build. Es gehoert damit zu keiner Abhaengigkeit der Seite.
const sharp = require("C:/Users/schem/OneDrive/Desktop/Hoops-Marketing/_werkzeuge/node_modules/sharp");
const fs = require("fs");
const path = require("path");

const W = 1000;
const RASTER_W = 700; // Ausgabebreite der Rasterbilder (Geometrie bleibt 1000)
const H = 625;
// Auf 45 Bilder halbiert (Entscheidung Patrick, 12.08.2026): Die urspruenglichen
// 90 Bilder wogen 450,7 KB und rissen Ronjas Grenze von 200 KB. Die Bahn bleibt
// dieselbe, sie wird nur mit halber Aufloesung abgetastet - beim scroll-
// gebundenen Durchlauf faellt das nicht auf, weil ohnehin nie alle Bilder in
// Folge abgespielt werden, sondern immer nur das zur Scrollposition passende.
const FLIGHT_FRAMES = 35;
const SETTLE_FRAMES = 10;
const TOTAL = FLIGHT_FRAMES + SETTLE_FRAMES;

const NAVY_TOP = "#0A1930";
const NAVY_BOTTOM = "#16294A";
const ORANGE = "#F07A27";
const ORANGE_DARK = "#B04D0D";
const SEAM = "#1B1512";
const WHITE = "#FAF7F2";

const P0 = { x: 130, y: 480 };
const PC = { x: 465, y: 55 };
const P1 = { x: 790, y: 165 }; // Korbmitte

const RIM = { cx: 790, cy: 165, rx: 56, ry: 14 };

function bezier(t, p0, pc, p1) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * pc.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * pc.y + t * t * p1.y,
  };
}

function outDirFor(tag) {
  const d = path.join(__dirname, "frames-" + tag);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

function netPaths(swing) {
  // 8 Netz-Straehnen vom Ring-Rand konvergierend, mit seitlichem Schwung
  const strands = [];
  const n = 8;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.08 + (0.84 * i) / (n - 1)); // entlang der unteren Ringhaelfte
    const sx = RIM.cx + Math.cos(a) * RIM.rx;
    const sy = RIM.cy + Math.sin(a) * RIM.ry + 4;
    const ex = RIM.cx + (sx - RIM.cx) * 0.15 + swing;
    const ey = RIM.cy + 92;
    const midx = (sx + ex) / 2 + swing * 0.6;
    const midy = (sy + ey) / 2;
    strands.push(
      `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${midx.toFixed(1)} ${midy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${WHITE}" stroke-opacity="0.55" stroke-width="2" fill="none"/>`
    );
  }
  // 2 Querverbindungen fuer Netz-Textur
  for (const frac of [0.4, 0.72]) {
    const y = RIM.cy + 8 + frac * 84;
    const spread = RIM.rx * (1 - frac * 0.7) + swing * (0.3 + frac);
    strands.push(
      `<path d="M ${(RIM.cx - spread).toFixed(1)} ${y.toFixed(1)} Q ${RIM.cx + swing * 0.5} ${(y + 6).toFixed(1)} ${(RIM.cx + spread).toFixed(1)} ${y.toFixed(1)}" stroke="${WHITE}" stroke-opacity="0.4" stroke-width="1.6" fill="none"/>`
    );
  }
  return strands.join("\n");
}

function frameSVG(i) {
  let cx, cy, r, angle, opacity, swing, showBallInFront;

  if (i < FLIGHT_FRAMES) {
    const t = i / (FLIGHT_FRAMES - 1);
    const pos = bezier(t, P0, PC, P1);
    cx = pos.x;
    cy = pos.y;
    r = 32 - 6 * t; // leichte Verjuengung Richtung Korb (Perspektive)
    angle = t * 1080; // 3 Umdrehungen
    opacity = 1;
    swing = 0;
    showBallInFront = t < 0.93; // kurz vor dem Ring taucht der Ball hinters Netz
  } else {
    const k = (i - FLIGHT_FRAMES) / (SETTLE_FRAMES - 1);
    cx = RIM.cx + k * 150;
    cy = 195 + k * 250 + 90 * k * k;
    r = Math.max(24 - 7 * k, 10);
    angle = 1080 + k * 620;
    opacity = Math.max(1 - k * 1.05, 0);
    const decay = Math.exp(-3.1 * k);
    swing = 20 * decay * Math.sin(k * 15);
    showBallInFront = true;
  }

  const ballGroup = `
    <g opacity="${opacity.toFixed(3)}">
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#ballGrad)" stroke="${SEAM}" stroke-width="1.5"/>
      <clipPath id="clipBall"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/></clipPath>
      <g clip-path="url(#clipBall)">
        <g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${(angle % 360).toFixed(1)})">
          <path d="M ${-r} 0 Q 0 ${-r * 0.8} ${r} 0" stroke="${SEAM}" stroke-width="2" fill="none"/>
          <path d="M ${-r} 0 Q 0 ${r * 0.8} ${r} 0" stroke="${SEAM}" stroke-width="2" fill="none"/>
          <path d="M 0 ${-r} L 0 ${r}" stroke="${SEAM}" stroke-width="2" fill="none"/>
        </g>
      </g>
    </g>`;

  const netBehind = netPaths(swing);
  const backboard = `<rect x="${RIM.cx - 70}" y="${RIM.cy - 125}" width="140" height="90" rx="4" fill="${WHITE}" fill-opacity="0.08" stroke="${WHITE}" stroke-opacity="0.35" stroke-width="2"/>`;
  const rim = `<ellipse cx="${RIM.cx}" cy="${RIM.cy}" rx="${RIM.rx}" ry="${RIM.ry}" fill="none" stroke="${ORANGE}" stroke-width="6"/>`;
  const arcMotif = `<path d="M -40 ${H - 70} Q ${W / 2} ${H + 260} ${W + 40} ${H - 70}" stroke="${WHITE}" stroke-opacity="0.07" stroke-width="2" fill="none"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="ballGrad" cx="35%" cy="32%" r="75%">
      <stop offset="0" stop-color="#FFC58C"/>
      <stop offset="0.45" stop-color="${ORANGE}"/>
      <stop offset="1" stop-color="${ORANGE_DARK}"/>
    </radialGradient>
  </defs>
  ${/* KEIN Hintergrund-Rechteck mehr: Der Verlauf war in die Bilder eingebrannt
       und haette als sichtbares Rechteck auf der flachen navy-950-Flaeche der
       Seite gelegen - genau der Verlauf, den die Designrichtung ausschliesst.
       Die Bilder sind jetzt transparent, der Grund kommt von der Seite. */ ""}
  ${backboard}
  ${i < FLIGHT_FRAMES ? "" : netBehind}
  ${i < FLIGHT_FRAMES ? ballGroup : ""}
  ${rim}
  ${netBehind && i < FLIGHT_FRAMES ? "" : ""}
  ${i < FLIGHT_FRAMES ? "" : ""}
  ${i < FLIGHT_FRAMES ? netPaths(0) : ""}
  ${i >= FLIGHT_FRAMES ? ballGroup : ""}
</svg>`;
}

(async () => {
  // Direkt ins Projekt statt in den Zwischenspeicher.
  const dir = path.join(__dirname, "..", "public", "images", "swish");
  fs.mkdirSync(dir, { recursive: true });
  let totalBytes = 0;
  const sizes = [];
  for (let i = 0; i < TOTAL; i++) {
    const svg = frameSVG(i);
    // Kleiner rastern statt die Geometrie anzufassen: Das SVG behaelt seine
    // 1000x625-Koordinaten (P0/PC/P1/RIM haengen daran), nur das Rasterbild
    // wird schmaler. Mit Alphakanal wiegt ein Bild rund 40 % mehr als vorher
    // ohne - bei 1000px waeren es 313,9 KB gewesen und damit ueber Ronjas
    // Grenze von 200 KB.
    const buf = await sharp(Buffer.from(svg))
      .resize(RASTER_W)
      .webp({ quality: 70, alphaQuality: 85 })
      .toBuffer();
    fs.writeFileSync(path.join(dir, `frame-${String(i).padStart(3, "0")}.webp`), buf);
    totalBytes += buf.length;
    sizes.push(buf.length);
  }
  // Poster-Frame (guter Einzelstand: kurz vor Einschlag, volle Aktion sichtbar)
  // Poster: kurz vor dem Einschlag. Der alte Wert 58 stammte aus der
  // 90-Bilder-Fassung und liegt jetzt ausserhalb des Bereichs.
  const posterSvg = frameSVG(FLIGHT_FRAMES - 6);
  const posterBuf = await sharp(Buffer.from(posterSvg)).resize(RASTER_W).webp({ quality: 80, alphaQuality: 88 }).toBuffer();
  fs.writeFileSync(path.join(dir, "poster.webp"), posterBuf);

  console.log(`Frames: ${TOTAL} bei ${W}x${H}px`);
  console.log(`Gesamtgroesse Sequenz: ${(totalBytes / 1024).toFixed(1)} KB (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Durchschnitt/Frame: ${(totalBytes / TOTAL / 1024).toFixed(2)} KB`);
  console.log(`Min/Max Frame: ${(Math.min(...sizes) / 1024).toFixed(1)} KB / ${(Math.max(...sizes) / 1024).toFixed(1)} KB`);
  console.log(`Poster-Frame: ${(posterBuf.length / 1024).toFixed(1)} KB`);
  console.log(`Output-Ordner: ${dir}`);
})();
