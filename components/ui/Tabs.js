"use client";

// Einheitlicher Tab-Umschalter für die ganze Plattform.
// tabs: [{ key, label, count? }], value, onChange.
//
// Anzeigetafel-Logik: Der aktive Tab wird nicht durch eine weiße Pille markiert,
// sondern durch die 2px-Brand-Leiste darunter – dasselbe Signal wie am aktiven
// Navigationspunkt. Ein Umschalter ist eine Anzeige, keine schwebende Karte.
export default function Tabs({ tabs = [], value, onChange, className = "", fluid = false }) {
  return (
    <div
      // overflow-x-auto: Die Tab-Beschriftungen sind whitespace-nowrap. Ein
      // bloßes max-w-full kappte nur das WACHSEN des Rahmens, nicht das
      // ÜBERLAUFEN seiner Kinder – auf 360 px erzwang die Leiste der
      // Team-Detailseite so 380 px Seitenbreite (Befund 23.08.2026, von zwei
      // Prüfern unabhängig gemessen). Der Scroll-Rahmen gehört in die
      // KOMPONENTE, nicht an die Aufrufstelle – sonst stellt sich die Falle
      // beim nächsten Einsatz erneut (dieselbe Lehre wie ConfirmAction B1).
      className={`overflow-x-auto ${className}`}
    >
      <div className={`${fluid ? "flex w-full" : "inline-flex"} gap-1 border-b border-navy-600`}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`${fluid ? "flex-1" : ""} -mb-px border-b-2 px-3 sm:px-4 py-2 text-sm font-semibold tracking-tight transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 whitespace-nowrap ${
              value === t.key
                ? "border-brand-500 text-paper-50"
                : "border-transparent text-mist-400 hover:text-paper-50 hover:border-navy-500"
            }`}
          >
            {t.label}
            {t.count != null ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
