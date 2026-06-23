// Wiederkehrender Navy-Gradient-Seitenkopf (Banner) für öffentliche Listen-
// und Detailseiten. Eyebrow (orange), Titel, optionaler Untertitel + Inhalt.
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {eyebrow && (
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-widest mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-white font-extrabold text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-2">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
