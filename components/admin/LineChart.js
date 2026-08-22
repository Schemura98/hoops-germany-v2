"use client";

// Leichtgewichtiger SVG-Linienchart (kein Extra-Paket).
// props: data [{date, views, visitors, signups?}], height, mitRegistrierungen
// Zeichnet zwei Linien: Aufrufe (Orange) + Besucher (Slate) mit Flächenverlauf für Aufrufe.
//
// ⚠️ `mitRegistrierungen` ist BEWUSST abschaltbar und standardmäßig aus:
// Die Sponsor-Vorschau im Admin muss exakt dasselbe zeigen wie der geteilte
// Sponsor-Link (Befund H2 vom 19.08.2026 — Vorschau und Link zeigten zwei
// verschiedene Blätter, und geprüft wurde in der Vorschau). Die
// Registrierungs-Linie gibt es deshalb NUR im internen Reiter.
export default function LineChart({ data = [], height = 200, mitRegistrierungen = false }) {
  const W = 800;
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 22;

  if (!data.length) {
    return <p className="text-sm text-mist-400">Noch keine Daten im Zeitraum.</p>;
  }

  const max = Math.max(1, ...data.map((d) => Math.max(d.views || 0, d.visitors || 0)));
  const n = data.length;
  const x = (i) => padL + (n === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (n - 1));
  const y = (v) => padT + (H - padT - padB) * (1 - (v || 0) / max);

  const line = (key) => data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");
  const area =
    `M ${x(0).toFixed(1)} ${y(data[0].views).toFixed(1)} ` +
    data.map((d, i) => `L ${x(i).toFixed(1)} ${y(d.views).toFixed(1)}`).join(" ") +
    ` L ${x(n - 1).toFixed(1)} ${(H - padB).toFixed(1)} L ${x(0).toFixed(1)} ${(H - padB).toFixed(1)} Z`;

  // Registrierungen sind um Größenordnungen seltener als Aufrufe — auf der
  // Aufrufe-Skala wäre die Linie ein Strich auf der Nulllinie. Eigene Skala,
  // in der Legende ausgewiesen.
  // ⚠️ Dieser Block MUSS nach `x` stehen: Er benutzt es, und `const` kennt
  // keinen Vorgriff — beim ersten Anlauf stand er direkt hinter `max`, und
  // die ganze Seite starb an „Cannot access before initialization".
  const maxRegs = Math.max(1, ...data.map((d) => d.signups || 0));
  const yRegs = (v) => padT + (H - padT - padB) * (1 - (v || 0) / maxRegs);
  const lineRegs = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${yRegs(d.signups).toFixed(1)}`)
    .join(" ");

  // X-Achsen-Beschriftung: erste, mittlere, letzte
  const labelIdx = [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i);
  const fmtDate = (s) => {
    const [, m, d] = s.split("-");
    return `${d}.${m}.`;
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        {/* Horizontale Hilfslinien */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padL}
            x2={W - padR}
            y1={padT + (H - padT - padB) * f}
            y2={padT + (H - padT - padB) * f}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="#f97316" fillOpacity="0.08" />
        <path d={line("views")} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={line("visitors")} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
        {mitRegistrierungen && (
          <path d={lineRegs} fill="none" stroke="#6B9A5B" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {labelIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 6} fontSize="11" fill="#94a3b8" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
            {fmtDate(data[i].date)}
          </text>
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs text-mist-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-brand-500" /> Seitenaufrufe
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-navy-600" style={{ borderTop: "2px dashed #475569" }} /> Besucher
        </span>
        {mitRegistrierungen && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ background: "#6B9A5B" }} /> Registrierungen (eigene Skala, max {maxRegs})
          </span>
        )}
        <span className="ml-auto text-mist-400">max {max}</span>
      </div>
    </div>
  );
}
