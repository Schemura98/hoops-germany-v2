// Prueft, welche Schriften in einem PDF eingebettet sind - und ob eine
// Fremdschrift hineingerutscht ist. Friedas Befund war Consolas, weil das
// Pfeilzeichen im Geist-Mono-Subset fehlte; nur fs + zlib, kein externes Tool.
import fs from "node:fs";
import zlib from "node:zlib";

const dateien = process.argv.slice(2);
for (const datei of dateien) {
  const buf = fs.readFileSync(datei);
  let text = buf.toString("latin1");
  // Komprimierte Objektstroeme mit auspacken
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length;
    const end = text.indexOf("endstream", start);
    if (end < 0) continue;
    try {
      text += "\n" + zlib.inflateSync(buf.subarray(start, end)).toString("latin1");
    } catch {
      /* unkomprimiert oder anderes Filter - egal */
    }
  }
  const namen = [...new Set([...text.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+#\-_,.]+)/g)].map((x) => x[1]))];
  const fremd = namen.filter((n) => /consolas|arial|times|courier|helvetica|segoe/i.test(n));
  console.log(`\n${datei.split(/[\/]/).pop()}`);
  console.log("  Schriften:", namen.length ? namen.join(", ") : "(keine /BaseFont gefunden – evtl. Type3)");
  console.log("  Fremdschrift:", fremd.length ? "⚠ " + fremd.join(", ") : "keine");
}
