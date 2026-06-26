"use client";

// Einheitlicher Pill-Tab-Umschalter für die ganze Plattform.
// tabs: [{ key, label, count? }], value, onChange.
export default function Tabs({ tabs = [], value, onChange, className = "", fluid = false }) {
  return (
    <div
      className={`inline-flex gap-1 bg-gray-100 rounded-xl p-1 ${fluid ? "w-full" : ""} ${className}`}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`${fluid ? "flex-1" : ""} px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
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
