import fs from "node:fs";
const files = process.argv.slice(2);
for (const f of files) {
  const buf = fs.readFileSync(f);
  const text = buf.toString("latin1");
  const matches = [...text.matchAll(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/g)];
  const uniq = [...new Set(matches.map(m => m[0]))];
  console.log(f.split(/[\/]/).pop());
  for (const u of uniq) {
    const m = u.match(/([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    const [x0,y0,x1,y1] = m.slice(1).map(Number);
    const wPt = x1-x0, hPt = y1-y0;
    const wMm = wPt/72*25.4, hMm = hPt/72*25.4;
    console.log(`  ${u}  ->  ${wMm.toFixed(2)} x ${hMm.toFixed(2)} mm`);
  }
}
