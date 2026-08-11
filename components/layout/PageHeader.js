// Wiederkehrender Seitenkopf für öffentliche Listen- und Detailseiten.
// Flache ink-900-Fläche, darunter die 2px-Markenleiste: die „Anzeigetafel"-
// Kante, die auf jeder Seite an genau dieser Stelle wiederkehrt und dem Kopf
// seine Verankerung gibt (früher machte das ein Navy-Verlauf).
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="bg-ink-900 border-b-2 border-brand-500 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {eyebrow && (
          <p className="font-display text-brand-400 text-sm font-bold uppercase tracking-[0.2em] mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-paper-50 font-black uppercase tracking-tight text-4xl sm:text-6xl leading-[0.95] text-balance">
          {title}
        </h1>
        {subtitle && <p className="text-mist-400 text-sm mt-3 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
