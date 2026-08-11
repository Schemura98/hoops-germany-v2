"use client";

// Einheitlicher Pill-Tab-Umschalter für die ganze Plattform.
// tabs: [{ key, label, count? }], value, onChange.
export default function Tabs({ tabs = [], value, onChange, className = "", fluid = false }) {
  return (
    <div
      // max-w-full: Bei langen Beschriftungen (z.B. Transfermarkt auf 375px)
      // ragte der Pill-Umschalter sonst um wenige Pixel über den Rand hinaus
      // und erzeugte waagerechtes Scrollen auf der ganzen Seite.
      className={`inline-flex max-w-full gap-1 bg-gray-100 rounded-xl p-1 ${
        fluid ? "w-full" : ""
      } ${className}`}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`${fluid ? "flex-1" : ""} px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 whitespace-nowrap ${
            value === t.key
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {t.label}
          {t.count != null ? ` (${t.count})` : ""}
        </button>
      ))}
    </div>
  );
}
