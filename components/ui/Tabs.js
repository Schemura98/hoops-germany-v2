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
      // max-w-full: Bei langen Beschriftungen (z.B. Transfermarkt auf 375px)
      // ragte der Umschalter sonst um wenige Pixel über den Rand hinaus
      // und erzeugte waagerechtes Scrollen auf der ganzen Seite.
      className={`inline-flex max-w-full gap-1 border-b border-ink-600 ${
        fluid ? "w-full" : ""
      } ${className}`}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`${fluid ? "flex-1" : ""} -mb-px border-b-2 px-3 sm:px-4 py-2 text-sm font-semibold tracking-tight transition-[color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 whitespace-nowrap ${
            value === t.key
              ? "border-brand-500 text-paper-50"
              : "border-transparent text-mist-400 hover:text-paper-50 hover:border-ink-500"
          }`}
        >
          {t.label}
          {t.count != null ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}
