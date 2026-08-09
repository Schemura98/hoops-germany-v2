import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const nf = (n) => (n ?? 0).toLocaleString("de-DE");

// KPI-Karte mit optionalem Wachstums-Indikator (grün/rot) und Zusatzzeile.
// props: label, value, growth (Zahl in % | null), hint, icon, sub
export default function StatCard({ label, value, growth = null, hint, icon: Icon, sub }) {
  const hasGrowth = growth !== null && growth !== undefined;
  const up = (growth ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        {Icon && <Icon className="text-brand-400 text-sm" />}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {typeof value === "number" ? nf(value) : value}
      </p>
      <div className="mt-1 flex items-center gap-2 flex-wrap">
        {hasGrowth && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              up ? "text-green-600" : "text-red-600"
            }`}
          >
            {up ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
            {up ? "+" : ""}
            {growth}%
          </span>
        )}
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-gray-500 leading-tight">{hint}</p>}
    </div>
  );
}
