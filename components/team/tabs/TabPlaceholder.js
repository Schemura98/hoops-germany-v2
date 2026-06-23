// Einheitliche Platzhalter-Darstellung für noch nicht ausgebaute Panel-Tabs.
export default function TabPlaceholder({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>
      <span className="mt-4 inline-block text-xs font-medium text-brand-600 bg-brand-50 rounded-full px-3 py-1">
        Wird als Nächstes implementiert
      </span>
    </div>
  );
}
