// Einheitliche „Beispieldaten"-Kennzeichnung für Demo-Inhalte (Teams/Spieler/Ligen).
// Gleiches Muster wie das Kreisliga-Badge auf /ligen – überall verwenden, wo isDemo-Daten
// neben echten stehen, damit Besucher Demo nie für echt halten (Vertrauensschutz Testphase).
export default function DemoBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 rounded-full px-2 py-0.5 ${className}`}
    >
      Beispieldaten
    </span>
  );
}
