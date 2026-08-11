// Einheitliche Platzhalter-Darstellung für noch nicht ausgebaute Panel-Tabs.
export default function TabPlaceholder({ title, description }) {
  return (
    <div className="rounded-md border border-dashed border-navy-600 bg-navy-800 p-10 text-center">
      <h2 className="text-lg font-semibold text-paper-50">{title}</h2>
      <p className="mt-2 text-sm text-mist-400 max-w-md mx-auto">{description}</p>
      <span className="mt-4 inline-block text-xs font-medium text-brand-400 bg-brand-500/10 rounded-sm px-3 py-1">
        Wird als Nächstes implementiert
      </span>
    </div>
  );
}
