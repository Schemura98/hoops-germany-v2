// Einheitliche „Beispieldaten"-Kennzeichnung für Demo-Inhalte (Teams/Spieler/Ligen).
// Gleiches Muster wie das Kreisliga-Badge auf /ligen – überall verwenden, wo isDemo-Daten
// neben echten stehen, damit Besucher Demo nie für echt halten (Vertrauensschutz Testphase).
export default function DemoBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border border-ink-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist-300 ${className}`}
    >
      Beispieldaten
    </span>
  );
}
