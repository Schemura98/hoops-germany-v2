import Link from "next/link";
import { PiCaretLeftBold } from "react-icons/pi";

// Wiederkehrender Seitenkopf für öffentliche Listen- und Detailseiten.
// Flache navy-900-Fläche, darunter die 2px-Markenleiste: die „Anzeigetafel"-
// Kante, die auf jeder Seite an genau dieser Stelle wiederkehrt und dem Kopf
// seine Verankerung gibt (früher machte das ein Navy-Verlauf).
//
// `back` (optional, { href, label }) setzt den Rückweg zur übergeordneten
// Liste über die Überschrift – Detailseiten wie /ligen/[id] hatten bisher gar
// keinen, außer der Zurück-Taste des Browsers.
export default function PageHeader({ eyebrow, title, subtitle, back, children }) {
  return (
    <div className="bg-navy-900 border-b-2 border-brand-500 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-mist-400 hover:text-brand-300 transition-colors duration-150"
          >
            <PiCaretLeftBold className="text-xs" />
            {back.label}
          </Link>
        )}
        {eyebrow && (
          <p className="font-display text-brand-400 text-sm font-bold uppercase tracking-[0.2em] mb-1">
            {eyebrow}
          </p>
        )}
        {/* ⚠️ `hyphens-auto` + `break-words` neu am 18.08.2026.
            Gefunden vom neuen Test `kein-abgeschnittener-text.spec.mjs`:
            „DATENSCHUTZERKLÄRUNG" quoll auf 360 px um 6 px über den Rand –
            ein einzelnes langes Wort, das in keiner Zeilenbreite Platz findet.
            Es scrollte nichts und es sah nicht kaputt aus; das letzte Zeichen
            war schlicht weg.
            `hyphens-auto` trennt nach deutschen Regeln (die Sprache steht in
            `app/layout.js` am `<html lang="de">`, sonst wirkt es nicht),
            `break-words` ist das Sicherheitsnetz für Wörter ohne gültige
            Trennstelle. Beides ändert an kürzeren Überschriften nichts. */}
          <h1 className="font-display text-paper-50 font-black uppercase tracking-tight text-4xl sm:text-6xl leading-[0.95] text-balance hyphens-auto break-words">
          {title}
        </h1>
        {subtitle && <p className="text-mist-400 text-sm mt-3 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
